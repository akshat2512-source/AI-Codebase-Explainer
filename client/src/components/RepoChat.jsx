import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader, MessageSquare, AlertCircle } from 'lucide-react';

const RepoChat = ({ repoContext, onSend }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const question = input.trim();
    if (!question || sending) return;

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');
    setSending(true);

    try {
      const result = await onSend(question, repoContext);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.answer, _mock: result._mock },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'error',
          content: err.response?.data?.message || 'Failed to get answer. Please try again.',
        },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // No context yet — prompt to analyze first
  if (!repoContext) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 text-center">
        <MessageSquare size={40} className="text-cyan-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Repository Chat</h3>
        <p className="text-slate-400 max-w-md mx-auto">
          Analyze a repository first, then come here to ask questions about its codebase.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden flex flex-col" style={{ height: '550px' }}>
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-700 bg-slate-800/80 shrink-0">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <MessageSquare size={16} className="text-cyan-400" /> Repository Chat
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">
          Ask questions about {repoContext.repoName || 'this repository'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot size={36} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              Ask anything about the repository — architecture, setup, APIs, or how specific features work.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {[
                'How does authentication work?',
                'Explain the folder structure',
                'How to set up locally?',
                'What APIs are available?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-1.5 bg-slate-700/50 border border-slate-600 text-slate-300 text-xs rounded-full hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role !== 'user' && (
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-cyan-500/10 text-cyan-400'
                }`}
              >
                {msg.role === 'error' ? <AlertCircle size={16} /> : <Bot size={16} />}
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : msg.role === 'error'
                    ? 'bg-red-500/10 border border-red-500/20 text-red-300 rounded-bl-md'
                    : 'bg-slate-700/50 border border-slate-600 text-slate-200 rounded-bl-md'
              }`}
            >
              <MessageContent content={msg.content} />
              {msg._mock && (
                <p className="text-[10px] text-amber-400/60 mt-2">Mock mode — set OPENAI_API_KEY for real AI</p>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-slate-700/50 border border-slate-600 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader size={14} className="animate-spin" /> Thinking…
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-slate-700 px-4 py-3 flex gap-3 shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the repository…"
          disabled={sending}
          className="flex-1 bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-600/30 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 text-sm font-medium"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

/** Simple markdown-lite renderer for chat messages */
const MessageContent = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />;

        // Bullet
        if (/^[\s]*[•\-\*]\s/.test(line)) {
          const text = line.replace(/^[\s]*[•\-\*]\s/, '');
          return (
            <div key={i} className="flex gap-1.5 ml-1">
              <span className="text-slate-500 shrink-0">•</span>
              <span>{renderInline(text)}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = line.match(/^(\d+)\.\s(.*)$/);
        if (numMatch) {
          return (
            <div key={i} className="flex gap-1.5 ml-1">
              <span className="text-slate-500 shrink-0 font-mono text-xs">{numMatch[1]}.</span>
              <span>{renderInline(numMatch[2])}</span>
            </div>
          );
        }

        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
};

/** Renders **bold** and `code` */
const renderInline = (text) => {
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`([^`]+)`/);
    const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity;
    const codeIdx = codeMatch ? remaining.indexOf(codeMatch[0]) : Infinity;

    if (boldIdx === Infinity && codeIdx === Infinity) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    if (boldIdx <= codeIdx) {
      if (boldIdx > 0) parts.push(<span key={key++}>{remaining.slice(0, boldIdx)}</span>);
      parts.push(<strong key={key++} className="text-white font-semibold">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldIdx + boldMatch[0].length);
    } else {
      if (codeIdx > 0) parts.push(<span key={key++}>{remaining.slice(0, codeIdx)}</span>);
      parts.push(
        <code key={key++} className="px-1 py-0.5 bg-slate-600/50 text-emerald-300 rounded text-[12px] font-mono">
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeIdx + codeMatch[0].length);
    }
  }

  return parts;
};

export default RepoChat;
