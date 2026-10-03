import { useCallback } from 'react';
import { authService } from '../services/auth.service';
import { useCurrentUser } from './use-current-user';

/**
 * Re-reads `/auth/me` into the store. Call it after something changed the session on the server:
 * a payment (subscription, onboarding status), the end of the setup wizard, an activated invitation.
 */
export function useRefreshSession() {
  const setUser = useCurrentUser((s) => s.setUser);

  return useCallback(async () => {
    const response = await authService.getMe();
    const user = response.data.data;
    if (user) setUser(user);
    return user;
  }, [setUser]);
}
