import { INDIVIDUAL_TRIAL } from '../../../../lib/plans';
import {
  accessModeOf, checklistOf, formatDmy, reassessAvailableAt, settleSubscription, trialDaysLeft,
  type AccessMode,
} from '../../../../lib/personal-access';
import type { SessionUser, SubscriptionContext } from '../../../../types/session';
import type { PersonalAccess } from '../../../personal-learning.service';
import { planForbidden } from '../http';
import { completedCourses, type PlanView } from './personal-logic';
import type { PersonalState } from './personal-store';

/**
 * What the learner's plan allows, decided on the server (spec §4–§6). The screens only reflect these answers:
 * every refusal here is a 403 with a machine code in `errors[0].message`.
 */

export interface AccessContext {
  mode: AccessMode;
  subscription: SubscriptionContext | undefined;
  now: Date;
  /** Trial slots the plan allows. */
  courseLimit: number;
}

const MESSAGES = {
  TRIAL_COURSE_LIMIT: (limit: number) => `Bạn đã dùng hết ${limit} lượt học thử. Nâng cấp gói Plus để học khóa này.`,
  PLAN_REQUIRED: 'Gói Miễn phí không mở bài học mới. Nâng cấp gói Plus để học tiếp.',
  DIAGNOSTIC_LIMIT: 'Trong kỳ dùng thử, bài đánh giá đầu vào làm được một lần.',
  REASSESSMENT_NOT_DUE: (date: string) => `Bạn có thể làm lại bài đánh giá từ ngày ${date}.`,
  TARGET_CHANGE_LIMIT: 'Trong kỳ dùng thử, bạn chỉ đổi vị trí mục tiêu được một lần.',
  ASSESSMENT_NEEDS_SLOT: 'Bài đánh giá này thuộc khóa chưa dùng lượt học thử. Hãy học khóa đó trước hoặc nâng cấp gói Plus.',
} as const;

/** The caller's plan at `now`. A trial that has ended already counts as the Free plan (lazy expiry). */
export function accessOf(session: SessionUser, now: Date = new Date()): AccessContext {
  const subscription = settleSubscription(session.subscription, now);
  return {
    // No plan at all (an account that never paid) gets the least: the Free plan, never full access.
    mode: subscription ? accessModeOf(subscription, now) : 'free',
    subscription,
    now,
    courseLimit: subscription?.trialCourseLimit ?? INDIVIDUAL_TRIAL.courseLimit,
  };
}

export const planViewOf = (access: AccessContext): PlanView => ({ mode: access.mode, courseLimit: access.courseLimit });

const planRequired = () => planForbidden(MESSAGES.PLAN_REQUIRED, 'PLAN_REQUIRED');

/**
 * BR-04, BR-06: changing the progress of a lesson. The Free plan keeps what was learned as it is, so it refuses
 * both completing a new lesson and taking a finished one back (a lesson taken back could not be learned again).
 * A trial learner may start a new course while slots are left; taking a lesson back is theirs to do.
 */
export function assertCanChangeLesson(
  access: AccessContext, state: PersonalState, courseId: string, exempt: boolean, completing: boolean,
): void {
  if (access.mode === 'full') return;
  if (access.mode === 'free') throw planRequired();
  if (!completing || exempt || state.trialCourseIds.includes(courseId)) return;
  if (state.trialCourseIds.length >= access.courseLimit) {
    throw planForbidden(MESSAGES.TRIAL_COURSE_LIMIT(access.courseLimit), 'TRIAL_COURSE_LIMIT');
  }
}

/** BR-07: the assessment after a course is open to the courses the learner studied during the trial. */
export function assertCanTakeCourseAssessment(access: AccessContext, state: PersonalState, courseId: string): void {
  if (access.mode === 'full') return;
  if (state.trialCourseIds.includes(courseId)) return;
  if (access.mode === 'trial') {
    throw planForbidden(MESSAGES.ASSESSMENT_NEEDS_SLOT, 'PLAN_REQUIRED');
  }
  throw planRequired();
}

/** BR-08: a trial learner submits tasks of their trial courses; the Free plan opens no new submission. */
export function assertCanSubmitTask(access: AccessContext, state: PersonalState, courseId: string): void {
  if (access.mode === 'full') return;
  if (access.mode === 'free' || !state.trialCourseIds.includes(courseId)) throw planRequired();
}

/** BR-09: once during a trial; every FREE_REASSESS_DAYS days on the Free plan. */
export function assertCanSubmitDiagnostic(access: AccessContext, state: PersonalState): void {
  if (access.mode === 'full' || !state.diagnostic) return;
  if (access.mode === 'trial') throw planForbidden(MESSAGES.DIAGNOSTIC_LIMIT, 'DIAGNOSTIC_LIMIT');
  const opensAt = reassessAvailableAt(state.diagnostic.completedAt);
  if (new Date(opensAt).getTime() > access.now.getTime()) {
    throw planForbidden(MESSAGES.REASSESSMENT_NOT_DUE(formatDmy(opensAt)), 'REASSESSMENT_NOT_DUE');
  }
}

/** BR-10: after the first choice a trial learner may change position INDIVIDUAL_TRIAL.targetChanges time(s). */
export function assertCanChangeTarget(access: AccessContext, state: PersonalState, newCode: string): void {
  if (access.mode !== 'trial' || !state.targetCode || state.targetCode === newCode) return;
  if (state.targetChangeCount >= INDIVIDUAL_TRIAL.targetChanges) {
    throw planForbidden(MESSAGES.TARGET_CHANGE_LIMIT, 'TARGET_CHANGE_LIMIT');
  }
}

/** `GET /personal/access` (§7.4). */
export function accessDto(access: AccessContext, state: PersonalState): PersonalAccess {
  const { mode, now, subscription } = access;
  const isTrial = mode === 'trial';
  const reassessAt = mode === 'free' && state.diagnostic ? reassessAvailableAt(state.diagnostic.completedAt) : null;
  const reassessDue = reassessAt === null || new Date(reassessAt).getTime() <= now.getTime();
  const diagnosticAvailable = mode === 'full' || (isTrial ? !state.diagnostic : reassessDue);

  return {
    mode,
    planName: subscription?.planName ?? '',
    trialEndsAt: isTrial ? subscription?.trialEndsAt ?? null : null,
    daysLeft: isTrial ? trialDaysLeft(subscription?.trialEndsAt, now) : null,
    courseLimit: isTrial ? access.courseLimit : null,
    trialCourseIds: state.trialCourseIds,
    coursesLeft: isTrial ? Math.max(0, access.courseLimit - state.trialCourseIds.length) : null,
    diagnosticAvailable,
    reassessAvailableAt: mode === 'free' && !reassessDue ? reassessAt : null,
    targetChangesLeft: isTrial ? Math.max(0, INDIVIDUAL_TRIAL.targetChanges - state.targetChangeCount) : null,
    pendingCertificates: mode === 'full' ? 0 : completedCourses(state).size,
    checklist: mode === 'full'
      ? []
      : checklistOf({
          hasDiagnostic: Boolean(state.diagnostic),
          seenPath: Boolean(state.seen.path),
          hasPassedAttempt: state.attempts.some((attempt) => attempt.passed),
          seenProfileAfterPass: Boolean(state.seen['profile-after-pass']),
        }),
    seen: state.seen,
  };
}
