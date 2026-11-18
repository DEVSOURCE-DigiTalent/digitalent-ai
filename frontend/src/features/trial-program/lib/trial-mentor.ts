import type { PlatformTrialItem } from '@/services/trial-program.service';

/** A mentor takes at most this many trial organizations at a time (mirror of TrialProgramRules.MaxOrganizationsPerMentor). */
export const MENTOR_MAX_ORGANIZATIONS = 5;

/**
 * Learning phase of a trial organization: its report is out, so its employees learn and submit an assignment at the
 * end of each level. Only its assigned mentor can grade them (a converted organization goes to the shared queue).
 */
export function isTrialLearning(t: PlatformTrialItem): boolean {
  return t.stage === 'REPORTED' && !t.converted;
}

/** A learning trial organization without a mentor: nobody can grade its assignments. The admin's to-do. */
export function trialNeedsMentor(t: PlatformTrialItem): boolean {
  return isTrialLearning(t) && !t.mentorUserId;
}
