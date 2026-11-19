import { useCurrentUser } from './use-current-user';

/** Page that holds the survey's gaps once the survey is over. */
export const SKILL_GAP_PATH = '/enterprise/skill-gap';

/**
 * The survey ("Khảo sát năng lực số", OW-T1) is over once the trial organization bought a course or was converted:
 * the organization uses the platform for real, the survey leaves the menu and its gaps live on "Khoảng trống năng lực".
 * Links that led to the survey then lead there (or disappear when the page already is that one).
 */
export function useSurveyOver(): boolean {
  return useCurrentUser((s) => Boolean(s.user?.enterpriseTrialPurchased) || s.user?.enterpriseTrialStatus === 'converted');
}
