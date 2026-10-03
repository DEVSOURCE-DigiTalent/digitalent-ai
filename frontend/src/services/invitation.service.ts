import { USE_MOCK } from './mock/mock-config';
import { lazyAdapter, unavailableAdapter } from './lazy-adapter';

type InvitationService = typeof import('./mock/mock-invitation.service').mockInvitationService;

/**
 * Employee invitation activation. No backend endpoint exists yet, so this only works in mock mode (VITE_USE_MOCK=true).
 * The inline env check keeps the mock out of production builds (see services/auth.service.ts).
 */
const loadMock = () =>
  import.meta.env.VITE_USE_MOCK === 'true'
    ? import('./mock/mock-invitation.service').then((module) => module.mockInvitationService)
    : Promise.reject(new Error('Mock services are disabled (VITE_USE_MOCK is not true).'));

export const invitationService: InvitationService = USE_MOCK
  ? lazyAdapter(loadMock)
  : unavailableAdapter<InvitationService>('invitation');
