import apiClient from './api-client';
import type { PagedList } from '../types/api';

export interface RubricCriterion {
  id: string;
  label: string;
  maxPoints: number;
  description: string;
}

export interface PracticalTaskDto {
  id: string;
  title: string;
  description: string;
  expectedOutput: string;
  competencyIds: string[];
  targetLevel: number;
  departmentId?: string;
  departmentName?: string;
  jobPositionId?: string;
  jobPositionName?: string;
  assignedEmployeeIds: string[];
  assignedEmployeesCount: number;
  assignedByEmployeeId: string;
  assignedByName: string;
  assignedAt: string;
  dueDate: string;
  rubricCriteria: RubricCriterion[];
  status: 'ACTIVE' | 'ARCHIVED';
  submissionsCount?: number;
  pendingReviewCount?: number;
  approvedCount?: number;
}

export interface TaskSubmissionDto {
  id: string;
  taskId: string;
  employeeId: string;
  employeeName: string;
  employeeCode?: string;
  submittedAt: string;
  content: string;
  fileUrls?: string[];
  linkUrls?: string[];
  status: 'PENDING_REVIEW' | 'REVISION_REQUESTED' | 'APPROVED' | 'REJECTED';
  evaluation?: {
    evaluatedBy: string;
    evaluatedAt: string;
    score: number;
    feedback: string;
    rubricScores: Record<string, number>;
    decision: 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED';
  };
}

export interface PracticalTaskDetailDto extends PracticalTaskDto {
  assignedEmployees: {
    id: string;
    fullName: string;
    employeeCode: string;
    workEmail: string;
  }[];
  submissions: TaskSubmissionDto[];
}

export interface ReviewQueueItemDto {
  id: string;
  taskId: string;
  taskTitle: string;
  taskDueDate?: string;
  targetLevel: number;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName?: string;
  submittedAt: string;
  content: string;
  linkUrls: string[];
  status: string;
}

export interface SubmissionDetailDto extends TaskSubmissionDto {
  taskTitle?: string;
  taskDescription?: string;
  taskExpectedOutput?: string;
  taskDueDate?: string;
  rubricCriteria?: RubricCriterion[];
  targetLevel?: number;
  departmentName?: string;
}

export interface LearnerTaskDto {
  id: string;
  title: string;
  description: string;
  expectedOutput: string;
  competencyIds: string[];
  targetLevel: number;
  assignedByName: string;
  dueDate: string;
  rubricCriteria: RubricCriterion[];
  submission: TaskSubmissionDto | null;
}

export interface EvidenceItemDto {
  id: string;
  taskId: string;
  taskTitle: string;
  taskDescription?: string;
  targetLevel: number;
  competencyIds: string[];
  submittedAt: string;
  content: string;
  linkUrls: string[];
  fileUrls: string[];
  status: 'PENDING_REVIEW' | 'REVISION_REQUESTED' | 'APPROVED' | 'REJECTED';
  evaluation?: TaskSubmissionDto['evaluation'];
}

export interface CreatePracticalTaskPayload {
  title: string;
  description: string;
  expectedOutput: string;
  competencyIds: string[];
  targetLevel: number;
  departmentId?: string;
  jobPositionId?: string;
  assignedEmployeeIds: string[];
  dueDate: string;
  rubricCriteria: RubricCriterion[];
}

export interface EvaluateSubmissionPayload {
  score: number;
  feedback: string;
  rubricScores: Record<string, number>;
  decision: 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED';
}

export interface SubmitEvidencePayload {
  content: string;
  linkUrls?: string[];
  fileUrls?: string[];
}

export const taskService = {
  getTasks: (params?: { departmentId?: string; search?: string; status?: string; pageIndex?: number; pageSize?: number }) => {
    return apiClient.get<PagedList<PracticalTaskDto>>('/tasks', { params });
  },

  getTaskDetail: (id: string) => {
    return apiClient.get<PracticalTaskDetailDto>(`/tasks/${id}`);
  },

  createTask: (payload: CreatePracticalTaskPayload) => {
    return apiClient.post<PracticalTaskDto>('/tasks', payload);
  },

  getReviewQueue: (params?: { search?: string; pageIndex?: number; pageSize?: number }) => {
    return apiClient.get<PagedList<ReviewQueueItemDto>>('/review-queue', { params });
  },

  getSubmissionDetail: (id: string) => {
    return apiClient.get<SubmissionDetailDto>(`/submissions/${id}`);
  },

  evaluateSubmission: (id: string, payload: EvaluateSubmissionPayload) => {
    return apiClient.post<TaskSubmissionDto>(`/submissions/${id}/evaluate`, payload);
  },

  getMyTasks: () => {
    return apiClient.get<{ items: LearnerTaskDto[]; total: number }>('/me/tasks');
  },

  submitTaskEvidence: (taskId: string, payload: SubmitEvidencePayload) => {
    return apiClient.post<TaskSubmissionDto>(`/tasks/${taskId}/submit`, payload);
  },

  getMyEvidence: () => {
    return apiClient.get<{ items: EvidenceItemDto[]; total: number }>('/me/evidence');
  },
};
