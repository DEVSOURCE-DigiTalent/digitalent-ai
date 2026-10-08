import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  taskService,
  type CreatePracticalTaskPayload,
  type EvaluateSubmissionPayload,
  type PracticalTaskDto,
  type PracticalTaskDetailDto,
  type ReviewQueueItemDto,
  type SubmissionDetailDto,
} from '@/services/task.service';
import type { PagedList } from '@/types/api';

export function usePracticalTasks(params?: {
  departmentId?: string;
  search?: string;
  status?: string;
  pageIndex?: number;
  pageSize?: number;
}) {
  return useQuery<PagedList<PracticalTaskDto>>({
    queryKey: ['tasks', params],
    queryFn: async () => {
      const res = await taskService.getTasks(params);
      return ((res.data as any)?.data ?? res.data) as PagedList<PracticalTaskDto>;
    },
  });
}

export function usePracticalTask(id?: string) {
  return useQuery<PracticalTaskDetailDto | null>({
    queryKey: ['tasks', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await taskService.getTaskDetail(id);
      return ((res.data as any)?.data ?? res.data) as PracticalTaskDetailDto;
    },
    enabled: Boolean(id),
  });
}

export function useCreatePracticalTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePracticalTaskPayload) => taskService.createTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
    },
  });
}

export function useReviewQueue(params?: { search?: string; pageIndex?: number; pageSize?: number }) {
  return useQuery<PagedList<ReviewQueueItemDto>>({
    queryKey: ['review-queue', params],
    queryFn: async () => {
      const res = await taskService.getReviewQueue(params);
      return ((res.data as any)?.data ?? res.data) as PagedList<ReviewQueueItemDto>;
    },
  });
}

export function useSubmissionDetail(id?: string) {
  return useQuery<SubmissionDetailDto | null>({
    queryKey: ['submissions', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await taskService.getSubmissionDetail(id);
      return ((res.data as any)?.data ?? res.data) as SubmissionDetailDto;
    },
    enabled: Boolean(id),
  });
}

export function useEvaluateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EvaluateSubmissionPayload }) =>
      taskService.evaluateSubmission(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-queue'] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-evidence'] });
    },
  });
}
