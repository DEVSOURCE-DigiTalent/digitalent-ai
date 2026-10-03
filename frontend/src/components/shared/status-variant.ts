export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

/** Resolve a status string to the correct BadgeVariant based on spec status labels */
export function getStatusVariant(status: string): BadgeVariant {
  const upper = status.toUpperCase();
  if (['ACTIVE', 'PUBLISHED', 'VALID', 'COMPLETED', 'PASSED', 'APPROVED', 'READY', 'LOW_RISK'].includes(upper)) {
    return 'success';
  }
  if (['DRAFT', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'EXPIRING', 'MEDIUM_RISK'].includes(upper)) {
    return 'warning';
  }
  if (['INACTIVE', 'ARCHIVED', 'FAILED', 'REVOKED', 'EXPIRED', 'REJECTED', 'OVERDUE', 'CANCELLED', 'HIGH_RISK', 'CRITICAL_RISK'].includes(upper)) {
    return 'danger';
  }
  return 'default';
}
