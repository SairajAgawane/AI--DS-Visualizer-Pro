import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  UserCheck,
  UserPlus,
  Activity,
  Search,
  LogOut,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  Clock,
  Code2,
  Flame,
  Award,
  Zap,
  BarChart3,
  Calendar,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

interface AdminPanelProps {
  user: any;
  onLogout: () => void;
}

interface AdminStats {
  total_users: number;
  active_users: number;
  new_users: number;
  login_sessions: number;
  today_active_users?: number;
  total_programs_executed?: number;
  total_programs_completed?: number;
  average_progress?: number;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  first_login: string;
  last_login: string;
  registration_date: string;
  current_streak: number;
  longest_streak: number;
  total_login_count: number;
  overall_progress: number;
  chapters_completed: number;
  programs_executed: number;
  programs_completed: number;
  learning_sessions: number;
  current_chapter: string;
  current_program: string;
  recent_activity: Array<{
    title: string;
    chapter?: string;
    program?: string;
    time?: string;
    timestamp?: string;
    status?: string;
  }>;
}

interface LoginActivityItem {
  id: number;
  user_id: number | null;
  user: string;
  email: string;
  role: string;
  login_time: string;
  login_date?: string;
  status: string;
}

export default function AdminPanel({ user, onLogout }: AdminPanelProps) {
  const navigate = useNavigate();

  // Role Protection: Section 11 & 30
  const isAdmin = user && user.role === 'admin';

  const [activeSection, setActiveSection] = useState<'users' | 'activity'>('users');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [activities, setActivities] = useState<LoginActivityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'user' | 'admin' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected User Modal State (Section 15)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Load Real Admin Data
  const loadAdminData = async () => {
    const token = localStorage.getItem('aids_token');
    if (!token) {
      setError('Session token not found.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // 1. Fetch Stats
      const statsRes = await fetch(`${API}/api/admin/stats`, { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }

      // 2. Fetch Users
      const usersRes = await fetch(`${API}/api/admin/users`, { headers });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.success) {
          setUsersList(usersData.users);
        }
      }

      // 3. Fetch Login Activity
      const actRes = await fetch(`${API}/api/admin/login-activity`, { headers });
      if (actRes.ok) {
        const actData = await actRes.json();
        if (actData.success) {
          setActivities(actData.activities);
        }
      }
    } catch (err: any) {
      setError('Unable to load real admin telemetry from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  // Section 11: Access Denied Guard
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#050914] text-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#101827] border border-rose-500/40 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-rose-400 mb-2">Access Denied</h2>
          <p className="text-xs text-[#CBD5E1] mb-6">
            You do not have administrator permissions. This control center is restricted to system administrators.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] text-[#050914] font-bold text-xs shadow-lg transition-transform active:scale-95"
          >
            Return to Student Workbench
          </button>
        </div>
      </div>
    );
  }

  // Toggle user status: Active / Inactive
  const handleToggleStatus = async (targetUser: AdminUser) => {
    const token = localStorage.getItem('aids_token');
    if (!token) return;

    const newStatus = targetUser.status === 'active' ? 'inactive' : 'active';
    setIsUpdatingStatus(true);

    try {
      const res = await fetch(`${API}/api/admin/users/${targetUser.id}/status`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, status: newStatus } : u))
        );
        if (selectedUser?.id === targetUser.id) {
          setSelectedUser({ ...selectedUser, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Filtered Users List
  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.status.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterType === 'user') return u.role === 'user';
    if (filterType === 'admin') return u.role === 'admin';
    if (filterType === 'active') return u.status === 'active';
    if (filterType === 'inactive') return u.status === 'inactive';
    return true;
  });

  // Filtered Activities
  const filteredActivities = activities.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      a.user.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      a.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#050914] text-[#F8FAFC] flex flex-col font-sans select-none">
      {/* TOP HEADER / COMMAND BAR */}
      <header className="border-b border-[#24344A] bg-[#0A1120]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Logo & Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#22D3EE] via-[#6366F1] to-[#8B5CF6] text-white font-black text-sm flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.45)]">
              <span>A</span>
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-[#F8FAFC] flex items-center gap-2">
                <span>AI-DS VISUALIZER PRO</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#22D3EE]/15 border border-[#22D3EE]/40 text-[#22D3EE]">
                  ADMIN
                </span>
              </div>
              <div className="text-xs font-mono text-[#38BDF8] tracking-wider uppercase font-bold">
                ADMIN CONTROL CENTER
              </div>
            </div>
          </div>

          {/* Admin User Badge & Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-1.5 rounded-lg bg-[#101827] border border-[#24344A] text-xs font-semibold text-[#CBD5E1] hover:text-white hover:border-[#22D3EE]/40 flex items-center gap-1.5 transition-colors"
              title="Preview Student Workbench"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span className="hidden md:inline">Open Student View</span>
            </button>

            <button
              onClick={loadAdminData}
              disabled={isLoading}
              className="p-2 rounded-lg bg-[#101827] border border-[#24344A] text-[#CBD5E1] hover:text-[#22D3EE] transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#22D3EE]' : ''}`} />
            </button>

            <div className="h-6 w-px bg-[#24344A]" />

            {/* Admin Profile Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101827] border border-[#24344A] text-xs">
              <Shield className="w-3.5 h-3.5 text-[#22D3EE]" />
              <div className="flex flex-col text-left">
                <span className="font-bold text-[#F8FAFC] leading-none">{user.name || 'Admin'}</span>
                <span className="text-[10px] text-[#64748B] font-mono leading-none mt-1">{user.email}</span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1 flex flex-col gap-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={loadAdminData} className="underline text-xs ml-4">
              Retry
            </button>
          </div>
        )}

        {/* SECTION 12: REAL METRICS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Total Users */}
          <div className="p-3.5 rounded-2xl bg-[#0A1120] border border-[#24344A] shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#CBD5E1]">Total Users</span>
              <Users className="w-3.5 h-3.5 text-[#22D3EE]" />
            </div>
            <div className="text-xl font-black font-mono text-[#F8FAFC] mt-1.5">
              {stats ? stats.total_users : isLoading ? '...' : 0}
            </div>
          </div>

          {/* Active Users */}
          <div className="p-3.5 rounded-2xl bg-[#0A1120] border border-[#24344A] shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#CBD5E1]">Active Users</span>
              <UserCheck className="w-3.5 h-3.5 text-[#22C55E]" />
            </div>
            <div className="text-xl font-black font-mono text-[#22C55E] mt-1.5">
              {stats ? stats.active_users : isLoading ? '...' : 0}
            </div>
          </div>

          {/* Today's Active Users */}
          <div className="p-3.5 rounded-2xl bg-[#0A1120] border border-[#24344A] shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#CBD5E1]">Today Active</span>
              <Calendar className="w-3.5 h-3.5 text-[#38BDF8]" />
            </div>
            <div className="text-xl font-black font-mono text-[#38BDF8] mt-1.5">
              {stats ? stats.today_active_users ?? 0 : isLoading ? '...' : 0}
            </div>
          </div>

          {/* Login Sessions */}
          <div className="p-3.5 rounded-2xl bg-[#0A1120] border border-[#24344A] shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#CBD5E1]">Login Sessions</span>
              <Activity className="w-3.5 h-3.5 text-[#8B5CF6]" />
            </div>
            <div className="text-xl font-black font-mono text-[#8B5CF6] mt-1.5">
              {stats ? stats.login_sessions : isLoading ? '...' : 0}
            </div>
          </div>

          {/* Total Programs Executed */}
          <div className="p-3.5 rounded-2xl bg-[#0A1120] border border-[#24344A] shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#CBD5E1]">Executions</span>
              <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
            </div>
            <div className="text-xl font-black font-mono text-[#F59E0B] mt-1.5">
              {stats ? stats.total_programs_executed ?? 0 : isLoading ? '...' : 0}
            </div>
          </div>

          {/* Total Programs Completed */}
          <div className="p-3.5 rounded-2xl bg-[#0A1120] border border-[#24344A] shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#CBD5E1]">Completed</span>
              <Code2 className="w-3.5 h-3.5 text-[#10B981]" />
            </div>
            <div className="text-xl font-black font-mono text-[#10B981] mt-1.5">
              {stats ? stats.total_programs_completed ?? 0 : isLoading ? '...' : 0}
            </div>
          </div>

          {/* Average Progress */}
          <div className="p-3.5 rounded-2xl bg-[#0A1120] border border-[#24344A] shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#CBD5E1]">Avg Progress</span>
              <BarChart3 className="w-3.5 h-3.5 text-[#22D3EE]" />
            </div>
            <div className="text-xl font-black font-mono text-[#22D3EE] mt-1.5">
              {stats ? `${stats.average_progress ?? 0}%` : isLoading ? '...' : '0%'}
            </div>
          </div>
        </div>

        {/* CONTROLS ROW: TABS, SEARCH (Section 16), FILTERS (Section 17) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0A1120] border border-[#24344A]">
          {/* Section Selector Tabs */}
          <div className="flex items-center bg-[#101827] p-1 rounded-xl border border-[#24344A]">
            <button
              onClick={() => setActiveSection('users')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeSection === 'users'
                  ? 'bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] text-[#050914] shadow'
                  : 'text-[#64748B] hover:text-[#CBD5E1]'
              }`}
            >
              USER MANAGEMENT
            </button>
            <button
              onClick={() => setActiveSection('activity')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeSection === 'activity'
                  ? 'bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] text-[#050914] shadow'
                  : 'text-[#64748B] hover:text-[#CBD5E1]'
              }`}
            >
              LOGIN ACTIVITY
            </button>
          </div>

          {/* Search Box (Section 16) */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full h-9 bg-[#101827] border border-[#24344A] rounded-xl pl-9 pr-3 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE] transition-colors"
            />
          </div>

          {/* Filter Pills for Users (Section 17) */}
          {activeSection === 'users' && (
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(
                [
                  { id: 'all', label: 'All Users' },
                  { id: 'user', label: 'Users' },
                  { id: 'admin', label: 'Admins' },
                  { id: 'active', label: 'Active' },
                  { id: 'inactive', label: 'Inactive' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                    filterType === f.id
                      ? 'bg-[#22D3EE]/15 border-[#22D3EE] text-[#22D3EE]'
                      : 'bg-[#101827] border-[#24344A] text-[#64748B] hover:text-[#CBD5E1]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 13: USER MANAGEMENT TABLE WITH REAL COLUMNS */}
        {activeSection === 'users' && (
          <div className="rounded-2xl bg-[#0A1120] border border-[#24344A] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#24344A] bg-[#101827]/60 text-[#CBD5E1] font-mono text-[11px]">
                    <th className="py-3.5 px-4 font-bold">User</th>
                    <th className="py-3.5 px-4 font-bold">Email</th>
                    <th className="py-3.5 px-4 font-bold">Role</th>
                    <th className="py-3.5 px-4 font-bold">Streak</th>
                    <th className="py-3.5 px-4 font-bold">Progress</th>
                    <th className="py-3.5 px-4 font-bold">Chapters</th>
                    <th className="py-3.5 px-4 font-bold">Executions</th>
                    <th className="py-3.5 px-4 font-bold">Last Login</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24344A]/60 font-sans">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-8 text-[#64748B]">
                        {isLoading ? 'Loading registered users...' : 'No users match criteria.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-[#131D2D]/60 transition-colors cursor-pointer"
                        onClick={() => setSelectedUser(u)}
                      >
                        <td className="py-3.5 px-4 font-bold text-[#F8FAFC] flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#38BDF8] to-[#8B5CF6] text-white flex items-center justify-center text-xs font-extrabold shadow-sm shrink-0">
                            {u.name[0]?.toUpperCase() || 'U'}
                          </div>
                          <span className="truncate max-w-[120px]">{u.name}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#CBD5E1]">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-purple-950/60 border border-purple-500/40 text-purple-300'
                                : 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        {/* Real Streak (Section 13) */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#F59E0B]">
                          {u.current_streak} {u.current_streak === 1 ? 'Day' : 'Days'}
                        </td>
                        {/* Real Overall Progress */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#22D3EE]">
                          {u.overall_progress}%
                        </td>
                        {/* Chapters Completed */}
                        <td className="py-3.5 px-4 font-mono text-[#CBD5E1]">
                          {u.chapters_completed} / 14
                        </td>
                        {/* Programs Executed */}
                        <td className="py-3.5 px-4 font-mono text-[#CBD5E1]">
                          {u.programs_executed}
                        </td>
                        <td className="py-3.5 px-4 text-[#CBD5E1] font-mono text-[11px]">{u.last_login}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.status === 'active'
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {u.status === 'active' ? (
                              <CheckCircle2 className="w-2.5 h-2.5" />
                            ) : (
                              <XCircle className="w-2.5 h-2.5" />
                            )}
                            <span className="capitalize">{u.status}</span>
                          </span>
                        </td>
                        <td
                          className="py-3.5 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="px-2.5 py-1 rounded bg-[#101827] border border-[#24344A] hover:border-[#22D3EE]/40 text-[#22D3EE] text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Details</span>
                            </button>
                            {u.id !== user.id && (
                              <button
                                onClick={() => handleToggleStatus(u)}
                                disabled={isUpdatingStatus}
                                className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                                  u.status === 'active'
                                    ? 'bg-rose-950/40 border-rose-500/30 text-rose-300 hover:bg-rose-900/60'
                                    : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/60'
                                }`}
                              >
                                {u.status === 'active' ? 'Disable' : 'Enable'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 14: LOGIN ACTIVITY TABLE */}
        {activeSection === 'activity' && (
          <div className="rounded-2xl bg-[#0A1120] border border-[#24344A] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#24344A] bg-[#101827]/60 text-[#CBD5E1] font-mono text-[11px]">
                    <th className="py-3.5 px-4 font-bold">User</th>
                    <th className="py-3.5 px-4 font-bold">Email</th>
                    <th className="py-3.5 px-4 font-bold">Login Date</th>
                    <th className="py-3.5 px-4 font-bold">Login Time</th>
                    <th className="py-3.5 px-4 font-bold">Role</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24344A]/60 font-sans">
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-[#64748B]">
                        {isLoading ? 'Loading activity logs...' : 'No activity records found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((a) => (
                      <tr key={a.id} className="hover:bg-[#131D2D]/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#F8FAFC]">{a.user}</td>
                        <td className="py-3.5 px-4 font-mono text-[#CBD5E1]">{a.email}</td>
                        <td className="py-3.5 px-4 text-[#CBD5E1] font-mono">{a.login_date || a.login_time.split(',')[0]}</td>
                        <td className="py-3.5 px-4 text-[#CBD5E1] font-mono flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-[#64748B]" />
                          <span>{a.login_time}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              a.role === 'admin'
                                ? 'bg-purple-950/60 border border-purple-500/40 text-purple-300'
                                : 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300'
                            }`}
                          >
                            {a.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              a.status === 'Successful'
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {a.status === 'Successful' ? (
                              <CheckCircle2 className="w-2.5 h-2.5" />
                            ) : (
                              <XCircle className="w-2.5 h-2.5" />
                            )}
                            <span>{a.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* SECTION 15: USER PROFILE DETAILS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#101827] border border-[#24344A] rounded-2xl p-6 shadow-2xl relative">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#24344A]">
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">USER PROFILE</h3>
                <p className="text-[11px] text-[#64748B]">Real user telemetry & activity trace</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-7 h-7 rounded-lg bg-[#131D2D] text-[#CBD5E1] hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Profile Info Details */}
            <div className="py-5 space-y-4 text-xs">
              <div className="flex items-center gap-4 p-3 rounded-xl bg-[#0A1120] border border-[#24344A]">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#38BDF8] to-[#8B5CF6] text-white flex items-center justify-center text-lg font-black shadow-md">
                  {selectedUser.name[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#F8FAFC]">{selectedUser.name}</div>
                  <div className="text-xs text-[#CBD5E1] font-mono">{selectedUser.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/30 uppercase">
                      {selectedUser.role}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedUser.status === 'active'
                          ? 'bg-emerald-950/60 text-emerald-400'
                          : 'bg-rose-950/60 text-rose-400'
                      }`}
                    >
                      {selectedUser.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Login Timestamps & Counts */}
              <div className="grid grid-cols-3 gap-2.5 font-mono text-[11px]">
                <div className="p-3 rounded-xl bg-[#0A1120] border border-[#24344A]">
                  <span className="text-[10px] text-[#64748B] block font-sans">First Login</span>
                  <span className="font-bold text-[#CBD5E1] mt-0.5 block truncate">
                    {selectedUser.first_login}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A1120] border border-[#24344A]">
                  <span className="text-[10px] text-[#64748B] block font-sans">Last Login</span>
                  <span className="font-bold text-[#CBD5E1] mt-0.5 block truncate">
                    {selectedUser.last_login}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A1120] border border-[#24344A]">
                  <span className="text-[10px] text-[#64748B] block font-sans">Login Count</span>
                  <span className="font-bold text-[#22D3EE] mt-0.5 block">
                    {selectedUser.total_login_count} sessions
                  </span>
                </div>
              </div>

              {/* Streak & Progress */}
              <div className="grid grid-cols-4 gap-2.5 font-mono text-center">
                <div className="p-3 rounded-xl bg-[#0A1120] border border-[#24344A]">
                  <span className="text-[10px] text-[#64748B] block font-sans">Current Streak</span>
                  <span className="text-base font-bold text-[#F59E0B] mt-0.5 block">
                    {selectedUser.current_streak}d
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A1120] border border-[#24344A]">
                  <span className="text-[10px] text-[#64748B] block font-sans">Longest Streak</span>
                  <span className="text-base font-bold text-[#F59E0B] mt-0.5 block">
                    {selectedUser.longest_streak}d
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A1120] border border-[#24344A]">
                  <span className="text-[10px] text-[#64748B] block font-sans">Chapters</span>
                  <span className="text-base font-bold text-[#22C55E] mt-0.5 block">
                    {selectedUser.chapters_completed}/14
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A1120] border border-[#24344A]">
                  <span className="text-[10px] text-[#64748B] block font-sans">Overall</span>
                  <span className="text-base font-bold text-[#22D3EE] mt-0.5 block">
                    {selectedUser.overall_progress}%
                  </span>
                </div>
              </div>

              {/* Execution & Current Focus */}
              <div className="p-3.5 rounded-xl bg-[#0A1120] border border-[#24344A] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#F8FAFC]">
                  <span>Execution Statistics</span>
                  <span className="text-[#22D3EE] font-mono">
                    {selectedUser.programs_executed} Executed · {selectedUser.programs_completed} Completed
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#CBD5E1] pt-1 border-t border-[#24344A]">
                  <span>Active Chapter: <strong className="text-[#38BDF8] uppercase">{selectedUser.current_chapter}</strong></span>
                  <span>Active Program: <strong className="text-[#F8FAFC]">{selectedUser.current_program}</strong></span>
                </div>
              </div>

              {/* Recent Activity List (Section 15 & 26) */}
              <div className="p-3.5 rounded-xl bg-[#0A1120] border border-[#24344A] space-y-2">
                <div className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span>Recent Activity Log</span>
                </div>
                {(!selectedUser.recent_activity || selectedUser.recent_activity.length === 0) ? (
                  <p className="text-[11px] text-[#64748B] italic py-2 text-center">
                    No recorded program executions yet.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {selectedUser.recent_activity.slice(0, 8).map((act, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded bg-[#101827] border border-[#24344A] text-[11px]"
                      >
                        <span className="text-[#CBD5E1] font-semibold">{act.title}</span>
                        <span className="text-[#64748B] font-mono text-[10px]">{act.time || act.timestamp || 'Recent'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-[#24344A] flex items-center justify-between">
              {selectedUser.id !== user.id ? (
                <button
                  onClick={() => handleToggleStatus(selectedUser)}
                  disabled={isUpdatingStatus}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    selectedUser.status === 'active'
                      ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                      : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  {selectedUser.status === 'active' ? 'Deactivate User Account' : 'Reactivate User Account'}
                </button>
              ) : (
                <span className="text-[11px] text-[#64748B]">Current Admin Account</span>
              )}
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-1.5 rounded-xl bg-[#131D2D] hover:bg-[#1a2538] text-xs font-semibold text-[#CBD5E1]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
