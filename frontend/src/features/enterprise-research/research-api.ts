import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/use-current-user';
import apiClient from '@/services/api-client';
import type { PulseSlide } from '@/services/pulse.service';

export interface ResearchCourseContent {
  title: string;
  objective: string;
  practice: string;
}

interface ResearchCourseVersion {
  draft: ResearchCourseContent | null;
  applied: ResearchCourseContent | null;
}

export interface ResearchCourse extends ResearchCourseVersion {
  courseId: string;
  code: string;
  title: string;
  description?: string;
  tier: number;
  modules: string[];
}

const resource = '/enterprise/rnd';
const keys = {
  settings: (userId?: string) => ['enterprise-rnd', userId, 'settings'] as const,
  courses: (userId?: string) => ['enterprise-rnd', userId, 'courses'] as const,
  preview: (userId: string | undefined, courseId: string) => ['enterprise-rnd', userId, 'preview', courseId] as const,
};

export function useResearchSettings(enabled = true) {
  const userId = useCurrentUser((state) => state.user?.id);
  return useQuery({
    queryKey: keys.settings(userId),
    queryFn: async () => (await apiClient.get<{ data: boolean }>(`${resource}/settings`)).data.data,
    enabled: enabled && Boolean(userId),
    retry: false,
  });
}

export function useSetResearchEnabled() {
  const userId = useCurrentUser((state) => state.user?.id);
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (enabled: boolean) =>
      (await apiClient.put<{ data: boolean }>(`${resource}/settings`, JSON.stringify(enabled))).data.data,
    onSuccess: async (enabled) => {
      client.setQueryData(keys.settings(userId), enabled);
      await client.invalidateQueries({ queryKey: keys.courses(userId) });
    },
  });
}

export function useResearchCourses(enabled: boolean) {
  const userId = useCurrentUser((state) => state.user?.id);
  return useQuery({
    queryKey: keys.courses(userId),
    queryFn: async () => (await apiClient.get<{ data: ResearchCourse[] }>(`${resource}/courses`)).data.data,
    enabled: enabled && Boolean(userId),
  });
}

export function useSaveResearchCourse() {
  const userId = useCurrentUser((state) => state.user?.id);
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, content, apply }: { courseId: string; content: ResearchCourseContent; apply: boolean }) =>
      (await apiClient.put<{ data: ResearchCourseVersion }>(`${resource}/courses/${courseId}/${apply ? 'applied' : 'draft'}`, content)).data.data,
    onSuccess: (version, { courseId, apply }) => {
      client.setQueryData<ResearchCourse[]>(keys.courses(userId), (courses) => courses?.map((course) =>
        course.courseId === courseId ? { ...course, ...version } : course,
      ));
      if (apply) void client.invalidateQueries({ queryKey: ['pulse', 'courses'] });
    },
  });
}

export function useResearchPreview(courseId: string, open: boolean) {
  const userId = useCurrentUser((state) => state.user?.id);
  return useQuery({
    queryKey: keys.preview(userId, courseId),
    queryFn: async () => (await apiClient.get<{ data: { id: string; title: string; lessons: PulseSlide[] }[] }>(
      `${resource}/courses/${courseId}/preview`,
    )).data.data,
    enabled: open && Boolean(userId),
  });
}
