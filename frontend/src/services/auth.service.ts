import apiClient from './api-client';
import { USE_MOCK } from './mock/mock-config';
import type { LoginRequest, LoginResponse } from '../types/auth';
import type { ApiResponse } from '../types/api';
import type { SessionUser } from '../types/session';

interface AuthService {
  login: (data: LoginRequest) => Promise<{ data: ApiResponse<LoginResponse> }>;
  logout: () => Promise<unknown>;
  getMe: () => Promise<{ data: ApiResponse<SessionUser> }>;
}

/** Authentication API service. All endpoints relative to /auth base path. */
const apiAuthService: AuthService = {
  login: (data) => apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get<ApiResponse<SessionUser>>('/auth/me'),
};

/**
 * Mock adapter, loaded on first use. The flag is tested inline, right at the dynamic import: Vite replaces
 * import.meta.env at build time, so a production build (VITE_USE_MOCK=false) drops the import and with it
 * the demo accounts and their password.
 */
const loadMock = () =>
  import.meta.env.VITE_USE_MOCK === 'true'
    ? import('./mock/mock-auth.service').then((module) => module.mockAuthService)
    : Promise.reject(new Error('Mock services are disabled (VITE_USE_MOCK is not true).'));

const mockAuthAdapter: AuthService = {
  login: (data) => loadMock().then((mock) => mock.login(data)),
  logout: () => loadMock().then((mock) => mock.logout()),
  getMe: () => loadMock().then((mock) => mock.getMe()),
};

/** With VITE_USE_MOCK=true the service answers from services/mock instead of the backend. */
export const authService: AuthService = USE_MOCK ? mockAuthAdapter : apiAuthService;
