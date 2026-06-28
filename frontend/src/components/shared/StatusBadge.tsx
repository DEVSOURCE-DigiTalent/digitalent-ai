import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-success-50 text-success-700 border-success-200',
  warning: 'bg-warning-50 text-warning-700 border-warning-200',
  danger: 'bg-danger-50 text-danger-700 border-danger-200',
  info: 'bg-primary-50 text-primary-700 border-primary-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
};

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-400',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-primary-500',
  purple: 'bg-purple-500',
};

/**
 * Shared status badge with semantic color dot + label.
 * Maps to UI/UX spec: green=success, amber=warning, red=danger, blue=info, purple=AI.
 */
export function StatusBadge({ label, variant = 'default', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', dotStyles[variant])} aria-hidden="true" />
      {label}
    </span>
  );
}

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
