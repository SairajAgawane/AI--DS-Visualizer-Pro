import React, { useState } from 'react';
import { Button, Badge } from './primitives';

/* ============================================================
   4. EDITOR CANVAS COMPONENT
   Code/Text canvas area with tab management, line gutters,
   minimap placeholder, toolbar actions, and status indicators.
   ============================================================ */

export interface EditorTab {
  id: string;
  name: string;
  isModified?: boolean;
}

interface EditorProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  language?: string;
  activeLine?: number;
}

export const Editor: React.FC<EditorProps> = ({
  initialCode = `# Binary Search implementation\ndef binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1`,
  onCodeChange,
  language = 'python',
  activeLine = 5,
}) => {
  const [tabs, setTabs] = useState<EditorTab[]>([
    { id: '1', name: 'main.py', isModified: true },
    { id: '2', name: 'test_cases.json', isModified: false },
    { id: '3', name: 'schema.sql', isModified: false },
  ]);
  const [activeTab, setActiveTab] = useState('1');
  const [code, setCode] = useState(initialCode);

  const lines = code.split('\n');

  const handleTextChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Tab Bar */}
      <div className="flex items-center justify-between bg-slate-900/60 border-b border-slate-800 px-2 select-none">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs border-b-2 font-mono transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-500 bg-slate-900 text-slate-100 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <span>{tab.name}</span>
              {tab.isModified && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pr-2">
          <Badge color="cyan">{language.toUpperCase()}</Badge>
          <Button size="sm" variant="ghost">Format</Button>
        </div>
      </div>

      {/* Editor Canvas Area */}
      <div className="flex-1 flex overflow-hidden font-mono text-xs relative">
        {/* Line Gutters */}
        <div className="w-12 bg-slate-950/90 border-r border-slate-800/80 py-3 select-none flex flex-col text-right pr-3 text-slate-600">
          {lines.map((_, i) => (
            <div
              key={i}
              className={`leading-6 transition-colors ${
                activeLine === i + 1 ? 'text-cyan-400 font-bold bg-cyan-950/40' : ''
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={code}
          onChange={(e) => handleTextChange(e.target.value)}
          spellCheck={false}
          className="flex-1 bg-transparent p-3 text-slate-200 outline-none resize-none leading-6 font-mono selection:bg-cyan-900/40"
        />

        {/* Minimap Placeholder */}
        <div className="w-14 border-l border-slate-800/60 bg-slate-900/20 hidden md:flex flex-col py-2 px-1 select-none pointer-events-none opacity-30">
          {lines.slice(0, 30).map((l, i) => (
            <div key={i} className="h-1 bg-slate-500/40 my-0.5 rounded-sm" style={{ width: `${Math.min(l.length * 2, 40)}px` }} />
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-slate-900/90 border-t border-slate-800 px-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <span>Ln {lines.length}, Col 1</span>
          <span>UTF-8</span>
          <span>Tab Size: 4</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Language Server: Ready</span>
        </div>
      </div>
    </div>
  );
};
