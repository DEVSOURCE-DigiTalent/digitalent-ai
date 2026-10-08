import { StatusBadge } from '@/components/shared';
import type { AssignmentRow, AssignmentStatus } from '@/services/assignment.service';

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  ACTIVE: 'Đang hiệu lực',
  NOT_STARTED: 'Chưa bắt đầu',
  IN_PROGRESS: 'Đang học',
  READY_FOR_ASSESSMENT: 'Chờ đánh giá',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
};

const VARIANTS = {
  ACTIVE: 'info',
  NOT_STARTED: 'default',
  IN_PROGRESS: 'info',
  READY_FOR_ASSESSMENT: 'purple',
  COMPLETED: 'success',
  CANCELLED: 'danger',
} as const;

/** Status of an assignment; "Quá hạn" and "Sắp đến hạn" take over while the work is open. */
export function AssignmentStatusBadge({ assignment }: { assignment: Pick<AssignmentRow, 'status' | 'overdue' | 'dueSoon'> & Partial<Pick<AssignmentRow, 'completedAt'>> }) {
  if (assignment.status === 'COMPLETED' || assignment.completedAt) return <StatusBadge label="Đã hoàn thành" variant="success" />;
  if (assignment.overdue) return <StatusBadge label="Quá hạn" variant="danger" />;
  if (assignment.dueSoon) return <StatusBadge label="Sắp đến hạn" variant="warning" />;
  return <StatusBadge label={ASSIGNMENT_STATUS_LABELS[assignment.status]} variant={VARIANTS[assignment.status]} />;
}

export const SKIP_REASON_LABELS = {
  NOT_ACTIVE: 'Nhân viên không còn hoạt động',
  ALREADY_ASSIGNED: 'Đã được giao khóa này',
  ALREADY_COMPLETED: 'Đã hoàn thành khóa này',
  PREREQUISITE_NOT_MET: 'Chưa đạt điều kiện vào khóa (cần hoàn thành khóa trước)',
} as const;

export const LEVEL_SUFFIX_LABELS: Record<number, string> = { 1: 'Cơ bản', 2: 'Trung cấp', 3: 'Nâng cao' };
