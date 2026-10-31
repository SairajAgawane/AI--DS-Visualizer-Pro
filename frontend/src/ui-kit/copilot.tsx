import React, { useState } from 'react';
import { Button } from './primitives';
import type { CopilotMessage } from './types';

/* ============================================================
   5. COPILOT SIDEKICK DRAWER
   Context-aware AI sidekick drawer: chat thread, suggested prompt chips,
   code diff review cards, and inline action buttons.
   ============================================================ */

export interface CopilotDrawerProps {
  onApplyDiff?: (code: string) => void;
  activeContext?: string;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  onApplyDiff,
  activeContext = 'Array · Create Array',
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hello! I am your AI Copilot. I analyze your runtime traces and algorithm logic. How can I help you optimize or debug right now?',
      timestamp: 'Just now',
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Here is a suggested fix to optimize boundary checks for your contiguous memory traversal:',
      timestamp: '1m ago',
      codeSnippet: `def safe_traverse(arr):\n    for i in range(len(arr)):\n        yield arr[i]`,
    },
  ]);
  const [inputVal, setInputVal] = useState('');

  const suggestedChips = [
    'Explain complexity',
    'Generate test cases',
    'Optimize memory',
    'Find edge cases',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg: CopilotMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');

    setTimeout(() => {
      const botMsg: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I analyzed your request regarding "${text}". Based on the current ${activeContext} execution profile, the operation runs within optimal asymptotic bounds.`,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 justify-between">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">✨</span>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">AI Copilot</h4>
          </div>
          <span className="text-[10px] font-mono bg-cyan-950/60 border border-cyan-800 text-cyan-400 px-2 py-0.5 rounded">
            Live Agent
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1 truncate">Context: {activeContext}</p>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-xl p-3 leading-relaxed ${
                m.role === 'user'
                  ? 'bg-cyan-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
              }`}
            >
              <p>{m.content}</p>

              {/* Code diff review card */}
              {m.codeSnippet && (
                <div className="mt-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px]">
                  <pre className="text-cyan-300 overflow-x-auto p-1 leading-5">{m.codeSnippet}</pre>
                  {onApplyDiff && (
                    <div className="mt-2 flex justify-end">
                      <Button size="sm" variant="primary" onClick={() => onApplyDiff(m.codeSnippet!)}>
                        Apply Diff
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <span className="text-[9px] text-slate-500 block mt-1.5 font-mono">{m.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Prompt Chips & Input */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
        {/* Suggested Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {suggestedChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Copilot..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors"
          />
          <Button size="sm" variant="primary" onClick={() => handleSend()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export const Copilot = CopilotDrawer;
