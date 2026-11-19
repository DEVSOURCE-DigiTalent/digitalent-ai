import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  capabilityCeilingService,
  type CapabilityCeilings,
  type CeilingInput,
  type UpdatePositionCeilingsRequest,
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

/** OW-05 "Năng lực từng vị trí": saves the required levels of one of the 5 standard positions (by code). */
export function useUpdatePositionCeilings() {
  const store = useStoreMatrix();
  return useMutation({
    mutationFn: async ({ code, data }: { code: string; data: UpdatePositionCeilingsRequest }) =>
      (await capabilityCeilingService.updatePosition(code, data)).data.data,
    onSuccess: store,
  });
}

