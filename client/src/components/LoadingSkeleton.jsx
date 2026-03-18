import React from 'react';

/**
 * Animated pulse-skeleton placeholder.
 *
 * Variants:
 *  - "card"       → single rounded card
 *  - "list"       → multiple rows (good for dashboard)
 *  - "text"       → several text lines
 *  - "stats"      → 3-column stats grid
 */
const LoadingSkeleton = ({ variant = 'card', count = 3 }) => {
  if (variant === 'stats') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 p-6 rounded-xl flex items-center gap-5">
            <div className="w-14 h-14 bg-slate-700 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-700 rounded w-24" />
              <div className="h-7 bg-slate-700 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden animate-pulse">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className={`p-5 flex items-center gap-4 ${i > 0 ? 'border-t border-slate-700' : ''}`}
          >
            <div className="w-10 h-10 rounded-full bg-slate-700 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-700 rounded w-48" />
              <div className="h-3 bg-slate-700 rounded w-32" />
            </div>
            <div className="h-6 w-20 bg-slate-700 rounded-full hidden sm:block" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className="h-4 bg-slate-700 rounded"
            style={{ width: `${70 + Math.random() * 30}%` }}
          />
        ))}
      </div>
    );
  }

  // Default: card
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-3">
          <div className="h-5 bg-slate-700 rounded w-2/3" />
          <div className="h-4 bg-slate-700 rounded w-full" />
          <div className="h-4 bg-slate-700 rounded w-4/5" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
