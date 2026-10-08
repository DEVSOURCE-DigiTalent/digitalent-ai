import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  personalLearningService, type PersonalAccess, type SeenKey, type SubmitTaskInput,
} from '../services/personal-learning.service';

/** Personal workspace data (/personal/*). Every change refreshes the whole track: levels, path and tasks move together. */

const ROOT = ['personal'] as const;

export const PERSONAL_KEYS = {
  overview: [...ROOT, 'overview'] as const,
  skillGap: [...ROOT, 'skill-gap'] as const,
  diagnostic: [...ROOT, 'diagnostic'] as const,
  path: [...ROOT, 'path'] as const,
  course: (id?: string) => [...ROOT, 'course', id] as const,
  assessment: (id?: string) => [...ROOT, 'assessment', id] as const,
  tasks: [...ROOT, 'tasks'] as const,
  certificates: [...ROOT, 'certificates'] as const,
  progress: [...ROOT, 'progress'] as const,
  /** Plan mode, trial counters and the guidance state. Every mutation below invalidates it through ROOT. */
  access: [...ROOT, 'access'] as const,
};

function useRefreshTrack() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ROOT });
}

export function usePersonalOverview() {
  return useQuery({ queryKey: PERSONAL_KEYS.overview, queryFn: personalLearningService.getOverview });
}

export function usePersonalSkillGap() {
  return useQuery({ queryKey: PERSONAL_KEYS.skillGap, queryFn: personalLearningService.getSkillGap });
}

export function usePersonalDiagnostic() {
  return useQuery({ queryKey: PERSONAL_KEYS.diagnostic, queryFn: personalLearningService.getDiagnostic });
}

export function usePersonalPath() {
  return useQuery({ queryKey: PERSONAL_KEYS.path, queryFn: personalLearningService.getPath });
}

export function usePersonalCourse(id?: string) {
  return useQuery({
    queryKey: PERSONAL_KEYS.course(id),
    queryFn: () => personalLearningService.getCourse(id!),
    enabled: Boolean(id),
  });
}

export function usePersonalAssessment(courseId?: string, enabled = true) {
  return useQuery({
    queryKey: PERSONAL_KEYS.assessment(courseId),
    queryFn: () => personalLearningService.getAssessment(courseId!),
    enabled: Boolean(courseId) && enabled,
  });
}

export function usePersonalTasks() {
  return useQuery({ queryKey: PERSONAL_KEYS.tasks, queryFn: personalLearningService.getTasks });
}

export function usePersonalCertificates() {
  return useQuery({ queryKey: PERSONAL_KEYS.certificates, queryFn: personalLearningService.getCertificates });
}

export function usePersonalProgress() {
  return useQuery({ queryKey: PERSONAL_KEYS.progress, queryFn: personalLearningService.getProgress });
}

/** How long the plan state is trusted before a page that shows it asks again (the app default is five minutes). */
const ACCESS_STALE_MS = 30 * 1000;

export function usePersonalAccess() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: PERSONAL_KEYS.access, queryFn: personalLearningService.getAccess, staleTime: ACCESS_STALE_MS });
  const mode = query.data?.mode;
  const lastMode = useRef(mode);

  // A plan change (a trial that ended, a payment in another tab) changes what the path, courses and certificates
  // answer, and those keep their data for minutes: read them again so no screen contradicts the plan label.
  useEffect(() => {
    if (mode && lastMode.current && mode !== lastMode.current) {
      void queryClient.invalidateQueries({ queryKey: ROOT, predicate: (entry) => entry.queryKey[1] !== 'access' });
    }
    lastMode.current = mode ?? lastMode.current;
  }, [mode, queryClient]);

  return query;
}

/**
 * Marks a hint as seen. The cache is updated at once so the hint closes without waiting for the server; the
 * checklist is recomputed by the server, so the access query is refreshed when the call settles.
 */
export function useMarkSeen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: SeenKey) => personalLearningService.markSeen(key),
    onMutate: (key) => {
      queryClient.setQueryData<PersonalAccess>(PERSONAL_KEYS.access, (access) =>
        access && !access.seen[key] ? { ...access, seen: { ...access.seen, [key]: new Date().toISOString() } } : access,
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: PERSONAL_KEYS.access }),
  });
}

export function useSetPersonalTarget() {
  const refresh = useRefreshTrack();
  return useMutation({ mutationFn: personalLearningService.setTarget, onSuccess: refresh });
}

export function useSubmitDiagnostic() {
  const refresh = useRefreshTrack();
  return useMutation({ mutationFn: personalLearningService.submitDiagnostic, onSuccess: refresh });
}

export function useSetLessonCompleted() {
  const queryClient = useQueryClient();
  const refresh = useRefreshTrack();
  return useMutation({
    mutationFn: ({ courseId, lessonId, completed }: { courseId: string; lessonId: string; completed: boolean }) =>
      personalLearningService.setLessonCompleted(courseId, lessonId, completed),
    onSuccess: (course) => {
      queryClient.setQueryData(PERSONAL_KEYS.course(course.id), course);
      refresh();
    },
  });
}

export function useSaveCourseNotes() {
  return useMutation({
    mutationFn: ({ courseId, notes }: { courseId: string; notes: string }) =>
      personalLearningService.saveNotes(courseId, notes),
  });
}

export function useSubmitCourseAssessment() {
  const refresh = useRefreshTrack();
  return useMutation({
    mutationFn: ({ courseId, answers }: { courseId: string; answers: Record<string, number> }) =>
      personalLearningService.submitAssessment(courseId, answers),
    onSuccess: refresh,
  });
}

export function useSubmitPersonalTask() {
  const refresh = useRefreshTrack();
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: SubmitTaskInput }) =>
      personalLearningService.submitTask(taskId, input),
    onSuccess: refresh,
  });
}
