import apiClient from './api-client';
import type { ApiResponse, PagedList } from '../types/api';

export type AssignmentStatus = 'ACTIVE' | 'NOT_STARTED' | 'IN_PROGRESS' | 'READY_FOR_ASSESSMENT' | 'COMPLETED' | 'CANCELLED';

export interface CourseListItem {
  id: string;
  code: string;
  title: string;
  categoryId?: string | null;
  categoryName?: string;
  /** 1 Cơ bản, 2 Trung cấp, 3 Nâng cao. */
  level: number;
  entryLevel?: number | null;
  modules: number;
  estimatedDurationMinutes?: number | null;
  prerequisiteCourseId?: string;
  prerequisiteTitle?: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  assignedCount: number;
  createdAt?: string;
}

export interface CourseDetailDto {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  purpose?: string | null;
  level: number;
  entryLevel?: number | null;
  estimatedDurationMinutes?: number | null;
  status: string;
  categoryName?: string | null;
  prerequisiteTitle?: string | null;
  modules: {
    id: string;
    code?: string | null;
    title: string;
    description?: string | null;
    sortOrder?: number;
    lessons: { id: string; code?: string | null; title: string; lessonType: string; estimatedMinutes?: number | null; sortOrder?: number }[];
  }[];
}

export interface CourseLessonDto {
  id: string;
  title: string;
  lessonType: string;
  contentBody?: string | null;
  estimatedMinutes?: number | null;
  moduleTitle: string;
  /** Reserved for a future BE media field; absent in the current BE2 response. */
  videoUrl?: string | null;
}

export interface AssignmentRow {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName?: string;
  positionName?: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  assignedAt: string;
  assignedByName: string;
  dueDate?: string;
  status: AssignmentStatus;
  progressPercent: number;
  completedAt?: string;
  cancelReason?: string;
  source: 'MANUAL' | 'SKILL_GAP' | 'DEPARTMENT' | 'POSITION' | 'RECOMMENDATION';
  overdue: boolean;
  dueSoon: boolean;
}

export interface AssignmentListParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  status?: AssignmentStatus;
  courseId?: string;
  employeeId?: string;
  departmentId?: string;
  jobPositionId?: string;
  jobGrade?: 'G1' | 'G2' | 'G3';
  overdue?: boolean;
  dueSoon?: boolean;
}

export interface AssignmentSummary {
  total: number;
  notStarted: number;
  inProgress: number;
  readyForAssessment: number;
  completed: number;
  overdue: number;
  dueSoon: number;
  completionRate: number;
  byDepartment: { departmentId: string; name: string; total: number; completed: number; overdue: number; averageProgress: number }[];
}

export type SkipReason = 'NOT_ACTIVE' | 'ALREADY_ASSIGNED' | 'ALREADY_COMPLETED' | 'PREREQUISITE_NOT_MET';

export interface CreateAssignmentRequest {
  courseId: string;
  dueDate?: string;
  targets: { employeeIds?: string[]; departmentId?: string; jobPositionId?: string; jobGrade?: string };
}

export interface CreateAssignmentResult {
  created: AssignmentRow[];
  skipped: { employeeId: string; employeeName: string; reason: SkipReason }[];
}

/** Standard course catalog and course assignments (spec LCA-12, LCA-13). */
export const assignmentService = {
  getCourses: (params?: { search?: string; status?: string; categoryId?: string; level?: number; pageIndex?: number; pageSize?: number }) =>
    apiClient.get<ApiResponse<PagedList<CourseListItem>>>('/courses', { params }),
  getCourse: (id: string) => apiClient.get<ApiResponse<CourseDetailDto>>(`/courses/${id}`),
  getLesson: (id: string) => apiClient.get<ApiResponse<CourseLessonDto>>(`/lessons/${id}`),
  getList: (params?: AssignmentListParams) => apiClient.get<ApiResponse<PagedList<AssignmentRow>>>('/course-assignments', { params }),
  getById: async (id: string): Promise<AssignmentRow> =>
    (await apiClient.get<ApiResponse<AssignmentRow>>(`/course-assignments/${id}`)).data.data!,
  getSummary: () => apiClient.get<ApiResponse<AssignmentSummary>>('/course-assignments/summary'),
  create: (data: CreateAssignmentRequest) => apiClient.post<ApiResponse<CreateAssignmentResult>>('/course-assignments', data),
  cancel: (id: string, reason?: string) => apiClient.delete<ApiResponse<{ id: string }>>(`/course-assignments/${id}`, { data: { reason } }),
};
