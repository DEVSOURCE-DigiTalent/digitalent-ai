import apiClient from './api-client';
import type { ApiResponse } from '../types/api';

export interface MyLearningCourse {
  enrollmentId: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  courseDescription?: string | null;
  level: number;
  estimatedDurationMinutes?: number | null;
  totalModules: number;
  totalLessons: number;
  completedLessons: number;
  status: string;
  progressPercent: number;
  startedAt?: string | null;
  completedAt?: string | null;
  dueDate?: string | null;
  overdue: boolean;
  assignedByName?: string | null;
}

export interface MyLearningData {
  items: MyLearningCourse[];
  total: number;
  inProgress: number;
  completed: number;
  notStarted: number;
}

export const myLearningService = {
  getList: () => apiClient.get<ApiResponse<MyLearningData>>('/my/learning'),
  completeLesson: (lessonId: string) => apiClient.post<ApiResponse<{ lessonId: string; status: string; courseProgressPercent: number }>>(`/lessons/${lessonId}/complete`),
};
