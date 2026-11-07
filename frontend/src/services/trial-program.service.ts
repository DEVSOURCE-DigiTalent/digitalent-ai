import apiClient from './api-client';
import type { ApiResponse } from '../types/api';
import type { PulseAnswer, PulseOption, PulseProctoringSession } from './pulse.service';

/**
 * Dùng thử doanh nghiệp (docs/specs/2026-10-31-trial-ai-report-roadmap.md) — khớp
 * DigiTalent.Application/UseCases/TrialProgram: chủ doanh nghiệp (/trial), nhân viên (/me/trial-assessment) và quản trị nền
 * tảng (/platform/trials, /platform/mentors). Bài test chỉ có trắc nghiệm, máy chấm khi nộp; bài đóng khi hết hạn, khi mọi
 * người đã nộp hoặc khi chủ doanh nghiệp đóng sớm. Mức: 0 = chưa đạt Cơ bản, 1 Cơ bản, 2 Trung cấp, 3 Nâng cao.
 */

export type TrialStage = 'SETUP' | 'OPEN' | 'REPORTED';
export type TrialParticipantStatus = 'INVITED' | 'INVITE_EXPIRED' | 'ACTIVE' | 'SUBMITTED';
/** PENDING: AI đang viết (tạm hiện câu mẫu) · DONE · FALLBACK: câu mẫu. */
export type TrialInsightStatus = 'PENDING' | 'DONE' | 'FALLBACK';
export type TrialPlanKind = 'SAVING' | 'BALANCED' | 'FULL';
export type TrialRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TrialDomain {
  categoryId: string;
  number: number;
  code: string;
  name: string;
}

export interface TrialParticipant {
  id: string;
  employeeId?: string | null;
  invitationId?: string | null;
  /** Chủ doanh nghiệp tự tham gia làm bài. */
  isOwner?: boolean;
  fullName: string;
  email: string;
  departmentName?: string | null;
  positionName?: string | null;
  status: TrialParticipantStatus;
  assessmentId?: string | null;
  submittedAt?: string | null;
  addedAt: string;
}

export interface TrialMissedQuestion {
  content: string;
  /** Cấp của câu: 1 Cơ bản, 2 Trung cấp, 3 Nâng cao (trong mức tối đa đề xuất). */
  tier: number;
  wrong: number;
  answered: number;
}

export interface TrialReportDomainSummary {
  categoryId: string;
  number: number;
  name: string;
  /** Số người ở mức 0, 1, 2, 3. */
  counts: number[];
  average: number;
  /** % câu đúng của cả đội ở Cơ bản, Trung cấp, Nâng cao (null khi cấp đó không có câu). */
  correctRates: (number | null)[];
  mostMissed?: TrialMissedQuestion | null;
}

export interface TrialReportDepartment {
  departmentId: string;
  name: string;
  people: number;
  averages: number[];
}

export interface TrialReportEmployee {
  employeeId: string;
  assessmentId: string;
  fullName: string;
  email?: string | null;
  departmentId: string;
  departmentName?: string | null;
  positionName?: string | null;
  levels: number[];
  choiceScore: number;
  choiceTotal: number;
  submittedAt: string;
  riskLevel?: TrialRiskLevel | null;
}

/** Một câu gợi ý ✦ (≤ 8 từ): của AI hoặc câu mẫu. */
export interface TrialInsightItem {
  domainNumber: number;
  text: string;
  source: 'AI' | 'TEMPLATE';
}

export interface TrialReportInsights {
  status: TrialInsightStatus;
  priorities: TrialInsightItem[];
  ceilingReasons: TrialInsightItem[];
  completedAt?: string | null;
}

export interface TrialReport {
  publishedAt?: string | null;
  assessed: number;
  highRisk: number;
  domains: TrialDomain[];
  summary: TrialReportDomainSummary[];
  departments: TrialReportDepartment[];
  employees: TrialReportEmployee[];
  insights: TrialReportInsights;
}

export interface TrialProgram {
  organizationId: string;
  organizationName: string;
  stage: TrialStage;
  testDeadline?: string | null;
  reportPublishedAt?: string | null;
  maxParticipants: number;
  choiceCount: number;
  participants: TrialParticipant[];
  departments: string[];
  positions: string[];
  report?: TrialReport | null;
}

/** Một phương án phạm vi đào tạo: mức tối đa mỗi lĩnh vực của doanh nghiệp và mức riêng (thấp hơn) của phòng ban. */
export interface TrialPlanOption {
  kind: TrialPlanKind;
  organization: number[];
  departments: { departmentId: string; levels: (number | null)[] }[];
}

export interface TrialRoadmap {
  available: boolean;
  domains: TrialDomain[];
  departments: { id: string; name: string; people: number }[];
  /** Mức của từng người đã làm bài (ẩn danh), thứ tự lĩnh vực như domains. */
  people: { departmentId: string; levels: number[] }[];
  options: TrialPlanOption[];
  suggested: TrialPlanKind;
  reasons: TrialInsightItem[];
  insightStatus: TrialInsightStatus | '';
  /** Đơn giá một suất theo cấp: [0] = 0, [1] Cơ bản = 0, [2] Trung cấp, [3] Nâng cao. */
  prices: number[];
}

export interface TrialParticipantRow {
  fullName: string;
  email: string;
  department: string;
  position: string;
}

export interface TrialInviteResult {
  invited: { email: string; fullName: string; debugLink?: string | null }[];
  rejected: { email: string; reason: string }[];
}

export interface TrialEmployeeDomainDetail {
  categoryId: string;
  number: number;
  name: string;
  level: number;
  levelLabel: string;
  statusText: string;
  gapText: string;
  basicCorrect: number;
  basicTotal: number;
  intermediateCorrect: number;
  intermediateTotal: number;
  advancedCorrect: number;
  advancedTotal: number;
  suggestedLevel: number;
  mentorLevel?: number | null;
  recommendedCourse: string;
}

export interface MyTrialAssessment {
  organizationName: string;
  testDeadline?: string | null;
  /** REPORTED: bài đã đóng, có kết quả. */
  status: 'NOT_STARTED' | 'SUBMITTED' | 'REPORTED';
  canStart: boolean;
  closedMessage?: string | null;
  choiceCount: number;
  domains: TrialDomain[];
  submittedAt?: string | null;
  reportPublished: boolean;
  levels?: number[] | null;
  domainDetails?: TrialEmployeeDomainDetail[] | null;
}

export interface TrialExamQuestion {
  questionId: string;
  number: number;
  tier: number;
  domainNumber: number;
  domainName: string;
  content: string;
  options: PulseOption[];
}

export interface TrialExamSession extends Omit<PulseProctoringSession, 'kind' | 'questions'> {
  kind: 'TRIAL_ASSESSMENT';
  questions: TrialExamQuestion[];
}

export interface TrialExamSubmission {
  proctoringSessionId: string;
  answers: PulseAnswer[];
}

export interface PlatformTrialItem {
  organizationId: string;
  organizationName: string;
  ownerName: string;
  ownerEmail: string;
  stage: TrialStage;
  startedAt: string;
  testDeadline?: string | null;
  /** Mentor chấm bài cuối khóa học thử. */
  mentorUserId?: string | null;
  mentorName?: string | null;
  reportPublishedAt?: string | null;
  participants: number;
  submitted: number;
  insightStatus?: TrialInsightStatus | null;
}

export interface MentorItem {
  userId: string;
  fullName: string;
  email: string;
  status: string;
  activeTrials: number;
  createdAt: string;
}

export const trialProgramService = {
  // Chủ doanh nghiệp
  get: () => apiClient.get<ApiResponse<TrialProgram>>('/trial'),
  invite: (rows: TrialParticipantRow[]) => apiClient.post<ApiResponse<TrialInviteResult>>('/trial/participants', { rows }),
  setDeadline: (testDeadline: string) => apiClient.put<ApiResponse<{ stage: TrialStage; testDeadline: string }>>('/trial/request', { testDeadline }),
  /** "Xem kết quả ngay": đóng bài trước hạn (cần ít nhất một bài đã nộp). */
  close: () => apiClient.post<ApiResponse<{ closedAt: string; assessed: number }>>('/trial/close'),
  roadmap: () => apiClient.get<ApiResponse<TrialRoadmap>>('/trial/roadmap'),
  /** Chủ doanh nghiệp tự tham gia làm bài và học thử (thêm hồ sơ nhân viên + role Nhân viên). */
  joinAsParticipant: (input: { department: string; position: string }) =>
    apiClient.post<ApiResponse<{ employeeId: string }>>('/trial/me/join', input),

  // Nhân viên
  getMine: () => apiClient.get<ApiResponse<MyTrialAssessment>>('/me/trial-assessment'),
  startExam: () => apiClient.post<ApiResponse<TrialExamSession>>('/me/trial-assessment/proctoring'),
  submitExam: (input: TrialExamSubmission) =>
    apiClient.post<ApiResponse<{ assessmentId: string; submittedAt: string; durationMs: number }>>('/me/trial-assessment', input),

  // Quản trị nền tảng
  platformTrials: () => apiClient.get<ApiResponse<{ items: PlatformTrialItem[] }>>('/platform/trials'),
  regenerateInsights: (organizationId: string) =>
    apiClient.post<ApiResponse<{ status: TrialInsightStatus }>>(`/platform/trials/${organizationId}/report/insights`),
  assignMentor: (organizationId: string, mentorUserId: string) =>
    apiClient.put<ApiResponse<unknown>>(`/platform/trials/${organizationId}/mentor`, { mentorUserId }),
  mentors: () => apiClient.get<ApiResponse<{ items: MentorItem[] }>>('/platform/mentors'),
  createMentor: (input: { fullName: string; email: string; password: string }) =>
    apiClient.post<ApiResponse<{ mentor: MentorItem }>>('/platform/mentors', input),
};
