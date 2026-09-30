import apiClient from './api-client';
import type { ApiResponse } from '../types/api';

export type CompetencyType = 'CORE_DIGITAL' | 'PROFESSIONAL' | 'INTERNAL' | 'BEHAVIOURAL';
export type CompetencyStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface CompetencyCriterion {
  id?: string;
  level: number;
  indicatorCode: string;
  behaviorIndicator: string;
  assessmentGuidance?: string;
  evidenceGuidance?: string;
  sourceNote?: string;
  sortOrder?: number;
}

export interface CompetencyListItem {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  /** Domain order 1–6 for Circular 02/2025 categories. */
  categorySortOrder?: number;
  /** Circular 02/2025 code such as "4.2"; null for internal competencies. */
  frameworkCode?: string | null;
  code: string;
  name: string;
  description?: string;
  competencyType: CompetencyType | string;
  status: CompetencyStatus | string;
  criteriaCount: number;
}

export interface GetCompetenciesResponse {
  items: CompetencyListItem[];
  totalItems: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export interface CompetencyDetail {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  code: string;
  name: string;
  description?: string;
  competencyType: CompetencyType | string;
  status: CompetencyStatus | string;
  criteria: CompetencyCriterion[];
}

export interface CompetencyListParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  competencyType?: string;
  status?: string;
}

export interface CreateCompetencyRequest {
  categoryId: string;
  code: string;
  name: string;
  description?: string;
  competencyType?: string;
  status?: string;
  criteria?: CompetencyCriterion[];
}

export interface UpdateCompetencyRequest {
  name: string;
  description?: string;
  competencyType?: string;
  criteria?: CompetencyCriterion[];
}

// ── Position Requirements Types ──

export interface PositionRequirementItemDto {
  id: string;
  competencyId: string;
  competencyCode: string;
  competencyName: string;
  competencyType: string;
  categoryId: string;
  categoryName: string;
  categorySortOrder?: number;
  frameworkCode?: string | null;
  requiredLevel: number;
  weightPercent: number;
  isMandatory: boolean;
  requiresPracticalEvidence: boolean;
  note?: string;
}

export interface PositionRequirementItemInput {
  competencyId: string;
  requiredLevel: number;
  weightPercent: number;
  isMandatory: boolean;
  requiresPracticalEvidence: boolean;
  note?: string;
}

export interface PositionRequirementsOutput {
  id?: string;
  jobPositionId: string;
  jobPositionCode: string;
  jobPositionName: string;
  versionNo: number;
  status: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  reviewDate?: string;
  createdByUserId?: string;
  activatedByUserId?: string;
  activatedAt?: string;
  items: PositionRequirementItemDto[];
}

export interface CreateDraftPositionRequirementSetRequest {
  jobPositionId: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  reviewDate?: string;
  items: PositionRequirementItemInput[];
}

export interface UpdateDraftPositionRequirementSetRequest {
  effectiveFrom?: string;
  effectiveTo?: string;
  reviewDate?: string;
  items: PositionRequirementItemInput[];
}

export interface RequirementSetMutationResponse {
  id: string;
  versionNo: number;
  status: string;
  activatedAt?: string;
}

/**
 * Competency Framework & Position Requirements API service.
 */
export const competencyService = {
  // ── Competencies ──
  getList: (params?: CompetencyListParams) =>
    apiClient.get<ApiResponse<GetCompetenciesResponse>>('/competencies', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<CompetencyDetail>>(`/competencies/${id}`),

  create: (data: CreateCompetencyRequest) =>
    apiClient.post<ApiResponse<{ id: string }>>('/competencies', data),

  update: (id: string, data: UpdateCompetencyRequest) =>
    apiClient.put<ApiResponse<{ id: string }>>(`/competencies/${id}`, data),

  archive: (id: string) =>
    apiClient.delete<ApiResponse<{ id: string }>>(`/competencies/${id}`),

  // ── Position Requirements ──
  getRequirements: (positionId: string, versionNo?: number) =>
    apiClient.get<ApiResponse<PositionRequirementsOutput>>('/position-requirements', {
      params: { positionId, versionNo },
    }),

  createDraft: (data: CreateDraftPositionRequirementSetRequest) =>
    apiClient.post<ApiResponse<RequirementSetMutationResponse>>('/position-requirements', data),

  updateDraft: (id: string, data: UpdateDraftPositionRequirementSetRequest) =>
    apiClient.put<ApiResponse<RequirementSetMutationResponse>>(`/position-requirements/${id}`, data),

  activate: (id: string) =>
    apiClient.post<ApiResponse<RequirementSetMutationResponse>>(`/position-requirements/${id}/activate`),
};
