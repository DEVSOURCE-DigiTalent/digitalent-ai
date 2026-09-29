import apiClient from './api-client';
import type { ApiResponse, PagedList, PaginationRequest } from '../types/api';

/** HIGH / MEDIUM / LOW; null = competency already met. */
export type SkillGapSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

/** Khớp UseCases/Intelligence/SkillGap/Common/SkillGapRunDtos.cs */
export interface SkillGapRunListItem {
  runId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName?: string;
  jobPositionName?: string;
  requirementSetVersionNo: number;
  generatedAt: string;
  generatedBy: 'SYSTEM' | 'USER_REQUEST';
  gapCount: number;
  highCount: number;
  coveragePercent: number;
}

export interface SkillGapItem {
  competencyId: string;
  competencyCode: string;
  competencyName: string;
  categoryName?: string;
  requiredLevel: number;
  /** null = no confirmed level yet */
  currentLevel: number | null;
  gapSteps: number;
  weightPercent: number;
  mandatory: boolean;
  mandatoryMultiplier: number;
  priorityScore: number;
  severity: SkillGapSeverity | null;
}

export interface SkillGapSummary {
  totalRequired: number;
  totalMet: number;
  totalGap: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  coveragePercent: number;
  config: { mandatoryMultiplier: number; mediumWeightThreshold: number };
}

export interface SkillGapRunDetail extends SkillGapRunListItem {
  requirementSetId: string;
  calculationVersion: string;
  summary: SkillGapSummary;
  /** Sorted by priority (desc), then competency name. */
  items: SkillGapItem[];
}

export interface SkillGapRunListParams extends PaginationRequest {
  employeeId?: string;
  departmentId?: string;
  jobPositionId?: string;
  latestOnly?: boolean;
}

export interface CalculateSkillGapRequest {
  employeeId: string;
  requirementSetId?: string;
}

export interface CalculateSkillGapBatchRequest {
  departmentId?: string;
  jobPositionId?: string;
}

export interface CalculateSkillGapBatchResult {
  calculatedCount: number;
  runs: { employeeId: string; runId: string; gapCount: number }[];
  skipped: { employeeId: string; employeeName: string; reason: string }[];
}

export type RecommendationEmptyReason = 'NO_EMPLOYEE_PROFILE' | 'NO_SKILL_GAP_RUN' | 'NO_GAP' | 'NO_MATCHING_COURSE';

/** Khớp UseCases/Intelligence/Recommendation/GetCourseRecommendations (spec §5.4). */
export interface CourseRecommendation {
  courseId: string;
  courseCode: string;
  title: string;
  estimatedDurationMinutes?: number | null;
  entryLevel?: number | null;
  /** NOT_STARTED / IN_PROGRESS / READY_FOR_ASSESSMENT; null = not enrolled */
  enrollmentStatus: string | null;
  score: number;
  /** Points per component (weight × ratio); they add up to the score (±0.01). */
  breakdown: { gapPriorityCoverage: number; mandatoryCoverage: number; entryLevelFit: number };
  reasons: {
    competencyId: string;
    competencyName: string;
    currentLevel: number | null;
    requiredLevel: number;
    courseTargetLevel: number;
    coverageType: string;
    closesSteps: number;
    mandatory: boolean;
    severity: SkillGapSeverity | null;
  }[];
  explanation: string;
  warnings: string[];
}

export interface CourseRecommendationsResult {
  employeeId: string | null;
  skillGapRunId: string | null;
  generatedAt: string | null;
  scoringConfigVersion: string;
  reason: RecommendationEmptyReason | null;
  items: CourseRecommendation[];
}

export interface CourseRecommendationsParams {
  employeeId?: string;
  limit?: number;
}

/** Course recommendations from the latest skill gap snapshot (spec §5.5) — api/v1/intelligence/recommendations. */
export const recommendationService = {
  get: (params?: CourseRecommendationsParams) =>
    apiClient.get<ApiResponse<CourseRecommendationsResult>>('/intelligence/recommendations', { params }),
};

/**
 * Skill Gap Engine API (spec §4.7) — api/v1/intelligence/skill-gaps.
 */
export const skillGapService = {
  getList: (params?: SkillGapRunListParams) =>
    apiClient.get<ApiResponse<PagedList<SkillGapRunListItem>>>('/intelligence/skill-gaps', { params }),

  getById: (runId: string) =>
    apiClient.get<ApiResponse<SkillGapRunDetail>>(`/intelligence/skill-gaps/${runId}`),

  getMyLatest: () =>
    apiClient.get<ApiResponse<SkillGapRunDetail | null>>('/intelligence/skill-gaps/me/latest'),

  calculate: (data: CalculateSkillGapRequest) =>
    apiClient.post<ApiResponse<SkillGapRunDetail>>('/intelligence/skill-gaps/calculate', data),

  calculateBatch: (data: CalculateSkillGapBatchRequest) =>
    apiClient.post<ApiResponse<CalculateSkillGapBatchResult>>('/intelligence/skill-gaps/calculate-batch', data),
};
