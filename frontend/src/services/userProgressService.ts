const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export interface RecentActivityItem {
  title: string;
  chapter?: string;
  program?: string;
  time: string;
  timestamp?: string;
  status: 'SUCCESS' | 'STEP' | 'INFO';
  color?: string;
}

export interface UserProgressData {
  currentStreak: number;
  longestStreak: number;
  overallProgress: number;
  chaptersCompleted: number;
  totalChapters: number;
  programsExecuted: number;
  programsCompleted: number;
  totalPrograms: number;
  totalExecutionCount: number;
  learningSessions: number;
  currentChapter: string;
  currentProgram: string;
  chapterProgress: Record<string, number>;
  executedPrograms: string[];
  completedPrograms: string[];
  recentActivity: RecentActivityItem[];
  lastActiveDate: string | null;
  firstLoginAt: string | null;
  lastLoginAt: string | null;
  totalLoginCount: number;
}

const TOTAL_CHAPTERS = 14;
const TOTAL_PROGRAMS = 80;

const DEFAULT_CHAPTER_PROGRESS: Record<string, number> = {
  array: 0,
  stack: 0,
  queue: 0,
  circular_queue: 0,
  linked_list: 0,
  doubly_linked_list: 0,
  binary_tree: 0,
  bst: 0,
  heap: 0,
  graph: 0,
  searching: 0,
  sorting: 0,
  hash_table: 0,
  recursion: 0,
};

export const CHAPTER_PROGRAM_COUNTS: Record<string, number> = {
  array: 6,
  stack: 6,
  queue: 5,
  circular_queue: 5,
  linked_list: 7,
  doubly_linked_list: 6,
  binary_tree: 6,
  bst: 6,
  heap: 6,
  graph: 6,
  searching: 2,
  sorting: 5,
  hash_table: 5,
  recursion: 4,
};

function getTodayCalendarDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateCalendarDaysDifference(dateStr1: string, dateStr2: string): number {
  try {
    const [y1, m1, d1] = dateStr1.split('-').map(Number);
    const [y2, m2, d2] = dateStr2.split('-').map(Number);
    const utc1 = Date.UTC(y1, m1 - 1, d1);
    const utc2 = Date.UTC(y2, m2 - 1, d2);
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    return Math.round((utc2 - utc1) / MS_PER_DAY);
  } catch {
    return 1;
  }
}

export function createInitialUserProgress(user: any): UserProgressData {
  const todayStr = getTodayCalendarDateStr();
  const nowIso = new Date().toISOString();

  return {
    currentStreak: 0,
    longestStreak: 0,
    overallProgress: 0,
    chaptersCompleted: 0,
    totalChapters: TOTAL_CHAPTERS,
    programsExecuted: 0,
    programsCompleted: 0,
    totalPrograms: TOTAL_PROGRAMS,
    totalExecutionCount: 0,
    learningSessions: 0,
    currentChapter: 'Not Started',
    currentProgram: 'Not Started',
    chapterProgress: { ...DEFAULT_CHAPTER_PROGRESS },
    executedPrograms: [],
    completedPrograms: [],
    recentActivity: [],
    lastActiveDate: todayStr,
    firstLoginAt: nowIso,
    lastLoginAt: nowIso,
    totalLoginCount: 1,
  };
}

export function getLocalUserProgress(userId: number | string): UserProgressData | null {
  try {
    const raw = localStorage.getItem(`aids_progress_${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading local user progress', err);
  }
  return null;
}

export function saveLocalUserProgress(userId: number | string, data: UserProgressData): void {
  try {
    localStorage.setItem(`aids_progress_${userId}`, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('aids-progress-updated', { detail: data }));
  } catch (err) {
    console.error('Error saving local user progress', err);
  }
}

export async function fetchUserProgress(user: any): Promise<UserProgressData> {
  if (!user || !user.id) {
    return createInitialUserProgress(user);
  }

  const token = localStorage.getItem('aids_token');
  let progress = getLocalUserProgress(user.id);

  if (token) {
    try {
      const res = await fetch(`${API}/api/user/progress`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          const remote = data.profile;
          progress = {
            currentStreak: remote.currentStreak ?? progress?.currentStreak ?? 0,
            longestStreak: remote.longestStreak ?? progress?.longestStreak ?? 0,
            overallProgress: remote.overallProgress ?? progress?.overallProgress ?? 0,
            chaptersCompleted: remote.chaptersCompleted ?? progress?.chaptersCompleted ?? 0,
            totalChapters: TOTAL_CHAPTERS,
            programsExecuted: remote.programsExecuted ?? progress?.programsExecuted ?? 0,
            programsCompleted: remote.programsCompleted ?? progress?.programsCompleted ?? 0,
            totalPrograms: TOTAL_PROGRAMS,
            totalExecutionCount: remote.totalExecutionCount ?? progress?.totalExecutionCount ?? 0,
            learningSessions: remote.learningSessions ?? progress?.learningSessions ?? 0,
            currentChapter: remote.currentChapter ?? progress?.currentChapter ?? 'Not Started',
            currentProgram: remote.currentProgram ?? progress?.currentProgram ?? 'Not Started',
            chapterProgress: remote.chapterProgress || progress?.chapterProgress || { ...DEFAULT_CHAPTER_PROGRESS },
            executedPrograms: remote.executedPrograms || progress?.executedPrograms || [],
            completedPrograms: remote.completedPrograms || progress?.completedPrograms || [],
            recentActivity: remote.recentActivity || progress?.recentActivity || [],
            lastActiveDate: remote.lastActiveDate || progress?.lastActiveDate || getTodayCalendarDateStr(),
            firstLoginAt: remote.firstLoginAt || progress?.firstLoginAt || new Date().toISOString(),
            lastLoginAt: remote.lastLoginAt || progress?.lastLoginAt || new Date().toISOString(),
            totalLoginCount: remote.totalLoginCount ?? progress?.totalLoginCount ?? 1,
          };
          saveLocalUserProgress(user.id, progress);
          return progress;
        }
      }
    } catch (err) {
      console.warn('Backend progress fetch failed, using local storage state', err);
    }
  }

  if (!progress) {
    progress = createInitialUserProgress(user);
    saveLocalUserProgress(user.id, progress);
  }

  return progress;
}

export function updateStreakOnSession(user: any): UserProgressData {
  if (!user || !user.id) return createInitialUserProgress(user);

  let p = getLocalUserProgress(user.id) || createInitialUserProgress(user);
  const todayStr = getTodayCalendarDateStr();
  const nowIso = new Date().toISOString();

  if (!p.lastActiveDate) {
    p.firstLoginAt = p.firstLoginAt || nowIso;
    p.lastLoginAt = nowIso;
    p.lastActiveDate = todayStr;
    p.totalLoginCount = 1;
    p.currentStreak = 0;
    p.longestStreak = 0;
  } else {
    const diff = calculateCalendarDaysDifference(p.lastActiveDate, todayStr);
    p.lastLoginAt = nowIso;
    p.totalLoginCount = (p.totalLoginCount || 1) + 1;

    if (diff === 0) {
      // Same calendar day: do not increment streak
    } else if (diff === 1) {
      // Next consecutive calendar day: increment streak!
      p.currentStreak = (p.currentStreak || 0) + 1;
      p.longestStreak = Math.max(p.longestStreak || 0, p.currentStreak);
      p.lastActiveDate = todayStr;
    } else if (diff > 1) {
      // Missed day: streak broken, reset to 0
      p.currentStreak = 0;
      p.lastActiveDate = todayStr;
    }
  }

  saveLocalUserProgress(user.id, p);
  return p;
}

export async function recordProgramExecution(
  user: any,
  chapterId: string,
  programId: string,
  programName: string
): Promise<UserProgressData> {
  if (!user || !user.id) {
    return createInitialUserProgress(null);
  }

  let p = getLocalUserProgress(user.id) || createInitialUserProgress(user);
  const progKey = `${chapterId}:${programId}`;

  // 1. Increment execution counts
  p.programsExecuted = (p.programsExecuted || 0) + 1;
  p.totalExecutionCount = (p.totalExecutionCount || 0) + 1;

  if (!p.executedPrograms.includes(progKey)) {
    p.executedPrograms.push(progKey);
  }
  if (!p.completedPrograms.includes(progKey)) {
    p.completedPrograms.push(progKey);
  }
  p.programsCompleted = p.completedPrograms.length;

  // 2. Compute chapter mastery %
  const cap = CHAPTER_PROGRAM_COUNTS[chapterId] || 5;
  const completedInChap = p.completedPrograms.filter((k) => k.startsWith(`${chapterId}:`)).length;
  const chapPct = Math.min(100, Math.round((completedInChap / cap) * 100));

  p.chapterProgress = {
    ...p.chapterProgress,
    [chapterId]: chapPct,
  };

  // 3. Compute chapters completed count (chapters with 100%)
  const completedChapters = Object.values(p.chapterProgress).filter((pct) => pct >= 100).length;
  p.chaptersCompleted = completedChapters;

  // 4. Compute overall progress %
  p.overallProgress = Math.min(100, Math.round((p.completedPrograms.length / TOTAL_PROGRAMS) * 100));

  p.currentChapter = chapterId;
  p.currentProgram = programName;

  // 5. Add recent activity entry
  const newActivity: RecentActivityItem = {
    title: `Executed ${programName}`,
    chapter: chapterId,
    program: programId,
    time: 'Just now',
    status: 'SUCCESS',
    color: 'bg-[#22C55E]',
  };
  p.recentActivity = [newActivity, ...(p.recentActivity || [])].slice(0, 15);

  saveLocalUserProgress(user.id, p);

  // Sync to backend if token available
  const token = localStorage.getItem('aids_token');
  if (token) {
    try {
      fetch(`${API}/api/user/progress/execute`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapter_id: chapterId,
          program_id: programId,
          program_name: programName,
          completed: true,
        }),
      }).catch((e) => console.warn('Background execution sync error', e));
    } catch {}
  }

  return p;
}
