import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  jobPositionService,
  type JobPositionListParams,
  type CreateJobPositionRequest,
  type UpdateJobPositionRequest,
} from '../services/job-position.service';

const QUERY_KEY = ['job-positions'];

/**
 * Data a position change shows up in: position lists and details, member rows (position, grade), department and
 * grade counts, the overview setup steps, and live skill-gap comparisons.
 */
const POSITION_DEPENDENT_KEYS = [QUERY_KEY, ['members'], ['employees'], ['workforce'], ['departments'], ['job-grades'], ['organization', 'overview'], ['skill-gaps', 'learning-needs']];

function useInvalidatePositions() {
  const queryClient = useQueryClient();
  return () => Promise.all(POSITION_DEPENDENT_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

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
  const invalidate = useInvalidatePositions();
  return useMutation({
    mutationFn: (data: CreateJobPositionRequest) => jobPositionService.create(data),
    onSuccess: invalidate,
  });
}

export function useUpdateJobPosition() {
  const invalidate = useInvalidatePositions();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobPositionRequest }) =>
      jobPositionService.update(id, data),
    onSuccess: invalidate,
  });
}

export function useDeleteJobPosition() {
  const invalidate = useInvalidatePositions();
  return useMutation({
    mutationFn: (id: string) => jobPositionService.remove(id),
    onSuccess: invalidate,
  });
}
