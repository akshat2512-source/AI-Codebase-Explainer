import React, { useState, useEffect } from 'react';
import { GitBranch, Folder, Clock, Search, ExternalLink, Trash2, Inbox, LayoutDashboard, Settings, Shield, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getUserAnalyses, deleteAnalysis } from '../services/analysisService';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSkeleton from '../components/LoadingSkeleton';

const DashboardPage = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('analyses');

  const loadAnalyses = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUserAnalyses();
      setAnalyses(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analyses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete analysis');
    }
  };

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
    <div className="flex bg-[#0a0f1a] overflow-hidden min-h-[calc(100vh-64px)]">
      
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-white/10 hidden md:flex flex-col py-8 px-4 relative z-10 shrink-0">
        <div className="mb-8 px-2">
          <h2 className="text-xl font-bold tracking-tight text-white mb-1">Dashboard</h2>
          <p className="text-xs font-medium text-slate-400 truncate">{user?.email}</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('analyses')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium ${
              activeTab === 'analyses' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Folder size={18} /> My Analyses 
            {analyses.length > 0 && (
              <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'analyses' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/10 text-slate-300'}`}>
                {analyses.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium ${
              activeTab === 'settings' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Settings size={18} /> Settings
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium ${
              activeTab === 'security' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Shield size={18} /> Security
          </button>
        </nav>

        {/* Mini Stats in Sidebar */}
        <div className="mt-auto pt-6 border-t border-white/10">
           <div className="bg-white/5 rounded-xl p-4 border border-white/5">
             <p className="text-xs font-medium text-slate-400 mb-1">Total Monitored</p>
             <p className="text-2xl font-bold text-white">{analyses.length}</p>
             <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                System Operational
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative h-[calc(100vh-64px)]">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 relative z-10">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {activeTab === 'analyses' && 'Analysis History'}
                {activeTab === 'settings' && 'Account Settings'}
                {activeTab === 'security' && 'Security Overview'}
              </h1>
              <p className="text-sm font-medium text-slate-400 mt-1">
                {activeTab === 'analyses' && 'Review and manage your previously analyzed repositories.'}
                {activeTab !== 'analyses' && 'This feature is coming soon to CodeSage 2.0.'}
              </p>
            </div>
            
            {activeTab === 'analyses' && (
              <Link
                to="/analyzer"
                className="glow-btn bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] flex items-center gap-2"
              >
                <Search size={16} /> Analyze New Repo
              </Link>
            )}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'analyses' && (
              <motion.div
                key="analyses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Error State */}
                {error && (
                  <div className="mb-8">
                    <ErrorMessage message={error} onRetry={loadAnalyses} />
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <LoadingSkeleton variant="list" count={4} />
                    <LoadingSkeleton variant="list" count={4} className="hidden md:block" />
                  </div>
                )}

                {/* Empty State */}
                {!loading && analyses.length === 0 && !error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass border border-white/10 rounded-3xl p-16 text-center max-w-2xl mx-auto mt-12 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                    
                    <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-indigo-500/30">
                      <Inbox size={32} className="text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">No repositories analyzed yet</h3>
                    <p className="text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
                      Your analysis history is empty. Start by dropping a GitHub repository link into our analyzer engine.
                    </p>
                    <Link
                      to="/analyzer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-bold rounded-xl transition-all hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                      <Search size={18} /> Start Your First Analysis
                    </Link>
                  </motion.div>
                )}

                {/* Analysis Grid */}
                {!loading && analyses.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {analyses.map((item, i) => (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={item._id}
                        className="glass border border-white/10 rounded-2xl p-5 group hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden flex flex-col"
                      >
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                        
                        <div className="flex items-start justify-between mb-4 relative z-10">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-colors">
                              <GithubIcon className="h-5 w-5 text-indigo-300" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-white truncate text-lg group-hover:text-indigo-300 transition-colors">
                                {item.repoName}
                              </h4>
                              <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span className="truncate">{item.owner}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0"></span>
                                <span className="flex items-center gap-1 text-slate-500 shrink-0"><Clock size={12}/> {timeAgo(item.updatedAt)}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 bg-slate-900/50 rounded-lg p-1 border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors p-1.5 rounded-md"
                              title="Delete Analysis"
                            >
                              <Trash2 size={16} />
                            </button>
                            <Link
                              to={`/analyzer?url=${encodeURIComponent(item.repoUrl)}`}
                              className="text-slate-400 hover:text-indigo-400 hover:bg-white/5 transition-colors p-1.5 rounded-md"
                              title="View Analysis"
                            >
                              <ExternalLink size={16} />
                            </Link>
                          </div>
                        </div>

                        {/* Status/Tech Badges */}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 relative z-10">
                          <div className="flex flex-wrap gap-2">
                             {item.techStack?.languages?.slice(0, 3).map((lang, idx) => (
                               <span key={idx} className="px-2.5 py-1 bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                 {lang}
                               </span>
                             ))}
                             {item.techStack?.languages?.length > 3 && (
                               <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                 +{item.techStack.languages.length - 3} more
                               </span>
                             )}
                          </div>
                          <Link 
                            to={`/analyzer?url=${encodeURIComponent(item.repoUrl)}`}
                            className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500 hover:!text-white transition-all shadow-sm shrink-0"
                          >
                            <ChevronRight size={16} />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab !== 'analyses' && (
              <motion.div
                key="coming-soon"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="glass border border-white/10 rounded-3xl p-16 text-center max-w-lg mx-auto mt-12"
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <LayoutDashboard size={24} className="text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
                <p className="text-sm text-slate-400">
                  This section is currently under development for CodeSage 2.0. Check back later!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
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
