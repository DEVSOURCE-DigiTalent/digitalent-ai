import type { SessionUser } from '../../../../types/session';
import { getCourseAssessment, getCourseModules, type LessonItem } from '../../../../features/learning/data/course-content';
import type {
  CompleteLessonResult, EnrollmentStatus, MyAchievements, MyAssessmentCard, MyAssessmentDetail, MyAssessments,
  MyAttemptHistoryRow, MyAttemptResult, MyAttemptSession, MyCertificate, MyCertificateRef, MyCompetencyLine,
  MyCompetencyProfile, MyCompetencyRef, MyCompetencySummary, MyConfirmedCompetency, MyCourseCard, MyCourseDetail,
  MyCourses, MyCourseSummary, MyDashboard, MyDeadline, MyEmployeeInfo, MyEnrollment, MyEvidenceItem,
  MyEvidenceTimeline, MyLearningPath, MyLearningPathStep, MyLesson, MyPrerequisite, MySkillGap, MyTaskCard,
  MyTaskDetail, MyTaskEvaluation, MyTaskFile, MyTasks, MyTaskSubmission, MyTaskSummary, SkillGapSkipReason,
  SubmitTaskResult, TaskAssignmentStatus,
} from '../../../me.service';
import { newId } from '../../mock-store';
import { CATEGORY_BY_ID, COMPETENCIES, COMPETENCY_BY_ID, COURSES, COURSE_BY_ID, type CatalogCourse } from '../catalog';
import { computeSkillGapItems, recommendCourses, summarize } from '../engine';
import { badRequest, conflict, forbidden, matchesSearch, notFound, paginate, pageRequest } from '../http';
import { activeRequirementSet, currentLevels, enrollmentsFor, latestRun, skillGapBlocker, toRequirementLines } from '../org-logic';
import { route } from '../router';
import type {
  AssessmentAttemptRecord, AssignmentRecord, CertificateRecord, EmployeeRecord, OpenAttemptRecord, OrgData,
  PracticalTaskRecord, TaskSubmissionRecord,
} from '../types';
import { recordAudit } from './audit';

/**
 * Trang cá nhân EM-01..EM-18 (api/v1/me/*): chỉ dữ liệu của chính người đăng nhập. Mô phỏng
 * Application/UseCases/Me của backend trên dữ liệu mock: khóa học chuẩn, bài đánh giá cuối khóa,
 * nhiệm vụ thực tế và hồ sơ năng lực. Đạt bài cuối khóa → hoàn thành khóa + cấp chứng chỉ, không nâng cấp độ
 * năng lực (quy tắc D).
 */

const SELF_ENROLLED = 'Tự đăng ký';
const MAX_ATTEMPTS = 3;
const SUBMIT_GRACE_MS = 30_000;
const TOP_GAPS = 5;
const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;
const MAX_ATTACHMENTS = 10;
const MAX_LINKS = 10;
const CONTENT_MIN_LENGTH = 20;
const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.zip', '.mp4',
];
const URL_PATTERN = /^https?:\/\/\S+$/i;

const NO_EMPLOYEE_PROFILE = 'Tài khoản của bạn chưa được gắn hồ sơ nhân viên. Vui lòng liên hệ quản trị viên.';
const NOT_ENROLLED = 'Bạn cần ghi danh khóa học trước khi học bài này.';
const FINAL_LOCKED = 'Hoàn thành các bài học bắt buộc của khóa để mở bài đánh giá cuối khóa.';
const NO_ATTEMPTS_LEFT = 'Bạn đã dùng hết số lần làm bài cho phép của bài đánh giá này.';
const NO_FILE_CONTENT = 'Bản mô phỏng không lưu nội dung tệp.';

const nowIso = () => new Date().toISOString();
const round2 = (value: number) => Math.round(value * 100) / 100;
const isPast = (date: string | null | undefined) => Boolean(date) && new Date(date!).getTime() < Date.now();

// ── Người đăng nhập ──────────────────────────────────────────────────────────

function myEmployee(data: OrgData, session: SessionUser): EmployeeRecord {
  const employee = data.employees.find(
    (e) => e.status !== 'ARCHIVED'
      && (e.userId === session.id || (e.workEmail && e.workEmail.toLowerCase() === session.email?.toLowerCase())),
  );
  if (!employee) throw forbidden(NO_EMPLOYEE_PROFILE);
  return employee;
}

function employeeInfo(data: OrgData, employee: EmployeeRecord): MyEmployeeInfo {
  const department = data.departments.find((d) => d.id === employee.departmentId);
  const position = data.positions.find((p) => p.id === employee.jobPositionId);
  const managerId = employee.directManagerId
    ?? (department?.managerEmployeeId !== employee.id ? department?.managerEmployeeId : undefined);
  return {
    id: employee.id,
    fullName: employee.fullName,
    employeeCode: employee.employeeCode,
    workEmail: employee.workEmail ?? null,
    departmentName: department?.name ?? null,
    jobPositionName: position?.name ?? null,
    jobFamilyName: data.jobFamilies.find((f) => f.id === position?.jobFamilyId)?.name ?? null,
    managerName: data.employees.find((e) => e.id === managerId)?.fullName ?? null,
    joinedAt: employee.joinedAt ?? null,
  };
}

// ── Năng lực ─────────────────────────────────────────────────────────────────

interface CompetencySnapshot {
  skipReason: SkillGapSkipReason | null;
  requirementSet?: { id: string; versionNo: number; effectiveFrom?: string | null; activatedAt?: string | null };
  lines: MyCompetencyLine[];
  summary: MyCompetencySummary | null;
}

function competencySnapshot(data: OrgData, employee: EmployeeRecord): CompetencySnapshot {
  const blocker = skillGapBlocker(data, employee.id);
  if (blocker) return { skipReason: blocker, lines: [], summary: null };

  const set = activeRequirementSet(data, employee.jobPositionId)!;
  const items = computeSkillGapItems(toRequirementLines(set), currentLevels(data, employee.id));
  const profile = data.profiles[employee.id] ?? {};
  const requirement = new Map(set.items.map((item) => [item.competencyId, item]));
  const lines = items.map((item): MyCompetencyLine => ({
    competencyId: item.competencyId,
    competencyCode: item.competencyCode,
    competencyName: item.competencyName,
    categoryName: item.categoryName,
    requiredLevel: item.requiredLevel,
    currentLevel: item.currentLevel,
    confirmedAt: profile[item.competencyId]?.confirmedAt ?? null,
    gapSteps: item.gapSteps,
    severity: item.severity,
    mandatory: item.mandatory,
    weightPercent: item.weightPercent,
    requiresPracticalEvidence: requirement.get(item.competencyId)?.requiresPracticalEvidence ?? false,
    note: requirement.get(item.competencyId)?.note ?? null,
    priorityScore: item.priorityScore,
    status: item.gapSteps === 0 ? 'MET' : item.currentLevel ? 'GAP' : 'NOT_CONFIRMED',
  }));
  const { config: _config, ...summary } = summarize(items);
  return {
    skipReason: null,
    requirementSet: { id: set.id, versionNo: set.versionNo, effectiveFrom: set.effectiveFrom ?? null, activatedAt: set.activatedAt ?? null },
    lines,
    summary,
  };
}

function confirmedCompetencies(data: OrgData, employee: EmployeeRecord): MyConfirmedCompetency[] {
  return Object.entries(data.profiles[employee.id] ?? {})
    .filter(([id, entry]) => entry.level > 0 && COMPETENCY_BY_ID.has(id))
    .map(([id, entry]) => {
      const competency = COMPETENCY_BY_ID.get(id)!;
      return {
        competencyId: id,
        competencyCode: competency.code,
        competencyName: competency.name,
        categoryName: CATEGORY_BY_ID.get(competency.categoryId)?.name ?? null,
        level: entry.level,
        confirmedAt: entry.confirmedAt,
      };
    })
    .sort((a, b) => a.competencyCode.localeCompare(b.competencyCode, undefined, { numeric: true }));
}

// ── Khóa học, bài học, tiến độ ───────────────────────────────────────────────

function publishedCourse(courseId: string): CatalogCourse {
  const course = COURSE_BY_ID.get(courseId);
  if (!course || course.status !== 'PUBLISHED') throw notFound('Không tìm thấy khóa học.');
  return course;
}

function courseContent(course: CatalogCourse) {
  const modules = getCourseModules(course.id, course.code, course.title, course.modules);
  return { modules, lessons: modules.flatMap((m) => m.lessons) };
}

function enrollmentOf(data: OrgData, employee: EmployeeRecord, courseId: string): AssignmentRecord | undefined {
  return data.assignments.filter((a) => a.employeeId === employee.id && a.courseId === courseId && a.status !== 'CANCELLED').at(-1);
}

function myEnrollments(data: OrgData, employee: EmployeeRecord): AssignmentRecord[] {
  return data.assignments.filter((a) => a.employeeId === employee.id && a.status !== 'CANCELLED' && COURSE_BY_ID.has(a.courseId));
}

/** Bài đã học; lượt giao cũ chỉ có % tiến độ thì coi như học xong các bài đầu tiên tương ứng. */
function completedLessonIds(assignment: AssignmentRecord, lessons: LessonItem[]): string[] {
  if (assignment.completedLessonIds) return assignment.completedLessonIds;
  if (assignment.status === 'COMPLETED' || assignment.status === 'READY_FOR_ASSESSMENT') return lessons.map((l) => l.id);
  return lessons.slice(0, Math.floor(((assignment.progressPercent ?? 0) / 100) * lessons.length)).map((l) => l.id);
}

const percentOf = (done: number, total: number) => (total === 0 ? 0 : Math.round((done / total) * 100));

const isOpenEnrollment = (a: AssignmentRecord) => a.status !== 'COMPLETED' && a.status !== 'CANCELLED';
const enrollmentOverdue = (a: AssignmentRecord) => isOpenEnrollment(a) && isPast(a.dueDate);
const enrollmentSource = (a: AssignmentRecord): MyEnrollment['source'] => (a.assignedByName === SELF_ENROLLED ? 'SELF_ENROLLED' : 'ASSIGNED');

function toEnrollment(a: AssignmentRecord): MyEnrollment {
  return {
    id: a.id,
    status: a.status as EnrollmentStatus,
    progressPercent: a.progressPercent ?? 0,
    startedAt: a.startedAt ?? null,
    completedAt: a.completedAt ?? null,
    dueDate: a.dueDate ?? null,
    isOverdue: enrollmentOverdue(a),
    source: enrollmentSource(a),
    assignedByName: a.assignedByName === SELF_ENROLLED ? null : a.assignedByName,
  };
}

function prerequisitesOf(data: OrgData, employee: EmployeeRecord, course: CatalogCourse): MyPrerequisite[] {
  if (!course.prerequisiteCourseId) return [];
  const before = COURSE_BY_ID.get(course.prerequisiteCourseId);
  if (!before) return [];
  return [{ courseId: before.id, code: before.code, title: before.title, completed: enrollmentOf(data, employee, before.id)?.status === 'COMPLETED' }];
}

function enrollBlockedReason(data: OrgData, employee: EmployeeRecord, course: CatalogCourse): string | null {
  if (employee.status !== 'ACTIVE') return 'Hồ sơ nhân viên của bạn không ở trạng thái hoạt động.';
  const existing = enrollmentOf(data, employee, course.id);
  if (existing?.status === 'COMPLETED') return 'Bạn đã hoàn thành khóa học này.';
  if (existing) return 'Bạn đã ghi danh khóa học này.';
  const missing = prerequisitesOf(data, employee, course).filter((p) => !p.completed).map((p) => p.code);
  return missing.length ? `Cần hoàn thành khóa tiên quyết trước: ${missing.join(', ')}.` : null;
}

function courseSummary(enrollments: AssignmentRecord[]): MyCourseSummary {
  const count = (status: string) => enrollments.filter((a) => a.status === status).length;
  return {
    total: enrollments.length,
    notStarted: count('NOT_STARTED'),
    inProgress: count('IN_PROGRESS'),
    readyForAssessment: count('READY_FOR_ASSESSMENT'),
    completed: count('COMPLETED'),
    overdue: enrollments.filter(enrollmentOverdue).length,
  };
}

function certificateOf(data: OrgData, employee: EmployeeRecord, courseId: string): CertificateRecord | undefined {
  return (data.certificates ?? []).filter((c) => c.employeeId === employee.id && c.courseId === courseId).at(-1);
}

function certificateStatus(c: CertificateRecord): MyCertificate['status'] {
  if (c.status === 'REVOKED') return 'REVOKED';
  return isPast(c.expiryDate) ? 'EXPIRED' : 'VALID';
}

function certificateRef(c: CertificateRecord | undefined): MyCertificateRef | null {
  return c ? { id: c.id, code: c.certificateCode, issuedAt: c.issueDate, expiresAt: c.expiryDate ?? null, status: certificateStatus(c) } : null;
}

function lessonBody(lesson: LessonItem): string {
  const parts = [`## Mục tiêu bài học`, lesson.objective, '', ...lesson.content];
  if (lesson.keyTakeaways.length) parts.push('', '## Ý chính cần nhớ', ...lesson.keyTakeaways.map((k) => `- ${k}`));
  if (lesson.practiceTask) parts.push('', '## Thực hành', lesson.practiceTask);
  return parts.join('\n');
}

/** Cập nhật tiến độ sau khi học xong một bài: đủ bài → sẵn sàng làm bài cuối khóa. */
function recalculate(assignment: AssignmentRecord, lessons: LessonItem[], now: string) {
  if (assignment.status === 'COMPLETED') return;
  const done = completedLessonIds(assignment, lessons).length;
  assignment.progressPercent = percentOf(done, lessons.length);
  assignment.startedAt = assignment.startedAt ?? now;
  assignment.status = done >= lessons.length ? 'READY_FOR_ASSESSMENT' : 'IN_PROGRESS';
}

// ── Bài đánh giá ─────────────────────────────────────────────────────────────

const optionId = (questionId: string, index: number) => `${questionId}-o${index}`;
const optionIndex = (id: string | null | undefined) => (id ? Number(id.split('-o').at(-1)) : -1);

function assessmentOf(course: CatalogCourse) {
  return getCourseAssessment(course.id, course.code, course.title);
}

function courseOfAssessment(assessmentId: string): CatalogCourse {
  const course = COURSES.find((c) => c.status === 'PUBLISHED' && assessmentOf(c).id === assessmentId);
  if (!course) throw notFound('Không tìm thấy bài đánh giá.');
  return course;
}

function attemptsOf(data: OrgData, employee: EmployeeRecord, assessmentId: string): AssessmentAttemptRecord[] {
  return (data.attempts ?? [])
    .filter((a) => a.employeeId === employee.id && a.assessmentId === assessmentId)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
}

function openAttemptOf(data: OrgData, employee: EmployeeRecord, assessmentId: string): OpenAttemptRecord | undefined {
  return (data.openAttempts ?? []).find((a) => a.employeeId === employee.id && a.assessmentId === assessmentId);
}

const attemptExpired = (open: OpenAttemptRecord) => Date.now() > new Date(open.deadline).getTime();

function assessmentCard(data: OrgData, employee: EmployeeRecord, course: CatalogCourse, enrollment: AssignmentRecord): MyAssessmentCard {
  const assessment = assessmentOf(course);
  const scored = attemptsOf(data, employee, assessment.id);
  const open = openAttemptOf(data, employee, assessment.id);
  const used = scored.length + (open ? 1 : 0);
  const remaining = Math.max(0, MAX_ATTEMPTS - used);
  const passed = scored.some((a) => a.passed);
  const { lessons } = courseContent(course);
  const ready = enrollment.status === 'COMPLETED' || completedLessonIds(enrollment, lessons).length >= lessons.length;

  let status: MyAssessmentCard['status'];
  let lockedReason: string | null = null;
  if (passed) status = 'PASSED';
  else if (open) status = 'IN_PROGRESS';
  else if (!ready) {
    status = 'LOCKED';
    lockedReason = FINAL_LOCKED;
  } else if (remaining === 0) {
    status = 'NO_ATTEMPTS_LEFT';
    lockedReason = NO_ATTEMPTS_LEFT;
  } else status = scored.length ? 'RETAKE' : 'AVAILABLE';

  const latest = scored.at(-1);
  return {
    id: assessment.id,
    code: `${course.code}-FINAL`,
    title: `Bài đánh giá cuối khóa ${course.code}: ${course.title}`,
    assessmentType: 'FINAL',
    isFinal: true,
    courseId: course.id,
    courseCode: course.code,
    courseTitle: course.title,
    questionCount: assessment.questions.length,
    timeLimitMinutes: assessment.timeLimitMinutes,
    passingScore: assessment.passPercentage,
    maxAttempts: MAX_ATTEMPTS,
    attemptsUsed: used,
    attemptsRemaining: remaining,
    bestScore: scored.length ? Math.max(...scored.map((a) => a.score)) : null,
    latestScore: latest?.score ?? null,
    latestAttemptId: latest?.id ?? null,
    passed,
    status,
    lockedReason,
    inProgressAttemptId: open?.id ?? null,
    inProgressDeadline: open?.deadline ?? null,
    inProgressExpired: open ? attemptExpired(open) : false,
    canStart: status === 'AVAILABLE' || status === 'RETAKE' || status === 'IN_PROGRESS',
  };
}

function myAssessmentCards(data: OrgData, employee: EmployeeRecord): MyAssessmentCard[] {
  return myEnrollments(data, employee)
    .map((enrollment) => assessmentCard(data, employee, COURSE_BY_ID.get(enrollment.courseId)!, enrollment))
    .filter((card) => card.questionCount > 0);
}

function assessmentSummary(cards: MyAssessmentCard[]) {
  const count = (status: MyAssessmentCard['status']) => cards.filter((c) => c.status === status).length;
  return {
    total: cards.length,
    available: count('AVAILABLE'),
    inProgress: count('IN_PROGRESS'),
    passed: count('PASSED'),
    retake: count('RETAKE'),
    locked: count('LOCKED') + count('NO_ATTEMPTS_LEFT'),
  };
}

/** Bài cuối khóa của một khóa đã ghi danh; khóa chưa ghi danh thì không thấy bài. */
function visibleAssessment(data: OrgData, employee: EmployeeRecord, assessmentId: string) {
  const course = courseOfAssessment(assessmentId);
  const enrollment = enrollmentOf(data, employee, course.id);
  if (!enrollment) throw notFound('Không tìm thấy bài đánh giá.');
  return { course, enrollment, assessment: assessmentOf(course) };
}

function findOpenAttempt(data: OrgData, employee: EmployeeRecord, attemptId: string): OpenAttemptRecord | undefined {
  return (data.openAttempts ?? []).find((a) => a.id === attemptId && a.employeeId === employee.id);
}

function findScoredAttempt(data: OrgData, employee: EmployeeRecord, attemptId: string): AssessmentAttemptRecord | undefined {
  return (data.attempts ?? []).find((a) => a.id === attemptId && a.employeeId === employee.id);
}

function sessionOf(open: OpenAttemptRecord): MyAttemptSession {
  const course = COURSE_BY_ID.get(open.courseId)!;
  const assessment = assessmentOf(course);
  return {
    attemptId: open.id,
    assessmentId: assessment.id,
    assessmentTitle: `Bài đánh giá cuối khóa ${course.code}: ${course.title}`,
    assessmentType: 'FINAL',
    isFinal: true,
    courseId: course.id,
    courseCode: course.code,
    courseTitle: course.title,
    attemptNo: open.attemptNo,
    status: 'STARTED',
    startedAt: open.startedAt,
    deadline: open.deadline,
    serverNow: nowIso(),
    timeLimitMinutes: assessment.timeLimitMinutes,
    passingScore: assessment.passPercentage,
    questions: assessment.questions.map((q) => ({
      id: q.id,
      text: q.questionText,
      questionType: 'MULTIPLE_CHOICE',
      points: 1,
      options: q.options.map((content, index) => ({ id: optionId(q.id, index), content })),
    })),
    answers: { ...open.answers },
  };
}

function resultOf(data: OrgData, employee: EmployeeRecord, attempt: AssessmentAttemptRecord): MyAttemptResult {
  const course = COURSE_BY_ID.get(attempt.courseId)!;
  const assessment = assessmentOf(course);
  const all = attemptsOf(data, employee, assessment.id);
  const open = openAttemptOf(data, employee, assessment.id);
  const remaining = Math.max(0, MAX_ATTEMPTS - all.length - (open ? 1 : 0));
  const passedAny = all.some((a) => a.passed);
  const revealAnswers = attempt.passed || remaining === 0;
  const selected = new Map(attempt.answers.map((a) => [a.questionId, a.selectedOptionIndex]));
  const enrollment = enrollmentOf(data, employee, course.id);
  return {
    attemptId: attempt.id,
    assessmentId: assessment.id,
    assessmentTitle: `Bài đánh giá cuối khóa ${course.code}: ${course.title}`,
    assessmentType: 'FINAL',
    isFinal: true,
    courseId: course.id,
    courseCode: course.code,
    courseTitle: course.title,
    attemptNo: all.findIndex((a) => a.id === attempt.id) + 1,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    durationSeconds: attempt.durationSeconds,
    autoSubmitted: attempt.autoSubmitted ?? false,
    score: attempt.score,
    passingScore: assessment.passPercentage,
    passed: attempt.passed,
    earnedPoints: attempt.correctAnswers,
    totalPoints: attempt.totalQuestions,
    correctCount: attempt.correctAnswers,
    totalQuestions: attempt.totalQuestions,
    attemptsRemaining: remaining,
    canRetake: !passedAny && remaining > 0 && !open,
    revealAnswers,
    courseCompleted: enrollment?.status === 'COMPLETED',
    certificate: attempt.passed ? certificateRef(certificateOf(data, employee, course.id)) : null,
    questions: assessment.questions.map((q) => {
      const index = selected.get(q.id) ?? -1;
      const isCorrect = index === q.correctOptionIndex;
      const competency = COMPETENCIES.find((c) => c.frameworkCode === q.competencyCode);
      return {
        id: q.id,
        text: q.questionText,
        options: q.options.map((content, i) => ({ id: optionId(q.id, i), content })),
        selectedOptionId: index >= 0 ? optionId(q.id, index) : null,
        correctOptionId: revealAnswers ? optionId(q.id, q.correctOptionIndex) : null,
        isCorrect,
        points: 1,
        pointsAwarded: isCorrect ? 1 : 0,
        explanation: revealAnswers ? q.explanation : null,
        competencyCode: competency?.code ?? q.competencyCode,
        competencyName: competency?.name ?? null,
      };
    }),
  };
}

/** Chấm lượt làm bài; hết giờ thì chỉ chấm các câu đã lưu. Đạt → hoàn thành khóa + cấp chứng chỉ. */
function finalize(
  data: OrgData,
  session: SessionUser,
  employee: EmployeeRecord,
  open: OpenAttemptRecord,
  answers: Record<string, string | null> | undefined,
): AssessmentAttemptRecord {
  const now = nowIso();
  const lateBy = Date.now() - new Date(open.deadline).getTime();
  const autoSubmitted = lateBy > 0;
  const finalAnswers = answers && lateBy <= SUBMIT_GRACE_MS ? { ...open.answers, ...answers } : open.answers;
  const course = COURSE_BY_ID.get(open.courseId)!;
  const assessment = assessmentOf(course);

  const results = assessment.questions.map((q) => {
    const index = optionIndex(finalAnswers[q.id]);
    return { questionId: q.id, selectedOptionIndex: index, isCorrect: index === q.correctOptionIndex };
  });
  const correct = results.filter((r) => r.isCorrect).length;
  const score = round2((correct / Math.max(1, assessment.questions.length)) * 100);
  const passed = score >= assessment.passPercentage;
  const submittedAt = autoSubmitted ? open.deadline : now;

  const attempt: AssessmentAttemptRecord = {
    id: open.id,
    assessmentId: assessment.id,
    courseId: course.id,
    courseTitle: course.title,
    employeeId: employee.id,
    employeeName: employee.fullName,
    score,
    totalQuestions: assessment.questions.length,
    correctAnswers: correct,
    passed,
    startedAt: open.startedAt,
    submittedAt,
    durationSeconds: Math.max(0, Math.round((new Date(submittedAt).getTime() - new Date(open.startedAt).getTime()) / 1000)),
    answers: results,
    autoSubmitted,
  };
  data.openAttempts = (data.openAttempts ?? []).filter((a) => a.id !== open.id);
  data.attempts = [...(data.attempts ?? []), attempt];

  const enrollment = enrollmentOf(data, employee, course.id);
  if (passed && enrollment && enrollment.status !== 'COMPLETED') {
    enrollment.status = 'COMPLETED';
    enrollment.progressPercent = 100;
    enrollment.completedAt = now;
    if (!certificateOf(data, employee, course.id)) {
      const certificate: CertificateRecord = {
        id: newId('cert'),
        certificateCode: `DT-${new Date().getFullYear()}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`,
        employeeId: employee.id,
        employeeName: employee.fullName,
        employeeCode: employee.employeeCode,
        courseId: course.id,
        courseTitle: course.title,
        courseLevel: course.level,
        frameworkCompetencyCodes: COMPETENCIES.filter((c) => c.categoryId === course.categoryId).map((c) => c.frameworkCode),
        issueDate: now,
        score,
        status: 'ACTIVE',
      };
      data.certificates = [...(data.certificates ?? []), certificate];
      recordAudit(data, session, 'CERTIFICATE_ISSUED', 'Chứng nhận', certificate.certificateCode, `${employee.fullName}, điểm ${score}%`);
    }
  }
  return attempt;
}

// ── Nhiệm vụ ─────────────────────────────────────────────────────────────────

type SubmissionVersion = Omit<TaskSubmissionRecord, 'id' | 'taskId' | 'employeeId' | 'employeeName' | 'previousVersions'> & { id: string };

function myTasks(data: OrgData, employee: EmployeeRecord): PracticalTaskRecord[] {
  return (data.tasks ?? [])
    .filter((t) => t.status === 'ACTIVE' && t.assignedEmployeeIds.includes(employee.id))
    .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt));
}

function myTask(data: OrgData, employee: EmployeeRecord, taskId: string): PracticalTaskRecord {
  const task = myTasks(data, employee).find((t) => t.id === taskId);
  if (!task) throw notFound('Không tìm thấy nhiệm vụ được giao cho bạn.');
  return task;
}

function submissionOf(data: OrgData, employee: EmployeeRecord, taskId: string): TaskSubmissionRecord | undefined {
  return (data.submissions ?? []).find((s) => s.taskId === taskId && s.employeeId === employee.id);
}

/** Các phiên bản bài nộp, mới nhất trước. */
function versionsOf(submission: TaskSubmissionRecord | undefined): (SubmissionVersion & { versionNo: number })[] {
  if (!submission) return [];
  const previous = (submission.previousVersions ?? []).map((v, i) => ({ ...v, id: `${submission.id}-v${i + 1}` }));
  return [...previous, submission].map((v, i) => ({ ...v, versionNo: i + 1 })).reverse();
}

function assignmentStatus(submission: TaskSubmissionRecord | undefined): TaskAssignmentStatus {
  switch (submission?.status) {
    case undefined: return 'ASSIGNED';
    case 'APPROVED': return 'PASSED';
    case 'REJECTED': return 'FAILED';
    case 'REVISION_REQUESTED': return 'NEEDS_REVISION';
    default: return 'SUBMITTED';
  }
}

function fileOf(data: OrgData, ref: string): MyTaskFile {
  const stored = (data.taskFiles ?? []).find((f) => f.id === ref);
  return stored
    ? { id: stored.id, fileName: stored.fileName, contentType: stored.contentType ?? null, sizeBytes: stored.sizeBytes }
    : { id: ref, fileName: ref.split('/').at(-1) ?? ref, contentType: null, sizeBytes: 0 };
}

const VERDICT = { APPROVED: 'PASSED', REVISION_REQUESTED: 'NEEDS_REVISION', REJECTED: 'FAILED' } as const;

function evaluationOf(task: PracticalTaskRecord, version: SubmissionVersion): MyTaskEvaluation | null {
  const evaluation = version.evaluation;
  if (!evaluation) return null;
  const verdict = VERDICT[evaluation.decision];
  return {
    id: `${version.id}-eval`,
    verdict,
    score: evaluation.score,
    feedback: evaluation.feedback,
    reviewerName: evaluation.evaluatedBy,
    evaluatedAt: evaluation.evaluatedAt,
    countsAsEvidence: verdict === 'PASSED',
    competencyResults: task.competencyIds.filter((id) => COMPETENCY_BY_ID.has(id)).map((id) => {
      const competency = COMPETENCY_BY_ID.get(id)!;
      return {
        competencyId: id,
        competencyCode: competency.code,
        competencyName: competency.name,
        targetLevel: task.targetLevel,
        verdict,
        score: evaluation.score,
        levelConfirming: verdict === 'PASSED',
        confirmedLevel: verdict === 'PASSED' ? task.targetLevel : null,
        feedback: null,
      };
    }),
  };
}

function toSubmission(data: OrgData, task: PracticalTaskRecord, version: SubmissionVersion & { versionNo: number }, latest: boolean): MyTaskSubmission {
  const evaluation = evaluationOf(task, version);
  const status: MyTaskSubmission['status'] = evaluation
    ? (evaluation.verdict === 'PASSED' ? 'APPROVED' : evaluation.verdict === 'FAILED' ? 'REJECTED' : 'NEEDS_REVISION')
    : latest ? 'PENDING_REVIEW' : 'SUPERSEDED';
  return {
    id: version.id,
    versionNo: version.versionNo,
    status,
    submittedAt: version.submittedAt,
    note: version.content,
    links: version.linkUrls ?? [],
    files: (version.fileUrls ?? []).map((ref) => fileOf(data, ref)),
    evaluation,
  };
}

function targetsOf(task: PracticalTaskRecord): MyCompetencyRef[] {
  return task.competencyIds.filter((id) => COMPETENCY_BY_ID.has(id)).map((id) => {
    const competency = COMPETENCY_BY_ID.get(id)!;
    return { competencyId: id, code: competency.code, name: competency.name, targetLevel: task.targetLevel };
  });
}

function taskCard(data: OrgData, employee: EmployeeRecord, task: PracticalTaskRecord): MyTaskCard & { submissions: MyTaskSubmission[] } {
  const submission = submissionOf(data, employee, task.id);
  const status = assignmentStatus(submission);
  const canSubmit = status === 'ASSIGNED' || status === 'NEEDS_REVISION';
  const submissions = versionsOf(submission).map((v, i) => toSubmission(data, task, v, i === 0));
  return {
    assignmentId: task.id,
    title: task.title,
    description: task.description,
    expectedOutput: task.expectedOutput,
    status,
    isOverdue: canSubmit && isPast(task.dueDate),
    canSubmit,
    assignedAt: task.assignedAt,
    dueAt: task.dueDate ?? null,
    assignedByName: task.assignedByName,
    reviewerName: task.assignedByName,
    courseTitle: null,
    targetLevel: task.targetLevel,
    targets: targetsOf(task),
    submissionCount: submissions.length,
    latestSubmission: submissions[0] ?? null,
    submissions,
  };
}

function taskSummary(cards: MyTaskCard[]): MyTaskSummary {
  const count = (status: TaskAssignmentStatus) => cards.filter((c) => c.status === status).length;
  return {
    total: cards.length,
    toDo: cards.filter((c) => c.canSubmit).length,
    pendingReview: count('SUBMITTED'),
    needsRevision: count('NEEDS_REVISION'),
    passed: count('PASSED'),
    failed: count('FAILED'),
    overdue: cards.filter((c) => c.isOverdue).length,
  };
}

const withoutSubmissions = ({ submissions: _submissions, ...card }: MyTaskCard & { submissions: MyTaskSubmission[] }): MyTaskCard => card;

// ── EM-01..EM-05, EM-18: phát triển cá nhân ──────────────────────────────────

route('GET', '/me/dashboard', ({ org, session }): MyDashboard => {
  const data = org();
  const employee = myEmployee(data, session);
  const snapshot = competencySnapshot(data, employee);
  const enrollments = myEnrollments(data, employee);
  const tasks = myTasks(data, employee).map((t) => withoutSubmissions(taskCard(data, employee, t)));
  const assessments = myAssessmentCards(data, employee);
  const lines = snapshot.lines;
  const average = (pick: (l: MyCompetencyLine) => number) => (lines.length ? round2(lines.reduce((s, l) => s + pick(l), 0) / lines.length) : null);

  const open = enrollments
    .filter(isOpenEnrollment)
    .sort((a, b) => (a.status === 'IN_PROGRESS' ? -1 : 0) - (b.status === 'IN_PROGRESS' ? -1 : 0) || (a.dueDate ?? '9').localeCompare(b.dueDate ?? '9'));
  let continueLearning: MyDashboard['continueLearning'] = null;
  if (open[0]) {
    const course = COURSE_BY_ID.get(open[0].courseId)!;
    const { lessons } = courseContent(course);
    const done = new Set(completedLessonIds(open[0], lessons));
    const next = lessons.find((l) => !done.has(l.id));
    continueLearning = {
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      status: open[0].status as EnrollmentStatus,
      progressPercent: open[0].progressPercent ?? 0,
      completedLessons: done.size,
      totalLessons: lessons.length,
      nextLessonId: next?.id ?? null,
      nextLessonTitle: next?.title ?? null,
      dueDate: open[0].dueDate ?? null,
      isOverdue: enrollmentOverdue(open[0]),
    };
  }

  const deadlines: MyDeadline[] = [
    ...open.filter((a) => a.dueDate).map((a) => ({
      kind: 'COURSE' as const, targetId: a.courseId, title: COURSE_BY_ID.get(a.courseId)!.title, dueAt: a.dueDate!, isOverdue: enrollmentOverdue(a),
    })),
    ...tasks.filter((t) => t.canSubmit && t.dueAt).map((t) => ({
      kind: 'TASK' as const, targetId: t.assignmentId, title: t.title, dueAt: t.dueAt!, isOverdue: t.isOverdue,
    })),
  ].sort((a, b) => a.dueAt.localeCompare(b.dueAt)).slice(0, 5);

  return {
    employee: employeeInfo(data, employee),
    competency: {
      skipReason: snapshot.skipReason,
      summary: snapshot.summary,
      averageCurrentLevel: average((l) => l.currentLevel ?? 0),
      averageRequiredLevel: average((l) => l.requiredLevel),
      topGaps: lines.filter((l) => l.gapSteps > 0).sort((a, b) => b.priorityScore - a.priorityScore).slice(0, TOP_GAPS),
    },
    courses: courseSummary(enrollments),
    continueLearning,
    tasks: taskSummary(tasks),
    activeTasks: tasks.filter((t) => t.canSubmit || t.status === 'SUBMITTED').slice(0, 3),
    assessments: assessmentSummary(assessments),
    nextAssessment: assessments.find((a) => a.status === 'IN_PROGRESS') ?? assessments.find((a) => a.status === 'AVAILABLE' || a.status === 'RETAKE') ?? null,
    validCertificates: (data.certificates ?? []).filter((c) => c.employeeId === employee.id && certificateStatus(c) === 'VALID').length,
    upcomingDeadlines: deadlines,
  };
});

route('GET', '/me/competency-profile', ({ org, session }): MyCompetencyProfile => {
  const data = org();
  const employee = myEmployee(data, session);
  const snapshot = competencySnapshot(data, employee);
  const submissions = (data.submissions ?? []).filter((s) => s.employeeId === employee.id);
  const evidenceCount = (competencyId: string, statuses: TaskSubmissionRecord['status'][]) =>
    submissions.filter((s) => statuses.includes(s.status) && (data.tasks ?? []).find((t) => t.id === s.taskId)?.competencyIds.includes(competencyId)).length;
  const required = new Set(snapshot.lines.map((l) => l.competencyId));
  return {
    employee: employeeInfo(data, employee),
    requirementSet: snapshot.requirementSet ?? null,
    skipReason: snapshot.skipReason,
    summary: snapshot.summary,
    items: snapshot.lines.map((line) => ({
      ...line,
      confirmedEvidenceCount: evidenceCount(line.competencyId, ['APPROVED']),
      pendingEvidenceCount: evidenceCount(line.competencyId, ['PENDING_REVIEW']),
    })),
    otherConfirmed: confirmedCompetencies(data, employee).filter((c) => !required.has(c.competencyId)),
  };
});

route('GET', '/me/skill-gap', ({ org, session }): MySkillGap => {
  const data = org();
  const employee = myEmployee(data, session);
  const snapshot = competencySnapshot(data, employee);
  return {
    jobPositionName: data.positions.find((p) => p.id === employee.jobPositionId)?.name ?? null,
    requirementSetVersionNo: snapshot.requirementSet?.versionNo ?? null,
    skipReason: snapshot.skipReason,
    summary: snapshot.summary,
    lastSnapshotAt: latestRun(data, employee.id)?.generatedAt ?? null,
    calculatedAt: nowIso(),
    items: snapshot.lines.map((line) => {
      const competency = COMPETENCY_BY_ID.get(line.competencyId)!;
      const from = line.currentLevel ?? 0;
      return {
        ...line,
        suggestedCourses: line.gapSteps === 0 ? [] : COURSES
          .filter((c) => c.status === 'PUBLISHED' && c.categoryId === competency.categoryId && c.level > from && c.level <= line.requiredLevel)
          .sort((a, b) => a.level - b.level)
          .map((c) => ({
            courseId: c.id,
            code: c.code,
            title: c.title,
            targetLevel: c.level,
            estimatedDurationMinutes: c.estimatedDurationMinutes,
            enrollmentStatus: (enrollmentOf(data, employee, c.id)?.status as EnrollmentStatus | undefined) ?? null,
          })),
      };
    }),
  };
});

route('GET', '/me/evidence', ({ org, session }): MyEvidenceTimeline => {
  const data = org();
  const employee = myEmployee(data, session);
  const items: MyEvidenceItem[] = [];

  for (const task of (data.tasks ?? []).filter((t) => t.assignedEmployeeIds.includes(employee.id))) {
    const versions = versionsOf(submissionOf(data, employee, task.id));
    versions.forEach((version, index) => {
      const submission = toSubmission(data, task, version, index === 0);
      const status: MyEvidenceItem['status'] = submission.status === 'PENDING_REVIEW' ? 'PENDING' : submission.status;
      items.push({
        id: version.id,
        kind: 'TASK_SUBMISSION',
        occurredAt: version.submittedAt,
        title: task.title,
        status,
        description: version.content,
        assignmentId: task.id,
        versionNo: version.versionNo,
        links: submission.links,
        files: submission.files,
        evaluation: submission.evaluation,
        sourceType: null,
        confirmedLevel: null,
        score: submission.evaluation?.score ?? null,
        confirmedByName: null,
        competencies: targetsOf(task),
      });
    });
  }

  for (const [competencyId, entry] of Object.entries(data.profiles[employee.id] ?? {})) {
    const competency = COMPETENCY_BY_ID.get(competencyId);
    if (!competency || entry.level <= 0) continue;
    items.push({
      id: `ev-${employee.id}-${competencyId}`,
      kind: 'COMPETENCY_EVIDENCE',
      occurredAt: entry.confirmedAt,
      title: `Xác nhận ${competency.code} ${competency.name} ở mức ${entry.level}`,
      status: 'APPROVED',
      description: entry.note ?? null,
      links: [],
      files: [],
      sourceType: entry.source === 'TASK' ? 'PRACTICAL_TASK' : entry.source === 'MIGRATION' ? 'MIGRATION' : 'MANUAL_OVERRIDE',
      confirmedLevel: entry.level,
      score: null,
      confirmedByName: null,
      competencies: [{ competencyId, code: competency.code, name: competency.name, targetLevel: entry.level }],
    });
  }

  items.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const count = (status: MyEvidenceItem['status']) => items.filter((i) => i.status === status).length;
  return {
    items,
    counts: { total: items.length, approved: count('APPROVED'), pending: count('PENDING'), needsRevision: count('NEEDS_REVISION'), rejected: count('REJECTED') },
  };
});

route('GET', '/me/learning-path', ({ org, session }): MyLearningPath => {
  const data = org();
  const employee = myEmployee(data, session);
  const snapshot = competencySnapshot(data, employee);
  const lines = snapshot.lines;

  const targetCompetencies = (course: CatalogCourse) => lines
    .filter((l) => COMPETENCY_BY_ID.get(l.competencyId)?.categoryId === course.categoryId)
    .map((l) => ({
      code: l.competencyCode,
      name: l.competencyName,
      targetLevel: Math.min(course.level, l.requiredLevel),
      currentLevel: l.currentLevel ?? null,
      closesGap: l.gapSteps > 0 && (l.currentLevel ?? 0) < course.level,
    }));

  const enrolledSteps = myEnrollments(data, employee).map((a): MyLearningPathStep => {
    const course = COURSE_BY_ID.get(a.courseId)!;
    const prerequisites = prerequisitesOf(data, employee, course);
    const warnings = [
      ...(enrollmentOverdue(a) ? ['Đã quá hạn hoàn thành.'] : []),
      ...prerequisites.filter((p) => !p.completed).map((p) => `Nên hoàn thành khóa tiên quyết ${p.code} trước.`),
    ];
    return {
      order: 0,
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      level: course.level,
      estimatedDurationMinutes: course.estimatedDurationMinutes,
      source: enrollmentSource(a),
      status: a.status as EnrollmentStatus,
      progressPercent: a.progressPercent ?? 0,
      dueDate: a.dueDate ?? null,
      isOverdue: enrollmentOverdue(a),
      assignedByName: a.assignedByName === SELF_ENROLLED ? null : a.assignedByName,
      rationale: a.assignedByName === SELF_ENROLLED
        ? 'Bạn tự ghi danh khóa học này.'
        : a.source === 'RECOMMENDATION'
          ? `Được ${a.assignedByName} giao để bù khoảng trống năng lực theo vị trí việc làm.`
          : `Được ${a.assignedByName} giao trực tiếp.`,
      recommendationScore: null,
      targetCompetencies: targetCompetencies(course),
      prerequisites,
      canEnroll: false,
      warnings,
    };
  });

  const enrolledIds = new Set(enrolledSteps.map((s) => s.courseId));
  const gapItems = snapshot.skipReason
    ? []
    : computeSkillGapItems(toRequirementLines(activeRequirementSet(data, employee.jobPositionId)!), currentLevels(data, employee.id));
  const recommendedSteps = recommendCourses(gapItems, enrollmentsFor(data, employee.id))
    .filter((r) => !enrolledIds.has(r.courseId) && COURSE_BY_ID.get(r.courseId)?.status === 'PUBLISHED')
    .map((r): MyLearningPathStep => {
      const course = COURSE_BY_ID.get(r.courseId)!;
      const blocked = enrollBlockedReason(data, employee, course);
      return {
        order: 0,
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        level: course.level,
        estimatedDurationMinutes: course.estimatedDurationMinutes,
        source: 'RECOMMENDED',
        status: 'RECOMMENDED',
        progressPercent: 0,
        dueDate: null,
        isOverdue: false,
        assignedByName: null,
        rationale: `Gợi ý để bù khoảng trống năng lực: ${r.reasons
          .map((reason) => `${COMPETENCY_BY_ID.get(reason.competencyId)?.code ?? ''} ${reason.competencyName} (mức ${reason.currentLevel ?? 0} → ${reason.courseTargetLevel})`.trim())
          .join('; ')}.`,
        recommendationScore: r.score,
        targetCompetencies: targetCompetencies(course),
        prerequisites: prerequisitesOf(data, employee, course),
        canEnroll: blocked === null,
        warnings: blocked ? [blocked] : [],
      };
    });

  // Khóa tiên quyết (cùng có trong lộ trình) đứng trước khóa phụ thuộc.
  const all = [...enrolledSteps, ...recommendedSteps];
  const byCode = new Map(all.map((s) => [s.courseCode, s]));
  const ordered: MyLearningPathStep[] = [];
  const visit = (step: MyLearningPathStep, seen = new Set<string>()) => {
    if (ordered.includes(step) || seen.has(step.courseCode)) return;
    seen.add(step.courseCode);
    step.prerequisites.forEach((p) => {
      const before = byCode.get(p.code);
      if (before) visit(before, seen);
    });
    ordered.push(step);
  };
  all.forEach((step) => visit(step));
  ordered.forEach((step, index) => { step.order = index + 1; });

  const minutes = (s: MyLearningPathStep) => s.estimatedDurationMinutes ?? 0;
  return {
    jobPositionName: data.positions.find((p) => p.id === employee.jobPositionId)?.name ?? null,
    skipReason: snapshot.skipReason,
    openGapCount: lines.filter((l) => l.gapSteps > 0).length,
    coveragePercent: snapshot.summary?.coveragePercent ?? null,
    summary: {
      totalSteps: ordered.length,
      completedSteps: ordered.filter((s) => s.status === 'COMPLETED').length,
      inProgressSteps: ordered.filter((s) => s.status === 'IN_PROGRESS' || s.status === 'READY_FOR_ASSESSMENT').length,
      recommendedSteps: ordered.filter((s) => s.status === 'RECOMMENDED').length,
      totalMinutes: ordered.reduce((sum, s) => sum + minutes(s), 0),
      remainingMinutes: ordered.reduce((sum, s) => sum + (s.status === 'COMPLETED' ? 0 : Math.round(minutes(s) * (1 - s.progressPercent / 100))), 0),
    },
    steps: ordered,
  };
});

route('GET', '/me/achievements', ({ org, session }): MyAchievements => {
  const data = org();
  const employee = myEmployee(data, session);
  const certificates = (data.certificates ?? [])
    .filter((c) => c.employeeId === employee.id)
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate))
    .map((c): MyCertificate => ({
      id: c.id,
      certificateCode: c.certificateCode,
      holderName: c.employeeName,
      courseId: c.courseId,
      courseTitle: c.courseTitle,
      primaryCompetency: CATEGORY_BY_ID.get(COURSE_BY_ID.get(c.courseId)?.categoryId ?? '')?.name ?? null,
      issuedAt: c.issueDate,
      expiresAt: c.expiryDate ?? null,
      status: certificateStatus(c),
      revocationReason: null,
      score: c.score,
    }));
  const confirmed = confirmedCompetencies(data, employee);
  const enrollments = myEnrollments(data, employee);
  const attempts = (data.attempts ?? []).filter((a) => a.employeeId === employee.id && a.passed);
  const approved = (data.submissions ?? []).filter((s) => s.employeeId === employee.id && s.status === 'APPROVED');
  const profile = data.profiles[employee.id] ?? {};

  const milestones: MyAchievements['milestones'] = [
    ...certificates.map((c) => ({ kind: 'CERTIFICATE_ISSUED' as const, title: `Nhận chứng chỉ ${c.certificateCode}`, detail: c.courseTitle, occurredAt: c.issuedAt })),
    ...enrollments.filter((a) => a.status === 'COMPLETED' && a.completedAt).map((a) => ({
      kind: 'COURSE_COMPLETED' as const, title: `Hoàn thành khóa ${COURSE_BY_ID.get(a.courseId)!.code}`, detail: COURSE_BY_ID.get(a.courseId)!.title, occurredAt: a.completedAt!,
    })),
    ...attempts.map((a) => ({ kind: 'ASSESSMENT_PASSED' as const, title: `Đạt bài đánh giá (${a.score}%)`, detail: a.courseTitle, occurredAt: a.submittedAt })),
    ...approved.map((s) => ({
      kind: 'TASK_APPROVED' as const,
      title: 'Nhiệm vụ thực tế được duyệt',
      detail: (data.tasks ?? []).find((t) => t.id === s.taskId)?.title ?? null,
      occurredAt: s.evaluation?.evaluatedAt ?? s.submittedAt,
    })),
    ...confirmed.filter((c) => profile[c.competencyId]?.source !== 'MIGRATION').map((c) => ({
      kind: 'COMPETENCY_CONFIRMED' as const, title: `Xác nhận ${c.competencyCode} ở mức ${c.level}`, detail: c.competencyName, occurredAt: c.confirmedAt,
    })),
  ].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 20);

  return {
    stats: {
      validCertificates: certificates.filter((c) => c.status === 'VALID').length,
      completedCourses: enrollments.filter((a) => a.status === 'COMPLETED').length,
      passedAssessments: new Set(attempts.map((a) => a.assessmentId)).size,
      approvedTasks: approved.length,
      confirmedCompetencies: confirmed.length,
    },
    certificates,
    confirmedCompetencies: confirmed,
    milestones,
  };
});

// ── EM-06..EM-08: khóa học & bài học ─────────────────────────────────────────

route('GET', '/me/courses', ({ org, session }): MyCourses => {
  const data = org();
  const employee = myEmployee(data, session);
  const enrollments = myEnrollments(data, employee);
  const items = enrollments.map((a): MyCourseCard => {
    const course = COURSE_BY_ID.get(a.courseId)!;
    const { lessons } = courseContent(course);
    return {
      enrollmentId: a.id,
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      description: null,
      categoryName: CATEGORY_BY_ID.get(course.categoryId)?.name ?? null,
      level: course.level,
      estimatedDurationMinutes: course.estimatedDurationMinutes,
      status: a.status as EnrollmentStatus,
      progressPercent: a.progressPercent ?? 0,
      totalLessons: lessons.length,
      completedLessons: completedLessonIds(a, lessons).length,
      startedAt: a.startedAt ?? null,
      completedAt: a.completedAt ?? null,
      dueDate: a.dueDate ?? null,
      isOverdue: enrollmentOverdue(a),
      source: enrollmentSource(a),
      assignedByName: a.assignedByName === SELF_ENROLLED ? null : a.assignedByName,
      certificateCode: certificateOf(data, employee, course.id)?.certificateCode ?? null,
    };
  });
  return { items, summary: courseSummary(enrollments) };
});

route('GET', '/me/courses/:courseId', ({ org, params, session }): MyCourseDetail => {
  const data = org();
  const employee = myEmployee(data, session);
  const course = publishedCourse(params.courseId);
  const enrollment = enrollmentOf(data, employee, course.id);
  const { modules, lessons } = courseContent(course);
  const done = new Set(enrollment ? completedLessonIds(enrollment, lessons) : []);
  const blocked = enrollBlockedReason(data, employee, course);
  return {
    id: course.id,
    code: course.code,
    title: course.title,
    description: `Khóa học chuẩn của lĩnh vực "${CATEGORY_BY_ID.get(course.categoryId)?.name}" theo Thông tư 02/2025/TT-BGDĐT.`,
    purpose: null,
    level: course.level,
    entryLevel: course.entryLevel,
    estimatedDurationMinutes: course.estimatedDurationMinutes,
    certificateEnabled: true,
    certificateValidityDays: null,
    categoryName: CATEGORY_BY_ID.get(course.categoryId)?.name ?? null,
    competencies: COMPETENCIES.filter((c) => c.categoryId === course.categoryId)
      .map((c) => ({ competencyId: c.id, code: c.code, name: c.name, targetLevel: course.level })),
    outcomes: modules.map((m, i) => ({ code: `LO${i + 1}`, statement: m.description, outcomeType: 'SKILL', targetLevel: course.level })),
    prerequisites: prerequisitesOf(data, employee, course),
    enrollment: enrollment ? toEnrollment(enrollment) : null,
    modules: modules.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      estimatedMinutes: m.lessons.reduce((sum, l) => sum + l.durationMinutes, 0),
      isRequired: true,
      lessons: m.lessons.map((l) => ({
        id: l.id,
        code: `L${m.moduleNo}.${l.lessonNo}`,
        title: l.title,
        lessonType: 'TEXT',
        estimatedMinutes: l.durationMinutes,
        isRequired: true,
        completionRule: 'MANUAL_COMPLETE',
        selfCompletable: true,
        progressStatus: done.has(l.id) ? 'COMPLETED' : 'NOT_STARTED',
        completedAt: null,
      })),
    })),
    totalLessons: lessons.length,
    completedLessons: done.size,
    nextLessonId: enrollment ? lessons.find((l) => !done.has(l.id))?.id ?? null : null,
    assessments: enrollment ? [assessmentCard(data, employee, course, enrollment)] : [],
    canEnroll: blocked === null,
    enrollBlockedReason: enrollment ? null : blocked,
    certificate: certificateRef(certificateOf(data, employee, course.id)),
  };
});

route('POST', '/me/courses/:courseId/enroll', ({ params, session, update }) => update((data) => {
  const employee = myEmployee(data, session);
  const course = publishedCourse(params.courseId);
  const blocked = enrollBlockedReason(data, employee, course);
  if (blocked) throw conflict(blocked);
  const assignment: AssignmentRecord = {
    id: newId('asg'),
    employeeId: employee.id,
    courseId: course.id,
    assignedByName: SELF_ENROLLED,
    assignedAt: nowIso(),
    source: 'MANUAL',
    status: 'NOT_STARTED',
    progressPercent: 0,
    completedLessonIds: [],
  };
  data.assignments.push(assignment);
  return { enrollmentId: assignment.id, courseId: course.id, status: 'NOT_STARTED' as EnrollmentStatus };
}), { status: 201, message: 'Đã ghi danh khóa học.' });

function enrolledLesson(data: OrgData, employee: EmployeeRecord, courseId: string, lessonId: string) {
  const course = publishedCourse(courseId);
  const { modules, lessons } = courseContent(course);
  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index === -1) throw notFound('Không tìm thấy bài học.');
  const enrollment = enrollmentOf(data, employee, course.id);
  if (!enrollment) throw forbidden(NOT_ENROLLED);
  return { course, modules, lessons, index, lesson: lessons[index], enrollment };
}

route('GET', '/me/courses/:courseId/lessons/:lessonId', ({ org, params, session }): MyLesson => {
  const data = org();
  const employee = myEmployee(data, session);
  const { course, modules, lessons, index, lesson, enrollment } = enrolledLesson(data, employee, params.courseId, params.lessonId);
  const module = modules.find((m) => m.id === lesson.moduleId)!;
  const done = completedLessonIds(enrollment, lessons).includes(lesson.id);
  return {
    courseId: course.id,
    courseCode: course.code,
    courseTitle: course.title,
    moduleId: module.id,
    moduleTitle: module.title,
    id: lesson.id,
    code: `L${module.moduleNo}.${lesson.lessonNo}`,
    title: lesson.title,
    lessonType: 'TEXT',
    contentBody: lessonBody(lesson),
    estimatedMinutes: lesson.durationMinutes,
    isRequired: true,
    completionRule: 'MANUAL_COMPLETE',
    selfCompletable: true,
    materials: [],
    progressStatus: done ? 'COMPLETED' : enrollment.status === 'NOT_STARTED' ? 'NOT_STARTED' : 'IN_PROGRESS',
    completedAt: null,
    lessonIndex: index + 1,
    totalLessons: lessons.length,
    prevLessonId: lessons[index - 1]?.id ?? null,
    nextLessonId: lessons[index + 1]?.id ?? null,
    enrollmentStatus: enrollment.status as EnrollmentStatus,
    courseProgressPercent: enrollment.progressPercent ?? 0,
  };
});

route('POST', '/me/courses/:courseId/lessons/:lessonId/start', ({ params, session, update }) => update((data) => {
  const employee = myEmployee(data, session);
  const { lessons, lesson, enrollment } = enrolledLesson(data, employee, params.courseId, params.lessonId);
  if (enrollment.status === 'NOT_STARTED') {
    enrollment.status = 'IN_PROGRESS';
    enrollment.startedAt = enrollment.startedAt ?? nowIso();
  }
  const done = completedLessonIds(enrollment, lessons).includes(lesson.id);
  return { lessonStatus: done ? 'COMPLETED' : 'IN_PROGRESS', enrollmentStatus: enrollment.status };
}));

route('POST', '/me/courses/:courseId/lessons/:lessonId/complete', ({ params, session, update }) => update((data): CompleteLessonResult => {
  const employee = myEmployee(data, session);
  const { course, lessons, index, lesson, enrollment } = enrolledLesson(data, employee, params.courseId, params.lessonId);
  const done = completedLessonIds(enrollment, lessons);
  if (!done.includes(lesson.id)) enrollment.completedLessonIds = [...done, lesson.id];
  recalculate(enrollment, lessons, nowIso());
  const remaining = new Set(completedLessonIds(enrollment, lessons));
  const ready = enrollment.status === 'READY_FOR_ASSESSMENT';
  return {
    lessonId: lesson.id,
    lessonStatus: 'COMPLETED',
    courseProgressPercent: enrollment.progressPercent,
    enrollmentStatus: enrollment.status as EnrollmentStatus,
    nextLessonId: lessons.slice(index + 1).find((l) => !remaining.has(l.id))?.id ?? lessons.find((l) => !remaining.has(l.id))?.id ?? null,
    readyForAssessment: ready,
    finalAssessmentId: ready ? assessmentOf(course).id : null,
  };
}));

route('GET', '/me/courses/:courseId/lessons/:lessonId/materials/:materialId/download', () => {
  throw notFound(NO_FILE_CONTENT);
});

// ── EM-09..EM-13: bài đánh giá ───────────────────────────────────────────────

route('GET', '/me/assessments', ({ org, session }): MyAssessments => {
  const data = org();
  const employee = myEmployee(data, session);
  const items = myAssessmentCards(data, employee);
  return { items, summary: assessmentSummary(items) };
});

route('GET', '/me/assessments/:assessmentId', ({ org, params, session }): MyAssessmentDetail => {
  const data = org();
  const employee = myEmployee(data, session);
  const { course, enrollment, assessment } = visibleAssessment(data, employee, params.assessmentId);
  const scored = attemptsOf(data, employee, assessment.id);
  const open = openAttemptOf(data, employee, assessment.id);
  return {
    ...assessmentCard(data, employee, course, enrollment),
    totalPoints: assessment.questions.length,
    competencies: COMPETENCIES.filter((c) => c.categoryId === course.categoryId)
      .map((c) => ({ competencyId: c.id, code: c.code, name: c.name, targetLevel: course.level })),
    attempts: [
      ...scored.map((a, i) => ({
        id: a.id, attemptNo: i + 1, status: 'SCORED' as const, startedAt: a.startedAt, submittedAt: a.submittedAt, score: a.score, passed: a.passed,
      })),
      ...(open ? [{ id: open.id, attemptNo: open.attemptNo, status: 'STARTED' as const, startedAt: open.startedAt, submittedAt: null, score: null, passed: null }] : []),
    ].reverse(),
  };
});

route('POST', '/me/assessments/:assessmentId/attempts', ({ params, session, update }) => update((data): MyAttemptSession => {
  const employee = myEmployee(data, session);
  const { course, enrollment, assessment } = visibleAssessment(data, employee, params.assessmentId);
  const open = openAttemptOf(data, employee, assessment.id);
  if (open && !attemptExpired(open)) return sessionOf(open);
  if (open) finalize(data, session, employee, open, undefined);

  const card = assessmentCard(data, employee, course, enrollment);
  if (card.status === 'PASSED') throw conflict('Bạn đã đạt bài đánh giá cuối khóa này.');
  if (card.status === 'LOCKED') throw forbidden(FINAL_LOCKED);
  if (card.status === 'NO_ATTEMPTS_LEFT') throw conflict(NO_ATTEMPTS_LEFT);

  const startedAt = new Date();
  const attempt: OpenAttemptRecord = {
    id: newId('att'),
    assessmentId: assessment.id,
    courseId: course.id,
    employeeId: employee.id,
    attemptNo: card.attemptsUsed + 1,
    startedAt: startedAt.toISOString(),
    deadline: new Date(startedAt.getTime() + assessment.timeLimitMinutes * 60_000).toISOString(),
    answers: {},
  };
  data.openAttempts = [...(data.openAttempts ?? []), attempt];
  if (enrollment.status === 'NOT_STARTED') enrollment.status = 'IN_PROGRESS';
  return sessionOf(attempt);
}), { status: 201 });

route('GET', '/me/assessment-attempts', ({ org, query, session }) => {
  const data = org();
  const employee = myEmployee(data, session);
  const rows: MyAttemptHistoryRow[] = [];
  const byAssessment = new Map<string, number>();
  const scored = (data.attempts ?? []).filter((a) => a.employeeId === employee.id).sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  for (const a of scored) {
    const course = COURSE_BY_ID.get(a.courseId);
    if (!course) continue;
    const no = (byAssessment.get(a.assessmentId) ?? 0) + 1;
    byAssessment.set(a.assessmentId, no);
    rows.push({
      attemptId: a.id,
      assessmentId: a.assessmentId,
      assessmentTitle: `Bài đánh giá cuối khóa ${course.code}: ${course.title}`,
      assessmentType: 'FINAL',
      isFinal: true,
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      attemptNo: no,
      status: 'SCORED',
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
      durationSeconds: a.durationSeconds,
      score: a.score,
      passingScore: assessmentOf(course).passPercentage,
      passed: a.passed,
      correctCount: a.correctAnswers,
      totalQuestions: a.totalQuestions,
    });
  }
  for (const open of (data.openAttempts ?? []).filter((a) => a.employeeId === employee.id)) {
    const course = COURSE_BY_ID.get(open.courseId)!;
    const assessment = assessmentOf(course);
    rows.push({
      attemptId: open.id,
      assessmentId: open.assessmentId,
      assessmentTitle: `Bài đánh giá cuối khóa ${course.code}: ${course.title}`,
      assessmentType: 'FINAL',
      isFinal: true,
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      attemptNo: open.attemptNo,
      status: 'STARTED',
      startedAt: open.startedAt,
      submittedAt: null,
      durationSeconds: 0,
      score: null,
      passingScore: assessment.passPercentage,
      passed: null,
      correctCount: 0,
      totalQuestions: assessment.questions.length,
    });
  }
  const items = rows
    .filter((r) => (!query.assessmentId || r.assessmentId === query.assessmentId)
      && (query.passed === undefined || String(r.passed) === query.passed)
      && (matchesSearch(r.assessmentTitle, query.search) || matchesSearch(r.courseTitle, query.search) || matchesSearch(r.courseCode, query.search)))
    .sort((a, b) => (b.submittedAt ?? b.startedAt).localeCompare(a.submittedAt ?? a.startedAt));
  return paginate(items, pageRequest(query));
});

route('GET', '/me/assessment-attempts/:attemptId', ({ params, session, update }) => update((data): MyAttemptSession => {
  const employee = myEmployee(data, session);
  const open = findOpenAttempt(data, employee, params.attemptId);
  if (open) return sessionOf(open);
  const scored = findScoredAttempt(data, employee, params.attemptId);
  if (!scored) throw notFound('Không tìm thấy lượt làm bài.');
  throw conflict('Lượt làm bài này đã được nộp.');
}));

route('PUT', '/me/assessment-attempts/:attemptId/answers', ({ body, params, session, update }) => update((data) => {
  const employee = myEmployee(data, session);
  const open = findOpenAttempt(data, employee, params.attemptId);
  if (!open) {
    if (findScoredAttempt(data, employee, params.attemptId)) throw conflict('Lượt làm bài này đã được nộp.');
    throw notFound('Không tìm thấy lượt làm bài.');
  }
  if (attemptExpired(open)) throw conflict('Đã hết thời gian làm bài.');
  const answers = (body.answers ?? {}) as Record<string, string | null>;
  const questionIds = new Set(assessmentOf(COURSE_BY_ID.get(open.courseId)!).questions.map((q) => q.id));
  let saved = 0;
  for (const [questionId, option] of Object.entries(answers)) {
    if (!questionIds.has(questionId)) continue;
    open.answers[questionId] = option;
    saved += 1;
  }
  return { savedCount: saved, deadline: open.deadline, serverNow: nowIso() };
}));

route('POST', '/me/assessment-attempts/:attemptId/submit', ({ body, params, session, update }) => update((data): MyAttemptResult => {
  const employee = myEmployee(data, session);
  const open = findOpenAttempt(data, employee, params.attemptId);
  const scored = open
    ? finalize(data, session, employee, open, (body.answers ?? {}) as Record<string, string | null>)
    : findScoredAttempt(data, employee, params.attemptId);
  if (!scored) throw notFound('Không tìm thấy lượt làm bài.');
  return resultOf(data, employee, scored);
}));

route('GET', '/me/assessment-attempts/:attemptId/result', ({ org, params, session }): MyAttemptResult => {
  const data = org();
  const employee = myEmployee(data, session);
  const scored = findScoredAttempt(data, employee, params.attemptId);
  if (!scored) {
    if (findOpenAttempt(data, employee, params.attemptId)) throw conflict('Lượt làm bài chưa được nộp.');
    throw notFound('Không tìm thấy lượt làm bài.');
  }
  return resultOf(data, employee, scored);
});

// ── EM-14..EM-17: nhiệm vụ thực tế ───────────────────────────────────────────

route('GET', '/me/tasks', ({ org, session }): MyTasks => {
  const data = org();
  const employee = myEmployee(data, session);
  const items = myTasks(data, employee).map((t) => withoutSubmissions(taskCard(data, employee, t)));
  return { items, summary: taskSummary(items) };
});

route('GET', '/me/tasks/:assignmentId', ({ org, params, session }): MyTaskDetail => {
  const data = org();
  const employee = myEmployee(data, session);
  const task = myTask(data, employee, params.assignmentId);
  return {
    ...taskCard(data, employee, task),
    rubric: task.rubricCriteria.map((r) => ({ id: r.id, label: r.label, description: r.description, maxPoints: r.maxPoints })),
    maxAttachmentBytes: MAX_ATTACHMENT_BYTES,
    maxAttachments: MAX_ATTACHMENTS,
    allowedExtensions: ALLOWED_EXTENSIONS,
  };
});

route('POST', '/me/tasks/:assignmentId/attachments', ({ body, params, session, update }) => update((data): MyTaskFile => {
  const employee = myEmployee(data, session);
  const task = myTask(data, employee, params.assignmentId);
  const form = body as unknown as { get?: (name: string) => unknown };
  const file = typeof form.get === 'function' ? form.get('file') : undefined;
  if (!(file instanceof Blob)) throw badRequest('Vui lòng chọn tệp cần tải lên.', 'FILE_REQUIRED', 'file');
  const fileName = (file as File).name ?? 'tep-dinh-kem';
  const extension = `.${fileName.split('.').pop()?.toLowerCase() ?? ''}`;
  if (!ALLOWED_EXTENSIONS.includes(extension)) throw badRequest(`Định dạng ${extension} không được hỗ trợ.`, 'FILE_TYPE', 'file');
  if (file.size === 0 || file.size > MAX_ATTACHMENT_BYTES) throw badRequest('Tệp rỗng hoặc vượt quá 20 MB.', 'FILE_SIZE', 'file');
  const record = {
    id: newId('file'),
    taskId: task.id,
    employeeId: employee.id,
    fileName,
    contentType: file.type || undefined,
    sizeBytes: file.size,
    uploadedAt: nowIso(),
  };
  data.taskFiles = [...(data.taskFiles ?? []), record];
  return { id: record.id, fileName, contentType: record.contentType ?? null, sizeBytes: record.sizeBytes };
}), { status: 201 });

route('GET', '/me/tasks/:assignmentId/attachments/:fileId', () => {
  throw notFound(NO_FILE_CONTENT);
});

route('POST', '/me/tasks/:assignmentId/submissions', ({ body, params, session, update }) => update((data): SubmitTaskResult => {
  const employee = myEmployee(data, session);
  const task = myTask(data, employee, params.assignmentId);
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  if (content.length < CONTENT_MIN_LENGTH) throw badRequest('Mô tả cần tối thiểu 20 ký tự.', 'CONTENT_TOO_SHORT', 'content');
  const links = (Array.isArray(body.linkUrls) ? body.linkUrls : []).map((l) => String(l).trim()).filter(Boolean);
  if (links.length > MAX_LINKS) throw badRequest('Tối đa 10 đường dẫn.', 'TOO_MANY_LINKS', 'linkUrls');
  if (links.some((l) => !URL_PATTERN.test(l) || l.includes(';'))) {
    throw badRequest('Đường dẫn phải bắt đầu bằng http:// hoặc https://.', 'INVALID_LINK', 'linkUrls');
  }
  const fileIds = (Array.isArray(body.attachmentIds) ? body.attachmentIds : []).map(String);
  if (fileIds.length > MAX_ATTACHMENTS) throw badRequest('Tối đa 10 tệp đính kèm.', 'TOO_MANY_FILES', 'attachmentIds');
  const mine = new Set((data.taskFiles ?? []).filter((f) => f.taskId === task.id && f.employeeId === employee.id).map((f) => f.id));
  if (fileIds.some((id) => !mine.has(id))) throw badRequest('Tệp đính kèm không hợp lệ.', 'INVALID_FILE', 'attachmentIds');

  const existing = submissionOf(data, employee, task.id);
  const status = assignmentStatus(existing);
  if (status !== 'ASSIGNED' && status !== 'NEEDS_REVISION') {
    throw conflict(status === 'SUBMITTED' ? 'Bài nộp trước đang chờ đánh giá.' : 'Nhiệm vụ đã có kết quả đánh giá.');
  }

  const now = nowIso();
  let submission = existing;
  if (submission) {
    const { id: _id, taskId: _taskId, employeeId: _employeeId, employeeName: _name, previousVersions, ...current } = submission;
    submission.previousVersions = [...(previousVersions ?? []), current];
    Object.assign(submission, { submittedAt: now, content, linkUrls: links, fileUrls: fileIds, status: 'PENDING_REVIEW', evaluation: undefined });
  } else {
    submission = {
      id: newId('sub'),
      taskId: task.id,
      employeeId: employee.id,
      employeeName: employee.fullName,
      submittedAt: now,
      content,
      linkUrls: links,
      fileUrls: fileIds,
      status: 'PENDING_REVIEW',
    };
    data.submissions = [submission, ...(data.submissions ?? [])];
  }
  recordAudit(data, session, 'PRACTICAL_EVIDENCE_SUBMITTED', 'TASK_SUBMISSION', submission.id, `Nộp bài cho: ${task.title}`);
  return {
    assignmentId: task.id,
    submissionId: submission.id,
    versionNo: (submission.previousVersions?.length ?? 0) + 1,
    submittedAt: now,
    assignmentStatus: 'SUBMITTED',
  };
}), { status: 201, message: 'Đã nộp minh chứng.' });
