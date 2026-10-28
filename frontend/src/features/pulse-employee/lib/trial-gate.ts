import type { MyTrialAssessment } from '@/services/trial-program.service';

/** Doanh nghiệp dùng thử chưa có kết quả bài test: chưa nộp (làm bài / bài đã đóng) hoặc đã nộp, chờ mentor chấm. */
export type TrialGateState = 'todo' | 'waiting' | 'closed';

/**
 * Trạng thái chặn học thử của một người tham gia; null = đã công bố kết quả (hoặc không dùng thử) → học được. Chưa nộp mà
 * hạn làm bài đã qua → 'closed'; chưa tới lúc làm (doanh nghiệp chưa đặt hạn) vẫn là 'todo'.
 */
export function trialGateOf(mine?: MyTrialAssessment | null, now = Date.now()): TrialGateState | null {
  if (!mine || mine.reportPublished) return null;
  if (mine.status !== 'NOT_STARTED') return 'waiting';
  const deadlinePassed = mine.testDeadline != null && new Date(mine.testDeadline).getTime() < now;
  return !mine.canStart && deadlinePassed ? 'closed' : 'todo';
}
