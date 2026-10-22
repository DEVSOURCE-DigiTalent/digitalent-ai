import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { referencePositionLevelsService, type ReferencePositionLevels } from '@/services/reference-position-levels.service';

const KEY = ['reference-position-levels'] as const;

export function useReferencePositionLevels() {
  return useQuery({ queryKey: KEY, queryFn: async () => (await referencePositionLevelsService.get()).data.data });
}

export function useUpdateReferencePositionLevels() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ReferencePositionLevels) => (await referencePositionLevelsService.update(data)).data.data,
    onSuccess: (data) => queryClient.setQueryData(KEY, data),
  });
}
