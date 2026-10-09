import apiClient from './api-client';
import { USE_MOCK } from './mock/mock-config';
import { lazyAdapter } from './lazy-adapter';
import type { PasswordResetRequestResult } from '../types/commerce';

export interface PasswordService {
  requestReset: (email: string) => Promise<{ data: { success: boolean; data: PasswordResetRequestResult; message?: string } }>;
  checkResetToken: (token: string) => Promise<{ data: { success: boolean; data: null; message?: string } }>;
  resetPassword: (token: string, password: string) => Promise<{ data: { success: boolean; data: null; message?: string } }>;
  verifyEmail: (token: string) => Promise<{ data: { success: boolean; data: null; message?: string } }>;
  resendVerificationEmail?: (email: string) => Promise<{ data: { success: boolean; data: { debugVerifyLink?: string }; message?: string } }>;
  getVerifyLink?: (email: string) => Promise<{ data: { success: boolean; data: { debugVerifyLink?: string }; message?: string } }>;
}

const apiPasswordService: PasswordService = {
  requestReset: async (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  checkResetToken: async (token: string) =>
    apiClient.get(`/auth/reset-password/validate?token=${encodeURIComponent(token)}`),

  resetPassword: async (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),

  verifyEmail: async (token: string) =>
    apiClient.post('/auth/verify-email', { token }),
};

const loadMock = () =>
  import.meta.env.VITE_USE_MOCK === 'true'
    ? import('./mock/mock-password.service').then((module) => module.mockPasswordService as unknown as PasswordService)
    : Promise.reject(new Error('Mock services are disabled (VITE_USE_MOCK is not true).'));

export const passwordService: PasswordService = USE_MOCK
  ? lazyAdapter(loadMock)
  : apiPasswordService;
