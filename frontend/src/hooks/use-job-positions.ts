import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  jobPositionService,
  type JobPositionListParams,
  type CreateJobPositionRequest,
  type UpdateJobPositionRequest,
} from '../services/job-position.service';

const QUERY_KEY = ['job-positions'];

export function useJobPositions(params?: JobPositionListParams) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: async () => {
      const res = await jobPositionService.getAll(params);
      return res.data.data;
    },
  });
}

export function useJobPosition(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      const res = await jobPositionService.getById(id);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateJobPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobPositionRequest) => jobPositionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateJobPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobPositionRequest }) =>
      jobPositionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteJobPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobPositionService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
