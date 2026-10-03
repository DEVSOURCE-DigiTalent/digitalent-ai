import type { SessionUser } from '../types/session';
import { ROLES, WORKSPACES, inferWorkspace, normalizeRoles } from './roles';

/**
 * P11 & §4.7 + Enterprise contract step:
 * Pure function computing the next path from user data:
 * 1. onboardingStatus === 'payment' -> '/checkout'
 * 2. onboardingStatus === 'contract' & enterprise -> '/enterprise/contract'
 * 3. onboardingStatus === 'setup' & enterprise -> '/setup'
 * 4. onboardingStatus === 'setup' & personal -> '/personal/onboarding'
 * 5. emailVerified === false -> '/verify-email-required'
 * 6. default role homepage
 */
export function resolveNextStep(user: SessionUser | null | undefined): string {
  if (!user) return '/login';

  const normalized = normalizeRoles(user.roles ?? []);
  const resolved = user.workspace ?? inferWorkspace(normalized);

  if (user.onboardingStatus === 'payment') {
    return '/checkout';
  }

  if (user.onboardingStatus === 'contract' && resolved === WORKSPACES.ENTERPRISE) {
    return '/enterprise/contract';
  }

  if (user.onboardingStatus === 'setup') {
    if (resolved === WORKSPACES.ENTERPRISE) return '/setup';
    if (resolved === WORKSPACES.PERSONAL) return '/personal/onboarding';
  }

  if (user.emailVerified === false) {
    return '/verify-email-required';
  }

  if (resolved === WORKSPACES.PLATFORM || normalized.includes(ROLES.PLATFORM_ADMIN)) {
    return '/platform/dashboard';
  }
  if (resolved === WORKSPACES.PERSONAL) return '/personal/dashboard';
  if (normalized.includes(ROLES.OWNER)) return '/enterprise/dashboard';
  if (normalized.includes(ROLES.MANAGER)) return '/enterprise/team';
  return '/enterprise/me';
}

/** Landing page for a signed-in user: unfinished onboarding first, then workspace and role priority. */
export function getHomePath(
  userOrInput: SessionUser | { roles: string[]; workspace?: any; onboardingStatus?: any; emailVerified?: boolean },
): string {
  if ('id' in userOrInput) {
    return resolveNextStep(userOrInput as SessionUser);
  }
  return resolveNextStep({
    id: '',
    email: '',
    fullName: '',
    roles: userOrInput.roles,
    permissions: [],
    workspace: userOrInput.workspace,
    onboardingStatus: userOrInput.onboardingStatus,
    emailVerified: userOrInput.emailVerified,
  });
}
