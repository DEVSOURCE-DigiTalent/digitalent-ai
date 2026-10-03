import apiClient from './api-client';
import type { ApiResponse, PagedList, PaginationRequest } from '../types/api';

export type JobPositionStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface JobPositionDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  departmentId?: string;
  departmentName?: string;
  jobFamilyId?: string;
  jobFamilyName?: string;
  jobGrade?: 'G1' | 'G2' | 'G3';
  jobGradeName?: string;
  headcount?: number;
  hasRequirementSet?: boolean;
  status: JobPositionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface JobPositionListItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  departmentId?: string;
  departmentName?: string;
  jobFamilyId?: string;
  jobFamilyName?: string;
  jobGrade?: 'G1' | 'G2' | 'G3';
  jobGradeName?: string;
  headcount?: number;
  hasRequirementSet?: boolean;
  status: JobPositionStatus;
}

export interface JobPositionListParams extends PaginationRequest {
  status?: JobPositionStatus;
  departmentId?: string;
  jobGrade?: string;
  jobFamilyId?: string;
}

export interface CreateJobPositionRequest {
  code: string;
  name: string;
  description?: string;
  departmentId?: string;
  jobGrade?: 'G1' | 'G2' | 'G3';
  jobFamilyId?: string;
}

export interface UpdateJobPositionRequest extends CreateJobPositionRequest {
  status: Exclude<JobPositionStatus, 'ARCHIVED'>;
}


export const jobPositionService = {
  getAll: (params?: JobPositionListParams) =>
    apiClient.get<ApiResponse<PagedList<JobPositionListItem>>>('/job-positions', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<JobPositionDto>>(`/job-positions/${id}`),

  create: (data: CreateJobPositionRequest) =>
    apiClient.post<ApiResponse<{ id: string }>>('/job-positions', data),

  update: (id: string, data: UpdateJobPositionRequest) =>
    apiClient.put<ApiResponse<{ id: string }>>(`/job-positions/${id}`, data),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<{ id: string }>>(`/job-positions/${id}`),
};
