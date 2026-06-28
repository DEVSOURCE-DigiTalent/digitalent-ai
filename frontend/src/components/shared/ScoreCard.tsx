import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface ScoreCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
  className?: string;
}

const variantBorders: Record<string, string> = {
  default: 'border-slate-200',
  success: 'border-success-300',
  warning: 'border-warning-300',
  danger: 'border-danger-300',
};

const variantText: Record<string, string> = {
  default: 'text-slate-900',
  success: 'text-success-700',
  warning: 'text-warning-700',
  danger: 'text-danger-700',
};

/**
 * Dashboard KPI card with label, value, optional trend indicator.
 * Variant controls the left accent border color.
 */
export function ScoreCard({
  label,
  value,
  subtitle,
  variant = 'default',
  onClick,
  className,
}: ScoreCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative bg-white rounded-lg border-l-4 shadow-sm p-4 text-left w-full transition-shadow hover:shadow-md',
        variantBorders[variant],
        onClick ? 'cursor-pointer' : 'cursor-default',
        className,
      )}
    >
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={cn('text-2xl font-bold mt-1', variantText[variant])}>{value}</p>
      {subtitle && (
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
          {subtitle}
          {onClick && <ChevronRight className="w-3 h-3" />}
        </p>
      )}
    </button>
  );
}
