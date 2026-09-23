import apiClient from './api-client';
import type { ApiResponse, PagedList, PaginationRequest } from '../types/api';

/** Khớp GetDepartmentByIdUseCaseOutput */
export interface DepartmentDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

/** 1 dòng trong danh sách — khớp DepartmentListItem */
export type DepartmentListItem = Pick<DepartmentDto, 'id' | 'code' | 'name' | 'isActive'>;

export interface DepartmentListParams extends PaginationRequest {
  isActive?: boolean;
}

export interface CreateDepartmentRequest {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateDepartmentRequest extends CreateDepartmentRequest {
  isActive: boolean;
}

/**
 * Department management API service.
 */
export const departmentService = {
  getList: (params: DepartmentListParams) =>
    apiClient.get<ApiResponse<PagedList<DepartmentListItem>>>('/departments', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<DepartmentDto>>(`/departments/${id}`),

  create: (data: CreateDepartmentRequest) =>
    apiClient.post<ApiResponse<{ id: string }>>('/departments', data),

  update: (id: string, data: UpdateDepartmentRequest) =>
    apiClient.put<ApiResponse<{ id: string }>>(`/departments/${id}`, data),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<{ id: string }>>(`/departments/${id}`),
};
