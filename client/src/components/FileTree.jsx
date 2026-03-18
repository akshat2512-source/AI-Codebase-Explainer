import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const buildHierarchy = (flatList) => {
  const root = {};

  flatList.forEach((item) => {
    const parts = item.path.split('/');
    let current = root;

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = {
          __meta: {
            name: part,
            type: index === parts.length - 1 ? item.type : 'tree',
            size: index === parts.length - 1 ? item.size : 0,
            path: parts.slice(0, index + 1).join('/'),
          },
        };
      }
      current = current[part];
    });
  });

  const toArray = (node) => {
    return Object.keys(node)
      .filter((key) => key !== '__meta')
      .map((key) => {
        const child = node[key];
        const meta = child.__meta;
        const children = toArray(child);
        return {
          name: meta.name,
          type: meta.type,
          size: meta.size,
          path: meta.path,
          children: children.length > 0 ? children : undefined,
        };
      })
      .sort((a, b) => {
        if (a.type === 'tree' && b.type !== 'tree') return -1;
        if (a.type !== 'tree' && b.type === 'tree') return 1;
        return a.name.localeCompare(b.name);
      });
  };

  return toArray(root);
};

const getFileColor = (name) => {
  const ext = name.split('.').pop()?.toLowerCase();
  const colors = {
    js: 'text-yellow-400', jsx: 'text-yellow-400',
    ts: 'text-blue-400', tsx: 'text-blue-400',
    css: 'text-purple-400', scss: 'text-purple-400',
    html: 'text-orange-400',
    json: 'text-green-400',
    md: 'text-slate-300',
    py: 'text-emerald-400',
    java: 'text-red-400',
    go: 'text-cyan-400',
    rs: 'text-orange-500',
    rb: 'text-red-500',
    php: 'text-indigo-400',
    yml: 'text-pink-400', yaml: 'text-pink-400',
    toml: 'text-pink-300',
  };
  return colors[ext] || 'text-slate-400';
};

const TreeNode = ({ node, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(depth < 1);
  const isFolder = node.type === 'tree' || node.children;
  const paddingLeft = 16 + depth * 20;

  return (
    <div>
      <button
        onClick={() => isFolder && setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-2 py-1.5 px-3 text-sm rounded-lg transition-all duration-200 outline-none
          ${isFolder ? 'cursor-pointer hover:bg-white/5 active:bg-white/10' : 'cursor-default hover:bg-white/5'}
        `}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        {isFolder ? (
          <motion.div 
            animate={{ rotate: isOpen ? 90 : 0 }} 
            transition={{ duration: 0.2 }}
            className="shrink-0"
          >
            <ChevronRight size={14} className="text-slate-500" />
          </motion.div>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        
        {isFolder ? (
          <motion.div layout className="shrink-0">
             {isOpen ? <FolderOpen size={16} className="text-indigo-400" /> : <Folder size={16} className="text-indigo-400" />}
          </motion.div>
        ) : (
          <File size={16} className={`${getFileColor(node.name)} shrink-0`} />
        )}
        
        <span className={`truncate tracking-wide ${isFolder ? 'text-slate-200 font-bold' : 'text-slate-400 font-medium'}`}>
          {node.name}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isFolder && isOpen && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <TreeNode key={child.path} node={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FileTree = ({ treeData }) => {
  const hierarchy = useMemo(() => {
    if (!treeData?.tree) return [];
    return buildHierarchy(treeData.tree);
  }, [treeData]);

  if (!treeData) return null;

  return (
    <div className="glass border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-xl relative z-10">
        <h3 className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
          <Folder size={20} className="text-indigo-400" /> Project Structure
        </h3>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
          <span className="text-indigo-300">{treeData.totalFiles}</span> Files
        </span>
      </div>

      {treeData.truncated && (
        <div className="flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wide relative z-10">
          <AlertTriangle size={14} className="animate-pulse" />
          <span>Showing first 2,000 files (Truncated)</span>
        </div>
      )}

      <div className="max-h-[600px] overflow-y-auto p-3 custom-scrollbar relative z-10 bg-[#0a0f1a]/40">
        {hierarchy.length > 0 ? (
          hierarchy.map((node) => <TreeNode key={node.path} node={node} depth={0} />)
        ) : (
          <div className="text-center py-12">
             <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
               <FolderOpen size={24} className="text-slate-500" />
             </div>
             <p className="text-slate-400 font-medium">No files found in this repository.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileTree;
