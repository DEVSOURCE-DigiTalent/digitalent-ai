import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  learningService,
  type SubmitAttemptInput,
  type CreateInternalCourseInput,
} from '../services/learning.service';

export const LEARNING_KEYS = {
  course: (id?: string) => ['learning', 'course', id] as const,
  lesson: (courseId?: string, lessonId?: string) => ['learning', 'lesson', courseId, lessonId] as const,
  assessment: (id?: string) => ['learning', 'assessment', id] as const,
  assessments: (params?: Record<string, unknown>) => ['learning', 'assessments', params] as const,
  certificates: (params?: Record<string, unknown>) => ['learning', 'certificates', params] as const,
  internalCourses: (params?: Record<string, unknown>) => ['learning', 'internal-courses', params] as const,
  internalCourse: (id?: string) => ['learning', 'internal-course', id] as const,
};

export function useCourseDetail(id?: string) {
  return useQuery({
    queryKey: LEARNING_KEYS.course(id),
    queryFn: () => learningService.getCourseDetail(id!).then((res) => res.data.data!),
    enabled: Boolean(id),
  });
}

export function useLesson(courseId?: string, lessonId?: string) {
  return useQuery({
    queryKey: LEARNING_KEYS.lesson(courseId, lessonId),
    queryFn: () => learningService.getLesson(courseId!, lessonId!).then((res) => res.data.data!),
    enabled: Boolean(courseId && lessonId),
  });
}

export function useCompleteLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) =>
      learningService.completeLesson(courseId, lessonId).then((res) => res.data.data!),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: LEARNING_KEYS.course(variables.courseId) });
      qc.invalidateQueries({ queryKey: ['course-assignments'] });
    },
  });
}

export function useAssessment(id?: string) {
  return useQuery({
    queryKey: LEARNING_KEYS.assessment(id),
    queryFn: () => learningService.getAssessment(id!).then((res) => res.data.data!),
    enabled: Boolean(id),
  });
}

export function useSubmitAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SubmitAttemptInput }) =>
      learningService.submitAttempt(id, input).then((res) => res.data.data!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['learning'] });
      qc.invalidateQueries({ queryKey: ['course-assignments'] });
      qc.invalidateQueries({ queryKey: ['skill-gap'] });
      qc.invalidateQueries({ queryKey: ['competencies'] });
    },
  });
}

export function useAssessmentHistory(params?: {
  employeeId?: string;
  courseId?: string;
  passed?: string;
  search?: string;
  pageIndex?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: LEARNING_KEYS.assessments(params),
    queryFn: () => learningService.getAssessmentHistory(params).then((res) => res.data.data!),
  });
}

export function useCertificates(params?: {
  employeeId?: string;
  status?: string;
  search?: string;
  pageIndex?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: LEARNING_KEYS.certificates(params),
    queryFn: () => learningService.getCertificates(params).then((res) => res.data.data!),
  });
}

export function useInternalCourses(params?: {
  status?: string;
  search?: string;
  pageIndex?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: LEARNING_KEYS.internalCourses(params),
    queryFn: () => learningService.getInternalCourses(params).then((res) => res.data.data!),
  });
}

export function useInternalCourse(id?: string) {
  return useQuery({
    queryKey: LEARNING_KEYS.internalCourse(id),
    queryFn: () => learningService.getInternalCourseById(id!).then((res) => res.data.data!),
    enabled: Boolean(id),
  });
}

export function useCreateInternalCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInternalCourseInput) =>
      learningService.createInternalCourse(input).then((res) => res.data.data!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['learning', 'internal-courses'] });
    },
  });
}

export function useUpdateInternalCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: import('../services/learning.service').UpdateInternalCourseInput }) =>
      learningService.updateInternalCourse(id, input).then((res) => res.data.data!),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['learning', 'internal-courses'] });
      qc.invalidateQueries({ queryKey: LEARNING_KEYS.internalCourse(variables.id) });
    },
  });
}
