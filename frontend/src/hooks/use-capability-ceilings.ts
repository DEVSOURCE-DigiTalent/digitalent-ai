import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  capabilityCeilingService,
  type CapabilityCeilings,
  type CeilingInput,
  type UpdateDepartmentCeilingsRequest,
} from '../services/capability-ceiling.service';

export const CAPABILITY_CEILINGS_KEY = ['capability-ceilings'] as const;

export function useCapabilityCeilings() {
  return useQuery({
    queryKey: CAPABILITY_CEILINGS_KEY,
    queryFn: async () => {
      const response = await capabilityCeilingService.get();
      return response.data.data;
    },
  });
}

/** Saving returns the whole matrix, so the cache is replaced instead of refetched. */
function useStoreMatrix() {
  const queryClient = useQueryClient();
  return (matrix: CapabilityCeilings | null) =>
    matrix
      ? queryClient.setQueryData(CAPABILITY_CEILINGS_KEY, matrix)
      : queryClient.invalidateQueries({ queryKey: CAPABILITY_CEILINGS_KEY });
}

export function useUpdateOrganizationCeilings() {
  const store = useStoreMatrix();
  return useMutation({
    mutationFn: async (ceilings: CeilingInput[]) => (await capabilityCeilingService.updateOrganization(ceilings)).data.data,
    onSuccess: store,
  });
}

export function useUpdateDepartmentCeilings() {
  const store = useStoreMatrix();
  return useMutation({
    mutationFn: async ({ departmentId, data }: { departmentId: string; data: UpdateDepartmentCeilingsRequest }) =>
      (await capabilityCeilingService.updateDepartment(departmentId, data)).data.data,
    onSuccess: store,
  });
}
