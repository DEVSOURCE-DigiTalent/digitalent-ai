import { useCallback } from 'react';
import { isTrialLimitedOwner, isTrialLockedPath } from '@/lib/trial-lock';
import { useCurrentUser } from './use-current-user';

/**
 * Trial lock of the signed-in owner: `limited` while the trial organization has bought no course, and `isLocked(path)`
 * to hide links that would lead to a screen closed during the trial.
 */
export function useTrialLock() {
  const limited = useCurrentUser((s) => isTrialLimitedOwner(s.user));
  const isLocked = useCallback((path?: string | null) => Boolean(limited && path && isTrialLockedPath(path)), [limited]);
  return { limited, isLocked };
}
