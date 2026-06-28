import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useCurrentUser } from './use-current-user';
import { getDefaultPath } from '../lib/sidebar-config';
import type { LoginRequest } from '../types/auth';

/**
 * Login mutation.
 * Flow: POST /auth/login → save tokens → GET /auth/me → store user.
 * Returns the redirect path for the authenticated user's primary role.
 */
export function useLogin() {
  const setUser = useCurrentUser((s) => s.setUser);

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const loginRes = await authService.login(data);
      const { accessToken, refreshToken } = loginRes.data.data!;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      const meRes = await authService.getMe();
      const user = meRes.data.data!;
      setUser(user);

      return getDefaultPath(user.roles);
    },
  });
}

/**
 * Logout mutation.
 * Calls POST /auth/logout, clears local state. Continue to /login.
 */
export function useLogout() {
  const clearUser = useCurrentUser((s) => s.clearUser);

  return useMutation({
    mutationFn: async () => {
      try {
        await authService.logout();
      } catch {
        // Proceed with local cleanup even if server call fails
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      clearUser();
    },
  });
}
