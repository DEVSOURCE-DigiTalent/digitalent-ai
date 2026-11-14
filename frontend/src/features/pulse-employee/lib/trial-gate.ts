import type { MyTrialAssessment } from '@/services/trial-program.service';

/** Trạng thái khi nhân viên chưa nộp hoặc kết quả cá nhân chưa sẵn sàng. */
export type TrialGateState = 'todo' | 'waiting' | 'closed';

/** Employee học thử khi có kết quả cá nhân. Owner tự làm bài vẫn chờ công bố đợt. */
export function trialGateOf(mine?: MyTrialAssessment | null, now = Date.now(), waitForPublication = false): TrialGateState | null {
  if (!mine) return null;

  // 1. Học viên chưa nộp bài test: BẮT BUỘC vào làm bài test (todo hoặc closed nếu quá hạn)
  if (mine.status === 'NOT_STARTED') {
    const deadlinePassed = mine.testDeadline != null && new Date(mine.testDeadline).getTime() < now;
    return !mine.canStart && deadlinePassed ? 'closed' : 'todo';
  }

  if (mine.status === 'SUBMITTED' || (waitForPublication && !mine.reportPublished)) {
    return 'waiting';
  }

  return null;
}
