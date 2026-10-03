import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignmentService, type AssignmentListParams, type CreateAssignmentRequest,
} from '../services/assignment.service';

export const ASSIGNMENTS_KEY = ['assignments'] as const;

export function useCourses(params?: { search?: string; status?: string; categoryId?: string; level?: number }) {
  return useQuery({
    queryKey: [...ASSIGNMENTS_KEY, 'courses', params],
    queryFn: async () => (await assignmentService.getCourses(params)).data.data!,
  });
}

export function useCourse(id: string | undefined) {
  return useQuery({
    queryKey: [...ASSIGNMENTS_KEY, 'courses', id],
    queryFn: async () => (await assignmentService.getCourse(id!)).data.data!,
    enabled: !!id,
  });
}

export function useAssignments(params?: AssignmentListParams) {
  return useQuery({
    queryKey: [...ASSIGNMENTS_KEY, 'list', params],
    queryFn: async () => (await assignmentService.getList(params)).data.data!,
    placeholderData: (previous) => previous,
  });
}

export function useAssignmentSummary() {
  return useQuery({ queryKey: [...ASSIGNMENTS_KEY, 'summary'], queryFn: async () => (await assignmentService.getSummary()).data.data! });
}

/** Everything that depends on who is enrolled in what. */
function useRefreshLearningData() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(
      [ASSIGNMENTS_KEY, ['workforce'], ['analytics'], ['recommendations'], ['skill-gaps']].map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    );
}

export function useCreateAssignments() {
  const refresh = useRefreshLearningData();
  return useMutation({
    mutationFn: async (data: CreateAssignmentRequest) => (await assignmentService.create(data)).data.data!,
    onSuccess: refresh,
  });
}

export function useCancelAssignment() {
  const refresh = useRefreshLearningData();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => (await assignmentService.cancel(id, reason)).data.data!,
    onSuccess: refresh,
  });
}
