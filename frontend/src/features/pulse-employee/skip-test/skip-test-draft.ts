/**
 * Bản nháp của lần làm bài kiểm tra đầu vào, giữ trong sessionStorage của tab: tải lại trang không mất bài. Hai khóa:
 * lựa chọn (câu → phương án) và trạng thái giao diện (câu đang xem, câu đánh dấu xem lại). Bộ nhớ bị chặn thì vẫn làm bài
 * được, chỉ không giữ khi tải lại.
 */

export interface SkipTestUiDraft {
  index: number;
  flags: string[];
}

const answersKey = (courseId: string, attemptNo: number) => `dt-skip-test:${courseId}:${attemptNo}`;
const uiKey = (courseId: string, attemptNo: number) => `dt-skip-test:${courseId}:${attemptNo}:ui`;

function read<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* bộ nhớ trình duyệt bị chặn */
  }
}

export function loadAnswers(courseId: string, attemptNo: number): Record<string, string> {
  const value = read<Record<string, string>>(answersKey(courseId, attemptNo));
  return value && typeof value === 'object' ? value : {};
}

export function saveAnswers(courseId: string, attemptNo: number, answers: Record<string, string>) {
  write(answersKey(courseId, attemptNo), answers);
}

export function loadUi(courseId: string, attemptNo: number): SkipTestUiDraft {
  const value = read<Partial<SkipTestUiDraft>>(uiKey(courseId, attemptNo));
  return {
    index: typeof value?.index === 'number' ? value.index : 0,
    flags: Array.isArray(value?.flags) ? value.flags.filter((f): f is string => typeof f === 'string') : [],
  };
}

export function saveUi(courseId: string, attemptNo: number, ui: SkipTestUiDraft) {
  write(uiKey(courseId, attemptNo), ui);
}

export function clearDraft(courseId: string, attemptNo: number) {
  try {
    sessionStorage.removeItem(answersKey(courseId, attemptNo));
    sessionStorage.removeItem(uiKey(courseId, attemptNo));
  } catch {
    /* bỏ qua */
  }
}
