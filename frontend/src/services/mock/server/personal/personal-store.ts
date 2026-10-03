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

export interface PersonalState {
  targetCode: string | null;
  targetSetAt: string | null;
  diagnostic: StoredDiagnostic | null;
  /** Completed lessons per course: lesson id → completion time. */
  lessons: Record<string, Record<string, string>>;
  attempts: StoredAttempt[];
  notes: Record<string, string>;
  submissions: Record<string, StoredSubmission>;
}

const STORAGE_KEY = 'dt-mock-personal-v1';
const DEMO_ACCOUNT_ID = 'mock-personal';
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
});

/** Answers that reach the given level in each domain: right up to the level, wrong after it. */
function answersForLevels(levels: number[]): Record<string, number> {
  const answers: Record<string, number> = {};
  ENTRY_QUESTIONS.forEach((question) => {
    const reached = levels[question.domainNumber - 1];
    answers[question.id] = question.level <= reached ? question.correctIndex : (question.correctIndex + 1) % question.options.length;
  });
  return answers;
}

export function demoState(): PersonalState {
  const now = Date.now();
  const at = (daysAgo: number, hour = 20) => {
    const date = new Date(now - daysAgo * DAY_MS);
    date.setHours(hour, 15, 0, 0);
    return date.toISOString();
  };
  const domainLevels = [2, 1, 1, 1, 1, 0];

  const lessonsDone = (courseId: string, count: number, firstDaysAgo: number) => {
    const course = COURSE_BY_ID.get(courseId)!;
    const lessons = courseModules(course).flatMap((module) => module.lessons).slice(0, count);
    return Object.fromEntries(lessons.map((lesson, index) => [lesson.id, at(Math.max(1, firstDaysAgo - index), 19 + (index % 3))]));
  };

  return {
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
  };
}

function read(): Record<string, PersonalState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, PersonalState>) : {};
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

function all(): Record<string, PersonalState> {
  if (!cache) cache = read();
  return cache;
}

export function getPersonalState(userId: string): PersonalState {
  const states = all();
  if (!states[userId]) {
    states[userId] = userId === DEMO_ACCOUNT_ID ? demoState() : emptyState();
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
