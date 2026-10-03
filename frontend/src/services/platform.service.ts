import apiClient from './api-client';
import type { ApiResponse, PagedList } from '../types/api';
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

export const platformService = {
  // PLT-01
  getDashboard: () => apiClient.get<ApiResponse<PlatformDashboardDto>>('/platform/dashboard'),

  // PLT-02 & PLT-03
  getOrganizations: (params?: PlatformOrgQueryParams) =>
    apiClient.get<ApiResponse<PagedList<PlatformOrganizationDto>>>('/platform/organizations', { params }),
  getOrganization: (id: string) =>
    apiClient.get<ApiResponse<PlatformOrganizationDto>>(`/platform/organizations/${id}`),
  toggleOrgStatus: (id: string, status: 'ACTIVE' | 'SUSPENDED', reason: string) =>
    apiClient.put<ApiResponse<PlatformOrganizationDto>>(`/platform/organizations/${id}/status`, { status, reason }),
  updateOrgQuota: (id: string, seatLimit: number) =>
    apiClient.put<ApiResponse<PlatformOrganizationDto>>(`/platform/organizations/${id}/quota`, { seatLimit }),

  // PLT-10 & PLT-11
  getPlans: () => apiClient.get<ApiResponse<PlatformPlanDto[]>>('/platform/plans'),
  updatePlan: (code: string, data: Partial<PlatformPlanDto>) =>
    apiClient.put<ApiResponse<PlatformPlanDto>>(`/platform/plans/${code}`, data),
  getSubscriptions: (params?: PlatformSubscriptionQueryParams) =>
    apiClient.get<ApiResponse<PagedList<PlatformSubscriptionDto>>>('/platform/subscriptions', { params }),

  // PLT-04
  getFramework: () => apiClient.get<ApiResponse<PlatformFrameworkDto>>('/platform/framework'),
  updateCompetencyDescription: (id: string, description: string) =>
    apiClient.put<ApiResponse<CatalogCompetency>>(`/platform/framework/${id}`, { description }),

  // PLT-05, 06, 06E
  getCurriculum: () => apiClient.get<ApiResponse<PlatformFrameworkDto>>('/platform/curriculum'),
  getCourses: () => apiClient.get<ApiResponse<PlatformStandardCourseDto[]>>('/platform/courses'),
  getCourse: (id: string) => apiClient.get<ApiResponse<PlatformStandardCourseDto>>(`/platform/courses/${id}`),
  updateCourse: (id: string, data: Partial<PlatformStandardCourseDto>) =>
    apiClient.put<ApiResponse<PlatformStandardCourseDto>>(`/platform/courses/${id}`, data),

  // PLT-07
  getAssessmentBank: (params?: PlatformAssessmentQueryParams) =>
    apiClient.get<ApiResponse<PagedList<PlatformAssessmentQuestionDto>>>('/platform/assessment-bank', { params }),

  // PLT-08, 09
  getReferencePositions: () =>
    apiClient.get<ApiResponse<PlatformReferencePositionDto[]>>('/platform/positions'),
  getReferencePosition: (code: string) =>
    apiClient.get<ApiResponse<PlatformReferencePositionDto>>(`/platform/positions/${code}`),
  updatePositionRequirements: (code: string, requirements: { frameworkCode: string; level: number }[]) =>
    apiClient.put<ApiResponse<PlatformReferencePositionDto>>(`/platform/positions/${code}/requirements`, { requirements }),

  // PLT-12, 13
  getAuditLog: (params?: PlatformAuditLogQueryParams) =>
    apiClient.get<ApiResponse<PagedList<PlatformAuditLogEntry>>>('/platform/audit-log', { params }),
  getSettings: () => apiClient.get<ApiResponse<PlatformSettingsDto>>('/platform/settings'),
  updateSettings: (data: PlatformSettingsDto) =>
    apiClient.put<ApiResponse<PlatformSettingsDto>>('/platform/settings', data),

  // PA-04 & PA-05: Users management
  getUsers: (params?: PlatformUserQueryParams) =>
    apiClient.get<ApiResponse<PagedList<PlatformUserDto>>>('/platform/users', { params }),
  getUser: (id: string) =>
    apiClient.get<ApiResponse<PlatformUserDto>>(`/platform/users/${id}`),
  toggleUserStatus: (id: string, status: 'ACTIVE' | 'LOCKED', reason: string) =>
    apiClient.put<ApiResponse<PlatformUserDto>>(`/platform/users/${id}/status`, { status, reason }),
  resetUserPasswordAssistance: (id: string) =>
    apiClient.post<ApiResponse<{ tempPassword?: string; message: string }>>(`/platform/users/${id}/reset-password-assistance`),

  // PA-07: Competency Detail & Source of truth
  getCompetencyDetail: (id: string) =>
    apiClient.get<ApiResponse<PlatformCompetencyDetailDto>>(`/platform/framework/${id}`),
  updateCompetencySourceOfTruth: (id: string, data: Partial<CatalogCompetency>) =>
    apiClient.put<ApiResponse<CatalogCompetency>>(`/platform/framework/${id}/source-of-truth`, data),

  // PA-12: Question Editor
  getQuestion: (id: string) =>
    apiClient.get<ApiResponse<PlatformAssessmentQuestionDto>>(`/platform/questions/${id}`),
  saveQuestion: (question: Partial<PlatformAssessmentQuestionDto>) =>
    apiClient.post<ApiResponse<PlatformAssessmentQuestionDto>>('/platform/questions', question),

  // PA-13: Assessment Templates
  getAssessmentTemplates: (params?: PlatformAssessmentTemplateQueryParams) =>
    apiClient.get<ApiResponse<PagedList<PlatformAssessmentTemplateDto>>>('/platform/assessment-templates', { params }),
  getAssessmentTemplate: (id: string) =>
    apiClient.get<ApiResponse<PlatformAssessmentTemplateDto>>(`/platform/assessment-templates/${id}`),
  updateAssessmentTemplate: (id: string, data: Partial<PlatformAssessmentTemplateDto>) =>
    apiClient.put<ApiResponse<PlatformAssessmentTemplateDto>>(`/platform/assessment-templates/${id}`, data),

  // PA-17 & PA-19: Plans & Subscription detail
  getPlan: (code: string) =>
    apiClient.get<ApiResponse<PlatformPlanDto>>(`/platform/plans/${code}`),
  getSubscriptionDetail: (id: string) =>
    apiClient.get<ApiResponse<PlatformSubscriptionDetailDto>>(`/platform/subscriptions/${id}`),
  cancelSubscription: (id: string, reason: string) =>
    apiClient.put<ApiResponse<PlatformSubscriptionDto>>(`/platform/subscriptions/${id}/cancel`, { reason }),

  // Shared Account & Security (SHR-01, SHR-02)
  getProfile: () => apiClient.get<ApiResponse<UserProfileDto>>('/account/profile'),
  updateProfile: (data: Partial<UserProfileDto>) => apiClient.put<ApiResponse<UserProfileDto>>('/account/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post<ApiResponse<null>>('/account/change-password', data),
  getLoginHistory: () => apiClient.get<ApiResponse<LoginHistoryEntry[]>>('/account/login-history'),

  // Shared Notifications (SHR-03)
  getNotifications: (params?: { unreadOnly?: boolean }) =>
    apiClient.get<ApiResponse<NotificationDto[]>>('/notifications', { params }),
  markNotificationRead: (id: string) => apiClient.put<ApiResponse<null>>(`/notifications/${id}/read`),
  markAllNotificationsRead: () => apiClient.put<ApiResponse<null>>('/notifications/read-all'),
};
