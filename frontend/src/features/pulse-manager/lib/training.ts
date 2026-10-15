import type { AssignmentRow } from '@/services/assignment.service';
import type { PulseFinalReviewItem } from '@/services/pulse.service';

/** Trạng thái học của một phân công, gộp với hàng chờ bài cuối khóa của quản lý. */
export type LearnerState = 'NOT_STARTED' | 'LEARNING' | 'OVERDUE' | 'READY' | 'REVIEW_DUE' | 'RETRY' | 'SUPPORT' | 'APPROVED';

export type TrainingFilter = 'ALL' | 'LEARNING' | 'REVIEW' | 'APPROVED' | 'SUPPORT';

export const LEARNER_STATE: Record<LearnerState, { label: string; tone: 'green' | 'coral' | 'gray' | ''; filter: TrainingFilter }> = {
  NOT_STARTED: { label: 'Chưa bắt đầu', tone: 'gray', filter: 'LEARNING' },
  LEARNING: { label: 'Đang học', tone: '', filter: 'LEARNING' },
  OVERDUE: { label: 'Quá hạn học', tone: 'coral', filter: 'SUPPORT' },
  READY: { label: 'Sẵn sàng làm bài cuối', tone: '', filter: 'LEARNING' },
  REVIEW_DUE: { label: 'Chờ chấm bài cuối', tone: 'coral', filter: 'REVIEW' },
  RETRY: { label: 'Chờ nộp lại', tone: 'gray', filter: 'REVIEW' },
  SUPPORT: { label: 'Cần hỗ trợ', tone: 'coral', filter: 'SUPPORT' },
  APPROVED: { label: 'Đã hoàn thành', tone: 'green', filter: 'APPROVED' },
};

export const reviewKey = (employeeId: string, courseId: string) => `${employeeId}::${courseId}`;

export function learnerState(row: AssignmentRow, review?: Pick<PulseFinalReviewItem, 'status'>): LearnerState {
  if (review) {
    if (review.status === 'PENDING') return 'REVIEW_DUE';
    if (review.status === 'RETRY_WAIT' || review.status === 'RETRY_READY') return 'RETRY';
    return 'SUPPORT';
  }
  if (row.status === 'COMPLETED') return 'APPROVED';
  if (row.overdue) return 'OVERDUE';
  if (row.status === 'READY_FOR_ASSESSMENT') return 'READY';
  if (row.status === 'NOT_STARTED') return 'NOT_STARTED';
  return 'LEARNING';
}

export interface CourseCohort {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  learners: (AssignmentRow & { state: LearnerState })[];
}

/** Gom phân công còn hiệu lực theo khóa học (mỗi khóa là một nhóm học của phòng ban). */
export function groupByCourse(rows: AssignmentRow[], reviews: PulseFinalReviewItem[]): CourseCohort[] {
  const reviewByKey = new Map(reviews.map((item) => [reviewKey(item.employeeId, item.courseId), item]));
  const cohorts = new Map<string, CourseCohort>();
  for (const row of rows) {
    if (row.status === 'CANCELLED') continue;
    const cohort = cohorts.get(row.courseId) ?? { courseId: row.courseId, courseTitle: row.courseTitle, courseCode: row.courseCode, learners: [] };
    cohort.learners.push({ ...row, state: learnerState(row, reviewByKey.get(reviewKey(row.employeeId, row.courseId))) });
    cohorts.set(row.courseId, cohort);
  }
  return [...cohorts.values()].sort((a, b) => a.courseTitle.localeCompare(b.courseTitle, 'vi'));
}
