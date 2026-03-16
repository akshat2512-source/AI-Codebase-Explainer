import React from 'react';
import {
  Globe,
  Server,
  Database,
  Package,
  Wrench,
  Code2,
  AlertCircle,
} from 'lucide-react';

// ── Technology color/icon mapping ──────────────────────────────────────────────

const TECH_COLORS = {
  // Languages
  JavaScript:   'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
  TypeScript:   'bg-blue-500/15 text-blue-300 border-blue-500/25',
  Python:       'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  Java:         'bg-red-500/15 text-red-300 border-red-500/25',
  Go:           'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  Rust:         'bg-orange-500/15 text-orange-300 border-orange-500/25',
  Ruby:         'bg-red-500/15 text-red-300 border-red-500/25',
  PHP:          'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
  C:            'bg-slate-500/15 text-slate-300 border-slate-500/25',
  'C++':        'bg-blue-500/15 text-blue-300 border-blue-500/25',
  'C#':         'bg-purple-500/15 text-purple-300 border-purple-500/25',
  Swift:        'bg-orange-500/15 text-orange-300 border-orange-500/25',
  Kotlin:       'bg-purple-500/15 text-purple-300 border-purple-500/25',
  Shell:        'bg-green-500/15 text-green-300 border-green-500/25',
  HTML:         'bg-orange-500/15 text-orange-300 border-orange-500/25',
  CSS:          'bg-blue-500/15 text-blue-300 border-blue-500/25',
  SCSS:         'bg-pink-500/15 text-pink-300 border-pink-500/25',

  // Frameworks
  React:        'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  'Vue.js':     'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  Angular:      'bg-red-500/15 text-red-300 border-red-500/25',
  Svelte:       'bg-orange-500/15 text-orange-300 border-orange-500/25',
  'Next.js':    'bg-white/10 text-white border-white/20',
  'Nuxt.js':    'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  'Express.js': 'bg-slate-500/15 text-slate-300 border-slate-500/25',
  'Node.js':    'bg-green-500/15 text-green-300 border-green-500/25',
  'Tailwind CSS':'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  Vite:         'bg-purple-500/15 text-purple-300 border-purple-500/25',

  // Databases
  MongoDB:      'bg-green-500/15 text-green-300 border-green-500/25',
  PostgreSQL:   'bg-blue-500/15 text-blue-300 border-blue-500/25',
  MySQL:        'bg-orange-500/15 text-orange-300 border-orange-500/25',
  Redis:        'bg-red-500/15 text-red-300 border-red-500/25',
  Firebase:     'bg-amber-500/15 text-amber-300 border-amber-500/25',

  // DevOps
  Docker:       'bg-blue-500/15 text-blue-300 border-blue-500/25',
  'GitHub Actions': 'bg-slate-500/15 text-slate-300 border-slate-500/25',
  Vercel:       'bg-white/10 text-white border-white/20',
  ESLint:       'bg-purple-500/15 text-purple-300 border-purple-500/25',
  Jest:         'bg-red-500/15 text-red-300 border-red-500/25',
};

const DEFAULT_COLOR = 'bg-slate-500/15 text-slate-300 border-slate-500/25';

/** Returns the Tailwind classes for a technology name */
const getTechColor = (name) => TECH_COLORS[name] || DEFAULT_COLOR;

// ── Category definitions ───────────────────────────────────────────────────────

const CATEGORIES = [
  {
    key: 'languages',
    label: 'Languages',
    icon: <Code2 size={18} />,
    color: 'text-yellow-400',
    gradient: 'from-yellow-500/10 to-transparent',
  },
  {
    key: 'frameworks',
    label: 'Frontend & Frameworks',
    icon: <Globe size={18} />,
    color: 'text-cyan-400',
    gradient: 'from-cyan-500/10 to-transparent',
  },
  {
    key: 'backend',
    label: 'Backend',
    icon: <Server size={18} />,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/10 to-transparent',
  },
  {
    key: 'database',
    label: 'Database',
    icon: <Database size={18} />,
    color: 'text-blue-400',
    gradient: 'from-blue-500/10 to-transparent',
  },
  {
    key: 'devTools',
    label: 'DevOps & Tooling',
    icon: <Wrench size={18} />,
    color: 'text-purple-400',
    gradient: 'from-purple-500/10 to-transparent',
  },
];

// ── Components ─────────────────────────────────────────────────────────────────

/** Single technology badge */
const TechBadge = ({ name }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all hover:scale-105 ${getTechColor(name)}`}
  >
    {name}
  </span>
);

/** Category card */
const CategoryCard = ({ category, items }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors">
    {/* Header with gradient accent */}
    <div className={`px-5 py-3.5 border-b border-slate-700 bg-gradient-to-r ${category.gradient}`}>
      <h4 className="flex items-center gap-2.5 text-sm font-semibold text-white">
        <span className={category.color}>{category.icon}</span>
        {category.label}
        <span className="ml-auto text-xs text-slate-500 font-normal">
          {items.length} detected
        </span>
      </h4>
    </div>

    {/* Body */}
    <div className="px-5 py-4">
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((tech) => (
            <TechBadge key={tech} name={tech} />
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-sm italic">No technologies detected</p>
      )}
    </div>
  </div>
);

/** Package manager display */
const PackageManagerCard = ({ manager }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors">
    <div className="px-5 py-3.5 border-b border-slate-700 bg-gradient-to-r from-orange-500/10 to-transparent">
      <h4 className="flex items-center gap-2.5 text-sm font-semibold text-white">
        <span className="text-orange-400"><Package size={18} /></span>
        Package Manager
      </h4>
    </div>
    <div className="px-5 py-4">
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border bg-orange-500/15 text-orange-300 border-orange-500/25">
        {manager}
      </span>
    </div>
  </div>
);

/** Main TechStackCard component */
const TechStackCard = ({ techStack }) => {
  if (!techStack) return null;

  // Check if anything was detected at all
  const totalDetected =
    (techStack.languages?.length || 0) +
    (techStack.frameworks?.length || 0) +
    (techStack.backend?.length || 0) +
    (techStack.database?.length || 0) +
    (techStack.devTools?.length || 0);

  if (totalDetected === 0 && (!techStack.packageManager || techStack.packageManager === 'Unknown')) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 text-center">
        <AlertCircle size={40} className="text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400">
          No technologies could be detected for this repository.
        </p>
        <p className="text-slate-500 text-sm mt-2">
          The repository may use an uncommon stack or has limited metadata.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => {
          const items = techStack[cat.key] || [];
          return <CategoryCard key={cat.key} category={cat} items={items} />;
        })}
        {techStack.packageManager && techStack.packageManager !== 'Unknown' && (
          <PackageManagerCard manager={techStack.packageManager} />
        )}
      </div>
    </div>
  );
};

export default TechStackCard;
