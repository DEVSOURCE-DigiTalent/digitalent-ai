import { useCurrentUser } from './use-current-user';
import { usePersonalAccess } from './use-personal-learning';
import { accessModeOf, type AccessMode } from '../lib/personal-access';

/**
 * The learner's plan mode: the server's answer when it is there, else what the session says, so a screen never has to
 * guess "full" while the access data is still loading or has failed. Null when the account has no plan to read.
 */
export function usePlanMode(): AccessMode | null {
  const access = usePersonalAccess().data;
  const subscription = useCurrentUser((state) => state.user?.subscription);
  if (access) return access.mode;
  return subscription ? accessModeOf(subscription, new Date()) : null;
}
