import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader } from 'lucide-react';

const AnalyzerPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const url = searchParams.get('url');
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call for now
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [url]);

  if (!url) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-xl text-slate-400">Please provide a repository URL via the Landing Page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 border-b border-slate-700 pb-6">
        <h2 className="text-2xl font-bold text-white break-all">Analyzing: {url}</h2>
        <p className="text-slate-400 mt-2">AI is evaluating the codebase structure and architecture.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <h3 className="text-xl font-medium text-white">Crunching code...</h3>
          <p className="text-slate-400 mt-2 text-center max-w-md">Our AI is reading the files, understanding the tech stack, and building a mental model of the architecture.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">🧠 Architecture Overview</h3>
              <p className="text-slate-300 leading-relaxed">
                (Simulated Data) This repository is a React-based frontend application leveraging Vite for module bundling. 
                It uses standard functional components and hooks for state management. 
                The application routes are handled by React Router DOM, and styling is powered by Tailwind CSS. 
                The backend is expected to be a Node.js/Express service providing RESTful APIs.
              </p>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">⚙️ Setup Instructions</h3>
              <div className="prose prose-invert max-w-none">
                <pre className="bg-slate-900 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto">
{`# 1. Clone the repository
git clone ${url}

# 2. Install dependencies
npm install

# 3. Create .env file based on .env.example
cp .env.example .env

# 4. Start the development server
npm run dev`}
                </pre>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">🛠️ Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'Vite', 'Tailwind CSS', 'JavaScript', 'Node.js', 'Express'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-slate-700 text-slate-200 text-sm rounded-full border border-slate-600">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">📁 Folder Structure</h3>
              <ul className="text-slate-300 font-mono text-sm space-y-2">
                <li><span className="text-amber-400">📂</span> src/
                  <ul className="pl-4 mt-2 space-y-2 border-l border-slate-700 ml-2">
                    <li><span className="text-amber-400">📂</span> components/</li>
                    <li><span className="text-amber-400">📂</span> pages/</li>
                    <li><span className="text-amber-400">📂</span> hooks/</li>
                    <li><span className="text-blue-400">📄</span> App.jsx</li>
                    <li><span className="text-blue-400">📄</span> main.jsx</li>
                  </ul>
                </li>
                <li><span className="text-blue-400">📄</span> package.json</li>
                <li><span className="text-blue-400">📄</span> README.md</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzerPage;
