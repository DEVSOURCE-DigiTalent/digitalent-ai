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

/**
 * Dashboard KPI card with label (12px fg-3), value (28px font-light tabular-nums).
 * Follows Enterprise "Mực & Giấy" single-accent principle without distracting multi-color borders.
 */
export function ScoreCard({
  label,
  value,
  subtitle,
  onClick,
  className,
}: ScoreCardProps) {
  const isLongText = typeof value === 'string' && isNaN(Number(value)) && !value.endsWith('%') && value.length > 6;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative bg-ent-card rounded-lg border border-ent-line p-4 text-left w-full transition-all hover:bg-ent-raised',
        onClick ? 'cursor-pointer' : 'cursor-default',
        className,
      )}
    >
      <p className="text-xs font-medium text-ent-fg-3 uppercase tracking-wider truncate">{label}</p>
      <p
        className={cn(
          'mt-1 text-ent-fg leading-tight truncate',
          isLongText ? 'text-lg font-medium py-1' : 'text-[28px] font-light tabular-nums tracking-tight',
        )}
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-ent-fg-3 mt-1.5 flex items-center gap-1 truncate">
          <span className="truncate">{subtitle}</span>
          {onClick && <ChevronRight className="w-3 h-3 ml-auto text-ent-fg-3 shrink-0" />}
        </p>
      )}
    </button>
  );
}
