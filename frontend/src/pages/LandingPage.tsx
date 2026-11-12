import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Terminal, Code2, BarChart3, Bot, Target,
  Mail, Lock, Eye, EyeOff, Shield, AlertCircle, CheckCircle2,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000');

interface LandingPageProps { onLogin: (user: any) => void; }

const features = [
  { title: 'Interactive Visualizations', desc: 'See algorithms come to life.', icon: Play, color: '#22D3EE' },
  { title: 'Real Code Execution', desc: 'Run, step, debug, and visualize.', icon: Terminal, color: '#3B82F6' },
  { title: 'Multiple Languages', desc: 'C, C++, Java, Python.', icon: Code2, color: '#8B5CF6' },
  { title: 'Track Your Progress', desc: 'Learn with structured paths.', icon: BarChart3, color: '#22C55E' },
  { title: 'AI Student Copilot', desc: 'Get instant help and explanations.', icon: Bot, color: '#F59E0B' },
  { title: 'Practice & Improve', desc: 'Solve, visualize, and master.', icon: Target, color: '#EF4444' },
];

export default function LandingPage({ onLogin }: LandingPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleTabChange = (tab: 'user' | 'admin') => {
    setActiveTab(tab); setAuthMode('login');
    setErrorMessage(null); setSuccessMessage(null);
    setEmail(''); setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null); setSuccessMessage(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) { setErrorMessage('Please enter a valid email address.'); return; }
    if (!password) { setErrorMessage('Please enter your password.'); return; }
    if (activeTab === 'user' && authMode === 'signup' && !name.trim()) { setErrorMessage('Please enter your full name.'); return; }
    setIsLoading(true);
    try {
      if (activeTab === 'user' && authMode === 'signup') {
        const res = await fetch(`${API}/api/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), email: cleanEmail, password }) });
        const data = await res.json();
        if (data.success && data.user) {
          setSuccessMessage('Account created successfully! Loading workbench...');
          localStorage.setItem('aids_token', data.token);
          if (rememberMe) localStorage.setItem('aids_user', JSON.stringify(data.user));
          setTimeout(() => { onLogin(data.user); navigate('/dashboard'); }, 450);
        } else { setErrorMessage(data.message || data.error || 'Unable to register account.'); }
      } else {
        const res = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: cleanEmail, password, expected_role: activeTab === 'admin' ? 'admin' : undefined }) });
        const data = await res.json();
        if (data.success && data.user) {
          if (activeTab === 'admin' && data.user.role !== 'admin') { setErrorMessage('Access denied. You do not have administrator permissions.'); setIsLoading(false); return; }
          setSuccessMessage('Authentication successful! Initializing session...');
          localStorage.setItem('aids_token', data.token);
          if (rememberMe) localStorage.setItem('aids_user', JSON.stringify(data.user));
          setTimeout(() => { onLogin(data.user); navigate(data.user.role === 'admin' ? '/admin' : '/dashboard'); }, 450);
        } else {
          setErrorMessage(activeTab === 'admin' ? (data.message || 'Invalid administrator credentials.') : (data.message || 'Invalid email or password.'));
        }
      }
    } catch { setErrorMessage('Unable to connect to authentication service. Please verify your connection.'); }
    finally { setIsLoading(false); }
  };

  return (
    <div style={{ minHeight: '100svh', background: '#060B16', color: '#F8FAFC', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Navbar */}
      <nav style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', borderBottom: '1px solid #243449', background: 'rgba(6,11,22,0.8)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#22D3EE,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#060B16' }}>AI</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: 0.5 }}>AI-DS VISUALIZER PRO</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>Autonomous Algorithm Engine</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, border: '1px solid #243449', background: 'rgba(34,211,238,0.08)', fontSize: 12, color: '#22D3EE' }}>
          <Shield size={14} /> Secure Access
        </div>
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '58% 42%', gap: 24, padding: '20px 32px', maxWidth: 1360, margin: '0 auto', width: '100%', minHeight: 0, overflow: 'hidden' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0, overflow: 'hidden' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, lineHeight: 1.1, margin: 0 }}>
              Master Data Structures and Algorithms with{' '}
              <span style={{ background: 'linear-gradient(90deg,#22D3EE,#3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI-Powered</span>{' '}
              <span style={{ background: 'linear-gradient(90deg,#3B82F6,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Learning</span>
            </h1>
            <p style={{ color: '#94A3B8', fontSize: 14, marginTop: 8, lineHeight: 1.5, maxWidth: 600 }}>
              Interactive visualizations, real code execution, AI guidance, and structured learning — everything you need to truly understand DSA.
            </p>
          </div>

          {/* Feature cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{ background: 'rgba(16,26,44,0.6)', border: '1px solid #243449', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s', cursor: 'default' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${f.color}22, ${f.color}11)`, border: `1px solid ${f.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={f.color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#F8FAFC' }}>{f.title}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{f.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Array demo */}
          <div style={{ background: 'rgba(16,26,44,0.6)', border: '1px solid #243449', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22D3EE' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8B5CF6' }} />
                <span style={{ fontWeight: 600, fontSize: 13, marginLeft: 4 }}>Array Visualizer Demo</span>
              </div>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: 'rgba(34,211,238,0.15)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.3)' }}>Live Trace</span>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 6 }}>
              {[10, 20, 30, 40, 50].map((v, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: 48, height: 40, borderRadius: 8, background: v === 30 ? 'linear-gradient(135deg,#22D3EE,#3B82F6)' : 'rgba(36,52,73,0.6)', border: `1px solid ${v === 30 ? '#22D3EE' : '#243449'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: v === 30 ? '#060B16' : '#F8FAFC', transition: 'all 0.2s' }}>
                    {v}
                  </div>
                  <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>[{i}]</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['Python', 'C++', 'Java'].map((l) => (
                  <span key={l} style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(36,52,73,0.6)', border: '1px solid #243449', fontSize: 10 }}>{l}</span>
                ))}
              </div>
              <span style={{ color: '#22D3EE', fontSize: 10 }}>● AI Copilot Active</span>
            </div>
          </div>
        </div>

        {/* Right column - Login card */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
          <div style={{ width: '100%', maxWidth: 400, background: 'rgba(16,26,44,0.8)', border: '1px solid #243449', borderRadius: 16, padding: '24px 24px', backdropFilter: 'blur(12px)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#22D3EE,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#060B16', margin: '0 auto 8px', fontSize: 18 }}>AI</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Welcome <span style={{ background: 'linear-gradient(90deg,#22D3EE,#3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Back</span></h2>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Choose your access type to continue.</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'rgba(9,19,33,0.6)', borderRadius: 10, padding: 4, marginBottom: 16 }}>
              {(['user', 'admin'] as const).map((t) => (
                <button key={t} onClick={() => handleTabChange(t)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: activeTab === t ? 'linear-gradient(135deg,#22D3EE,#3B82F6)' : 'transparent', color: activeTab === t ? '#060B16' : '#94A3B8', transition: 'all 0.2s' }}>
                  {t === 'user' ? 'User Login' : 'Admin Login'}
                </button>
              ))}
            </div>

            {errorMessage && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 12px', color: '#EF4444', fontSize: 12, marginBottom: 12 }}>{errorMessage}</div>}
            {successMessage && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '8px 12px', color: '#22C55E', fontSize: 12, marginBottom: 12 }}>{successMessage}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeTab === 'user' && authMode === 'signup' && (
                <div>
                  <label style={{ fontSize: 11, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Full Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #243449', background: '#091321', color: '#F8FAFC', fontSize: 13, outline: 'none' }} />
                </div>
              )}
              <div>
                <label style={{ fontSize: 11, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: 8, border: '1px solid #243449', background: '#091321', color: '#F8FAFC', fontSize: 13, outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" onKeyDown={(e) => e.key === 'Enter' && void handleSubmit(e as any)} style={{ width: '100%', padding: '10px 36px 10px 34px', borderRadius: 8, border: '1px solid #243449', background: '#091321', color: '#F8FAFC', fontSize: 13, outline: 'none' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 11 }}>{showPassword ? 'Hide' : 'Show'}</button>
                </div>
              </div>

              {activeTab === 'user' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94A3B8', cursor: 'pointer' }}>
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> Remember Me
                  </label>
                  <a href="#" style={{ color: '#22D3EE', textDecoration: 'none' }}>Forgot Password?</a>
                </div>
              )}

              <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14, background: 'linear-gradient(135deg,#22D3EE,#3B82F6)', color: '#060B16', opacity: isLoading ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(34,211,238,0.3)' }}>
                {isLoading ? 'Please wait...' : activeTab === 'user' && authMode === 'signup' ? 'Create Account' : 'Login'}
              </button>
            </form>

            {activeTab === 'user' && (
              <p style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 12 }}>
                {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} style={{ background: 'none', border: 'none', color: '#22D3EE', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                  {authMode === 'login' ? 'Create Account' : 'Sign In'}
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, borderTop: '1px solid #243449', background: 'rgba(6,11,22,0.8)', flexShrink: 0, fontSize: 11, color: '#94A3B8' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Shield size={12} color="#22D3EE" /> Secure & Private — Role-based access control</span>
        <span style={{ color: '#243449' }}>|</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Code2 size={12} color="#3B82F6" /> Real Execution Engine — Python, C++, Java</span>
        <span style={{ color: '#243449' }}>|</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Bot size={12} color="#8B5CF6" /> AI Guidance — Adaptive step debugging</span>
      </footer>
    </div>
  );
}