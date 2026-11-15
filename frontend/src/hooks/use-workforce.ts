import { useQuery } from '@tanstack/react-query';
import { workforceService, type WorkforceListParams } from '../services/workforce.service';

export const WORKFORCE_KEY = ['workforce'] as const;

export function useDepartmentWorkforce(departmentId?: string) {
  return useQuery({
    queryKey: [...WORKFORCE_KEY, 'department', departmentId],
    enabled: Boolean(departmentId),
    queryFn: async () => {
      const params = { departmentId, pageSize: 100 };
      const first = (await workforceService.getList({ ...params, pageIndex: 1 })).data.data!;
      const pages = await Promise.all(Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, index) =>
        workforceService.getList({ ...params, pageIndex: index + 2 }),
      ));
      return [...first.items, ...pages.flatMap(({ data }) => data.data?.items ?? [])];
    },
  });
}

export function useWorkforce(params?: WorkforceListParams, enabled = true) {
  return useQuery({
    queryKey: [...WORKFORCE_KEY, 'list', params],
    queryFn: async () => (await workforceService.getList(params)).data.data!,
    placeholderData: (previous) => previous,
    enabled,
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

