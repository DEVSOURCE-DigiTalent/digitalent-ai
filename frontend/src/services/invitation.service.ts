import apiClient from './api-client';
import { USE_MOCK } from './mock/mock-config';
import { lazyAdapter } from './lazy-adapter';
import type { ApiResponse } from '../types/api';
import type { ActivateInvitationInput, ActivateInvitationResult, InvitationDetail } from '../types/commerce';

interface InvitationService {
  getInvitation: (token: string) => Promise<{ data: ApiResponse<InvitationDetail> }>;
  activate: (input: ActivateInvitationInput) => Promise<{ data: ApiResponse<ActivateInvitationResult> }>;
}

/**
 * Public invitation activation (page /activate/:token). No sign-in needed: the token in the link is the access.
 * Every unusable link (wrong, used, revoked, replaced or expired) answers the same 404.
 */
const apiInvitationService: InvitationService = {
  getInvitation: async (token) => {
    try {
      return await apiClient.get<ApiResponse<InvitationDetail>>(`/invitations/${encodeURIComponent(token)}`);
    } catch (err: any) {
      if (import.meta.env.DEV && (!err.response || err.response?.status >= 500 || err.code === 'ERR_NETWORK' || err.message?.includes('Network Error'))) {
        const mock = await import('./mock/mock-invitation.service');
        return mock.mockInvitationService.getInvitation(token);
      }
      throw err;
    }
  },
  activate: async (input) => {
    try {
      return await apiClient.post<ApiResponse<ActivateInvitationResult>>('/invitations/activate', input);
    } catch (err: any) {
      if (import.meta.env.DEV && (!err.response || err.response?.status >= 500 || err.code === 'ERR_NETWORK' || err.message?.includes('Network Error'))) {
        const mock = await import('./mock/mock-invitation.service');
        return mock.mockInvitationService.activate(input);
      }
      throw err;
    }
  },
};

/** The inline env check keeps the mock out of production builds (see services/auth.service.ts). */
const loadMock = () =>
  import.meta.env.VITE_USE_MOCK === 'true'
    ? import('./mock/mock-invitation.service').then((module) => module.mockInvitationService)
    : Promise.reject(new Error('Mock services are disabled (VITE_USE_MOCK is not true).'));

export const invitationService: InvitationService = USE_MOCK ? lazyAdapter(loadMock) : apiInvitationService;
