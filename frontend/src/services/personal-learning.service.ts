import apiClient from './api-client';
import type { ApiResponse } from '../types/api';
import type { DomainRequirementSummary } from '../lib/reference-positions';
import type { AccessMode, SeenKey, TrialChecklistItem } from '../lib/personal-access';

export type { AccessMode, SeenKey, TrialChecklistItem } from '../lib/personal-access';

/**
 * Personal workspace (/personal/*): target position, entry assessment, skill gap, learning path, courses,
 * practical tasks and certificates of an individual learner. Built on the same Circular 02/2025 catalog as the
 * enterprise portal (6 domains, 24 competencies, 18 standard F/I/A courses chained by prerequisites).
 * In mock mode (VITE_USE_MOCK=true) the mock server answers (services/mock/server/handlers/personal.ts).
 */

export type GapSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export interface PersonalTarget {
  code: string;
  name: string;
  description: string;
  /** Competencies the position requires, out of 24. */
  requiredCount: number;
  domains: DomainRequirementSummary[];
  selectedAt?: string;
}

export interface PersonalDomainLevel {
  number: number;
  name: string;
  /** Highest level the target asks in the domain (0 = nothing required). */
  required: number;
  /** Lowest current level among the domain's required competencies (or the domain level when none). */
  current: number;
  /** Required competencies of the domain still below their level. */
  gapCount: number;
}

export interface PersonalCompetencyGap {
  code: string;
  name: string;
  domainNumber: number;
  domainName: string;
  requiredLevel: number;
  currentLevel: number;
  gapSteps: number;
  mandatory: boolean;
  severity: GapSeverity | null;
  /** Where the current level comes from ("Đánh giá đầu vào", a course title), when there is one. */
  source?: string;
}

export interface PersonalSkillGap {
  target: PersonalTarget | null;
  assessed: boolean;
  coveragePercent: number;
  totalRequired: number;
  totalMet: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  domains: PersonalDomainLevel[];
  items: PersonalCompetencyGap[];
}

export type PathCourseStatus = 'COMPLETED' | 'IN_PROGRESS' | 'AVAILABLE' | 'LOCKED';

export interface PathCourse {
  id: string;
  code: string;
  title: string;
  domainNumber: number;
  domainName: string;
  level: number;
  durationMinutes: number;
  lessonCount: number;
  completedLessons: number;
  progressPercent: number;
  status: PathCourseStatus;
  prerequisiteTitle?: string;
  /** Competency codes ("2.4") the course raises toward the target. */
  closes: string[];
  /** The plan will not open its lessons (trial slots used up, or the Free plan). Not the same as LOCKED. */
  planLocked: boolean;
  /** The course uses one of the learner's trial slots. */
  trialSlot: boolean;
}

export interface PathStage {
  level: number;
  title: string;
  courses: PathCourse[];
}

export interface ExemptCourse {
  id: string;
  code: string;
  title: string;
  level: number;
}

export interface PersonalPath {
  target: PersonalTarget | null;
  assessed: boolean;
  stages: PathStage[];
  /** Courses below the level already reached: skipped. */
  exempt: ExemptCourse[];
  totalCourses: number;
  completedCourses: number;
  minutesLeft: number;
  progressPercent: number;
  nextCourse: PathCourse | null;
}

export interface DiagnosticQuestion {
  id: string;
  domainNumber: number;
  domainName: string;
  competencyCode: string;
  level: number;
  text: string;
  options: string[];
}

export interface DiagnosticReview {
  questionId: string;
  chosenIndex: number | null;
  correctIndex: number;
  explanation: string;
}

export interface DiagnosticDomainResult {
  number: number;
  name: string;
  level: number;
  correct: number;
  total: number;
}

export interface DiagnosticResult {
  completedAt: string;
  correct: number;
  total: number;
  scorePercent: number;
  domains: DiagnosticDomainResult[];
  review: DiagnosticReview[];
}

export interface PersonalDiagnostic {
  target: PersonalTarget | null;
  questions: DiagnosticQuestion[];
  result: DiagnosticResult | null;
  /** How the learner did in the no-account quick try, when they signed up from it. */
  tryOrientation: { correct: number; total: number } | null;
}

export type LessonKind = 'VIDEO' | 'READING' | 'PRACTICE';

export interface PersonalLesson {
  id: string;
  title: string;
  kind: LessonKind;
  durationMinutes: number;
  completed: boolean;
  summary: string;
  body: string[];
  takeaways: string[];
  practice?: string;
}

export interface PersonalModule {
  id: string;
  competencyCode: string;
  title: string;
  lessons: PersonalLesson[];
}

export type TaskStatus = 'LOCKED' | 'OPEN' | 'PENDING_REVIEW' | 'REVISION_REQUESTED' | 'APPROVED';

export interface TaskSubmission {
  linkUrl: string;
  content: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  reviewedAt?: string;
}

export interface PersonalTask {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  domainName: string;
  level: number;
  title: string;
  brief: string;
  deliverable: string;
  rubric: string[];
  competencyCodes: string[];
  status: TaskStatus;
  submission?: TaskSubmission;
}

export interface CourseAssessmentSummary {
  questionCount: number;
  passPercent: number;
  attempts: number;
  bestScore: number | null;
  passed: boolean;
}

export interface PersonalCourseDetail {
  id: string;
  code: string;
  title: string;
  domainNumber: number;
  domainName: string;
  level: number;
  entryLevel: number;
  durationMinutes: number;
  description: string;
  outcomes: string[];
  prerequisite: { id: string; title: string; satisfied: boolean } | null;
  status: PathCourseStatus;
  inPath: boolean;
  exempt: boolean;
  planLocked: boolean;
  trialSlot: boolean;
  modules: PersonalModule[];
  lessonCount: number;
  completedLessons: number;
  progressPercent: number;
  competencies: { code: string; name: string; currentLevel: number; requiredLevel: number }[];
  assessment: CourseAssessmentSummary;
  notes: string;
  task: PersonalTask | null;
}

export interface AssessmentQuestion {
  id: string;
  competencyCode: string;
  text: string;
  options: string[];
  correctOptionIndex?: number;
}


export interface CourseAssessment {
  courseId: string;
  courseTitle: string;
  passPercent: number;
  ready: boolean;
  questions: AssessmentQuestion[];
}

export interface AssessmentOutcome {
  scorePercent: number;
  correct: number;
  total: number;
  passed: boolean;
  review: DiagnosticReview[];
  certificateId: string | null;
  /** Passed, but the certificate waits for an upgrade (trial or Free plan). */
  certificatePending: boolean;
}

export type CertificateStatus = 'ISSUED' | 'PENDING_UPGRADE';

export interface PersonalCertificate {
  id: string;
  status: CertificateStatus;
  /** Null while the certificate is pending. */
  code: string | null;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  level: number;
  domainName: string;
  competencies: { code: string; name: string }[];
  recipientName: string;
  passedAt: string;
  /** Null while the certificate is pending. */
  issuedAt: string | null;
  scorePercent: number;
}

/** What the learner's plan allows right now, and the trial guidance state (spec §7.4). */
export interface PersonalAccess {
  mode: AccessMode;
  planName: string;
  trialEndsAt: string | null;
  /** Calendar days left in the trial; null outside a trial. */
  daysLeft: number | null;
  courseLimit: number | null;
  trialCourseIds: string[];
  coursesLeft: number | null;
  diagnosticAvailable: boolean;
  reassessAvailableAt: string | null;
  targetChangesLeft: number | null;
  pendingCertificates: number;
  /** Empty with the full plan. */
  checklist: TrialChecklistItem[];
  seen: Record<string, string>;
}

export type ActivityKind = 'TARGET' | 'DIAGNOSTIC' | 'LESSON' | 'ASSESSMENT' | 'TASK' | 'CERTIFICATE';

export interface PersonalActivity {
  id: string;
  at: string;
  kind: ActivityKind;
  title: string;
  detail?: string;
}

export interface ContinueLesson {
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  progressPercent: number;
}

export interface PersonalOverview {
  fullName: string;
  target: PersonalTarget | null;
  assessed: boolean;
  coveragePercent: number;
  gapCount: number;
  domains: PersonalDomainLevel[];
  path: { progressPercent: number; completedCourses: number; totalCourses: number; minutesLeft: number };
  nextCourse: PathCourse | null;
  continueLesson: ContinueLesson | null;
  learnedMinutes: number;
  certificateCount: number;
  openTaskCount: number;
  activity: PersonalActivity[];
}

export interface ProfileCompetency {
  code: string;
  name: string;
  level: number;
  requiredLevel: number;
  source: string | null;
  at: string | null;
}

export interface PersonalMilestone {
  id: string;
  title: string;
  description: string;
  achievedAt: string | null;
}

export interface PersonalProgress {
  learnedMinutes: number;
  lessonsCompleted: number;
  assessmentsPassed: number;
  tasksApproved: number;
  coveragePercent: number;
  profile: { number: number; name: string; items: ProfileCompetency[] }[];
  milestones: PersonalMilestone[];
  activity: PersonalActivity[];
}

export interface SubmitTaskInput {
  linkUrl: string;
  content: string;
}

const BASE = '/personal';

const data = <T>(request: Promise<{ data: ApiResponse<T> }>) => request.then((res) => res.data.data as T);

export const personalLearningService = {
  getOverview: () => data<PersonalOverview>(apiClient.get(`${BASE}/overview`)),
  setTarget: (positionCode: string) => data<PersonalTarget>(apiClient.put(`${BASE}/target`, { positionCode })),
  getSkillGap: () => data<PersonalSkillGap>(apiClient.get(`${BASE}/skill-gap`)),
  getDiagnostic: () => data<PersonalDiagnostic>(apiClient.get(`${BASE}/diagnostic`)),
  submitDiagnostic: (answers: Record<string, number>) =>
    data<DiagnosticResult>(apiClient.post(`${BASE}/diagnostic`, { answers })),
  getPath: () => data<PersonalPath>(apiClient.get(`${BASE}/path`)),
  getCourse: (id: string) => data<PersonalCourseDetail>(apiClient.get(`${BASE}/courses/${id}`)),
  setLessonCompleted: (courseId: string, lessonId: string, completed: boolean) =>
    data<PersonalCourseDetail>(apiClient.put(`${BASE}/courses/${courseId}/lessons/${lessonId}`, { completed })),
  saveNotes: (courseId: string, notes: string) =>
    data<{ notes: string }>(apiClient.put(`${BASE}/courses/${courseId}/notes`, { notes })),
  getAssessment: (courseId: string) => data<CourseAssessment>(apiClient.get(`${BASE}/courses/${courseId}/assessment`)),
  submitAssessment: (courseId: string, answers: Record<string, number>) =>
    data<AssessmentOutcome>(apiClient.post(`${BASE}/courses/${courseId}/assessment`, { answers })),
  getTasks: () => data<PersonalTask[]>(apiClient.get(`${BASE}/tasks`)),
  submitTask: (taskId: string, input: SubmitTaskInput) =>
    data<PersonalTask>(apiClient.post(`${BASE}/tasks/${taskId}/submissions`, input)),
  getCertificates: () => data<PersonalCertificate[]>(apiClient.get(`${BASE}/certificates`)),
  verifyCertificate: (code: string) => data<PersonalCertificate>(apiClient.get(`${BASE}/certificates/verify/${code}`)),
  getProgress: () => data<PersonalProgress>(apiClient.get(`${BASE}/progress`)),
  getAccess: () => data<PersonalAccess>(apiClient.get(`${BASE}/access`)),
  /** Marks a UI hint as seen. Answers the learner's whole `seen` record. */
  markSeen: (key: SeenKey) => data<Record<string, string>>(apiClient.put(`${BASE}/seen/${key}`)),
};

