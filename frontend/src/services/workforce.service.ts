import apiClient from './api-client';
import type { ApiResponse, PagedList } from '../types/api';
import type { EmployeeListItem } from './employee.service';
import type { AssignmentRow } from './assignment.service';
import type { CourseRecommendation, SkillGapItem, SkillGapSummary } from './intelligence.service';

export type GapFilter = 'HIGH' | 'ANY' | 'NONE' | 'UNKNOWN';
export type LearningFilter = 'OVERDUE' | 'ACTIVE' | 'NONE';

export const BLOCKER_LABELS: Record<string, string> = {
  NO_JOB_POSITION: 'Chưa có vị trí',
  NO_ACTIVE_REQUIREMENT_SET: 'Vị trí chưa có yêu cầu',
  EMPLOYEE_NOT_ACTIVE: 'Không hoạt động',
};

export interface WorkforceRow extends EmployeeListItem {
  hasSnapshot: boolean;
  /** Why no skill gap exists (NO_JOB_POSITION, NO_ACTIVE_REQUIREMENT_SET, EMPLOYEE_NOT_ACTIVE). */
  blocker: string | null;
  coveragePercent: number | null;
  gapCount: number | null;
  highCount: number | null;
  activeCourses: number;
  completedCourses: number;
  overdueCourses: number;
}

export interface WorkforceListParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  departmentId?: string;
  jobPositionId?: string;
  status?: string;
  gap?: GapFilter;
  learning?: LearningFilter;
}

export type EvidenceSource = 'MIGRATION' | 'ASSESSMENT' | 'TASK' | 'MANUAL';

export interface CompetencyLevelRow {
  competencyId: string;
  frameworkCode: string;
  name: string;
  categoryName: string;
  categorySortOrder: number;
  currentLevel: number | null;
  /** 0 = the position does not require it. */
  requiredLevel: number;
  source: EvidenceSource | null;
  confirmedAt: string | null;
  note: string | null;
}

export interface EvidenceRow {
  competencyId: string;
  competencyName: string;
  frameworkCode: string;
  level: number;
  source: EvidenceSource;
  confirmedAt: string;
  note: string | null;
}

export interface EmployeeCapability {
  employee: EmployeeListItem;
  summary: WorkforceRow;
  competencies: CompetencyLevelRow[];
  skillGap: { runId: string; generatedAt: string; requirementSetVersionNo: number; summary: SkillGapSummary; items: SkillGapItem[] } | null;
  recommendations: CourseRecommendation[];
  learning: AssignmentRow[];
  evidence: EvidenceRow[];
  tasks?: any[];
  assessments?: any[];
  certificates?: any[];
  submissions?: any[];
}


export interface MatrixCell {
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  evidenceSource?: EvidenceSource | null;
  evidenceStatus?: 'CONFIRMED' | 'PENDING' | 'NONE';
  confirmedAt?: string | null;
}

export interface MatrixEmployee {
  employeeId: string;
  employeeCode: string;
  fullName: string;
  avatarUrl?: string;
  departmentId?: string;
  departmentName: string;
  jobPositionId?: string;
  jobPositionName: string;
  jobGrade?: string;
  coveragePercent: number | null;
  totalGaps: number;
  cells: Record<string, MatrixCell>;
}

export interface CompetencyMatrixCategory {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
}

export interface CompetencyMatrixCompetency {
  id: string;
  code: string;
  frameworkCode: string;
  name: string;
  categoryId: string;
}

export interface CompetencyMatrixResponse {
  categories: CompetencyMatrixCategory[];
  competencies: CompetencyMatrixCompetency[];
  employees: MatrixEmployee[];
}

export interface CompetencyMatrixParams {
  departmentId?: string;
  jobPositionId?: string;
  jobGrade?: string;
  categoryId?: string;
  search?: string;
}

/** The workforce as the learning administrator sees it (spec LCA-08, LCA-09, OW-19). */
export const workforceService = {
  getList: (params?: WorkforceListParams) => apiClient.get<ApiResponse<PagedList<WorkforceRow>>>('/workforce', { params }),
  getById: (employeeId: string) => apiClient.get<ApiResponse<EmployeeCapability>>(`/workforce/${employeeId}`),
  getMatrix: (params?: CompetencyMatrixParams) =>
    apiClient.get<ApiResponse<CompetencyMatrixResponse>>('/competency-profiles/matrix', { params }),
};
