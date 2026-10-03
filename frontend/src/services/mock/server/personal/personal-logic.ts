import {
  REFERENCE_POSITIONS, TT02_COMPETENCY_NAMES, TT02_DOMAINS, getReferencePosition, summarizeRequirements,
} from '../../../../lib/reference-positions';
import { levelLabelVi } from '../../../../lib/competency-levels';
import type {
  ActivityKind, DiagnosticResult, PathCourse, PathCourseStatus, PathStage, PersonalActivity, PersonalCertificate,
  PersonalCompetencyGap, PersonalCourseDetail, PersonalDomainLevel, PersonalMilestone, PersonalPath, PersonalSkillGap,
  PersonalTarget, PersonalTask, TaskStatus,
} from '../../../personal-learning.service';
import {
  COMPETENCY_BY_FRAMEWORK_CODE, COMPETENCY_BY_ID, COURSES, COURSE_BY_ID, courseFor, type CatalogCourse,
} from '../catalog';
import { computeSkillGapItems, summarize } from '../engine';
import { referenceRequirementLines } from '../requirements';
import {
  competencyCodesOf, courseDescription, courseDomain, courseModules, courseOutcomes, taskIdOf, taskTemplate,
} from './course-content';
import { ENTRY_QUESTIONS, QUESTION_BY_ID } from './question-bank';
import type { PersonalState, StoredAttempt } from './personal-store';

/** Pure rules of the personal track; handlers/personal.ts turns them into API answers. */

export const ASSESSMENT_PASS_PERCENT = 75;
const DIAGNOSTIC_SOURCE = 'Đánh giá đầu vào';
const COMPETENCY_CODES = Object.keys(TT02_COMPETENCY_NAMES);
const STAGE_TITLES: Record<number, string> = {
  1: 'Chặng 1 · Nền tảng',
  2: 'Chặng 2 · Vững vàng',
  3: 'Chặng 3 · Chuyên sâu',
};

const domainOfCode = (code: string) => Number(code.split('.')[0]);
const publishedCourses = COURSES.filter((course) => course.status === 'PUBLISHED');

// ── Levels ──

export interface LevelInfo {
  level: number;
  source: string | null;
  at: string | null;
}

/** First passed attempt of each course, in time order. */
export function completedCourses(state: PersonalState): Map<string, StoredAttempt> {
  const passed = state.attempts.filter((attempt) => attempt.passed).sort((a, b) => a.at.localeCompare(b.at));
  const result = new Map<string, StoredAttempt>();
  passed.forEach((attempt) => {
    if (!result.has(attempt.courseId)) result.set(attempt.courseId, attempt);
  });
  return result;
}

/** Level of each competency: the entry assessment, raised by every course passed in its domain. */
export function competencyLevels(state: PersonalState, includeCourses = true): Map<string, LevelInfo> {
  const levels = new Map<string, LevelInfo>();
  COMPETENCY_CODES.forEach((code) => {
    const base = state.diagnostic?.domainLevels[domainOfCode(code) - 1] ?? 0;
    levels.set(code, {
      level: base,
      source: base > 0 ? DIAGNOSTIC_SOURCE : null,
      at: base > 0 ? state.diagnostic!.completedAt : null,
    });
  });
  if (!includeCourses) return levels;

  completedCourses(state).forEach((attempt, courseId) => {
    const course = COURSE_BY_ID.get(courseId);
    if (!course) return;
    competencyCodesOf(course).forEach((code) => {
      const current = levels.get(code)!;
      if (course.level > current.level) {
        levels.set(code, { level: course.level, source: `Khóa ${course.code} · ${course.title}`, at: attempt.at });
      }
    });
  });
  return levels;
}

function domainLevel(levels: Map<string, LevelInfo>, domainNumber: number): number {
  const codes = COMPETENCY_CODES.filter((code) => domainOfCode(code) === domainNumber);
  return Math.min(...codes.map((code) => levels.get(code)!.level));
}

// ── Target and skill gap ──

export function targetDto(state: PersonalState): PersonalTarget | null {
  const position = state.targetCode ? getReferencePosition(state.targetCode) : undefined;
  if (!position) return null;
  const { selected, domains } = summarizeRequirements(position);
  return {
    code: position.code,
    name: position.name,
    description: position.description,
    requiredCount: selected,
    domains,
    selectedAt: state.targetSetAt ?? undefined,
  };
}

export const isReferencePosition = (code: string) => REFERENCE_POSITIONS.some((position) => position.code === code);

function gapItems(state: PersonalState, levels: Map<string, LevelInfo>): PersonalCompetencyGap[] {
  if (!state.targetCode || !isReferencePosition(state.targetCode)) return [];
  const lines = referenceRequirementLines(state.targetCode as Parameters<typeof referenceRequirementLines>[0]);
  const current = new Map(
    COMPETENCY_CODES.map((code) => [COMPETENCY_BY_FRAMEWORK_CODE.get(code)!.id, levels.get(code)!.level]),
  );
  return computeSkillGapItems(lines, current).map((item) => {
    const code = COMPETENCY_BY_ID.get(item.competencyId)!.frameworkCode;
    const info = levels.get(code)!;
    return {
      code,
      name: item.competencyName,
      domainNumber: domainOfCode(code),
      domainName: item.categoryName ?? '',
      requiredLevel: item.requiredLevel,
      currentLevel: item.currentLevel ?? 0,
      gapSteps: item.gapSteps,
      mandatory: item.mandatory,
      severity: item.severity,
      source: info.source ?? undefined,
    };
  });
}

function domainLevels(items: PersonalCompetencyGap[], levels: Map<string, LevelInfo>): PersonalDomainLevel[] {
  return TT02_DOMAINS.map((domain) => {
    const own = items.filter((item) => item.domainNumber === domain.number);
    return {
      number: domain.number,
      name: domain.name,
      required: Math.max(0, ...own.map((item) => item.requiredLevel)),
      current: own.length > 0 ? Math.min(...own.map((item) => item.currentLevel)) : domainLevel(levels, domain.number),
      gapCount: own.filter((item) => item.gapSteps > 0).length,
    };
  });
}

export function skillGap(state: PersonalState): PersonalSkillGap {
  const levels = competencyLevels(state);
  const items = gapItems(state, levels);
  const summary = items.length > 0 ? summarize(toEngineItems(items)) : undefined;
  return {
    target: targetDto(state),
    assessed: Boolean(state.diagnostic),
    coveragePercent: Math.round(summary?.coveragePercent ?? 0),
    totalRequired: items.length,
    totalMet: items.filter((item) => item.gapSteps === 0).length,
    highCount: summary?.highCount ?? 0,
    mediumCount: summary?.mediumCount ?? 0,
    lowCount: summary?.lowCount ?? 0,
    domains: domainLevels(items, levels),
    items,
  };
}

/** The engine's summary only reads levels, weights and severity; equal weights per competency. */
function toEngineItems(items: PersonalCompetencyGap[]): Parameters<typeof summarize>[0] {
  return items.map((item) => ({
    competencyId: item.code,
    competencyCode: item.code,
    competencyName: item.name,
    categoryName: item.domainName,
    categorySortOrder: item.domainNumber,
    frameworkCode: item.code,
    requiredLevel: item.requiredLevel,
    currentLevel: item.currentLevel,
    gapSteps: item.gapSteps,
    weightPercent: 1,
    mandatory: item.mandatory,
    mandatoryMultiplier: 1,
    priorityScore: item.gapSteps,
    severity: item.severity,
  }));
}

// ── Courses ──

function lessonCount(course: CatalogCourse): number {
  return competencyCodesOf(course).length * 3;
}

function completedLessonCount(state: PersonalState, course: CatalogCourse): number {
  return Object.keys(state.lessons[course.id] ?? {}).length;
}

function prerequisiteSatisfied(state: PersonalState, course: CatalogCourse, levels: Map<string, LevelInfo>): boolean {
  if (!course.prerequisiteCourseId) return true;
  if (completedCourses(state).has(course.prerequisiteCourseId)) return true;
  return domainLevel(levels, courseDomain(course).number) >= course.entryLevel;
}

export function courseStatus(state: PersonalState, course: CatalogCourse, levels: Map<string, LevelInfo>): PathCourseStatus {
  if (completedCourses(state).has(course.id)) return 'COMPLETED';
  if (completedLessonCount(state, course) > 0) return 'IN_PROGRESS';
  return prerequisiteSatisfied(state, course, levels) ? 'AVAILABLE' : 'LOCKED';
}

function progressOf(state: PersonalState, course: CatalogCourse): number {
  if (completedCourses(state).has(course.id)) return 100;
  return Math.round((completedLessonCount(state, course) / lessonCount(course)) * 100);
}

function pathCourse(state: PersonalState, course: CatalogCourse, levels: Map<string, LevelInfo>, closes: string[]): PathCourse {
  const domain = courseDomain(course);
  const done = completedCourses(state).has(course.id);
  return {
    id: course.id,
    code: course.code,
    title: course.title,
    domainNumber: domain.number,
    domainName: domain.name,
    level: course.level,
    durationMinutes: course.estimatedDurationMinutes,
    lessonCount: lessonCount(course),
    completedLessons: done ? lessonCount(course) : completedLessonCount(state, course),
    progressPercent: progressOf(state, course),
    status: courseStatus(state, course, levels),
    prerequisiteTitle: course.prerequisiteCourseId ? COURSE_BY_ID.get(course.prerequisiteCourseId)?.title : undefined,
    closes,
  };
}

/**
 * Courses the target needs, counted from the entry assessment so that finished courses stay on the path:
 * in each domain, one course per level from just above the assessed level up to the highest required level.
 * Courses at or below the assessed level are exempt. Stages follow the levels, so prerequisites always come first.
 */
export function buildPath(state: PersonalState): PersonalPath {
  const target = targetDto(state);
  const empty: PersonalPath = {
    target, assessed: Boolean(state.diagnostic), stages: [], exempt: [], totalCourses: 0, completedCourses: 0,
    minutesLeft: 0, progressPercent: 0, nextCourse: null,
  };
  if (!target) return empty;

  const levels = competencyLevels(state);
  const baseline = competencyLevels(state, false);
  const baselineItems = gapItems(state, baseline);
  const currentItems = gapItems(state, levels);
  const priority = (domain: number) =>
    currentItems.filter((item) => item.domainNumber === domain).reduce((sum, item) => sum + item.gapSteps * (item.mandatory ? 1.5 : 1), 0);

  const needed: { course: CatalogCourse; closes: string[] }[] = [];
  const exempt: PersonalPath['exempt'] = [];
  TT02_DOMAINS.forEach((domain) => {
    const own = baselineItems.filter((item) => item.domainNumber === domain.number);
    if (own.length === 0) return;
    const assessed = domainLevel(baseline, domain.number);
    const highest = Math.max(...own.map((item) => item.requiredLevel));
    for (let level = 1; level <= 3; level += 1) {
      const course = courseFor(`cat-${domain.number}`, level);
      if (!course) continue;
      if (level <= assessed && state.diagnostic) {
        if (level <= highest) exempt.push({ id: course.id, code: course.code, title: course.title, level });
        continue;
      }
      if (level > highest) continue;
      const closes = own
        .filter((item) => item.currentLevel < level && item.requiredLevel >= level)
        .map((item) => item.code)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      needed.push({ course, closes });
    }
  });

  const stages: PathStage[] = [1, 2, 3]
    .map((level) => ({
      level,
      title: STAGE_TITLES[level],
      courses: needed
        .filter(({ course }) => course.level === level)
        .sort((a, b) => priority(courseDomain(b.course).number) - priority(courseDomain(a.course).number)
          || a.course.code.localeCompare(b.course.code))
        .map(({ course, closes }) => pathCourse(state, course, levels, closes)),
    }))
    .filter((stage) => stage.courses.length > 0);

  const courses = stages.flatMap((stage) => stage.courses);
  const totalLessons = courses.reduce((sum, course) => sum + course.lessonCount, 0);
  const doneLessons = courses.reduce((sum, course) => sum + course.completedLessons, 0);
  const minutesLeft = courses.reduce(
    (sum, course) => sum + Math.round(course.durationMinutes * (1 - course.progressPercent / 100)),
    0,
  );

  return {
    target,
    assessed: Boolean(state.diagnostic),
    stages,
    exempt,
    totalCourses: courses.length,
    completedCourses: courses.filter((course) => course.status === 'COMPLETED').length,
    minutesLeft,
    progressPercent: totalLessons === 0 ? 0 : Math.round((doneLessons / totalLessons) * 100),
    nextCourse: courses.find((course) => course.status === 'IN_PROGRESS')
      ?? courses.find((course) => course.status === 'AVAILABLE')
      ?? null,
  };
}

export function courseDetail(state: PersonalState, course: CatalogCourse): PersonalCourseDetail {
  const levels = competencyLevels(state);
  const path = buildPath(state);
  const inPath = path.stages.some((stage) => stage.courses.some((item) => item.id === course.id));
  const exempt = path.exempt.some((item) => item.id === course.id);
  const done = state.lessons[course.id] ?? {};
  const modules = courseModules(course).map((module) => ({
    ...module,
    lessons: module.lessons.map((lesson) => ({ ...lesson, completed: Boolean(done[lesson.id]) })),
  }));
  const lessons = modules.flatMap((module) => module.lessons);
  const requirements = new Map(gapItems(state, levels).map((item) => [item.code, item.requiredLevel]));
  const attempts = state.attempts.filter((attempt) => attempt.courseId === course.id);
  const best = attempts.length > 0 ? Math.max(...attempts.map((a) => Math.round((a.correct / a.total) * 100))) : null;
  const prerequisite = course.prerequisiteCourseId ? COURSE_BY_ID.get(course.prerequisiteCourseId) : undefined;
  const domain = courseDomain(course);

  return {
    id: course.id,
    code: course.code,
    title: course.title,
    domainNumber: domain.number,
    domainName: domain.name,
    level: course.level,
    entryLevel: course.entryLevel,
    durationMinutes: course.estimatedDurationMinutes,
    description: courseDescription(course),
    outcomes: courseOutcomes(course),
    prerequisite: prerequisite
      ? { id: prerequisite.id, title: prerequisite.title, satisfied: prerequisiteSatisfied(state, course, levels) }
      : null,
    status: courseStatus(state, course, levels),
    inPath,
    exempt,
    modules,
    lessonCount: lessons.length,
    completedLessons: lessons.filter((lesson) => lesson.completed).length,
    progressPercent: progressOf(state, course),
    competencies: competencyCodesOf(course).map((code) => ({
      code,
      name: TT02_COMPETENCY_NAMES[code],
      currentLevel: levels.get(code)!.level,
      requiredLevel: requirements.get(code) ?? 0,
    })),
    assessment: {
      questionCount: 4,
      passPercent: ASSESSMENT_PASS_PERCENT,
      attempts: attempts.length,
      bestScore: best,
      passed: completedCourses(state).has(course.id),
    },
    notes: state.notes[course.id] ?? '',
    task: taskOf(state, course, levels),
  };
}

export function findCourse(id: string): CatalogCourse | undefined {
  const course = COURSE_BY_ID.get(id);
  return course && course.status === 'PUBLISHED' ? course : undefined;
}

// ── Diagnostic ──

export function diagnosticLevels(answers: Record<string, number>): number[] {
  return TT02_DOMAINS.map((domain) => {
    const questions = ENTRY_QUESTIONS.filter((q) => q.domainNumber === domain.number).sort((a, b) => a.level - b.level);
    let level = 0;
    for (const question of questions) {
      if (answers[question.id] !== question.correctIndex) break;
      level = question.level;
    }
    return level;
  });
}

export function diagnosticResult(state: PersonalState): DiagnosticResult | null {
  const diagnostic = state.diagnostic;
  if (!diagnostic) return null;
  const correctOf = (ids: string[]) => ids.filter((id) => diagnostic.answers[id] === QUESTION_BY_ID.get(id)!.correctIndex).length;
  const correct = correctOf(ENTRY_QUESTIONS.map((q) => q.id));
  return {
    completedAt: diagnostic.completedAt,
    correct,
    total: ENTRY_QUESTIONS.length,
    scorePercent: Math.round((correct / ENTRY_QUESTIONS.length) * 100),
    domains: TT02_DOMAINS.map((domain) => {
      const ids = ENTRY_QUESTIONS.filter((q) => q.domainNumber === domain.number).map((q) => q.id);
      return {
        number: domain.number,
        name: domain.name,
        level: diagnostic.domainLevels[domain.number - 1],
        correct: correctOf(ids),
        total: ids.length,
      };
    }),
    review: ENTRY_QUESTIONS.map((question) => ({
      questionId: question.id,
      chosenIndex: diagnostic.answers[question.id] ?? null,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
    })),
  };
}

// ── Tasks and certificates ──

function taskOf(state: PersonalState, course: CatalogCourse, levels: Map<string, LevelInfo>): PersonalTask {
  const template = taskTemplate(course);
  const id = taskIdOf(course.id);
  const submission = state.submissions[id];
  const courseState = courseStatus(state, course, levels);
  const status: TaskStatus = submission
    ? submission.status
    : courseState === 'IN_PROGRESS' || courseState === 'COMPLETED' ? 'OPEN' : 'LOCKED';
  return {
    id,
    courseId: course.id,
    courseCode: course.code,
    courseTitle: course.title,
    domainName: courseDomain(course).name,
    level: course.level,
    ...template,
    competencyCodes: competencyCodesOf(course),
    status,
    submission: submission
      ? {
          linkUrl: submission.linkUrl,
          content: submission.content,
          submittedAt: submission.submittedAt,
          score: submission.score,
          feedback: submission.feedback,
          reviewedAt: submission.reviewedAt,
        }
      : undefined,
  };
}

/** Tasks of the courses on the path, plus any course the learner started outside it. */
export function tasks(state: PersonalState): PersonalTask[] {
  const levels = competencyLevels(state);
  const pathIds = buildPath(state).stages.flatMap((stage) => stage.courses.map((course) => course.id));
  const startedIds = publishedCourses
    .filter((course) => completedLessonCount(state, course) > 0 || completedCourses(state).has(course.id))
    .map((course) => course.id);
  const ids = [...new Set([...pathIds, ...startedIds])];
  const order: Record<TaskStatus, number> = { REVISION_REQUESTED: 0, OPEN: 1, PENDING_REVIEW: 2, APPROVED: 3, LOCKED: 4 };
  return ids
    .map((id) => taskOf(state, COURSE_BY_ID.get(id)!, levels))
    .sort((a, b) => order[a.status] - order[b.status] || a.level - b.level || a.courseCode.localeCompare(b.courseCode));
}

export const certificateIdOf = (courseId: string) => `cert-${courseId.replace('crs-', '')}`;

export function certificates(state: PersonalState, recipientName: string): PersonalCertificate[] {
  return [...completedCourses(state).entries()]
    .map(([courseId, attempt]) => {
      const course = COURSE_BY_ID.get(courseId)!;
      const date = attempt.at.slice(0, 10).replace(/-/g, '');
      return {
        id: certificateIdOf(courseId),
        code: `DTC-${date}-${course.code}`,
        courseId,
        courseCode: course.code,
        courseTitle: course.title,
        level: course.level,
        domainName: courseDomain(course).name,
        competencies: competencyCodesOf(course).map((code) => ({ code, name: TT02_COMPETENCY_NAMES[code] })),
        recipientName,
        issuedAt: attempt.at,
        scorePercent: Math.round((attempt.correct / attempt.total) * 100),
      };
    })
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
}

// ── Activity, milestones ──

export function activity(state: PersonalState, limit = 8): PersonalActivity[] {
  const items: PersonalActivity[] = [];
  const push = (kind: ActivityKind, at: string, title: string, detail?: string) =>
    items.push({ id: `${kind}-${at}-${items.length}`, kind, at, title, detail });

  const target = targetDto(state);
  if (target && state.targetSetAt) push('TARGET', state.targetSetAt, `Chọn vị trí mục tiêu ${target.name}`);
  const result = diagnosticResult(state);
  if (result) push('DIAGNOSTIC', result.completedAt, 'Hoàn thành đánh giá đầu vào', `${result.correct}/${result.total} câu đúng`);

  Object.entries(state.lessons).forEach(([courseId, lessons]) => {
    const course = COURSE_BY_ID.get(courseId);
    if (!course) return;
    const titles = new Map(courseModules(course).flatMap((m) => m.lessons.map((l) => [l.id, `${m.competencyCode} · ${l.title}`])));
    Object.entries(lessons).forEach(([lessonId, at]) => push('LESSON', at, `Học xong: ${titles.get(lessonId) ?? lessonId}`, course.title));
  });

  state.attempts.forEach((attempt) => {
    const course = COURSE_BY_ID.get(attempt.courseId);
    if (!course) return;
    const score = Math.round((attempt.correct / attempt.total) * 100);
    push('ASSESSMENT', attempt.at, `${attempt.passed ? 'Đạt' : 'Chưa đạt'} bài đánh giá ${course.code}`, `${score}% · ${course.title}`);
  });
  completedCourses(state).forEach((attempt, courseId) => {
    const course = COURSE_BY_ID.get(courseId)!;
    push('CERTIFICATE', attempt.at, `Nhận chứng nhận ${course.code}`, `${course.title} · ${levelLabelVi(course.level)}`);
  });

  Object.entries(state.submissions).forEach(([taskId, submission]) => {
    push('TASK', submission.submittedAt, 'Nộp bài thực hành', taskId.replace('tsk-', ''));
    if (submission.reviewedAt && submission.status === 'APPROVED') {
      push('TASK', submission.reviewedAt, 'Bài thực hành được duyệt', `${submission.score ?? ''}/100 · ${taskId.replace('tsk-', '')}`);
    }
  });

  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

export function milestones(state: PersonalState): PersonalMilestone[] {
  const passed = [...completedCourses(state).values()];
  const approved = Object.values(state.submissions)
    .filter((submission) => submission.status === 'APPROVED' && submission.reviewedAt)
    .map((submission) => submission.reviewedAt!)
    .sort();
  const gap = skillGap(state);
  const levels = competencyLevels(state);
  const metDomains = gap.domains.filter((domain) => domain.required > 0 && domain.gapCount === 0);
  const latestIn = (domain: number) =>
    COMPETENCY_CODES.filter((code) => domainOfCode(code) === domain)
      .map((code) => levels.get(code)!.at)
      .filter((at): at is string => Boolean(at))
      .sort()
      .pop() ?? null;
  const domainMetAt = metDomains.map((domain) => latestIn(domain.number)).filter((at): at is string => Boolean(at)).sort()[0] ?? null;
  const latestLevelAt = [...levels.values()].map((info) => info.at).filter((at): at is string => Boolean(at)).sort().pop() ?? null;

  return [
    { id: 'target', title: 'Chọn đích đến', description: 'Chọn một vị trí mục tiêu.', achievedAt: state.targetSetAt },
    { id: 'diagnostic', title: 'Biết điểm xuất phát', description: 'Hoàn thành bài đánh giá đầu vào.', achievedAt: state.diagnostic?.completedAt ?? null },
    { id: 'first-course', title: 'Khóa học đầu tiên', description: 'Đạt bài đánh giá cuối một khóa.', achievedAt: passed[0]?.at ?? null },
    { id: 'first-task', title: 'Minh chứng đầu tiên', description: 'Một bài thực hành được duyệt.', achievedAt: approved[0] ?? null },
    { id: 'domain', title: 'Trọn một miền', description: 'Đạt mọi yêu cầu của vị trí trong một miền năng lực.', achievedAt: domainMetAt },
    { id: 'half', title: 'Nửa chặng đường', description: 'Đáp ứng 50% yêu cầu năng lực của vị trí.', achievedAt: gap.coveragePercent >= 50 ? latestLevelAt : null },
    { id: 'ready', title: 'Sẵn sàng cho vị trí', description: 'Đáp ứng toàn bộ yêu cầu của vị trí mục tiêu.', achievedAt: gap.target && gap.totalRequired === gap.totalMet ? latestLevelAt : null },
  ];
}

export function learnedMinutes(state: PersonalState): number {
  return Object.entries(state.lessons).reduce((sum, [courseId, lessons]) => {
    const course = COURSE_BY_ID.get(courseId);
    if (!course) return sum;
    const minutes = new Map(courseModules(course).flatMap((m) => m.lessons.map((l) => [l.id, l.durationMinutes])));
    return sum + Object.keys(lessons).reduce((total, id) => total + (minutes.get(id) ?? 0), 0);
  }, 0);
}
