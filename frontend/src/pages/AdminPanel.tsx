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
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  registration_date: string;
  last_login: string;
  programs_completed: number;
  current_streak: number;
}

interface LoginActivityItem {
  id: number;
  user_id: number | null;
  user: string;
  email: string;
  role: string;
  login_time: string;
  status: string;
}

export default function AdminPanel({ user, onLogout }: AdminPanelProps) {
  const navigate = useNavigate();

  // Role Protection: Section 11
  const isAdmin = user && user.role === 'admin';

  const [activeSection, setActiveSection] = useState<'users' | 'activity'>('users');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [activities, setActivities] = useState<LoginActivityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'user' | 'admin' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected User Modal State (Section 18)
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
          {/* Logo & Section 12 Header */}
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

            {/* Logout Button (Section 19) */}
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

        {/* SECTION 13: TOP STATISTICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Users */}
          <div className="p-4 rounded-2xl bg-[#0A1120] border border-[#24344A] shadow-xl relative overflow-hidden group hover:border-[#22D3EE]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#CBD5E1]">Total Users</span>
              <div className="w-7 h-7 rounded-lg bg-[#22D3EE]/15 text-[#22D3EE] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-[#F8FAFC] mt-2">
              {stats ? stats.total_users : isLoading ? '...' : 'No data available'}
            </div>
            <div className="text-[11px] text-[#64748B] mt-1">Platform user accounts</div>
          </div>

          {/* Card 2: Active Users */}
          <div className="p-4 rounded-2xl bg-[#0A1120] border border-[#24344A] shadow-xl relative overflow-hidden group hover:border-[#22C55E]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#CBD5E1]">Active Users</span>
              <div className="w-7 h-7 rounded-lg bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-[#22C55E] mt-2">
              {stats ? stats.active_users : isLoading ? '...' : 'No data available'}
            </div>
            <div className="text-[11px] text-[#64748B] mt-1">Status: Active verified</div>
          </div>

          {/* Card 3: New Users */}
          <div className="p-4 rounded-2xl bg-[#0A1120] border border-[#24344A] shadow-xl relative overflow-hidden group hover:border-[#8B5CF6]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#CBD5E1]">New Users</span>
              <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-[#8B5CF6] mt-2">
              {stats ? stats.new_users : isLoading ? '...' : 'No data available'}
            </div>
            <div className="text-[11px] text-[#64748B] mt-1">Joined in last 7 days</div>
          </div>

          {/* Card 4: Login Sessions */}
          <div className="p-4 rounded-2xl bg-[#0A1120] border border-[#24344A] shadow-xl relative overflow-hidden group hover:border-[#38BDF8]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#CBD5E1]">Login Sessions</span>
              <div className="w-7 h-7 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-[#38BDF8] mt-2">
              {stats ? stats.login_sessions : isLoading ? '...' : 'No data available'}
            </div>
            <div className="text-[11px] text-[#64748B] mt-1">Successful auth handshakes</div>
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

        {/* SECTION 14: USER MANAGEMENT TABLE */}
        {activeSection === 'users' && (
          <div className="rounded-2xl bg-[#0A1120] border border-[#24344A] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#24344A] bg-[#101827]/60 text-[#CBD5E1] font-mono text-[11px]">
                    <th className="py-3.5 px-4 font-bold">User</th>
                    <th className="py-3.5 px-4 font-bold">Email</th>
                    <th className="py-3.5 px-4 font-bold">Role</th>
                    <th className="py-3.5 px-4 font-bold">Registration Date</th>
                    <th className="py-3.5 px-4 font-bold">Last Login</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24344A]/60 font-sans">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-[#64748B]">
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
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#38BDF8] to-[#8B5CF6] text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
                            {u.name[0]?.toUpperCase() || 'U'}
                          </div>
                          <span>{u.name}</span>
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
                        <td className="py-3.5 px-4 text-[#64748B] font-mono">{u.registration_date}</td>
                        <td className="py-3.5 px-4 text-[#CBD5E1] font-mono">{u.last_login}</td>
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

        {/* SECTION 15: LOGIN ACTIVITY TABLE */}
        {activeSection === 'activity' && (
          <div className="rounded-2xl bg-[#0A1120] border border-[#24344A] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#24344A] bg-[#101827]/60 text-[#CBD5E1] font-mono text-[11px]">
                    <th className="py-3.5 px-4 font-bold">User</th>
                    <th className="py-3.5 px-4 font-bold">Email</th>
                    <th className="py-3.5 px-4 font-bold">Login Time</th>
                    <th className="py-3.5 px-4 font-bold">Role</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24344A]/60 font-sans">
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-[#64748B]">
                        {isLoading ? 'Loading activity logs...' : 'No activity records found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((a) => (
                      <tr key={a.id} className="hover:bg-[#131D2D]/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#F8FAFC]">{a.user}</td>
                        <td className="py-3.5 px-4 font-mono text-[#CBD5E1]">{a.email}</td>
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

      {/* SECTION 18: USER DETAILS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#101827] border border-[#24344A] rounded-2xl p-6 shadow-2xl relative">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#24344A]">
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">User Profile</h3>
                <p className="text-[11px] text-[#64748B]">Detailed account records & DSA learning progress</p>
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

              {/* Grid of details */}
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-[#0A1120] border border-[#24344A]">
                  <span className="text-[10px] text-[#64748B] block">Registration Date</span>
                  <span className="text-xs font-bold text-[#CBD5E1] mt-0.5 block">
                    {selectedUser.registration_date}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A1120] border border-[#24344A]">
                  <span className="text-[10px] text-[#64748B] block">Last Login</span>
                  <span className="text-xs font-bold text-[#CBD5E1] mt-0.5 block">
                    {selectedUser.last_login}
                  </span>
                </div>
              </div>

              {/* Learning Progress Section */}
              <div className="p-4 rounded-xl bg-[#0A1120] border border-[#24344A] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#F8FAFC]">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#22D3EE]" />
                    Learning Progress
                  </span>
                  <span className="text-[#22D3EE] font-mono">{selectedUser.programs_completed} Operations</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#101827] border border-[#24344A]">
                    <Code2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <div>
                      <span className="text-[#64748B] block text-[9px]">Programs Completed</span>
                      <span className="font-bold text-[#CBD5E1] font-mono">{selectedUser.programs_completed}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#101827] border border-[#24344A]">
                    <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <div>
                      <span className="text-[#64748B] block text-[9px]">Current Streak</span>
                      <span className="font-bold text-[#CBD5E1] font-mono">{selectedUser.current_streak} days</span>
                    </div>
                  </div>
                </div>
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
