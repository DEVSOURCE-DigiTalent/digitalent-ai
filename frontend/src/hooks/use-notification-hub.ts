import { useEffect } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCurrentUser } from './use-current-user';
import { invalidateSkillGapViews } from './use-skill-gaps';

/** Payload of "ReceiveNotification" — khớp Api/Services/SignalRNotificationSender.cs */
export interface HubNotification {
  title: string;
  message: string;
  type: string;
  payload?: unknown;
  timestamp: string;
}

const RECEIVE_NOTIFICATION = 'ReceiveNotification';

/** Hub is served by the API origin: same origin via the Vite proxy, or the origin of VITE_API_BASE_URL. */
export function notificationHubUrl(apiBaseUrl: string = import.meta.env.VITE_API_BASE_URL || '/api/v1'): string {
  return /^https?:\/\//.test(apiBaseUrl) ? new URL('/hubs/notifications', apiBaseUrl).toString() : '/hubs/notifications';
}

/**
 * Keeps a SignalR connection to /hubs/notifications while signed in: shows a toast for each notification and
 * refreshes skill gap data when it changed (spec Sprint 3 §6.4 E9). Realtime is best-effort — pages still load
 * fresh data on their own if the connection cannot be established.
 */
export function useNotificationHub() {
  const isAuthenticated = useCurrentUser((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) return;

    const connection = new HubConnectionBuilder()
      .withUrl(notificationHubUrl(), { accessTokenFactory: () => localStorage.getItem('accessToken') ?? '' })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on(RECEIVE_NOTIFICATION, (notification: HubNotification) => {
      toast.info(notification.title, { description: notification.message });
      if (notification.type === 'SKILL_GAP_UPDATED') {
        void invalidateSkillGapViews(queryClient);
      }
    });

    // Lỗi kết nối đã được SignalR ghi ở mức Warning; ứng dụng vẫn chạy bình thường không có realtime
    connection.start().catch(() => undefined);

    return () => {
      connection.off(RECEIVE_NOTIFICATION);
      void connection.stop();
    };
  }, [isAuthenticated, queryClient]);
}
