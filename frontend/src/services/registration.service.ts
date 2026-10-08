import apiClient from './api-client';
import { USE_MOCK } from './mock/mock-config';
import { lazyAdapter } from './lazy-adapter';
import type { RegisterEnterpriseInput, RegisterIndividualInput, RegistrationResult } from '../types/commerce';
import type { ApiResponse } from '../types/api';

export interface VerifyRegistrationInput {
  otp?: string;
  token?: string;
}

export interface VerifyRegistrationResponseData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  user: any;
  nextPath: string;
  purchaseDraft?: any;
}

export interface RegistrationService {
  registerEnterprise: (input: RegisterEnterpriseInput) => Promise<{ data: ApiResponse<RegistrationResult> }>;
  registerIndividual: (input: RegisterIndividualInput) => Promise<{ data: ApiResponse<any> }>;
  verifyIndividual: (id: string, input: VerifyRegistrationInput) => Promise<{ data: ApiResponse<VerifyRegistrationResponseData> }>;
  resendVerification: (id: string, registrationAccessToken: string) => Promise<{ data: ApiResponse<any> }>;
  getRegistrationStatus: (id: string, token: string) => Promise<{ data: ApiResponse<any> }>;
}

const loadMock = (): Promise<RegistrationService> =>
  import.meta.env.VITE_USE_MOCK === 'true'
    ? import('./mock/mock-registration.service').then((module) => ({
        registerEnterprise: module.mockRegistrationService.registerEnterprise,
        registerIndividual: module.mockRegistrationService.registerIndividual,
        verifyIndividual: async () => ({
          data: {
            success: true,
            message: 'Verified',
            data: { accessToken: 'mock-token', expiresAt: '', user: {}, nextPath: '/personal' },
            errors: [],
          },
        }),
        resendVerification: async () => ({
          data: { success: true, message: 'Resent', data: {}, errors: [] },
        }),
        getRegistrationStatus: async () => ({
          data: { success: true, message: 'Status', data: { state: 'verified' }, errors: [] },
        }),
      }))
    : Promise.reject(new Error('Mock services are disabled (VITE_USE_MOCK is not true).'));

const apiRegistrationService: RegistrationService = {
  registerEnterprise: async (input: RegisterEnterpriseInput) => {
    return apiClient.post('/enterprise-registrations', input);
  },

  registerIndividual: async (input: RegisterIndividualInput) => {
    const payload = {
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      acceptTerms: input.acceptTerms ?? true,
      intent: input.trial ? 'TRIAL' : 'PURCHASE',
      source: input.trial ? 'pricing' : 'landing',
      positionCode: input.positionCode,
      tryOrientation: input.tryOrientation ? {
        positionCode: input.tryOrientation.positionCode,
        correct: input.tryOrientation.correct,
        total: input.tryOrientation.total,
        completedAt: input.tryOrientation.completedAt,
      } : undefined,
      planSelection: input.plan ? {
        planCode: input.plan.planCode,
        cycle: input.plan.cycle,
        seats: input.plan.seats ?? 1,
      } : undefined,
    };
    return apiClient.post('/individual-registrations', payload);
  },

  verifyIndividual: async (id: string, input: VerifyRegistrationInput) => {
    const res = await apiClient.post<ApiResponse<VerifyRegistrationResponseData>>(`/individual-registrations/${id}/verify`, input);
    if (res.data?.data?.accessToken) {
      localStorage.setItem('accessToken', res.data.data.accessToken);
    }
    return res;
  },

  resendVerification: async (id: string, registrationAccessToken: string) => {
    return apiClient.post(`/individual-registrations/${id}/resend`, { registrationAccessToken });
  },

  getRegistrationStatus: async (id: string, token: string) => {
    return apiClient.get(`/individual-registrations/${id}`, {
      headers: { 'X-Registration-Token': token },
    });
  },
};

export const registrationService: RegistrationService = USE_MOCK
  ? lazyAdapter(loadMock)
  : apiRegistrationService;
