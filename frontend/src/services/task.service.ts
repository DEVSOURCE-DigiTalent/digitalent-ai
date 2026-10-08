import apiClient from './api-client';
import type { ApiResponse, PagedList } from '../types/api';

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
  assignedEmployeeIds?: string[];
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

/** BE2 stores rubric fields as JSON strings; the screens use structured values. */
function parseJson<T>(value: T | string | null | undefined, fallback: T): T {
  if (typeof value !== 'string') return value ?? fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeSubmission<T extends TaskSubmissionDto>(submission: T): T {
  return {
    ...submission,
    evaluation: submission.evaluation ? {
      ...submission.evaluation,
      rubricScores: parseJson(submission.evaluation.rubricScores, {}),
    } : undefined,
  };
}

function normalizeTask<T extends PracticalTaskDto>(task: T): T {
  return {
    ...task,
    rubricCriteria: parseJson(task.rubricCriteria, []),
    ...('submissions' in task ? {
      submissions: (task as unknown as PracticalTaskDetailDto).submissions.map(normalizeSubmission),
    } : {}),
  };
}

function mapData<T, U>(response: { data: ApiResponse<T> }, mapper: (value: T) => U) {
  const body = response.data;
  return { ...response, data: { ...body, data: body.data === null ? null : mapper(body.data) } as ApiResponse<U> };
}

export const taskService = {
  getTasks: (params?: { departmentId?: string; search?: string; status?: string; pageIndex?: number; pageSize?: number }) => {
    return apiClient.get<ApiResponse<PagedList<PracticalTaskDto>>>('/tasks', { params })
      .then((res) => mapData(res, (page) => ({ ...page, items: page.items.map(normalizeTask) })));
  },

  getTaskDetail: (id: string) => {
    return apiClient.get<ApiResponse<PracticalTaskDetailDto>>(`/tasks/${id}`)
      .then((res) => mapData(res, normalizeTask));
  },

  createTask: (payload: CreatePracticalTaskPayload) => {
    return apiClient.post<ApiResponse<PracticalTaskDetailDto>>('/tasks', {
      ...payload,
      dueDate: payload.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(payload.dueDate)
        ? `${payload.dueDate}T00:00:00Z` : payload.dueDate,
      rubricCriteria: JSON.stringify(payload.rubricCriteria),
    }).then((res) => mapData(res, normalizeTask));
  },

  getReviewQueue: (params?: { search?: string; pageIndex?: number; pageSize?: number }) => {
    return apiClient.get<ApiResponse<PagedList<ReviewQueueItemDto>>>('/review-queue', { params });
  },

  getSubmissionDetail: (id: string) => {
    return apiClient.get<ApiResponse<SubmissionDetailDto>>(`/submissions/${id}`)
      .then((res) => mapData(res, (submission) => ({
        ...normalizeSubmission(submission),
        rubricCriteria: parseJson(submission.rubricCriteria, []),
      })));
  },

  evaluateSubmission: (id: string, payload: EvaluateSubmissionPayload) => {
    return apiClient.post<ApiResponse<TaskSubmissionDto>>(`/submissions/${id}/evaluate`, {
      ...payload,
      rubricScores: JSON.stringify(payload.rubricScores),
    }).then((res) => mapData(res, normalizeSubmission));
  },
};
