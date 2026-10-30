import apiClient from './api-client';
import { USE_MOCK } from './mock/mock-config';
import type { LoginRequest, LoginResponse } from '../types/auth';
import type { ApiResponse } from '../types/api';
import type { SessionUser } from '../types/session';

export interface SendEmailVerificationResponse {
  debugOtp?: string | null;
}

export interface VerifyBusinessEmailResponse {
  verified: boolean;
  email: string;
  accessToken?: string | null;
  refreshToken?: string | null;
}

interface AuthService {
  login: (data: LoginRequest) => Promise<{ data: ApiResponse<LoginResponse> }>;
  logout: (refreshToken: string) => Promise<unknown>;
  getMe: () => Promise<{ data: ApiResponse<SessionUser> }>;
  /** Gửi OTP 6 số qua email xác minh cho Business Owner mới đăng ký. */
  sendEmailVerification: (email: string) => Promise<{ data: ApiResponse<SendEmailVerificationResponse> }>;
  /** Xác minh OTP 6 số để kích hoạt tài khoản Business Owner. */
  verifyBusinessEmail: (email: string, otp: string) => Promise<{ data: ApiResponse<VerifyBusinessEmailResponse> }>;
}

/** Authentication API service. All endpoints relative to /auth base path. */
const apiAuthService: AuthService = {
  login: (data) => apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data),
  logout: (refreshToken) => apiClient.post('/auth/logout', { refreshToken }),
  getMe: () => apiClient.get<ApiResponse<SessionUser>>('/auth/me'),
  sendEmailVerification: (email) =>
    apiClient.post<ApiResponse<SendEmailVerificationResponse>>('/auth/send-email-verification', { email }),
  verifyBusinessEmail: (email, otp) =>
    apiClient.post<ApiResponse<VerifyBusinessEmailResponse>>('/auth/verify-business-email', { email, otp }),
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
  sendEmailVerification: async (_email) => {
    await new Promise((r) => setTimeout(r, 800));
    return { data: { success: true, message: 'Mock OTP sent', data: { debugOtp: '123456' }, errors: [] } };
  },
  verifyBusinessEmail: async (_email, otp) => {
    await new Promise((r) => setTimeout(r, 800));
    if (otp === '123456') {
      return { data: { success: true, message: 'Verified', data: { verified: true, email: _email }, errors: [] } };
    }
    throw { response: { status: 400, data: { message: 'OTP không đúng hoặc đã hết hạn.' } } };
  },
};

/** With VITE_USE_MOCK=true the service answers from services/mock instead of the backend. */
export const authService: AuthService = USE_MOCK ? mockAuthAdapter : apiAuthService;
