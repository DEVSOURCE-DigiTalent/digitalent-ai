import apiClient from './api-client';
import type { ApiResponse, PagedList } from '../types/api';
import type { MemberHistoryEntry } from './member.service';

export interface OrganizationSettings {
  name: string;
  industry: string;
  size: string;
  timezone: string;
  /** Days given to finish a course when none is chosen. */
  defaultAssignmentDays: number;
  taxCode?: string;
  taxAddress?: string;
  invoiceEmail?: string;
}

export interface OrganizationDto extends OrganizationSettings {
  id: string;
  ownerName?: string;
}

export interface SetupItem {
  key: string;
  label: string;
  done: boolean;
  detail: string;
  path: string;
}

export interface GradeDistributionItem {
  code: string;
  name: string;
  count: number;
  percentage: number;
}

export interface OrganizationOverview {
  name: string;
  members: { active: number; pending: number; inactive: number };
  seats: { used: number; limit: number | null };
  plan: { name: string; renewsAt?: string; status: string } | null;
  gradeDistribution?: GradeDistributionItem[];
  pendingReviews?: number;
  runningBatches?: number;
  setup: SetupItem[];
  recentActivity: MemberHistoryEntry[];
  setupCompleted: boolean;
}


export type AuditEntry = MemberHistoryEntry;

export interface AuditLogParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  action?: string;
}

/** Organization profile, overview and audit log (spec ADM-01, ADM-07, ADM-11). */
export const organizationService = {
  get: () => apiClient.get<ApiResponse<OrganizationDto>>('/organization'),
  updateSettings: (data: OrganizationSettings) => apiClient.put<ApiResponse<OrganizationDto>>('/organization/settings', data),
  getOverview: () => apiClient.get<ApiResponse<OrganizationOverview>>('/organization/overview'),
  getAuditLog: (params?: AuditLogParams) => apiClient.get<ApiResponse<PagedList<AuditEntry>>>('/organization/audit-log', { params }),
};
