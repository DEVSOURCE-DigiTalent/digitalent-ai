/**
 * Role & workspace model (UI/UX spec v2.1, §1, §2).
 * 4 roles: PLATFORM_ADMIN, OWNER, MANAGER, EMPLOYEE.
 * LEARNER is retained only for Personal Workspace accounts.
 */
export const ROLES = {
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const WORKSPACES = {
  ENTERPRISE: 'enterprise',
  PERSONAL: 'personal',
  PLATFORM: 'platform',
} as const;

export type Workspace = (typeof WORKSPACES)[keyof typeof WORKSPACES];

export const ROLE_LABELS: Record<Role, string> = {
  PLATFORM_ADMIN: 'Quản trị nền tảng',
  OWNER: 'Chủ doanh nghiệp',
  MANAGER: 'Quản lý',
  EMPLOYEE: 'Nhân viên',
};

/** Role hierarchy order: PLATFORM_ADMIN > OWNER > MANAGER > EMPLOYEE */
export const ROLE_HIERARCHY: readonly Role[] = [
  ROLES.PLATFORM_ADMIN,
  ROLES.OWNER,
  ROLES.MANAGER,
  ROLES.EMPLOYEE,
];

/** Returns the highest ranking primary role of a user */
export function primaryRole(user?: { roles: readonly string[] } | null): Role | undefined {
  if (!user?.roles || user.roles.length === 0) return undefined;
  for (const role of ROLE_HIERARCHY) {
    if (user.roles.includes(role)) return role;
  }
  return undefined;
}

/** Removes duplicates while preserving the backend's canonical role codes. */
export function normalizeRoles(roles: readonly string[]): string[] {
  return [...new Set(roles)];
}

/**
 * Workspace implied by a role list when the backend does not send one.
 */
export function inferWorkspace(roles: readonly string[]): Workspace {
  if (roles.includes(ROLES.PLATFORM_ADMIN)) return WORKSPACES.PLATFORM;
  if (roles.some((role) => role === ROLES.OWNER || role === ROLES.MANAGER || role === ROLES.EMPLOYEE)) {
    return WORKSPACES.ENTERPRISE;
  }
  return WORKSPACES.PERSONAL;
}

/** The user's workspace, falling back to the one implied by their roles. */
export function resolveWorkspace(user: { roles: readonly string[]; workspace?: Workspace }): Workspace {
  return user.workspace ?? inferWorkspace(user.roles);
}

export { JOB_GRADES } from './terms';
