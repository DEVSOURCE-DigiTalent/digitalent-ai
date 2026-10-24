/**
 * Review of an individual learner's practice task against its rubric (plan 2026-10-09, B3).
 *
 * MOCK: the real product sends the work to an AI reviewer that reads the linked document. Here the review is a fixed
 * rule over what the learner submits: a link to the work, a self-check of every criterion, and an explanation long
 * enough to say how each criterion is met. Swap `gradeTask` for the AI call; the inputs and the result stay the same.
 */

export const TASK_EXPLANATION_MIN_LENGTH = 150;
/** Submissions allowed per task in any 24 hours, so the review cannot be brute-forced. */
export const TASK_ATTEMPTS_PER_DAY = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface CriterionResult {
  label: string;
  met: boolean;
}

export interface TaskReview {
  status: 'APPROVED' | 'REVISION_REQUESTED';
  score: number;
  feedback: string;
  criteria: CriterionResult[];
}

export interface TaskWork {
  rubric: string[];
  linkUrl: string;
  content: string;
  /** Indexes of the rubric criteria the learner says the work meets. */
  checks: number[];
}

export function gradeTask({ rubric, linkUrl, content, checks }: TaskWork): TaskReview {
  const checked = new Set(checks);
  const criteria = rubric.map((label, index) => ({ label, met: checked.has(index) }));
  const missing = criteria.filter((criterion) => !criterion.met);
  const problems: string[] = [];
  if (!linkUrl) problems.push('Chưa có liên kết tới sản phẩm, nên chưa xem được bài làm.');
  if (missing.length > 0) problems.push(`Chưa đạt: ${missing.map((criterion) => criterion.label).join('; ')}.`);
  if (content.length < TASK_EXPLANATION_MIN_LENGTH) {
    problems.push(`Phần giải thích cần nói rõ bài làm đáp ứng từng tiêu chí ra sao (ít nhất ${TASK_EXPLANATION_MIN_LENGTH} ký tự).`);
  }

  if (problems.length === 0) {
    return {
      status: 'APPROVED',
      score: Math.round(80 + 20 * Math.min(1, (content.length - TASK_EXPLANATION_MIN_LENGTH) / 450)),
      feedback: `Đạt cả ${criteria.length} tiêu chí. Bài làm có sản phẩm kèm theo và giải thích rõ cách đáp ứng từng tiêu chí.`,
      criteria,
    };
  }
  const met = criteria.length - missing.length;
  return {
    status: 'REVISION_REQUESTED',
    score: Math.round(60 * (met / Math.max(1, criteria.length))),
    feedback: `Cần chỉnh sửa. ${problems.join(' ')}`,
    criteria,
  };
}

/** Submissions left in the last 24 hours, given the times of earlier submissions. */
export function attemptsLeft(history: string[], now: Date = new Date()): number {
  const recent = history.filter((at) => now.getTime() - new Date(at).getTime() < DAY_MS).length;
  return Math.max(0, TASK_ATTEMPTS_PER_DAY - recent);
}
