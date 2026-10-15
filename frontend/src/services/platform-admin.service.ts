import apiClient from './api-client';
import type { ApiResponse, PagedList } from '../types/api';

/**
 * Platform Admin console (Pulse redesign) — mirrors DigiTalent.Api/Controllers/PlatformAdminController.cs.
 * Levels: 1 = Cơ bản (always free), 2 = Trung cấp, 3 = Nâng cao.
 */

export type SalesStatus = 'OPEN' | 'PAUSED';
export type OrganizationStage = 'TRIAL' | 'PAID';
export type SeatOrderKind = 'PURCHASE' | 'ADMIN_GRANT';

export interface PlatformCourseDraft {
  title: string;
  outcome: string;
  pricePerSeat: number;
  salesStatus: SalesStatus;
}

export interface PlatformCourse {
  id: string;
  code: string;
  domainCode: string;
  domainName: string;
  level: number;
  levelName: string;
  versionNo: number;
  title: string;
  outcome: string;
  pricePerSeat: number;
  salesStatus: SalesStatus;
  isFree: boolean;
  hasDraft: boolean;
  draft: PlatformCourseDraft | null;
  publishedAt: string | null;
  publishedQuestionCount: number;
  draftQuestionCount: number;
  seatsPurchased: number;
  seatsGranted: number;
  revenue: number;
}

export interface PlatformCourseQuestion {
  id: string;
  questionText: string;
  correctAnswer: string;
  explanation: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
}

export interface PlatformCourseRelease {
  versionNo: number;
  title: string;
  pricePerSeat: number;
  salesStatus: SalesStatus;
  publishedByEmail: string | null;
  publishedAt: string;
}

export interface PlatformCourseDetail {
  course: PlatformCourse;
  questions: PlatformCourseQuestion[];
  releases: PlatformCourseRelease[];
}

export interface PlatformFrameworkDomain {
  code: string;
  name: string;
  sortOrder: number;
  publishedDescription: string;
  draftDescription: string;
  hasDraft: boolean;
}

export interface PlatformFramework {
  currentVersion: number;
  hasDraft: boolean;
  levelCount: number;
  domains: PlatformFrameworkDomain[];
  releases: { versionNo: number; releaseNote: string | null; publishedByEmail: string | null; publishedAt: string }[];
}

export interface PlatformOrganization {
  id: string;
  code: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  stage: OrganizationStage;
  ownerName: string | null;
  ownerEmail: string | null;
  departmentCount: number;
  employeeCount: number;
  managerCount: number;
  userCount: number;
  seatsPurchased: number;
  seatsGranted: number;
  revenue: number;
  setupCompleted: boolean;
  createdAt: string;
}

export interface PlatformSeatOrder {
  id: string;
  organizationId: string;
  organizationName: string;
  courseCode: string;
  courseTitle: string;
  seats: number;
  kind: SeatOrderKind;
  unitPrice: number;
  totalAmount: number;
  reason: string | null;
  createdByEmail: string | null;
  createdAt: string;
}

export interface PlatformOrganizationDetail {
  organization: PlatformOrganization;
  departments: { id: string; name: string; managerName: string | null; employeeCount: number }[];
  people: {
    userId: string | null;
    fullName: string;
    email: string | null;
    role: string;
    departmentName: string | null;
    positionName: string | null;
    status: string;
  }[];
  seats: { courseCode: string; courseTitle: string; seatsPurchased: number; seatsGranted: number }[];
  orders: PlatformSeatOrder[];
}

export interface PlatformUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  roles: string[];
  organizationId: string | null;
  organizationName: string | null;
  departmentName: string | null;
  positionName: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  isManuallyLocked: boolean;
  lockedUntil: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface PlatformUserDetail {
  user: PlatformUser;
  organizationStatus: string | null;
  supportHistory: { action: string; entityLabel: string | null; newValues: string | null; actorEmail: string | null; createdAt: string }[];
}

export interface PlatformAuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  entityLabel: string | null;
  organizationId: string | null;
  organizationName: string | null;
  actorEmail: string | null;
  oldValues: string | null;
  newValues: string | null;
  createdAt: string;
}

export interface PlatformOverview {
  organizationCount: number;
  trialOrganizationCount: number;
  paidOrganizationCount: number;
  suspendedOrganizationCount: number;
  conversionRate: number;
  userCount: number;
  employeeCount: number;
  lockedUserCount: number;
  frameworkVersion: number;
  frameworkHasDraft: boolean;
  domainCount: number;
  courseCount: number;
  pausedCourseCount: number;
  coursesWithDraft: number;
  publishedQuestionCount: number;
  draftQuestionCount: number;
  seatsPurchased: number;
  seatsGranted: number;
  revenue: number;
  recentOrganizations: PlatformOrganization[];
  recentActivity: PlatformAuditLog[];
}

export interface PlatformCommerce {
  courses: PlatformCourse[];
  seatsPurchased: number;
  seatsGranted: number;
  revenue: number;
  orders: PagedList<PlatformSeatOrder>;
}

export interface PageQuery {
  search?: string;
  pageIndex?: number;
  pageSize?: number;
}

async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await request;
  return response.data.data as T;
}

/** Drops empty filters so the query string stays clean. */
function params<T extends object>(query: T): Partial<T> {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined && value !== '')) as Partial<T>;
}

export const platformAdminService = {
  getOverview: () => unwrap<PlatformOverview>(apiClient.get('/platform/overview')),

  getFramework: () => unwrap<PlatformFramework>(apiClient.get('/platform/framework')),
  saveFrameworkDraft: (domains: { code: string; description: string }[]) =>
    unwrap<PlatformFramework>(apiClient.put('/platform/framework/draft', { domains })),
  publishFramework: (releaseNote?: string) =>
    unwrap<PlatformFramework>(apiClient.post('/platform/framework/publish', { releaseNote })),

  getCourses: () => unwrap<{ items: PlatformCourse[] }>(apiClient.get('/platform/courses')).then((r) => r.items),
  getCourse: (code: string) => unwrap<PlatformCourseDetail>(apiClient.get(`/platform/courses/${code}`)),
  saveCourseDraft: (code: string, draft: PlatformCourseDraft) =>
    unwrap<PlatformCourseDetail>(apiClient.put(`/platform/courses/${code}/draft`, draft)),
  publishCourse: (code: string) => unwrap<PlatformCourseDetail>(apiClient.post(`/platform/courses/${code}/publish`)),
  addCourseQuestion: (code: string, question: { questionText: string; correctAnswer: string; explanation: string }) =>
    unwrap<PlatformCourseDetail>(apiClient.post(`/platform/courses/${code}/questions`, question)),

  getOrganizations: (query: PageQuery & { status?: string; stage?: string } = {}) =>
    unwrap<PagedList<PlatformOrganization>>(apiClient.get('/platform/organizations', { params: params(query) })),
  getOrganization: (id: string) => unwrap<PlatformOrganizationDetail>(apiClient.get(`/platform/organizations/${id}`)),
  grantSeats: (id: string, body: { courseCode: string; seats: number; reason: string }) =>
    unwrap<PlatformOrganizationDetail>(apiClient.post(`/platform/organizations/${id}/seat-grants`, body)),
  suspendOrganization: (id: string, reason: string) =>
    unwrap<PlatformOrganizationDetail>(apiClient.post(`/platform/organizations/${id}/suspend`, { reason })),
  restoreOrganization: (id: string, reason: string) =>
    unwrap<PlatformOrganizationDetail>(apiClient.post(`/platform/organizations/${id}/restore`, { reason })),

  getUsers: (query: PageQuery & { role?: string; status?: string; organizationId?: string } = {}) =>
    unwrap<PagedList<PlatformUser>>(apiClient.get('/platform/users', { params: params(query) })),
  getUser: (id: string) => unwrap<PlatformUserDetail>(apiClient.get(`/platform/users/${id}`)),
  lockUser: (id: string, reason: string) => unwrap<PlatformUserDetail>(apiClient.post(`/platform/users/${id}/lock`, { reason })),
  unlockUser: (id: string, reason: string) => unwrap<PlatformUserDetail>(apiClient.post(`/platform/users/${id}/unlock`, { reason })),

  getCommerce: (query: PageQuery & { kind?: string } = {}) =>
    unwrap<PlatformCommerce>(apiClient.get('/platform/commerce', { params: params(query) })),
  getAuditLogs: (query: PageQuery & { scope?: 'platform' | 'all'; action?: string } = {}) =>
    unwrap<PagedList<PlatformAuditLog>>(apiClient.get('/platform/audit-logs', { params: params(query) })),
};
