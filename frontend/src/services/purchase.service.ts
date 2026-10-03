import { USE_MOCK } from './mock/mock-config';
import { lazyAdapter, unavailableAdapter } from './lazy-adapter';

type PurchaseService = typeof import('./mock/mock-purchase.service').mockPurchaseService;

/**
 * Purchase drafts lifecycle. No backend endpoint exists yet, so this only works in mock mode (VITE_USE_MOCK=true).
 * The inline env check keeps the mock out of production builds.
 */
const loadMock = () =>
  import.meta.env.VITE_USE_MOCK === 'true'
    ? import('./mock/mock-purchase.service').then((module) => module.mockPurchaseService)
    : Promise.reject(new Error('Mock services are disabled (VITE_USE_MOCK is not true).'));

export const purchaseService: PurchaseService = USE_MOCK
  ? lazyAdapter(loadMock)
  : unavailableAdapter<PurchaseService>('purchase');
