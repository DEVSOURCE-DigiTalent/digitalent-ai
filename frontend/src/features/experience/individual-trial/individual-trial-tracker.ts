/** Events of the no-account "thử nhanh" flow. */
export type QuickTryEventName =
  | 'trial_started'
  | 'trial_position_selected'
  | 'trial_diagnostic_started'
  | 'trial_diagnostic_skipped'
  | 'trial_diagnostic_completed'
  | 'trial_path_viewed'
  | 'trial_lesson_started'
  | 'trial_scenario_completed'
  | 'trial_completed'
  | 'trial_pricing_clicked';

/** Events of the 7-day trial and the Free plan (spec §11). Payloads never carry an email, a name or an answer. */
export type TrialLifecycleEventName =
  | 'trial_signup_viewed'
  | 'trial_account_created'
  | 'trial_diagnostic_submitted'
  | 'trial_course_slot_used'
  | 'trial_first_course_passed'
  | 'trial_checklist_completed'
  | 'trial_upgrade_clicked'
  | 'trial_converted'
  | 'trial_expired'
  | 'free_reassessment_taken';

export type TrialEventName = QuickTryEventName | TrialLifecycleEventName;

export interface TrialEventDetail {
  event: TrialEventName;
  timestamp: number;
  positionCode?: string | null;
  diagnosticMode?: 'completed' | 'skipped' | null;
  [key: string]: unknown;
}

/**
 * Like `trackTrialEvent`, but at most once per browser session for the same `key`, so a screen that mounts again
 * does not count the same moment twice. Storage that is blocked falls back to counting every time.
 */
export function trackTrialEventOnce(key: string, event: TrialEventName, payload?: Record<string, unknown>) {
  const storageKey = `dt-event-${key}`;
  try {
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, '1');
  } catch {
    // Blocked storage: count it.
  }
  trackTrialEvent(event, payload);
}

/** Dispatches lightweight browser custom events for trial telemetry without transmitting sensitive data. */
export function trackTrialEvent(event: TrialEventName, payload?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    const detail: TrialEventDetail = {
      event,
      timestamp: Date.now(),
      ...payload,
    };
    window.dispatchEvent(new CustomEvent('dt:trial-event', { detail }));
  }
}
