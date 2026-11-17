import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  capabilityCeilingService,
  type CapabilityCeilings,
  type CeilingInput,
  type UpdateDepartmentCeilingsRequest,
} from '../services/capability-ceiling.service';
import { TRIAL_PROGRAM_KEYS } from './use-trial-program';

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

/** Organization milestone per domain; the trial report compares results with it, so its cache is refreshed too. */
export function useUpdateCompetencyMilestones() {
  const store = useStoreMatrix();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (milestones: CeilingInput[]) => (await capabilityCeilingService.updateMilestones(milestones)).data.data,
    onSuccess: (matrix) => {
      store(matrix);
      void queryClient.invalidateQueries({ queryKey: TRIAL_PROGRAM_KEYS.all });
    },
  });
}
