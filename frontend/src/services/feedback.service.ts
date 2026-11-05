import apiClient from './api-client';
import type { ApiResponse, PagedList } from '@/types/api';

export interface FeedbackItem {
  id: string;
  type: 'BUG' | 'FEEDBACK' | 'SUGGESTION';
  title: string;
  description: string;
  pageUrl?: string | null;
  rating?: number | null;
  screenshots?: string[] | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminNote?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  organizationName?: string | null;
}

export interface CreateFeedbackInput {
  type: string;
  title: string;
  description: string;
  pageUrl?: string;
  rating?: number;
  screenshots?: string[];
}

export interface UpdateFeedbackInput {
  status: string;
  adminNote?: string;
}

export const feedbackService = {
  create: (data: CreateFeedbackInput) =>
    apiClient.post<ApiResponse<{ id: string }>>('/feedbacks', data).then((r) => r.data),

  getMine: (params?: { pageIndex?: number; pageSize?: number }) =>
    apiClient
      .get<ApiResponse<PagedList<FeedbackItem>>>('/feedbacks/mine', { params })
      .then((r) => r.data),

  getAll: (params?: {
    pageIndex?: number;
    pageSize?: number;
    status?: string;
    type?: string;
    search?: string;
  }) =>
    apiClient
      .get<ApiResponse<PagedList<FeedbackItem>>>('/platform/feedbacks', { params })
      .then((r) => r.data),

  update: (id: string, data: UpdateFeedbackInput) =>
    apiClient.put<ApiResponse<{ success: boolean }>>(`/platform/feedbacks/${id}`, data).then((r) => r.data),
};
