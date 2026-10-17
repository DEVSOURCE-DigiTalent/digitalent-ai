import { matchPath } from 'react-router-dom';
import { getHomePath, requiresOwnerEmailVerification } from '../../lib/navigation';
import { ROLES, WORKSPACES, normalizeRoleCode, normalizeRoles, primaryRole, resolveWorkspace } from '../../lib/roles';
import { ENTERPRISE_SCREENS } from '../../lib/screens/enterprise';
import { PLATFORM_SCREENS } from '../../lib/screens/platform';
import type { ScreenDef } from '../../lib/screens/types';
import type { SessionUser } from '../../types/session';

export function getLoginPath(pathname: string, search = ''): string {
  const returnTo = `${pathname}${search}`;
  return `/login?returnTo=${encodeURIComponent(returnTo)}`;
}

export function isSafeReturnTo(value: string | null): value is string {
  return Boolean(value && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\'));
}

/** Keep a deep link only when the newly signed-in account can open its screen. */
export function getPostLoginPath(returnTo: string | null, user: SessionUser): string {
  const home = getHomePath(user);
  if (!isSafeReturnTo(returnTo) || user.onboardingStatus || requiresOwnerEmailVerification(user)) return home;

  const pathname = returnTo.split(/[?#]/, 1)[0];
  const workspace = resolveWorkspace(user);

  // If returnTo is a generic dashboard or portal root, always direct to the user's canonical home path
  // so Manager lands on /enterprise/team, Owner on /enterprise/dashboard, Employee on /enterprise/me, Admin on /platform/dashboard
  const genericDashboardPaths = new Set([
    '/',
    '/enterprise',
    '/enterprise/',
    '/enterprise/me',
    '/enterprise/dashboard',
    '/enterprise/team',
    '/platform',
    '/platform/',
    '/platform/dashboard',
    '/personal',
    '/personal/',
    '/personal/dashboard',
    '/login',
  ]);

  if (genericDashboardPaths.has(pathname)) {
    return home;
  }

  const normalizedUserRoles = normalizeRoles(user.roles);

  const canOpenScreen = (screens: ScreenDef[]) => screens.some((screen) =>
    screen.status !== 'RETIRED'
    && Boolean(matchPath({ path: screen.path, end: true }, pathname))
    && (screen.roles.includes('*') || screen.roles.some((role) => normalizedUserRoles.includes(normalizeRoleCode(role))))
    && (!screen.permission || normalizedUserRoles.includes(ROLES.PLATFORM_ADMIN) || user.permissions.includes(screen.permission))
  );

  if (pathname.startsWith('/enterprise/')) {
    const role = primaryRole(user);
    const sharedAccountPage = pathname === '/enterprise/account'
      || pathname.startsWith('/enterprise/account/')
      || pathname === '/enterprise/notifications';
    if (!sharedAccountPage) {
      if (role === ROLES.MANAGER && !pathname.startsWith('/enterprise/team/')) return home;
      if (role === ROLES.EMPLOYEE && !pathname.startsWith('/enterprise/me/')) return home;
      if (role === ROLES.OWNER && (pathname.startsWith('/enterprise/team/') || pathname.startsWith('/enterprise/me/'))) return home;
    }
    return workspace === WORKSPACES.ENTERPRISE && canOpenScreen(ENTERPRISE_SCREENS) ? returnTo : home;
  }
  if (pathname.startsWith('/platform/')) {
    return workspace === WORKSPACES.PLATFORM && canOpenScreen(PLATFORM_SCREENS) ? returnTo : home;
  }
  if (pathname.startsWith('/personal/')) {
    return workspace === WORKSPACES.PERSONAL ? returnTo : home;
  }

  return home;
}
