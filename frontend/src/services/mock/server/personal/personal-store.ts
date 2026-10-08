import { onMockReset } from '../../mock-store';
import { COURSE_BY_ID } from '../catalog';
import { courseModules, taskIdOf } from './course-content';
import { ENTRY_QUESTIONS } from './question-bank';

/**
 * Learning state of each individual learner, kept in localStorage (`dt-mock-personal-v1`) so progress survives
 * reloads. The demo account personal@ starts mid-way (target Marketing, entry assessment done, one course
 * finished, one in progress); an account created through sign-up starts empty.
 */

export type SubmissionStatus = 'PENDING_REVIEW' | 'REVISION_REQUESTED' | 'APPROVED';

export interface StoredSubmission {
  linkUrl: string;
  content: string;
  submittedAt: string;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  reviewedAt?: string;
}

export interface StoredAttempt {
  courseId: string;
  at: string;
  correct: number;
  total: number;
  passed: boolean;
}

export interface StoredDiagnostic {
  answers: Record<string, number>;
  /** Level reached in each of the 6 domains, 0–3. */
  domainLevels: number[];
  completedAt: string;
}

/** Summary of the no-account "thử nhanh" flow, carried over when the learner signs up for a trial. */
export interface TryOrientation {
  positionCode: string;
  correct: number;
  total: number;
  completedAt: string;
}

export interface PersonalState {
  targetCode: string | null;
  targetSetAt: string | null;
  diagnostic: StoredDiagnostic | null;
  /** Completed lessons per course: lesson id → completion time. */
  lessons: Record<string, Record<string, string>>;
  attempts: StoredAttempt[];
  notes: Record<string, string>;
  submissions: Record<string, StoredSubmission>;
  /** Courses that used a trial slot, in the order they were opened. */
  trialCourseIds: string[];
  /** Position changes after the first choice. */
  targetChangeCount: number;
  tryOrientation: TryOrientation | null;
  /** UI marker → time it was first set (spec §7.5). */
  seen: Record<string, string>;
}

const STORAGE_KEY = 'dt-mock-personal-v1';
const DEMO_ACCOUNT_ID = 'mock-personal';
export const DEMO_TRIAL_ACCOUNT_ID = 'mock-trial';
export const DEMO_FREE_ACCOUNT_ID = 'mock-free';
const DAY_MS = 24 * 60 * 60 * 1000;

let cache: Record<string, PersonalState> | null = null;

const emptyState = (): PersonalState => ({
  targetCode: null,
  targetSetAt: null,
  diagnostic: null,
  lessons: {},
  attempts: [],
  notes: {},
  submissions: {},
  trialCourseIds: [],
  targetChangeCount: 0,
  tryOrientation: null,
  seen: {},
});

/**
 * Fills in what a state saved before the trial existed does not have. A course the learner had already started
 * counts as a trial slot (BR-05); nothing else changes, so saved progress is never lost.
 */
export function withDefaults(stored: Partial<PersonalState>): PersonalState {
  const base = emptyState();
  const startedCourses = Object.keys(stored.lessons ?? {}).filter((id) => Object.keys(stored.lessons?.[id] ?? {}).length > 0);
  return {
    ...base,
    ...stored,
    trialCourseIds: Array.isArray(stored.trialCourseIds) ? stored.trialCourseIds : startedCourses,
    targetChangeCount: typeof stored.targetChangeCount === 'number' ? stored.targetChangeCount : 0,
    tryOrientation: stored.tryOrientation ?? null,
    seen: stored.seen && typeof stored.seen === 'object' && !Array.isArray(stored.seen) ? stored.seen : {},
  };
}

/** Answers that reach the given level in each domain: right up to the level, wrong after it. */
function answersForLevels(levels: number[]): Record<string, number> {
  const answers: Record<string, number> = {};
  ENTRY_QUESTIONS.forEach((question) => {
    const reached = levels[question.domainNumber - 1];
    answers[question.id] = question.level <= reached ? question.correctIndex : (question.correctIndex + 1) % question.options.length;
  });
  return answers;
}

/** Clock helpers of the demo states: dates are relative to when the module is loaded, so each demo looks current. */
function demoClock() {
  const now = Date.now();
  const at = (daysAgo: number, hour = 20) => {
    const date = new Date(now - daysAgo * DAY_MS);
    date.setHours(hour, 15, 0, 0);
    return date.toISOString();
  };
  const lessonsDone = (courseId: string, count: number, firstDaysAgo: number) => {
    const course = COURSE_BY_ID.get(courseId)!;
    const lessons = courseModules(course).flatMap((module) => module.lessons).slice(0, count);
    return Object.fromEntries(lessons.map((lesson, index) => [lesson.id, at(Math.max(1, firstDaysAgo - index), 19 + (index % 3))]));
  };
  return { at, lessonsDone };
}

export function demoState(): PersonalState {
  const { at, lessonsDone } = demoClock();
  const domainLevels = [2, 1, 1, 1, 1, 0];

  return withDefaults({
    targetCode: 'MARKETING',
    targetSetAt: at(24, 9),
    diagnostic: { answers: answersForLevels(domainLevels), domainLevels, completedAt: at(23, 10) },
    lessons: {
      'crs-M6-F': lessonsDone('crs-M6-F', 9, 21),
      'crs-A3-I': lessonsDone('crs-A3-I', 5, 7),
    },
    attempts: [
      { courseId: 'crs-M6-F', at: at(12, 21), correct: 3, total: 4, passed: false },
      { courseId: 'crs-M6-F', at: at(11, 20), correct: 4, total: 4, passed: true },
    ],
    notes: {
      'crs-A3-I': 'Bài đăng tháng 10: dùng lại 3 bài blog cũ, cập nhật số liệu Q3 và kiểm tra giấy phép ảnh.',
    },
    submissions: {
      [taskIdOf('crs-M6-F')]: {
        linkUrl: 'https://docs.google.com/document/d/demo-cau-lenh-email',
        content: 'Viết câu lệnh cho email nhắc gia hạn gói dịch vụ, so sánh 3 phiên bản và sửa 2 chỗ AI ghi sai ngày ưu đãi.',
        submittedAt: at(10, 21),
        status: 'APPROVED',
        score: 88,
        feedback: 'Câu lệnh rõ mục đích, giọng văn và độ dài. Bạn đã phát hiện lỗi ngày tháng — đúng tinh thần kiểm chứng.',
        reviewedAt: at(8, 15),
      },
    },
  });
}

/** trial@: day 5 of 7, assessed, one course passed (pending certificate), one in progress, 2 of 3 slots used. */
export function demoTrialState(): PersonalState {
  const { at, lessonsDone } = demoClock();
  const domainLevels = [1, 1, 1, 1, 0, 0];

  return withDefaults({
    targetCode: 'ACCOUNTANT',
    targetSetAt: at(5, 9),
    diagnostic: { answers: answersForLevels(domainLevels), domainLevels, completedAt: at(4, 10) },
    lessons: {
      'crs-A5-F': lessonsDone('crs-A5-F', 12, 4),
      'crs-A1-I': lessonsDone('crs-A1-I', 3, 2),
    },
    attempts: [{ courseId: 'crs-A5-F', at: at(2, 21), correct: 4, total: 4, passed: true }],
    trialCourseIds: ['crs-A5-F', 'crs-A1-I'],
  });
}

/** free@: the trial ended three days ago; assessed on day one, one course passed (pending certificate). */
export function demoFreeState(): PersonalState {
  const { at, lessonsDone } = demoClock();
  const domainLevels = [1, 1, 1, 1, 1, 0];

  return withDefaults({
    targetCode: 'SALES_CRM',
    targetSetAt: at(10, 9),
    diagnostic: { answers: answersForLevels(domainLevels), domainLevels, completedAt: at(10, 10) },
    lessons: { 'crs-M6-F': lessonsDone('crs-M6-F', 9, 8) },
    attempts: [{ courseId: 'crs-M6-F', at: at(6, 21), correct: 4, total: 4, passed: true }],
    trialCourseIds: ['crs-M6-F'],
    seen: { path: at(10, 11), 'tip-diagnostic-result': at(10, 11) },
  });
}

const DEMO_STATES: Record<string, () => PersonalState> = {
  [DEMO_ACCOUNT_ID]: demoState,
  [DEMO_TRIAL_ACCOUNT_ID]: demoTrialState,
  [DEMO_FREE_ACCOUNT_ID]: demoFreeState,
};

function read(): Record<string, PersonalState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Partial<PersonalState>>;
    return Object.fromEntries(Object.entries(parsed).map(([userId, state]) => [userId, withDefaults(state)]));
  } catch {
    return {};
  }
}

function write(all: Record<string, PersonalState>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Storage full or blocked: the session still works from memory.
  }
}

/** Read afresh each time: the learner may have another tab open, and the server's word is the saved one. */
function all(): Record<string, PersonalState> {
  cache = read();
  return cache;
}

export function getPersonalState(userId: string): PersonalState {
  const states = all();
  if (!states[userId]) {
    states[userId] = DEMO_STATES[userId]?.() ?? emptyState();
    write(states);
  }
  return states[userId];
}

/** Applies a change to a copy of the learner's state and persists it. */
export function updatePersonalState<T>(userId: string, change: (state: PersonalState) => T): T {
  const states = all();
  const next = JSON.parse(JSON.stringify(getPersonalState(userId))) as PersonalState;
  const result = change(next);
  states[userId] = next;
  write(states);
  return result;
}

export function resetPersonalStore(): void {
  cache = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

onMockReset(resetPersonalStore);
