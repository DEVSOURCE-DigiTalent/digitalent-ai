import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useCurrentUser } from './use-current-user';
import { getHomePath } from '../lib/navigation';
import type { LoginRequest } from '../types/auth';

/**
 * Login mutation.
 * Flow: POST /auth/login → save tokens → GET /auth/me → store user.
 * Returns the redirect path for the authenticated user's primary role.
 */
export function useLogin() {
  const setUser = useCurrentUser((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const loginRes = await authService.login(data);
      const { accessToken, refreshToken } = loginRes.data.data!;
      // A different account may have been open in this tab. Never reuse its role or cached data.
      queryClient.clear();
      useCurrentUser.getState().clearUser();
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      else localStorage.removeItem('refreshToken');

      try {
        const meRes = await authService.getMe();
        const user = meRes.data.data!;
        setUser(user);
        return getHomePath(user);
      } catch (error) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        useCurrentUser.getState().clearUser();
        throw error;
      }
    },
  });
}

/**
 * Logout mutation.
 * Calls POST /auth/logout, clears local state. Continue to /login.
 */
export function useLogout() {
  const clearUser = useCurrentUser((s) => s.clearUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) await authService.logout(refreshToken);
      } catch {
        // Proceed with local cleanup even if server call fails
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      clearUser();
      // Cached data belongs to the user who just left: the next one must not see it, even for a moment.
      queryClient.clear();
    },
  });
}
