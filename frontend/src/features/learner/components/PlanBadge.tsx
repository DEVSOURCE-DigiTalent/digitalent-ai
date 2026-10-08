import { Clock } from 'lucide-react';
import { usePersonalAccess } from '@/hooks/use-personal-learning';
import { planBadgeText } from '@/lib/personal-access';
import { INDIVIDUAL_TRIAL } from '@/lib/plans';
import { cn } from '@/lib/utils';
import { PT_TEXT_GOLD } from './ui';
import { UpgradeLink } from './UpgradeLink';

/**
 * Plan label in the top bar of the personal workspace: only for a trial or Free learner, never for a paying one.
 * It always says the plan in words (not colour alone); on a phone only the days remain, with the full sentence for
 * screen readers. "Nâng cấp" sits beside it from tablet width up; on a phone the upgrade is in the account menu.
 */
export function PlanBadge() {
  const { data: access } = usePersonalAccess();
  if (!access || access.mode === 'full') return null;

  const { full, compact } = planBadgeText(access.mode, access.daysLeft);
  const urgent = access.mode === 'trial' && (access.daysLeft ?? 0) <= INDIVIDUAL_TRIAL.reminderDays;

  return (
    <div className="flex items-center gap-2" data-testid="plan-badge">
      <span
        className={cn(
          'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium',
          urgent ? cn('border-[#E5A93C]/60', PT_TEXT_GOLD) : 'border-pt-line bg-pt-raised text-pt-fg-2',
        )}
      >
        {access.mode === 'trial' && <Clock className="size-3.5 sm:hidden" aria-hidden="true" />}
        <span className="sm:hidden" aria-hidden="true">{compact}</span>
        <span className="sr-only sm:not-sr-only">{full}</span>
      </span>
      <UpgradeLink placement="topbar" variant="text" className="hidden sm:inline">Nâng cấp</UpgradeLink>
    </div>
  );
}
