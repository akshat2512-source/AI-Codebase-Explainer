import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Copy, Check, ZoomIn, ZoomOut, RotateCcw, Loader, Network, AlertCircle } from 'lucide-react';

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#3b82f6',
    primaryTextColor: '#f1f5f9',
    primaryBorderColor: '#475569',
    lineColor: '#64748b',
    secondaryColor: '#1e293b',
    tertiaryColor: '#0f172a',
    fontSize: '14px',
  },
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
    padding: 15,
  },
  securityLevel: 'loose',
});

const ArchitectureDiagram = ({ data, loading, error, onGenerate }) => {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const [renderError, setRenderError] = useState('');

  useEffect(() => {
    if (!data?.diagram || !containerRef.current) return;

    const render = async () => {
      try {
        setRenderError('');
        containerRef.current.innerHTML = '';
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, data.diagram);
        containerRef.current.innerHTML = svg;

        // Make SVG responsive
        const svgEl = containerRef.current.querySelector('svg');
        if (svgEl) {
          svgEl.style.maxWidth = '100%';
          svgEl.style.height = 'auto';
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        setRenderError('Failed to render diagram. The generated syntax may be invalid.');
      }
    };

    render();
  }, [data?.diagram]);

  const handleCopy = () => {
    if (data?.diagram) {
      navigator.clipboard.writeText(data.diagram);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Not yet requested
  if (!data && !loading && !error) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 text-center">
        <Network size={40} className="text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Architecture Diagram</h3>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Generate a visual architecture diagram from the detected tech stack and folder structure.
        </p>
        <button
          onClick={onGenerate}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-all active:scale-95 shadow-lg shadow-purple-500/20"
        >
          <Network size={16} />
          Generate Diagram
        </button>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 text-center">
        <Loader size={32} className="text-purple-400 mx-auto mb-4 animate-spin" />
        <h3 className="text-lg font-medium text-white mb-1">Generating diagram…</h3>
        <p className="text-slate-400 text-sm">Analyzing repository architecture</p>
      </div>
    );
  }

  // Error
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

  // Diagram rendered
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700 bg-slate-800/80">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Network size={16} className="text-purple-400" /> Architecture Diagram
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs text-slate-500 w-12 text-center font-mono">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Reset zoom"
          >
            <RotateCcw size={16} />
          </button>
          <div className="w-px h-5 bg-slate-700 mx-1" />
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>

      {/* Diagram container */}
      <div className="overflow-auto p-6" style={{ maxHeight: '600px' }}>
        {renderError ? (
          <div className="text-red-400 text-sm text-center py-4">{renderError}</div>
        ) : (
          <div
            ref={containerRef}
            className="flex justify-center transition-transform duration-200"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          />
        )}
      </div>

      {/* Raw code preview */}
      {data?.diagram && (
        <details className="border-t border-slate-700">
          <summary className="px-5 py-3 text-xs text-slate-400 hover:text-slate-300 cursor-pointer select-none">
            View Mermaid Source
          </summary>
          <pre className="px-5 pb-4 text-xs text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap">
            {data.diagram}
          </pre>
        </details>
      )}
    </div>
  );
};

export default ArchitectureDiagram;
