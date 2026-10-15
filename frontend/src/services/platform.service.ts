import apiClient from './api-client';
import type { ApiResponse } from '../types/api';
import type { CatalogCategory, CatalogCompetency, CatalogCourse } from './mock/server/catalog';

export interface PlatformDashboardDto {
  metrics: {
    totalOrganizations: number;
    activeOrganizations: number;
    suspendedOrganizations: number;
    totalUsers: number;
    totalLearners: number;
    activeSubscriptions: number;
    mrr: number;
    arr: number;
    standardCoursesCount: number;
    standardQuestionsCount: number;
  };
  recentOrganizations: PlatformOrganizationDto[];
  subscriptionDistribution: { planCode: string; planName: string; count: number }[];
}

export interface PlatformOrganizationDto {
  id: string;
  name: string;
  industry: string;
  size: string;
  ownerName: string;
  ownerEmail: string;
  planCode: string;
  planName: string;
  status: 'ACTIVE' | 'SUSPENDED';
  seatLimit: number;
  seatsUsed: number;
  departmentsCount: number;
  positionsCount: number;
  membersCount: number;
  createdAt: string;
  suspensionReason?: string;
}

export interface PlatformOrgQueryParams {
  search?: string;
  status?: string;
  planCode?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface PlatformSubscriptionDto {
  id: string;
  audience: 'enterprise' | 'individual';
  customerName: string;
  customerEmail: string;
  planCode: string;
  planName: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  seats: number;
  cycle: 'month' | 'year';
  amount: number;
  renewsAt: string;
  createdAt: string;
}

export interface PlatformSubscriptionQueryParams {
  search?: string;
  status?: string;
  audience?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface PlatformPlanDto {
  code: string;
  name: string;
  audience: 'enterprise' | 'individual';
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  tagline: string;
  highlights: string[];
  seatRange?: { min: number; max: number };
  entitlements: string[];
  activeCount: number;
}

export interface PlatformFrameworkDto {
  categories: CatalogCategory[];
  competencies: CatalogCompetency[];
}

export interface PlatformCurriculumModule {
  id: string;
  title: string;
  estimatedMinutes: number;
  lessons: { id: string; title: string; type: 'video' | 'reading' | 'quiz'; durationMinutes: number }[];
}

export interface PlatformStandardCourseDto extends CatalogCourse {
  description: string;
  targetAudience: string;
  learningOutcomes: string[];
  modulesList: PlatformCurriculumModule[];
}

export interface PlatformAssessmentQuestionDto {
  id: string;
  code: string;
  competencyCode: string;
  competencyName: string;
  domainName: string;
  level: number;
  type: 'MCQ' | 'PRACTICAL_RUBRIC';
  questionText: string;
  options?: { id: string; text: string; isCorrect: boolean }[];
  rubricGuide?: string;
}

export interface PlatformAssessmentQueryParams {
  search?: string;
  domainId?: string;
  type?: string;
  level?: number;
  pageIndex?: number;
  pageSize?: number;
}

export interface PlatformReferencePositionReq {
  frameworkCode: string;
  competencyName: string;
  level: number;
  levelLabel: string;
  domainName: string;
}

export interface PlatformReferencePositionDto {
  code: string;
  name: string;
  description: string;
  requiredCompetencies: PlatformReferencePositionReq[];
}

export interface PlatformUserDto {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  jobTitle?: string;
  roles: string[];
  workspace: 'enterprise' | 'personal' | 'platform';
  organizationId?: string;
  organizationName?: string;
  status: 'ACTIVE' | 'LOCKED';
  lockReason?: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface PlatformUserQueryParams {
  search?: string;
  role?: string;
  workspace?: string;
  status?: string;
  organizationId?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface PlatformCompetencyDetailDto extends CatalogCompetency {
  domainName: string;
  levelsDetail: {
    level: number;
    levelName: string;
    subLevels: string; // e.g., 'Bậc 1 - Bậc 2'
    behaviorIndicator: string;
    assessmentGuidance: string;
    evidenceGuidance: string;
  }[];
  referencePositions: { code: string; name: string; requiredLevel: number }[];
  standardCourses: { id: string; code: string; title: string; level: number }[];
}

export interface PlatformAssessmentTemplateDto {
  id: string;
  code: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  passScorePercentage: number;
  maxAttempts: number;
  targetCompetencies: { frameworkCode: string; name: string; questionCount: number }[];
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  updatedAt: string;
}

export interface PlatformAssessmentTemplateQueryParams {
  search?: string;
  status?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface PlatformSubscriptionDetailDto extends PlatformSubscriptionDto {
  paymentHistory: {
    id: string;
    date: string;
    amount: number;
    status: 'PAID' | 'FAILED' | 'PENDING';
    invoiceUrl?: string;
    note?: string;
  }[];
  planChanges: {
    date: string;
    fromPlan: string;
    toPlan: string;
    changedBy: string;
    reason?: string;
  }[];
  supportActions: {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    note: string;
  }[];
}

export interface PlatformAuditLogEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorName: string;
  action: string;
  targetType: string;
  targetName: string;
  details?: string;
}

export interface PlatformAuditLogQueryParams {
  search?: string;
  action?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface PlatformSettingsDto {
  maintenanceMode: boolean;
  allowSelfRegistration: boolean;
  mockPaymentSuccessRate: number;
  mockEmailDelivery: boolean;
  aiScoringModel: string;
  defaultTrialDays: number;
}

export interface UserProfileDto {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  avatarUrl?: string;
  roleTitle?: string;
}

export interface LoginHistoryEntry {
  id: string;
  timestamp: string;
  ip: string;
  browser: string;
  os: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  createdAt: string;
  isRead: boolean;
  link?: string;
}

/** BE2 returns notification items with paging metadata; the mock server still returns an array. */
export interface NotificationListDto {
  items: NotificationDto[];
  total: number;
  unread: number;
  pageIndex: number;
  pageSize: number;
}

/**
 * Account & security (SHR-01, SHR-02) and notifications (SHR-03). The Platform Admin console calls api/v1/platform through
 * platform-admin.service.ts; the Platform* types above are still used by the mock server (services/mock/server/handlers/platform.ts).
 */
export const platformService = {
  // Shared Account & Security (SHR-01, SHR-02)
  getProfile: () => apiClient.get<ApiResponse<UserProfileDto>>('/account/profile'),
  updateProfile: (data: Partial<UserProfileDto>) => apiClient.put<ApiResponse<UserProfileDto>>('/account/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post<ApiResponse<null>>('/account/change-password', data),
  getLoginHistory: () => apiClient.get<ApiResponse<LoginHistoryEntry[]>>('/account/login-history'),

  // Shared Notifications (SHR-03)
  getNotifications: (params?: { unreadOnly?: boolean }) =>
    apiClient.get<ApiResponse<NotificationListDto | NotificationDto[]>>('/notifications', { params }),
  markNotificationRead: (id: string) => apiClient.put<ApiResponse<null>>(`/notifications/${id}/read`),
  markAllNotificationsRead: () => apiClient.put<ApiResponse<null>>('/notifications/read-all'),
};
