/**
 * Role & workspace model (UI/UX spec v2.1, §1, §2).
 * 4 roles: PLATFORM_ADMIN, OWNER, MANAGER, EMPLOYEE.
 * Individual is a Personal Workspace, not an RBAC role.
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

/**
 * Role names the current backend still returns, mapped to the new model (transitional, remove once the
 * backend speaks the new roles).
 * - SYSTEM_ADMIN gets PLATFORM_ADMIN and temporarily OWNER while platform is integrating.
 * - HR_MANAGER becomes OWNER.
 * - DEPARTMENT_MANAGER becomes MANAGER.
 * - EMPLOYEE and TRAINER become EMPLOYEE.
 */
const LEGACY_ROLE_MAP: Record<string, Role[]> = {
  SYSTEM_ADMIN: [ROLES.PLATFORM_ADMIN, ROLES.OWNER],
  ORG_ADMIN: [ROLES.OWNER],
  HR_MANAGER: [ROLES.OWNER],
  LEARNING_ADMIN: [ROLES.OWNER],
  DEPARTMENT_MANAGER: [ROLES.MANAGER],
  EMPLOYEE: [ROLES.EMPLOYEE],
  TRAINER: [ROLES.EMPLOYEE],
  LEARNER: [ROLES.EMPLOYEE],
};

/** Converts any legacy role names to the new ones and removes duplicates. */
export function normalizeRoles(roles: readonly string[]): string[] {
  const mapped = roles.flatMap((role) => LEGACY_ROLE_MAP[role] ?? [role as Role]);
  return [...new Set(mapped)];
}

/**
 * Workspace implied by a role list when the backend does not send one. Platform staff who also hold
 * enterprise roles (the legacy SYSTEM_ADMIN) stay in the enterprise portal.
 */
export function inferWorkspace(roles: readonly string[]): Workspace {
  const hasEnterpriseRole = roles.some((role) => role !== ROLES.PLATFORM_ADMIN);
  if (roles.includes(ROLES.PLATFORM_ADMIN) && !hasEnterpriseRole) return WORKSPACES.PLATFORM;
  return roles.length > 0 ? WORKSPACES.ENTERPRISE : WORKSPACES.PERSONAL;
}

/** The user's workspace, falling back to the one implied by their roles. */
export function resolveWorkspace(user: { roles: readonly string[]; workspace?: Workspace }): Workspace {
  return user.workspace ?? inferWorkspace(user.roles);
}

export { JOB_GRADES } from './terms';
