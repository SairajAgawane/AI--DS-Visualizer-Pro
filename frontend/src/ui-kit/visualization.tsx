import React, { useState } from 'react';
import { Card, Button, Badge } from './primitives';
import type { VisualizationNode } from './types';

export const Visualization: React.FC = () => {
  const [zoom, setZoom] = useState<number>(100);
  const [selectedNode, setSelectedNode] = useState<VisualizationNode | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const initialNodes: VisualizationNode[] = [
    { id: 'node-0', label: 'Source Stream', value: '10.4k req/s', status: 'visited', position: { x: 50, y: 140 } },
    { id: 'node-1', label: 'Ingest Queue', value: 'Buffer: 34%', status: 'visited', position: { x: 230, y: 140 } },
    { id: 'node-2', label: 'Hash Partition', value: 'SHA-256', status: 'comparing', position: { x: 410, y: 80 } },
    { id: 'node-3', label: 'Worker Pool A', value: '8 Threads', status: 'active', position: { x: 590, y: 40 } },
    { id: 'node-4', label: 'Worker Pool B', value: '4 Threads', status: 'idle', position: { x: 590, y: 130 } },
    { id: 'node-5', label: 'Cache Sync', value: 'Redis Cluster', status: 'idle', position: { x: 410, y: 220 } },
    { id: 'node-6', label: 'ScyllaDB Sink', value: '1.2ms ACK', status: 'sorted', position: { x: 770, y: 90 } },
  ];

  const [nodes] = useState<VisualizationNode[]>(initialNodes);

  const statusColors: Record<string, { bg: string; border: string; glow: string; text: string; badge: 'cyan' | 'purple' | 'green' | 'amber' | 'rose' | 'slate' }> = {
    idle: {
      bg: 'bg-slate-900/80',
      border: 'border-slate-800',
      glow: '',
      text: 'text-slate-400',
      badge: 'slate',
    },
    active: {
      bg: 'bg-cyan-950/80',
      border: 'border-cyan-500',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.25)]',
      text: 'text-cyan-300',
      badge: 'cyan',
    },
    comparing: {
      bg: 'bg-purple-950/80',
      border: 'border-purple-500',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.25)]',
      text: 'text-purple-300',
      badge: 'purple',
    },
    visited: {
      bg: 'bg-emerald-950/80',
      border: 'border-emerald-500',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]',
      text: 'text-emerald-300',
      badge: 'green',
    },
    sorted: {
      bg: 'bg-blue-950/80',
      border: 'border-blue-500',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.25)]',
      text: 'text-blue-300',
      badge: 'cyan',
    },
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(180, Math.max(50, prev + delta)));
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="!p-3.5 bg-slate-900/60 border-slate-800 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Nodes Active</span>
            <Badge color="cyan" size="sm">LIVE</Badge>
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1">7 / 12</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Pipeline operational</p>
        </Card>

        <Card className="!p-3.5 bg-slate-900/60 border-slate-800 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Latency</span>
            <Badge color="green" size="sm">NORMAL</Badge>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">2.4 ms</div>
          <p className="text-[11px] text-slate-400 mt-0.5">p99: 4.8ms</p>
        </Card>

        <Card className="!p-3.5 bg-slate-900/60 border-slate-800 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Memory Heap</span>
            <Badge color="purple" size="sm">V8 ENGINE</Badge>
          </div>
          <div className="text-xl font-bold font-mono text-purple-300 mt-1">48.2 MB</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Max cap: 256MB</p>
        </Card>

        <Card className="!p-3.5 bg-slate-900/60 border-slate-800 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Flow Rate</span>
            <Badge color="cyan" size="sm">TX/SEC</Badge>
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">10,480/s</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Peak: 14.2k/s</p>
        </Card>
      </div>

      {/* Main Canvas Viewport */}
      <Card
        title="Execution Topology Canvas"
        subtitle="Dynamic visual node tree with reactive state inspection"
        className="flex-1 flex flex-col overflow-hidden min-h-[460px] relative bg-slate-950/70"
        action={
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <Button size="sm" variant="ghost" onClick={() => handleZoom(-10)} title="Zoom Out">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </Button>
              <span className="text-xs font-mono px-2 text-slate-400 min-w-[48px] text-center">
                {zoom}%
              </span>
              <Button size="sm" variant="ghost" onClick={() => handleZoom(10)} title="Zoom In">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Button>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setZoom(100)}>
              Reset
            </Button>
          </div>
        }
      >
        {/* Playback Step Controller Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border border-slate-800/80 rounded-lg mb-4 text-xs">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isPlaying ? 'danger' : 'primary'}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <>
                  <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Animate Flow
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setActiveStep((prev) => (prev % 5) + 1)}
            >
              Step Forward ({activeStep}/5)
            </Button>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Stream Connected
            </span>
            <span className="text-slate-600">|</span>
            <span>Viewport: Interactive Panning</span>
          </div>
        </div>

        {/* Panning / Zooming Container */}
        <div className="flex-1 overflow-auto border border-slate-900 rounded-lg bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] relative min-h-[340px]">
          <div
            className="transition-transform duration-200 origin-top-left p-8 min-w-[950px] min-h-[380px] relative"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            {/* SVG Connecting Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-700/60" style={{ zIndex: 0 }}>
              <defs>
                <linearGradient id="edge-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              {/* Source -> Queue */}
              <line x1={180} y1={170} x2={230} y2={170} strokeWidth={2} strokeDasharray="4 2" />
              {/* Queue -> Hash Partition */}
              <path d="M 360 170 C 385 170, 385 110, 410 110" fill="none" strokeWidth={2} stroke="url(#edge-glow)" />
              {/* Queue -> Cache Sync */}
              <path d="M 360 170 C 385 170, 385 250, 410 250" fill="none" strokeWidth={2} stroke="#334155" />
              {/* Hash -> Worker A */}
              <path d="M 540 110 C 565 110, 565 70, 590 70" fill="none" strokeWidth={2} stroke="url(#edge-glow)" />
              {/* Hash -> Worker B */}
              <path d="M 540 110 C 565 110, 565 160, 590 160" fill="none" strokeWidth={2} stroke="#334155" />
              {/* Worker A -> ScyllaDB Sink */}
              <path d="M 720 70 C 745 70, 745 120, 770 120" fill="none" strokeWidth={2} stroke="url(#edge-glow)" />
              {/* Worker B -> ScyllaDB Sink */}
              <path d="M 720 160 C 745 160, 745 120, 770 120" fill="none" strokeWidth={2} stroke="#334155" />
            </svg>

            {/* Nodes */}
            {nodes.map((node) => {
              const cfg = statusColors[node.status || 'idle'];
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  style={{
                    position: 'absolute',
                    left: `${node.position?.x ?? 0}px`,
                    top: `${node.position?.y ?? 0}px`,
                    zIndex: 10,
                  }}
                  className={`w-36 p-3 rounded-xl border cursor-pointer select-none transition-all duration-200 backdrop-blur-md ${cfg.bg} ${cfg.border} ${cfg.glow} ${
                    isSelected ? 'ring-2 ring-cyan-400 scale-105' : 'hover:scale-102 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                      {node.id}
                    </span>
                    <Badge color={cfg.badge} size="sm">
                      {node.status}
                    </Badge>
                  </div>
                  <div className="text-xs font-semibold text-slate-100 truncate">{node.label}</div>
                  <div className={`text-[11px] font-mono mt-1 ${cfg.text}`}>{node.value}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="mt-3 p-3.5 bg-slate-900/90 border border-slate-800 rounded-lg flex items-center justify-between text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center font-mono font-bold text-cyan-400">
                #
              </div>
              <div>
                <div className="font-semibold text-slate-100 flex items-center gap-2">
                  {selectedNode.label}
                  <Badge color={statusColors[selectedNode.status || 'idle'].badge} size="sm">
                    {selectedNode.status?.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                  ID: {selectedNode.id} | Metrics: {selectedNode.value} | Pos: ({selectedNode.position?.x}, {selectedNode.position?.y})
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setSelectedNode(null)}>
                Dismiss
              </Button>
              <Button size="sm" variant="primary">
                Inspect Memory
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
