import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AICopilotModal from '../components/AICopilotModal';
import { chapters } from '../programCatalog';
import {
  fetchUserProgress,
  getLocalUserProgress,
  type UserProgressData,
} from '../services/userProgressService';

export default function Progress({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [progress, setProgress] = useState<UserProgressData>(() => {
    return getLocalUserProgress(user?.id) || {
      currentStreak: 0,
      longestStreak: 0,
      overallProgress: 0,
      chaptersCompleted: 0,
      totalChapters: 14,
      programsExecuted: 0,
      programsCompleted: 0,
      totalPrograms: 80,
      totalExecutionCount: 0,
      learningSessions: 0,
      currentChapter: 'Not Started',
      currentProgram: 'Not Started',
      chapterProgress: {},
      executedPrograms: [],
      completedPrograms: [],
      recentActivity: [],
      lastActiveDate: null,
      firstLoginAt: null,
      lastLoginAt: null,
      totalLoginCount: 1,
    };
  });

  useEffect(() => {
    if (user?.id) {
      fetchUserProgress(user).then((p) => setProgress(p));
    }

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setProgress(e.detail);
      }
    };
    window.addEventListener('aids-progress-updated', handleUpdate);
    return () => window.removeEventListener('aids-progress-updated', handleUpdate);
  }, [user]);

  // Real values calculated from user activity
  const completedProgramsCount = progress.programsExecuted || 0;
  const totalProgramsCount = progress.totalPrograms || 80;
  const completedChaptersCount = progress.chaptersCompleted || 0;
  const totalChaptersCount = progress.totalChapters || 14;
  const streakDays = progress.currentStreak || 0;
  const overallPercent = progress.overallProgress || 0;

  // Real badges computed dynamically from actual achievements
  const badges = [
    {
      title: 'Array Master',
      icon: '⚡',
      unlocked: (progress.chapterProgress?.['array'] || 0) >= 100,
      desc: 'Completed all 6 Array operations',
    },
    {
      title: 'Stack & Queue Champion',
      icon: '▥',
      unlocked:
        (progress.chapterProgress?.['stack'] || 0) >= 100 &&
        (progress.chapterProgress?.['queue'] || 0) >= 100,
      desc: 'Mastered push, pop, enqueue, dequeue',
    },
    {
      title: 'Tree Navigator',
      icon: '⌘',
      unlocked: (progress.chapterProgress?.['binary_tree'] || 0) >= 100,
      desc: 'Performed Inorder, Preorder, and Postorder traversals',
    },
    {
      title: 'Graph Explorer',
      icon: '✣',
      unlocked: (progress.chapterProgress?.['graph'] || 0) >= 100,
      desc: 'Executed BFS & DFS algorithms',
    },
    {
      title: 'Recursion Master',
      icon: '↘',
      unlocked: (progress.chapterProgress?.['recursion'] || 0) >= 100,
      desc: 'Solve recursive call trace problems',
    },
    {
      title: 'Algorithm Speedrunner',
      icon: '⏱',
      unlocked: completedProgramsCount >= 10,
      desc: 'Step through 10+ real program execution events',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050914] text-[#F8FAFC] font-sans flex flex-col">
      <Navbar user={user} onLogout={onLogout} onOpenCopilot={() => setIsCopilotOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <header className="mb-8">
          <div className="text-xs font-mono text-[#22D3EE] uppercase tracking-wider mb-2 font-bold">
            ANALYTICS & MILESTONES
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#F8FAFC]">Learning Progress & Stats</h1>
          <p className="text-sm text-[#CBD5E1] mt-1">
            Track your real program execution practice, streaks, and unlocked achievements.
          </p>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Overall Completion */}
          <div className="bg-[#0A1120] border border-[#24344A] rounded-2xl p-6 shadow-xl">
            <h3 className="text-[#64748B] text-xs font-mono font-bold uppercase tracking-wider mb-2">
              Overall Completion
            </h3>
            <div className="text-3xl font-extrabold text-[#22D3EE]">{overallPercent}%</div>
            <div className="w-full bg-[#050914] rounded-full h-2 mt-4 overflow-hidden border border-[#24344A]">
              <div
                className="bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-[#64748B] mt-2">
              {overallPercent === 0 ? 'No progress yet' : `${overallPercent}% curriculum mastered`}
            </p>
          </div>

          {/* Chapters Completed */}
          <div className="bg-[#0A1120] border border-[#24344A] rounded-2xl p-6 shadow-xl">
            <h3 className="text-[#64748B] text-xs font-mono font-bold uppercase tracking-wider mb-2">
              Chapters Completed
            </h3>
            <div className="text-3xl font-extrabold text-[#F8FAFC]">
              {completedChaptersCount} <span className="text-sm text-[#64748B] font-normal">/ {totalChaptersCount}</span>
            </div>
            <div className="text-xs text-[#22C55E] mt-3 font-semibold">
              {completedChaptersCount === 0
                ? 'Start your first chapter'
                : `${completedChaptersCount} of 14 chapters finished`}
            </div>
          </div>

          {/* Programs Executed */}
          <div className="bg-[#0A1120] border border-[#24344A] rounded-2xl p-6 shadow-xl">
            <h3 className="text-[#64748B] text-xs font-mono font-bold uppercase tracking-wider mb-2">
              Programs Executed
            </h3>
            <div className="text-3xl font-extrabold text-[#F8FAFC]">
              {completedProgramsCount} <span className="text-sm text-[#64748B] font-normal">/ {totalProgramsCount}</span>
            </div>
            <div className="text-xs text-[#CBD5E1] mt-3">
              {completedProgramsCount === 0 ? 'No programs executed yet' : 'Real interactive traces generated'}
            </div>
          </div>

          {/* Current Daily Streak */}
          <div className="bg-[#0A1120] border border-[#24344A] rounded-2xl p-6 shadow-xl">
            <h3 className="text-[#64748B] text-xs font-mono font-bold uppercase tracking-wider mb-2">
              Current Daily Streak
            </h3>
            <div className="text-3xl font-extrabold text-[#F59E0B] flex items-center gap-2">
              <span>{streakDays} Days</span>
              <span className="text-2xl animate-bounce">🔥</span>
            </div>
            <div className="text-xs text-[#F59E0B]/80 mt-3 font-semibold">
              {streakDays === 0
                ? 'Start your learning journey today'
                : 'Active learning streak! Keep it up tomorrow'}
            </div>
          </div>
        </div>

        {/* Chapter Breakdown & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chapter Progress Breakdown (Section 25) */}
          <div className="lg:col-span-2 bg-[#0A1120] border border-[#24344A] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#F8FAFC]">Chapter Mastery Breakdown</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Real-time completion percentage per data structure</p>
              </div>
              <span className="text-xs font-mono text-[#22D3EE] font-bold">14 Topics</span>
            </div>

            <div className="space-y-4">
              {chapters.map((chap) => {
                const pct = progress.chapterProgress?.[chap.id] || 0;
                return (
                  <div key={chap.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-2 text-[#CBD5E1]">
                        <span className="text-sm">{chap.icon}</span>
                        <span>{chap.label}</span>
                      </span>
                      <span className="font-mono text-[#22D3EE]">{pct}%</span>
                    </div>
                    <div className="w-full bg-[#050914] rounded-full h-2 overflow-hidden border border-[#24344A]">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          pct === 100
                            ? 'bg-[#22C55E]'
                            : pct > 50
                            ? 'bg-[#22D3EE]'
                            : pct > 0
                            ? 'bg-[#F59E0B]'
                            : 'bg-transparent'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badges / Achievements */}
          <div className="bg-[#0A1120] border border-[#24344A] rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#F8FAFC] mb-6">Unlocked Badges</h3>
            <div className="space-y-4">
              {badges.map((b) => (
                <div
                  key={b.title}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                    b.unlocked
                      ? 'bg-[#131D2D] border-[#22D3EE]/30 shadow-md'
                      : 'bg-[#050914]/60 border-[#24344A] opacity-60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22D3EE]/20 to-[#8B5CF6]/20 border border-[#22D3EE]/40 flex items-center justify-center text-xl shrink-0">
                    {b.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#F8FAFC] flex items-center gap-2">
                      <span>{b.title}</span>
                      {b.unlocked && <span className="text-[10px] text-[#22C55E]">✓ UNLOCKED</span>}
                    </h4>
                    <p className="text-[11px] text-[#CBD5E1] mt-1">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <AICopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        context={{ chapterId: 'progress' }}
      />
    </div>
  );
}
