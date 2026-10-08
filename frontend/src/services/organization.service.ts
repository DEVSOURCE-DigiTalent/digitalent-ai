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
  entityType?: string;
}

interface BackendOrganization {
  id: string;
  name: string;
  settings: Record<string, string | null>;
}

interface BackendAuditEntry {
  id: string;
  actorName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: string;
  newValues?: string;
  createdAt: string;
}

/** Organization profile, overview and audit log (spec ADM-01, ADM-07, ADM-11). */
export const organizationService = {
  get: async () => {
    if (import.meta.env.VITE_USE_MOCK === 'true') return apiClient.get<ApiResponse<OrganizationDto>>('/organization');
    const response = await apiClient.get<ApiResponse<BackendOrganization>>('/organization');
    const org = response.data.data!;
    const settings = org.settings ?? {};
    return { ...response, data: { ...response.data, data: {
      id: org.id,
      name: org.name,
      industry: settings.industry ?? '',
      size: settings.size ?? '',
      timezone: settings.timezone ?? 'Asia/Ho_Chi_Minh',
      defaultAssignmentDays: Number(settings.defaultAssignmentDays ?? 30),
      taxCode: settings.taxCode ?? undefined,
      taxAddress: settings.taxAddress ?? undefined,
      invoiceEmail: settings.invoiceEmail ?? undefined,
    } as OrganizationDto } };
  },
  updateSettings: (data: OrganizationSettings) =>
    apiClient.put<ApiResponse<{ success: boolean }>>('/organization/settings',
      import.meta.env.VITE_USE_MOCK === 'true' ? data : { settings: {
        industry: data.industry,
        size: data.size,
        timezone: data.timezone,
        defaultAssignmentDays: String(data.defaultAssignmentDays),
      } }),
  getOverview: () => apiClient.get<ApiResponse<OrganizationOverview>>('/organization/overview'),
  getAuditLog: async (params?: AuditLogParams) => {
    if (import.meta.env.VITE_USE_MOCK === 'true') return apiClient.get<ApiResponse<PagedList<AuditEntry>>>('/organization/audit-log', { params });
    const response = await apiClient.get<ApiResponse<PagedList<BackendAuditEntry>>>('/organization/audit-log', { params });
    return { ...response, data: { ...response.data, data: response.data.data && {
      ...response.data.data,
      items: response.data.data.items.map((entry): AuditEntry => ({
        id: entry.id,
        at: entry.createdAt,
        actorName: entry.actorName ?? 'Hệ thống',
        action: entry.action,
        targetType: entry.entityType,
        targetLabel: entry.entityId ?? entry.entityType,
        detail: entry.newValues ?? entry.oldValues ?? undefined,
      })),
    } } };
  },
};
