import apiClient from './api-client';
import type { ApiResponse, PagedList, PaginationRequest } from '../types/api';

// TODO: Replace with typed DTOs once backend DTOs stabilize
export interface DepartmentDto {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  isActive: boolean;
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  managerId?: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
  managerId?: string;
  isActive?: boolean;
}

/**
 * Department management API service.
 */
export const departmentService = {
  getList: (params: PaginationRequest) =>
    apiClient.get<ApiResponse<PagedList<DepartmentDto>>>('/departments', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<DepartmentDto>>(`/departments/${id}`),

  create: (data: CreateDepartmentRequest) =>
    apiClient.post<ApiResponse<DepartmentDto>>('/departments', data),

  update: (id: string, data: UpdateDepartmentRequest) =>
    apiClient.put<ApiResponse<DepartmentDto>>(`/departments/${id}`, data),
};
