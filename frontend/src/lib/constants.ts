export const APP_NAME = 'DigiTalent AI';
export const ROLES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  HR_MANAGER: 'HR_MANAGER',
  DEPARTMENT_MANAGER: 'DEPARTMENT_MANAGER',
  TRAINER: 'TRAINER',
  EMPLOYEE: 'EMPLOYEE',
  CERTIFICATE_VERIFIER: 'CERTIFICATE_VERIFIER',
} as const;
export const STATUS_BADGES: Record<string, { label: string; variant: string }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  INACTIVE: { label: 'Inactive', variant: 'warning' },
  DRAFT: { label: 'Draft', variant: 'warning' },
  PUBLISHED: { label: 'Published', variant: 'success' },
  ARCHIVED: { label: 'Archived', variant: 'default' },
  VALID: { label: 'Valid', variant: 'success' },
  EXPIRED: { label: 'Expired', variant: 'danger' },
  REVOKED: { label: 'Revoked', variant: 'danger' },
  PENDING: { label: 'Pending', variant: 'warning' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'danger' },
};
