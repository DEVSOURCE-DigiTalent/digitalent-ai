import { isSeenKey } from '../../../../lib/personal-access';
import { TT02_COMPETENCY_NAMES, TT02_DOMAINS } from '../../../../lib/reference-positions';
import { WORKSPACES } from '../../../../lib/roles';
import type {
  AssessmentOutcome, CourseAssessment, PersonalAccess, PersonalDiagnostic, PersonalOverview, PersonalProgress,
} from '../../../personal-learning.service';
import { badRequest, forbidden, notFound } from '../http';
import { route, type RequestContext } from '../router';
import { courseIdOfTask, courseModules, competencyCodesOf, courseDomain } from '../personal/course-content';
import {
  accessDto, accessOf, assertCanChangeLesson, assertCanChangeTarget, assertCanSubmitDiagnostic, assertCanSubmitTask,
  assertCanTakeCourseAssessment, planViewOf,
} from '../personal/personal-access';
import {
  ASSESSMENT_PASS_PERCENT, activity, buildPath, certificateIdOf, certificates, completedCourses, competencyLevels,
  courseDetail, courseStatus, diagnosticLevels, diagnosticResult, findCourse, isReferencePosition, learnedMinutes,
  milestones, skillGap, targetDto, tasks,
} from '../personal/personal-logic';
import { getPersonalState, updatePersonalState, type PersonalState } from '../personal/personal-store';
import { ENTRY_QUESTIONS, QUESTION_BY_ID, questionsOfDomain } from '../personal/question-bank';
import { updateDb } from '../../mock-store';


/** Personal workspace (spec IND-*): one learner, their target, path, courses, tasks and certificates. */

const NOTES_MAX_LENGTH = 2000;
const TASK_CONTENT_MIN_LENGTH = 20;
const URL_PATTERN = /^https?:\/\/\S+$/i;

/** Only individual learners have a personal track; returns their id. */
function learnerId({ session }: RequestContext): string {
  if (session.workspace !== WORKSPACES.PERSONAL) throw forbidden('Chỉ tài khoản cá nhân dùng được khu vực này.');
  return session.id;
}

function stateOf(context: RequestContext): PersonalState {
  return getPersonalState(learnerId(context));
}

/** The caller's plan view: what the path and course builders need to flag trial slots and plan locks. */
const planOf = (context: RequestContext) => planViewOf(accessOf(context.session));

function readAnswers(body: Record<string, unknown>): Record<string, number> {
  const raw = body.answers;
  if (!raw || typeof raw !== 'object') throw badRequest('Thiếu câu trả lời.', 'ANSWERS_REQUIRED', 'answers');
  const answers: Record<string, number> = {};
  Object.entries(raw as Record<string, unknown>).forEach(([id, value]) => {
    if (Number.isInteger(value)) answers[id] = value as number;
  });
  return answers;
}

function courseOrThrow(id: string) {
  const course = findCourse(id);
  if (!course) throw notFound('Không tìm thấy khóa học.');
  return course;
}

route('GET', '/personal/overview', (context): PersonalOverview => {
  const state = stateOf(context);
  const gap = skillGap(state);
  const plan = planOf(context);
  const path = buildPath(state, plan);
  const inProgress = plan.mode === 'free'
    ? undefined
    : path.stages.flatMap((stage) => stage.courses).find((course) => course.status === 'IN_PROGRESS' && !course.planLocked);
  let continueLesson: PersonalOverview['continueLesson'] = null;
  if (inProgress) {
    const done = state.lessons[inProgress.id] ?? {};
    const next = courseModules(findCourse(inProgress.id)!).flatMap((m) => m.lessons).find((lesson) => !done[lesson.id]);
    if (next) {
      continueLesson = {
        courseId: inProgress.id,
        courseTitle: inProgress.title,
        lessonId: next.id,
        lessonTitle: next.title,
        progressPercent: inProgress.progressPercent,
      };
    }
  }
  return {
    fullName: context.session.fullName,
    target: gap.target,
    assessed: gap.assessed,
    coveragePercent: gap.coveragePercent,
    gapCount: gap.totalRequired - gap.totalMet,
    domains: gap.domains,
    path: {
      progressPercent: path.progressPercent,
      completedCourses: path.completedCourses,
      totalCourses: path.totalCourses,
      minutesLeft: path.minutesLeft,
    },
    nextCourse: path.nextCourse,
    continueLesson,
    learnedMinutes: learnedMinutes(state),
    // Passes of a trial or the Free plan are certificates waiting for the upgrade, not issued ones.
    certificateCount: plan.mode === 'full' ? completedCourses(state).size : 0,
    openTaskCount: tasks(state).filter((task) => task.status === 'OPEN' || task.status === 'REVISION_REQUESTED').length,
    activity: activity(state, 6, plan),
  };
});

route('PUT', '/personal/target', (context) => {
  const code = String(context.body.positionCode ?? '').toUpperCase();
  if (!isReferencePosition(code)) throw badRequest('Vị trí mục tiêu không hợp lệ.', 'UNKNOWN_POSITION', 'positionCode');
  const userId = learnerId(context);
  assertCanChangeTarget(accessOf(context.session), getPersonalState(userId), code);
  updateDb((db) => {
    const user = db.users.find((u) => u.id === userId);
    if (user) {
      user.onboardingStatus = undefined;
    }
  });
  return updatePersonalState(userId, (state) => {
    if (state.targetCode !== code) {
      if (state.targetCode) state.targetChangeCount += 1;
      state.targetCode = code;
      state.targetSetAt = new Date().toISOString();
    }
    return targetDto(state);
  });
}, { message: 'Đã lưu vị trí mục tiêu.' });

route('GET', '/personal/skill-gap', (context) => skillGap(stateOf(context)));

route('GET', '/personal/diagnostic', (context): PersonalDiagnostic => {
  const state = stateOf(context);
  return {
    target: targetDto(state),
    questions: ENTRY_QUESTIONS.map((question) => ({
      id: question.id,
      domainNumber: question.domainNumber,
      domainName: TT02_DOMAINS[question.domainNumber - 1].name,
      competencyCode: question.competencyCode,
      level: question.level,
      text: question.text,
      options: question.options,
    })),
    result: diagnosticResult(state),
    tryOrientation: state.tryOrientation ? { correct: state.tryOrientation.correct, total: state.tryOrientation.total } : null,
  };
});

route('POST', '/personal/diagnostic', (context) => {
  const answers = readAnswers(context.body);
  const missing = ENTRY_QUESTIONS.filter((question) => answers[question.id] === undefined);
  if (missing.length > 0) {
    throw badRequest(`Còn ${missing.length} câu chưa trả lời.`, 'UNANSWERED_QUESTIONS', 'answers');
  }
  assertCanSubmitDiagnostic(accessOf(context.session), stateOf(context));
  return updatePersonalState(learnerId(context), (state) => {
    state.diagnostic = { answers, domainLevels: diagnosticLevels(answers), completedAt: new Date().toISOString() };
    return diagnosticResult(state);
  });
}, { message: 'Đã ghi nhận bài đánh giá đầu vào.' });

route('GET', '/personal/path', (context) => buildPath(stateOf(context), planOf(context)));

route('GET', '/personal/courses/:id', (context) =>
  courseDetail(stateOf(context), courseOrThrow(context.params.id), planOf(context)));

route('PUT', '/personal/courses/:id/lessons/:lessonId', (context) => {
  const course = courseOrThrow(context.params.id);
  const lesson = courseModules(course).flatMap((m) => m.lessons).find((l) => l.id === context.params.lessonId);
  if (!lesson) throw notFound('Không tìm thấy bài học.');
  const access = accessOf(context.session);
  return updatePersonalState(learnerId(context), (state) => {
    const completing = context.body.completed !== false;
    const exempt = buildPath(state).exempt.some((item) => item.id === course.id);
    assertCanChangeLesson(access, state, course.id, exempt, completing);
    if (courseStatus(state, course, competencyLevels(state)) === 'LOCKED') {
      throw badRequest('Hãy hoàn thành khóa tiên quyết trước.', 'PREREQUISITE_NOT_MET');
    }
    const lessons = { ...(state.lessons[course.id] ?? {}) };
    if (!completing) delete lessons[lesson.id];
    else lessons[lesson.id] = lessons[lesson.id] ?? new Date().toISOString();
    state.lessons[course.id] = lessons;
    if (completing && access.mode === 'trial' && !exempt && !state.trialCourseIds.includes(course.id)) {
      state.trialCourseIds = [...state.trialCourseIds, course.id];
    }
    return courseDetail(state, course, planViewOf(access));
  });
});

route('PUT', '/personal/courses/:id/notes', (context) => {
  const course = courseOrThrow(context.params.id);
  const notes = String(context.body.notes ?? '');
  if (notes.length > NOTES_MAX_LENGTH) throw badRequest(`Ghi chú tối đa ${NOTES_MAX_LENGTH} ký tự.`, 'NOTES_TOO_LONG', 'notes');
  return updatePersonalState(learnerId(context), (state) => {
    state.notes[course.id] = notes;
    return { notes };
  });
}, { message: 'Đã lưu ghi chú.' });

route('GET', '/personal/courses/:id/assessment', (context): CourseAssessment => {
  const course = courseOrThrow(context.params.id);
  const state = stateOf(context);
  assertCanTakeCourseAssessment(accessOf(context.session), state, course.id);
  const detail = courseDetail(state, course);
  return {
    courseId: course.id,
    courseTitle: course.title,
    passPercent: ASSESSMENT_PASS_PERCENT,
    ready: detail.completedLessons === detail.lessonCount,
    questions: questionsOfDomain(detail.domainNumber).map(({ id, competencyCode, text, options }) => ({
      id, competencyCode, text, options,
    })),

  };
});

route('POST', '/personal/courses/:id/assessment', (context): AssessmentOutcome => {
  const course = courseOrThrow(context.params.id);
  const answers = readAnswers(context.body);
  const access = accessOf(context.session);
  return updatePersonalState(learnerId(context), (state) => {
    assertCanTakeCourseAssessment(access, state, course.id);
    const detail = courseDetail(state, course);
    if (detail.completedLessons < detail.lessonCount) {
      throw badRequest('Hãy học hết các bài trước khi làm bài đánh giá.', 'LESSONS_NOT_COMPLETED');
    }
    const questions = questionsOfDomain(detail.domainNumber);
    const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length;
    const scorePercent = Math.round((correct / questions.length) * 100);
    const passed = scorePercent >= ASSESSMENT_PASS_PERCENT;
    const firstPass = passed && !completedCourses(state).has(course.id);
    const certificatePending = firstPass && access.mode !== 'full';
    state.attempts.push({ courseId: course.id, at: new Date().toISOString(), correct, total: questions.length, passed });
    return {
      scorePercent,
      correct,
      total: questions.length,
      passed,
      review: questions.map((q) => ({
        questionId: q.id,
        chosenIndex: answers[q.id] ?? null,
        correctIndex: QUESTION_BY_ID.get(q.id)!.correctIndex,
        explanation: q.explanation,
      })),
      certificateId: firstPass && !certificatePending ? certificateIdOf(course.id) : null,
      certificatePending,
    };
  });
});

route('GET', '/personal/tasks', (context) => tasks(stateOf(context)));

route('POST', '/personal/tasks/:id/submissions', (context) => {
  const course = courseOrThrow(courseIdOfTask(context.params.id));
  assertCanSubmitTask(accessOf(context.session), stateOf(context), course.id);
  const linkUrl = String(context.body.linkUrl ?? '').trim();
  const content = String(context.body.content ?? '').trim();
  if (linkUrl && !URL_PATTERN.test(linkUrl)) throw badRequest('Liên kết phải bắt đầu bằng http:// hoặc https://.', 'INVALID_URL', 'linkUrl');
  if (content.length < TASK_CONTENT_MIN_LENGTH) {
    throw badRequest(`Mô tả bài làm tối thiểu ${TASK_CONTENT_MIN_LENGTH} ký tự.`, 'CONTENT_TOO_SHORT', 'content');
  }
  return updatePersonalState(learnerId(context), (state) => {
    const task = tasks(state).find((item) => item.courseId === course.id);
    if (!task || task.status === 'LOCKED') throw badRequest('Bắt đầu khóa học để mở bài thực hành.', 'TASK_LOCKED');
    if (task.status === 'APPROVED' || task.status === 'PENDING_REVIEW') {
      throw badRequest('Bài thực hành này đã được nộp.', 'ALREADY_SUBMITTED');
    }
    state.submissions[task.id] = { linkUrl, content, submittedAt: new Date().toISOString(), status: 'PENDING_REVIEW' };
    return tasks(state).find((item) => item.id === task.id);
  });
}, { message: 'Đã nộp bài thực hành.', status: 201 });

route('GET', '/personal/certificates', (context) => certificates(
  stateOf(context), context.session.fullName, planOf(context), context.session.subscription?.startedAt,
));

route('GET', '/personal/access', (context): PersonalAccess => accessDto(accessOf(context.session), stateOf(context)));

route('GET', '/personal/certificates/verify/:code', (context) => {
  const { code } = context.params;
  const normalized = (code || '').trim().toUpperCase();
  // 1. Kiểm tra session certificates
  try {
    const list = certificates(stateOf(context), context.session.fullName, planOf(context));
    const found = list.find((c) => c.code?.toUpperCase() === normalized);
    if (found) return found;
  } catch {}

  // 2. Tra cứu từ mã chuẩn DTC-YYYYMMDD-COURSE (như DTC-20261007-A2-I)
  const parts = normalized.split('-');
  if (parts.length >= 4 && parts[0] === 'DTC') {
    const courseCode = `${parts[2]}-${parts[3]}`;
    const course = findCourse(`crs-${courseCode.toLowerCase()}`);
    if (course) {
      const comps = competencyCodesOf(course).map((cCode) => ({
        code: cCode,
        name: TT02_COMPETENCY_NAMES[cCode] ?? `Năng lực ${cCode}`,
      }));
      return {
        id: `cert-${course.id}`,
        status: 'ISSUED',
        code: normalized,
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        level: course.level,
        domainName: courseDomain(course).name,
        competencies: comps,
        recipientName: 'Bùi Thị Cá Nhân',
        passedAt: '2026-10-07T08:30:00.000Z',
        issuedAt: '2026-10-07T08:30:00.000Z',
        scorePercent: 95,
      };
    }
  }

  throw notFound('Chứng nhận không tồn tại hoặc mã tra cứu không hợp lệ.');
});

/** Marks a UI hint as seen. Idempotent: the time of the first call is kept. */
route('PUT', '/personal/seen/:key', (context): Record<string, string> => {
  const { key } = context.params;
  if (!isSeenKey(key)) throw badRequest('Khóa không hợp lệ.', 'UNKNOWN_SEEN_KEY', 'key');
  return updatePersonalState(learnerId(context), (state) => {
    state.seen = { ...state.seen, [key]: state.seen[key] ?? new Date().toISOString() };
    return state.seen;
  });
});

route('GET', '/personal/progress', (context): PersonalProgress => {
  const state = stateOf(context);
  const gap = skillGap(state);
  const levels = competencyLevels(state);
  const required = new Map(gap.items.map((item) => [item.code, item.requiredLevel]));
  return {
    learnedMinutes: learnedMinutes(state),
    lessonsCompleted: Object.values(state.lessons).reduce((sum, lessons) => sum + Object.keys(lessons).length, 0),
    assessmentsPassed: completedCourses(state).size,
    tasksApproved: Object.values(state.submissions).filter((s) => s.status === 'APPROVED').length,
    coveragePercent: gap.coveragePercent,
    profile: gap.domains.map((domain) => ({
      number: domain.number,
      name: domain.name,
      items: [...levels.entries()]
        .filter(([code]) => code.startsWith(`${domain.number}.`))
        .map(([code, info]) => ({
          code,
          name: TT02_COMPETENCY_NAMES[code],
          level: info.level,
          requiredLevel: required.get(code) ?? 0,
          source: info.source,
          at: info.at,
        })),
    })),
    milestones: milestones(state),
    activity: activity(state, 12, planOf(context)),
  };
});
