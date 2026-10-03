import { cn } from '@/lib/utils';
import type { BadgeVariant } from './status-variant';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-ent-raised text-ent-fg-2 border-ent-line',
  success: 'bg-[var(--ent-ok-soft)] text-ent-ok border-[var(--ent-ok-soft)]',
  warning: 'bg-[var(--ent-warn-soft)] text-ent-warn border-[var(--ent-warn-soft)]',
  danger: 'bg-[var(--ent-bad-soft)] text-ent-bad border-[var(--ent-bad-soft)]',
  info: 'bg-[var(--ent-accent-soft)] text-ent-accent border-[var(--ent-accent-soft)]',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-ent-fg-3',
  success: 'bg-ent-ok',
  warning: 'bg-ent-warn',
  danger: 'bg-ent-bad',
  info: 'bg-ent-accent',
  purple: 'bg-purple-400',
};

/**
 * Shared status badge with semantic color dot + label.
 * Styled with Enterprise tokens and whitespace-nowrap.
 */
export function StatusBadge({ label, variant = 'default', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap',
        variantStyles[variant],
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotStyles[variant])} aria-hidden="true" />
      {label}
    </span>
  );
}
