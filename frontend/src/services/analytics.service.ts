import apiClient from './api-client';
import type { ApiResponse, PagedList } from '../types/api';

export interface GapStats {
  employees: number;
  averageCoverage: number;
  totalGaps: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  employeesWithHigh: number;
}

export interface GapGroup extends GapStats {
  id: string;
  name: string;
}

export interface GapOverview {
  groupBy: 'department' | 'position' | 'grade';
  totals: GapStats;
  groups: GapGroup[];
}

export interface CompetencyGapRow {
  competencyId: string;
  frameworkCode: string;
  name: string;
  categoryName?: string;
  employeesRequired: number;
  employeesWithGap: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  averageRequiredLevel: number;
  averageCurrentLevel: number;
}

export interface AnalyticsFilter {
  departmentId?: string;
  jobPositionId?: string;
  jobGrade?: string;
}

export type ReviewStatus = 'PENDING' | 'ASSIGNED' | 'ACCEPTED' | 'DISMISSED';

export interface RecommendationReviewRow {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName?: string;
  positionName?: string;
  courseId: string;
  courseCode: string;
  title: string;
  score: number;
  gapsClosed: number;
  mandatoryClosed: number;
  highClosed: number;
  explanation: string;
  reasons: string[];
  enrollmentStatus: string | null;
  status: ReviewStatus;
  decisionReason?: string;
  decidedAt?: string;
  decidedByName?: string;
}

export interface ReviewListParams extends AnalyticsFilter {
  pageIndex?: number;
  pageSize?: number;
  status?: ReviewStatus;
}

export interface DashboardDto {
  kpis: {
    employees: number;
    averageCoverage: number;
    employeesWithHigh: number;
    overdueAssignments: number;
    completionRate: number;
    pendingRecommendations: number;
  };
  domains: { categoryId: string; name: string; sortOrder: number; averageRequired: number; averageCurrent: number }[];
  atRisk: { employeeId: string; name: string; departmentName?: string; highCount: number; coveragePercent: number }[];
}

export interface ReportsOverviewDto {
  workforce: {
    totalEmployees: number;
    activeEmployees: number;
    departmentsCount: number;
    positionsCount: number;
    g1Count: number;
    g2Count: number;
    g3Count: number;
    byDepartment: {
      id: string;
      code: string;
      name: string;
      employeeCount: number;
      averageCoverage: number;
    }[];
  };
  training: {
    totalAssignments: number;
    completedAssignments: number;
    inProgressAssignments: number;
    completionRate: number;
    courses: {
      id: string;
      code: string;
      title: string;
      domainName: string;
      learnerCount: number;
      averageProgress: number;
    }[];
  };
  assessment: {
    totalAttempts: number;
    passRate: number;
    averageScore: number;
    retakeCount: number;
    excellentCount: number;
    excellentPercent: number;
    standardCount: number;
    standardPercent: number;
    failedCount: number;
    failedPercent: number;
    averageDurationMinutes: number;
    firstTimePassRate: number;
  };
  evidence: {
    totalTasks: number;
    totalSubmissions: number;
    approvedCount: number;
    approvalRate: number;
    byDepartment: {
      departmentId: string;
      departmentName: string;
      assignedCount: number;
      submittedCount: number;
      approvedCount: number;
      approvalRate: number;
    }[];
  };
}

/** Skill gap analytics, recommendation review and the capability dashboard (spec LCA-01, LCA-10, LCA-11). */
export const analyticsService = {
  getOverview: (params: AnalyticsFilter & { groupBy: 'department' | 'position' | 'grade' }) =>
    apiClient.get<ApiResponse<GapOverview>>('/intelligence/analytics/overview', { params }),
  getCompetencies: (params?: AnalyticsFilter) =>
    apiClient.get<ApiResponse<CompetencyGapRow[]>>('/intelligence/analytics/competencies', { params }),
  getReviews: (params?: ReviewListParams) =>
    apiClient.get<ApiResponse<PagedList<RecommendationReviewRow>>>('/intelligence/recommendation-reviews', { params }),
  acceptReview: (data: { employeeId: string; courseId: string; dueDate?: string }) =>
    apiClient.post<ApiResponse<{ status: string }>>('/intelligence/recommendation-reviews/accept', data),
  dismissReview: (data: { employeeId: string; courseId: string; reason: string }) =>
    apiClient.post<ApiResponse<{ status: string }>>('/intelligence/recommendation-reviews/dismiss', data),
  reopenReview: (data: { employeeId: string; courseId: string }) =>
    apiClient.post<ApiResponse<{ status: string }>>('/intelligence/recommendation-reviews/reopen', data),
  getDashboard: () => apiClient.get<ApiResponse<DashboardDto>>('/intelligence/dashboard'),
  getReportsOverview: (params?: AnalyticsFilter) =>
    apiClient.get<ApiResponse<ReportsOverviewDto>>('/intelligence/reports/overview', { params }),
};
