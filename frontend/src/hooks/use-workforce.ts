import { useQuery } from '@tanstack/react-query';
import { workforceService, type WorkforceListParams } from '../services/workforce.service';

export const WORKFORCE_KEY = ['workforce'] as const;

export function useWorkforce(params?: WorkforceListParams) {
  return useQuery({
    queryKey: [...WORKFORCE_KEY, 'list', params],
    queryFn: async () => (await workforceService.getList(params)).data.data!,
    placeholderData: (previous) => previous,
  });
}

export function useEmployeeCapability(employeeId: string | undefined) {
  return useQuery({
    queryKey: [...WORKFORCE_KEY, 'detail', employeeId],
    queryFn: async () => (await workforceService.getById(employeeId!)).data.data!,
    enabled: Boolean(employeeId),
    retry: false,
  });
}

export function useCompetencyMatrix(params?: import('../services/workforce.service').CompetencyMatrixParams) {
  return useQuery({
    queryKey: [...WORKFORCE_KEY, 'matrix', params],
    queryFn: async () => (await workforceService.getMatrix(params)).data.data!,
    placeholderData: (previous) => previous,
  });
}

