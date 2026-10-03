import { USE_MOCK } from './mock/mock-config';
import { lazyAdapter, unavailableAdapter } from './lazy-adapter';

type OnboardingService = typeof import('./mock/mock-onboarding.service').mockOnboardingService;

/**
 * Organization setup wizard. No backend endpoint exists yet, so this only works in mock mode (VITE_USE_MOCK=true).
 * The inline env check keeps the mock out of production builds (see services/auth.service.ts).
 */
const loadMock = () =>
  import.meta.env.VITE_USE_MOCK === 'true'
    ? import('./mock/mock-onboarding.service').then((module) => module.mockOnboardingService)
    : Promise.reject(new Error('Mock services are disabled (VITE_USE_MOCK is not true).'));

export const onboardingService: OnboardingService = USE_MOCK
  ? lazyAdapter(loadMock)
  : unavailableAdapter<OnboardingService>('onboarding');
