import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { isTrialLimitedOwner, TRIAL_HOME_PATH } from '@/lib/trial-lock';

/**
 * Guards a screen that is locked for an enterprise-trial owner (see `lib/trial-lock.ts`): such an owner opening it by
 * its address or an old link lands on the survey instead. Everyone else passes.
 */
export function RequireTrialOpen({ children }: { children: ReactNode }) {
  const limited = useCurrentUser((s) => isTrialLimitedOwner(s.user));
  if (limited) return <Navigate to={TRIAL_HOME_PATH} replace />;
  return <>{children}</>;
}
