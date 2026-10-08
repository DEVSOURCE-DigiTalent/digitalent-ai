import { cn } from '@/lib/utils';
import type { DomainRequirementSummary } from '@/lib/reference-positions';

/** The one colour of the level pips: the product gold, so a profile reads at a glance without a rainbow. */
export const PIP_GOLD = '#E5A93C';

const LABEL_TONE = {
  /** Public pages on a dark canvas. */
  cream: 'text-stone-500',
  /** Follows the personal workspace theme (pt-* tokens). */
  theme: 'text-pt-fg-3',
} as const;

interface DomainPipsProps {
  domains: DomainRequirementSummary[];
  className?: string;
  tone?: keyof typeof LABEL_TONE;
}

/** One column per domain, filled in gold up to the highest level the position asks of it. Decorative, so no hover. */
export function DomainPips({ domains, className, tone = 'cream' }: DomainPipsProps) {
  return (
    <div className={cn('flex items-end gap-2.5', className)} aria-hidden="true">
      {domains.map((domain) => (
        <div key={domain.number} className="flex flex-col items-center gap-1.5 transition-transform duration-300 group-hover:-translate-y-0.5">
          <div className="flex flex-col-reverse gap-0.5">
            {[1, 2, 3].map((step) => {
              const isFilled = step <= domain.highestLevel;
              return (
                <i
                  key={step}
                  className={cn(
                    'block h-1.5 w-5 rounded-full transition-all duration-300',
                    isFilled
                      ? 'bg-gradient-to-r from-[#F5CA65] to-[#E5A93C] shadow-[0_0_4px_rgba(245,202,101,0.3)] group-hover:shadow-[0_0_10px_rgba(245,202,101,0.65)] group-hover:brightness-110'
                      : 'bg-amber-400/15'
                  )}
                />
              );
            })}
          </div>
          <span className={cn('text-[10px] tabular-nums transition-colors duration-300 group-hover:text-[#F5CA65]', LABEL_TONE[tone])}>
            {domain.number}
          </span>
        </div>
      ))}
    </div>
  );
}
