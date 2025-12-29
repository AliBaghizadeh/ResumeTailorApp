import React, { useState } from 'react';
import { TailoringResult } from '../types';
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType } from 'docx';
import FileSaver from 'file-saver';

interface Props {
  result: TailoringResult;
  onReset: () => void;
  onBackToEdit: () => void;
}

const ResumeOutput: React.FC<Props> = ({ result, onReset, onBackToEdit }) => {
  const { atsAnalysis, usage, coverLetterText } = result;
  const [activeTab, setActiveTab] = useState<'resume' | 'coverLetter'>('resume');

  const hasCoverLetter = !!coverLetterText;
  const activeContent = activeTab === 'resume' ? result.markdown : (coverLetterText || '');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeContent);
    alert(`${activeTab === 'resume' ? 'Resume' : 'Cover Letter'} copied to clipboard!`);
  };

  const downloadAsDocx = async () => {
    const lines = activeContent.split('\n');
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: lines.map(line => {
          const trimmed = line.trim();
          if (trimmed === '') return null;

          // Simple logic: if it's all caps and not a bullet, treat as header (for resume)
          const isHeader = activeTab === 'resume' && trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !trimmed.startsWith('•');
          
          return new Paragraph({
            text: trimmed,
            spacing: { 
              before: isHeader ? 300 : 120, 
              after: 120 
            },
            heading: isHeader ? HeadingLevel.HEADING_2 : undefined,
            alignment: AlignmentType.LEFT,
          });
        }).filter(p => p !== null) as Paragraph[],
      }],
    });

    try {
      const blob = await Packer.toBlob(doc);
      FileSaver.saveAs(blob, activeTab === 'resume' ? "Tailored_Resume.docx" : "Tailored_Cover_Letter.docx");
    } catch (error) {
      console.error("Failed to generate DOCX:", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* STATS HEADER */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <div className="relative w-24 h-24 flex items-center justify-center mb-4">
            <svg className="w-full h-full -rotate-90">
              <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
              <circle 
                cx="48" cy="48" r="42" 
                stroke="currentColor" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={263} 
                strokeDashoffset={263 - (263 * atsAnalysis.matchScore) / 100} 
                className={atsAnalysis.matchScore > 70 ? "text-emerald-500" : "text-amber-500"} 
              />
            </svg>
            <span className="absolute text-xl font-black text-slate-800">{atsAnalysis.matchScore}%</span>
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Overall Match</h3>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <i className="fa-solid fa-microchip text-blue-600"></i>
                Technical Assets
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(atsAnalysis.technicalSkillsMatched || []).map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium border border-blue-100">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <i className="fa-solid fa-user-check text-indigo-600"></i>
                Soft Assets
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {atsAnalysis.softSkillsMatched.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-medium border border-indigo-100">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800">
           <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">API Consumption</h3>
           <div className="space-y-3">
              <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                 <span className="text-[10px] text-slate-400">Prompt</span>
                 <span className="text-sm font-bold text-slate-200">{usage?.promptTokens?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                 <span className="text-[10px] text-slate-400">Completion</span>
                 <span className="text-sm font-bold text-slate-200">{usage?.candidatesTokens?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between items-end pt-1">
                 <span className="text-[10px] font-bold text-indigo-400">Total Tokens</span>
                 <span className="text-lg font-black text-white">{usage?.totalTokens?.toLocaleString() || '0'}</span>
              </div>
           </div>
        </div>
      </div>

      {/* DOCUMENT TABS AND ACTIONS */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900 text-white p-4 rounded-xl shadow-lg sticky top-[72px] z-40">
        <div className="flex bg-slate-800 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('resume')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'resume' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Tailored Resume
          </button>
          {hasCoverLetter && (
            <button 
              onClick={() => setActiveTab('coverLetter')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'coverLetter' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Cover Letter
            </button>
          )}
        </div>

        <div className="flex gap-4">
          <button onClick={onBackToEdit} className="flex items-center gap-2 text-sm font-bold bg-indigo-600/80 px-5 py-2.5 rounded-lg hover:bg-indigo-600 transition-all shadow-md active:scale-95">
            <i className="fa-solid fa-pen-to-square"></i> Back to Strategy
          </button>
          <button onClick={downloadAsDocx} className="flex items-center gap-2 text-sm font-bold bg-blue-600 px-5 py-2.5 rounded-lg hover:bg-blue-500 transition-all shadow-md active:scale-95">
            <i className="fa-solid fa-file-word"></i> Download .docx
          </button>
          <button onClick={copyToClipboard} className="flex items-center gap-2 text-sm font-bold bg-slate-700 px-5 py-2.5 rounded-lg hover:bg-slate-600 transition-all active:scale-95">
            <i className="fa-regular fa-copy"></i> Copy Text
          </button>
          <button onClick={onReset} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
            <i className="fa-solid fa-rotate-left"></i> Start Over
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl border border-slate-100">
        <div className="max-w-none">
          <div className="whitespace-pre-wrap font-serif text-slate-800 leading-relaxed text-sm bg-slate-50/50 p-8 rounded-xl border border-dashed border-slate-200">
            {activeContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeOutput;