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
  getInvitation: (token) => apiClient.get<ApiResponse<InvitationDetail>>(`/invitations/${encodeURIComponent(token)}`),
  activate: (input) => apiClient.post<ApiResponse<ActivateInvitationResult>>('/invitations/activate', input),
};

/** The inline env check keeps the mock out of production builds (see services/auth.service.ts). */
const loadMock = () =>
  import.meta.env.VITE_USE_MOCK === 'true'
    ? import('./mock/mock-invitation.service').then((module) => module.mockInvitationService)
    : Promise.reject(new Error('Mock services are disabled (VITE_USE_MOCK is not true).'));

export const invitationService: InvitationService = USE_MOCK ? lazyAdapter(loadMock) : apiInvitationService;
