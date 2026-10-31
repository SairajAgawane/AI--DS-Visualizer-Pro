import React, { useState } from 'react';
import { Button } from './primitives';

/* ============================================================
   3. SHELL LAYOUT
   Global application shell: Collapsible sidebar navigation,
   top command bar/header, multi-panel workspace resizers, and breadcrumbs.
   ============================================================ */

interface ShellProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  copilotDrawer?: React.ReactNode;
  activePath?: string[];
}

export const Shell: React.FC<ShellProps> = ({
  children,
  sidebarContent,
  copilotDrawer,
  activePath = ['workspace', 'algorithm-stream.ts'],
}) => {
  const [copilotOpen, setCopilotOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* Primary Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } border-r border-slate-800 bg-slate-900/40 flex flex-col justify-between transition-all duration-200 p-3`}
      >
        <div className="flex flex-col gap-4">
          {/* Brand header */}
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                AG
              </div>
              {!sidebarCollapsed && <span className="font-bold text-sm tracking-tight text-white">Antigravity</span>}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800 text-xs"
              title="Toggle sidebar"
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1">
            {sidebarContent || (
              <>
                <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800/80 text-cyan-400 text-left border border-cyan-500/30">
                  <span>▣</span>
                  {!sidebarCollapsed && <span>Workspace</span>}
                </button>
                <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-850 hover:text-slate-200 text-left transition-colors">
                  <span>▶</span>
                  {!sidebarCollapsed && <span>Playground</span>}
                </button>
                <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-850 hover:text-slate-200 text-left transition-colors">
                  <span>⊞</span>
                  {!sidebarCollapsed && <span>Visualizer</span>}
                </button>
                <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-850 hover:text-slate-200 text-left transition-colors">
                  <span>⚙</span>
                  {!sidebarCollapsed && <span>Settings</span>}
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-2 border-t border-slate-800/80 text-xs text-slate-500 flex items-center justify-between">
          {!sidebarCollapsed && <span>v2.4.0-pro</span>}
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" title="Server active" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top Header Command Bar */}
        <header className="h-12 border-b border-slate-800 bg-slate-900/20 px-4 flex items-center justify-between">
          {/* Breadcrumb Layout */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            {activePath.map((segment, idx) => (
              <React.Fragment key={idx}>
                <span className={idx === activePath.length - 1 ? 'text-slate-200 font-semibold' : 'hover:text-slate-300'}>
                  {segment}
                </span>
                {idx < activePath.length - 1 && <span className="text-slate-600">/</span>}
              </React.Fragment>
            ))}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setCopilotOpen(!copilotOpen)}>
              {copilotOpen ? 'Hide Copilot' : 'Open Copilot'}
            </Button>
            <Button size="sm" variant="primary">
              Run Trace
            </Button>
          </div>
        </header>

        {/* Content & Right Panel */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto p-4">{children}</div>

          {/* Copilot Drawer */}
          {copilotOpen && (
            <aside className="w-80 border-l border-slate-800 bg-slate-900/30 flex flex-col justify-between">
              {copilotDrawer}
            </aside>
          )}
        </div>
      </main>
    </div>
  );
};
