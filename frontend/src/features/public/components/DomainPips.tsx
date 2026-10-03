import { cn } from '@/lib/utils';
import type { DomainRequirementSummary } from '@/lib/reference-positions';

const TONES = {
  /** Cream on black: public pages. */
  cream: { filled: 'bg-cream', empty: 'bg-cream/15', label: 'text-stone-500' },
  /** Follows the personal workspace theme (pt-* tokens). */
  theme: { filled: 'bg-pt-fg', empty: 'bg-pt-fg/15', label: 'text-pt-fg-3' },
} as const;

interface DomainPipsProps {
  domains: DomainRequirementSummary[];
  className?: string;
  tone?: keyof typeof TONES;
}

/** One column per domain, filled up to the highest level the position asks of it. Decorative. */
export function DomainPips({ domains, className, tone = 'cream' }: DomainPipsProps) {
  const colors = TONES[tone];
  return (
    <div className={cn('flex items-end gap-2.5', className)} aria-hidden="true">
      {domains.map((domain) => (
        <div key={domain.number} className="flex flex-col items-center gap-1.5">
          <div className="flex flex-col-reverse gap-0.5">
            {[1, 2, 3].map((step) => (
              <i key={step} className={cn('block h-1.5 w-5 rounded-full', step <= domain.highestLevel ? colors.filled : colors.empty)} />
            ))}
          </div>
          <span className={cn('text-[10px] tabular-nums', colors.label)}>{domain.number}</span>
        </div>
      ))}
    </div>
  );
}
