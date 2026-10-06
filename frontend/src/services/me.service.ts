import apiClient from './api-client';
import type { ApiResponse, PagedList } from '../types/api';

/**
 * Trang cá nhân của nhân viên (EM-01..EM-18) — chỉ dữ liệu của chính người đăng nhập.
 * Khớp DigiTalent.Application/UseCases/Me (Api/Controllers/My*Controller.cs).
 */

// ── Dùng chung ────────────────────────────────────────────────────────────────

export type SkillGapSkipReason = 'NO_JOB_POSITION' | 'NO_ACTIVE_REQUIREMENT_SET' | 'EMPLOYEE_NOT_ACTIVE';
export type Severity = 'HIGH' | 'MEDIUM' | 'LOW';

export interface MyEmployeeInfo {
  id: string;
  fullName: string;
  employeeCode: string;
  workEmail?: string | null;
  departmentName?: string | null;
  jobPositionName?: string | null;
  jobFamilyName?: string | null;
  managerName?: string | null;
  joinedAt?: string | null;
}

export interface MyCompetencySummary {
  totalRequired: number;
  totalMet: number;
  totalGap: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  coveragePercent: number;
}

export interface MyCompetencyLine {
  competencyId: string;
  competencyCode: string;
  competencyName: string;
  categoryName?: string | null;
  requiredLevel: number;
  currentLevel?: number | null;
  confirmedAt?: string | null;
  gapSteps: number;
  severity?: Severity | null;
  mandatory: boolean;
  weightPercent: number;
  requiresPracticalEvidence: boolean;
  note?: string | null;
  priorityScore: number;
  status: 'MET' | 'GAP' | 'NOT_CONFIRMED';
}

export interface MyConfirmedCompetency {
  competencyId: string;
  competencyCode: string;
  competencyName: string;
  categoryName?: string | null;
  level: number;
  confirmedAt: string;
}

export interface MyCompetencyRef {
  competencyId: string;
  code: string;
  name: string;
  targetLevel: number;
}

export interface MyPrerequisite {
  courseId: string;
  code: string;
  title: string;
  completed: boolean;
}

export interface MyCertificateRef {
  id: string;
  code: string;
  issuedAt: string;
  expiresAt?: string | null;
  status: string;
}

// ── EM-01 Tổng quan ───────────────────────────────────────────────────────────

export type EnrollmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'READY_FOR_ASSESSMENT' | 'COMPLETED' | 'CANCELLED';

export interface MyCourseSummary {
  total: number;
  notStarted: number;
  inProgress: number;
  readyForAssessment: number;
  completed: number;
  overdue: number;
}

export interface MyTaskSummary {
  total: number;
  toDo: number;
  pendingReview: number;
  needsRevision: number;
  passed: number;
  failed: number;
  overdue: number;
}

export interface MyAssessmentSummary {
  total: number;
  available: number;
  inProgress: number;
  passed: number;
  retake: number;
  locked: number;
}

export interface MyContinueLearning {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  status: EnrollmentStatus;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  nextLessonId?: string | null;
  nextLessonTitle?: string | null;
  dueDate?: string | null;
  isOverdue: boolean;
}

export interface MyDeadline {
  kind: 'COURSE' | 'TASK';
  targetId: string;
  title: string;
  dueAt: string;
  isOverdue: boolean;
}

export interface MyDashboard {
  employee: MyEmployeeInfo;
  competency: {
    skipReason?: SkillGapSkipReason | null;
    summary?: MyCompetencySummary | null;
    averageCurrentLevel?: number | null;
    averageRequiredLevel?: number | null;
    topGaps: MyCompetencyLine[];
  };
  courses: MyCourseSummary;
  continueLearning?: MyContinueLearning | null;
  tasks: MyTaskSummary;
  activeTasks: MyTaskCard[];
  assessments: MyAssessmentSummary;
  nextAssessment?: MyAssessmentCard | null;
  validCertificates: number;
  upcomingDeadlines: MyDeadline[];
}

// ── EM-02 / EM-03 Năng lực ────────────────────────────────────────────────────

export interface MyProfileCompetency extends MyCompetencyLine {
  confirmedEvidenceCount: number;
  pendingEvidenceCount: number;
}

export interface MyCompetencyProfile {
  employee: MyEmployeeInfo;
  requirementSet?: { id: string; versionNo: number; effectiveFrom?: string | null; activatedAt?: string | null } | null;
  skipReason?: SkillGapSkipReason | null;
  summary?: MyCompetencySummary | null;
  items: MyProfileCompetency[];
  otherConfirmed: MyConfirmedCompetency[];
}

export interface MySuggestedCourse {
  courseId: string;
  code: string;
  title: string;
  targetLevel: number;
  estimatedDurationMinutes?: number | null;
  enrollmentStatus?: EnrollmentStatus | null;
}

export interface MySkillGapLine extends MyCompetencyLine {
  suggestedCourses: MySuggestedCourse[];
}

export interface MySkillGap {
  jobPositionName?: string | null;
  requirementSetVersionNo?: number | null;
  skipReason?: SkillGapSkipReason | null;
  summary?: MyCompetencySummary | null;
  lastSnapshotAt?: string | null;
  calculatedAt: string;
  items: MySkillGapLine[];
}

// ── EM-04 Minh chứng ──────────────────────────────────────────────────────────

export type EvidenceStatus = 'APPROVED' | 'PENDING' | 'NEEDS_REVISION' | 'REJECTED' | 'SUPERSEDED';

export interface MyTaskFile {
  id: string;
  fileName: string;
  contentType?: string | null;
  sizeBytes: number;
}

export interface MyCompetencyResult {
  competencyId: string;
  competencyCode: string;
  competencyName: string;
  targetLevel: number;
  verdict: 'PASSED' | 'NEEDS_REVISION' | 'FAILED';
  score?: number | null;
  levelConfirming: boolean;
  confirmedLevel?: number | null;
  feedback?: string | null;
}

export interface MyTaskEvaluation {
  id: string;
  verdict: 'PASSED' | 'NEEDS_REVISION' | 'FAILED';
  score?: number | null;
  feedback?: string | null;
  reviewerName?: string | null;
  evaluatedAt: string;
  countsAsEvidence: boolean;
  competencyResults: MyCompetencyResult[];
}

export interface MyEvidenceItem {
  id: string;
  kind: 'TASK_SUBMISSION' | 'COMPETENCY_EVIDENCE';
  occurredAt: string;
  title: string;
  status: EvidenceStatus;
  description?: string | null;
  assignmentId?: string | null;
  versionNo?: number | null;
  links: string[];
  files: MyTaskFile[];
  evaluation?: MyTaskEvaluation | null;
  sourceType?: 'PRACTICAL_TASK' | 'MANUAL_OVERRIDE' | 'MIGRATION' | null;
  confirmedLevel?: number | null;
  score?: number | null;
  confirmedByName?: string | null;
  competencies: MyCompetencyRef[];
}

export interface MyEvidenceTimeline {
  items: MyEvidenceItem[];
  counts: { total: number; approved: number; pending: number; needsRevision: number; rejected: number };
}

// ── EM-05 / EM-06 / EM-07 / EM-08 Học tập ─────────────────────────────────────

export interface MyLearningPathStep {
  order: number;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  level: number;
  estimatedDurationMinutes?: number | null;
  source: 'ASSIGNED' | 'SELF_ENROLLED' | 'RECOMMENDED';
  status: EnrollmentStatus | 'RECOMMENDED';
  progressPercent: number;
  dueDate?: string | null;
  isOverdue: boolean;
  assignedByName?: string | null;
  rationale: string;
  recommendationScore?: number | null;
  targetCompetencies: { code: string; name: string; targetLevel: number; currentLevel?: number | null; closesGap: boolean }[];
  prerequisites: MyPrerequisite[];
  canEnroll: boolean;
  warnings: string[];
}

export interface MyLearningPath {
  jobPositionName?: string | null;
  skipReason?: SkillGapSkipReason | null;
  openGapCount: number;
  coveragePercent?: number | null;
  summary: {
    totalSteps: number;
    completedSteps: number;
    inProgressSteps: number;
    recommendedSteps: number;
    totalMinutes: number;
    remainingMinutes: number;
  };
  steps: MyLearningPathStep[];
}

export interface MyCourseCard {
  enrollmentId: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  description?: string | null;
  categoryName?: string | null;
  level: number;
  estimatedDurationMinutes?: number | null;
  status: EnrollmentStatus;
  progressPercent: number;
  totalLessons: number;
  completedLessons: number;
  startedAt?: string | null;
  completedAt?: string | null;
  dueDate?: string | null;
  isOverdue: boolean;
  source: 'ASSIGNED' | 'SELF_ENROLLED';
  assignedByName?: string | null;
  certificateCode?: string | null;
}

export interface MyCourses {
  items: MyCourseCard[];
  summary: MyCourseSummary;
}

export type LessonProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface MyCourseLesson {
  id: string;
  code?: string | null;
  title: string;
  lessonType: string;
  estimatedMinutes?: number | null;
  isRequired: boolean;
  completionRule: string;
  selfCompletable: boolean;
  progressStatus: LessonProgressStatus;
  completedAt?: string | null;
}

export interface MyCourseModule {
  id: string;
  title: string;
  description?: string | null;
  estimatedMinutes?: number | null;
  isRequired: boolean;
  lessons: MyCourseLesson[];
}

export interface MyEnrollment {
  id: string;
  status: EnrollmentStatus;
  progressPercent: number;
  startedAt?: string | null;
  completedAt?: string | null;
  dueDate?: string | null;
  isOverdue: boolean;
  source: 'ASSIGNED' | 'SELF_ENROLLED';
  assignedByName?: string | null;
}

export interface MyCourseDetail {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  purpose?: string | null;
  level: number;
  entryLevel?: number | null;
  estimatedDurationMinutes?: number | null;
  certificateEnabled: boolean;
  certificateValidityDays?: number | null;
  categoryName?: string | null;
  competencies: MyCompetencyRef[];
  outcomes: { code: string; statement: string; outcomeType: string; targetLevel: number }[];
  prerequisites: MyPrerequisite[];
  enrollment?: MyEnrollment | null;
  modules: MyCourseModule[];
  totalLessons: number;
  completedLessons: number;
  nextLessonId?: string | null;
  assessments: MyAssessmentCard[];
  canEnroll: boolean;
  enrollBlockedReason?: string | null;
  certificate?: MyCertificateRef | null;
}

export interface MyLearningMaterial {
  id: string;
  title: string;
  materialType: 'FILE' | 'LINK';
  externalUrl?: string | null;
  fileName?: string | null;
  sizeBytes?: number | null;
  isRequired: boolean;
}

export interface MyLesson {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  moduleId: string;
  moduleTitle: string;
  id: string;
  code?: string | null;
  title: string;
  lessonType: string;
  contentBody?: string | null;
  estimatedMinutes?: number | null;
  isRequired: boolean;
  completionRule: string;
  selfCompletable: boolean;
  materials: MyLearningMaterial[];
  progressStatus: LessonProgressStatus;
  completedAt?: string | null;
  lessonIndex: number;
  totalLessons: number;
  prevLessonId?: string | null;
  nextLessonId?: string | null;
  enrollmentStatus: EnrollmentStatus;
  courseProgressPercent: number;
}

export interface CompleteLessonResult {
  lessonId: string;
  lessonStatus: LessonProgressStatus;
  courseProgressPercent: number;
  enrollmentStatus: EnrollmentStatus;
  nextLessonId?: string | null;
  readyForAssessment: boolean;
  finalAssessmentId?: string | null;
}

// ── EM-09..EM-13 Đánh giá ─────────────────────────────────────────────────────

export type MyAssessmentStatus = 'AVAILABLE' | 'IN_PROGRESS' | 'PASSED' | 'RETAKE' | 'LOCKED' | 'NO_ATTEMPTS_LEFT';
export type AssessmentType = 'PRACTICE' | 'QUIZ' | 'FINAL';

export interface MyAssessmentCard {
  id: string;
  code: string;
  title: string;
  assessmentType: AssessmentType;
  isFinal: boolean;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  questionCount: number;
  timeLimitMinutes?: number | null;
  passingScore: number;
  maxAttempts?: number | null;
  attemptsUsed: number;
  /** null = không giới hạn số lần làm */
  attemptsRemaining?: number | null;
  bestScore?: number | null;
  latestScore?: number | null;
  latestAttemptId?: string | null;
  passed: boolean;
  status: MyAssessmentStatus;
  lockedReason?: string | null;
  inProgressAttemptId?: string | null;
  inProgressDeadline?: string | null;
  inProgressExpired: boolean;
  canStart: boolean;
}

export interface MyAssessments {
  items: MyAssessmentCard[];
  summary: MyAssessmentSummary;
}

export interface MyAssessmentDetail extends MyAssessmentCard {
  totalPoints: number;
  competencies: MyCompetencyRef[];
  attempts: {
    id: string;
    attemptNo: number;
    status: 'STARTED' | 'SUBMITTED' | 'SCORED';
    startedAt: string;
    submittedAt?: string | null;
    score?: number | null;
    passed?: boolean | null;
  }[];
}

export interface MyQuestionOption {
  id: string;
  content: string;
}

export interface MyAttemptSession {
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  assessmentType: AssessmentType;
  isFinal: boolean;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  attemptNo: number;
  status: 'STARTED' | 'SUBMITTED' | 'SCORED';
  startedAt: string;
  /** null = không giới hạn thời gian */
  deadline?: string | null;
  serverNow: string;
  timeLimitMinutes?: number | null;
  passingScore: number;
  questions: { id: string; text: string; questionType: string; points: number; options: MyQuestionOption[] }[];
  /** questionId → optionId đã lưu trên server */
  answers: Record<string, string | null>;
}

export interface MyAttemptResult {
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  assessmentType: AssessmentType;
  isFinal: boolean;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  attemptNo: number;
  startedAt: string;
  submittedAt?: string | null;
  durationSeconds: number;
  autoSubmitted: boolean;
  score: number;
  passingScore: number;
  passed: boolean;
  earnedPoints: number;
  totalPoints: number;
  correctCount: number;
  totalQuestions: number;
  attemptsRemaining?: number | null;
  canRetake: boolean;
  revealAnswers: boolean;
  courseCompleted: boolean;
  certificate?: MyCertificateRef | null;
  questions: {
    id: string;
    text: string;
    options: MyQuestionOption[];
    selectedOptionId?: string | null;
    correctOptionId?: string | null;
    isCorrect: boolean;
    points: number;
    pointsAwarded: number;
    explanation?: string | null;
    competencyCode?: string | null;
    competencyName?: string | null;
  }[];
}

export interface MyAttemptHistoryRow {
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  assessmentType: AssessmentType;
  isFinal: boolean;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  attemptNo: number;
  status: 'STARTED' | 'SUBMITTED' | 'SCORED';
  startedAt: string;
  submittedAt?: string | null;
  durationSeconds: number;
  score?: number | null;
  passingScore: number;
  passed?: boolean | null;
  correctCount: number;
  totalQuestions: number;
}

export interface AttemptHistoryParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  passed?: boolean;
  assessmentId?: string;
}

// ── EM-14..EM-17 Nhiệm vụ ─────────────────────────────────────────────────────

export type TaskAssignmentStatus = 'ASSIGNED' | 'SUBMITTED' | 'NEEDS_REVISION' | 'PASSED' | 'FAILED';
export type SubmissionDisplayStatus = 'PENDING_REVIEW' | 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED' | 'SUPERSEDED';

export interface MyTaskSubmission {
  id: string;
  versionNo: number;
  status: SubmissionDisplayStatus;
  submittedAt: string;
  note?: string | null;
  links: string[];
  files: MyTaskFile[];
  evaluation?: MyTaskEvaluation | null;
}

export interface MyTaskCard {
  assignmentId: string;
  title: string;
  description: string;
  expectedOutput: string;
  status: TaskAssignmentStatus;
  isOverdue: boolean;
  canSubmit: boolean;
  assignedAt: string;
  dueAt?: string | null;
  assignedByName?: string | null;
  reviewerName?: string | null;
  courseTitle?: string | null;
  targetLevel: number;
  targets: MyCompetencyRef[];
  submissionCount: number;
  latestSubmission?: MyTaskSubmission | null;
}

export interface MyTasks {
  items: MyTaskCard[];
  summary: MyTaskSummary;
}

export interface RubricCriterion {
  id: string;
  label: string;
  description?: string | null;
  maxPoints: number;
}

export interface MyTaskDetail extends MyTaskCard {
  rubric: RubricCriterion[];
  submissions: MyTaskSubmission[];
  maxAttachmentBytes: number;
  maxAttachments: number;
  allowedExtensions: string[];
}

export interface SubmitTaskPayload {
  content: string;
  linkUrls: string[];
  attachmentIds: string[];
}

export interface SubmitTaskResult {
  assignmentId: string;
  submissionId: string;
  versionNo: number;
  submittedAt: string;
  assignmentStatus: TaskAssignmentStatus;
}

// ── EM-18 Thành tựu ───────────────────────────────────────────────────────────

export interface MyCertificate {
  id: string;
  certificateCode: string;
  holderName: string;
  courseId?: string | null;
  courseTitle: string;
  primaryCompetency?: string | null;
  issuedAt: string;
  expiresAt?: string | null;
  status: 'VALID' | 'EXPIRED' | 'REVOKED';
  revocationReason?: string | null;
  score?: number | null;
}

export interface MyAchievements {
  stats: {
    validCertificates: number;
    completedCourses: number;
    passedAssessments: number;
    approvedTasks: number;
    confirmedCompetencies: number;
  };
  certificates: MyCertificate[];
  confirmedCompetencies: MyConfirmedCompetency[];
  milestones: {
    kind: 'CERTIFICATE_ISSUED' | 'COURSE_COMPLETED' | 'ASSESSMENT_PASSED' | 'TASK_APPROVED' | 'COMPETENCY_CONFIRMED';
    title: string;
    detail?: string | null;
    occurredAt: string;
  }[];
}

// ── API ───────────────────────────────────────────────────────────────────────

export const meService = {
  getDashboard: () => apiClient.get<ApiResponse<MyDashboard>>('/me/dashboard'),
  getCompetencyProfile: () => apiClient.get<ApiResponse<MyCompetencyProfile>>('/me/competency-profile'),
  getSkillGap: () => apiClient.get<ApiResponse<MySkillGap>>('/me/skill-gap'),
  getEvidence: () => apiClient.get<ApiResponse<MyEvidenceTimeline>>('/me/evidence'),
  getLearningPath: () => apiClient.get<ApiResponse<MyLearningPath>>('/me/learning-path'),
  getAchievements: () => apiClient.get<ApiResponse<MyAchievements>>('/me/achievements'),

  getCourses: () => apiClient.get<ApiResponse<MyCourses>>('/me/courses'),
  getCourse: (courseId: string) => apiClient.get<ApiResponse<MyCourseDetail>>(`/me/courses/${courseId}`),
  enroll: (courseId: string) =>
    apiClient.post<ApiResponse<{ enrollmentId: string; courseId: string; status: EnrollmentStatus }>>(`/me/courses/${courseId}/enroll`),
  getLesson: (courseId: string, lessonId: string) =>
    apiClient.get<ApiResponse<MyLesson>>(`/me/courses/${courseId}/lessons/${lessonId}`),
  startLesson: (courseId: string, lessonId: string) =>
    apiClient.post<ApiResponse<{ lessonStatus: LessonProgressStatus; enrollmentStatus: EnrollmentStatus }>>(
      `/me/courses/${courseId}/lessons/${lessonId}/start`),
  completeLesson: (courseId: string, lessonId: string) =>
    apiClient.post<ApiResponse<CompleteLessonResult>>(`/me/courses/${courseId}/lessons/${lessonId}/complete`),
  downloadMaterial: (courseId: string, lessonId: string, materialId: string) =>
    apiClient.get<Blob>(`/me/courses/${courseId}/lessons/${lessonId}/materials/${materialId}/download`, { responseType: 'blob' })
      .then((response) => response.data),

  getAssessments: () => apiClient.get<ApiResponse<MyAssessments>>('/me/assessments'),
  getAssessment: (assessmentId: string) => apiClient.get<ApiResponse<MyAssessmentDetail>>(`/me/assessments/${assessmentId}`),
  startAttempt: (assessmentId: string) =>
    apiClient.post<ApiResponse<MyAttemptSession>>(`/me/assessments/${assessmentId}/attempts`),
  getAttemptSession: (attemptId: string) =>
    apiClient.get<ApiResponse<MyAttemptSession>>(`/me/assessment-attempts/${attemptId}`),
  saveAnswers: (attemptId: string, answers: Record<string, string | null>) =>
    apiClient.put<ApiResponse<{ savedCount: number; deadline?: string | null; serverNow: string }>>(
      `/me/assessment-attempts/${attemptId}/answers`, { answers }),
  submitAttempt: (attemptId: string, answers: Record<string, string | null>) =>
    apiClient.post<ApiResponse<MyAttemptResult>>(`/me/assessment-attempts/${attemptId}/submit`, { answers }),
  getAttemptResult: (attemptId: string) =>
    apiClient.get<ApiResponse<MyAttemptResult>>(`/me/assessment-attempts/${attemptId}/result`),
  getAttemptHistory: (params: AttemptHistoryParams) =>
    apiClient.get<ApiResponse<PagedList<MyAttemptHistoryRow>>>('/me/assessment-attempts', { params }),

  getTasks: () => apiClient.get<ApiResponse<MyTasks>>('/me/tasks'),
  getTask: (assignmentId: string) => apiClient.get<ApiResponse<MyTaskDetail>>(`/me/tasks/${assignmentId}`),
  submitTask: (assignmentId: string, payload: SubmitTaskPayload) =>
    apiClient.post<ApiResponse<SubmitTaskResult>>(`/me/tasks/${assignmentId}/submissions`, payload),
  uploadAttachment: (assignmentId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient
      .post<ApiResponse<MyTaskFile>>(`/me/tasks/${assignmentId}/attachments`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  downloadAttachment: (assignmentId: string, fileId: string) =>
    apiClient.get<Blob>(`/me/tasks/${assignmentId}/attachments/${fileId}`, { responseType: 'blob' }).then((response) => response.data),
};
