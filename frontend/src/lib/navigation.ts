import type { SessionUser } from '../types/session';
import { ROLES, WORKSPACES, inferWorkspace, normalizeRoles } from './roles';

/**
 * P11 & §4.7 + Enterprise contract step:
 * Pure function computing the next path from user data:
 * 1. onboardingStatus === 'payment' -> '/checkout'
 * 2. onboardingStatus === 'contract' & enterprise -> '/enterprise/contract'
 * 3. onboardingStatus === 'setup' & enterprise -> '/setup'
 * 4. onboardingStatus === 'setup' & personal -> '/personal/onboarding'
 * 5. unverified Owner -> '/business/verify-email'
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

  if (requiresOwnerEmailVerification(user)) {
    return `/business/verify-email?email=${encodeURIComponent(user.email)}`;
  }

  if (resolved === WORKSPACES.PLATFORM || normalized.includes(ROLES.PLATFORM_ADMIN)) {
    return normalized.includes(ROLES.MENTOR) && !normalized.includes(ROLES.PLATFORM_ADMIN) ? '/platform/reviews' : '/platform/dashboard';
  }
  if (resolved === WORKSPACES.PERSONAL) return '/personal/dashboard';
  if (normalized.includes(ROLES.OWNER)) return isEnterpriseTrial(user) ? '/enterprise/trial' : '/enterprise/dashboard';
  if (normalized.includes(ROLES.MANAGER)) return '/enterprise/team';
  if (normalized.includes(ROLES.EMPLOYEE)) return '/enterprise/me';
  return '/forbidden';
}

/** Doanh nghiệp đang dùng thử (chưa chuyển gói): chủ doanh nghiệp vào trang Dùng thử. */
export function isEnterpriseTrial(user: Pick<SessionUser, 'enterpriseTrialStatus'>): boolean {
  return user.enterpriseTrialStatus === 'trial_active' || user.enterpriseTrialStatus === 'trial_read_only';
}

/** The OTP page belongs to newly registered business owners. Legacy staff and platform accounts use their own workspaces. */
export function requiresOwnerEmailVerification(user: Pick<SessionUser, 'roles' | 'emailVerified'>): boolean {
  return user.emailVerified === false && normalizeRoles(user.roles ?? []).includes(ROLES.OWNER);
}

/**
 * Trả về trang dashboard chính theo vai trò của người dùng.
 * Dùng cho nút "Vào hệ thống" trên Landing page và Solution page để đưa người dùng thẳng vào không gian làm việc.
 */
export function getDashboardPath(user: SessionUser | null | undefined): string {
  if (!user) return '/login';
  const normalized = normalizeRoles(user.roles ?? []);
  const resolved = user.workspace ?? inferWorkspace(normalized);

  if (resolved === WORKSPACES.PLATFORM || normalized.includes(ROLES.PLATFORM_ADMIN)) {
    return normalized.includes(ROLES.MENTOR) && !normalized.includes(ROLES.PLATFORM_ADMIN) ? '/platform/reviews' : '/platform/dashboard';
  }
  if (resolved === WORKSPACES.PERSONAL) return '/personal/dashboard';
  if (normalized.includes(ROLES.OWNER)) return isEnterpriseTrial(user) ? '/enterprise/trial' : '/enterprise/dashboard';
  if (normalized.includes(ROLES.MANAGER)) return '/enterprise/team';
  if (normalized.includes(ROLES.EMPLOYEE)) return '/enterprise/me';
  return '/forbidden';
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
