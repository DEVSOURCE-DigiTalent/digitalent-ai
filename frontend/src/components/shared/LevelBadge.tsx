import { cn } from '@/lib/utils';
import { levelLabelVi } from '@/lib/competency-levels';

const STYLES: Record<number, string> = {
  0: 'bg-ent-raised text-ent-fg-3 border-ent-line',
  1: 'bg-[var(--ent-level-1)]/15 text-[var(--ent-level-1)] border-[var(--ent-level-1)]/30',
  2: 'bg-[var(--ent-level-2)]/15 text-[var(--ent-level-2)] border-[var(--ent-level-2)]/30',
  3: 'bg-[var(--ent-level-3)]/15 text-[var(--ent-level-3)] border-[var(--ent-level-3)]/30',
};

interface LevelBadgeProps {
  /** 1-3, or 0 / null when nothing is confirmed. */
  level: number | null | undefined;
  /** Text for level 0 / null; "Chưa xác nhận" by default. */
  emptyLabel?: string;
  className?: string;
}

/** The three levels of the system scale (Cơ bản / Trung cấp / Nâng cao) as a small badge. */
export function LevelBadge({ level, emptyLabel, className }: LevelBadgeProps) {
  const value = level ?? 0;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        STYLES[value] ?? STYLES[0],
        className,
      )}
    >
      {value === 0 && emptyLabel ? emptyLabel : levelLabelVi(value)}
    </span>
  );
}
