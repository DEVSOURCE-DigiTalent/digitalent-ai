import apiClient from './api-client';
import type { ApiResponse } from '../types/api';

/**
 * Trang nhân viên Pulse — khớp DigiTalent.Application/UseCases/Pulse (Api/Controllers/MyPulseController.cs).
 * Đặc tả: docs/ui-redesign/16-pulse-product-flow-detailed.md. Mức năng lực: 0 = chưa xác nhận, 1–3 = Cơ bản / Trung cấp / Nâng cao.
 */

export type PulseDomainStatus = 'PENDING' | 'GAP' | 'MET' | 'OUTSIDE_PATH';
export type PulseLevelSource = 'BASELINE' | 'COURSE' | 'PRACTICAL_EVIDENCE';
export type PulseCourseAccess = 'FREE_FULL' | 'SEAT_ACTIVE' | 'PREVIEW';
export type PulseBlockReason =
  | 'NO_POSITION'
  | 'NOT_ASSESSED'
  | 'OUTSIDE_PATH'
  | 'SEAT_REQUIRED'
  | 'PRIOR_LEVEL_REQUIRED'
  | 'PREVIOUS_MODULE_REQUIRED'
  | 'SLIDES_NOT_VIEWED';
export type PulseSlotStatus =
  | 'COMPLETED'
  | 'IN_REVIEW'
  | 'IN_PROGRESS'
  | 'SEAT_HELD'
  | 'NEEDS_SUPPORT'
  | 'AFTER_BASELINE'
  | 'FREE_TO_START'
  | 'SEAT_NEEDED'
  | 'AFTER_PRIOR_LEVEL';
export type PulseFinalStatus =
  | 'NOT_STARTED'
  | 'LEARNING'
  | 'READY'
  | 'PENDING'
  | 'APPROVED'
  | 'RETRY_WAIT'
  | 'RETRY_READY'
  | 'DEADLINE_MISSED'
  | 'FLAGGED';
export type PulseDecision = 'PASSED' | 'NOT_YET';
export type PulseSupportAction = 'COACHING' | 'FRESH_CYCLE' | 'PAUSE';

export interface PulsePerson {
  employeeId: string;
  fullName: string;
  workEmail?: string | null;
  departmentName?: string | null;
  positionName?: string | null;
  organizationName?: string | null;
}

export interface PulseDomain {
  categoryId: string;
  number: number;
  code: string;
  name: string;
  target: number;
  baseline?: number | null;
  verified: number;
  source: PulseLevelSource;
  status: PulseDomainStatus;
  gap: number;
}

export interface PulseCourseSummary {
  courseId: string;
  code: string;
  title: string;
  categoryId: string;
  domainNumber: number;
  domainName: string;
  tier: number;
  inPath: boolean;
  access: PulseCourseAccess;
  canWork: boolean;
  blockReason?: PulseBlockReason | null;
  slotStatus: PulseSlotStatus;
  finalStatus: PulseFinalStatus;
  enrollmentId?: string | null;
  enrollmentStatus?: string | null;
  moduleCount: number;
  modulesPassed: number;
  finalAttempts: number;
}

export interface PulseLatestOutcome {
  courseId: string;
  courseTitle: string;
  categoryId: string;
  domainName: string;
  tier: number;
  baseline: number;
  verified: number;
  target: number;
  gained: boolean;
  reviewedAt: string;
}

export interface PulseOverview {
  person: PulsePerson;
  hasPosition: boolean;
  hasTargets: boolean;
  assessed: boolean;
  assessedAt?: string | null;
  domains: PulseDomain[];
  courses: PulseCourseSummary[];
  nextCourse?: PulseCourseSummary | null;
  latestOutcome?: PulseLatestOutcome | null;
  stats: {
    gapCount: number;
    pendingCount: number;
    targetDomainCount: number;
    metCount: number;
    assignedCourses: number;
    approvedCourses: number;
    inReview: number;
  };
}

export interface PulseOption {
  optionId: string;
  content: string;
}

export interface PulseBaselineQuestion {
  questionId: string;
  level: number;
  content: string;
  options: PulseOption[];
}

export interface PulseBaselineDomain {
  categoryId: string;
  number: number;
  name: string;
  target: number;
  baseline?: number | null;
  questions: PulseBaselineQuestion[];
}

export interface PulseBaseline {
  person: PulsePerson;
  assessed: boolean;
  assessedAt?: string | null;
  blockReason?: 'NO_POSITION' | 'NO_TARGETS' | 'NO_QUESTIONS' | null;
  domains: PulseBaselineDomain[];
}

export interface PulseAnswer {
  questionId: string;
  optionId: string;
}

export interface PulseBaselineResult {
  assessedAt: string;
  domains: PulseBaselineDomain[];
}

export interface PulseCriterion {
  number: string;
  title: string;
  description: string;
}

export interface PulseCourseModule {
  moduleId: string;
  index: number;
  title: string;
  description?: string | null;
  estimatedMinutes?: number | null;
  slideCount: number;
  hasQuiz: boolean;
  quizQuestionCount: number;
  viewed: boolean;
  passed: boolean;
  unlocked: boolean;
  viewable: boolean;
}

export type PulseCourseNextAction = 'BASELINE' | 'MODULE' | 'FINAL' | 'PREVIEW' | 'DONE';

export interface PulseCourseDetail {
  course: PulseCourseSummary;
  description?: string | null;
  purpose?: string | null;
  estimatedMinutes?: number | null;
  versionNo: number;
  domain: PulseDomain;
  assessed: boolean;
  learningOutcomes: string[];
  modules: PulseCourseModule[];
  finalCriteria: PulseCriterion[];
  nextAction: PulseCourseNextAction;
  nextModuleId?: string | null;
}

export interface PulseSlide {
  lessonId: string;
  title: string;
  lessonType: string;
  contentBody?: string | null;
  estimatedMinutes?: number | null;
}

export interface PulseQuizResultSummary {
  score: number;
  total: number;
  passed: boolean;
  at: string;
}

export interface PulseModuleDetail {
  course: PulseCourseSummary;
  module: { moduleId: string; index: number; title: string; description?: string | null; estimatedMinutes?: number | null };
  modules: { moduleId: string; index: number; title: string; passed: boolean; viewable: boolean }[];
  sample: boolean;
  slides: PulseSlide[];
  viewed: boolean;
  quizPassed: boolean;
  lastQuiz?: PulseQuizResultSummary | null;
  quiz?: { assessmentId: string; questions: { questionId: string; content: string; options: PulseOption[] }[] } | null;
  quizBlockReason?: PulseBlockReason | null;
  nextModuleId?: string | null;
  allModulesPassed: boolean;
}

export interface PulseQuizResult {
  score: number;
  total: number;
  passed: boolean;
  wrong: { questionId: string; explanation?: string | null }[];
  modulePassed: boolean;
  nextModuleId?: string | null;
  allModulesPassed: boolean;
}

export interface PulseFinalAttempt {
  submissionId: string;
  attemptNo: number;
  evidenceText: string;
  submittedAt: string;
  decision?: PulseDecision | null;
  decisionReason?: string | null;
  reviewerName?: string | null;
  reviewedAt?: string | null;
  retryOpensAt?: string | null;
  retryDueAt?: string | null;
  supportAction?: PulseSupportAction | null;
  supportNote?: string | null;
  supportRecordedAt?: string | null;
}

export interface PulseFinal {
  course: PulseCourseSummary;
  domain: PulseDomain;
  positionName?: string | null;
  criteria: PulseCriterion[];
  status: PulseFinalStatus;
  canSubmit: boolean;
  blockReason?: PulseBlockReason | null;
  modulesPassed: number;
  moduleCount: number;
  firstOpenModuleId?: string | null;
  maxAttempts: number;
  attempts: PulseFinalAttempt[];
  cooldownHours: number;
  deadlineDays: number;
}

export interface PulseSubmitFinalResult {
  submissionId: string;
  attemptNo: number;
  submittedAt: string;
  status: PulseFinalStatus;
}

export interface PulsePracticeItem {
  course: PulseCourseSummary;
  lastSubmittedAt?: string | null;
  lastDecision?: PulseDecision | null;
  lastDecisionReason?: string | null;
  lastReviewedAt?: string | null;
  retryOpensAt?: string | null;
  retryDueAt?: string | null;
  supportAction?: PulseSupportAction | null;
}

export interface PulsePractice {
  finals: PulsePracticeItem[];
  criteria: PulseCriterion[];
}

export type PulseOutcomeKind = 'COURSE' | 'CERTIFICATE' | 'PRACTICAL_TASK';

export interface PulseOutcome {
  id: string;
  kind: PulseOutcomeKind;
  title: string;
  subtitle?: string | null;
  level?: number | null;
  issuedAt: string;
  source: string;
  reference: string;
  reviewerName?: string | null;
  reviewNote?: string | null;
  holderName: string;
  organizationName?: string | null;
  courseId?: string | null;
}

export const pulseService = {
  getOverview: () => apiClient.get<ApiResponse<PulseOverview>>('/me/pulse/overview'),
  getBaseline: () => apiClient.get<ApiResponse<PulseBaseline>>('/me/pulse/baseline'),
  submitBaseline: (answers: PulseAnswer[]) =>
    apiClient.post<ApiResponse<PulseBaselineResult>>('/me/pulse/baseline', { answers }),
  getCourse: (courseId: string) => apiClient.get<ApiResponse<PulseCourseDetail>>(`/me/pulse/courses/${courseId}`),
  getModule: (courseId: string, moduleId: string) =>
    apiClient.get<ApiResponse<PulseModuleDetail>>(`/me/pulse/courses/${courseId}/modules/${moduleId}`),
  markModuleViewed: (courseId: string, moduleId: string) =>
    apiClient.post<ApiResponse<{ enrollmentId: string; viewed: boolean; modulePassed: boolean }>>(
      `/me/pulse/courses/${courseId}/modules/${moduleId}/viewed`,
    ),
  submitModuleQuiz: (courseId: string, moduleId: string, answers: PulseAnswer[]) =>
    apiClient.post<ApiResponse<PulseQuizResult>>(`/me/pulse/courses/${courseId}/modules/${moduleId}/quiz`, { answers }),
  getFinal: (courseId: string) => apiClient.get<ApiResponse<PulseFinal>>(`/me/pulse/courses/${courseId}/final`),
  submitFinal: (courseId: string, evidenceText: string) =>
    apiClient.post<ApiResponse<PulseSubmitFinalResult>>(`/me/pulse/courses/${courseId}/final`, { evidenceText }),
  getPractice: () => apiClient.get<ApiResponse<PulsePractice>>('/me/pulse/practice'),
  getOutcomes: () => apiClient.get<ApiResponse<{ items: PulseOutcome[] }>>('/me/pulse/outcomes'),
  getOutcome: (outcomeId: string) => apiClient.get<ApiResponse<PulseOutcome>>(`/me/pulse/outcomes/${encodeURIComponent(outcomeId)}`),
};
