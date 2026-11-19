import type { SessionUser } from '@/types/session';
import { isEnterpriseTrial } from './navigation';
import { normalizeRoles, ROLES } from './roles';
import { ENTERPRISE_SCREENS } from './screens/enterprise';
import { OWNER_SIDEBAR } from './sidebars/owner';

/**
 * Enterprise trial lock for owners. While the trial organization has bought no course, only the owner sidebar entries
 * with a trial rule (survey, Khung năng lực số, Khóa học and the screens they are active for) are open; every other
 * entry — and the screens it is active for — is locked: not in the menu, not reachable by its address (route guard
 * `RequireTrialOpen`), and links to it are hidden on the open pages and in the shell.
 */
export const TRIAL_LOCKED_SCREEN_IDS: ReadonlySet<string> = new Set([
  ...OWNER_SIDEBAR.flatMap((entry) => [entry, ...(entry.items ?? [])])
    .filter((entry) => entry.screenId && !entry.trial)
    .flatMap((entry) => [entry.screenId!, ...(entry.activeFor ?? [])]),
  // Owner pages without a menu entry, still closed during the trial: cycle report, notification centre.
  'OW-40', 'SHR-03',
]);

/** Where a locked owner is sent instead. */
export const TRIAL_HOME_PATH = '/enterprise/trial';

/** An owner of an enterprise trial organization that has not bought a course yet. */
export function isTrialLimitedOwner(
  user: Pick<SessionUser, 'roles' | 'enterpriseTrialStatus' | 'enterpriseTrialPurchased'> | null | undefined,
): boolean {
  return Boolean(user && normalizeRoles(user.roles ?? []).includes(ROLES.OWNER)
    && isEnterpriseTrial(user) && !user.enterpriseTrialPurchased);
}

const lockedPatterns = ENTERPRISE_SCREENS
  .filter((screen) => TRIAL_LOCKED_SCREEN_IDS.has(screen.id))
  .map((screen) => new RegExp(`^${screen.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\/:[^/]+/g, '/[^/]+')}/?$`));

/** Whether an in-app address (query and hash ignored) opens a screen locked during the trial. */
export function isTrialLockedPath(path: string): boolean {
  const pathname = path.split(/[?#]/)[0];
  return lockedPatterns.some((pattern) => pattern.test(pathname));
}
