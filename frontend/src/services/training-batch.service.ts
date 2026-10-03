import apiClient from './api-client';
import type { ApiResponse, PagedList } from '../types/api';
import type {
  TrainingBatchDetailDto,
  TrainingBatchListItemDto,
} from './mock/server/handlers/training-batches';
import type { TrainingBatchStatus } from './mock/server/types';

export interface TrainingBatchListParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  status?: TrainingBatchStatus;
}

export interface TrainingBatchSummary {
  total: number;
  running: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  totalParticipants: number;
}

export interface CreateTrainingBatchRequest {
  code?: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  courseIds: string[];
  targetCriteria?: {
    departmentIds?: string[];
    jobPositionIds?: string[];
    jobGrades?: string[];
    employeeIds?: string[];
  };
  participantEmployeeIds?: string[];
  autoAssign?: boolean;
}

export interface UpdateTrainingBatchRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  courseIds?: string[];
  participantEmployeeIds?: string[];
  status?: TrainingBatchStatus;
}

export const trainingBatchService = {
  getBatches: (params?: TrainingBatchListParams) =>
    apiClient.get<ApiResponse<PagedList<TrainingBatchListItemDto>>>('/training-batches', { params }),

  getSummary: () =>
    apiClient.get<ApiResponse<TrainingBatchSummary>>('/training-batches/summary'),

  getBatchById: (id: string) =>
    apiClient.get<ApiResponse<TrainingBatchDetailDto>>(`/training-batches/${id}`),

  createBatch: (data: CreateTrainingBatchRequest) =>
    apiClient.post<ApiResponse<{ id: string; code: string }>>('/training-batches', data),

  updateBatch: (id: string, data: UpdateTrainingBatchRequest) =>
    apiClient.put<ApiResponse<{ id: string }>>(`/training-batches/${id}`, data),

  cancelBatch: (id: string, reason?: string) =>
    apiClient.post<ApiResponse<{ id: string; status: string }>>(`/training-batches/${id}/cancel`, { reason }),

  completeBatch: (id: string) =>
    apiClient.post<ApiResponse<{ id: string; status: string }>>(`/training-batches/${id}/complete`),
};
