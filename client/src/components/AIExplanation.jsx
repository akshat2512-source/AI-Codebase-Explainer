import React from 'react';
import {
  BookOpen,
  Layers,
  Puzzle,
  Terminal,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

// ── Section definitions ────────────────────────────────────────────────────────

const SECTIONS = [
  {
    key: 'overview',
    title: 'Project Overview',
    icon: <BookOpen size={18} />,
    color: 'text-blue-400',
    gradient: 'from-blue-500/10 to-transparent',
    border: 'border-blue-500/20',
  },
  {
    key: 'architecture',
    title: 'Architecture Explanation',
    icon: <Layers size={18} />,
    color: 'text-purple-400',
    gradient: 'from-purple-500/10 to-transparent',
    border: 'border-purple-500/20',
  },
  {
    key: 'components',
    title: 'Component Interaction',
    icon: <Puzzle size={18} />,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/10 to-transparent',
    border: 'border-emerald-500/20',
  },
  {
    key: 'setup',
    title: 'Setup Instructions',
    icon: <Terminal size={18} />,
    color: 'text-amber-400',
    gradient: 'from-amber-500/10 to-transparent',
    border: 'border-amber-500/20',
  },
];

// ── Markdown-lite renderer ─────────────────────────────────────────────────────

/**
 * Renders a very lightweight subset of markdown:
 * - **bold**, `inline code`, ```code blocks```, bullet lists, numbered lists
 * - Headings are not rendered explicitly (each section already has a heading)
 */
const renderMarkdown = (text) => {
  if (!text) return <p className="text-slate-500 italic">No content available.</p>;

  const lines = text.split('\n');
  const elements = [];
  let codeBlock = [];
  let inCode = false;

  lines.forEach((line, i) => {
    // Toggle fenced code blocks
    if (line.trim().startsWith('```')) {
      if (inCode) {
        elements.push(
          <pre
            key={`code-${i}`}
            className="bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-300 overflow-x-auto my-3 font-mono"
          >
            <code>{codeBlock.join('\n')}</code>
          </pre>
        );
        codeBlock = [];
      }
      inCode = !inCode;
      return;
    }

    if (inCode) {
      codeBlock.push(line);
      return;
    }

    // Skip empty lines
    if (!line.trim()) {
      elements.push(<div key={`br-${i}`} className="h-2" />);
      return;
    }

    // Bullet list
    if (/^[\s]*[•\-\*]\s/.test(line)) {
      const content = line.replace(/^[\s]*[•\-\*]\s/, '');
      elements.push(
        <div key={i} className="flex gap-2 ml-2 my-0.5">
          <span className="text-slate-500 mt-0.5 shrink-0">•</span>
          <span className="text-slate-300 leading-relaxed">{renderInline(content)}</span>
        </div>
      );
      return;
    }

    // Numbered list
    const numMatch = line.match(/^[\s]*(\d+)\.\s(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={i} className="flex gap-2 ml-2 my-0.5">
          <span className="text-slate-500 mt-0.5 shrink-0 font-mono text-xs w-5 text-right">
            {numMatch[1]}.
          </span>
          <span className="text-slate-300 leading-relaxed">{renderInline(numMatch[2])}</span>
        </div>
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-slate-300 leading-relaxed my-1">
        {renderInline(line)}
      </p>
    );
  });

  return <>{elements}</>;
};

/** Handles **bold** and `inline code` within a line */
const renderInline = (text) => {
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Inline code
    const codeMatch = remaining.match(/`([^`]+)`/);

    // Find which comes first
    const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity;
    const codeIdx = codeMatch ? remaining.indexOf(codeMatch[0]) : Infinity;

    if (boldIdx === Infinity && codeIdx === Infinity) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    if (boldIdx <= codeIdx) {
      if (boldIdx > 0) parts.push(<span key={key++}>{remaining.slice(0, boldIdx)}</span>);
      parts.push(
        <strong key={key++} className="text-white font-semibold">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldIdx + boldMatch[0].length);
    } else {
      if (codeIdx > 0) parts.push(<span key={key++}>{remaining.slice(0, codeIdx)}</span>);
      parts.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 bg-slate-700/70 text-emerald-300 rounded text-[13px] font-mono"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeIdx + codeMatch[0].length);
    }
  }

  return parts;
};

// ── Components ─────────────────────────────────────────────────────────────────

/** Single explanation section card */
const SectionCard = ({ section, content }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors">
    <div
      className={`px-5 py-3.5 border-b border-slate-700 bg-gradient-to-r ${section.gradient}`}
    >
      <h4 className="flex items-center gap-2.5 text-base font-semibold text-white">
        <span className={section.color}>{section.icon}</span>
        {section.title}
      </h4>
    </div>
    <div className="px-5 py-4">{renderMarkdown(content)}</div>
  </div>
);

/** Main AIExplanation component */
const AIExplanation = ({ data, loading, error, onGenerate }) => {
  // Not yet requested
  if (!data && !loading && !error) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 text-center">
        <Sparkles size={40} className="text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">AI Codebase Explanation</h3>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Generate a comprehensive, AI-powered explanation of this repository's purpose,
          architecture, components, and setup instructions.
        </p>
        <button
          onClick={onGenerate}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-500/20"
        >
          <Sparkles size={16} />
          Generate Explanation
        </button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 text-center">
        <div className="relative mx-auto w-16 h-16 mb-5">
          <div className="absolute inset-0 rounded-full border-2 border-slate-700" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
          <Sparkles size={24} className="absolute inset-0 m-auto text-blue-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-1">Analyzing codebase…</h3>
        <p className="text-slate-400 text-sm">
          Fetching repository data and generating AI explanation
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl text-sm mb-4">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
        <div className="text-center">
          <button
            onClick={onGenerate}
            className="inline-flex items-center gap-2 px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Success — render sections
  return (
    <div className="space-y-4">
      {/* Mock mode indicator */}
      {data._mock && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs">
          <AlertCircle size={14} />
          <span>
            Running in mock mode — set <code className="font-mono bg-slate-700/50 px-1 rounded">OPENAI_API_KEY</code> in your server's <code className="font-mono bg-slate-700/50 px-1 rounded">.env</code> for real AI analysis.
          </span>
        </div>
      )}

      {SECTIONS.map((section) => (
        <SectionCard key={section.key} section={section} content={data[section.key]} />
      ))}
    </div>
  );
};

export default AIExplanation;
