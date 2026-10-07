import React, { useState } from 'react';
import { Button, Input, Badge } from './primitives';

export const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isMagicLink, setIsMagicLink] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#050914] text-slate-100 overflow-hidden">
      {/* Left Pane - Product Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-[#090d16] via-[#0b1222] to-[#080d1a] border-r border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:32px_32px] opacity-15" />
        
        {/* Top Logo / Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-mono font-bold text-lg text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            AI
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              AI-DS VISUALIZER PRO
              <Badge color="cyan" size="sm">PRO STUDIO</Badge>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">Autonomous Algorithmic Runtime</div>
          </div>
        </div>

        {/* Center Dynamic Preview Mockup */}
        <div className="relative z-10 my-auto py-8">
          <div className="relative max-w-lg mx-auto bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-slate-300">quicksort_partition.ts</span>
              </div>
              <span className="text-cyan-400">Step 04: SWAP</span>
            </div>

            <div className="font-mono text-xs text-slate-300 space-y-1">
              <p className="text-purple-400">function partition(arr, low, high) &#123;</p>
              <p className="pl-4 text-slate-400">// Pivot invariant selection</p>
              <p className="pl-4 text-cyan-300">let pivot = arr[Math.floor((low + high) / 2)];</p>
              <p className="pl-4 text-emerald-400 bg-emerald-950/30 -mx-2 px-2 py-0.5 rounded border border-emerald-500/30">
                [arr[i], arr[j]] = [arr[j], arr[i]]; // Swapped [32, 11]
              </p>
              <p className="text-purple-400">&#125;</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Time: O(N log N)</span>
              <span className="text-emerald-400">Memory: In-Place</span>
            </div>
          </div>

          <div className="text-center mt-6">
            <h3 className="text-lg font-bold text-slate-200">
              Interactive Execution with Real-Time AI Copilot
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Simulate complex trees, graphs, sorting partitions, and dynamic programming with step-level state inspectability.
            </p>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 font-mono border-t border-slate-850 pt-4">
          <span>Enterprise Grade • ISO 27001</span>
          <span>Powered by Gemini 2.5 Flash</span>
        </div>
      </div>

      {/* Right Pane - Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Sign in to your account
            </h2>
            <p className="text-xs text-slate-400 mt-1.5">
              Enter your credentials to access the AI algorithmic workbench.
            </p>
          </div>

          {/* SSO Providers */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub SSO
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                />
              </svg>
              Google Workspace
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-800" />
            <span className="absolute bg-[#050914] px-3 text-[11px] uppercase tracking-wider text-slate-500 font-mono">
              or continue with email
            </span>
          </div>

          {submitted ? (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center space-y-2">
              <span className="text-emerald-400 font-bold text-sm">Magic link dispatched!</span>
              <p className="text-xs text-slate-300">
                Check your inbox at <span className="font-mono text-cyan-400">{email}</span> to authenticate your session.
              </p>
              <Button size="sm" variant="secondary" onClick={() => setSubmitted(false)}>
                Return to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Developer Work Email
                </label>
                <Input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs"
                />
              </div>

              {!isMagicLink && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <a href="#forgot" className="text-[11px] text-cyan-400 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setIsMagicLink(!isMagicLink)}
                  className="text-cyan-400 hover:underline font-medium"
                >
                  {isMagicLink ? '← Use password instead' : 'Send passwordless magic link →'}
                </button>
              </div>

              <Button
                type="submit"
                size="md"
                variant="primary"
                isLoading={isLoading}
                className="w-full mt-2"
              >
                {isMagicLink ? 'Send Magic Link' : 'Sign In to Workspace'}
              </Button>
            </form>
          )}

          <p className="text-[11px] text-center text-slate-500">
            By signing in, you agree to our{' '}
            <a href="#terms" className="underline hover:text-slate-400">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#privacy" className="underline hover:text-slate-400">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

