import { isAxiosError } from 'axios';
import type { ApiResponse } from '@/types/api';
import type {
  PulseBlockReason,
  PulseCourseAccess,
  PulseDomain,
  PulseFinalStatus,
  PulseLevelSource,
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
  BASELINE: 'Bài kiểm tra đầu vào',
  COURSE: 'Khóa học được quản lý duyệt',
  PRACTICAL_EVIDENCE: 'Minh chứng thực tế được duyệt',
};

export const ACCESS_LABELS: Record<PulseCourseAccess, string> = {
  FREE_FULL: 'Miễn phí toàn bộ',
  SEAT_ACTIVE: 'Đã có suất học',
  PREVIEW: 'Chỉ xem trước',
};

export const SLOT_LABELS: Record<PulseSlotStatus, string> = {
  COMPLETED: 'Đã hoàn thành',
  IN_REVIEW: 'Đang chờ chấm',
  IN_PROGRESS: 'Đang học',
  SEAT_HELD: 'Đã giữ suất',
  NEEDS_SUPPORT: 'Cần hỗ trợ',
  AFTER_BASELINE: 'Sau bài đầu vào',
  FREE_TO_START: 'Miễn phí · bắt đầu được',
  SEAT_NEEDED: 'Cần suất học',
  AFTER_PRIOR_LEVEL: 'Sau khi đạt cấp trước',
};

export const FINAL_LABELS: Record<PulseFinalStatus, string> = {
  NOT_STARTED: 'Chưa bắt đầu',
  LEARNING: 'Đang học mô đun',
  READY: 'Sẵn sàng nộp',
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
  NOT_ASSESSED: 'Hãy làm bài kiểm tra đầu vào trước. Bạn vẫn đọc được nội dung, nhưng tiến độ chỉ bắt đầu ghi sau khi có mức khởi điểm.',
  OUTSIDE_PATH: 'Khóa học nằm ngoài mục tiêu vị trí của bạn. Bạn vẫn đọc được nội dung miễn phí nhưng không ghi tiến độ lộ trình.',
  SEAT_REQUIRED: 'Cấp độ này cần suất học do chủ doanh nghiệp phân bổ. Bạn xem được đề cương và trang mẫu đầu tiên trước.',
  PRIOR_LEVEL_REQUIRED: 'Bạn đã có suất. Khóa sẽ mở toàn bộ khi khóa cấp trước cùng lĩnh vực được quản lý duyệt.',
  PREVIOUS_MODULE_REQUIRED: 'Hãy đạt câu hỏi ôn tập của mô đun trước để mở câu hỏi của mô đun này.',
  SLIDES_NOT_VIEWED: 'Đọc hết các trang nội dung để mở câu hỏi ôn tập.',
};

export const SUPPORT_LABELS: Record<PulseSupportAction, string> = {
  COACHING: 'Quản lý sắp xếp kèm cặp',
  FRESH_CYCLE: 'Quản lý đề xuất một chu kỳ học mới',
  PAUSE: 'Lộ trình tạm dừng theo quyết định của quản lý',
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

/** Nhãn ngắn trên ô lĩnh vực của lộ trình. */
export function domainBadge(domain: PulseDomain, assessed: boolean): string {
  if (domain.target === 0) return 'Ngoài lộ trình';
  if (!assessed) return 'Cần bài đầu vào';
  if (domain.status === 'MET') return 'Đã đạt mục tiêu';
  if (domain.status === 'GAP') return `${domain.gap} mức cần tăng`;
  return 'Chưa đo được';
}

export const domainTone = (domain: PulseDomain): 'gap' | 'met' | 'pending' =>
  domain.status === 'GAP' ? 'gap' : domain.status === 'MET' ? 'met' : 'pending';

/** Lời nhắn lỗi từ API: ưu tiên lỗi chi tiết theo trường (validator) rồi tới message, cuối cùng là fallback. */
export function pulseErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ApiResponse<unknown>>(error)) {
    const data = error.response?.data;
    const detail = data?.errors?.find((e) => e.message && !/^[A-Z_]+$/.test(e.message))?.message;
    return detail || data?.message || fallback;
  }
  return fallback;
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
