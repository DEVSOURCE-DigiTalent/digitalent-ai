import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/use-current-user';
import { MEMBERS_KEY } from '@/hooks/use-members';
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
  /** Modules or final edited and not applied yet (the information draft is `draft`). */
  hasContentDraft?: boolean;
  /** Editor revision, sent back when the course is applied with others. */
  editorRevision?: number;
  learnersInProgress?: number;
  learnersFinished?: number;
}

/** Edited and not applied: content or information. */
export const hasUnappliedDraft = (course: ResearchCourse) => Boolean(course.hasContentDraft || course.draft);

const resource = '/enterprise/rnd';
/**
 * Who customises the company's courses: the owner of a company without R&D, the R&D accounts of a company with R&D
 * (the owner then only views) — once a course is bought. reason = why the page is closed when canView is false.
 */
export interface ResearchAccess {
  enabled: boolean;
  purchased: boolean;
  inCharge: 'OWNER' | 'RND';
  researchers: number;
  canView: boolean;
  canEdit: boolean;
  reason?: string | null;
  /** R&D invitations not activated yet (owner only); switching R&D off revokes them. */
  pendingInvitations?: number;
}

export const researchKeys = {
  settings: (userId?: string) => ['enterprise-rnd', userId, 'settings'] as const,
  access: (userId?: string) => ['enterprise-rnd', userId, 'access'] as const,
  courses: (userId?: string) => ['enterprise-rnd', userId, 'courses'] as const,
  preview: (userId: string | undefined, courseId: string) => ['enterprise-rnd', userId, 'preview', courseId] as const,
};

export function useResearchSettings(enabled = true) {
  const userId = useCurrentUser((state) => state.user?.id);
  return useQuery({
    queryKey: researchKeys.settings(userId),
    queryFn: async () => (await apiClient.get<{ data: boolean }>(`${resource}/settings`)).data.data,
    enabled: enabled && Boolean(userId),
    retry: false,
  });
}

export function useResearchAccess() {
  const userId = useCurrentUser((state) => state.user?.id);
  return useQuery({
    queryKey: researchKeys.access(userId),
    queryFn: async () => (await apiClient.get<{ data: ResearchAccess }>(`${resource}/access`)).data.data,
    enabled: Boolean(userId),
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
      client.setQueryData(researchKeys.settings(userId), enabled);
      await client.invalidateQueries({ queryKey: researchKeys.access(userId) });
      await client.invalidateQueries({ queryKey: researchKeys.courses(userId) });
      // Switching off revokes the open R&D invitations.
      if (!enabled) await client.invalidateQueries({ queryKey: MEMBERS_KEY });
    },
  });
}

export function useResearchCourses(enabled: boolean) {
  const userId = useCurrentUser((state) => state.user?.id);
  return useQuery({
    queryKey: researchKeys.courses(userId),
    queryFn: async () => (await apiClient.get<{ data: ResearchCourse[] }>(`${resource}/courses`)).data.data,
    enabled: enabled && Boolean(userId),
  });
}

/** Saves the information form as R&D's draft; employees see it once the company version is applied. */
export function useSaveResearchCourse() {
  const userId = useCurrentUser((state) => state.user?.id);
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, content }: { courseId: string; content: ResearchCourseContent }) =>
      (await apiClient.put<{ data: ResearchCourseVersion }>(`${resource}/courses/${courseId}/draft`, content)).data.data,
    onSuccess: (version, { courseId }) => {
      client.setQueryData<ResearchCourse[]>(researchKeys.courses(userId), (courses) => courses?.map((course) =>
        course.courseId === courseId ? { ...course, ...version } : course,
      ));
    },
  });
}

export function useResearchPreview(courseId: string, open: boolean) {
  const userId = useCurrentUser((state) => state.user?.id);
  return useQuery({
    queryKey: researchKeys.preview(userId, courseId),
    queryFn: async () => (await apiClient.get<{ data: { id: string; title: string; lessons: PulseSlide[] }[] }>(
      `${resource}/courses/${courseId}/preview`,
    )).data.data,
    enabled: open && Boolean(userId),
  });
}
