import { USE_MOCK } from './mock/mock-config';
import { lazyAdapter, unavailableAdapter } from './lazy-adapter';

type PasswordService = typeof import('./mock/mock-password.service').mockPasswordService;

/**
 * Password reset and email verification. No backend endpoint exists yet, so this only works in mock mode (VITE_USE_MOCK=true).
 * The inline env check keeps the mock out of production builds (see services/auth.service.ts).
 */
const loadMock = () =>
  import.meta.env.VITE_USE_MOCK === 'true'
    ? import('./mock/mock-password.service').then((module) => module.mockPasswordService)
    : Promise.reject(new Error('Mock services are disabled (VITE_USE_MOCK is not true).'));

export const passwordService: PasswordService = USE_MOCK
  ? lazyAdapter(loadMock)
  : unavailableAdapter<PasswordService>('password');
