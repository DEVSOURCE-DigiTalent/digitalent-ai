import { isAxiosError } from 'axios';
import type { ApiResponse } from '@/types/api';
import type {
  PulseBlockReason,
  PulseCourseAccess,
  PulseCourseSummary,
  PulseDomain,
  PulseFinalStatus,
  PulseLevelSource,
  PulsePreStatus,
  PulseProctoringEventKind,
  PulseSlotStatus,
  PulseSupportAction,
} from '@/services/pulse.service';

/** Mức năng lực: 0 = chưa xác nhận, 1–3 = Cơ bản / Trung cấp / Nâng cao. */
export const LEVEL_NAMES = ['Chưa xác nhận', 'Cơ bản', 'Trung cấp', 'Nâng cao'] as const;

export const levelName = (level: number | null | undefined) => LEVEL_NAMES[Math.max(0, Math.min(3, level ?? 0))];

/** "L2" hoặc "Đang chờ" khi chưa có mức đo được. */
export const levelShort = (level: number | null | undefined) => (level && level > 0 ? `L${level}` : 'Đang chờ');

export const pad2 = (n: number) => String(n).padStart(2, '0');

export const SOURCE_LABELS: Record<PulseLevelSource, string> = {
  NONE: 'Chưa có khóa nào được công nhận',
  COURSE: 'Khóa học được công nhận',
  PRACTICAL_EVIDENCE: 'Minh chứng thực tế được duyệt',
};

export const ACCESS_LABELS: Record<PulseCourseAccess, string> = {
  FREE_FULL: 'Miễn phí toàn bộ',
  SEAT_ACTIVE: 'Đã có suất học',
  PREVIEW: 'Chỉ xem trước',
};

/** Nhãn trạng thái của một khóa với nhân viên. */
export const SLOT_LABELS: Record<PulseSlotStatus, string> = {
  COMPLETED: 'Đã đạt',
  PRE_ASSESSMENT: 'Cần đánh giá',
  PRE_REVIEW: 'Chờ quản lý chấm',
  TO_LEARN: 'Cần học',
  IN_PROGRESS: 'Đang học',
  FINAL_READY: 'Đã học xong',
  IN_REVIEW: 'Chờ quản lý chấm',
  RETRY_WAIT: 'Chờ mở lần nộp cuối',
  NEEDS_SUPPORT: 'Cần hỗ trợ',
  SEAT_NEEDED: 'Cần suất học',
  AFTER_PRIOR_LEVEL: 'Chưa mở',
  ABOVE_CEILING: 'Ngoài trần',
  OUTSIDE_PATH: 'Ngoài lộ trình',
  NO_POSITION: 'Chưa có vị trí',
};

/** Màu nhãn trạng thái của khóa (pulse.css `.pu-state-*`). */
export const slotTone = (status: PulseSlotStatus): 'passed' | 'ready' | 'review' | 'learning' | 'final' | 'fail' | 'locked' | 'beyond' =>
  status === 'COMPLETED' ? 'passed'
    : status === 'PRE_ASSESSMENT' ? 'ready'
    : status === 'PRE_REVIEW' || status === 'IN_REVIEW' ? 'review'
    : status === 'IN_PROGRESS' ? 'learning'
    : status === 'FINAL_READY' || status === 'RETRY_WAIT' ? 'final'
    : status === 'TO_LEARN' || status === 'NEEDS_SUPPORT' || status === 'SEAT_NEEDED' ? 'fail'
    : status === 'ABOVE_CEILING' || status === 'OUTSIDE_PATH' ? 'beyond'
    : 'locked';

export const PRE_LABELS: Record<PulsePreStatus, string> = {
  REQUIRED: 'Cần làm bài đánh giá',
  LOCKED: 'Chưa mở',
  PENDING: 'Chờ quản lý chấm',
  PASSED: 'Đạt — khóa được công nhận',
  NOT_YET: 'Chưa đạt — học khóa',
  NOT_NEEDED: 'Không cần',
};

export const FINAL_LABELS: Record<PulseFinalStatus, string> = {
  NOT_STARTED: 'Chưa bắt đầu',
  LEARNING: 'Đang học mô đun',
  READY: 'Sẵn sàng làm bài',
  PENDING: 'Chờ quản lý chấm',
  APPROVED: 'Đã duyệt',
  RETRY_WAIT: 'Chờ mở lần nộp cuối',
  RETRY_READY: 'Mở lần nộp cuối',
  DEADLINE_MISSED: 'Quá hạn nộp lại',
  FLAGGED: 'Cần hỗ trợ',
};

/** Màu nhãn trạng thái bài cuối khóa. */
export const finalTone = (status: PulseFinalStatus): 'green' | 'coral' | 'gray' | '' =>
  status === 'APPROVED' ? 'green'
    : status === 'FLAGGED' || status === 'DEADLINE_MISSED' || status === 'RETRY_WAIT' ? 'coral'
    : status === 'NOT_STARTED' || status === 'LEARNING' ? 'gray'
    : '';

export const BLOCK_MESSAGES: Record<PulseBlockReason, string> = {
  NO_POSITION: 'Bạn chưa được gán vị trí công việc nên chưa có lộ trình học. Hãy liên hệ chủ doanh nghiệp.',
  OUTSIDE_PATH: 'Vị trí của bạn không yêu cầu lĩnh vực này. Bạn vẫn đọc được nội dung miễn phí nhưng không ghi tiến độ lộ trình.',
  ABOVE_CEILING: 'Doanh nghiệp chưa mở cấp độ này của lĩnh vực cho phòng ban của bạn.',
  PRIOR_LEVEL_REQUIRED: 'Khóa mở khi bạn đạt khóa ở cấp trước của cùng lĩnh vực.',
  PRE_ASSESSMENT_REQUIRED: 'Bạn cần làm bài đánh giá năng lực trước khi học khóa này. Đạt thì khóa được công nhận, chưa đạt thì bạn học khóa. Bạn vẫn đọc được nội dung, nhưng tiến độ chỉ được ghi sau bài đánh giá.',
  PRE_ASSESSMENT_PENDING: 'Bài đánh giá trước khi học đang chờ quản lý chấm. Nếu chưa đạt, khóa sẽ mở để bạn học.',
  SEAT_REQUIRED: 'Cấp độ này cần suất học do chủ doanh nghiệp phân bổ. Bạn xem được đề cương và trang mẫu đầu tiên trước.',
  PREVIOUS_MODULE_REQUIRED: 'Hãy đạt câu hỏi ôn tập của mô đun trước để mở câu hỏi của mô đun này.',
  SLIDES_NOT_VIEWED: 'Đọc hết các trang nội dung để mở câu hỏi ôn tập.',
  REVIEW_REQUIRED: 'Mở lại trang nội dung của câu chưa đúng để làm lần tiếp theo — lần sau là câu hỏi khác.',
  QUIZ_CHANGED: 'Bộ câu hỏi đã đổi sang lần làm mới. Hãy tải lại trang để làm với câu hỏi mới.',
};

export const SUPPORT_LABELS: Record<PulseSupportAction, string> = {
  COACHING: 'Quản lý sắp xếp kèm cặp',
  FRESH_CYCLE: 'Quản lý đề xuất một chu kỳ học mới',
  PAUSE: 'Lộ trình tạm dừng theo quyết định của quản lý',
};

/** Nhật ký giám sát của bài làm. */
export const PROCTORING_EVENT_LABELS: Record<PulseProctoringEventKind, string> = {
  STARTED: 'Bắt đầu ghi màn hình, camera và micro',
  TAB_HIDDEN: 'Rời tab bài làm',
  FOCUS_LOST: 'Rời cửa sổ trình duyệt',
  SHARE_STOPPED: 'Ngừng chia sẻ màn hình, bài tạm khóa',
  SHARE_RESUMED: 'Chia sẻ lại toàn bộ màn hình',
  CAMERA_STOPPED: 'Mất camera, bài tạm khóa',
  CAMERA_RESUMED: 'Bật lại camera',
  MIC_STOPPED: 'Mất micro, bài tạm khóa',
  MIC_RESUMED: 'Bật lại micro',
  SUBMITTED: 'Nộp bài, kết thúc ghi hình',
};

export const LESSON_TYPE_LABELS: Record<string, string> = {
  TEXT: 'Bài đọc',
  VIDEO: 'Bài giảng',
  CASE_STUDY: 'Tình huống',
  GUIDED_PRACTICE: 'Thực hành có hướng dẫn',
  WORKPLACE_SCENARIO: 'Tình huống công việc',
  QUIZ: 'Câu hỏi',
  REFLECTION: 'Suy ngẫm',
  ASSIGNMENT: 'Bài tập',
};

/** Tóm tắt một lĩnh vực trên lộ trình: mục tiêu, trần phòng ban (khi thấp hơn) và số khóa đã đạt. */
export function domainSummary(domain: PulseDomain, courses: PulseCourseSummary[]): string {
  const path = courses.filter((c) => c.categoryId === domain.categoryId && c.zone === 'PATH');
  const optional = courses.filter((c) => c.categoryId === domain.categoryId && c.zone === 'OPTIONAL').length;
  const parts = [`Mục tiêu ${levelName(domain.target)}`];
  if (domain.ceiling < domain.target) parts.push(`trần phòng ban ${levelName(domain.ceiling)}`);
  parts.push(`${path.filter((c) => c.approved).length}/${path.length} khóa đạt`);
  if (optional) parts.push(`${optional} khóa tùy chọn`);
  return parts.join(' · ');
}

/** Ghi chú khi trần phòng ban thấp hơn mục tiêu vị trí. */
export function capNote(domain: PulseDomain, positionName: string | null | undefined, departmentName: string | null | undefined): string | null {
  if (domain.target === 0 || domain.ceiling >= domain.target) return null;
  return `Vị trí ${positionName ?? 'của bạn'} yêu cầu mức ${levelName(domain.target)}, nhưng doanh nghiệp đặt trần cho ${departmentName ? `phòng ${departmentName}` : 'phòng ban của bạn'} ở mức ${levelName(domain.ceiling)}, nên lộ trình dừng ở mức ${levelName(domain.pathTop)}.`;
}

/** "41 phút 12 giây", "45 giây". */
export function formatDuration(ms: number | null | undefined): string {
  const total = Math.max(0, Math.round((ms ?? 0) / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours) return `${hours} giờ ${minutes} phút`;
  if (minutes) return `${minutes} phút ${seconds} giây`;
  return `${seconds} giây`;
}

/** Đồng hồ "mm:ss" (hoặc "h:mm:ss" khi quá một giờ). */
export function clock(ms: number | null | undefined): string {
  const total = Math.max(0, Math.floor((ms ?? 0) / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const mmss = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return hours ? `${hours}:${mmss}` : mmss;
}

/** Lời nhắn lỗi từ API: ưu tiên lỗi chi tiết theo trường (validator) rồi tới message, cuối cùng là fallback. */
export function pulseErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ApiResponse<unknown>>(error)) {
    const data = error.response?.data;
    const detail = data?.errors?.find((e) => e.message && !/^[A-Z_]+$/.test(e.message))?.message;
    return detail || data?.message || fallback;
  }
  return fallback;
}

/** Mã lỗi máy đọc được của API (errors[].message dạng CHUNK_OUT_OF_ORDER). */
export function pulseErrorCode(error: unknown): string | null {
  if (isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.errors?.find((e) => e.message && /^[A-Z_]+$/.test(e.message))?.message ?? null;
  }
  return null;
}

export function initials(name: string | null | undefined): string {
  return (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]!.toUpperCase())
    .join('') || 'NV';
}

/** "còn 3 ngày", "còn 5 giờ", "đã qua". */
export function timeLeft(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return '—';
  const ms = new Date(iso).getTime() - now;
  if (Number.isNaN(ms)) return '—';
  if (ms <= 0) return 'đã qua';
  const hours = Math.ceil(ms / 3_600_000);
  return hours >= 48 ? `còn ${Math.ceil(hours / 24)} ngày` : `còn ${hours} giờ`;
}
