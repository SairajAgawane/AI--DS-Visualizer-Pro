import React, { useState } from 'react';

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000');

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    chapterId?: string;
    programName?: string;
    language?: string;
    code?: string;
    error?: string | null;
    operation?: string;
    complexity?: any;
    contextState?: any;
  };
}

type Message = {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
};

export const AICopilotModal: React.FC<AICopilotModalProps> = ({ isOpen, onClose, context }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello! I am your AI Student Copilot. I'm context-aware and ready to help you master ${context?.chapterId ? context.chapterId.toUpperCase() : 'Data Structures & Algorithms'}. How can I assist your learning right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsThinking(true);

    try {
      const res = await fetch(`${API}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context_ds: context?.chapterId || 'stack',
          context_state: context?.contextState ?? null,
          complexity: context?.complexity?.timeAverage || '',
        }),
      });
      const data = await res.json();
      const reply = data?.response || data?.message || 'AI service is temporarily unavailable. Please try again.';
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: 'AI service is temporarily unavailable. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const quickActions = [
    { label: 'Explain Topic', icon: '📚', key: 'explain_topic' },
    { label: 'Explain My Code', icon: '💻', key: 'explain_code' },
    { label: 'Debug My Code', icon: '🐛', key: 'debug_code' },
    { label: 'Give Me a Hint', icon: '💡', key: 'hint' },
    { label: 'Explain Visualization', icon: '🔍', key: 'explain_visual' },
    { label: 'Explain Complexity', icon: '⏱️', key: 'complexity' },
    { label: 'Generate Example', icon: '✨', key: 'example' },
    { label: 'Quiz Me', icon: '🎯', key: 'quiz' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050914]/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#0A1120] border border-[#24344A] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[650px] relative">
        <div className="flex items-center justify-between px-6 py-4 bg-[#101827] border-b border-[#24344A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <div className="w-full h-full bg-[#0A1120] rounded-[10px] flex items-center justify-center text-base">🤖</div>
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#F8FAFC]">AI Student Copilot</h3>
              <p className="text-[11px] text-[#22D3EE]">
                Context: <span className="font-mono">{context?.chapterId?.toUpperCase() || 'PLAYGROUND'}</span>
                {context?.language && ` • ${context.language.toUpperCase()}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#131D2D] hover:bg-[#24344A] text-[#64748B] hover:text-white flex items-center justify-center text-sm transition-colors">✕</button>
        </div>

        <div className="flex items-center gap-2 px-6 py-3 bg-[#0d1420] border-b border-[#24344A] overflow-x-auto select-none no-scrollbar">
          {quickActions.map((act) => (
            <button key={act.key} onClick={() => handleSendMessage(act.label, act.key)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131D2D] hover:bg-[#24344A] border border-[#24344A] hover:border-[#22D3EE]/50 text-xs font-medium text-[#CBD5E1] whitespace-nowrap transition-all">
              <span>{act.icon}</span><span>{act.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#050914]/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed font-sans ${msg.sender === 'user' ? 'bg-[#22D3EE] text-[#050914] font-medium rounded-tr-none' : 'bg-[#131D2D] text-[#F8FAFC] border border-[#24344A] rounded-tl-none shadow-md'}`}>
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div className={`text-[9px] mt-2 font-mono ${msg.sender === 'user' ? 'text-[#050914]/70' : 'text-[#64748B]'}`}>{msg.timestamp}</div>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex items-center gap-2 text-xs text-[#22D3EE] p-2 bg-[#131D2D]/40 rounded-lg w-fit border border-[#22D3EE]/20 animate-pulse">
              <span>🤖 Copilot is thinking...</span>
            </div>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-4 bg-[#101827] border-t border-[#24344A] flex items-center gap-3">
          <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Ask AI Copilot about DSA, code execution, or concepts..." className="flex-1 bg-[#050914] border border-[#24344A] rounded-xl py-3 px-4 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE] transition-colors" />
          <button type="submit" disabled={!inputText.trim() || isThinking} className="px-5 py-3 bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-bold text-xs rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-[0_0_15px_rgba(34,211,238,0.3)]">Send ➤</button>
        </form>
      </div>
    </div>
  );
};

export default AICopilotModal;