import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, ArrowRight, Zap, Code, Layout } from 'lucide-react';

const LandingPage = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      // In a real app we'd pass this via state or context
      navigate('/analyzer?url=' + encodeURIComponent(repoUrl));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-4">
      <div className="text-center max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-6">
          <Zap size={16} />
          <span>Powered by AI</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-6 tracking-tight">
          Understand Any Codebase in Seconds
        </h1>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          AI Codebase Explainer analyzes GitHub repositories and automatically generates clear explanations of the architecture, folder structure, tech stack, and setup instructions.
        </p>

        <form onSubmit={handleAnalyze} className="max-w-xl mx-auto relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Github className="h-6 w-6 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <input
            type="url"
            className="block w-full pl-12 pr-40 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-slate-800 transition-all shadow-xl"
            placeholder="https://github.com/username/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
          />
          <div className="absolute inset-y-2 right-2 flex items-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
            >
              Analyze <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mt-12">
        {[
          { icon: <Layout className="text-indigo-400" size={24} />, title: 'Architecture Mapping', desc: 'Visualizes high-level system components and their interactions.' },
          { icon: <Code className="text-emerald-400" size={24} />, title: 'Tech Stack Detection', desc: 'Automatically identifies frameworks, libraries, and languages used.' },
          { icon: <Zap className="text-amber-400" size={24} />, title: 'Setup Instructions', desc: 'Generates step-by-step guides to run the project locally.' }
        ].map((feature, i) => (
          <div key={i} className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800 transition-colors">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-4 border border-slate-700/50">
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
