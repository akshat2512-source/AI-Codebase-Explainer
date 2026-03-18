import React, { useMemo, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Network, AlertCircle } from 'lucide-react';

// Custom Node Component for a modern glass look
const CustomNode = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-xl rounded-xl glass border border-white/10 min-w-[150px] text-center bg-[#0a0f1a]/80 group hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all">
      <div className="font-bold text-sm tracking-wide text-white group-hover:text-indigo-300 transition-colors">
        {data.label}
      </div>
      {data.type && (
        <div className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-widest bg-white/5 py-0.5 px-2 rounded-full inline-block">
          {data.type}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const DependencyGraph = ({ data, loading, error, onGenerate }) => {
  // If no data requested yet
  if (!data && !loading && !error) {
    return (
      <div className="glass border border-white/10 rounded-3xl p-16 text-center shadow-2xl relative overflow-hidden h-[500px] flex flex-col justify-center items-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-cyan-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-cyan-500/20 relative group">
            <div className="absolute inset-0 bg-cyan-500/20 rounded-3xl blur-xl group-hover:bg-cyan-500/30 transition-colors" />
            <Network size={40} className="text-cyan-400 relative z-10" />
          </div>
          <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Dependency Flow</h3>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed text-lg text-center">
            Visualize the architectural relationships and dependencies between major folders and components.
          </p>
          <button
            onClick={onGenerate}
            className="glow-btn bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-3 active:scale-95"
          >
            <Network size={20} />
            Generate Graph
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass border border-white/10 rounded-3xl p-16 text-center shadow-2xl h-[500px] flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <Network size={32} className="absolute inset-0 m-auto text-cyan-400 animate-pulse" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Mapping Relationships...</h3>
        <p className="text-slate-400 text-lg">Analyzing codebase architecture and generating nodes.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass border border-red-500/20 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden bg-red-500/5 h-[500px] flex flex-col justify-center items-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
          <AlertCircle size={32} className="text-red-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">Graph Generation Failed</h3>
        <p className="text-red-300 max-w-md mx-auto mb-8 bg-red-500/10 p-4 rounded-xl border border-red-500/20 backdrop-blur-md">
          {error}
        </p>
        <button
          onClick={onGenerate}
          className="glow-btn bg-white text-slate-900 font-bold px-8 py-3 rounded-xl transition-all hover:bg-slate-200"
        >
          Retry Mapping
        </button>
      </div>
    );
  }

  // Very basic translation of Mermaid relationships to React Flow nodes/edges
  // Note: Since standard Mermaid string parsing into directed graphs is complex,
  // we will construct a mock/fallback tree if the backend didn't provide structured JSON.
  // Real implementation would ideally return structured data from the API.

  const parsedGraph = useMemo(() => {
    // If backend already returns nodes/edges in JSON
    if (data?.nodes && data?.edges) return data;

    // Fallback pseudo-parser for basic 'A --> B' mermaid syntax
    const mockNodes = [];
    const mockEdges = [];
    const nodeSet = new Set();
    let yPos = 100;

    if (data?.mermaid) {
      const lines = data.mermaid.split('\n');
      lines.forEach((line, index) => {
        const match = line.match(/([A-Za-z0-9_]+)\s*(?:-->|==>|\.-|-.->)\s*([A-Za-z0-9_]+)/);
        if (match) {
          const source = match[1];
          const target = match[2];

          if (!nodeSet.has(source)) {
            mockNodes.push({ id: source, type: 'custom', data: { label: source }, position: { x: (nodeSet.size % 3) * 250, y: yPos } });
            nodeSet.add(source);
            yPos += 50;
          }
          if (!nodeSet.has(target)) {
            mockNodes.push({ id: target, type: 'custom', data: { label: target }, position: { x: (nodeSet.size % 3) * 250, y: yPos + 100 } });
            nodeSet.add(target);
          }

          mockEdges.push({
            id: `e-${source}-${target}-${index}`,
            source,
            target,
            animated: true,
            style: { stroke: '#6366f1', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
          });
        }
      });
    }

    // Default mock graph if parser fails
    if (mockNodes.length === 0) {
      return {
        nodes: [
          { id: '1', type: 'custom', data: { label: 'Frontend App', type: 'React' }, position: { x: 250, y: 50 } },
          { id: '2', type: 'custom', data: { label: 'API Gateway', type: 'Express' }, position: { x: 250, y: 150 } },
          { id: '3', type: 'custom', data: { label: 'Auth Service', type: 'JWT' }, position: { x: 100, y: 300 } },
          { id: '4', type: 'custom', data: { label: 'Database', type: 'MongoDB' }, position: { x: 400, y: 300 } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#4f46e5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#4f46e5' } },
          { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#06b6d4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' } },
          { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#10b981' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
        ]
      }
    }

    return { nodes: mockNodes, edges: mockEdges };
  }, [data]);

  return (
    <div className="glass border border-white/10 rounded-3xl shadow-2xl overflow-hidden h-[600px] relative">
      <div className="absolute top-4 left-6 z-10 pointer-events-none">
        <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Network size={20} className="text-indigo-400" /> Dependency Graph
        </h3>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mt-1">Interactive Architecture</p>
      </div>

      <ReactFlow
        nodes={parsedGraph.nodes}
        edges={parsedGraph.edges}
        nodeTypes={nodeTypes}
        fitView
        className="bg-[#0a0f1a]"
      >
        <Background color="#ffffff" gap={16} opacity={0.05} />
        <Controls className="!bg-[#0a0f1a]/80 !border-white/10 !rounded-xl !text-white overflow-hidden glass" />
        <MiniMap 
          nodeColor="#4f46e5" 
          maskColor="rgba(10, 15, 26, 0.7)" 
          className="!bg-[#0a0f1a] !border-white/10 !rounded-xl overflow-hidden glass" 
        />
      </ReactFlow>
    </div>
  );
};

export default DependencyGraph;
