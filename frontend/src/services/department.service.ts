import apiClient from './api-client';
import type { ApiResponse, PagedList, PaginationRequest } from '../types/api';

/** Khớp GetDepartmentByIdUseCaseOutput */
/** ACTIVE | INACTIVE | ARCHIVED — khớp CHECK ck_departments_status (SQL v2.3) */
export type DepartmentStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface DepartmentDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentDepartmentId?: string;
  parentDepartmentName?: string;
  managerEmployeeId?: string;
  managerName?: string;
  headcount?: number;
  gradeDistribution?: Record<string, number>;
  /** Positions (not archived) owned by the department. */
  positionCount?: number;
  /** Child departments (not archived). */
  subDepartmentCount?: number;
  status: DepartmentStatus;
  createdAt: string;
  updatedAt: string;
}

/** 1 dòng trong danh sách — khớp DepartmentListItem */
export interface DepartmentListItem {
  id: string;
  code: string;
  name: string;
  parentDepartmentId?: string;
  parentDepartmentName?: string;
  managerEmployeeId?: string;
  managerName?: string;
  headcount?: number;
  gradeDistribution?: Record<string, number>;
  status: DepartmentStatus;
}

export interface DepartmentListParams extends PaginationRequest {
  status?: DepartmentStatus; // không gửi = mọi trạng thái trừ ARCHIVED
}

export interface CreateDepartmentRequest {
  code: string;
  name: string;
  description?: string;
  parentDepartmentId?: string;
  managerEmployeeId?: string;
}

/** PUT replaces every field: one left out is cleared (parent, description, manager). */
export interface UpdateDepartmentRequest extends CreateDepartmentRequest {
  status: Exclude<DepartmentStatus, 'ARCHIVED'>; // archive dùng remove()
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

  /** Lưu trữ (archive) — backend KHÔNG xóa cứng */
  remove: (id: string) =>
    apiClient.delete<ApiResponse<{ id: string }>>(`/departments/${id}`),
};
