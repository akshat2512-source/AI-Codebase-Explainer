import React from 'react';
import { GitBranch, Folder, Clock, Search, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  // Placeholder data
  const history = [
    { id: 1, name: 'facebook/react', analyzedAt: '2 hours ago', status: 'completed' },
    { id: 2, name: 'vercel/next.js', analyzedAt: '1 day ago', status: 'completed' },
    { id: 3, name: 'tailwindlabs/tailwindcss', analyzedAt: '3 days ago', status: 'completed' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard</h2>
          <p className="text-slate-400 mt-1">Your recent repository analyses and statistics.</p>
        </div>
        <Link to="/" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
          <Search size={16} /> New Analysis
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl flex items-center gap-5">
          <div className="p-4 bg-blue-500/10 text-blue-400 rounded-lg">
            <Search size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Analyzed</p>
            <p className="text-3xl font-bold text-white">12</p>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl flex items-center gap-5">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Folder size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Files Processed</p>
            <p className="text-3xl font-bold text-white">1,245</p>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl flex items-center gap-5">
          <div className="p-4 bg-purple-500/10 text-purple-400 rounded-lg">
            <GitBranch size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Saved Explanations</p>
            <p className="text-3xl font-bold text-white">12</p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-700 pb-2">
        <Clock size={20} className="text-slate-400" /> Recent History
      </h3>
      
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-700">
          {history.map((item) => (
            <div key={item.id} className="p-5 flex items-center justify-between hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <GithubIcon className="h-5 w-5 text-slate-300" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{item.name}</h4>
                  <p className="text-sm text-slate-400">{item.analyzedAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full">
                  {item.status}
                </span>
                <Link to={`/analyzer?url=https://github.com/${item.name}`} className="text-slate-400 hover:text-white transition-colors p-2">
                  <ExternalLink size={18} />
                </Link>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No recent history found. Support for saving analyses to database will come soon!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple embedded Github icon since we didn't extract it out
const GithubIcon = ({ className }) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
  );
};

export default DashboardPage;
