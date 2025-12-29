import React, { useState } from 'react';
import { ResumeTone, TailoringRequest } from '../types';

interface Props {
  onSubmit: (request: TailoringRequest) => void;
  isLoading: boolean;
  initialData?: TailoringRequest;
}

const ResumeForm: React.FC<Props> = ({ onSubmit, isLoading, initialData }) => {
  const [masterResume, setMasterResume] = useState(initialData?.masterResume || '');
  const [sampleResumeTemplate, setSampleResumeTemplate] = useState(initialData?.sampleResumeTemplate || '');
  const [projects, setProjects] = useState(initialData?.projects || '');
  const [githubUrls, setGithubUrls] = useState<string[]>(initialData?.githubUrls || ['']);
  const [targetRole, setTargetRole] = useState(initialData?.targetRole || '');
  const [companyUrl, setCompanyUrl] = useState(initialData?.companyUrl || '');
  const [jobDescription, setJobDescription] = useState(initialData?.jobDescription || '');
  const [tone, setTone] = useState<ResumeTone>(initialData?.tone || ResumeTone.IMPACT_DRIVEN);
  const [strategicInstructions, setStrategicInstructions] = useState(initialData?.strategicInstructions || '');
  const [model, setModel] = useState(initialData?.model || 'gemini-3-pro-preview');

  const handleGithubChange = (index: number, value: string) => {
    const newUrls = [...githubUrls];
    newUrls[index] = value;
    setGithubUrls(newUrls);
  };

  const addGithubField = () => { if (githubUrls.length < 5) setGithubUrls([...githubUrls, '']); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      masterResume,
      sampleResumeTemplate,
      projects,
      coverLetter: initialData?.coverLetter || '', 
      includeCoverLetter: initialData?.includeCoverLetter || false,
      coverLetterLanguage: initialData?.coverLetterLanguage || 'English',
      negativeConstraints: initialData?.negativeConstraints || '',
      strategicInstructions,
      githubUrls: githubUrls.filter(u => u.trim() !== ''),
      jobDescription,
      companyUrl,
      targetRole,
      tone,
      model,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 bg-white p-6 md:p-10 rounded-[2rem] shadow-xl border border-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          <label className="flex items-center gap-2 font-bold text-slate-700 text-sm">
            <i className="fa-solid fa-file-invoice text-indigo-500"></i>
            1. Master Resume
          </label>
          <p className="text-[11px] text-slate-500 leading-tight">Your full history (Source of truth).</p>
          <textarea required value={masterResume} onChange={(e) => setMasterResume(e.target.value)} className="w-full h-48 p-4 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none" placeholder="Paste full resume..." />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 font-bold text-slate-700 text-sm">
            <i className="fa-solid fa-layer-group text-emerald-500"></i>
            2. Formatting & Layout Blueprint
          </label>
          <p className="text-[11px] text-slate-500 leading-tight">Paste a sample resume for a similar role to mirror its design.</p>
          <textarea required value={sampleResumeTemplate} onChange={(e) => setSampleResumeTemplate(e.target.value)} className="w-full h-48 p-4 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none" placeholder="Paste target format..." />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 font-bold text-slate-700 text-sm">
            <i className="fa-solid fa-microchip text-amber-500"></i>
            3. Detailed Projects
          </label>
          <p className="text-[11px] text-slate-500 leading-tight">Specific project depths & facts.</p>
          <textarea required value={projects} onChange={(e) => setProjects(e.target.value)} className="w-full h-48 p-4 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none" placeholder="Technical details..." />
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-chess-knight text-indigo-600"></i>
          Strategic Guidance (Modify AI Logic)
        </h2>
        <p className="text-xs text-slate-500">Tell the AI how to prioritize your background for this specific application.</p>
        <textarea 
          value={strategicInstructions} 
          onChange={(e) => setStrategicInstructions(e.target.value)} 
          className="w-full h-24 p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none" 
          placeholder="e.g., 'Focus heavily on my computational experience'..." 
        />
      </div>

      <div className="space-y-4 pt-6 border-t border-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-link text-indigo-600"></i>
          External Resources (LinkedIn, Scholar, GitHub)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {githubUrls.map((url, index) => (
            <input key={index} type="url" value={url} onChange={(e) => handleGithubChange(index, e.target.value)} className="p-3 text-sm border border-slate-200 rounded-lg outline-none" placeholder="https://..." />
          ))}
        </div>
        {githubUrls.length < 5 && (
          <button type="button" onClick={addGithubField} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 tracking-tighter uppercase">+ Add Source</button>
        )}
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-crosshairs text-indigo-600"></i>
          Target Role Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="p-3 border border-slate-200 rounded-lg text-sm" placeholder="Role Title" />
          <input required type="url" value={companyUrl} onChange={(e) => setCompanyUrl(e.target.value)} className="p-3 border border-slate-200 rounded-lg text-sm" placeholder="Company Website" />
        </div>
        <textarea required value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} className="w-full h-32 p-3 text-sm border border-slate-200 rounded-lg" placeholder="Paste full Job Description..." />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value as ResumeTone)} className="w-full p-3 border border-slate-200 rounded-lg bg-white text-sm">
              {Object.values(ResumeTone).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Engine</label>
            <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg bg-white text-sm">
              <option value="gemini-3-pro-preview">Gemini 3 Pro (Best Performance)</option>
              <option value="gemini-3-flash-preview">Gemini 3 Flash (Fast & Balanced)</option>
              <option value="gemini-2.5-flash-lite-latest">Gemini Flash Lite (Efficient)</option>
            </select>
          </div>
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="w-full py-5 rounded-2xl font-black text-white shadow-xl bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 text-lg">
        {isLoading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-magnifying-glass-chart"></i>}
        Start Role Analysis
      </button>
    </form>
  );
};

export default ResumeForm;