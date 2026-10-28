/**
 * Role & workspace model (UI/UX spec v2.1, §1, §2).
 * Roles: PLATFORM_ADMIN and MENTOR (platform staff — a mentor grades enterprise trial assessments), OWNER, MANAGER, EMPLOYEE.
 * LEARNER is retained only for Personal Workspace accounts.
 */
export const ROLES = {
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  MENTOR: 'MENTOR',
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
  MENTOR: 'Mentor',
  OWNER: 'Chủ doanh nghiệp',
  MANAGER: 'Quản lý',
  EMPLOYEE: 'Nhân viên',
};

/** Role hierarchy order: PLATFORM_ADMIN > MENTOR > OWNER > MANAGER > EMPLOYEE */
export const ROLE_HIERARCHY: readonly Role[] = [
  ROLES.PLATFORM_ADMIN,
  ROLES.MENTOR,
  ROLES.OWNER,
  ROLES.MANAGER,
  ROLES.EMPLOYEE,
];

/**
 * Chuẩn hóa một mã vai trò về một trong 4 roles chuẩn: PLATFORM_ADMIN, OWNER, MANAGER, EMPLOYEE.
 * Chấp nhận cả chữ thường/hoa và các mã định danh lịch sử (DEPARTMENT_MANAGER, HR_MANAGER, SYSTEM_ADMIN, TRAINER).
 */
export function normalizeRoleCode(role: string): string {
  if (!role || typeof role !== 'string') return '';
  const upper = role.trim().toUpperCase();
  switch (upper) {
    case 'PLATFORM_ADMIN':
    case 'SYSTEM_ADMIN':
    case 'ADMIN':
      return ROLES.PLATFORM_ADMIN;
    case 'OWNER':
    case 'HR_MANAGER':
    case 'BUSINESS_OWNER':
      return ROLES.OWNER;
    case 'MANAGER':
    case 'DEPARTMENT_MANAGER':
      return ROLES.MANAGER;
    case 'EMPLOYEE':
    case 'TRAINER':
    case 'STAFF':
      return ROLES.EMPLOYEE;
    default:
      return upper;
  }
}

/** Removes duplicates while ensuring canonical 4-role codes. */
export function normalizeRoles(roles: readonly string[]): string[] {
  if (!roles || !Array.isArray(roles)) return [];
  const normalized = roles.map(normalizeRoleCode).filter(Boolean);
  return [...new Set(normalized)];
}

/** Returns the highest ranking primary role of a user */
export function primaryRole(user?: { roles: readonly string[] } | null): Role | undefined {
  if (!user?.roles || user.roles.length === 0) return undefined;
  const normalized = normalizeRoles(user.roles);
  for (const role of ROLE_HIERARCHY) {
    if (normalized.includes(role)) return role;
  }
  return undefined;
}


/**
 * Workspace implied by a role list when the backend does not send one.
 */
export function inferWorkspace(roles: readonly string[]): Workspace {
  if (roles.includes(ROLES.PLATFORM_ADMIN) || roles.includes(ROLES.MENTOR)) return WORKSPACES.PLATFORM;
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
