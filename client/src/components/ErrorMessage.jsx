import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Reusable error message with optional retry button.
 *
 * @param {{ message: string, onRetry?: () => void, className?: string }} props
 */
const ErrorMessage = ({ message, onRetry, className = '' }) => {
  // Map common backend messages to friendly user-facing text
  const friendly = friendlyMessage(message);

  return (
    <div
      className={`flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl text-sm ${className}`}
    >
      <AlertCircle size={20} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <p>{friendly}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
        >
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
};

/** Map raw error strings to friendly messages. */
function friendlyMessage(msg) {
  if (!msg) return 'Something went wrong. Please try again.';
  const lower = msg.toLowerCase();
  if (lower.includes('rate limit')) return 'GitHub API rate limit reached. Please wait a minute and try again.';
  if (lower.includes('not found')) return 'Repository not found. Please check the URL and try again.';
  if (lower.includes('network') || lower.includes('econnrefused'))
    return 'Unable to connect to the server. Please check your connection.';
  if (lower.includes('ai') || lower.includes('openai'))
    return 'AI service temporarily unavailable. Please try again in a moment.';
  if (lower.includes('timeout')) return 'The request timed out. Please try again.';
  return msg;
}

export default ErrorMessage;
