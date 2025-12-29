export enum ResumeTone {
  IMPACT_DRIVEN = 'Impact Driven (Action-oriented, metrics-heavy)',
  RESEARCH_BASED = 'Research Based (Detail-oriented, academic, methodology-focused)',
  CREATIVE = 'Creative (Story-focused, visionary)',
  CONCISE = 'Concise (Direct, minimalist)'
}

export interface UsageStats {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
}

export interface AtsAnalysis {
  matchScore: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  technicalSkillsMatched: string[];
  softSkillsMatched: string[];
  recommendations: string[];
}

export interface AnalysisResult {
  matchScore: number;
  allRequiredSkills: string[];
  allPreferredSkills: string[];
  allTechnicalSkills: string[];
  allSoftSkills: string[];
  requiredMatched: string[];
  niceToHaveMatched: string[];
  requiredMissing: string[];
  niceToHaveMissing: string[];
  technicalSkillsMatched: string[];
  technicalSkillsMissing: string[];
  softSkillsMatched: string[];
  softSkillsMissing: string[];
  excludedSkills: string[];
  companyResearch: string;
  resourceSummary?: string;
  gapAnalysis: string;
  recommendations: string[];
  modelTemperature: number;
  sources: { title: string; url: string }[];
  usage?: UsageStats;
}

export interface TailoringRequest {
  masterResume: string;
  sampleResumeTemplate: string;
  projects: string;
  coverLetter: string;
  includeCoverLetter: boolean;
  coverLetterLanguage?: string;
  negativeConstraints: string;
  strategicInstructions: string;
  githubUrls: string[];
  jobDescription: string;
  companyUrl: string;
  targetRole: string;
  tone: ResumeTone;
  model: string;
}

export interface TailoringResult {
  markdown: string;
  coverLetterText?: string;
  sources: { title: string; url: string }[];
  atsAnalysis: AtsAnalysis;
  usage?: UsageStats;
}