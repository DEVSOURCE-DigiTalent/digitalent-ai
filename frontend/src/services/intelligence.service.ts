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
