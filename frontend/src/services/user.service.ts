import apiClient from './api-client';
import type { ApiResponse, PagedList, PaginationRequest } from '../types/api';

// TODO: Replace with typed DTOs once backend DTOs stabilize
export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  roles: string[];
}

export interface UpdateUserRequest {
  fullName?: string;
  roles?: string[];
  isActive?: boolean;
}

/**
 * User management API service.
 */
export const userService = {
  getList: (params: PaginationRequest) =>
    apiClient.get<ApiResponse<PagedList<UserDto>>>('/users', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<UserDto>>(`/users/${id}`),

  create: (data: CreateUserRequest) =>
    apiClient.post<ApiResponse<UserDto>>('/users', data),

  update: (id: string, data: UpdateUserRequest) =>
    apiClient.put<ApiResponse<UserDto>>(`/users/${id}`, data),

  lockUnlock: (id: string, reason: string) =>
    apiClient.post<ApiResponse<UserDto>>(`/users/${id}/toggle-lock`, { reason }),
};
