import { useCurrentUser } from './use-current-user';

/** Page that holds the survey's gaps once the survey is over. */
export const SKILL_GAP_PATH = '/enterprise/skill-gap';

/**
 * The survey ("Khảo sát năng lực số", OW-T1) is closed to the organization: the trial organization bought a course or
 * was converted, or the organization never registered for the trial (a paying company, no `enterpriseTrialStatus`).
 * It then uses the platform for real: the survey leaves the menu and its gaps live on "Khoảng trống năng lực". Links
 * that led to the survey lead there (or disappear when the page already is that one), so a paying company never opens
 * the survey address (the backend has no survey for it).
 */
export function useSurveyOver(): boolean {
  return useCurrentUser((s) => {
    const status = s.user?.enterpriseTrialStatus;
    return !status || status === 'converted' || Boolean(s.user?.enterpriseTrialPurchased);
  });
}
