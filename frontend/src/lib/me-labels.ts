import type { BadgeVariant } from '@/components/shared/status-variant';

/** Nhãn + màu trạng thái cho các trang cá nhân EM-* (khớp mã trạng thái của API /me/*). */
interface StatusLabel {
  label: string;
  variant: BadgeVariant;
}

const pick = (map: Record<string, StatusLabel>, status: string | null | undefined, fallback: StatusLabel): StatusLabel =>
  (status && map[status]) || fallback;

const ENROLLMENT: Record<string, StatusLabel> = {
  NOT_STARTED: { label: 'Chưa bắt đầu', variant: 'default' },
  IN_PROGRESS: { label: 'Đang học', variant: 'info' },
  READY_FOR_ASSESSMENT: { label: 'Sẵn sàng đánh giá', variant: 'purple' },
  COMPLETED: { label: 'Đã hoàn thành', variant: 'success' },
  CANCELLED: { label: 'Đã hủy', variant: 'danger' },
  RECOMMENDED: { label: 'Được đề xuất', variant: 'warning' },
};

export const enrollmentStatus = (status: string | null | undefined) => pick(ENROLLMENT, status, ENROLLMENT.NOT_STARTED);

const ASSESSMENT: Record<string, StatusLabel> = {
  AVAILABLE: { label: 'Có thể làm', variant: 'info' },
  IN_PROGRESS: { label: 'Đang làm dở', variant: 'warning' },
  PASSED: { label: 'Đã đạt', variant: 'success' },
  RETAKE: { label: 'Chưa đạt · được làm lại', variant: 'danger' },
  LOCKED: { label: 'Chưa mở', variant: 'default' },
  NO_ATTEMPTS_LEFT: { label: 'Hết lượt làm', variant: 'danger' },
};

export const assessmentStatus = (status: string | null | undefined) => pick(ASSESSMENT, status, ASSESSMENT.AVAILABLE);

export const ASSESSMENT_TYPE_LABELS: Record<string, string> = {
  PRACTICE: 'Luyện tập',
  QUIZ: 'Kiểm tra nhanh',
  FINAL: 'Cuối khóa',
};

const TASK: Record<string, StatusLabel> = {
  ASSIGNED: { label: 'Chưa nộp', variant: 'default' },
  SUBMITTED: { label: 'Đang chờ chấm', variant: 'info' },
  NEEDS_REVISION: { label: 'Cần chỉnh sửa', variant: 'warning' },
  PASSED: { label: 'Đã đạt', variant: 'success' },
  FAILED: { label: 'Không đạt', variant: 'danger' },
};

export const taskStatus = (status: string | null | undefined) => pick(TASK, status, TASK.ASSIGNED);

const SUBMISSION: Record<string, StatusLabel> = {
  PENDING_REVIEW: { label: 'Chờ chấm', variant: 'info' },
  PENDING: { label: 'Chờ duyệt', variant: 'info' },
  APPROVED: { label: 'Đã duyệt', variant: 'success' },
  NEEDS_REVISION: { label: 'Cần chỉnh sửa', variant: 'warning' },
  REJECTED: { label: 'Không đạt', variant: 'danger' },
  SUPERSEDED: { label: 'Đã thay bằng bản mới', variant: 'default' },
};

export const submissionStatus = (status: string | null | undefined) => pick(SUBMISSION, status, SUBMISSION.PENDING_REVIEW);

export const VERDICT_LABELS: Record<string, string> = {
  PASSED: 'Đạt',
  NEEDS_REVISION: 'Cần chỉnh sửa',
  FAILED: 'Không đạt',
};

const CERTIFICATE: Record<string, StatusLabel> = {
  VALID: { label: 'Còn hiệu lực', variant: 'success' },
  EXPIRED: { label: 'Hết hạn', variant: 'warning' },
  REVOKED: { label: 'Đã thu hồi', variant: 'danger' },
};

export const certificateStatus = (status: string | null | undefined) => pick(CERTIFICATE, status, CERTIFICATE.VALID);

export const SEVERITY_LABELS: Record<string, StatusLabel> = {
  HIGH: { label: 'Mức độ Cao', variant: 'danger' },
  MEDIUM: { label: 'Mức độ Trung bình', variant: 'warning' },
  LOW: { label: 'Mức độ Thấp', variant: 'default' },
};

export const EVIDENCE_SOURCE_LABELS: Record<string, string> = {
  PRACTICAL_TASK: 'Nhiệm vụ thực tế',
  MANUAL_OVERRIDE: 'HR/Quản lý ghi nhận',
  MIGRATION: 'Dữ liệu năng lực ban đầu',
};

export const LESSON_TYPE_LABELS: Record<string, string> = {
  TEXT: 'Bài đọc',
  VIDEO: 'Video',
  CASE_STUDY: 'Tình huống',
  GUIDED_PRACTICE: 'Thực hành có hướng dẫn',
  WORKPLACE_SCENARIO: 'Tình huống công việc',
  QUIZ: 'Kiểm tra',
  REFLECTION: 'Suy ngẫm',
  ASSIGNMENT: 'Bài tập',
};

/** "2 giờ 30 phút", "45 phút". */
export function formatMinutes(minutes: number | null | undefined): string {
  if (!minutes) return '—';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} phút`;
  return rest === 0 ? `${hours} giờ` : `${hours} giờ ${rest} phút`;
}

/** "3 phút 05 giây" cho thời gian làm bài. */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes} phút ${String(seconds % 60).padStart(2, '0')} giây`;
}
