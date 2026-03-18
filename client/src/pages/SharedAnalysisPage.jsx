import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSharedAnalysis } from '../services/analysisService';
import TechStackCard from '../components/TechStackCard';
import AIExplanation from '../components/AIExplanation';
import ArchitectureDiagram from '../components/ArchitectureDiagram';
import {
  Loader,
  AlertCircle,
  Star,
  GitFork,
  Eye,
  Code,
  Calendar,
  ExternalLink,
  Tag,
  Scale,
  GitBranch,
  HardDrive,
  Share2,
  ArrowLeft,
  Cpu,
  Sparkles,
  Network,
} from 'lucide-react';

const SharedAnalysisPage = () => {
  const { shareId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSharedAnalysis(shareId);
        setAnalysis(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load shared analysis');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [shareId]);

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num?.toString() || '0';
  };

  const formatSize = (kb) => {
    if (!kb) return 'N/A';
    if (kb >= 1024 * 1024) return (kb / (1024 * 1024)).toFixed(1) + ' GB';
    if (kb >= 1024) return (kb / 1024).toFixed(1) + ' MB';
    return kb + ' KB';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <h3 className="text-xl font-medium text-white">Loading shared analysis…</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Analysis Not Found</h3>
        <p className="text-slate-400 mb-8">{error}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all"
        >
          <ArrowLeft size={16} /> Go Home
        </Link>
      </div>
    );
  }

  const meta = analysis.metadata || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Shared banner */}
      <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 text-blue-300 px-5 py-3 rounded-xl mb-8 text-sm">
        <Share2 size={18} className="shrink-0" />
        <span>
          This is a <strong>shared analysis report</strong>. 
          <Link to="/register" className="underline ml-1 hover:text-blue-200">Sign up</Link> to analyze your own repositories.
        </span>
      </div>

      {/* Repo Header Card */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-white">
              {analysis.owner}/{analysis.repoName}
            </h3>
            {meta.description && <p className="text-slate-300 mt-2 leading-relaxed">{meta.description}</p>}
            {meta.htmlUrl && (
              <a
                href={meta.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm mt-3 transition-colors"
              >
                View on GitHub <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-xl p-1 mb-6">
        {[
          { key: 'overview', icon: <Code size={16} />, label: 'Overview' },
          { key: 'techStack', icon: <Cpu size={16} />, label: 'Tech Stack' },
          { key: 'aiExplanation', icon: <Sparkles size={16} />, label: 'AI Explanation' },
          { key: 'architecture', icon: <Network size={16} />, label: 'Architecture' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Star size={20} />, label: 'Stars', value: formatNumber(meta.stars), color: 'text-amber-400' },
              { icon: <GitFork size={20} />, label: 'Forks', value: formatNumber(meta.forks), color: 'text-blue-400' },
              { icon: <Eye size={20} />, label: 'Watchers', value: formatNumber(meta.watchers), color: 'text-purple-400' },
              { icon: <AlertCircle size={20} />, label: 'Open Issues', value: formatNumber(meta.openIssues), color: 'text-orange-400' },
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
            <MetaCard icon={<Code size={18} />} label="Primary Language" value={meta.language || 'N/A'} color="text-emerald-400" />
            <MetaCard icon={<GitBranch size={18} />} label="Default Branch" value={meta.defaultBranch} color="text-cyan-400" />
            <MetaCard icon={<HardDrive size={18} />} label="Repository Size" value={formatSize(meta.size)} color="text-indigo-400" />
            <MetaCard icon={<Scale size={18} />} label="License" value={meta.license || 'None'} color="text-pink-400" />
            {meta.createdAt && (
              <MetaCard icon={<Calendar size={18} />} label="Created" value={new Date(meta.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} color="text-teal-400" />
            )}
            {meta.updatedAt && (
              <MetaCard icon={<Calendar size={18} />} label="Last Updated" value={new Date(meta.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} color="text-slate-400" />
            )}
          </div>

          {/* Topics */}
          {meta.topics?.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2"><Tag size={15} /> Topics</h4>
              <div className="flex flex-wrap gap-2">
                {meta.topics.map((topic) => (
                  <span key={topic} className="px-3 py-1 bg-blue-500/10 text-blue-300 text-xs rounded-full border border-blue-500/20">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Tech Stack */}
      {activeTab === 'techStack' && (
        <div>
          {analysis.techStack && Object.keys(analysis.techStack).length > 0 ? (
            <TechStackCard techStack={analysis.techStack} />
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 text-center">
              <Cpu size={40} className="text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">Tech stack data is not available for this analysis.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: AI Explanation */}
      {activeTab === 'aiExplanation' && (
        <div>
          {analysis.aiExplanation && Object.keys(analysis.aiExplanation).length > 0 ? (
            <AIExplanation data={analysis.aiExplanation} loading={false} error="" onGenerate={() => {}} />
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 text-center">
              <Sparkles size={40} className="text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">AI explanation is not available for this analysis.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Architecture */}
      {activeTab === 'architecture' && (
        <div>
          {analysis.aiExplanation?.architectureDiagram ? (
            <ArchitectureDiagram
              data={{ diagram: analysis.aiExplanation.architectureDiagram }}
              loading={false}
              error=""
              onGenerate={() => {}}
            />
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 text-center">
              <Network size={40} className="text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">Architecture diagram is not available for this analysis.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/** Small reusable metadata card */
const MetaCard = ({ icon, label, value, color }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
    <div className={`${color} shrink-0`}>{icon}</div>
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </div>
  </div>
);

export default SharedAnalysisPage;
