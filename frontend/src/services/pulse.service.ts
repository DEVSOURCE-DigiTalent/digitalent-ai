import apiClient from './api-client';
import type { LessonMedia, CourseFinalContent } from '@/types/learning-content';
import type { ApiResponse } from '../types/api';

/**
 * Trang nhân viên Pulse — khớp DigiTalent.Application/UseCases/Pulse (Api/Controllers/MyPulseController.cs).
 * Đặc tả: docs/ui-redesign/16-pulse-product-flow-detailed.md, docs/specs/2026-10-16-pulse-employee-roadmap-proctoring.md.
 * Mức năng lực: 0 = chưa xác nhận, 1–3 = Cơ bản / Trung cấp / Nâng cao.
 */

export type PulseDomainStatus = 'PENDING' | 'GAP' | 'MET' | 'OUTSIDE_PATH';
export type PulseLevelSource = 'NONE' | 'COURSE' | 'PRACTICAL_EVIDENCE';
export type PulseCourseAccess = 'FREE_FULL' | 'SEAT_ACTIVE' | 'PREVIEW';
/** Vùng của khóa trên lộ trình: mục tiêu vị trí giới hạn bởi trần năng lực của phòng ban. */
export type PulseCourseZone = 'PATH' | 'OPTIONAL' | 'ABOVE_CEILING' | 'OUTSIDE_PATH';
export type PulseBlockReason =
  | 'NO_POSITION'
  | 'OUTSIDE_PATH'
  | 'ABOVE_CEILING'
  | 'PRIOR_LEVEL_REQUIRED'
  | 'PRE_ASSESSMENT_REQUIRED'
  | 'PRE_ASSESSMENT_PENDING'
  | 'SEAT_REQUIRED'
  | 'PREVIOUS_MODULE_REQUIRED'
  | 'SLIDES_NOT_VIEWED'
  | 'REVIEW_REQUIRED'
  | 'QUIZ_CHANGED';
/** Trạng thái hiển thị của một khóa với nhân viên (một giá trị cho mỗi ô của lộ trình). */
export type PulseSlotStatus =
  | 'COMPLETED'
  | 'PRE_ASSESSMENT'
  | 'PRE_REVIEW'
  | 'TO_LEARN'
  | 'IN_PROGRESS'
  | 'FINAL_READY'
  | 'IN_REVIEW'
  | 'RETRY_WAIT'
  | 'NEEDS_SUPPORT'
  | 'SEAT_NEEDED'
  | 'AFTER_PRIOR_LEVEL'
  | 'ABOVE_CEILING'
  | 'OUTSIDE_PATH'
  | 'NO_POSITION';
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
/** Bài đánh giá trước khi học của một khóa. */
export type PulsePreStatus = 'REQUIRED' | 'LOCKED' | 'PENDING' | 'PASSED' | 'NOT_YET' | 'NOT_NEEDED';
export type PulseApprovedVia = 'PRE_ASSESSMENT' | 'FINAL' | 'LEGACY';
export type PulseDecision = 'PASSED' | 'NOT_YET';
export type PulseSupportAction = 'COACHING' | 'FRESH_CYCLE' | 'PAUSE';
/** Loại bài làm có giám sát. */
export type PulseExamKind = 'PRE_ASSESSMENT' | 'FINAL';
export type PulseRecordingTrack = 'SCREEN' | 'CAMERA';
export type PulseProctoringEventKind =
  | 'STARTED'
  | 'TAB_HIDDEN'
  | 'FOCUS_LOST'
  | 'SHARE_STOPPED'
  | 'SHARE_RESUMED'
  | 'CAMERA_STOPPED'
  | 'CAMERA_RESUMED'
  | 'MIC_STOPPED'
  | 'MIC_RESUMED'
  | 'SUBMITTED';

export interface PulsePerson {
  employeeId: string;
  fullName: string;
  workEmail?: string | null;
  departmentName?: string | null;
  positionName?: string | null;
  organizationName?: string | null;
}

/** Người đánh giá quá trình học: quản lý phòng ban (hoặc chủ doanh nghiệp khi nhân viên là quản lý). */
export interface PulseReviewer {
  name: string;
  role: string;
}

/** Một năng lực thành phần vị trí yêu cầu (mã theo Khung TT02, ví dụ "1.1"). */
export interface PulseCompetency {
  code: string;
  name: string;
  requiredLevel: number;
  core: boolean;
}

export interface PulseDomain {
  categoryId: string;
  number: number;
  code: string;
  name: string;
  /** Mục tiêu vị trí; 0 = vị trí không yêu cầu lĩnh vực. */
  target: number;
  /** Trần năng lực doanh nghiệp đặt cho phòng ban. */
  ceiling: number;
  /** Đỉnh lộ trình = min(mục tiêu, trần); 0 = ngoài lộ trình. */
  pathTop: number;
  verified: number;
  source: PulseLevelSource;
  status: PulseDomainStatus;
  gap: number;
  competencies: PulseCompetency[];
}

export interface PulsePreAssessmentBrief {
  preAssessmentId: string;
  submittedAt: string;
  decision?: PulseDecision | null;
  decisionReason?: string | null;
  reviewedAt?: string | null;
}

export interface PulseCourseSummary {
  courseId: string;
  code: string;
  title: string;
  categoryId: string;
  domainNumber: number;
  domainName: string;
  tier: number;
  zone: PulseCourseZone;
  inPath: boolean;
  access: PulseCourseAccess;
  canWork: boolean;
  blockReason?: PulseBlockReason | null;
  slotStatus: PulseSlotStatus;
  finalStatus: PulseFinalStatus;
  preStatus: PulsePreStatus;
  preAssessment?: PulsePreAssessmentBrief | null;
  canStartPreAssessment: boolean;
  canStartFinal: boolean;
  approved: boolean;
  approvedVia?: PulseApprovedVia | null;
  approvedAt?: string | null;
  enrollmentId?: string | null;
  enrollmentStatus?: string | null;
  moduleCount: number;
  modulesPassed: number;
  /** % đã học (đọc trang + câu ôn tập của từng mô đun). */
  progressPercent: number;
  finalAttempts: number;
  modules: { title: string; passed: boolean }[];
}

export interface PulseLatestOutcome {
  courseId: string;
  courseTitle: string;
  categoryId: string;
  domainName: string;
  tier: number;
  verified: number;
  target: number;
  via: 'PRE_ASSESSMENT' | 'FINAL';
  reviewedAt: string;
}

export interface PulseOverview {
  person: PulsePerson;
  reviewer?: PulseReviewer | null;
  hasPosition: boolean;
  hasTargets: boolean;
  domains: PulseDomain[];
  courses: PulseCourseSummary[];
  nextCourse?: PulseCourseSummary | null;
  /** Tối đa ba việc nên làm tiếp. */
  nextSteps: PulseCourseSummary[];
  latestOutcome?: PulseLatestOutcome | null;
  stats: {
    gapCount: number;
    pendingCount: number;
    targetDomainCount: number;
    metCount: number;
    requiredCompetencies: number;
    pathCourses: number;
    approvedPathCourses: number;
    optionalCourses: number;
    aboveCeilingCourses: number;
    learningCourses: number;
    preAssessmentsOpen: number;
    assignedCourses: number;
    approvedCourses: number;
    inReview: number;
  };
}

export interface PulseOption {
  optionId: string;
  content: string;
}

export interface PulseAnswer {
  questionId: string;
  optionId: string;
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
  /** Bank size; quizQuestionCount remains the number drawn per attempt. */
  quizBankQuestionCount?: number;
  viewed: boolean;
  passed: boolean;
  unlocked: boolean;
  viewable: boolean;
}

export type PulseCourseNextAction = 'PRE_ASSESSMENT' | 'PRE_REVIEW' | 'MODULE' | 'FINAL' | 'PREVIEW' | 'LOCKED' | 'DONE';

export interface PulseCourseDetail {
  course: PulseCourseSummary;
  description?: string | null;
  purpose?: string | null;
  estimatedMinutes?: number | null;
  versionNo: number;
  domain: PulseDomain;
  reviewer?: PulseReviewer | null;
  learningOutcomes: string[];
  modules: PulseCourseModule[];
  finalCriteria: PulseCriterion[];
  nextAction: PulseCourseNextAction;
  nextModuleId?: string | null;
}

export interface PulseSlide {
  media?: LessonMedia[];
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

/** Trang phải mở lại sau lần ôn tập chưa đạt (câu 2k-1, 2k của ngân hàng ↔ trang k). */
export interface PulseQuizReviewPage {
  lessonId: string;
  index: number;
  title: string;
  done: boolean;
}

export interface PulseQuizReview {
  attemptNo: number;
  failedAt: string;
  /** true = đã mở lại mọi trang cần xem, câu hỏi của lần tiếp theo đã mở. */
  done: boolean;
  pages: PulseQuizReviewPage[];
}

/** Bộ câu của một lần làm, rút từ ngân hàng của mô đun; lần sau là câu khác. */
export interface PulseModuleQuiz {
  assessmentId: string;
  attemptNo: number;
  questions: { questionId: string; content: string; options: PulseOption[] }[];
}

export interface PulseModuleDetail {
  course: PulseCourseSummary;
  module: { moduleId: string; index: number; title: string; description?: string | null; estimatedMinutes?: number | null; quizBankQuestionCount?: number };
  modules: { moduleId: string; index: number; title: string; passed: boolean; viewable: boolean }[];
  sample: boolean;
  slides: PulseSlide[];
  viewed: boolean;
  quizPassed: boolean;
  lastQuiz?: PulseQuizResultSummary | null;
  quiz?: PulseModuleQuiz | null;
  review?: PulseQuizReview | null;
  quizBlockReason?: PulseBlockReason | null;
  nextModuleId?: string | null;
  allModulesPassed: boolean;
}

export interface PulseQuizResult {
  score: number;
  total: number;
  passed: boolean;
  /** Câu chưa đúng và trang liên quan — không kèm đáp án. */
  wrong: { questionId: string; lessonId?: string | null; pageIndex?: number | null; pageTitle?: string | null }[];
  review?: PulseQuizReview | null;
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
  proctoringSessionId?: string | null;
  /** Phần trắc nghiệm: nhân viên chỉ thấy sau khi bài được chấm; người chấm thấy cả từng câu. */
  choice?: PulseChoiceResult | null;
}

/** Kết quả phần trắc nghiệm của một bài làm. */
export interface PulseChoiceResult {
  score: number;
  total: number;
  /** Số câu đúng tối thiểu để phần trắc nghiệm đạt. */
  passMark: number;
  passed: boolean;
  /** Từng câu — chỉ người chấm thấy. */
  items?: PulseChoiceItem[] | null;
}

export interface PulseChoiceItem {
  number: number;
  question: string;
  /** Phương án nhân viên đã chọn. */
  selected: string;
  correct: string;
  isCorrect: boolean;
}

/** Một câu trắc nghiệm của đề (không kèm đáp án), phát lúc bắt đầu phiên có giám sát. */
export interface PulseExamQuestion {
  questionId: string;
  number: number;
  content: string;
  options: PulseOption[];
}

export interface PulseFinal {
  assignment?: CourseFinalContent | null;
  course: PulseCourseSummary;
  domain: PulseDomain;
  positionName?: string | null;
  reviewer?: PulseReviewer | null;
  criteria: PulseCriterion[];
  /** Số câu trắc nghiệm của đề (0 khi khóa chưa có câu ôn tập) và số câu đúng tối thiểu. */
  choiceCount: number;
  choicePassMark: number;
  status: PulseFinalStatus;
  /** Bắt đầu được bài làm có giám sát và nộp bài ngay bây giờ. */
  canSubmit: boolean;
  /** Vì sao chưa làm được bài. */
  closedMessage?: string | null;
  blockReason?: PulseBlockReason | null;
  modulesPassed: number;
  moduleCount: number;
  firstOpenModuleId?: string | null;
  maxAttempts: number;
  attempts: PulseFinalAttempt[];
  cooldownHours: number;
  deadlineDays: number;
}

export interface PulseSubmitResult {
  submittedAt: string;
  /** Thời lượng bản ghi gửi cho người chấm (ms). */
  durationMs: number;
}

export interface PulseSubmitFinalResult extends PulseSubmitResult {
  submissionId: string;
  attemptNo: number;
  status: PulseFinalStatus;
}

export interface PulseSubmitPreAssessmentResult extends PulseSubmitResult {
  preAssessmentId: string;
  status: PulsePreStatus;
}

export interface PulsePreAssessmentSubmission {
  preAssessmentId: string;
  evidenceText: string;
  submittedAt: string;
  decision?: PulseDecision | null;
  decisionReason?: string | null;
  reviewerName?: string | null;
  reviewedAt?: string | null;
  proctoringSessionId?: string | null;
  /** Phần trắc nghiệm — chỉ có sau khi bài được chấm. */
  choice?: PulseChoiceResult | null;
}

export interface PulsePreAssessment {
  course: PulseCourseSummary;
  domain: PulseDomain;
  positionName?: string | null;
  reviewer?: PulseReviewer | null;
  criteria: PulseCriterion[];
  choiceCount: number;
  choicePassMark: number;
  status: PulsePreStatus;
  canStart: boolean;
  closedMessage?: string | null;
  submission?: PulsePreAssessmentSubmission | null;
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
  /** Bài đánh giá trước khi học đã nộp (chờ chấm trước). */
  preAssessments: PulsePracticeItem[];
  criteria: PulseCriterion[];
}

export type PulseOutcomeKind = 'COURSE' | 'PRE_ASSESSMENT' | 'CERTIFICATE' | 'PRACTICAL_TASK';

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

// ── Bài làm có giám sát (toàn bộ màn hình + camera + micro) ──

export interface PulseProctoringSession {
  sessionId: string;
  kind: PulseExamKind;
  startedAt: string;
  maxChunkBytes: number;
  /** Phần trắc nghiệm của đề (rỗng khi khóa chưa có câu ôn tập); gửi câu trả lời khi nộp bài. */
  questions: PulseExamQuestion[];
}

export interface PulseRecordingSegmentStart {
  recordingId: string;
  track: PulseRecordingTrack;
  segmentNo: number;
}

export interface PulseProctoringEventInput {
  kind: Exclude<PulseProctoringEventKind, 'STARTED' | 'SUBMITTED'>;
  offsetMs: number;
  durationMs?: number | null;
  detail?: string | null;
}

export const pulseService = {
  getOverview: () => apiClient.get<ApiResponse<PulseOverview>>('/me/pulse/overview'),
  getCourse: (courseId: string) => apiClient.get<ApiResponse<PulseCourseDetail>>(`/me/pulse/courses/${courseId}`),
  getModule: (courseId: string, moduleId: string) =>
    apiClient.get<ApiResponse<PulseModuleDetail>>(`/me/pulse/courses/${courseId}/modules/${moduleId}`),
  markModuleViewed: (courseId: string, moduleId: string) =>
    apiClient.post<ApiResponse<{ enrollmentId: string; viewed: boolean; modulePassed: boolean }>>(
      `/me/pulse/courses/${courseId}/modules/${moduleId}/viewed`,
    ),
  markPageViewed: (courseId: string, moduleId: string, lessonId: string) =>
    apiClient.post<ApiResponse<{ lessonId: string; viewedAt: string; review?: PulseQuizReview | null }>>(
      `/me/pulse/courses/${courseId}/modules/${moduleId}/pages/${lessonId}/viewed`,
    ),
  submitModuleQuiz: (courseId: string, moduleId: string, answers: PulseAnswer[], attemptNo?: number) =>
    apiClient.post<ApiResponse<PulseQuizResult>>(`/me/pulse/courses/${courseId}/modules/${moduleId}/quiz`, { attemptNo, answers }),
  getPreAssessment: (courseId: string) => apiClient.get<ApiResponse<PulsePreAssessment>>(`/me/pulse/courses/${courseId}/pre-assessment`),
  submitPreAssessment: (courseId: string, evidenceText: string, proctoringSessionId: string, answers: PulseAnswer[]) =>
    apiClient.post<ApiResponse<PulseSubmitPreAssessmentResult>>(`/me/pulse/courses/${courseId}/pre-assessment`, { evidenceText, proctoringSessionId, answers }),
  getFinal: (courseId: string) => apiClient.get<ApiResponse<PulseFinal>>(`/me/pulse/courses/${courseId}/final`),
  submitFinal: (courseId: string, evidenceText: string, proctoringSessionId: string, answers: PulseAnswer[]) =>
    apiClient.post<ApiResponse<PulseSubmitFinalResult>>(`/me/pulse/courses/${courseId}/final`, { evidenceText, proctoringSessionId, answers }),
  getPractice: () => apiClient.get<ApiResponse<PulsePractice>>('/me/pulse/practice'),
  getOutcomes: () => apiClient.get<ApiResponse<{ items: PulseOutcome[] }>>('/me/pulse/outcomes'),
  getOutcome: (outcomeId: string) => apiClient.get<ApiResponse<PulseOutcome>>(`/me/pulse/outcomes/${encodeURIComponent(outcomeId)}`),

  // Bài làm có giám sát
  startProctoring: (courseId: string, kind: PulseExamKind) =>
    apiClient.post<ApiResponse<PulseProctoringSession>>(`/me/pulse/courses/${courseId}/proctoring`, { kind }),
  startRecording: (sessionId: string, input: { track: PulseRecordingTrack; startOffsetMs: number; contentType: string; displaySurface?: string | null }) =>
    apiClient.post<ApiResponse<PulseRecordingSegmentStart>>(`/me/pulse/proctoring/${sessionId}/recordings`, input),
  appendRecordingChunk: (sessionId: string, recordingId: string, seq: number, chunk: Blob) =>
    apiClient.put<ApiResponse<{ received: number; sizeBytes: number; duplicate: boolean }>>(
      `/me/pulse/proctoring/${sessionId}/recordings/${recordingId}/chunks/${seq}`,
      chunk,
      { headers: { 'Content-Type': 'application/octet-stream' } },
    ),
  endRecording: (sessionId: string, recordingId: string, endOffsetMs: number) =>
    apiClient.post<ApiResponse<{ recordingId: string; startOffsetMs: number; endOffsetMs: number }>>(
      `/me/pulse/proctoring/${sessionId}/recordings/${recordingId}/end`,
      { endOffsetMs },
    ),
  recordProctoringEvents: (sessionId: string, events: PulseProctoringEventInput[]) =>
    apiClient.post<ApiResponse<{ recorded: number; total: number }>>(`/me/pulse/proctoring/${sessionId}/events`, { events }),
};

// ── Hàng chờ chấm bài của quản lý (api/v1/pulse/final-reviews, quyền task.evaluate) ──

/** Trạng thái một bài trong hàng chờ: chờ chấm, chờ nộp lại, quá hạn nộp lại, cần hỗ trợ. */
export type PulseReviewStatus = 'PENDING' | 'RETRY_WAIT' | 'RETRY_READY' | 'DEADLINE_MISSED' | 'FLAGGED';

/** Gợi ý minh họa dựa trên văn bản cho lần nộp đang chờ: một dấu cho mỗi tiêu chí. Chỉ để tham khảo. */
export interface PulseAiHint {
  checks: boolean[];
  summary: string;
}

/** Một đoạn ghi trên dòng thời gian của phiên (một tệp), kèm đường dẫn đã ký để phát. */
export interface PulseRecordingSegment {
  recordingId: string;
  track: PulseRecordingTrack;
  segmentNo: number;
  contentType: string;
  displaySurface?: string | null;
  startOffsetMs: number;
  endOffsetMs?: number | null;
  sizeBytes: number;
  /** Đường dẫn tương đối với gốc API, có hạn — dùng recordingUrl(). */
  contentPath?: string | null;
}

export interface PulseProctoringEvent {
  kind: PulseProctoringEventKind;
  offsetMs: number;
  durationMs?: number | null;
  detail?: string | null;
  flagged: boolean;
}

export interface PulseRecording {
  sessionId: string;
  kind: PulseExamKind;
  status: 'RECORDING' | 'SUBMITTED' | 'ABANDONED';
  startedAt: string;
  endedAt?: string | null;
  durationMs?: number | null;
  flaggedCount: number;
  segments: PulseRecordingSegment[];
  events: PulseProctoringEvent[];
}

export interface PulseFinalReviewItem {
  assignment?: CourseFinalContent | null;
  /** PRE_ASSESSMENT (đánh giá trước khi học) | FINAL (bài cuối khóa). */
  kind: PulseExamKind;
  /** FINAL: lần nộp mới nhất; PRE_ASSESSMENT: id bài đánh giá. */
  submissionId: string;
  status: PulseReviewStatus;
  employeeId: string;
  employeeName: string;
  departmentName?: string | null;
  positionName?: string | null;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  domainName?: string | null;
  tier?: number | null;
  attemptNo: number;
  maxAttempts: number;
  attempts: PulseFinalAttempt[];
  aiHint?: PulseAiHint | null;
  proctoringSessionId?: string | null;
  recording?: PulseRecording | null;
}

export interface PulseFinalReviewQueue {
  pendingCount: number;
  preAssessmentCount: number;
  retryCount: number;
  deadlineMissedCount: number;
  flaggedCount: number;
  criteria: PulseCriterion[];
  items: PulseFinalReviewItem[];
}

export interface PulseDecisionResult {
  submissionId: string;
  decision: PulseDecision;
  /** APPROVED | RETRY_WAIT | FLAGGED */
  status: PulseFinalStatus;
  enrollmentStatus: string;
  retryOpensAt?: string | null;
  retryDueAt?: string | null;
}

export interface PulsePreAssessmentDecisionResult {
  preAssessmentId: string;
  decision: PulseDecision;
  status: PulsePreStatus;
  enrollmentId?: string | null;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

/** Đường dẫn đầy đủ tới tệp ghi hình (link đã ký — thẻ <video> không gửi token). */
export const recordingUrl = (segment: PulseRecordingSegment) => (segment.contentPath ? `${API_BASE}/${segment.contentPath}` : null);

export const pulseReviewService = {
  getQueue: () => apiClient.get<ApiResponse<PulseFinalReviewQueue>>('/pulse/final-reviews'),
  decide: (submissionId: string, decision: PulseDecision, reason: string) =>
    apiClient.post<ApiResponse<PulseDecisionResult>>(`/pulse/final-reviews/${submissionId}/decision`, { decision, reason }),
  decidePreAssessment: (preAssessmentId: string, decision: PulseDecision, reason: string) =>
    apiClient.post<ApiResponse<PulsePreAssessmentDecisionResult>>(`/pulse/final-reviews/pre-assessments/${preAssessmentId}/decision`, { decision, reason }),
  recordSupport: (submissionId: string, action: PulseSupportAction, note?: string) =>
    apiClient.post<ApiResponse<{ submissionId: string; action: PulseSupportAction; recordedAt: string }>>(
      `/pulse/final-reviews/${submissionId}/support`,
      { action, note: note || null },
    ),
};
