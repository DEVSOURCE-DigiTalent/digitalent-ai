import apiClient from './api-client';
import type { ApiResponse, PagedList } from '../types/api';
import type { CourseModuleContent, LessonItem, AssessmentQuestion } from '../features/learning/data/course-content';

export interface CourseDetailDto {
  id: string;
  code: string;
  title: string;
  categoryId: string;
  categoryName?: string;
  level: number;
  entryLevel: number;
  modules: CourseModuleContent[];
  estimatedDurationMinutes: number;
  prerequisiteCourseId?: string;
  prerequisiteTitle?: string;
  status: string;
  assignedCount: number;
  assignment?: {
    id: string;
    status: string;
    progressPercent: number;
    dueDate?: string;
    completedAt?: string;
  } | null;
}

export interface LessonDetailDto {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  lesson: LessonItem;
  prevLessonId?: string | null;
  nextLessonId?: string | null;
}

export interface AssessmentDto {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  timeLimitMinutes: number;
  passPercentage: number;
  questions: Omit<AssessmentQuestion, 'correctOptionIndex' | 'explanation'>[];
}

export interface SubmitAttemptInput {
  startedAt: string;
  durationSeconds: number;
  answers: Record<string, number>;
}

export interface GradedQuestionDto {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  competencyCode: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

export interface AttemptResultDto {
  attempt: {
    id: string;
    assessmentId: string;
    courseId: string;
    courseTitle: string;
    employeeId: string;
    employeeName: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    passed: boolean;
    startedAt: string;
    submittedAt: string;
    durationSeconds: number;
  };
  passed: boolean;
  score: number;
  passPercentage: number;
  correctCount: number;
  totalQuestions: number;
  certificate?: CertificateDto;
  questions: GradedQuestionDto[];
}

export interface AssessmentAttemptRowDto {
  id: string;
  assessmentId: string;
  courseId: string;
  courseTitle: string;
  employeeId: string;
  employeeName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
}

export interface CertificateDto {
  id: string;
  certificateCode: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  courseId: string;
  courseTitle: string;
  courseLevel: number;
  frameworkCompetencyCodes: string[];
  issueDate: string;
  expiryDate?: string;
  score: number;
  status: 'ACTIVE' | 'REVOKED';
}

export interface InternalCourseDto {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  modulesCount: number;
  durationMinutes: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateInternalCourseInput {
  code?: string;
  title: string;
  description: string;
  category: string;
  modulesCount: number;
  durationMinutes: number;
  status?: 'DRAFT' | 'PUBLISHED';
}

export type UpdateInternalCourseInput = Pick<CreateInternalCourseInput, 'title' | 'description' | 'category' | 'durationMinutes' | 'status'>;

export const learningService = {
  getCourseDetail: (id: string) =>
    apiClient.get<ApiResponse<CourseDetailDto>>(`/courses/${id}`),

  getLesson: (courseId: string, lessonId: string) =>
    apiClient.get<ApiResponse<LessonDetailDto>>(`/courses/${courseId}/lessons/${lessonId}`),

  completeLesson: (courseId: string, lessonId: string) =>
    apiClient.post<ApiResponse<{ assignment: { status: string; progressPercent: number } }>>(
      `/courses/${courseId}/lessons/${lessonId}/complete`
    ),

  getAssessment: (id: string) =>
    apiClient.get<ApiResponse<AssessmentDto>>(`/assessments/${id}`),

  submitAttempt: (id: string, body: SubmitAttemptInput) =>
    apiClient.post<ApiResponse<AttemptResultDto>>(`/assessments/${id}/attempt`, body),

  getAssessmentHistory: (params?: { employeeId?: string; courseId?: string; passed?: string; search?: string; pageIndex?: number; pageSize?: number }) =>
    apiClient.get<ApiResponse<PagedList<AssessmentAttemptRowDto>>>('/assessments', { params }),

  getCertificates: (params?: { employeeId?: string; status?: string; search?: string; pageIndex?: number; pageSize?: number }) =>
    apiClient.get<ApiResponse<PagedList<CertificateDto>>>('/certificates', { params }),

  getInternalCourses: (params?: { status?: string; search?: string; pageIndex?: number; pageSize?: number }) =>
    apiClient.get<ApiResponse<PagedList<InternalCourseDto>>>('/internal-courses', { params }),

  getInternalCourseById: (id: string) =>
    apiClient.get<ApiResponse<InternalCourseDto>>(`/internal-courses/${id}`),

  createInternalCourse: (body: CreateInternalCourseInput) =>
    apiClient.post<ApiResponse<InternalCourseDto>>('/internal-courses', body),

  updateInternalCourse: (id: string, body: UpdateInternalCourseInput) =>
    apiClient.put<ApiResponse<InternalCourseDto>>(`/internal-courses/${id}`, body),
};
