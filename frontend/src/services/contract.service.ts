import { USE_MOCK } from './mock/mock-config';
import { lazyAdapter, unavailableAdapter } from './lazy-adapter';

type ContractService = typeof import('./mock/mock-contract.service').mockContractService;

const loadMock = () =>
  import.meta.env.VITE_USE_MOCK === 'true'
    ? import('./mock/mock-contract.service').then((module) => module.mockContractService)
    : Promise.reject(new Error('Mock services are disabled (VITE_USE_MOCK is not true).'));

export const contractService: ContractService = USE_MOCK
  ? lazyAdapter(loadMock)
  : unavailableAdapter<ContractService>('contract');
