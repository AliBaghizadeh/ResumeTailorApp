import React, { useState, useEffect } from 'react';
import ResumeForm from './components/ResumeForm';
import ResumeOutput from './components/ResumeOutput';
import KeywordMapReview from './components/KeywordMapReview';
import { analyzeKeywords, generateTailoredResume } from './services/geminiService';
import { TailoringRequest, TailoringResult, AnalysisResult } from './types';

type WorkflowStep = 'gateway' | 'form' | 'analysis' | 'review' | 'generation' | 'result';

interface UserEdits {
  recommendations: string[];
  requiredMatched: string[];
  niceToHaveMatched: string[];
  softSkillsMatched: string[];
  technicalSkillsMatched: string[];
  manualExclusions: string;
  includeCoverLetter: boolean;
  coverLetterText: string;
  coverLetterLanguage: string;
}

const App: React.FC = () => {
  // Always start at gateway to ensure project selection is conscious
  const [step, setStep] = useState<WorkflowStep>('gateway');
  const [request, setRequest] = useState<TailoringRequest | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [userEdits, setUserEdits] = useState<UserEdits | null>(null);
  const [result, setResult] = useState<TailoringResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasConnected, setHasConnected] = useState<boolean>(false);

  // Check connection status silently on load
  useEffect(() => {
    const checkStatus = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          if (selected) {
            setHasConnected(true);
            // We don't auto-skip 'gateway' to ensure user sees the "Link" context 
            // but we could if we wanted a seamless return experience.
          }
        } catch (e) {
          console.debug("Initialization standby.");
        }
      }
    };
    checkStatus();
  }, []);

  const handleConnectProject = async () => {
    setError(null);
    if (window.aistudio?.openSelectKey) {
      try {
        // TRIGGERS NATIVE GOOGLE PROJECT SELECTOR
        // This is the "Insert API Key/Project" step.
        await window.aistudio.openSelectKey();
        
        // Protocol: Proceed immediately after triggering the dialog.
        setHasConnected(true);
        setStep('form');
      } catch (err) {
        setError("Connection dialog failed. Please check your browser's popup settings.");
      }
    } else {
      setError("This application requires the Gemini Project Selector. Please access via a supported environment.");
    }
  };

  const handleStartAnalysis = async (formData: TailoringRequest) => {
    setRequest(formData);
    setStep('analysis');
    setError(null);
    try {
      const data = await analyzeKeywords(formData);
      setAnalysis(data);
      setStep('review');
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("not found") || err.message?.includes("API_KEY") || err.message?.includes("404")) {
        setError("Your project connection has expired. Please re-link your project.");
        setHasConnected(false);
        setStep('gateway');
      } else {
        setError('Analysis failed. Ensure your Google Cloud Project has billing and Gemini API enabled.');
        setStep('form');
      }
    }
  };

  const handleConfirmGeneration = async (
    finalRecommendations: string[], 
    finalRequired: string[], 
    finalNice: string[],
    finalSoft: string[],
    finalTechnical: string[],
    manualExclusions: string,
    includeCoverLetter: boolean,
    coverLetterText: string,
    coverLetterLanguage: string
  ) => {
    if (!request || !analysis) return;
    
    setUserEdits({
      recommendations: finalRecommendations,
      requiredMatched: finalRequired,
      niceToHaveMatched: finalNice,
      softSkillsMatched: finalSoft,
      technicalSkillsMatched: finalTechnical,
      manualExclusions,
      includeCoverLetter,
      coverLetterText,
      coverLetterLanguage
    });

    setStep('generation');
    try {
      const data = await generateTailoredResume(
        { ...request, negativeConstraints: manualExclusions, includeCoverLetter, coverLetter: coverLetterText, coverLetterLanguage },
        { ...analysis, requiredMatched: finalRequired, niceToHaveMatched: finalNice, softSkillsMatched: finalSoft, technicalSkillsMatched: finalTechnical },
        finalRecommendations
      );
      setResult(data);
      setStep('result');
    } catch (err: any) {
      setError('Generation failed. Verify your project has credits for Gemini 3 Pro.');
      setStep('review');
    }
  };

  const renderActiveStep = () => {
    switch (step) {
      case 'gateway':
        return (
          <div className="flex flex-col items-center justify-center py-12 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 text-center space-y-10">
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-[2rem] mx-auto flex items-center justify-center text-white shadow-2xl shadow-indigo-100 transform rotate-6 hover:rotate-0 transition-all duration-500">
                <i className="fa-solid fa-key text-4xl"></i>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Access Secure Suite</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  To use **ResumeTailor AI**, you must securely link your own Google Cloud project. This provides the "fuel" (API credits) while keeping your data 100% private.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-shield-check text-xs"></i>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">Zero Retention</p>
                    <p className="text-[10px] text-slate-500">Your master resume stays within your private Cloud organization.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-coins text-xs"></i>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">Direct Billing</p>
                    <p className="text-[10px] text-slate-500">Pay Google directly for usage. No markup or subscription fees.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleConnectProject}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                >
                  Link My Project
                  <i className="fa-solid fa-chevron-right text-sm group-hover:translate-x-1 transition-transform"></i>
                </button>
                <div className="pt-2">
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
                  >
                    Setup Guide <i className="fa-solid fa-external-link ml-1"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      case 'form':
        return <ResumeForm onSubmit={handleStartAnalysis} isLoading={false} initialData={request || undefined} />;
      case 'analysis':
        return (
          <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-pulse">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-8 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Researching Company</h2>
              <p className="text-sm text-slate-500">Searching web for company values and tech stack...</p>
            </div>
          </div>
        );
      case 'review':
        return analysis ? (
          <KeywordMapReview 
            analysis={analysis}
            initialEdits={userEdits || undefined}
            onConfirm={handleConfirmGeneration} 
            onBack={() => setStep('form')}
            isLoading={false}
          />
        ) : null;
      case 'generation':
        return (
          <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-pulse">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-8 border-emerald-100 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Applying Strategy</h2>
              <p className="text-sm text-slate-500">Tailoring experience points for maximum impact...</p>
            </div>
          </div>
        );
      case 'result':
        return result ? <ResumeOutput result={result} onReset={() => setStep('form')} onBackToEdit={() => setStep('review')} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Inter']">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-2xl text-slate-900">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <i className="fa-solid fa-feather-pointed"></i>
            </div>
            <span>ResumeTailor <span className="text-indigo-600">AI</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            {hasConnected && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                Project Active
              </div>
            )}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-bold text-slate-500">
               <i className="fa-solid fa-server"></i> us-west1
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {renderActiveStep()}
      </main>

      <footer className="py-12 bg-white border-t border-slate-100 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2 text-center md:text-left">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Standalone Deployment • Host: us-west1</p>
             <p className="text-xs text-slate-400 max-w-xs leading-relaxed">Privacy optimized interface. All AI processing is performed via your linked Google Cloud project.</p>
          </div>
          <div className="flex items-center gap-8">
             <div className="text-center">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Architecture</p>
                <p className="text-xs font-bold text-slate-900">BYOK Gateway</p>
             </div>
             <div className="text-center">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Intelligence</p>
                <p className="text-xs font-bold text-slate-900">Gemini 3 Pro</p>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;