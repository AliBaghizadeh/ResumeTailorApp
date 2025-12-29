<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🖋️ ResumeTailor AI
### *The Strategic Engineer's Guide to Automated Resume Optimization*

![Engine: Gemini 3 Pro](https://img.shields.io/badge/Engine-Gemini%203%20Pro-indigo?style=for-the-badge)
![Security: BYOK Model](https://img.shields.io/badge/Security-Private%20GCP%20Linking-emerald?style=for-the-badge)

ResumeTailor AI is not a simple "rewriter." It is a **Strategic Optimization Suite** that uses Gemini 3 Pro to perform real-time company research and ground your professional experience in the specific "DNA" of a target role.

---

## 🛠 Prerequisites

This app uses a **Bring Your Own Key (BYOK)** model. To use it, you need:
1. **A Google Cloud Project** with the [Generative AI API](https://console.cloud.google.com/apis/library/generativeai.googleapis.com) enabled.
2. **Billing Enabled** (Gemini 3 Pro requires a paid tier project, though usage for individual resumes is typically pennies).
3. **The Link**: When you open the app, click **"Link My Project"** to connect your secure environment.

---

## 🏁 Step-by-Step Workflow

### Phase 1: The Input Engine
The quality of your tailored resume depends entirely on the "Source of Truth" you provide.
1. **Master Resume**: Paste your longest, most comprehensive resume. Don't worry about length; the AI uses this as its primary database.
2. **Formatting Blueprint**: Paste a sample resume or a specific layout you like. The AI will mirror the hierarchy, font-weighting (via Markdown), and section ordering of this blueprint.
3. **Detailed Projects**: **CRITICAL.** Paste raw technical notes, bullet points, or READMEs from your projects. The more "raw data" you provide here, the better the AI can find matches for the job description.
4. **Strategic Guidance**: Tell the AI your "vibe." (e.g., *"Focus on my leadership in Kubernetes even though I was a junior"* or *"Highlight my transition from Java to Go"*).

### Phase 2: Strategic Review
After the AI researches the company and the role:
- **Audit Keywords**: Remove any skills the AI "hallucinated" or that you don't want to emphasize. Add skills you forgot to include in your master resume.
- **Edit Recommendations**: The AI proposes 5 strategic "moves." You can rewrite these manually if you want the AI to take a different tactical approach.
- **Cover Letter**: Select your target language and provide any specific "hook" you want in the first paragraph.

### Phase 3: Export & Metrics
- **ATS Match Score**: Review your estimated match percentage.
- **Download**: Export as a professional `.docx` or copy the raw Markdown for your portfolio.

---

## 💡 How to Help the AI (Pro Tips)

To get 99th-percentile results, follow these prompting strategies within the app:

### 1. The "Quantification Mandate"
In the **Detailed Projects** section, always include numbers. 
*   *Bad:* "Improved database performance."
*   *Good:* "Reduced query latency by 40% (from 200ms to 120ms) by implementing Redis caching."
The AI will prioritize these "Impact Clusters" during the tailoring phase.

### 2. Steering the AI via "Strategic Guidance"
Use the **Strategic Guidance** box as a steering wheel.
*   **Targeting a Startup?** *"Use a high-energy, high-ownership tone. Focus on my ability to build from 0 to 1."*
*   **Targeting FAANG?** *"Use precise, metrics-heavy language. Emphasize scale and cross-functional collaboration."*

### 3. Use the Blueprint for Layout
If the target company has a specific resume style (e.g., the "Google Resume"), find a template online, copy the text, and paste it into the **Formatting Blueprint**. The AI will automatically adopt that structure.

---

## 🔒 Privacy & Data Sovereignty

- **No Server Storage**: Your resume, projects, and keys are never stored on our servers. 
- **Direct Connection**: The app creates a direct encrypted tunnel between your browser and your Google Cloud Project.
- **Session Based**: Once you close the tab, all input data is cleared from the browser's memory.

---

## 🧪 Technical Implementation

- **Framework**: React 19 + TypeScript.
- **LLM**: Gemini 3 Pro (via `@google/genai`).
- **Grounding**: Google Search (used for company research phase).
- **Styling**: Tailwind CSS + Swiss-Modern Design Principles.

---

**Built for the ambitious. Tailored for the win.**  
*Disclaimer: This tool is an assistant. Always perform a final human review of your documents before submitting.*
