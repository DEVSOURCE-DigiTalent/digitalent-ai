import type { MyTrialAssessment } from '@/services/trial-program.service';

/** Doanh nghiệp dùng thử chưa có kết quả bài test: chưa nộp (làm bài / bài đã đóng) hoặc đã nộp, chờ mentor chấm. */
export type TrialGateState = 'todo' | 'waiting' | 'closed';

/**
 * Trạng thái chặn học thử của một người tham gia; null = đã công bố kết quả cá nhân của học viên → học được.
 * Nếu chưa làm bài test (status === 'NOT_STARTED' hoặc chưa nộp) → bắt buộc phải làm ('todo' hoặc 'closed').
 * Nếu đã nộp nhưng chưa công bố kết quả cho học viên (status === 'SUBMITTED' hoặc levels == null) → 'waiting'.
 */
export function trialGateOf(mine?: MyTrialAssessment | null, now = Date.now()): TrialGateState | null {
  if (!mine) return null;

  // 1. Học viên chưa nộp bài test: BẮT BUỘC vào làm bài test (todo hoặc closed nếu quá hạn)
  if (mine.status === 'NOT_STARTED') {
    const deadlinePassed = mine.testDeadline != null && new Date(mine.testDeadline).getTime() < now;
    return !mine.canStart && deadlinePassed ? 'closed' : 'todo';
  }

  // 2. Học viên đã nộp bài nhưng chưa có kết quả thẩm định chính thức: chờ mentor/doanh nghiệp công bố
  if (mine.status === 'SUBMITTED' || !mine.reportPublished) {
    return 'waiting';
  }

  // 3. Đã có kết quả thẩm định và công bố báo cáo (status === 'REVIEWED', reportPublished, levels != null)
  return null;
}
