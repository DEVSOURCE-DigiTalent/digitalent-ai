import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { usePersonalAccess } from '@/hooks/use-personal-learning';
import { trackTrialEvent } from '@/features/experience/individual-trial/individual-trial-tracker';
import { PT_BUTTON_GOLD, PT_BUTTON_GOLD_OUTLINE, PT_TEXT_GOLD } from './ui';

/** Where a trial or Free learner is on the page when they choose to upgrade (spec §11 `placement`). */
export type UpgradePlacement =
  | 'topbar' | 'checklist' | 'trial-ended' | 'path' | 'course' | 'classroom' | 'assessment' | 'certificates' | 'subscription'
  | 'diagnostic' | 'target';

interface UpgradeLinkProps {
  placement: UpgradePlacement;
  /** `button`: gold main action. `outline`: quieter. `text`: gold link inside a sentence or the top bar. */
  variant?: 'button' | 'outline' | 'text';
  className?: string;
  children: ReactNode;
}

const VARIANT_CLASS = {
  button: PT_BUTTON_GOLD,
  outline: PT_BUTTON_GOLD_OUTLINE,
  text: `${PT_TEXT_GOLD} text-sm font-medium underline underline-offset-4 decoration-current/40 hover:decoration-current`,
} as const;

/** Link to the price list for a learner who wants to pay. Counts the click with the plan mode and the place. */
export function UpgradeLink({ placement, variant = 'button', className, children }: UpgradeLinkProps) {
  const mode = usePersonalAccess().data?.mode;

  return (
    <Link
      to="/individual/pricing"
      onClick={() => trackTrialEvent('trial_upgrade_clicked', { mode: mode ?? null, placement })}
      className={cn(VARIANT_CLASS[variant], className)}
    >
      {children}
    </Link>
  );
}
