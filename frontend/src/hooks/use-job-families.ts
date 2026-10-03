import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  jobFamilyService,
  type GetPagedJobFamiliesParams,
  type CreateJobFamilyRequest,
  type UpdateJobFamilyRequest,
} from '@/services/job-family.service';

export const JOB_FAMILIES_QUERY_KEY = 'job-families';

export function useJobFamilies(params?: GetPagedJobFamiliesParams) {
  return useQuery({
    queryKey: [JOB_FAMILIES_QUERY_KEY, params],
    queryFn: () => jobFamilyService.getPaged(params),
  });
}

export function useJobFamily(id: string) {
  return useQuery({
    queryKey: [JOB_FAMILIES_QUERY_KEY, id],
    queryFn: () => jobFamilyService.getById(id),
    enabled: !!id,
  });
}

export function useCreateJobFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobFamilyRequest) => jobFamilyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [JOB_FAMILIES_QUERY_KEY] });
    },
  });
}

export function useUpdateJobFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobFamilyRequest }) =>
      jobFamilyService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [JOB_FAMILIES_QUERY_KEY] });
    },
  });
}

export function useDeleteJobFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobFamilyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [JOB_FAMILIES_QUERY_KEY] });
    },
  });
}
