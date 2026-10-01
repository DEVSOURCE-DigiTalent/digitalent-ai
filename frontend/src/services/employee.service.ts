import apiClient from './api-client';
import type { ApiResponse, PagedList } from '../types/api';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'ARCHIVED';

export interface EmployeeListItem {
  id: string;
  organizationId?: string;
  userId?: string;
  departmentId: string;
  departmentName?: string;
  jobPositionId?: string;
  positionId?: string;
  positionName?: string;
  jobPositionName?: string;
  directManagerId?: string;
  directManagerName?: string;
  employeeCode: string;
  fullName: string;
  workEmail?: string;
  phone?: string;
  status: EmployeeStatus | string;
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Backward-compatible alias
export type EmployeeDto = EmployeeListItem;

export interface EmployeeListParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  departmentId?: string;
  positionId?: string;
  jobPositionId?: string;
  status?: string;
}

export interface CreateEmployeeRequest {
  employeeCode: string;
  fullName: string;
  departmentId: string;
  jobPositionId?: string;
  positionId?: string;
  directManagerId?: string;
  workEmail?: string;
  phone?: string;
  joinedAt?: string;
  userId?: string;
  status?: string;
}

export interface UpdateEmployeeRequest {
  employeeCode?: string;
  fullName?: string;
  departmentId?: string;
  jobPositionId?: string;
  positionId?: string;
  directManagerId?: string;
  workEmail?: string;
  phone?: string;
  joinedAt?: string;
  userId?: string;
  status?: string;
}

/**
 * Employee management API service.
 */
export const employeeService = {
  getList: (params?: EmployeeListParams) =>
    apiClient.get<ApiResponse<PagedList<EmployeeListItem>>>('/employees', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<EmployeeListItem>>(`/employees/${id}`),

  create: (data: CreateEmployeeRequest) =>
    apiClient.post<ApiResponse<{ id: string }>>('/employees', data),

  update: (id: string, data: UpdateEmployeeRequest) =>
    apiClient.put<ApiResponse<{ id: string }>>(`/employees/${id}`, data),

  archive: (id: string) =>
    apiClient.delete<ApiResponse<{ id: string }>>(`/employees/${id}`),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<{ id: string }>>(`/employees/${id}`),

  transfer: (id: string, data: { departmentId?: string; positionId?: string; managerId?: string }) =>
    apiClient.post<ApiResponse<EmployeeListItem>>(`/employees/${id}/transfer`, data),
};
