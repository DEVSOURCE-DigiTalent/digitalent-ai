import type { PlatformTrialItem } from '@/services/trial-program.service';

/** A mentor takes at most this many trial organizations at a time (mirror of TrialProgramRules.MaxOrganizationsPerMentor). */
export const MENTOR_MAX_ORGANIZATIONS = 5;

/**
 * A trial organization has a mentor from the moment its survey starts (assigned automatically) until it is converted:
 * once the report is out its employees learn and only that mentor grades their end-of-level assignments
 * (a converted organization goes to the shared queue).
 */
export function isTrialMentorScope(t: PlatformTrialItem): boolean {
  return t.stage !== 'SETUP' && !t.converted;
}

/** Its employees are learning: the report is out. */
export function isTrialLearning(t: PlatformTrialItem): boolean {
  return t.stage === 'REPORTED' && !t.converted;
}

/** Started its survey but has no mentor (every mentor was full): the admin's to-do. */
export function trialNeedsMentor(t: PlatformTrialItem): boolean {
  return isTrialMentorScope(t) && !t.mentorUserId;
}
