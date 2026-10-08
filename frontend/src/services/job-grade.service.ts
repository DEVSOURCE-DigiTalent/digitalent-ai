import apiClient from './api-client';
import type { ApiResponse } from '../types/api';

export interface JobGradeItem {
  code: 'G1' | 'G2' | 'G3';
  /** Organization's name for the grade, or the default one. */
  name: string;
  description: string | null;
  /** Whether the organization renamed this grade. */
  isCustomized?: boolean;
  positionCount: number;
  employeeCount: number;
}

export interface UpdateJobGradeRequest {
  name: string;
  description?: string;
}

export const jobGradeService = {
  getAll: () => apiClient.get<ApiResponse<JobGradeItem[]>>('/job-grades'),
  update: (code: string, data: UpdateJobGradeRequest) =>
    apiClient.put<ApiResponse<JobGradeItem>>(`/job-grades/${code}`, data),
};
