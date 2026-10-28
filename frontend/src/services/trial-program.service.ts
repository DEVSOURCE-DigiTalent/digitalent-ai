import apiClient from './api-client';
import type { ApiResponse } from '../types/api';
import type { PulseAnswer, PulseChoiceItem, PulseOption, PulseProctoringSession, PulseRecording } from './pulse.service';

/**
 * Dùng thử doanh nghiệp (docs/specs/2026-10-27-enterprise-trial-assessment.md) — khớp
 * DigiTalent.Application/UseCases/TrialProgram: chủ doanh nghiệp (/trial), nhân viên (/me/trial-assessment),
 * quản trị nền tảng (/platform/trials, /platform/mentors) và mentor (/mentor/trials).
 * Mức: 0 = chưa đạt Cơ bản, 1 Cơ bản, 2 Trung cấp, 3 Nâng cao.
 */

export type TrialStage = 'SETUP' | 'REQUESTED' | 'ASSIGNED' | 'REPORTED';
export type TrialParticipantStatus = 'INVITED' | 'INVITE_EXPIRED' | 'ACTIVE' | 'SUBMITTED' | 'REVIEWED';

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
  reviewedAt?: string | null;
  addedAt: string;
}

export interface TrialReport {
  publishedAt?: string | null;
  assessed: number;
  domains: TrialDomain[];
  summary: { categoryId: string; number: number; name: string; counts: number[]; average: number; level: number }[];
  employees: { employeeId: string; fullName: string; departmentName?: string | null; positionName?: string | null; levels: number[] }[];
}

export interface TrialProgram {
  organizationId: string;
  organizationName: string;
  stage: TrialStage;
  testDeadline?: string | null;
  preferredReviewAt?: string | null;
  requestNote?: string | null;
  requestedAt?: string | null;
  mentorName?: string | null;
  mentorAssignedAt?: string | null;
  reportPublishedAt?: string | null;
  maxParticipants: number;
  choiceCount: number;
  essayCount: number;
  participants: TrialParticipant[];
  departments: string[];
  positions: string[];
  report?: TrialReport | null;
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

export interface TrialRequestInput {
  testDeadline: string;
  preferredReviewAt: string;
  note?: string | null;
}

export interface TrialEssayPrompt {
  tier: number;
  title: string;
  prompt: string;
}

export interface MyTrialAssessment {
  organizationName: string;
  testDeadline?: string | null;
  status: 'NOT_STARTED' | 'SUBMITTED' | 'REVIEWED';
  canStart: boolean;
  closedMessage?: string | null;
  choiceCount: number;
  domains: TrialDomain[];
  essays: TrialEssayPrompt[];
  submittedAt?: string | null;
  reportPublished: boolean;
  levels?: number[] | null;
  reviewNote?: string | null;
  mentorName?: string | null;
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
  essays: TrialEssayPrompt[];
}

export interface TrialExamSubmission {
  proctoringSessionId: string;
  answers: PulseAnswer[];
  essayBasic: string;
  essayIntermediate: string;
  essayAdvanced: string;
}

export interface PlatformTrialItem {
  organizationId: string;
  organizationName: string;
  ownerName: string;
  ownerEmail: string;
  stage: TrialStage;
  startedAt: string;
  testDeadline?: string | null;
  preferredReviewAt?: string | null;
  requestNote?: string | null;
  requestedAt?: string | null;
  mentorUserId?: string | null;
  mentorName?: string | null;
  reportPublishedAt?: string | null;
  participants: number;
  submitted: number;
  reviewed: number;
}

export interface MentorItem {
  userId: string;
  fullName: string;
  email: string;
  status: string;
  activeTrials: number;
  createdAt: string;
}

/** Gợi ý chấm tự luận của AI (Gemini) — mentor tham khảo, vẫn tự cho điểm. */
export interface TrialEssayAiReview {
  essays: { tier: number; score: number; passed: boolean; feedback: string }[];
  summary: string;
  model: string;
  reviewedAt: string;
}

export interface MentorAssessment {
  assessmentId: string;
  employeeId: string;
  fullName: string;
  departmentName?: string | null;
  positionName?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  choiceScore: number;
  choiceTotal: number;
  domains: {
    categoryId: string;
    number: number;
    name: string;
    /** [Cơ bản, Trung cấp, Nâng cao]. */
    correct: number[];
    total: number[];
    suggestedLevel: number;
    mentorLevel?: number | null;
  }[];
  /** score = điểm mentor đã cho (0–10), null khi chưa chấm. */
  essays: (TrialEssayPrompt & { text: string; score?: number | null })[];
  choiceItems: PulseChoiceItem[];
  recording?: PulseRecording | null;
  aiReview?: TrialEssayAiReview | null;
}

export interface TrialReviewInput {
  levels: { categoryId: string; level: number }[];
  /** [Cơ bản, Trung cấp, Nâng cao], 0–10. */
  essayScores: number[];
  note?: string | null;
}

export interface MentorTrial {
  organizationId: string;
  organizationName: string;
  stage: TrialStage;
  testDeadline?: string | null;
  preferredReviewAt?: string | null;
  requestNote?: string | null;
  reportPublishedAt?: string | null;
  domains: TrialDomain[];
  participants: TrialParticipant[];
  assessments: MentorAssessment[];
  canPublish: boolean;
  /** Có khóa AI để gợi ý chấm tự luận. */
  aiAvailable: boolean;
  essayMaxScore: number;
  essayPassScore: number;
}

export const trialProgramService = {
  // Chủ doanh nghiệp
  get: () => apiClient.get<ApiResponse<TrialProgram>>('/trial'),
  invite: (rows: TrialParticipantRow[]) => apiClient.post<ApiResponse<TrialInviteResult>>('/trial/participants', { rows }),
  submitRequest: (input: TrialRequestInput) => apiClient.put<ApiResponse<unknown>>('/trial/request', input),
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
  assignMentor: (organizationId: string, mentorUserId: string) =>
    apiClient.put<ApiResponse<unknown>>(`/platform/trials/${organizationId}/mentor`, { mentorUserId }),
  mentors: () => apiClient.get<ApiResponse<{ items: MentorItem[] }>>('/platform/mentors'),
  createMentor: (input: { fullName: string; email: string; password: string }) =>
    apiClient.post<ApiResponse<{ mentor: MentorItem }>>('/platform/mentors', input),

  // Mentor
  mentorTrials: () => apiClient.get<ApiResponse<{ items: PlatformTrialItem[] }>>('/mentor/trials'),
  mentorTrial: (organizationId: string) => apiClient.get<ApiResponse<MentorTrial>>(`/mentor/trials/${organizationId}`),
  review: (organizationId: string, assessmentId: string, input: TrialReviewInput) =>
    apiClient.put<ApiResponse<unknown>>(`/mentor/trials/${organizationId}/assessments/${assessmentId}`, input),
  /** AI gợi ý điểm tự luận (lưu lại cho lần mở sau). */
  aiReview: (organizationId: string, assessmentId: string) =>
    apiClient.post<ApiResponse<TrialEssayAiReview>>(`/mentor/trials/${organizationId}/assessments/${assessmentId}/ai-review`),
  publish: (organizationId: string) => apiClient.post<ApiResponse<unknown>>(`/mentor/trials/${organizationId}/publish`),
};
