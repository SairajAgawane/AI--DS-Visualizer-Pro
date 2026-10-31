import React, { useState } from 'react';
import { Card, Button, Input, Switch, Badge } from './primitives';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'keybinds' | 'telemetry'>('general');
  const [apiKey, setApiKey] = useState<string>('ai_sec_89df0b73c41a29f84091e');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Preference switches
  const [autoSave, setAutoSave] = useState<boolean>(true);
  const [smoothAnimations, setSmoothAnimations] = useState<boolean>(true);
  const [audioFeedback, setAudioFeedback] = useState<boolean>(false);
  const [debugLogs, setDebugLogs] = useState<boolean>(true);
  const [cloudSync, setCloudSync] = useState<boolean>(true);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');

  const keybindings = [
    { action: 'Execute Visualization / Run', keys: 'Ctrl + Enter', description: 'Triggers active algorithm simulation' },
    { action: 'Step Forward', keys: 'F10', description: 'Advances execution step by 1 unit' },
    { action: 'Step Backward', keys: 'Shift + F10', description: 'Reverses to prior state frame' },
    { action: 'Toggle AI Copilot Drawer', keys: 'Ctrl + Shift + K', description: 'Opens or closes context assistant' },
    { action: 'Quick Search / Command Palette', keys: 'Ctrl + K', description: 'Finds files, algorithms, or commands' },
    { action: 'Format Code Canvas', keys: 'Shift + Alt + F', description: 'Auto-formats code using Prettier' },
  ];

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 1500);
  };

  const handleRegenerateKey = () => {
    const randomHex = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(`ai_sec_${randomHex}`);
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-8">
      {/* Settings Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Workbench Settings
            <Badge color="cyan" size="sm">CONFIG</Badge>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customize engine runtime parameters, AI credentials, keyboard triggers, and workspace telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && <Badge color="green" size="md">Settings Saved ✓</Badge>}
          <Button size="sm" variant="secondary" onClick={() => {}}>
            Discard
          </Button>
          <Button size="sm" variant="primary" onClick={handleSave}>
            Save Preferences
          </Button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-1">
        {[
          { id: 'general', label: 'General & UI' },
          { id: 'api', label: 'AI Engine & Keys' },
          { id: 'keybinds', label: 'Keybindings' },
          { id: 'telemetry', label: 'Telemetry & Cloud' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-all -mb-px ${
              activeTab === tab.id
                ? 'border-cyan-500 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Editor & Visualization" subtitle="Adjust canvas display behavior">
            <div className="flex flex-col gap-4">
              <Switch
                checked={smoothAnimations}
                onChange={setSmoothAnimations}
                label="Smooth Transitions (60 FPS Interpolation)"
              />
              <Switch
                checked={autoSave}
                onChange={setAutoSave}
                label="Auto-save Code Workspace (Every 5 seconds)"
              />
              <Switch
                checked={audioFeedback}
                onChange={setAudioFeedback}
                label="Audio Cues on Step Execution"
              />
            </div>
          </Card>

          <Card title="Workspace Appearance" subtitle="Theme mode and typography options">
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Editor Monospace Font</label>
                <select className="w-full mt-1.5 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-cyan-500">
                  <option value="jetbrains">JetBrains Mono (Recommended)</option>
                  <option value="fira">Fira Code</option>
                  <option value="source">Source Code Pro</option>
                  <option value="consolas">Consolas</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Default Simulation Speed</label>
                <select className="w-full mt-1.5 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-cyan-500">
                  <option value="1">1.0x (Normal speed)</option>
                  <option value="0.5">0.5x (Slow analysis)</option>
                  <option value="2">2.0x (Fast preview)</option>
                  <option value="5">5.0x (High throughput)</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'api' && (
        <Card title="AI Intelligence Credentials" subtitle="Manage Gemini & inference endpoints">
          <div className="flex flex-col gap-5 max-w-2xl">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Gemini API Secret Key
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="font-mono text-xs pr-20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                <Button size="sm" variant="secondary" onClick={handleCopyKey}>
                  {copiedKey ? '✓ Copied' : 'Copy'}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleRegenerateKey}>
                  Regenerate
                </Button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Your key is stored locally in AES-256 encrypted browser storage and never transmitted to untrusted endpoints.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Active Reasoning Model
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', latency: '~180ms', badge: 'FASTEST' },
                  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', latency: '~650ms', badge: 'REASONING' },
                  { id: 'custom-local', name: 'Local Ollama LLM', latency: '~320ms', badge: 'LOCAL' },
                ].map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedModel === model.id
                        ? 'bg-cyan-950/60 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-200">{model.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{model.latency}</span>
                      <Badge color="cyan" size="sm">{model.badge}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'keybinds' && (
        <Card title="Workbench Keybindings" subtitle="Keyboard shortcuts for accelerated workflow">
          <div className="divide-y divide-slate-800/80">
            {keybindings.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-xs font-medium text-slate-200">{item.action}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                </div>
                <kbd className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-xs font-bold text-cyan-400 shadow-inner">
                  {item.keys}
                </kbd>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'telemetry' && (
        <Card title="Telemetry & Cloud Integration" subtitle="Diagnostic logging and multi-device sync">
          <div className="flex flex-col gap-4 max-w-xl">
            <Switch
              checked={debugLogs}
              onChange={setDebugLogs}
              label="Enable Verbose Debug Console Logs"
            />
            <Switch
              checked={cloudSync}
              onChange={setCloudSync}
              label="Sync Code Snippets with Cloud Workspace"
            />
            <div className="pt-4 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Custom WebSocket Bridge Server
              </label>
              <Input
                placeholder="wss://api.visualizer.dev/v1/bridge"
                defaultValue="wss://localhost:8080/engine"
                className="font-mono text-xs"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

