import { USE_MOCK } from './mock/mock-config';
import { lazyAdapter, unavailableAdapter } from './lazy-adapter';

type RegistrationService = typeof import('./mock/mock-registration.service').mockRegistrationService;

/**
 * Sign-up of enterprise owners and individual users. No backend endpoint exists yet, so this only works in mock mode (VITE_USE_MOCK=true).
 * The inline env check keeps the mock out of production builds (see services/auth.service.ts).
 */
const loadMock = () =>
  import.meta.env.VITE_USE_MOCK === 'true'
    ? import('./mock/mock-registration.service').then((module) => module.mockRegistrationService)
    : Promise.reject(new Error('Mock services are disabled (VITE_USE_MOCK is not true).'));

export const registrationService: RegistrationService = USE_MOCK
  ? lazyAdapter(loadMock)
  : unavailableAdapter<RegistrationService>('registration');
