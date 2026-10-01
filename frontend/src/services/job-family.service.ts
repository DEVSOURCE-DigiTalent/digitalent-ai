import apiClient from './api-client';
import type { ApiResponse } from '../types/api';

export type JobFamilyStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface JobFamilyListItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: JobFamilyStatus;
  createdAt: string;
}

export interface JobFamilyDetail extends JobFamilyListItem {
  updatedAt: string;
}

export interface GetPagedJobFamiliesParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  status?: JobFamilyStatus;
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  pageIndex: number;
  pageSize: number;
}

export interface CreateJobFamilyRequest {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateJobFamilyRequest {
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export const jobFamilyService = {
  async getPaged(params?: GetPagedJobFamiliesParams): Promise<PagedResult<JobFamilyListItem>> {
    const res = await apiClient.get<ApiResponse<PagedResult<JobFamilyListItem>>>('/job-families', { params });
    return res.data.data!;
  },

  async getById(id: string): Promise<JobFamilyDetail> {
    const res = await apiClient.get<ApiResponse<JobFamilyDetail>>(`/job-families/${id}`);
    return res.data.data!;
  },

  async create(data: CreateJobFamilyRequest): Promise<{ id: string; code: string; name: string }> {
    const res = await apiClient.post<ApiResponse<{ id: string; code: string; name: string }>>('/job-families', data);
    return res.data.data!;
  },

  async update(id: string, data: UpdateJobFamilyRequest): Promise<{ id: string; code: string; name: string; status: string }> {
    const res = await apiClient.put<ApiResponse<{ id: string; code: string; name: string; status: string }>>(`/job-families/${id}`, data);
    return res.data.data!;
  },

  async delete(id: string): Promise<{ id: string }> {
    const res = await apiClient.delete<ApiResponse<{ id: string }>>(`/job-families/${id}`);
    return res.data.data!;
  },
};
