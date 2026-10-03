import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  platformService,
  type PlatformOrgQueryParams,
  type PlatformSubscriptionQueryParams,
  type PlatformAssessmentQueryParams,
  type PlatformAuditLogQueryParams,
  type PlatformUserQueryParams,
  type PlatformAssessmentTemplateQueryParams,
  type PlatformPlanDto,
  type PlatformStandardCourseDto,
  type PlatformSettingsDto,
  type UserProfileDto,
} from '../services/platform.service';

export const PLATFORM_KEYS = {
  dashboard: ['platform', 'dashboard'] as const,
  organizations: (params?: PlatformOrgQueryParams) => ['platform', 'organizations', params] as const,
  organization: (id: string) => ['platform', 'organization', id] as const,
  plans: ['platform', 'plans'] as const,
  subscriptions: (params?: PlatformSubscriptionQueryParams) => ['platform', 'subscriptions', params] as const,
  framework: ['platform', 'framework'] as const,
  curriculum: ['platform', 'curriculum'] as const,
  courses: ['platform', 'courses'] as const,
  course: (id: string) => ['platform', 'course', id] as const,
  assessmentBank: (params?: PlatformAssessmentQueryParams) => ['platform', 'assessment-bank', params] as const,
  positions: ['platform', 'positions'] as const,
  position: (code: string) => ['platform', 'position', code] as const,
  users: (params?: PlatformUserQueryParams) => ['platform', 'users', params] as const,
  user: (id: string) => ['platform', 'user', id] as const,
  competencyDetail: (id: string) => ['platform', 'competency-detail', id] as const,
  assessmentTemplates: (params?: PlatformAssessmentTemplateQueryParams) => ['platform', 'assessment-templates', params] as const,
  assessmentTemplate: (id: string) => ['platform', 'assessment-template', id] as const,
  question: (id: string) => ['platform', 'question', id] as const,
  subscriptionDetail: (id: string) => ['platform', 'subscription-detail', id] as const,
  plan: (code: string) => ['platform', 'plan', code] as const,
  auditLog: (params?: PlatformAuditLogQueryParams) => ['platform', 'audit-log', params] as const,
  settings: ['platform', 'settings'] as const,
  profile: ['account', 'profile'] as const,
  loginHistory: ['account', 'login-history'] as const,
  notifications: (params?: { unreadOnly?: boolean }) => ['notifications', params] as const,
};

// PLT-01
export function usePlatformDashboard() {
  return useQuery({
    queryKey: PLATFORM_KEYS.dashboard,
    queryFn: async () => (await platformService.getDashboard()).data.data!,
  });
}

// PLT-02 & PLT-03
export function usePlatformOrganizations(params?: PlatformOrgQueryParams) {
  return useQuery({
    queryKey: PLATFORM_KEYS.organizations(params),
    queryFn: async () => (await platformService.getOrganizations(params)).data.data!,
  });
}

export function usePlatformOrganization(id: string) {
  return useQuery({
    queryKey: PLATFORM_KEYS.organization(id),
    queryFn: async () => (await platformService.getOrganization(id)).data.data!,
    enabled: Boolean(id),
  });
}

export function useToggleOrgStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: 'ACTIVE' | 'SUSPENDED'; reason: string }) =>
      (await platformService.toggleOrgStatus(id, status, reason)).data.data!,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'organizations'] });
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.organization(variables.id) });
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.dashboard });
      queryClient.invalidateQueries({ queryKey: ['platform', 'audit-log'] });
    },
  });
}

export function useUpdateOrgQuota() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, seatLimit }: { id: string; seatLimit: number }) =>
      (await platformService.updateOrgQuota(id, seatLimit)).data.data!,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'organizations'] });
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.organization(variables.id) });
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.dashboard });
    },
  });
}

// PLT-10 & PLT-11
export function usePlatformPlans() {
  return useQuery({
    queryKey: PLATFORM_KEYS.plans,
    queryFn: async () => (await platformService.getPlans()).data.data!,
  });
}

export function useUpdatePlatformPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, data }: { code: string; data: Partial<PlatformPlanDto> }) =>
      (await platformService.updatePlan(code, data)).data.data!,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.plans });
      queryClient.invalidateQueries({ queryKey: ['platform', 'audit-log'] });
    },
  });
}

export function usePlatformSubscriptions(params?: PlatformSubscriptionQueryParams) {
  return useQuery({
    queryKey: PLATFORM_KEYS.subscriptions(params),
    queryFn: async () => (await platformService.getSubscriptions(params)).data.data!,
  });
}

// PLT-04
export function usePlatformFramework() {
  return useQuery({
    queryKey: PLATFORM_KEYS.framework,
    queryFn: async () => (await platformService.getFramework()).data.data!,
  });
}

export function useUpdateCompetencyDescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, description }: { id: string; description: string }) =>
      (await platformService.updateCompetencyDescription(id, description)).data.data!,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.framework });
      queryClient.invalidateQueries({ queryKey: ['platform', 'audit-log'] });
    },
  });
}

// PLT-05, 06, 06E
export function usePlatformCurriculum() {
  return useQuery({
    queryKey: PLATFORM_KEYS.curriculum,
    queryFn: async () => (await platformService.getCurriculum()).data.data!,
  });
}

export function usePlatformCourses() {
  return useQuery({
    queryKey: PLATFORM_KEYS.courses,
    queryFn: async () => (await platformService.getCourses()).data.data!,
  });
}

export function usePlatformCourse(id: string) {
  return useQuery({
    queryKey: PLATFORM_KEYS.course(id),
    queryFn: async () => (await platformService.getCourse(id)).data.data!,
    enabled: Boolean(id),
  });
}

export function useUpdatePlatformCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PlatformStandardCourseDto> }) =>
      (await platformService.updateCourse(id, data)).data.data!,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.courses });
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.course(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['platform', 'audit-log'] });
    },
  });
}

// PLT-07
export function usePlatformAssessmentBank(params?: PlatformAssessmentQueryParams) {
  return useQuery({
    queryKey: PLATFORM_KEYS.assessmentBank(params),
    queryFn: async () => (await platformService.getAssessmentBank(params)).data.data!,
  });
}

// PLT-08 & PLT-09
export function usePlatformReferencePositions() {
  return useQuery({
    queryKey: PLATFORM_KEYS.positions,
    queryFn: async () => (await platformService.getReferencePositions()).data.data!,
  });
}

export function usePlatformReferencePosition(code: string) {
  return useQuery({
    queryKey: PLATFORM_KEYS.position(code),
    queryFn: async () => (await platformService.getReferencePosition(code)).data.data!,
    enabled: Boolean(code),
  });
}

export function useUpdatePositionRequirements() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, requirements }: { code: string; requirements: { frameworkCode: string; level: number }[] }) =>
      (await platformService.updatePositionRequirements(code, requirements)).data.data!,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.positions });
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.position(variables.code) });
      queryClient.invalidateQueries({ queryKey: ['platform', 'audit-log'] });
    },
  });
}

// PA-04 & PA-05: User Management
export function usePlatformUsers(params?: PlatformUserQueryParams) {
  return useQuery({
    queryKey: PLATFORM_KEYS.users(params),
    queryFn: async () => (await platformService.getUsers(params)).data.data!,
  });
}

export function usePlatformUser(id: string) {
  return useQuery({
    queryKey: PLATFORM_KEYS.user(id),
    queryFn: async () => (await platformService.getUser(id)).data.data!,
    enabled: Boolean(id),
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: 'ACTIVE' | 'LOCKED'; reason: string }) =>
      (await platformService.toggleUserStatus(id, status, reason)).data.data!,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'users'] });
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.user(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['platform', 'audit-log'] });
    },
  });
}

export function useResetUserPasswordAssistance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      (await platformService.resetUserPasswordAssistance(id)).data.data!,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'audit-log'] });
    },
  });
}

// PA-07: Competency Detail Source-of-truth
export function usePlatformCompetencyDetail(id: string) {
  return useQuery({
    queryKey: PLATFORM_KEYS.competencyDetail(id),
    queryFn: async () => (await platformService.getCompetencyDetail(id)).data.data!,
    enabled: Boolean(id),
  });
}

export function useUpdateCompetencySourceOfTruth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<any> }) =>
      (await platformService.updateCompetencySourceOfTruth(id, data)).data.data!,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.competencyDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.framework });
      queryClient.invalidateQueries({ queryKey: ['platform', 'audit-log'] });
    },
  });
}

// PA-12: Question Editor
export function usePlatformQuestion(id: string) {
  return useQuery({
    queryKey: PLATFORM_KEYS.question(id),
    queryFn: async () => (await platformService.getQuestion(id)).data.data!,
    enabled: Boolean(id) && id !== 'new',
  });
}

export function useSavePlatformQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<any>) =>
      (await platformService.saveQuestion(data)).data.data!,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'assessment-bank'] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'audit-log'] });
    },
  });
}

// PA-13: Assessment Templates
export function usePlatformAssessmentTemplates(params?: PlatformAssessmentTemplateQueryParams) {
  return useQuery({
    queryKey: PLATFORM_KEYS.assessmentTemplates(params),
    queryFn: async () => (await platformService.getAssessmentTemplates(params)).data.data!,
  });
}

export function usePlatformAssessmentTemplate(id: string) {
  return useQuery({
    queryKey: PLATFORM_KEYS.assessmentTemplate(id),
    queryFn: async () => (await platformService.getAssessmentTemplate(id)).data.data!,
    enabled: Boolean(id) && id !== 'new',
  });
}

export function useUpdateAssessmentTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<any> }) =>
      (await platformService.updateAssessmentTemplate(id, data)).data.data!,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'assessment-templates'] });
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.assessmentTemplate(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['platform', 'audit-log'] });
    },
  });
}

// PA-17: Plan Detail
export function usePlatformPlan(code: string) {
  return useQuery({
    queryKey: PLATFORM_KEYS.plan(code),
    queryFn: async () => (await platformService.getPlan(code)).data.data!,
    enabled: Boolean(code),
  });
}

// PA-19: Subscription Detail
export function usePlatformSubscriptionDetail(id: string) {
  return useQuery({
    queryKey: PLATFORM_KEYS.subscriptionDetail(id),
    queryFn: async () => (await platformService.getSubscriptionDetail(id)).data.data!,
    enabled: Boolean(id),
  });
}

export function useCancelPlatformSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) =>
      (await platformService.cancelSubscription(id, reason)).data.data!,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'subscriptions'] });
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.subscriptionDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['platform', 'audit-log'] });
    },
  });
}

// PLT-12 & PLT-13
export function usePlatformAuditLog(params?: PlatformAuditLogQueryParams) {
  return useQuery({
    queryKey: PLATFORM_KEYS.auditLog(params),
    queryFn: async () => (await platformService.getAuditLog(params)).data.data!,
  });
}

export function usePlatformSettings() {
  return useQuery({
    queryKey: PLATFORM_KEYS.settings,
    queryFn: async () => (await platformService.getSettings()).data.data!,
  });
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PlatformSettingsDto) => (await platformService.updateSettings(data)).data.data!,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.settings });
      queryClient.invalidateQueries({ queryKey: ['platform', 'audit-log'] });
    },
  });
}

// Account & Security (SHR-01, SHR-02)
export function useUserProfile() {
  return useQuery({
    queryKey: PLATFORM_KEYS.profile,
    queryFn: async () => (await platformService.getProfile()).data.data!,
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<UserProfileDto>) => (await platformService.updateProfile(data)).data.data!,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.profile });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) =>
      (await platformService.changePassword(data)).data.data!,
  });
}

export function useLoginHistory() {
  return useQuery({
    queryKey: PLATFORM_KEYS.loginHistory,
    queryFn: async () => (await platformService.getLoginHistory()).data.data!,
  });
}

// Notifications (SHR-03)
export function useNotifications(params?: { unreadOnly?: boolean }) {
  return useQuery({
    queryKey: PLATFORM_KEYS.notifications(params),
    queryFn: async () => (await platformService.getNotifications(params)).data.data!,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await platformService.markNotificationRead(id)).data.data!,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await platformService.markAllNotificationsRead()).data.data!,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
