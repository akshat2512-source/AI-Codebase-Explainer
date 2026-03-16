import React, { useState, useEffect } from 'react';
import { GitBranch, Folder, Clock, Search, ExternalLink, Trash2, Loader, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserAnalyses, deleteAnalysis } from '../services/analysisService';

const DashboardPage = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUserAnalyses();
        setAnalyses(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analyses');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete analysis');
    }
  };

  /** Format relative time */
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard</h2>
          <p className="text-slate-400 mt-1">
            {user ? `Welcome back, ${user.name}` : 'Your recent repository analyses and statistics.'}
          </p>
        </div>
        <Link
          to="/analyzer"
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          <Search size={16} /> New Analysis
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl flex items-center gap-5">
          <div className="p-4 bg-blue-500/10 text-blue-400 rounded-lg">
            <Search size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Analyzed</p>
            <p className="text-3xl font-bold text-white">{analyses.length}</p>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl flex items-center gap-5">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Folder size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Unique Owners</p>
            <p className="text-3xl font-bold text-white">
              {new Set(analyses.map((a) => a.owner)).size}
            </p>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl flex items-center gap-5">
          <div className="p-4 bg-purple-500/10 text-purple-400 rounded-lg">
            <GitBranch size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Saved Explanations</p>
            <p className="text-3xl font-bold text-white">{analyses.length}</p>
          </div>
        </div>
      </div>

      {/* Recent analyses */}
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-700 pb-2">
        <Clock size={20} className="text-slate-400" /> Recent Analyses
      </h3>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      {!loading && analyses.length === 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <Inbox size={48} className="text-slate-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-white mb-2">No repositories analyzed yet</h4>
          <p className="text-slate-400 mb-6">
            Start by analyzing a GitHub repository — we'll save your results here.
          </p>
          <Link
            to="/analyzer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all"
          >
            <Search size={16} /> Analyze a Repository
          </Link>
        </div>
      )}

      {!loading && analyses.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="divide-y divide-slate-700">
            {analyses.map((item) => (
              <div
                key={item._id}
                className="p-5 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                    <GithubIcon className="h-5 w-5 text-slate-300" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-white truncate">
                      {item.owner}/{item.repoName}
                    </h4>
                    <p className="text-sm text-slate-400">Analyzed {timeAgo(item.updatedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full hidden sm:inline-block">
                    {item.techStack?.languages?.length || 0} languages
                  </span>
                  <Link
                    to={`/analyzer?url=${encodeURIComponent(item.repoUrl)}`}
                    className="text-slate-400 hover:text-blue-400 transition-colors p-2"
                    title="View Analysis"
                  >
                    <ExternalLink size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-2"
                    title="Delete Analysis"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Simple embedded Github icon
const GithubIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default DashboardPage;
