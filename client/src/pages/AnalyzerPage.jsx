import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeRepository, fetchRepoTree, fetchTechStack, fetchAIExplanation, fetchArchitectureDiagram, sendChatMessage } from '../services/repoService';
import { saveAnalysis, downloadReport } from '../services/analysisService';
import { useAuth } from '../context/AuthContext';
import FileTree from '../components/FileTree';
import TechStackCard from '../components/TechStackCard';
import AIExplanation from '../components/AIExplanation';
import ErrorMessage from '../components/ErrorMessage';
import {
  Loader,
  Star,
  GitFork,
  Eye,
  Code,
  Calendar,
  ExternalLink,
  Github,
  ArrowRight,
  Tag,
  Scale,
  GitBranch,
  HardDrive,
  FolderTree,
  Cpu,
  Sparkles,
  Network,
  MessageSquare,
  FileDown,
  Share2,
  Check,
  AlertCircle,
} from 'lucide-react';

const ArchitectureDiagram = lazy(() => import('../components/ArchitectureDiagram'));
const RepoChat = lazy(() => import('../components/RepoChat'));

const LazyFallback = () => (
  <div className="flex justify-center items-center py-20 min-h-[400px]">
    <div className="relative w-12 h-12">
       <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
       <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
);

const AnalyzerPage = () => {
  const location = useLocation();
  const { user } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const urlFromQuery = searchParams.get('url') || '';

  const [repoUrl, setRepoUrl] = useState(urlFromQuery);
  const [repoData, setRepoData] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [techStackData, setTechStackData] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [diagramData, setDiagramData] = useState(null);
  const [diagramLoading, setDiagramLoading] = useState(false);
  const [diagramError, setDiagramError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisId, setAnalysisId] = useState(null);
  const [shareId, setShareId] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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
    setTreeData(null);
    setTechStackData(null);
    setAiData(null);
    setAiError('');
    setDiagramData(null);
    setDiagramError('');
    setAnalysisId(null);
    setShareId(null);
    setLoading(true);
    setActiveTab('overview');

    try {
      const [metadata, tree, techStack] = await Promise.all([
        analyzeRepository(repoUrl.trim()),
        fetchRepoTree(repoUrl.trim()).catch(() => null),
        fetchTechStack(repoUrl.trim()).catch(() => null),
      ]);
      setRepoData(metadata);
      setTreeData(tree);
      setTechStackData(techStack);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze repository. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!repoUrl.trim()) return;
    setAiLoading(true);
    setAiError('');
    try {
      const cachedMeta = repoData ? { ...repoData, tree: treeData?.tree || [] } : null;
      const data = await fetchAIExplanation(repoUrl.trim(), cachedMeta, techStackData);
      setAiData(data);

      if (user && repoData) {
        const urlObj = repoUrl.trim();
        const parts = urlObj.replace(/\.git$/, '').split('/');
        const owner = parts[parts.length - 2] || '';
        const repoName = parts[parts.length - 1] || '';
        saveAnalysis({
          repoUrl: urlObj,
          repoName,
          owner,
          metadata: repoData,
          techStack: techStackData,
          aiExplanation: data,
        })
          .then((saved) => {
            setAnalysisId(saved._id);
            setShareId(saved.shareId);
          })
          .catch(() => {});
      }
    } catch (err) {
      setAiError(err.response?.data?.message || 'Failed to generate AI explanation. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateDiagram = async () => {
    if (!repoData) return;
    setDiagramLoading(true);
    setDiagramError('');
    try {
      const folders = (treeData?.tree || [])
        .filter((f) => f.type === 'tree')
        .map((f) => f.path)
        .slice(0, 30);
      const data = await fetchArchitectureDiagram({
        repoName: repoData.name || repoData.fullName,
        techStack: techStackData || {},
        folders,
      });
      setDiagramData(data);
    } catch (err) {
      setDiagramError(err.response?.data?.message || 'Failed to generate diagram.');
    } finally {
      setDiagramLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!analysisId) return;
    setDownloadLoading(true);
    try {
      await downloadReport(analysisId);
    } catch (err) {
      setError('Failed to download report. Please try again.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareId) return;
    const link = `${window.location.origin}/share/${shareId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const input = document.createElement('input');
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const buildChatContext = () => {
    if (!repoData) return null;
    return {
      repoName: repoData.fullName || repoData.name,
      description: repoData.description,
      languages: techStackData?.languages || [],
      frameworks: techStackData?.frameworks || [],
      backend: techStackData?.backend || [],
      database: techStackData?.database || [],
      devTools: techStackData?.devTools || [],
      folders: (treeData?.tree || [])
        .filter((f) => f.type === 'tree')
        .map((f) => f.path)
        .slice(0, 15),
      aiSummary: aiData?.overview || '',
    };
  };

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

  const pageTransition = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
    transition: { duration: 0.3, ease: 'easeOut' }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Background glow for the analyzer page */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Search Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h2 className="text-4xl font-extrabold text-white tracking-tight mb-3">Analyzer <span className="gradient-text">Engine</span></h2>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto">Paste a GitHub repository URL to unleash CodeSage. We'll automatically fetch metadata, structure, and AI insights.</p>

        <form onSubmit={handleAnalyze} className="relative group max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Github className="h-6 w-6 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            type="url"
            className="block w-full pl-14 pr-36 py-4 bg-[#0a0f1a]/80 backdrop-blur-xl border border-white/10 rounded-2xl text-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-all"
            placeholder="https://github.com/owner/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
          />
          <div className="absolute inset-y-2 right-2 flex items-center">
            <button
              type="submit"
              disabled={loading}
              className="h-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold px-6 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.4)] active:scale-95"
            >
              {loading ? <Loader className="h-5 w-5 animate-spin" /> : <><ArrowRight size={18} /> Analyze</>}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="mb-8 max-w-2xl mx-auto">
              <ErrorMessage message={error} onRetry={handleAnalyze} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center py-24 glass-panel rounded-3xl max-w-2xl mx-auto"
        >
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Cloning codebase into memory...</h3>
          <p className="text-slate-400 mt-2">Connecting to GitHub API to traverse file trees and metadata.</p>
        </motion.div>
      )}

      {/* Results */}
      {repoData && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Repo Header Card & Action Bar */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex items-center gap-5 relative z-10">
              {repoData.ownerAvatar ? (
                <img src={repoData.ownerAvatar} alt={repoData.owner} className="w-16 h-16 rounded-2xl border border-white/10 shadow-lg" />
              ) : (
                <div className="w-16 h-16 rounded-2xl border border-white/10 bg-indigo-500/20 flex items-center justify-center">
                  <Github size={32} className="text-indigo-300" />
                </div>
              )}
              
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{repoData.fullName}</h3>
                  {repoData.isPrivate && (
                    <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-amber-500/20">Private</span>
                  )}
                </div>
                {repoData.description && (
                  <p className="text-slate-400 mt-1.5 leading-relaxed text-sm max-w-xl">{repoData.description}</p>
                )}
                <a
                  href={repoData.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-cyan-400 text-sm mt-3 font-medium transition-colors"
                >
                  View on GitHub <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {analysisId && (
              <div className="flex items-center justify-start md:justify-end gap-3 w-full md:w-auto relative z-10 shrink-0 border-t border-white/5 md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                <button
                  onClick={handleDownloadReport}
                  disabled={downloadLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-sm font-bold rounded-xl transition-all active:scale-95"
                >
                  {downloadLoading ? <Loader className="h-4 w-4 animate-spin" /> : <FileDown size={16} />}
                  PDF
                </button>
                <button
                  onClick={handleCopyShareLink}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all active:scale-95 border ${
                    copied
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                      : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
                  }`}
                >
                  {copied ? <Check size={16} /> : <Share2 size={16} />}
                  {copied ? 'Copied' : 'Share'}
                </button>
              </div>
            )}
          </div>

          {/* Radix Tabs */}
          <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
            <Tabs.List className="flex overflow-x-auto no-scrollbar gap-2 glass border border-white/10 rounded-2xl p-2 mb-8 w-max max-w-full mx-auto relative z-10">
              {[
                { id: 'overview', icon: <Code size={16} />, label: 'Metrics' },
                { id: 'files', icon: <FolderTree size={16} />, label: 'File Explorer' },
                { id: 'techStack', icon: <Cpu size={16} />, label: 'Tech Stack' },
                { id: 'aiExplanation', icon: <Sparkles size={16} />, label: 'AI Explanation' },
                { id: 'architecture', icon: <Network size={16} />, label: 'Dependency Graph' },
                { id: 'chat', icon: <MessageSquare size={16} />, label: 'Chat' }
              ].map(tab => (
                <Tabs.Trigger
                  key={tab.id}
                  value={tab.id}
                  className={`relative flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-bold transition-colors duration-200 outline-none whitespace-nowrap ${
                    activeTab === tab.id ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">{tab.icon} {tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-indigo-600 rounded-xl z-0 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <Tabs.Content value="overview" asChild forceMount key="overview">
                  <motion.div {...pageTransition} className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { icon: <Star size={20} />, label: 'Stars', value: formatNumber(repoData.stars), color: 'text-amber-400' },
                        { icon: <GitFork size={20} />, label: 'Forks', value: formatNumber(repoData.forks), color: 'text-blue-400' },
                        { icon: <Eye size={20} />, label: 'Watchers', value: formatNumber(repoData.watchers), color: 'text-purple-400' },
                        { icon: <AlertCircle size={20} />, label: 'Open Issues', value: formatNumber(repoData.openIssues), color: 'text-orange-400' },
                      ].map((stat, i) => (
                        <div key={i} className="glass p-5 rounded-2xl text-center border border-white/5 hover:border-white/10 transition-colors">
                          <div className={`${stat.color} flex justify-center mb-3 bg-white/5 w-10 h-10 mx-auto rounded-full items-center`}>{stat.icon}</div>
                          <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <MetadataCard icon={<Code size={18} />} label="Primary Language" value={repoData.language || 'N/A'} color="text-emerald-400" />
                      <MetadataCard icon={<GitBranch size={18} />} label="Default Branch" value={repoData.defaultBranch} color="text-cyan-400" />
                      <MetadataCard icon={<HardDrive size={18} />} label="Repository Size" value={formatSize(repoData.size)} color="text-indigo-400" />
                      <MetadataCard icon={<Scale size={18} />} label="License" value={repoData.license || 'None'} color="text-pink-400" />
                      <MetadataCard icon={<Calendar size={18} />} label="Created" value={new Date(repoData.createdAt).toLocaleDateString()} color="text-teal-400" />
                      <MetadataCard icon={<Calendar size={18} />} label="Last Updated" value={new Date(repoData.updatedAt).toLocaleDateString()} color="text-slate-400" />
                    </div>

                    {/* Topics */}
                    {repoData.topics?.length > 0 && (
                      <div className="glass p-6 rounded-2xl border border-white/5">
                        <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2 uppercase tracking-widest"><Tag size={16} /> Repository Topics</h4>
                        <div className="flex flex-wrap gap-2">
                          {repoData.topics.map((topic) => (
                            <span key={topic} className="px-3 py-1.5 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-xs font-medium rounded-full border border-white/10 cursor-default">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </Tabs.Content>
              )}

              {activeTab === 'files' && (
                <Tabs.Content value="files" asChild forceMount key="files">
                  <motion.div {...pageTransition}>
                    {treeData ? (
                      <FileTree treeData={treeData} />
                    ) : (
                      <div className="glass border border-white/5 rounded-3xl p-16 text-center max-w-2xl mx-auto shadow-2xl">
                        <FolderTree size={48} className="text-slate-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Unavailable</h3>
                        <p className="text-slate-400">File tree data could not be fetched for this repository.</p>
                      </div>
                    )}
                  </motion.div>
                </Tabs.Content>
              )}

              {activeTab === 'techStack' && (
                <Tabs.Content value="techStack" asChild forceMount key="techStack">
                  <motion.div {...pageTransition}>
                    {techStackData ? (
                      <TechStackCard techStack={techStackData} />
                    ) : (
                      <div className="glass border border-white/5 rounded-3xl p-16 text-center max-w-2xl mx-auto shadow-2xl">
                        <Cpu size={48} className="text-slate-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Stack Data</h3>
                        <p className="text-slate-400">Tech stack detection failed or is unavailable.</p>
                      </div>
                    )}
                  </motion.div>
                </Tabs.Content>
              )}

              {activeTab === 'aiExplanation' && (
                <Tabs.Content value="aiExplanation" asChild forceMount key="aiExplanation">
                  <motion.div {...pageTransition} className="min-h-[500px]">
                    <AIExplanation
                      data={aiData}
                      loading={aiLoading}
                      error={aiError}
                      onGenerate={handleGenerateAI}
                    />
                  </motion.div>
                </Tabs.Content>
              )}

              {activeTab === 'architecture' && (
                <Tabs.Content value="architecture" asChild forceMount key="architecture">
                  <motion.div {...pageTransition} className="min-h-[500px]">
                    <Suspense fallback={<LazyFallback />}>
                      <ArchitectureDiagram
                        data={diagramData}
                        loading={diagramLoading}
                        error={diagramError}
                        onGenerate={handleGenerateDiagram}
                      />
                    </Suspense>
                  </motion.div>
                </Tabs.Content>
              )}

              {activeTab === 'chat' && (
                <Tabs.Content value="chat" asChild forceMount key="chat">
                  <motion.div {...pageTransition} className="min-h-[600px]">
                    <Suspense fallback={<LazyFallback />}>
                      <RepoChat
                        repoContext={buildChatContext()}
                        onSend={sendChatMessage}
                      />
                    </Suspense>
                  </motion.div>
                </Tabs.Content>
              )}
            </AnimatePresence>
          </Tabs.Root>
        </motion.div>
      )}
    </div>
  );
};

const MetadataCard = ({ icon, label, value, color }) => (
  <div className="glass border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:border-white/10 transition-colors">
    <div className={`${color} bg-white/5 p-3 rounded-xl`}>{icon}</div>
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
      <p className="text-white font-bold leading-none">{value}</p>
    </div>
  </div>
);

export default AnalyzerPage;
