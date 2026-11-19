import type { TrialParticipantRow } from '@/services/trial-program.service';

/** OW-05 opened from the survey to set the expected level ("Tự đặt ở Khung năng lực số"). */
export const SURVEY_EXPECTATION_PATH = '/enterprise/setup?tab=departments&from=survey';

/** Back to the survey after the expected level: the deadline step, with the people listed in step 1 restored. */
export const SURVEY_RESUME_PATH = '/enterprise/trial?resume=1';

const keyFor = (userId: string) => `dt-trial-survey-draft:${userId}`;

/**
 * People typed in step 1 but not invited yet, kept while the owner sets the expected level in OW-05 (this browser tab
 * only). Storage can be off or full: then the list is simply not kept and the survey still works.
 */
export function saveSurveyDraft(userId: string, rows: TrialParticipantRow[]): void {
  try {
    sessionStorage.setItem(keyFor(userId), JSON.stringify(rows));
  } catch {
    // Not kept: the owner types the list again.
  }
}

export function readSurveyDraft(userId: string): TrialParticipantRow[] | null {
  try {
    const raw = sessionStorage.getItem(keyFor(userId));
    const rows: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(rows) && rows.length > 0 ? (rows as TrialParticipantRow[]) : null;
  } catch {
    return null;
  }
}

export function clearSurveyDraft(userId: string): void {
  try {
    sessionStorage.removeItem(keyFor(userId));
  } catch {
    // Nothing to clear.
  }
}
