import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Layers,
  Puzzle,
  Terminal,
  Sparkles,
  AlertCircle,
  Code2
} from 'lucide-react';

const SECTIONS = [
  {
    key: 'overview',
    title: 'Project Overview',
    icon: <BookOpen size={16} />,
  },
  {
    key: 'architecture',
    title: 'Architecture',
    icon: <Layers size={16} />,
  },
  {
    key: 'components',
    title: 'Components',
    icon: <Puzzle size={16} />,
  },
  {
    key: 'setup',
    title: 'Setup Guide',
    icon: <Terminal size={16} />,
  },
];

const AIExplanation = ({ data, loading, error, onGenerate }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!data && !loading && !error) {
    return (
      <div className="glass border border-white/10 rounded-3xl p-16 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="w-24 h-24 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-indigo-500/20 relative group">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-xl group-hover:bg-indigo-500/30 transition-colors" />
            <Sparkles size={40} className="text-indigo-400 relative z-10" />
          </div>
          <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Codebase Intelligence</h3>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed text-lg">
            Let CodeSage analyze the entire repository structure and generate a comprehensive technical breakdown.
          </p>
          <button
            onClick={onGenerate}
            className="glow-btn bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center gap-3 mx-auto active:scale-95"
          >
            <Sparkles size={20} />
            Generate Intelligence Report
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass border border-white/10 rounded-3xl p-16 text-center shadow-2xl h-[500px] flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <Sparkles size={32} className="absolute inset-0 m-auto text-indigo-400 animate-pulse" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Processing Intelligence...</h3>
        <p className="text-slate-400 text-lg">Analyzing files, dependencies, and architecture patterns.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass border border-red-500/20 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden bg-red-500/5">
        <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
          <AlertCircle size={32} className="text-red-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">Analysis Failed</h3>
        <p className="text-red-300 max-w-md mx-auto mb-8 bg-red-500/10 p-4 rounded-xl border border-red-500/20 backdrop-blur-md">
          {error}
        </p>
        <button
          onClick={onGenerate}
          className="glow-btn bg-white text-slate-900 font-bold px-8 py-3 rounded-xl transition-all hover:bg-slate-200"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  // Ensure content exists to prevent Monaco Editor crash
  const markdownContent = data?.[activeTab] || 'No content generated for this section.';

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[750px] overflow-hidden">
       {/* Left sidebar - Navigation */}
       <div className="lg:w-64 shrink-0 flex flex-col gap-2">
         {data._mock && (
            <div className="glass border border-amber-500/20 rounded-xl p-4 mb-4 bg-amber-500/5">
               <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
                 <AlertCircle size={14} /> Mock Mode
               </div>
               <p className="text-xs text-amber-400/80 leading-relaxed">
                 Using fallback data. Set <span className="text-amber-300 font-mono bg-amber-500/20 px-1 rounded">OPENAI_API_KEY</span> to enable real AI.
               </p>
            </div>
         )}

         <div className="glass border border-white/10 rounded-2xl p-3 flex-1 overflow-hidden flex flex-col">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-3 py-2 mb-2">Report Sections</h4>
            <div className="space-y-1 flex-1">
               {SECTIONS.map((section) => (
                 <button
                   key={section.key}
                   onClick={() => setActiveTab(section.key)}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold text-left outline-none relative overflow-hidden
                     ${activeTab === section.key 
                        ? 'text-white border border-indigo-500/30 bg-indigo-500/10 shadow-lg' 
                        : 'text-slate-400 border border-transparent hover:bg-white/5 hover:text-white'
                     }
                   `}
                 >
                   {activeTab === section.key && (
                       <motion.div layoutId="navIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                   )}
                   <span className={activeTab === section.key ? 'text-indigo-400' : 'text-slate-500'}>
                     {section.icon}
                   </span>
                   {section.title}
                 </button>
               ))}
            </div>
         </div>
       </div>

       {/* Right side - Monaco Editor Viewer */}
       <div className="flex-1 glass border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative bg-[#0a0f1a]">
          <div className="px-5 py-3 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between z-10">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Code2 size={16} className="text-indigo-400" />
               </div>
               <span className="font-mono text-sm font-bold text-slate-300 tracking-wider">
                 {activeTab.toUpperCase()}.md
               </span>
             </div>
             <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Read Only</span>
             </div>
          </div>

          <div className="flex-1 relative">
             {/* Using transparent editor over glass bg */}
             <Editor
                height="100%"
                language="markdown"
                theme="vs-dark"
                value={markdownContent}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  padding: { top: 24, bottom: 24 },
                  fontSize: 15,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1.7,
                  renderLineHighlight: 'none',
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  scrollbar: {
                    verticalScrollbarSize: 8,
                    useShadows: false
                  }
                }}
             />
          </div>
       </div>
    </div>
  );
};

export default AIExplanation;
