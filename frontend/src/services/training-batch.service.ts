import apiClient from './api-client';
import type { ApiResponse, PagedList } from '../types/api';
import type { TrainingBatchDetailDto, TrainingBatchListItemDto } from './mock/server/handlers/training-batches';
import type { TrainingBatchStatus } from './mock/server/types';

const mock = import.meta.env.VITE_USE_MOCK === 'true';
const dateTime = (value?: string) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value;

interface BackendBatch {
  id: string;
  code: string;
  title: string;
  description?: string;
  courseId: string;
  courseName?: string;
  startDate: string;
  endDate?: string;
  status: string;
  totalEmployees: number;
  completedCount: number;
  createdAt: string;
  createdByName?: string;
  employees?: { employeeId: string; employeeName: string; employeeCode?: string; departmentName?: string; status: string; progressPercent: number }[];
}

interface BackendCourse {
  id: string;
  code: string;
  title: string;
  level: number;
  estimatedDurationMinutes?: number;
}

export interface TrainingBatchListParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  status?: TrainingBatchStatus;
  courseId?: string;
  departmentId?: string;
}

export interface TrainingBatchSummary {
  total: number;
  running: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  totalParticipants: number;
}

export interface CreateTrainingBatchRequest {
  code?: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  courseIds: string[];
  targetCriteria?: { departmentIds?: string[]; jobPositionIds?: string[]; jobGrades?: string[]; employeeIds?: string[] };
  participantEmployeeIds?: string[];
  autoAssign?: boolean;
}

export interface UpdateTrainingBatchRequest {
  name: string;
  description?: string;
  endDate?: string;
  dueDate?: string;
}

function mapList(item: BackendBatch): TrainingBatchListItemDto {
  return {
    id: item.id,
    code: item.code,
    name: item.title,
    status: (item.status === 'ACTIVE' ? 'RUNNING' : item.status) as TrainingBatchStatus,
    startDate: item.startDate.slice(0, 10),
    endDate: item.endDate?.slice(0, 10) ?? '',
    coursesCount: 1,
    participantsCount: item.totalEmployees,
    completedParticipantsCount: item.completedCount,
    averageProgressPercent: item.totalEmployees ? Math.round(item.completedCount / item.totalEmployees * 100) : 0,
    createdAt: item.createdAt,
    createdByName: item.createdByName,
  };
}

function mapDetail(item: BackendBatch, course?: BackendCourse): TrainingBatchDetailDto {
  const participants = (item.employees ?? []).map((e) => ({
    employeeId: e.employeeId,
    employeeName: e.employeeName,
    employeeCode: e.employeeCode ?? '',
    departmentName: e.departmentName,
    positionName: undefined,
    jobGrade: undefined,
    progressPercent: e.progressPercent,
    completedCoursesCount: e.status === 'COMPLETED' ? 1 : 0,
    totalCoursesCount: 1,
    isFullyCompleted: e.status === 'COMPLETED',
  }));
  return {
    ...mapList({
      ...item,
      totalEmployees: participants.length,
      completedCount: participants.filter((p) => p.isFullyCompleted).length,
    }),
    description: item.description,
    courseIds: [item.courseId],
    participantEmployeeIds: participants.map((e) => e.employeeId),
    courses: [{
      id: item.courseId,
      code: course?.code ?? '',
      title: item.courseName ?? course?.title ?? '',
      domain: '',
      level: course?.level ?? 0,
      durationMinutes: course?.estimatedDurationMinutes ?? 0,
      passingScore: 0,
      activeLearnersCount: participants.length,
      completionRate: participants.length ? Math.round(participants.filter((p) => p.isFullyCompleted).length / participants.length * 100) : 0,
    }],
    participants,
    overallProgressPercent: participants.length
      ? Math.round(participants.reduce((sum, e) => sum + e.progressPercent, 0) / participants.length) : 0,
  } as TrainingBatchDetailDto;
}

export const trainingBatchService = {
  getBatches: async (params?: TrainingBatchListParams) => {
    if (mock) return apiClient.get<ApiResponse<PagedList<TrainingBatchListItemDto>>>('/training-batches', { params });
    const response = await apiClient.get<ApiResponse<PagedList<BackendBatch>>>('/training-batches', {
      params: { ...params, status: params?.status === 'RUNNING' ? 'ACTIVE' : params?.status },
    });
    return { ...response, data: { ...response.data, data: response.data.data && {
      ...response.data.data, items: response.data.data.items.map(mapList),
    } } };
  },

  getSummary: async () => {
    if (mock) return apiClient.get<ApiResponse<TrainingBatchSummary>>('/training-batches/summary');
    const first = await apiClient.get<ApiResponse<PagedList<BackendBatch>>>('/training-batches', { params: { pageIndex: 1, pageSize: 100 } });
    const page = first.data.data!;
    const pages = await Promise.all(Array.from({ length: Math.max(0, page.totalPages - 1) }, (_, i) =>
      apiClient.get<ApiResponse<PagedList<BackendBatch>>>('/training-batches', { params: { pageIndex: i + 2, pageSize: 100 } })));
    const items = [page, ...pages.map((res) => res.data.data!)].flatMap((p) => p.items);
    const summary: TrainingBatchSummary = {
      total: page.totalItems,
      running: items.filter((x) => x.status === 'ACTIVE').length,
      scheduled: items.filter((x) => x.status === 'DRAFT').length,
      completed: items.filter((x) => x.status === 'COMPLETED').length,
      cancelled: items.filter((x) => x.status === 'CANCELLED').length,
      totalParticipants: items.reduce((sum, x) => sum + x.totalEmployees, 0),
    };
    return { ...first, data: { ...first.data, data: summary } };
  },

  getBatchById: async (id: string) => {
    if (mock) return apiClient.get<ApiResponse<TrainingBatchDetailDto>>(`/training-batches/${id}`);
    const response = await apiClient.get<ApiResponse<BackendBatch>>(`/training-batches/${id}`);
    const batch = response.data.data!;
    const course = await apiClient.get<ApiResponse<BackendCourse>>(`/courses/${batch.courseId}`)
      .then((res) => res.data.data ?? undefined).catch(() => undefined);
    return { ...response, data: { ...response.data, data: mapDetail(batch, course) } };
  },

  createBatch: (data: CreateTrainingBatchRequest) => {
    if (mock) return apiClient.post<ApiResponse<{ id: string; code: string }>>('/training-batches', data);
    if (data.courseIds.length !== 1) throw new Error('Mỗi đợt đào tạo chỉ nhận một khóa học.');
    return apiClient.post<ApiResponse<{ id: string; employeesAdded: number }>>('/training-batches', {
      code: data.code,
      title: data.name,
      description: data.description,
      courseId: data.courseIds[0],
      departmentId: data.targetCriteria?.departmentIds?.length === 1 ? data.targetCriteria.departmentIds[0] : undefined,
      jobPositionId: data.targetCriteria?.jobPositionIds?.length === 1 ? data.targetCriteria.jobPositionIds[0] : undefined,
      startDate: dateTime(data.startDate),
      endDate: dateTime(data.endDate),
      dueDate: dateTime(data.endDate),
      employeeIds: data.participantEmployeeIds ?? [],
    });
  },

  updateBatch: (id: string, data: UpdateTrainingBatchRequest) =>
    apiClient.put<ApiResponse<{ success: boolean }>>(`/training-batches/${id}`, mock ? data : {
      title: data.name, description: data.description, endDate: dateTime(data.endDate), dueDate: dateTime(data.dueDate),
    }),

  cancelBatch: (id: string, reason?: string) =>
    apiClient.post<ApiResponse<{ success: boolean }>>(`/training-batches/${id}/cancel`, mock ? { reason } : undefined),

  completeBatch: (id: string) =>
    apiClient.post<ApiResponse<{ success: boolean }>>(`/training-batches/${id}/complete`),

  addEmployees: (id: string, employeeIds: string[]) =>
    apiClient.post<ApiResponse<{ added: number }>>(`/training-batches/${id}/employees`, { employeeIds }),

  removeEmployee: (id: string, employeeId: string) =>
    apiClient.delete<ApiResponse<{ success: boolean }>>(`/training-batches/${id}/employees/${employeeId}`),
};
