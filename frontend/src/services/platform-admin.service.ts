import apiClient from './api-client';
import type { ApiResponse, PagedList } from '../types/api';

/**
 * Platform Admin console (Pulse redesign) — mirrors DigiTalent.Api/Controllers/PlatformAdminController.cs
 * (overview, organizations, users, commerce, audit). Frameworks, catalog versions and the course builder live in
 * platform-catalog.service.ts.
 * Levels: 1 = Cơ bản (always free), 2 = Trung cấp, 3 = Nâng cao.
 */

export type SalesStatus = 'OPEN' | 'PAUSED';
export type OrganizationStage = 'TRIAL' | 'PAID';
/** A published course (in the catalog version in use) with its price, content size and how many organizations bought it. */
export interface PlatformCourse {
  id: string;
  code: string;
  frameworkId: string;
  frameworkName: string;
  domainCode: string;
  domainName: string;
  level: number;
  levelName: string;
  /** Catalog version in use. */
  versionNo: number;
  title: string;
  outcome: string;
  /** Price of the course for a whole organization (bought once). */
  price: number;
  salesStatus: SalesStatus;
  isFree: boolean;
  /** Price in the draft catalog version, null when there is no draft. */
  draftPrice: number | null;
  /** Sales status in the draft catalog version, null when there is no draft. */
  draftSalesStatus: SalesStatus | null;
  publishedAt: string | null;
  moduleCount: number;
  questionCount: number;
  /** Organizations that bought the course. */
  purchaseCount: number;
  revenue: number;
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
  /** Paid courses the organization bought. */
  coursesPurchased: number;
  revenue: number;
  setupCompleted: boolean;
  createdAt: string;
  /** Latest subscription of the organization (null fields when it has none). */
  planCode: string | null;
  planName: string | null;
  planStatus: string | null;
  planCycle: string | null;
  seatLimit: number | null;
  planRenewsAt: string | null;
  /** Platform courses the employees are enrolled in: [Cơ bản, Trung cấp, Nâng cao]. */
  coursesInUseByLevel: number[];
  /** Employees with at least one enrollment in a platform course. */
  participantCount: number;
}

/** One order: an organization bought a course (once, for every employee). */
export interface PlatformCourseOrder {
  id: string;
  organizationId: string;
  organizationName: string;
  courseCode: string;
  courseTitle: string;
  amount: number;
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
  /** Paid courses the organization bought, one row per course. */
  purchasedCourses: { courseCode: string; courseTitle: string; levelName: string; purchasedAt: string }[];
  orders: PlatformCourseOrder[];
  coursesInUse: { courseCode: string; courseTitle: string; level: number; levelName: string; participants: number; completed: number }[];
}

export interface PlatformUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  roles: string[];
  workspace?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  organizationId: string | null;
  organizationName: string | null;
  departmentName: string | null;
  positionName: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  isManuallyLocked: boolean;
  lockedUntil: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  /** Personal plan (IND_PLUS / IND_PRO, IND_FREE once the trial ended); null for organization accounts. */
  planCode: string | null;
  /** ACTIVE = in the 7-day trial, ENDED = trial over (Free plan); null without a trial. */
  trialState: TrialState | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  taskSummary?: string | null;
}

export type TrialState = 'ACTIVE' | 'ENDED';
export type TrialFilter = 'ACTIVE' | 'ENDING_SOON' | 'ENDED' | 'ANY';

export interface PlatformUsersStats {
  total: number;
  owners: number;
  managers: number;
  employees: number;
  mentors: number;
  admins: number;
  locked: number;
  active: number;
}

export interface PlatformUsersPage extends PagedList<PlatformUser> {
  /** Trial counts over every personal account (not limited by the filters). */
  trials: { active: number; endingSoon: number; ended: number };
  stats?: PlatformUsersStats;
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
  recentUsers7d?: number;
  recentEmployees7d?: number;
  lockedUserCount: number;
  trialUserCount: number;
  trialEndingSoonCount: number;
  frameworkCount: number;
  draftFrameworkCount: number;
  frameworkHasDraft: boolean;
  domainCount: number;
  currentVersionNo: number | null;
  currentVersionPublishedAt: string | null;
  draftVersionNo: number | null;
  draftNewCourseCount: number;
  draftEditedCourseCount: number;
  courseCount: number;
  pausedCourseCount: number;
  questionCount: number;
  purchaseCount: number;
  revenue: number;
  recentOrganizations: PlatformOrganization[];
  recentActivity: PlatformAuditLog[];
}

export interface PlatformCommerce {
  courses: PlatformCourse[];
  purchaseCount: number;
  /** Organizations that bought at least one course. */
  buyerCount: number;
  revenue: number;
  orders: PagedList<PlatformCourseOrder>;
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

  /** Published courses with prices and purchase counts (frameworks, versions and the builder: platform-catalog.service). */
  getCourses: () => unwrap<{ items: PlatformCourse[] }>(apiClient.get('/platform/courses')).then((r) => r.items),

  getOrganizations: (query: PageQuery & { status?: string; stage?: string } = {}) =>
    unwrap<PagedList<PlatformOrganization>>(apiClient.get('/platform/organizations', { params: params(query) })),
  getOrganization: (id: string) => unwrap<PlatformOrganizationDetail>(apiClient.get(`/platform/organizations/${id}`)),
  suspendOrganization: (id: string, reason: string) =>
    unwrap<PlatformOrganizationDetail>(apiClient.post(`/platform/organizations/${id}/suspend`, { reason })),
  restoreOrganization: (id: string, reason: string) =>
    unwrap<PlatformOrganizationDetail>(apiClient.post(`/platform/organizations/${id}/restore`, { reason })),

  getUsers: (query: PageQuery & { role?: string; status?: string; trial?: TrialFilter | ''; organizationId?: string; workspace?: string } = {}) =>
    unwrap<PlatformUsersPage>(apiClient.get('/platform/users', { params: params(query) })),
  getUser: (id: string) => unwrap<PlatformUserDetail>(apiClient.get(`/platform/users/${id}`)),
  lockUser: (id: string, reason: string) => unwrap<PlatformUserDetail>(apiClient.post(`/platform/users/${id}/lock`, { reason })),
  unlockUser: (id: string, reason: string) => unwrap<PlatformUserDetail>(apiClient.post(`/platform/users/${id}/unlock`, { reason })),

  getCommerce: (query: PageQuery = {}) =>
    unwrap<PlatformCommerce>(apiClient.get('/platform/commerce', { params: params(query) })),
  getAuditLogs: (query: PageQuery & { scope?: 'platform' | 'all'; action?: string } = {}) =>
    unwrap<PagedList<PlatformAuditLog>>(apiClient.get('/platform/audit-logs', { params: params(query) })),
};
