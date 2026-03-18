import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, ArrowRight, Zap, Layout, MessageSquare, Boxes, Cpu, Layers, GitBranch } from 'lucide-react';

const LandingPage = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      navigate('/analyzer?url=' + encodeURIComponent(repoUrl));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4 pt-20 pb-16 overflow-hidden"
    >
      {/* Radial Gradients for Premium Look */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <motion.div className="text-center max-w-4xl mx-auto z-10" variants={containerVariants}>
        
        {/* Animated Badge */}
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            CodeSage 2.0 is Here
          </div>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-6 leading-[1.1]">
          Decode any codebase <br className="hidden md:block" />
          in <span className="gradient-text">seconds.</span>
        </motion.h1>

        {/* Hero Paragraph */}
        <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Skip the endless scrolling. Drop a GitHub URL and let our AI instantly generate architecture diagrams, tech stack insights, and deep code explanations.
        </motion.p>

        {/* Input Form */}
        <motion.form variants={itemVariants} onSubmit={handleAnalyze} className="max-w-xl mx-auto relative group z-20 mb-16">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Github className="h-6 w-6 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            type="url"
            className="block w-full pl-14 pr-40 py-4 bg-[#0a0f1a]/80 backdrop-blur-xl border border-white/10 rounded-2xl text-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-2xl"
            placeholder="https://github.com/username/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
          />
          <div className="absolute inset-y-2 right-2 flex items-center">
            <button
              type="submit"
              className="glow-btn bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-6 rounded-xl flex items-center gap-2 h-full shadow-[0_0_20px_rgba(79,70,229,0.4)]"
            >
              Analyze <ArrowRight size={18} />
            </button>
          </div>
        </motion.form>

        {/* Stats / Trust items */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-8 text-slate-400 text-sm font-medium">
          <div className="flex items-center gap-2"><Cpu size={16} className="text-indigo-400" /> Fast AI Analysis</div>
          <div className="flex items-center gap-2"><GitBranch size={16} className="text-cyan-400" /> Public & Private Repos</div>
          <div className="flex items-center gap-2"><Layers size={16} className="text-purple-400" /> Deep Architecture Mapping</div>
        </motion.div>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mt-32 max-w-6xl mx-auto w-full z-10"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Everything you need to understand code.</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Powerful features built for engineering teams to onboard faster and ship with confidence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Boxes className="text-indigo-400" size={24} />, title: 'Visual Architecture', desc: 'Instantly generate Mermaid.js diagrams showing how components interact.' },
            { icon: <Zap className="text-cyan-400" size={24} />, title: 'AI Code Explanations', desc: 'Get line-by-line or high-level summaries of complex logic.' },
            { icon: <Layout className="text-purple-400" size={24} />, title: 'Tech Stack Detection', desc: 'Identify languages, frameworks, and tools used across the repository.' },
            { icon: <MessageSquare className="text-pink-400" size={24} />, title: 'Repo Chat', desc: 'Ask specific questions about the codebase context and get exact answers.' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass p-6 rounded-2xl flex flex-col items-start text-left group hover:border-indigo-500/30 transition-colors"
            >
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-5 border border-white/10 group-hover:bg-indigo-500/10 group-hover:scale-110 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LandingPage;
