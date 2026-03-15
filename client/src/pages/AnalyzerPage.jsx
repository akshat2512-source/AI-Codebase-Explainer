import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyzeRepository } from '../services/repoService';
import {
  Loader,
  Star,
  GitFork,
  Eye,
  Code,
  Calendar,
  ExternalLink,
  AlertCircle,
  Github,
  ArrowRight,
  Tag,
  Scale,
  GitBranch,
  HardDrive,
} from 'lucide-react';

const AnalyzerPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlFromQuery = searchParams.get('url') || '';

  const [repoUrl, setRepoUrl] = useState(urlFromQuery);
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-analyze if URL is provided via query param
  useEffect(() => {
    if (urlFromQuery) {
      handleAnalyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!repoUrl.trim()) return;

    setError('');
    setRepoData(null);
    setLoading(true);

    try {
      const data = await analyzeRepository(repoUrl.trim());
      setRepoData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze repository. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format large numbers (e.g. 220000 → 220k)
  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num?.toString() || '0';
  };

  // Format KB size to human-readable
  const formatSize = (kb) => {
    if (!kb) return 'N/A';
    if (kb >= 1024 * 1024) return (kb / (1024 * 1024)).toFixed(1) + ' GB';
    if (kb >= 1024) return (kb / 1024).toFixed(1) + ' MB';
    return kb + ' KB';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Search Section */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Repository Analyzer</h2>
        <p className="text-slate-400 mb-6">Paste a GitHub repository URL to fetch its metadata and details.</p>

        <form onSubmit={handleAnalyze} className="relative group max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Github className="h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <input
            type="url"
            className="block w-full pl-12 pr-36 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="https://github.com/owner/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
          />
          <div className="absolute inset-y-1.5 right-1.5">
            <button
              type="submit"
              disabled={loading}
              className="h-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium px-5 rounded-lg transition-all flex items-center gap-2 text-sm active:scale-95"
            >
              {loading ? <Loader className="h-4 w-4 animate-spin" /> : <><ArrowRight size={16} /> Analyze</>}
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl mb-8 text-sm">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <h3 className="text-xl font-medium text-white">Fetching repository data...</h3>
          <p className="text-slate-400 mt-2">Contacting the GitHub API</p>
        </div>
      )}

      {/* Results */}
      {repoData && !loading && (
        <div className="space-y-6 animate-in fade-in">
          {/* Repo Header Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              {repoData.ownerAvatar && (
                <img
                  src={repoData.ownerAvatar}
                  alt={repoData.owner}
                  className="w-14 h-14 rounded-xl border border-slate-600"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-2xl font-bold text-white">{repoData.fullName}</h3>
                  {repoData.isPrivate && (
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-full border border-amber-500/20">Private</span>
                  )}
                </div>
                {repoData.description && (
                  <p className="text-slate-300 mt-2 leading-relaxed">{repoData.description}</p>
                )}
                <a
                  href={repoData.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm mt-3 transition-colors"
                >
                  View on GitHub <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Star size={20} />, label: 'Stars', value: formatNumber(repoData.stars), color: 'text-amber-400' },
              { icon: <GitFork size={20} />, label: 'Forks', value: formatNumber(repoData.forks), color: 'text-blue-400' },
              { icon: <Eye size={20} />, label: 'Watchers', value: formatNumber(repoData.watchers), color: 'text-purple-400' },
              { icon: <AlertCircle size={20} />, label: 'Open Issues', value: formatNumber(repoData.openIssues), color: 'text-orange-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
                <div className={`${stat.color} flex justify-center mb-2`}>{stat.icon}</div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetadataCard icon={<Code size={18} />} label="Primary Language" value={repoData.language || 'N/A'} color="text-emerald-400" />
            <MetadataCard icon={<GitBranch size={18} />} label="Default Branch" value={repoData.defaultBranch} color="text-cyan-400" />
            <MetadataCard icon={<HardDrive size={18} />} label="Repository Size" value={formatSize(repoData.size)} color="text-indigo-400" />
            <MetadataCard icon={<Scale size={18} />} label="License" value={repoData.license || 'None'} color="text-pink-400" />
            <MetadataCard icon={<Calendar size={18} />} label="Created" value={new Date(repoData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} color="text-teal-400" />
            <MetadataCard icon={<Calendar size={18} />} label="Last Updated" value={new Date(repoData.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} color="text-slate-400" />
          </div>

          {/* Topics */}
          {repoData.topics?.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2"><Tag size={15} /> Topics</h4>
              <div className="flex flex-wrap gap-2">
                {repoData.topics.map((topic) => (
                  <span key={topic} className="px-3 py-1 bg-blue-500/10 text-blue-300 text-xs rounded-full border border-blue-500/20">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/** Small reusable metadata card */
const MetadataCard = ({ icon, label, value, color }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
    <div className={`${color} shrink-0`}>{icon}</div>
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </div>
  </div>
);

export default AnalyzerPage;
