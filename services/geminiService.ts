import { GoogleGenAI, Type } from "@google/genai";
import { TailoringRequest, TailoringResult, AnalysisResult, UsageStats } from "../types";

/**
 * Helper to estimate tokens if the API metadata is unavailable (approx 4 chars/token)
 */
const estimateTokens = (text: string): number => Math.ceil((text || "").length / 4);

/**
 * Robustly extract JSON from a potentially markdown-wrapped string
 */
const extractJson = (text: string) => {
  try {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonStr = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonStr);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    return null;
  }
};

/**
 * PROMPT TEMPLATE: PHASE 1 - STRATEGIC ANALYSIS
 */
const getAnalysisPrompt = (request: TailoringRequest) => `
### PHASE 1: ROLE DNA EXTRACTION & STRATEGIC GAP ANALYSIS
You are an expert hiring manager and ATS optimization specialist. Analyze the role of "${request.targetRole}" at ${request.companyUrl}.

### INPUT DATA
- Job Description: ${request.jobDescription}
- Master Resume: ${request.masterResume}
- Detailed Projects: ${request.projects}
- USER'S RESOURCE LINKS: ${request.githubUrls.join(', ')}
- USER'S STRATEGIC GUIDANCE: ${request.strategicInstructions || 'Maximize ATS match score while maintaining authenticity.'}

### CRITICAL GROUNDING RULES
You are STRICTLY FORBIDDEN from inventing, inferring, or exaggerating any information. Use provided projects and resume data ONLY.

### TASK
Execute the following steps in order:
1. **JD EXTRACTION**: Identify mandatory vs preferred skills.
2. **COMPANY RESEARCH**: Use Google Search to understand their tech stack and cultural values.
3. **MATCHING ENGINE**: Find where the user's background aligns with the JD.
4. **GAP ANALYSIS**: Define what is missing or needs reframing.
5. **STRATEGIC RECOMMENDATIONS**: Create exactly 5 specific tailoring moves.

### OUTPUT REQUIREMENTS
Return valid JSON only.
`;

/**
 * PROMPT TEMPLATE: PHASE 2 - FINAL GENERATION
 */
const getGenerationPrompt = (request: TailoringRequest, analysis: AnalysisResult, confirmedRecommendations: string[]) => `
### PHASE 2: RESUME GENERATION
Generate a complete ATS-optimized resume for: ${request.targetRole}

### MANDATORY STRUCTURE & STYLE
1. **PROFESSIONAL SUMMARY**: Write 4-5 impact-driven sentences.
2. **CORE COMPETENCIES**: Skills + Brief evidence.
3. **QUANTIFICATION MANDATE**: Every work bullet must include a metric (%, $, time).
4. **WORK EXPERIENCE**: Reflect the structure of the style blueprint provided.

### CONFIRMED TAILORING STRATEGY
${confirmedRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

### DATA SOURCES
- Master Resume & Projects: ${request.projects} ${request.masterResume}
- Style Blueprint: ${request.sampleResumeTemplate}
- Negative Constraints (Things to EXCLUDE): ${request.negativeConstraints || 'None'}
`;

export const analyzeKeywords = async (request: TailoringRequest): Promise<AnalysisResult> => {
  // Always fetch a fresh instance right before the call to ensure we use the linked project's key
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing. No project connected.");

  const ai = new GoogleGenAI({ apiKey });
  const temperature = 0.1; 
  const prompt = getAnalysisPrompt(request);
  
  const response = await ai.models.generateContent({
    model: request.model || "gemini-3-pro-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: temperature,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          companyResearch: { type: Type.STRING },
          resourceSummary: { type: Type.STRING },
          matchScore: { type: Type.INTEGER },
          allRequiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          allPreferredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          allTechnicalSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          allSoftSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          requiredMatched: { type: Type.ARRAY, items: { type: Type.STRING } },
          niceToHaveMatched: { type: Type.ARRAY, items: { type: Type.STRING } },
          requiredMissing: { type: Type.ARRAY, items: { type: Type.STRING } },
          niceToHaveMissing: { type: Type.ARRAY, items: { type: Type.STRING } },
          technicalSkillsMatched: { type: Type.ARRAY, items: { type: Type.STRING } },
          technicalSkillsMissing: { type: Type.ARRAY, items: { type: Type.STRING } },
          softSkillsMatched: { type: Type.ARRAY, items: { type: Type.STRING } },
          softSkillsMissing: { type: Type.ARRAY, items: { type: Type.STRING } },
          excludedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          gapAnalysis: { type: Type.STRING },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: [
          "companyResearch", "matchScore", "allRequiredSkills", "allPreferredSkills", 
          "allSoftSkills", "requiredMatched", "niceToHaveMatched", "technicalSkillsMatched",
          "requiredMissing", "niceToHaveMissing", "softSkillsMatched", "softSkillsMissing",
          "technicalSkillsMissing", "excludedSkills", "gapAnalysis", "recommendations"
        ],
      },
    },
  });

  const rawText = response.text || "{}";
  const parsed = extractJson(rawText) || {};
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = chunks.filter((c: any) => c.web).map((c: any) => ({ title: c.web.title, url: c.web.uri }));

  const usage: UsageStats = {
    promptTokens: response.usageMetadata?.promptTokenCount || estimateTokens(prompt),
    candidatesTokens: response.usageMetadata?.candidatesTokenCount || estimateTokens(rawText),
    totalTokens: response.usageMetadata?.totalTokenCount || (estimateTokens(prompt) + estimateTokens(rawText))
  };

  return { ...parsed, modelTemperature: temperature, sources, usage };
};

export const generateTailoredResume = async (
  request: TailoringRequest, 
  analysis: AnalysisResult, 
  confirmedRecommendations: string[]
): Promise<TailoringResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing. No project connected.");

  const ai = new GoogleGenAI({ apiKey });
  
  // 1. Generate Resume
  const resumePrompt = getGenerationPrompt(request, analysis, confirmedRecommendations);
  const resumeResponse = await ai.models.generateContent({
    model: request.model || "gemini-3-pro-preview",
    contents: resumePrompt,
    config: { temperature: 0.1 }
  });

  // 2. Optional Cover Letter
  let coverLetterText = "";
  if (request.includeCoverLetter) {
    const clPrompt = `Generate a professional cover letter for the role of ${request.targetRole}. Tone: ${request.tone}. Address company interests found: ${analysis.companyResearch}.`;
    const clResponse = await ai.models.generateContent({
      model: request.model || "gemini-3-pro-preview",
      contents: clPrompt,
      config: { temperature: 0.5 }
    });
    coverLetterText = clResponse.text || "";
  }

  const usage: UsageStats = {
    promptTokens: (resumeResponse.usageMetadata?.promptTokenCount || 0),
    candidatesTokens: (resumeResponse.usageMetadata?.candidatesTokenCount || 0),
    totalTokens: (resumeResponse.usageMetadata?.totalTokenCount || 0)
  };

  return {
    markdown: resumeResponse.text || "",
    coverLetterText,
    sources: analysis.sources,
    atsAnalysis: {
      matchScore: analysis.matchScore,
      matchingKeywords: [...analysis.requiredMatched, ...analysis.niceToHaveMatched],
      missingKeywords: analysis.requiredMissing,
      technicalSkillsMatched: analysis.technicalSkillsMatched,
      softSkillsMatched: analysis.softSkillsMatched,
      recommendations: confirmedRecommendations
    },
    usage
  };
};