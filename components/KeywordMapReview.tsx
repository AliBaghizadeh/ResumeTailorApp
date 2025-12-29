import React, { useState } from 'react';
import { AnalysisResult } from '../types';

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

interface Props {
  analysis: AnalysisResult;
  initialEdits?: UserEdits;
  onConfirm: (
    finalRecommendations: string[], 
    finalRequired: string[], 
    finalNice: string[], 
    finalSoft: string[], 
    finalTechnical: string[],
    manualExclusions: string,
    includeCoverLetter: boolean,
    coverLetterText: string,
    coverLetterLanguage: string
  ) => void;
  onBack: () => void;
  isLoading: boolean;
}

const KeywordMapReview: React.FC<Props> = ({ analysis, initialEdits, onConfirm, onBack, isLoading }) => {
  // Initialize state from initialEdits (if returning from result page) or analysis defaults
  const [editedRecommendations, setEditedRecommendations] = useState<string[]>(initialEdits?.recommendations || analysis.recommendations);
  const [reqMatched, setReqMatched] = useState<string[]>(initialEdits?.requiredMatched || analysis.requiredMatched);
  const [niceMatched, setNiceMatched] = useState<string[]>(initialEdits?.niceToHaveMatched || analysis.niceToHaveMatched);
  const [softMatched, setSoftMatched] = useState<string[]>(initialEdits?.softSkillsMatched || analysis.softSkillsMatched);
  const [techMatched, setTechMatched] = useState<string[]>(initialEdits?.technicalSkillsMatched || analysis.technicalSkillsMatched);
  const [manualExclusions, setManualExclusions] = useState(initialEdits?.manualExclusions || '');

  const [includeCoverLetter, setIncludeCoverLetter] = useState(initialEdits?.includeCoverLetter ?? false);
  const [coverLetterText, setCoverLetterText] = useState(initialEdits?.coverLetterText || '');
  const [coverLetterLanguage, setCoverLetterLanguage] = useState(initialEdits?.coverLetterLanguage || 'English');

  const [newTech, setNewTech] = useState('');
  const [newSoft, setNewSoft] = useState('');
  const [newReq, setNewReq] = useState('');

  const handleRecChange = (index: number, val: string) => {
    const next = [...editedRecommendations];
    next[index] = val;
    setEditedRecommendations(next);
  };

  const excludeKeyword = (kw: string, category: 'req' | 'nice' | 'soft' | 'tech') => {
    if (category === 'req') setReqMatched(reqMatched.filter(k => k !== kw));
    if (category === 'nice') setNiceMatched(niceMatched.filter(k => k !== kw));
    if (category === 'soft') setSoftMatched(softMatched.filter(k => k !== kw));
    if (category === 'tech') setTechMatched(techMatched.filter(k => k !== kw));
  };

  const addManualKeyword = (category: 'tech' | 'soft' | 'req') => {
    if (category === 'tech' && newTech.trim()) {
      setTechMatched([...techMatched, newTech.trim()]);
      setNewTech('');
    } else if (category === 'soft' && newSoft.trim()) {
      setSoftMatched([...softMatched, newSoft.trim()]);
      setNewSoft('');
    } else if (category === 'req' && newReq.trim()) {
      setReqMatched([...reqMatched, newReq.trim()]);
      setNewReq('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-20">
      
      {/* SECTION -1: RESOURCE LINK UTILITY SUMMARY */}
      {analysis.resourceSummary && (
        <div className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-xl border border-indigo-500 overflow-hidden relative">
          <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4">
             <i className="fa-solid fa-link text-[120px]"></i>
          </div>
          <div className="relative z-10">
            <h3 className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="fa-solid fa-circle-check"></i>
              Verified Resources Summary
            </h3>
            <p className="text-sm font-medium leading-relaxed italic">"{analysis.resourceSummary}"</p>
          </div>
        </div>
      )}

      {/* SECTION 0: EXTRACTED ROLE DNA */}
      <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl border border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-900/50">
            <i className="fa-solid fa-dna text-xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-black">Target Role Profile</h2>
            <p className="text-xs text-slate-400 font-medium">AI Extraction results from your input</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Mandatory Technical Stack</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.allRequiredSkills.map((s, i) => (
                <span key={i} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-slate-200">{s}</span>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Specific IT / Systems Tools</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.allTechnicalSkills.map((s, i) => (
                <span key={i} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-blue-100">{s}</span>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Soft Skills & Leadership</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.allSoftSkills.map((s, i) => (
                <span key={i} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-slate-100 italic">"{s}"</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-50">
          <h2 className="text-2xl font-black text-slate-800">Audit & Tailor</h2>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Score</p>
            <p className="text-2xl font-black text-indigo-600 leading-none">{analysis.matchScore}%</p>
          </div>
        </div>

        {/* STEP 1: AUDIT SKILLS */}
        <div className="mb-10 space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Step 1: Confirm Technical & Soft Assets</h3>
          
          <div className="p-6 bg-blue-50/30 border border-blue-100 rounded-[2rem] space-y-4">
            <h3 className="text-xs font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-laptop-code"></i> Technical Skills Audit
            </h3>
            <div className="flex flex-wrap gap-2">
              {techMatched.map((kw, i) => (
                <button key={i} onClick={() => excludeKeyword(kw, 'tech')} className="group px-3 py-1.5 bg-blue-100 text-blue-800 rounded-xl text-xs font-bold border border-blue-200 hover:bg-rose-50 hover:text-rose-600 transition-all">
                  {kw} <i className="fa-solid fa-xmark ml-1 opacity-30 group-hover:opacity-100"></i>
                </button>
              ))}
              <div className="flex items-center gap-1 bg-white border border-blue-200 rounded-xl px-2 py-0.5">
                <input type="text" placeholder="Add..." className="bg-transparent text-[11px] font-bold outline-none w-16 text-blue-800" value={newTech} onChange={(e) => setNewTech(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addManualKeyword('tech')} />
                <button onClick={() => addManualKeyword('tech')} className="text-blue-500"><i className="fa-solid fa-plus text-[10px]"></i></button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-indigo-50/30 border border-indigo-100 rounded-[2rem] space-y-4">
            <h3 className="text-xs font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-people-group"></i> Soft Skills Audit
            </h3>
            <div className="flex flex-wrap gap-2">
              {softMatched.map((kw, i) => (
                <button key={i} onClick={() => excludeKeyword(kw, 'soft')} className="group px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold border border-indigo-200 hover:bg-rose-50 hover:text-rose-600 transition-all">
                  {kw} <i className="fa-solid fa-xmark ml-1 opacity-30 group-hover:opacity-100"></i>
                </button>
              ))}
              <div className="flex items-center gap-1 bg-white border border-indigo-200 rounded-xl px-2 py-0.5">
                <input type="text" placeholder="Add..." className="bg-transparent text-[11px] font-bold outline-none w-16 text-indigo-800" value={newSoft} onChange={(e) => setNewSoft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addManualKeyword('soft')} />
                <button onClick={() => addManualKeyword('soft')} className="text-indigo-500"><i className="fa-solid fa-plus text-[10px]"></i></button>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2: COVER LETTER OPTIONS */}
        <div className="mb-10 space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Step 2: Optional Cover Letter Strategy</h3>
          <div className="p-8 bg-rose-50/30 border border-rose-100 rounded-[2rem] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-rose-700 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-envelope-open-text"></i> Professional Cover Letter
              </h3>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={includeCoverLetter} onChange={(e) => setIncludeCoverLetter(e.target.checked)} className="sr-only peer" />
                <div className="relative w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-rose-500 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                <span className="ms-3 text-xs font-bold text-slate-500">Enable</span>
              </label>
            </div>
            
            <div className={`space-y-4 transition-all duration-300 ${includeCoverLetter ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Language</p>
                   <select value={coverLetterLanguage} onChange={(e) => setCoverLetterLanguage(e.target.value)} className="w-full p-2 bg-white border border-rose-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-rose-400">
                      <option value="English">English</option>
                      <option value="German">German</option>
                      <option value="French">French</option>
                      <option value="Spanish">Spanish</option>
                   </select>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Instructions / Existing Draft</p>
                <textarea 
                  value={coverLetterText} 
                  onChange={(e) => setCoverLetterText(e.target.value)} 
                  className="w-full h-24 p-4 text-xs bg-white border border-rose-200 rounded-2xl focus:ring-2 focus:ring-rose-400 outline-none resize-none" 
                  placeholder="Paste draft or special requests here (e.g., 'Address the gap in cloud experience')..." 
                />
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: RESUME REWRITE STRATEGY */}
        <div className="mb-10 space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Step 3: Resume Rewrite Strategy</h3>
          <div className="space-y-3">
            {editedRecommendations.map((rec, i) => (
              <textarea
                key={i}
                value={rec}
                onChange={(e) => handleRecChange(i, e.target.value)}
                className="w-full p-4 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none resize-none min-h-[70px] text-slate-700 shadow-sm transition-all"
              />
            ))}
          </div>

          <div className="space-y-3 p-6 bg-slate-50 border border-slate-100 rounded-[2rem]">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-comment-dots"></i> Final Human Feedback
            </h3>
            <textarea
              value={manualExclusions}
              onChange={(e) => setManualExclusions(e.target.value)}
              className="w-full h-20 p-4 text-xs bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none shadow-inner"
              placeholder="e.g., 'Keep it to 2 pages maximum'..."
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4 pt-8 border-t border-slate-50">
          <button onClick={onBack} disabled={isLoading} className="flex-1 py-5 px-6 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">Back</button>
          <button 
            onClick={() => onConfirm(editedRecommendations, reqMatched, niceMatched, softMatched, techMatched, manualExclusions, includeCoverLetter, coverLetterText, coverLetterLanguage)} 
            disabled={isLoading} 
            className="flex-[2] py-5 px-6 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
          >
            {isLoading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
            Generate Tailored Documents
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeywordMapReview;