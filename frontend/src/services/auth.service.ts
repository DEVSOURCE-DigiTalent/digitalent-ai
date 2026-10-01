import apiClient from './api-client';
import type { LoginRequest, LoginResponse } from '../types/auth';
import type { ApiResponse } from '../types/api';

/**
 * Authentication API service.
 * All endpoints relative to /auth base path.
 */
export const authService = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data),

  logout: () =>
    apiClient.post('/auth/logout'),

  getMe: () =>
    apiClient.get<ApiResponse<{
      id: string;
      email: string;
      fullName: string;
      employeeId?: string;
      roles: string[];
      permissions: string[];
    }>>('/auth/me'),

};
