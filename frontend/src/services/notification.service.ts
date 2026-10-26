import apiClient from './api-client';
import type { ApiResponse } from '../types/api';

export interface BroadcastNotificationPayload {
  title: string;
  message: string;
  type?: string;
  dueDate?: string;
  actionUrl?: string;
  targetDepartmentIds?: string[];
  targetEmployeeIds?: string[];
  sendEmail?: boolean;
  autoRemind?: boolean;
}

export interface BroadcastNotificationResult {
  totalRecipients: number;
  inAppNotificationCount: number;
  emailsSentCount: number;
  dueDate?: string;
  recipientNames: string[];
}

export const notificationService = {
  broadcast: (data: BroadcastNotificationPayload) =>
    apiClient.post<ApiResponse<BroadcastNotificationResult>>('/notifications/broadcast', data),
};
