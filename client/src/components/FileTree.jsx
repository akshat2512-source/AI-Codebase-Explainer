import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, AlertTriangle } from 'lucide-react';

/**
 * Converts a flat list of { path, type, size } entries into a nested tree structure.
 *
 * Example input:  [{ path: "src/App.jsx", type: "blob" }, { path: "src", type: "tree" }]
 * Example output: [{ name: "src", type: "tree", children: [{ name: "App.jsx", type: "blob", ... }] }]
 */
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

  /** Recursively convert the object map into a sorted array */
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
      // Folders first, then files, alphabetical within each group
      .sort((a, b) => {
        if (a.type === 'tree' && b.type !== 'tree') return -1;
        if (a.type !== 'tree' && b.type === 'tree') return 1;
        return a.name.localeCompare(b.name);
      });
  };

  return toArray(root);
};

/**
 * Returns a color class based on file extension.
 */
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

/** Single tree node (recursive) */
const TreeNode = ({ node, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(depth < 1); // Auto-expand first level
  const isFolder = node.type === 'tree' || node.children;
  const paddingLeft = 12 + depth * 18;

  return (
    <div>
      <button
        onClick={() => isFolder && setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-1.5 py-1 px-2 text-sm rounded-md transition-colors hover:bg-slate-700/50 ${
          isFolder ? 'cursor-pointer' : 'cursor-default'
        }`}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        {isFolder ? (
          <>
            {isOpen ? (
              <ChevronDown size={14} className="text-slate-500 shrink-0" />
            ) : (
              <ChevronRight size={14} className="text-slate-500 shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen size={15} className="text-amber-400 shrink-0" />
            ) : (
              <Folder size={15} className="text-amber-400 shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 shrink-0" /> {/* spacer to align with chevrons */}
            <File size={15} className={`${getFileColor(node.name)} shrink-0`} />
          </>
        )}
        <span className={`truncate ${isFolder ? 'text-slate-200 font-medium' : 'text-slate-300'}`}>
          {node.name}
        </span>
      </button>

      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

/** Main FileTree component */
const FileTree = ({ treeData }) => {
  const hierarchy = useMemo(() => {
    if (!treeData?.tree) return [];
    return buildHierarchy(treeData.tree);
  }, [treeData]);

  if (!treeData) return null;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700 bg-slate-800/80">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Folder size={18} className="text-amber-400" /> File Explorer
        </h3>
        <span className="text-xs text-slate-400">
          <span className="font-medium text-slate-300">{treeData.totalFiles}</span> files
        </span>
      </div>

      {treeData.truncated && (
        <div className="flex items-center gap-2 px-5 py-2 bg-amber-500/5 border-b border-amber-500/10 text-amber-400 text-xs">
          <AlertTriangle size={14} />
          <span>Showing first 2,000 files (repository truncated)</span>
        </div>
      )}

      <div className="max-h-[500px] overflow-y-auto p-2 custom-scrollbar">
        {hierarchy.length > 0 ? (
          hierarchy.map((node) => <TreeNode key={node.path} node={node} depth={0} />)
        ) : (
          <p className="text-slate-500 text-sm text-center py-6">No files found</p>
        )}
      </div>
    </div>
  );
};

export default FileTree;
