import apiClient from './api-client';
import type { ApiResponse, PagedList, PaginationRequest } from '../types/api';

// TODO: Replace with typed DTOs once backend DTOs stabilize
export interface EmployeeDto {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  departmentId?: string;
  departmentName?: string;
  positionId?: string;
  positionName?: string;
  managerId?: string;
  isActive: boolean;
}

export interface CreateEmployeeRequest {
  userId: string;
  departmentId?: string;
  positionId?: string;
  managerId?: string;
}

export interface UpdateEmployeeRequest {
  departmentId?: string;
  positionId?: string;
  managerId?: string;
}

/**
 * Employee management API service.
 */
export const employeeService = {
  getList: (params: PaginationRequest) =>
    apiClient.get<ApiResponse<PagedList<EmployeeDto>>>('/employees', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<EmployeeDto>>(`/employees/${id}`),

  create: (data: CreateEmployeeRequest) =>
    apiClient.post<ApiResponse<EmployeeDto>>('/employees', data),

  update: (id: string, data: UpdateEmployeeRequest) =>
    apiClient.put<ApiResponse<EmployeeDto>>(`/employees/${id}`, data),

  transfer: (id: string, data: { departmentId?: string; positionId?: string; managerId?: string }) =>
    apiClient.post<ApiResponse<EmployeeDto>>(`/employees/${id}/transfer`, data),
};
