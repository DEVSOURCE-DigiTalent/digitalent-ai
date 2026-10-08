import apiClient from './api-client';
import type { ApiResponse, PagedList } from '../types/api';
import type { InviteResult, MemberRole } from '../types/commerce';

export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

/**
 * One row of the member list: a person with access, an employee profile without an account yet, or an invitation
 * still waiting. The backend sends null (not undefined) for empty fields.
 */
export interface MemberListItem {
  /** User id for people with an account, employee id for profiles without one, invitation id for invitations. */
  id: string;
  kind: 'member' | 'invitation';
  fullName: string;
  email: string;
  roles: string[];
  status: MemberStatus;
  /** null for accounts without an employee profile (e.g. the Owner created at sign-up) and for invitations. */
  employeeId?: string | null;
  employeeCode?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  jobPositionId?: string | null;
  positionName?: string | null;
  /** Grade of the member's position. */
  jobGrade?: 'G1' | 'G2' | 'G3' | null;
  jobGradeName?: string | null;
  /** null = no skill gap run yet. */
  coveragePercent?: number | null;
  highGapCount?: number | null;
  activeCourses?: number | null;
  joinedAt?: string | null;
  invitedAt?: string | null;
  lastActiveAt?: string | null;
  deactivatedReason?: string | null;
}

export interface MemberHistoryEntry {
  id: string;
  at: string;
  /** null = done by the system. */
  actorName: string | null;
  action: string;
  targetType: string;
  targetLabel: string;
  /** Mock only; the backend does not send it. */
  detail?: string;
}

export interface MemberDetail extends MemberListItem {
  directManagerId?: string | null;
  directManagerName?: string | null;
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
  employeeCode?: string;
  departmentId?: string;
  jobPositionId?: string;
}

/** Only the fields sent are changed. */
export interface UpdateMemberRequest {
  roles?: string[];
  departmentId?: string;
  /** '' removes the position. */
  jobPositionId?: string;
}

export interface ResendInvitationResult {
  id?: string;
  expiresAt?: string;
  /** Development backend and mock only (no email provider yet). */
  token?: string | null;
  debugLink?: string | null;
}

export interface RoleSummary {
  role: string;
  /** Backend role granted for this enterprise role: HR_MANAGER | DEPARTMENT_MANAGER | EMPLOYEE. */
  roleCode?: string;
  name: string;
  summary: string;
  can: string[];
  /** Permission keys of roleCode, as configured in the database. */
  permissions?: string[];
  /** Accounts holding the role (OWNER includes platform admins, EMPLOYEE includes trainers). */
  memberCount: number;
  /** Whether the signed-in user may grant this role. */
  assignable: boolean;
}

/** Members, invitations and roles of the organization (spec ADM-02 to ADM-05). */
export const memberService = {
  getList: (params?: MemberListParams) => apiClient.get<ApiResponse<PagedList<MemberListItem>>>('/members', { params }),
  getById: (id: string) => apiClient.get<ApiResponse<MemberDetail>>(`/members/${id}`),
  invite: (rows: InviteRowInput[]) => apiClient.post<ApiResponse<InviteResult>>('/members/invitations', { rows }),
  resendInvitation: (id: string) => apiClient.post<ApiResponse<ResendInvitationResult>>(`/members/${id}/resend-invitation`),
  revokeInvitation: (id: string) => apiClient.delete<ApiResponse<{ id: string }>>(`/members/invitations/${id}`),
  update: (id: string, data: UpdateMemberRequest) => apiClient.put<ApiResponse<MemberListItem>>(`/members/${id}`, data),
  deactivate: (id: string, reason: string) => apiClient.post<ApiResponse<MemberListItem>>(`/members/${id}/deactivate`, { reason }),
  reactivate: (id: string) => apiClient.post<ApiResponse<MemberListItem>>(`/members/${id}/reactivate`),
  getRoles: () => apiClient.get<ApiResponse<RoleSummary[]>>('/roles'),
};
