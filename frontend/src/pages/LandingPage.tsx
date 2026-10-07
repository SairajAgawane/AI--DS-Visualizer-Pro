import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Terminal,
  Code2,
  BarChart3,
  Bot,
  Target,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Heart,
  ArrowRight,
  Shield,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

interface LandingPageProps {
  onLogin: (user: any) => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const navigate = useNavigate();

  // Tab State: 'user' | 'admin'
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');

  // Sub-mode for User Tab: 'login' | 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleTabChange = (tab: 'user' | 'admin') => {
    setActiveTab(tab);
    setAuthMode('login');
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (activeTab === 'user' && authMode === 'signup' && !name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'user' && authMode === 'signup') {
        // Real signup call
        const res = await fetch(`${API}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: cleanEmail,
            password,
          }),
        });

        const data = await res.json();
        if (data.success && data.user) {
          setSuccessMessage('Account created successfully! Loading workbench...');
          localStorage.setItem('aids_token', data.token);
          if (rememberMe) {
            localStorage.setItem('aids_user', JSON.stringify(data.user));
          }
          setTimeout(() => {
            onLogin(data.user);
            navigate('/dashboard');
          }, 450);
        } else {
          setErrorMessage(data.message || data.error || 'Unable to register account.');
        }
      } else {
        // Real login call (either user or admin)
        const res = await fetch(`${API}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password,
            expected_role: activeTab === 'admin' ? 'admin' : undefined,
          }),
        });

        const data = await res.json();
        if (data.success && data.user) {
          const authenticatedUser = data.user;

          // Double-check role enforcement
          if (activeTab === 'admin' && authenticatedUser.role !== 'admin') {
            setErrorMessage('Access denied. You do not have administrator permissions.');
            setIsLoading(false);
            return;
          }

          setSuccessMessage('Authentication successful! Initializing session...');
          localStorage.setItem('aids_token', data.token);
          if (rememberMe) {
            localStorage.setItem('aids_user', JSON.stringify(authenticatedUser));
          }

          setTimeout(() => {
            onLogin(authenticatedUser);
            if (authenticatedUser.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/dashboard');
            }
          }, 450);
        } else {
          // Provide appropriate error feedback matching prompt
          if (activeTab === 'admin') {
            setErrorMessage(data.message || 'Invalid administrator credentials.');
          } else {
            setErrorMessage(data.message || 'Invalid email or password.');
          }
        }
      }
    } catch (err) {
      setErrorMessage('Unable to connect to authentication service. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const featureCards = [
    {
      title: 'Interactive Visualizations',
      desc: 'See algorithms come to life',
      icon: Play,
      gradient: 'from-[#22D3EE]/25 to-[#38BDF8]/20',
      border: 'border-[#22D3EE]/40',
      iconColor: 'text-[#22D3EE]',
      glow: 'shadow-[0_0_15px_rgba(34,211,238,0.25)]',
    },
    {
      title: 'Real Code Execution',
      desc: 'Run, step, debug, and visualize',
      icon: Terminal,
      gradient: 'from-[#22C55E]/25 to-[#10B981]/20',
      border: 'border-[#22C55E]/40',
      iconColor: 'text-[#22C55E]',
      glow: 'shadow-[0_0_15px_rgba(34,197,94,0.25)]',
    },
    {
      title: 'Multiple Languages',
      desc: 'C, C++, Java, Python',
      icon: Code2,
      gradient: 'from-[#8B5CF6]/25 to-[#6366F1]/20',
      border: 'border-[#8B5CF6]/40',
      iconColor: 'text-[#8B5CF6]',
      glow: 'shadow-[0_0_15px_rgba(139,92,246,0.25)]',
    },
    {
      title: 'Track Your Progress',
      desc: 'Learn with structured paths',
      icon: BarChart3,
      gradient: 'from-[#F59E0B]/25 to-[#D97706]/20',
      border: 'border-[#F59E0B]/40',
      iconColor: 'text-[#F59E0B]',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    },
    {
      title: 'AI Student Copilot',
      desc: 'Get instant help and explanations',
      icon: Bot,
      gradient: 'from-[#22D3EE]/25 to-[#8B5CF6]/20',
      border: 'border-[#22D3EE]/40',
      iconColor: 'text-[#22D3EE]',
      glow: 'shadow-[0_0_15px_rgba(34,211,238,0.25)]',
    },
    {
      title: 'Practice & Improve',
      desc: 'Solve, visualize, and master',
      icon: Target,
      gradient: 'from-[#EC4899]/25 to-[#D946EF]/20',
      border: 'border-[#EC4899]/40',
      iconColor: 'text-[#EC4899]',
      glow: 'shadow-[0_0_15px_rgba(236,72,153,0.25)]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050914] text-[#F8FAFC] font-sans flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background radial glowing gradients matching design tokens */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#22D3EE] opacity-[0.12] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#8B5CF6] opacity-[0.12] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[30%] w-[35%] h-[35%] bg-[#38BDF8] opacity-[0.05] blur-[130px] rounded-full pointer-events-none" />

      {/* TOP LANDING NAVBAR */}
      <header className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl w-full mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#22D3EE] via-[#6366F1] to-[#8B5CF6] text-white font-black text-sm flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.45)]">
            <span>A</span>
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
              <span className="text-[#F8FAFC]">AI-DS</span>
              <span className="text-[#22D3EE] text-sm tracking-wider">VISUALIZER PRO</span>
            </div>
            <span className="text-[10px] font-mono text-[#64748B] block -mt-0.5">Autonomous Algorithm Engine</span>
          </div>
        </div>

        {/* Secure Access Indicator Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101827] border border-[#24344A] text-xs font-mono text-[#CBD5E1]">
          <Shield className="w-3.5 h-3.5 text-[#22D3EE]" />
          <span>Secure Access</span>
        </div>
      </header>

      {/* MAIN HERO & LOGIN GATEWAY CONTAINER */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-6 lg:px-12 py-6 flex flex-col lg:flex-row items-center justify-between gap-12 flex-1">
        {/* LEFT HERO COLUMN */}
        <div className="w-full lg:w-[54%] flex flex-col justify-center">
          {/* Section 4 Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101827]/80 border border-[#22D3EE]/40 text-xs font-mono text-[#CBD5E1] w-fit mb-5 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
            <span className="text-[#22D3EE]">Interactive Learning</span>
            <span className="text-[#64748B]">•</span>
            <span className="text-[#38BDF8]">Real Code Execution</span>
            <span className="text-[#64748B]">•</span>
            <span className="text-[#8B5CF6]">AI-Powered Learning</span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black leading-[1.12] mb-5 tracking-tight text-[#F8FAFC]">
            Master Data Structures<br />
            and Algorithms<br />
            with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22D3EE] via-[#38BDF8] to-[#8B5CF6]">
              AI-Powered Learning
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-xl mb-8 leading-relaxed">
            Interactive visualizations, real code execution, AI guidance, and structured learning — everything you need
            to truly understand DSA.
          </p>

          {/* Feature Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-xl mb-8">
            {featureCards.map((card) => {
              const IconComp = card.icon;
              return (
                <div
                  key={card.title}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#0A1120]/80 border border-[#24344A] hover:border-[#22D3EE]/40 backdrop-blur-md transition-all group"
                >
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} border ${card.border} flex items-center justify-center shrink-0 ${card.glow}`}
                  >
                    <IconComp className={`w-4 h-4 ${card.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#F8FAFC] group-hover:text-[#22D3EE] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-[11px] text-[#64748B]">{card.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mini Array Visualizer Live Trace Simulation */}
          <div className="relative max-w-xl rounded-2xl bg-[#0A1120]/90 border border-[#24344A] p-4 shadow-2xl backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#22D3EE]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-[#24344A] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                <span className="font-mono text-[11px] text-[#CBD5E1] font-bold ml-2">Array Visualizer Demo</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#22D3EE]/10 border border-[#22D3EE]/30 text-[#22D3EE] text-[10px] font-mono font-bold">
                Live Trace
              </span>
            </div>

            <div className="pt-3 flex flex-col gap-2.5">
              <div className="flex items-center justify-center gap-2 py-2 bg-[#050914] rounded-xl border border-[#24344A]/60 font-mono text-xs">
                {[10, 20, 30, 40, 50].map((v, i) => (
                  <div
                    key={i}
                    className={`px-3 py-1.5 rounded-lg border text-center font-bold transition-all ${
                      i === 2
                        ? 'border-[#22D3EE] bg-[#101827] text-[#22D3EE] shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                        : 'border-[#24344A] bg-[#0A1120] text-[#CBD5E1]'
                    }`}
                  >
                    <div>{v}</div>
                    <div className="text-[9px] text-[#64748B]">[{i}]</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] pt-1">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-[#101827] border border-[#24344A] text-[#38BDF8]">
                    🐍 Python
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#101827] border border-[#24344A] text-[#6366F1]">
                    ⚡ C++
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#101827] border border-[#24344A] text-[#F59E0B]">
                    ☕ Java
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[#22D3EE] font-bold">
                  <span className="text-base">🤖</span>
                  <span>AI Copilot Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SECTION 5 PREMIUM GLASS LOGIN CARD */}
        <div className="w-full lg:w-[440px] shrink-0">
          <div
            style={{
              background: 'rgba(16, 24, 39, 0.85)',
              border: '1px solid rgba(34, 211, 238, 0.30)',
              borderRadius: '20px',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 0 50px rgba(34, 211, 238, 0.15), 0 0 30px rgba(139, 92, 246, 0.10)',
            }}
            className="p-8 relative overflow-hidden transition-all duration-300"
          >
            {/* Header: Logo, Welcome Back, Choose Access Type */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#22D3EE] via-[#6366F1] to-[#8B5CF6] text-white font-black text-xl mx-auto mb-3 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.45)]">
                <span>A</span>
              </div>
              <div className="font-mono text-[10px] tracking-widest text-[#22D3EE] font-bold mb-1 uppercase">
                AI-DS VISUALIZER PRO
              </div>
              <h2 className="text-2xl font-extrabold text-[#F8FAFC]">
                Welcome <span className="text-[#38BDF8]">Back</span>
              </h2>
              <p className="text-xs text-[#CBD5E1] mt-1">Choose your access type to continue.</p>
            </div>

            {/* SECTION 6: LOGIN TYPE SELECTOR (TWO TABS: USER LOGIN & ADMIN LOGIN) */}
            <div className="flex bg-[#0A1120] p-1.5 rounded-xl border border-[#24344A] mb-6">
              <button
                type="button"
                onClick={() => handleTabChange('user')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'user'
                    ? 'bg-gradient-to-r from-[#22D3EE] via-[#38BDF8] to-[#8B5CF6] text-[#050914] shadow-[0_0_20px_rgba(34,211,238,0.35)] font-black'
                    : 'text-[#64748B] hover:text-[#CBD5E1] border border-transparent'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>USER LOGIN</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('admin')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-[#22D3EE] via-[#38BDF8] to-[#8B5CF6] text-[#050914] shadow-[0_0_20px_rgba(34,211,238,0.35)] font-black'
                    : 'text-[#64748B] hover:text-[#CBD5E1] border border-transparent'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>ADMIN LOGIN</span>
              </button>
            </div>

            {/* Form Title & Subtitle Banner */}
            <div className="mb-4">
              {activeTab === 'user' ? (
                <div>
                  <h3 className="text-sm font-bold text-[#F8FAFC]">
                    {authMode === 'login' ? 'User Login' : 'Create Account'}
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    {authMode === 'login'
                      ? 'Student & developer access to interactive algorithms'
                      : 'Join AI-DS Visualizer Pro to track your learning journey'}
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-[#101827] border border-[#22D3EE]/30">
                  <h3 className="text-sm font-bold text-[#22D3EE] flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    Admin Login
                  </h3>
                  <p className="text-[11px] text-[#CBD5E1] mt-0.5">Administrator access only</p>
                </div>
              )}
            </div>

            {/* Error & Success Alert Banners */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="flex-1">{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span className="flex-1">{successMessage}</span>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* If User Sign-up Mode: Name Field */}
              {activeTab === 'user' && authMode === 'signup' && (
                <div>
                  <label className="block text-xs text-[#CBD5E1] mb-1.5 font-medium">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full h-[48px] bg-[#0A1120] border border-[#24344A] rounded-xl pl-10 pr-4 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/30 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs text-[#CBD5E1] mb-1.5 font-medium">
                  {activeTab === 'admin' ? 'Admin Email' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeTab === 'admin' ? 'Enter admin email' : 'Enter your email'}
                    className="w-full h-[48px] bg-[#0A1120] border border-[#24344A] rounded-xl pl-10 pr-4 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/30 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-[#CBD5E1] font-medium">
                    {activeTab === 'admin' ? 'Admin Password' : 'Password'}
                  </label>
                  {activeTab === 'user' && authMode === 'login' && (
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Password reset link dispatched if account exists.');
                      }}
                      className="text-[11px] text-[#38BDF8] hover:underline"
                    >
                      Forgot Password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={activeTab === 'admin' ? 'Enter admin password' : 'Enter your password'}
                    className="w-full h-[48px] bg-[#0A1120] border border-[#24344A] rounded-xl pl-10 pr-10 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/30 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#64748B] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me for User Mode */}
              {activeTab === 'user' && authMode === 'login' && (
                <div className="flex items-center text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-[#CBD5E1]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#24344A] bg-[#0A1120] text-[#22D3EE] focus:ring-[#22D3EE]"
                    />
                    <span>Remember Me</span>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[48px] bg-gradient-to-r from-[#22D3EE] via-[#6366F1] to-[#8B5CF6] hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-xl shadow-[0_0_25px_rgba(34,211,238,0.35)] transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <>
                    <span>
                      {activeTab === 'admin'
                        ? 'ADMIN LOGIN'
                        : authMode === 'signup'
                        ? 'CREATE ACCOUNT'
                        : 'LOGIN'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* User Tab Switch to Sign-up or Login */}
            {activeTab === 'user' && (
              <div className="text-center text-xs text-[#CBD5E1] mt-6 pt-4 border-t border-[#24344A]/60">
                {authMode === 'login' ? (
                  <span>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setErrorMessage(null);
                      }}
                      className="text-[#38BDF8] font-bold hover:underline"
                    >
                      Create Account
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setErrorMessage(null);
                      }}
                      className="text-[#38BDF8] font-bold hover:underline"
                    >
                      Sign In
                    </button>
                  </span>
                )}
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="text-center text-[11px] text-[#64748B] mt-5 pt-3 border-t border-[#24344A]/60">
                <span>Direct Administrator Gateway • Role-Protected</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER TRUST SECTION */}
      <footer className="relative z-20 border-t border-[#24344A]/60 py-4 px-6 lg:px-12 bg-[#0A1120]/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center md:justify-between gap-6 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span>
              <strong className="text-[#CBD5E1]">Secure & Private</strong> · Role-based access control
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#22D3EE]" />
            <span>
              <strong className="text-[#CBD5E1]">Real Execution Engine</strong> · Python, C++, Java
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#8B5CF6]" />
            <span>
              <strong className="text-[#CBD5E1]">AI Guidance</strong> · Adaptive step debugging
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
