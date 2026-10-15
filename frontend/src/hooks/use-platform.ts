import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { platformService, type UserProfileDto } from '../services/platform.service';

/**
 * Account & security (SHR-01, SHR-02) and notifications (SHR-03) shared by every portal. The Platform Admin console has
 * its own hooks in use-platform-admin.ts.
 */
export const PLATFORM_KEYS = {
  profile: ['account', 'profile'] as const,
  loginHistory: ['account', 'login-history'] as const,
  notifications: (params?: { unreadOnly?: boolean }) => ['notifications', params] as const,
};

// Account & Security (SHR-01, SHR-02)
export function useUserProfile() {
  return useQuery({
    queryKey: PLATFORM_KEYS.profile,
    queryFn: async () => (await platformService.getProfile()).data.data!,
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<UserProfileDto>) => (await platformService.updateProfile(data)).data.data!,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.profile });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) =>
      (await platformService.changePassword(data)).data.data!,
  });
}

export function useLoginHistory() {
  return useQuery({
    queryKey: PLATFORM_KEYS.loginHistory,
    queryFn: async () => (await platformService.getLoginHistory()).data.data!,
  });
}

// Notifications (SHR-03)
export function useNotifications(params?: { unreadOnly?: boolean }) {
  return useQuery({
    queryKey: PLATFORM_KEYS.notifications(params),
    queryFn: async () => {
      const payload = (await platformService.getNotifications(params)).data.data;
      const notifications = Array.isArray(payload) ? payload : payload?.items ?? [];
      // BE2 accepts paging parameters but does not support the mock server's unreadOnly filter.
      return params?.unreadOnly ? notifications.filter((notification) => !notification.isRead) : notifications;
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await platformService.markNotificationRead(id)).data.data!,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await platformService.markAllNotificationsRead()).data.data!,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
