import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { personalLearningService, type SubmitTaskInput } from '../services/personal-learning.service';

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
