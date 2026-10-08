import apiClient from './api-client';
import axios from 'axios';
import type { SessionUser } from '../types/session';
import type { LoginResponse } from '../types/auth';
import { USE_MOCK } from './mock/mock-config';
import type { ApiResponse } from '../types/api';

export interface TrialRegistrationRequest {
  organizationName: string;
  ownerName: string;
  email: string;
  password: string;
  industry: string;
  size: string;
  goal: string;
  acceptedTerms: boolean;
}

export interface TrialRegistrationDto {
  state: string;
  expiresAt: string;
  developmentLink: string | null;
}

export interface TrialAccountDto {
  userId: string;
  organizationId: string;
  email: string;
  role: string;
}

export interface TrialOptions {
  durationDays: number;
  maxAccounts: number;
  policyVersion: string;
  maxDiagnosticAttempts: number;
  verificationHours: number;
  invitationHours: number;
  maxInvitationSends: number;
  resendCooldownSeconds: number;
  policyApproved: boolean;
  dataPolicyNotice: string | null;
  enableDevelopmentCapture: boolean;
  enableDevelopmentBundle: boolean;
  publicAppUrl: string;
  developmentEnvironment: boolean;
}

export interface TrialRequirement {
  competencyId: string;
  name: string;
  requiredLevel: number;
  minimumAnswers: number;
}

export interface TrialEligiblePositionDto {
  catalogKey: string;
  name: string;
  requirementVersion: string;
  assessmentVersion: string;
  rubricVersion: string;
  eligible: boolean;
  missingReasons: string[];
  requirements: TrialRequirement[];
  developmentOnly: boolean;
}

export interface TrialContextDto {
  organizationId: string;
  status: string;
  startedAt: string;
  endsAt: string;
  policyVersion: string;
  limits: TrialOptions;
  usage: { accounts: number; pendingInvitations: number };
  allowedActions: string[];
  selectedPosition: TrialSelectedPositionDto | null;
  checklist: { key: string; complete: boolean; nextAction: string }[];
  publicationReadiness: TrialReadinessDto;
}

export interface TrialInvitationDto {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId: string;
  assignedPositionId: string;
  state: string;
  sentAt: string;
  expiresAt: string;
  canResend: boolean;
  developmentLink: string | null;
}

export interface TrialQuestionDto {
  id: string;
  competencyId: string;
  text: string;
  options: { id: string; text: string }[];
}

export interface TrialDiagnosticDto {
  attemptId: string;
  status: string;
  employeeId: string;
  positionId: string;
  positionName: string;
  requirementVersion: string;
  assessmentVersion: string;
  rubricVersion: string;
  revision: number;
  questions: TrialQuestionDto[];
  savedAnswers: { questionId: string; optionId: string }[];
  startedAt: string;
  submittedAt: string | null;
}

export interface TrialGapItemDto {
  competencyId: string;
  name: string;
  requiredLevel: number;
  currentLevel: number | null;
  gapSteps: number | null;
  classification: string;
  basis: string;
}

export interface TrialGapResultDto {
  sourceAttemptId: string;
  requirementVersion: string;
  rubricVersion: string;
  calculationVersion: string;
  measuredAt: string;
  items: TrialGapItemDto[];
}

export interface TrialLearningPathDto {
  id: string;
  sourceAttemptId: string;
  state: string;
  items: TrialPathItemDto[];
  missingContentReasons: string[];
}

export interface TrialResultRowDto {
  invitationId: string;
  employeeId: string | null;
  name: string;
  role: string;
  state: string;
  result: TrialGapResultDto | null;
  path: TrialLearningPathDto | null;
}

export interface TrialReadinessDto { canRegister: boolean; productionReady: boolean; developmentOnly: boolean; missingReasons: string[] }
export interface TrialSelectedPositionDto { positionId: string; departmentId: string; name: string; requirementVersion: string }
export interface TrialPathItemDto { id: string; title: string; version: string; competencyId: string; reasons: string[]; prerequisites: string[]; allowedToStart: boolean; status: string; progressPercent: number }
export interface TrialLearningContentDto { itemId: string; title: string; version: string; body: string }
export interface TrialTokenRequest { token: string }
export interface TrialSelectionRequest { catalogKey: string; departmentName: string }
export interface TrialInviteRequest { name: string; email: string; role: string }
export interface TrialAcceptRequest { token: string; password: string }
export interface TrialUsageDto { accounts: number; pendingInvitations: number }
export interface TrialChecklistDto { key: string; complete: boolean; nextAction: string }
export interface TrialOptionDto { id: string; text: string }
export interface TrialAnswerDto { questionId: string; optionId: string }
export interface TrialSaveAnswersRequest { revision: number; answers: TrialAnswerDto[] }
export interface TrialProgressRequest { percent: number }
export interface TrialConversionRequest { reference: string }

// Per-request adapter keeps the shared bearer/error interceptors and bypasses its demo REST adapter.
const transport = { adapter: axios.getAdapter(['xhr', 'http', 'fetch']) };
export const apiEnterpriseTrialService = {
  readiness: () => apiClient.get<ApiResponse<TrialReadinessDto>>('/enterprise-trial/readiness', transport),
  catalog: () => apiClient.get<ApiResponse<TrialEligiblePositionDto[]>>('/enterprise-trial/catalog', transport),
  register: (data: TrialRegistrationRequest) => apiClient.post<ApiResponse<TrialRegistrationDto>>('/enterprise-trial/register', data, transport),
  verify: (token: string, _password?: string) => apiClient.post<ApiResponse<TrialAccountDto>>('/enterprise-trial/verify', { token }, transport),
  accept: (token: string, password: string) => apiClient.post<ApiResponse<TrialAccountDto>>('/enterprise-trial/accept', { token, password }, transport),
  login: (email: string, password: string) => apiClient.post<ApiResponse<LoginResponse>>('/auth/login', { email, password }, transport),
  currentUser: () => apiClient.get<ApiResponse<SessionUser>>('/auth/me', transport),
  context: () => apiClient.get<ApiResponse<TrialContextDto>>('/enterprise-trial/context', transport),
  selectPosition: (catalogKey: string, departmentName: string) =>
    apiClient.post<ApiResponse<TrialContextDto>>('/enterprise-trial/position', { catalogKey, departmentName }, transport),
  invitations: () => apiClient.get<ApiResponse<TrialInvitationDto[]>>('/enterprise-trial/invitations', transport),
  invite: (name: string, email: string, role: 'Employee' | 'Manager') =>
    apiClient.post<ApiResponse<TrialInvitationDto>>('/enterprise-trial/invitations', { name, email, role }, transport),
  resendInvitation: (id: string) => apiClient.post<ApiResponse<TrialInvitationDto>>(`/enterprise-trial/invitations/${encodeURIComponent(id)}/resend`, undefined, transport),
  diagnostic: () => apiClient.get<ApiResponse<TrialDiagnosticDto | null>>('/enterprise-trial/diagnostic', transport),
  startDiagnostic: () => apiClient.post<ApiResponse<TrialDiagnosticDto>>('/enterprise-trial/diagnostic', undefined, transport),
  saveAnswers: (attemptId: string, revision: number, answers: { questionId: string; optionId: string }[]) =>
    apiClient.put<ApiResponse<TrialDiagnosticDto>>(`/enterprise-trial/diagnostic/${encodeURIComponent(attemptId)}/answers`, { revision, answers }, transport),
  submitDiagnostic: (attemptId: string) => apiClient.post<ApiResponse<TrialGapResultDto>>(`/enterprise-trial/diagnostic/${encodeURIComponent(attemptId)}/submit`, undefined, transport),
  result: () => apiClient.get<ApiResponse<TrialGapResultDto | null>>('/enterprise-trial/result', transport),
  path: () => apiClient.get<ApiResponse<TrialLearningPathDto | null>>('/enterprise-trial/path', transport),
  startPathItem: (id: string) => apiClient.post<ApiResponse<TrialLearningPathDto>>(`/enterprise-trial/path/items/${encodeURIComponent(id)}/start`, undefined, transport),
  progressPathItem: (id: string, percent: number) =>
    apiClient.put<ApiResponse<TrialLearningPathDto>>(`/enterprise-trial/path/items/${encodeURIComponent(id)}/progress`, { percent }, transport),
  pathContent: (id: string) => apiClient.get<ApiResponse<TrialLearningContentDto>>(`/enterprise-trial/path/items/${encodeURIComponent(id)}/content`, transport),
  results: () => apiClient.get<ApiResponse<TrialResultRowDto[]>>('/enterprise-trial/results', transport),
  requestConversion: () => apiClient.post<ApiResponse<TrialContextDto>>('/enterprise-trial/conversion/request', undefined, transport),
};

type Response<T> = Promise<{ data: ApiResponse<T> }>;
type Payload<T> = T extends ApiResponse<infer Value> ? Value : never;
export type EnterpriseTrialService = { [K in keyof typeof apiEnterpriseTrialService]: (...args: Parameters<(typeof apiEnterpriseTrialService)[K]>) => Response<Payload<Awaited<ReturnType<(typeof apiEnterpriseTrialService)[K]>>['data']>> };
const loadMock = () => import.meta.env.VITE_USE_MOCK === 'true'
  ? import('../features/experience/enterprise-trial/mock-trial-adapter').then(module => module.mockEnterpriseTrialService)
  : Promise.reject(new Error('Mock trial adapter disabled.'));
// Lazy proxies keep demo credentials and persistence out of a real API production build.
export const mockEnterpriseTrialService: EnterpriseTrialService = Object.fromEntries(Object.keys(apiEnterpriseTrialService).map(key => [key, (...args: unknown[]) => loadMock().then(adapter => (adapter[key as keyof EnterpriseTrialService] as (...params: unknown[]) => unknown)(...args))])) as EnterpriseTrialService;
export const enterpriseTrialService: EnterpriseTrialService = USE_MOCK ? mockEnterpriseTrialService : apiEnterpriseTrialService;
