import { PERMISSIONS } from '../../../../hooks/use-permission';
import { ROLES } from '../../../../lib/roles';
import { newId } from '../../mock-store';
import { CATEGORY_BY_ID, COMPETENCIES, COURSES, COURSE_BY_ID, type CatalogCourse } from '../catalog';
import { badRequest, conflict, matchesSearch, notFound, paginate, pageRequest } from '../http';
import { activeRequirementSet, calculateRun, currentLevels } from '../org-logic';
import { route } from '../router';
import type {
  AssessmentAttemptRecord, AssignmentRecord, CertificateRecord, EmployeeRecord,
  InternalCourseRecord, OrgData,
} from '../types';
import { recordAudit } from './audit';
import { employeesInScope } from './structure';
import { getCourseModules, getCourseAssessment } from '../../../../features/learning/data/course-content';

/** Standard course catalog and course assignments (spec LCA-12, LCA-13). */

const P = PERMISSIONS;
const DAY_MS = 24 * 60 * 60 * 1000;
const DUE_SOON_DAYS = 7;

const today = () => new Date().toISOString().slice(0, 10);

const isLive = (a: AssignmentRecord) => a.status !== 'CANCELLED';
const isOpen = (a: AssignmentRecord) => a.status !== 'CANCELLED' && a.status !== 'COMPLETED';

export function isOverdue(assignment: AssignmentRecord): boolean {
  return isOpen(assignment) && Boolean(assignment.dueDate) && assignment.dueDate! < today();
}

export function isDueSoon(assignment: AssignmentRecord): boolean {
  if (!isOpen(assignment) || !assignment.dueDate || isOverdue(assignment)) return false;
  return new Date(assignment.dueDate).getTime() - Date.now() <= DUE_SOON_DAYS * DAY_MS;
}

export function courseDto(data: OrgData, course: CatalogCourse) {
  return {
    id: course.id,
    code: course.code,
    title: course.title,
    categoryId: course.categoryId,
    categoryName: CATEGORY_BY_ID.get(course.categoryId)?.name,
    level: course.level,
    entryLevel: course.entryLevel,
    modules: course.modules,
    estimatedDurationMinutes: course.estimatedDurationMinutes,
    prerequisiteCourseId: course.prerequisiteCourseId,
    prerequisiteTitle: course.prerequisiteCourseId ? COURSE_BY_ID.get(course.prerequisiteCourseId)?.title : undefined,
    status: course.status,
    assignedCount: data.assignments.filter((a) => a.courseId === course.id && isLive(a)).length,
  };
}

route('GET', '/courses', ({ org, query }) => {
  const data = org();
  const items = COURSES
    .filter((c) => (!query.status || c.status === query.status) && (!query.categoryId || c.categoryId === query.categoryId)
      && (!query.level || c.level === Number(query.level)) && (matchesSearch(c.title, query.search) || matchesSearch(c.code, query.search)))
    .map((c) => courseDto(data, c));
  return paginate(items, pageRequest({ pageSize: '100', ...query }));
}, { permission: P.COURSE_READ_CATALOG });

// ── Assignments ──

export function assignmentRow(data: OrgData, assignment: AssignmentRecord) {
  const employee = data.employees.find((e) => e.id === assignment.employeeId);
  const course = COURSE_BY_ID.get(assignment.courseId);
  return {
    id: assignment.id,
    employeeId: assignment.employeeId,
    employeeName: employee?.fullName ?? '',
    employeeCode: employee?.employeeCode ?? '',
    departmentName: data.departments.find((d) => d.id === employee?.departmentId)?.name,
    positionName: data.positions.find((p) => p.id === employee?.jobPositionId)?.name,
    courseId: assignment.courseId,
    courseCode: course?.code ?? '',
    courseTitle: course?.title ?? '',
    assignedAt: assignment.assignedAt,
    assignedByName: assignment.assignedByName,
    dueDate: assignment.dueDate,
    status: assignment.status,
    progressPercent: assignment.progressPercent,
    completedAt: assignment.completedAt,
    cancelReason: assignment.cancelReason,
    source: assignment.source,
    overdue: isOverdue(assignment),
    dueSoon: isDueSoon(assignment),
  };
}

route('GET', '/course-assignments', (context) => {
  const { query } = context;
  const data = context.org();
  const scope = new Map(employeesInScope(context).map((e) => [e.id, e]));
  const rows = data.assignments
    .filter((a) => {
      const employee = scope.get(a.employeeId);
      if (!employee) return false;
      if (query.status ? a.status !== query.status : a.status === 'CANCELLED') return false;
      return (!query.courseId || a.courseId === query.courseId)
        && (!query.employeeId || a.employeeId === query.employeeId)
        && (!query.departmentId || employee.departmentId === query.departmentId)
        && (!query.jobPositionId || employee.jobPositionId === query.jobPositionId)
        && (query.overdue !== 'true' || isOverdue(a))
        && (query.dueSoon !== 'true' || isDueSoon(a));
    })
    .map((a) => assignmentRow(data, a))
    .filter((row) => matchesSearch(row.employeeName, query.search) || matchesSearch(row.courseTitle, query.search) || matchesSearch(row.courseCode, query.search))
    .sort((a, b) => Number(b.overdue) - Number(a.overdue) || (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'));
  return paginate(rows, pageRequest(query));
}, { permission: P.COURSE_ASSIGNMENT_READ });

route('GET', '/course-assignments/summary', (context) => {
  const data = context.org();
  const scope = new Map(employeesInScope(context).map((e) => [e.id, e]));
  const live = data.assignments.filter((a) => isLive(a) && scope.has(a.employeeId));
  const count = (status: string) => live.filter((a) => a.status === status).length;
  const byDepartment = data.departments
    .filter((d) => d.status === 'ACTIVE')
    .map((d) => {
      const rows = live.filter((a) => scope.get(a.employeeId)?.departmentId === d.id);
      return {
        departmentId: d.id,
        name: d.name,
        total: rows.length,
        completed: rows.filter((a) => a.status === 'COMPLETED').length,
        overdue: rows.filter(isOverdue).length,
        averageProgress: rows.length ? Math.round(rows.reduce((sum, a) => sum + a.progressPercent, 0) / rows.length) : 0,
      };
    })
    .filter((row) => row.total > 0);
  return {
    total: live.length,
    notStarted: count('NOT_STARTED'),
    inProgress: count('IN_PROGRESS'),
    readyForAssessment: count('READY_FOR_ASSESSMENT'),
    completed: count('COMPLETED'),
    overdue: live.filter(isOverdue).length,
    dueSoon: live.filter(isDueSoon).length,
    completionRate: live.length ? Math.round((count('COMPLETED') / live.length) * 100) : 0,
    byDepartment,
  };
}, { permission: P.COURSE_ASSIGNMENT_READ });

route('GET', '/course-assignments/:id', (context) => {
  const data = context.org();
  const assignment = data.assignments.find((a) => a.id === context.params.id);
  if (!assignment) throw notFound('Không tìm thấy thông tin phân công đào tạo.');
  const scope = new Map(employeesInScope(context).map((e) => [e.id, e]));
  if (!scope.has(assignment.employeeId)) throw notFound('Không tìm thấy thông tin phân công đào tạo.');
  return assignmentRow(data, assignment);
}, { permission: P.COURSE_ASSIGNMENT_READ });

/** Whether the employee has reached the level a course starts from (completed the previous course, or already confirmed at that level). */
export function meetsEntryLevel(data: OrgData, employee: EmployeeRecord, course: CatalogCourse): boolean {
  if (course.entryLevel === 0) return true;
  const completedPrerequisite = data.assignments.some(
    (a) => a.employeeId === employee.id && a.courseId === course.prerequisiteCourseId && a.status === 'COMPLETED',
  );
  if (completedPrerequisite) return true;

  const levels = currentLevels(data, employee.id);
  const required = activeRequirementSet(data, employee.jobPositionId)?.items.map((i) => i.competencyId);
  const inDomain = COMPETENCIES.filter((c) => c.categoryId === course.categoryId && (!required || required.includes(c.id)));
  const relevant = inDomain.length > 0 ? inDomain : COMPETENCIES.filter((c) => c.categoryId === course.categoryId);
  return relevant.every((c) => (levels.get(c.id) ?? 0) >= course.entryLevel);
}

export type SkipReason = 'NOT_ACTIVE' | 'ALREADY_ASSIGNED' | 'ALREADY_COMPLETED' | 'PREREQUISITE_NOT_MET';

/** Creates the assignment, or says why the employee was skipped. Call inside `update()`. */
export function assignCourse(
  data: OrgData,
  employee: EmployeeRecord,
  course: CatalogCourse,
  options: { dueDate: string; assignedByName: string; source: AssignmentRecord['source'] },
): { assignment?: AssignmentRecord; skipped?: SkipReason } {
  if (employee.status !== 'ACTIVE') return { skipped: 'NOT_ACTIVE' };
  const existing = data.assignments.filter((a) => a.employeeId === employee.id && a.courseId === course.id && isLive(a));
  if (existing.some((a) => a.status === 'COMPLETED')) return { skipped: 'ALREADY_COMPLETED' };
  if (existing.length > 0) return { skipped: 'ALREADY_ASSIGNED' };
  if (!meetsEntryLevel(data, employee, course)) return { skipped: 'PREREQUISITE_NOT_MET' };

  const assignment: AssignmentRecord = {
    id: newId('asg'),
    employeeId: employee.id,
    courseId: course.id,
    assignedByName: options.assignedByName,
    assignedAt: new Date().toISOString(),
    dueDate: options.dueDate,
    source: options.source,
    status: 'NOT_STARTED',
    progressPercent: 0,
  };
  data.assignments.push(assignment);
  return { assignment };
}

export function defaultDueDate(data: OrgData): string {
  return new Date(Date.now() + data.settings.defaultAssignmentDays * DAY_MS).toISOString().slice(0, 10);
}

route('POST', '/course-assignments', (context) => context.update((data) => {
  const { body, session } = context;
  const course = COURSES.find((c) => c.id === body.courseId);
  if (!course) throw notFound('Không tìm thấy khóa học.');
  if (course.status !== 'PUBLISHED') throw conflict('Chỉ giao được khóa học đã xuất bản.');
  const dueDate = typeof body.dueDate === 'string' && body.dueDate ? body.dueDate : defaultDueDate(data);
  if (dueDate < today()) throw badRequest('Hạn hoàn thành không được ở quá khứ.');

  const targets = (body.targets ?? {}) as { employeeIds?: string[]; departmentId?: string; jobPositionId?: string };
  const scope = employeesInScope({ org: () => data, session });
  const chosen = new Map<string, EmployeeRecord>();
  for (const employee of scope) {
    if (targets.employeeIds?.includes(employee.id)
      || (targets.departmentId && employee.departmentId === targets.departmentId)
      || (targets.jobPositionId && employee.jobPositionId === targets.jobPositionId)) {
      chosen.set(employee.id, employee);
    }
  }
  if (chosen.size === 0) throw badRequest('Chưa chọn nhân viên nào để giao khóa học.');

  const created: ReturnType<typeof assignmentRow>[] = [];
  const skipped: { employeeId: string; employeeName: string; reason: SkipReason }[] = [];
  for (const employee of chosen.values()) {
    const result = assignCourse(data, employee, course, { dueDate, assignedByName: session.fullName, source: 'MANUAL' });
    if (result.assignment) created.push(assignmentRow(data, result.assignment));
    else skipped.push({ employeeId: employee.id, employeeName: employee.fullName, reason: result.skipped! });
  }
  if (created.length > 0) recordAudit(data, session, 'COURSE_ASSIGNED', 'Khóa học', course.code, `${created.length} nhân viên, hạn ${dueDate}`);
  return { created, skipped };
}), { permission: P.COURSE_ASSIGNMENT_CREATE, roles: [ROLES.OWNER], status: 201 });

route('DELETE', '/course-assignments/:id', (context) => context.update((data) => {
  const { body, params, session } = context;
  const assignment = data.assignments.find((a) => a.id === params.id);
  const inScope = assignment && employeesInScope({ org: () => data, session }).some((e) => e.id === assignment.employeeId);
  if (!assignment || !inScope) throw notFound('Không tìm thấy lượt giao khóa học.');
  if (assignment.status === 'COMPLETED') throw conflict('Khóa học đã hoàn thành, không thể hủy.');
  if (assignment.status === 'CANCELLED') throw conflict('Lượt giao này đã được hủy.');
  assignment.status = 'CANCELLED';
  assignment.cancelReason = typeof body.reason === 'string' ? body.reason.trim() || undefined : undefined;
  const employee = data.employees.find((e) => e.id === assignment.employeeId);
  recordAudit(data, session, 'ASSIGNMENT_CANCELLED', 'Khóa học', `${COURSE_BY_ID.get(assignment.courseId)?.code ?? ''} cho ${employee?.fullName ?? ''}`, assignment.cancelReason);
  return { id: assignment.id };
}), { permission: P.COURSE_ASSIGNMENT_CANCEL, roles: [ROLES.OWNER], message: 'Đã hủy lượt giao khóa học.' });

// ── Course Detail & Lessons (EMP-05, EMP-06) ──

route('GET', '/courses/:id', ({ org, params, session }) => {
  const data = org();
  const course = COURSES.find((c) => c.id === params.id || c.code === params.id);
  if (!course) throw notFound('Không tìm thấy khóa học.');
  const employee = data.employees.find((e) => e.userId === session.id || e.workEmail?.toLowerCase() === session.email?.toLowerCase());
  const assignment = employee ? data.assignments.find((a) => a.courseId === course.id && a.employeeId === employee.id && isLive(a)) : undefined;
  const modules = getCourseModules(course.id, course.code, course.title, course.modules);
  return {
    ...courseDto(data, course),
    modules,
    assignment: assignment ? assignmentRow(data, assignment) : null,
  };
}, { permission: P.COURSE_READ_CATALOG });

route('GET', '/courses/:id/lessons/:lessonId', ({ org, params }) => {
  org();
  const course = COURSES.find((c) => c.id === params.id || c.code === params.id);
  if (!course) throw notFound('Không tìm thấy khóa học.');
  const modules = getCourseModules(course.id, course.code, course.title, course.modules);
  const allLessons = modules.flatMap((m) => m.lessons);
  const lessonIndex = allLessons.findIndex((l) => l.id === params.lessonId);
  if (lessonIndex === -1) throw notFound('Không tìm thấy bài học.');
  const lesson = allLessons[lessonIndex];
  return {
    courseId: course.id,
    courseCode: course.code,
    courseTitle: course.title,
    lesson,
    prevLessonId: lessonIndex > 0 ? allLessons[lessonIndex - 1].id : null,
    nextLessonId: lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1].id : null,
  };
}, { permission: P.COURSE_READ_CATALOG });

route('POST', '/courses/:id/lessons/:lessonId/complete', (context) => context.update((data) => {
  const { params, session } = context;
  const course = COURSES.find((c) => c.id === params.id || c.code === params.id);
  if (!course) throw notFound('Không tìm thấy khóa học.');
  const employee = data.employees.find((e) => e.userId === session.id || e.workEmail?.toLowerCase() === session.email?.toLowerCase());
  if (!employee) throw notFound('Không tìm thấy hồ sơ nhân viên.');
  let assignment = data.assignments.find((a) => a.courseId === course.id && a.employeeId === employee.id && isLive(a));
  if (!assignment) {
    assignment = {
      id: newId('asg'),
      employeeId: employee.id,
      courseId: course.id,
      assignedByName: 'Tự đăng ký',
      assignedAt: new Date().toISOString(),
      source: 'MANUAL',
      status: 'IN_PROGRESS',
      progressPercent: 0,
    };
    data.assignments.push(assignment);
  }
  const modules = getCourseModules(course.id, course.code, course.title, course.modules);
  const allLessons = modules.flatMap((m) => m.lessons);
  const step = Math.round(100 / Math.max(1, allLessons.length));
  assignment.progressPercent = Math.min(100, (assignment.progressPercent || 0) + step);
  if (assignment.progressPercent >= 100) {
    assignment.status = 'READY_FOR_ASSESSMENT';
  } else {
    assignment.status = 'IN_PROGRESS';
  }
  return { assignment: assignmentRow(data, assignment) };
}), { permission: P.COURSE_READ_CATALOG });

// ── Assessments & Attempts (EMP-07, EMP-08, EMP-09, EMP-10, LCA-14) ──

route('GET', '/assessments/:id', ({ org, params }) => {
  org();
  const course = COURSES.find((c) => c.id === params.id || c.code === params.id || `asm-${c.id.replace('crs-', '')}` === params.id);
  if (!course) throw notFound('Không tìm thấy bài đánh giá.');
  const assessment = getCourseAssessment(course.id, course.code, course.title);
  return {
    ...assessment,
    questions: assessment.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options,
      competencyCode: q.competencyCode,
    })),
  };
}, { permission: P.ATTEMPT_START });

route('POST', '/assessments/:id/attempt', (context) => context.update((data) => {
  const { body, params, session } = context;
  const course = COURSES.find((c) => c.id === params.id || c.code === params.id || `asm-${c.id.replace('crs-', '')}` === params.id);
  if (!course) throw notFound('Không tìm thấy bài đánh giá.');
  const employee = data.employees.find((e) => e.userId === session.id || e.workEmail?.toLowerCase() === session.email?.toLowerCase());
  if (!employee) throw notFound('Không tìm thấy nhân viên.');
  const assessment = getCourseAssessment(course.id, course.code, course.title);
  const answers = (body.answers ?? {}) as Record<string, number>;
  let correctCount = 0;
  const answerResults = assessment.questions.map((q) => {
    const selected = answers[q.id];
    const isCorrect = selected === q.correctOptionIndex;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      selectedOptionIndex: selected ?? -1,
      isCorrect,
    };
  });
  const score = Math.round((correctCount / assessment.questions.length) * 100);
  const passed = score >= assessment.passPercentage;
  const now = new Date().toISOString();

  const attempt: AssessmentAttemptRecord = {
    id: newId('att'),
    assessmentId: assessment.id,
    courseId: course.id,
    courseTitle: course.title,
    employeeId: employee.id,
    employeeName: employee.fullName,
    score,
    totalQuestions: assessment.questions.length,
    correctAnswers: correctCount,
    passed,
    startedAt: typeof body.startedAt === 'string' ? body.startedAt : now,
    submittedAt: now,
    durationSeconds: Number(body.durationSeconds) || 600,
    answers: answerResults,
  };
  data.attempts = data.attempts ?? [];
  data.attempts.push(attempt);

  let certificate: CertificateRecord | undefined;
  if (passed) {
    const assignment = data.assignments.find((a) => a.courseId === course.id && a.employeeId === employee.id && isLive(a));
    if (assignment) {
      assignment.status = 'COMPLETED';
      assignment.progressPercent = 100;
      assignment.completedAt = now;
    }
    const frameworkCodes = COMPETENCIES.filter((c) => c.categoryId === course.categoryId).map((c) => c.frameworkCode);
    data.profiles[employee.id] = data.profiles[employee.id] ?? {};
    for (const cmp of COMPETENCIES.filter((c) => c.categoryId === course.categoryId)) {
      const current = data.profiles[employee.id][cmp.id]?.level ?? 0;
      if (course.level > current) {
        data.profiles[employee.id][cmp.id] = {
          level: course.level,
          source: 'ASSESSMENT',
          confirmedAt: now,
          note: `Hoàn thành bài đánh giá khóa học ${course.code}`,
        };
      }
    }
    calculateRun(data, employee.id, 'SYSTEM', now);

    certificate = {
      id: newId('cert'),
      certificateCode: `DT-${new Date().getFullYear()}-${course.code.replace('-', '')}-${String((data.certificates?.length ?? 0) + 1).padStart(3, '0')}`,
      employeeId: employee.id,
      employeeName: employee.fullName,
      employeeCode: employee.employeeCode,
      courseId: course.id,
      courseTitle: course.title,
      courseLevel: course.level,
      frameworkCompetencyCodes: frameworkCodes,
      issueDate: now.slice(0, 10),
      score,
      status: 'ACTIVE',
    };
    data.certificates = data.certificates ?? [];
    data.certificates.push(certificate);
    recordAudit(data, session, 'CERTIFICATE_ISSUED', 'Chứng nhận', certificate.certificateCode, `${employee.fullName}, điểm ${score}%`);
  }

  return {
    attempt,
    passed,
    score,
    passPercentage: assessment.passPercentage,
    correctCount,
    totalQuestions: assessment.questions.length,
    certificate,
    questions: assessment.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation,
      competencyCode: q.competencyCode,
      selectedOptionIndex: answers[q.id] ?? -1,
      isCorrect: answers[q.id] === q.correctOptionIndex,
    })),
  };
}), { permission: P.ATTEMPT_SUBMIT, status: 201 });

route('GET', '/assessments', (context) => {
  const { query, session } = context;
  const data = context.org();
  let items = data.attempts ?? [];
  if (session.roles.includes('OWNER')) {
    if (query.employeeId) items = items.filter((a) => a.employeeId === query.employeeId);
  } else if (session.roles.includes('MANAGER')) {
    const scopeEmployees = employeesInScope(context);
    const inScopeIds = new Set(scopeEmployees.map((e) => e.id));
    items = items.filter((a) => inScopeIds.has(a.employeeId));
    if (query.employeeId) items = items.filter((a) => a.employeeId === query.employeeId);
  } else {
    const own = data.employees.find((e) => e.userId === session.id || e.workEmail?.toLowerCase() === session.email?.toLowerCase());
    items = items.filter((a) => a.employeeId === own?.id);
  }
  if (query.courseId) items = items.filter((a) => a.courseId === query.courseId);
  if (query.passed !== undefined) items = items.filter((a) => String(a.passed) === query.passed);
  items = items.filter((a) => matchesSearch(a.employeeName, query.search) || matchesSearch(a.courseTitle, query.search));
  items.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  return paginate(items, pageRequest(query));
}, { permission: P.ATTEMPT_READ_RESULT });

// ── Certificates (EMP-15, LCA-15) ──

route('GET', '/certificates', (context) => {
  const { query, session } = context;
  const data = context.org();
  let items = data.certificates ?? [];
  if (session.roles.includes('OWNER')) {
    if (query.employeeId) items = items.filter((c) => c.employeeId === query.employeeId);
  } else if (session.roles.includes('MANAGER')) {
    const scopeEmployees = employeesInScope(context);
    const inScopeIds = new Set(scopeEmployees.map((e) => e.id));
    items = items.filter((c) => inScopeIds.has(c.employeeId));
    if (query.employeeId) items = items.filter((c) => c.employeeId === query.employeeId);
  } else {
    const own = data.employees.find((e) => e.userId === session.id || e.workEmail?.toLowerCase() === session.email?.toLowerCase());
    items = items.filter((c) => c.employeeId === own?.id);
  }
  if (query.status) items = items.filter((c) => c.status === query.status);
  items = items.filter((c) => matchesSearch(c.employeeName, query.search) || matchesSearch(c.courseTitle, query.search) || matchesSearch(c.certificateCode, query.search));
  items.sort((a, b) => b.issueDate.localeCompare(a.issueDate));
  return paginate(items, pageRequest(query));
}, { permission: P.CERTIFICATE_READ });

// ── Internal Courses (LCA-16, LCA-17) ──

route('GET', '/internal-courses', ({ org, query }) => {
  const data = org();
  let items = data.internalCourses ?? [];
  if (query.status) items = items.filter((c) => c.status === query.status);
  items = items.filter((c) => matchesSearch(c.title, query.search) || matchesSearch(c.code, query.search));
  items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return paginate(items, pageRequest(query));
}, { permission: P.COURSE_READ_CATALOG });

route('GET', '/internal-courses/:id', ({ org, params }) => {
  const data = org();
  const course = (data.internalCourses ?? []).find((c) => c.id === params.id || c.code === params.id);
  if (!course) throw notFound('Không tìm thấy khóa học nội bộ.');
  return course;
}, { permission: P.COURSE_READ_CATALOG });

route('POST', '/internal-courses', (context) => context.update((data) => {
  const { body, session } = context;
  const now = new Date().toISOString();
  const title = String(body.title || '').trim();
  if (!title) throw badRequest('Tên khóa học nội bộ không được để trống.');
  const course: InternalCourseRecord = {
    id: newId('icrs'),
    code: String(body.code || `NB-${String((data.internalCourses?.length ?? 0) + 1).padStart(2, '0')}`).toUpperCase(),
    title,
    description: String(body.description || ''),
    category: String(body.category || 'Văn hóa & Hội nhập'),
    modulesCount: Number(body.modulesCount) || 1,
    durationMinutes: Number(body.durationMinutes) || 60,
    status: (body.status as InternalCourseRecord['status']) || 'PUBLISHED',
    createdAt: now,
    updatedAt: now,
  };
  data.internalCourses = data.internalCourses ?? [];
  data.internalCourses.push(course);
  recordAudit(data, session, 'INTERNAL_COURSE_CREATED', 'Khóa học nội bộ', course.code, course.title);
  return course;
}), { permission: P.COURSE_CREATE, roles: [ROLES.OWNER], status: 201 });

