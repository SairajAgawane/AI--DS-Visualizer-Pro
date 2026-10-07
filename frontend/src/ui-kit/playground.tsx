import React, { useState } from 'react';
import { Button, Badge } from './primitives';

/* ============================================================
   6. PLAYGROUND CANVAS COMPONENT
   Interactive preview canvas: split-view execution, viewport switchers
   (desktop/tablet/mobile), console logger, and runtime controls.
   ============================================================ */

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

interface PlaygroundProps {
  canvasContent?: React.ReactNode;
  onRun?: () => void;
  onStep?: () => void;
  onReset?: () => void;
}

export const Playground: React.FC<PlaygroundProps> = ({
  canvasContent,
  onRun,
  onStep,
  onReset,
}) => {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [logs, setLogs] = useState<string[]>([
    '[INIT] Workspace execution runtime loaded.',
    '[RUNTIME] Memory space allocated: 256MB simulated heap.',
    '[TRACE] Initialized contiguous array at 0x1000.',
  ]);

  const viewportWidths = {
    desktop: 'w-full',
    tablet: 'max-w-2xl',
    mobile: 'max-w-sm',
  }[viewport];

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Playground Controls Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 select-none">
        {/* Runtime Control Action Group */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="primary" onClick={onRun}>
            ▶ Run Trace
          </Button>
          <Button size="sm" variant="secondary" onClick={onStep}>
            ⏭ Step
          </Button>
          <Button size="sm" variant="ghost" onClick={onReset}>
            ↻ Reset
          </Button>
        </div>

        {/* Viewport Switcher Buttons */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          {(['desktop', 'tablet', 'mobile'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewport(mode)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md capitalize transition-colors ${
                viewport === mode
                  ? 'bg-slate-800 text-cyan-400 font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <Badge color="green">Ready</Badge>
        </div>
      </div>

      {/* Main Execution Canvas Body */}
      <div className="flex-1 bg-slate-950/60 flex items-center justify-center p-4 overflow-auto">
        <div
          className={`${viewportWidths} h-full min-h-[300px] border border-slate-800/80 bg-slate-900/40 rounded-xl shadow-xl p-4 flex flex-col items-center justify-center transition-all duration-300 relative`}
        >
          {canvasContent || (
            <div className="text-center">
              <span className="text-3xl mb-2 block">⊞</span>
              <p className="text-xs text-slate-400 font-mono">Visualizer Canvas Viewport ({viewport})</p>
              <p className="text-[11px] text-slate-600 mt-1">Live execution elements will render here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Console Logger */}
      <div className="h-36 bg-slate-900/90 border-t border-slate-800 flex flex-col font-mono text-xs">
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800/60 text-[11px] text-slate-400">
          <span>RUNTIME CONSOLE</span>
          <button
            onClick={() => setLogs([])}
            className="hover:text-slate-200 text-[10px] uppercase font-bold"
          >
            Clear
          </button>
        </div>
        <div className="flex-1 p-3 overflow-y-auto space-y-1 text-slate-300">
          {logs.map((log, idx) => (
            <div key={idx} className="leading-5">
              <span className="text-cyan-400 font-bold">&gt;</span> {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
