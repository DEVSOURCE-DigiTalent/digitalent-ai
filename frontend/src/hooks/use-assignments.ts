import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignmentService, type AssignmentListParams, type CreateAssignmentRequest,
} from '../services/assignment.service';

export const ASSIGNMENTS_KEY = ['assignments'] as const;

export function useCourses(params?: { search?: string; status?: string; categoryId?: string; level?: number; pageIndex?: number; pageSize?: number }, enabled = true) {
  return useQuery({
    queryKey: [...ASSIGNMENTS_KEY, 'courses', params],
    queryFn: async () => (await assignmentService.getCourses(params)).data.data!,
    enabled,
  });
}

/** BE2 fixes course ordering by code and has no sort parameter. Fetch filtered pages before UI sorting. */
export function useCourseCatalog(params: { search?: string; status?: string; categoryId?: string; level?: number }) {
  return useQuery({
    queryKey: [...ASSIGNMENTS_KEY, 'catalog', params],
    queryFn: async () => {
      const pageSize = 100;
      const first = (await assignmentService.getCourses({ ...params, pageIndex: 1, pageSize })).data.data!;
      const remainingPages = await Promise.all(
        Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, index) =>
          assignmentService.getCourses({ ...params, pageIndex: index + 2, pageSize }),
        ),
      );
      return {
        items: [...first.items, ...remainingPages.flatMap((response) => response.data.data?.items ?? [])],
        totalItems: first.totalItems,
      };
    },
  });
}

export function useCourse(id: string | undefined) {
  return useQuery({
    queryKey: [...ASSIGNMENTS_KEY, 'courses', id],
    queryFn: async () => {
      let courseId = id!;
      // Deployed demo URLs use crs-A1-F; BE2 detail routes require GUIDs.
      const demoCode = import.meta.env.VITE_USE_MOCK === 'true' ? null : courseId.match(/^crs-([AM])(\d+)-([FIA])$/i);
      if (demoCode) {
        const requestedCode = `${demoCode[1].toUpperCase()}${demoCode[2]}-${demoCode[3].toUpperCase()}`;
        const fallbackCode = `${demoCode[1].toUpperCase() === 'A' ? 'M' : 'A'}${demoCode[2]}-${demoCode[3].toUpperCase()}`;
        const response = await assignmentService.getCourses({ search: `${demoCode[2]}-${demoCode[3].toUpperCase()}`, pageIndex: 1, pageSize: 100 });
        const match = response.data.data?.items.find((course) => course.code.toUpperCase() === requestedCode)
          ?? response.data.data?.items.find((course) => course.code.toUpperCase() === fallbackCode);
        if (!match) throw new Error(`Không tìm thấy khóa học ${requestedCode} trên BE2.`);
        courseId = match.id;
      }
      return (await assignmentService.getCourse(courseId)).data.data!;
    },
    enabled: !!id,
  });
}

export function useCourseLesson(id: string | undefined) {
  return useQuery({
    queryKey: [...ASSIGNMENTS_KEY, 'lesson', id],
    queryFn: async () => (await assignmentService.getLesson(id!)).data.data!,
    enabled: !!id,
  });
}

export function useAssignments(params?: AssignmentListParams, enabled = true) {
  return useQuery({
    queryKey: [...ASSIGNMENTS_KEY, 'list', params],
    queryFn: async () => (await assignmentService.getList(params)).data.data!,
    placeholderData: (previous) => previous,
    enabled,
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
