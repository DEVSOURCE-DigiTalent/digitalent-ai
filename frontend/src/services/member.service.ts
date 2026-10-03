import apiClient from './api-client';
import type { ApiResponse, PagedList } from '../types/api';
import type { InviteResult, MemberRole } from '../types/commerce';

export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

/** One row of the member list: a person with access, or an invitation still waiting. */
export interface MemberListItem {
  /** User id for members; invitation id for pending invitations. */
  id: string;
  kind: 'member' | 'invitation';
  fullName: string;
  email: string;
  roles: string[];
  status: MemberStatus;
  employeeId?: string;
  employeeCode?: string;
  departmentId?: string;
  departmentName?: string;
  jobPositionId?: string;
  positionName?: string;
  jobGrade?: 'G1' | 'G2' | 'G3';
  jobGradeName?: string;
  coveragePercent?: number | null;
  highGapCount?: number;
  activeCourses?: number;
  joinedAt?: string;
  invitedAt?: string;
  lastActiveAt?: string;
  deactivatedReason?: string;
}

export interface MemberHistoryEntry {
  id: string;
  at: string;
  actorName: string;
  action: string;
  targetType: string;
  targetLabel: string;
  detail?: string;
}

export interface MemberDetail extends MemberListItem {
  directManagerName?: string;
  history: MemberHistoryEntry[];
}

export interface MemberListParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  status?: MemberStatus;
  role?: string;
  departmentId?: string;
  jobPositionId?: string;
  jobGrade?: string;
}


export interface InviteRowInput {
  email: string;
  fullName: string;
  role: MemberRole;
  departmentId?: string;
  jobPositionId?: string;
}

export interface UpdateMemberRequest {
  roles?: string[];
  departmentId?: string;
  jobPositionId?: string;
}

export interface RoleSummary {
  role: string;
  name: string;
  summary: string;
  can: string[];
  memberCount: number;
  /** Whether the signed-in user may grant this role. */
  assignable: boolean;
}

/** Members, invitations and roles of the organization (spec ADM-02 to ADM-05). */
export const memberService = {
  getList: (params?: MemberListParams) => apiClient.get<ApiResponse<PagedList<MemberListItem>>>('/members', { params }),
  getById: (id: string) => apiClient.get<ApiResponse<MemberDetail>>(`/members/${id}`),
  invite: (rows: InviteRowInput[]) => apiClient.post<ApiResponse<InviteResult>>('/members/invitations', { rows }),
  resendInvitation: (id: string) => apiClient.post<ApiResponse<{ debugLink?: string }>>(`/members/${id}/resend-invitation`),
  revokeInvitation: (id: string) => apiClient.delete<ApiResponse<{ id: string }>>(`/members/invitations/${id}`),
  update: (id: string, data: UpdateMemberRequest) => apiClient.put<ApiResponse<MemberListItem>>(`/members/${id}`, data),
  deactivate: (id: string, reason: string) => apiClient.post<ApiResponse<MemberListItem>>(`/members/${id}/deactivate`, { reason }),
  reactivate: (id: string) => apiClient.post<ApiResponse<MemberListItem>>(`/members/${id}/reactivate`),
  getRoles: () => apiClient.get<ApiResponse<RoleSummary[]>>('/roles'),
};
