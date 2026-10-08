import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../../../api-client';
import { INDIVIDUAL_TRIAL } from '../../../../lib/plans';
import { personalLearningService as api } from '../../../personal-learning.service';
import { mockCheckoutService } from '../../mock-checkout.service';
import { mockPurchaseService } from '../../mock-purchase.service';
import { mockRegistrationService } from '../../mock-registration.service';
import { findUserByEmail, getDb, resetMockDb } from '../../mock-store';
import { mockAdapter } from '../mock-adapter';
import { demoState, getPersonalState } from '../personal/personal-store';
import { ENTRY_QUESTIONS, questionsOfDomain } from '../personal/question-bank';
import { composeSession } from '../session';

/** Reverse trial (spec 2026-10-06): the mock server is the layer that refuses what the plan does not include. */

const DAY_MS = 24 * 60 * 60 * 1000;
const EMAIL = 'nguoi.thu@example.vn';
const START = new Date('2026-10-06T08:00:00.000Z');
const SLOT_COURSES = ['crs-A1-F', 'crs-A2-F', 'crs-A4-F'];
const QUOTA_BLOCKED_COURSE = 'crs-A5-F';
const PERSONAL_STATE_KEY = 'dt-mock-personal-v1';

beforeAll(() => {
  apiClient.defaults.adapter = mockAdapter;
});

beforeEach(() => {
  vi.useRealTimers();
  localStorage.clear();
  resetMockDb();
  vi.stubGlobal('location', { pathname: '/login', search: '', href: '' });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

interface Failure {
  status: number;
  codes: string[];
  message: string;
}

async function failure(promise: Promise<unknown>): Promise<Failure> {
  try {
    await promise;
  } catch (error) {
    const response = (error as { response: { status: number; data: { message: string; errors: { message: string }[] } } }).response;
    return { status: response.status, codes: response.data.errors?.map((e) => e.message) ?? [], message: response.data.message };
  }
  throw new Error('Expected the request to fail');
}

async function registerTrial(positionCode: string | null = 'ACCOUNTANT'): Promise<string> {
  await mockRegistrationService.registerIndividual({
    fullName: 'Người Dùng Thử',
    email: EMAIL,
    password: 'Matkhau1234',
    acceptTerms: true,
    trial: true,
    positionCode: positionCode ?? undefined,
    tryOrientation: positionCode
      ? { positionCode, correct: 3, total: 4, completedAt: START.toISOString() }
      : undefined,
  });
  const userId = findUserByEmail(EMAIL)!.id;
  localStorage.setItem('accessToken', `mock-token:${userId}`);
  return userId;
}

const signInAs = (id: string) => localStorage.setItem('accessToken', `mock-token:${id}`);
const moveTo = (time: number) => vi.setSystemTime(new Date(time));
const allCorrect = () => Object.fromEntries(ENTRY_QUESTIONS.map((q) => [q.id, q.correctIndex]));
const correctAnswersOf = (domain: number) => Object.fromEntries(questionsOfDomain(domain).map((q) => [q.id, q.correctIndex]));

async function completeFirstLesson(courseId: string) {
  const lesson = (await api.getCourse(courseId)).modules[0].lessons[0];
  return api.setLessonCompleted(courseId, lesson.id, true);
}

async function completeAllLessons(courseId: string) {
  for (const lesson of (await api.getCourse(courseId)).modules.flatMap((m) => m.lessons)) {
    await api.setLessonCompleted(courseId, lesson.id, true);
  }
}

describe('trial registration (BR-03, AC-01)', () => {
  it('opens a Plus trial for 7 days with no purchase draft and the position carried over', async () => {
    const userId = await registerTrial('ACCOUNTANT');
    const stored = findUserByEmail(EMAIL)!;

    expect(stored.subscription?.status).toBe('trialing');
    expect(stored.subscription?.planCode).toBe('IND_PLUS');
    expect(new Date(stored.subscription!.trialEndsAt!).getTime() - new Date(stored.subscription!.trialStartedAt!).getTime())
      .toBe(INDIVIDUAL_TRIAL.days * DAY_MS);
    expect(stored.trialUsedAt).toBe(stored.subscription?.trialStartedAt);
    expect(stored.onboardingStatus).toBe('setup');
    expect(stored.pendingPlan).toBeUndefined();
    expect(getDb().purchaseDrafts.filter((d) => d.userId === userId)).toHaveLength(0);

    const overview = await api.getOverview();
    expect(overview.target?.code).toBe('ACCOUNTANT');
    expect(getPersonalState(userId).targetChangeCount).toBe(0);
    expect(getPersonalState(userId).tryOrientation).toMatchObject({ positionCode: 'ACCOUNTANT', correct: 3, total: 4 });
  });

  it('ignores a position that is not one of the reference positions', async () => {
    const userId = await registerTrial('NOT_A_POSITION');

    expect(getPersonalState(userId).targetCode).toBeNull();
    expect(getPersonalState(userId).tryOrientation).toBeNull();
  });

  it('refuses an email that already has an account (BR-01, AC-09)', async () => {
    await registerTrial();

    await expect(
      mockRegistrationService.registerIndividual({ fullName: 'Lần hai', email: EMAIL, password: 'Matkhau1234', trial: true }),
    ).rejects.toMatchObject({ response: { status: 409 } });
  });

  it('describes a new trial in /personal/access', async () => {
    await registerTrial();
    const access = await api.getAccess();

    expect(access.mode).toBe('trial');
    expect(access.planName).toBe('Cá nhân Plus');
    expect(access.daysLeft).toBe(7);
    expect(access.courseLimit).toBe(INDIVIDUAL_TRIAL.courseLimit);
    expect(access.coursesLeft).toBe(INDIVIDUAL_TRIAL.courseLimit);
    expect(access.trialCourseIds).toEqual([]);
    expect(access.diagnosticAvailable).toBe(true);
    expect(access.targetChangesLeft).toBe(INDIVIDUAL_TRIAL.targetChanges);
    expect(access.pendingCertificates).toBe(0);
    expect(access.checklist.map((item) => item.done)).toEqual([false, false, false, false]);
  });
});

describe('trial course slots (BR-04, AC-03)', () => {
  it('counts a slot when the first lesson of a new course is completed, not when the course is opened', async () => {
    await registerTrial();

    await api.getCourse(SLOT_COURSES[0]);
    expect((await api.getAccess()).trialCourseIds).toEqual([]);

    await completeFirstLesson(SLOT_COURSES[0]);
    const access = await api.getAccess();
    expect(access.trialCourseIds).toEqual([SLOT_COURSES[0]]);
    expect(access.coursesLeft).toBe(2);
  });

  it('refuses a fourth course with TRIAL_COURSE_LIMIT and keeps the lessons of the three slots open', async () => {
    await registerTrial();
    for (const courseId of SLOT_COURSES) await completeFirstLesson(courseId);

    const refused = await failure(completeFirstLesson(QUOTA_BLOCKED_COURSE));

    expect(refused.status).toBe(403);
    expect(refused.codes).toEqual(['TRIAL_COURSE_LIMIT']);
    expect(refused.message).toContain('3 lượt học thử');
    const access = await api.getAccess();
    expect(access.trialCourseIds).toEqual(SLOT_COURSES);
    expect(access.coursesLeft).toBe(0);
    const second = (await api.getCourse(SLOT_COURSES[0])).modules[0].lessons[1];
    await expect(api.setLessonCompleted(SLOT_COURSES[0], second.id, true)).resolves.toBeDefined();
  });

  it('does not charge a slot for a course the entry assessment already exempts', async () => {
    await registerTrial();
    await api.submitDiagnostic(allCorrect());
    expect((await api.getPath()).exempt.map((course) => course.id)).toContain('crs-A1-F');

    await completeFirstLesson('crs-A1-F');

    expect((await api.getAccess()).trialCourseIds).toEqual([]);
  });

  it('marks slot courses and the courses the plan locks on the path (BR-16)', async () => {
    await registerTrial();
    for (const courseId of SLOT_COURSES) await completeFirstLesson(courseId);

    const courses = (await api.getPath()).stages.flatMap((stage) => stage.courses);

    expect(courses.length).toBeGreaterThan(SLOT_COURSES.length);
    for (const course of courses) {
      const inSlot = SLOT_COURSES.includes(course.id);
      expect(course.trialSlot).toBe(inSlot);
      expect(course.planLocked).toBe(!inSlot);
    }
    const detail = await api.getCourse(QUOTA_BLOCKED_COURSE);
    expect(detail.planLocked).toBe(true);
    expect(detail.trialSlot).toBe(false);
    expect((await api.getCourse(SLOT_COURSES[0])).trialSlot).toBe(true);
  });

  it('keeps every course open while slots remain', async () => {
    await registerTrial();
    await completeFirstLesson(SLOT_COURSES[0]);

    const courses = (await api.getPath()).stages.flatMap((stage) => stage.courses);

    expect(courses.every((course) => !course.planLocked)).toBe(true);
  });
});

describe('trial expiry (BR-14, AC-05)', () => {
  it('turns into the Free plan on the next session and keeps all learning data', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    moveTo(START.getTime());
    const userId = await registerTrial();
    await api.submitDiagnostic(allCorrect());
    await completeFirstLesson(SLOT_COURSES[0]);
    await api.saveNotes(SLOT_COURSES[0], 'Ghi chú trong kỳ thử');
    const before = JSON.stringify(getPersonalState(userId));
    expect(composeSession(userId)?.subscription?.status).toBe('trialing');

    moveTo(START.getTime() + INDIVIDUAL_TRIAL.days * DAY_MS + 60_000);
    const session = composeSession(userId)!;

    expect(session.subscription).toMatchObject({ planCode: 'IND_FREE', planName: 'Miễn phí', status: 'active' });
    expect(session.subscription?.trialEndsAt).toBeDefined();
    expect(findUserByEmail(EMAIL)?.subscription?.planCode).toBe('IND_FREE');
    expect(JSON.stringify(getPersonalState(userId))).toBe(before);
    const access = await api.getAccess();
    expect(access.mode).toBe('free');
    expect(access.daysLeft).toBeNull();
  });

  it('is decided by the server clock: an API call after the end is already a Free call', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    moveTo(START.getTime());
    await registerTrial();
    moveTo(START.getTime() + INDIVIDUAL_TRIAL.days * DAY_MS + 1000);

    const refused = await failure(completeFirstLesson(SLOT_COURSES[0]));

    expect(refused.codes).toEqual(['PLAN_REQUIRED']);
  });
});

describe('Free plan (BR-06, BR-07, BR-08, BR-11, AC-06)', () => {
  async function trialThenFree() {
    vi.useFakeTimers({ toFake: ['Date'] });
    moveTo(START.getTime());
    const userId = await registerTrial();
    await completeAllLessons('crs-M6-F');
    await completeFirstLesson('crs-A1-F');
    moveTo(START.getTime() + INDIVIDUAL_TRIAL.days * DAY_MS + 60_000);
    return userId;
  }

  it('refuses new lessons but keeps notes writable and finished lessons readable', async () => {
    await trialThenFree();
    const course = await api.getCourse('crs-A1-F');
    const nextLesson = course.modules[0].lessons[1];

    const refused = await failure(api.setLessonCompleted('crs-A1-F', nextLesson.id, true));
    expect(refused.status).toBe(403);
    expect(refused.codes).toEqual(['PLAN_REQUIRED']);
    expect(refused.message).toContain('Gói Miễn phí');

    await expect(api.saveNotes('crs-A1-F', 'Vẫn ghi chú được')).resolves.toEqual({ notes: 'Vẫn ghi chú được' });
    expect((await api.getCourse('crs-A1-F')).modules[0].lessons[0].completed).toBe(true);
  });

  it('keeps finished lessons as they are: taking one back is refused too, and nothing changes', async () => {
    const userId = await trialThenFree();
    const before = JSON.stringify(getPersonalState(userId).lessons);
    const done = (await api.getCourse('crs-A1-F')).modules[0].lessons[0];

    const refused = await failure(api.setLessonCompleted('crs-A1-F', done.id, false));

    expect(refused.codes).toEqual(['PLAN_REQUIRED']);
    expect(JSON.stringify(getPersonalState(userId).lessons)).toBe(before);
  });

  it('still lets the learner take the assessment of a course finished during the trial, and refuses other courses', async () => {
    await trialThenFree();

    expect((await api.getAssessment('crs-M6-F')).ready).toBe(true);
    const outcome = await api.submitAssessment('crs-M6-F', correctAnswersOf(6));
    expect(outcome.passed).toBe(true);
    expect(outcome.certificatePending).toBe(true);
    expect(outcome.certificateId).toBeNull();

    expect((await failure(api.getAssessment('crs-A2-F'))).codes).toEqual(['PLAN_REQUIRED']);
    expect((await failure(api.submitAssessment('crs-A2-F', {}))).codes).toEqual(['PLAN_REQUIRED']);
  });

  it('refuses a new practical task submission', async () => {
    await trialThenFree();

    const refused = await failure(api.submitTask('tsk-A1-F', { linkUrl: '', content: 'Mô tả bài làm đủ dài để hợp lệ.' }));

    expect(refused.codes).toEqual(['PLAN_REQUIRED']);
  });

  it('raises the competency level on a pass even when the plan is Free (BR-13)', async () => {
    await trialThenFree();
    const before = (await api.getProgress()).profile.flatMap((d) => d.items).find((i) => i.code === '6.1')!.level;

    await api.submitAssessment('crs-M6-F', correctAnswersOf(6));

    const after = (await api.getProgress()).profile.flatMap((d) => d.items).find((i) => i.code === '6.1')!.level;
    expect(after).toBeGreaterThan(before);
  });
});

describe('trial practical tasks (BR-08)', () => {
  it('accepts a task of a slot course and refuses one of a course outside the slots', async () => {
    await registerTrial();
    await completeFirstLesson('crs-A1-F');

    const task = await api.submitTask('tsk-A1-F', { linkUrl: '', content: 'Mô tả bài làm đủ dài để hợp lệ.' });
    expect(task.status).toBe('PENDING_REVIEW');

    const refused = await failure(api.submitTask('tsk-A2-F', { linkUrl: '', content: 'Mô tả bài làm đủ dài để hợp lệ.' }));
    expect(refused.codes).toEqual(['PLAN_REQUIRED']);
  });
});

describe('entry assessment limits (BR-09, AC-07)', () => {
  it('lets a trial learner take it once', async () => {
    await registerTrial();
    await api.submitDiagnostic(allCorrect());

    const refused = await failure(api.submitDiagnostic(allCorrect()));

    expect(refused.status).toBe(403);
    expect(refused.codes).toEqual(['DIAGNOSTIC_LIMIT']);
    expect((await api.getAccess()).diagnosticAvailable).toBe(false);
  });

  it('lets a Free learner retake it only after 30 days, with the date in the message', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    moveTo(START.getTime());
    await registerTrial();
    await api.submitDiagnostic(allCorrect());

    moveTo(START.getTime() + 29 * DAY_MS);
    const early = await failure(api.submitDiagnostic(allCorrect()));
    expect(early.codes).toEqual(['REASSESSMENT_NOT_DUE']);
    expect(early.message).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    const access = await api.getAccess();
    expect(access.diagnosticAvailable).toBe(false);
    // It opens at the start of the day announced in the message (30 days later), never later in that day.
    const opensAt = new Date(access.reassessAvailableAt!);
    expect([opensAt.getHours(), opensAt.getMinutes()]).toEqual([0, 0]);
    expect(opensAt.getTime()).toBeLessThanOrEqual(START.getTime() + 30 * DAY_MS);
    expect(opensAt.getTime()).toBeGreaterThan(START.getTime() + 29 * DAY_MS);

    moveTo(START.getTime() + 30 * DAY_MS);
    expect((await api.getAccess()).diagnosticAvailable).toBe(true);
    await expect(api.submitDiagnostic(allCorrect())).resolves.toBeDefined();
  });

  it('lets a Free learner who never took it take it right away', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    moveTo(START.getTime());
    await registerTrial();
    moveTo(START.getTime() + 8 * DAY_MS);

    expect((await api.getAccess()).diagnosticAvailable).toBe(true);
    await expect(api.submitDiagnostic(allCorrect())).resolves.toBeDefined();
  });
});

describe('target changes (BR-10)', () => {
  it('allows one change after the first choice during the trial, and none without a code change', async () => {
    await registerTrial('ACCOUNTANT');

    await api.setTarget('ACCOUNTANT');
    expect((await api.getAccess()).targetChangesLeft).toBe(1);

    await api.setTarget('HR');
    expect((await api.getAccess()).targetChangesLeft).toBe(0);

    const refused = await failure(api.setTarget('MARKETING'));
    expect(refused.status).toBe(403);
    expect(refused.codes).toEqual(['TARGET_CHANGE_LIMIT']);
    await expect(api.setTarget('HR')).resolves.toBeDefined();
  });

  it('does not count the first choice of an account that arrived without a position', async () => {
    await registerTrial(null);

    await api.setTarget('ACCOUNTANT');
    await api.setTarget('HR');

    expect((await api.getAccess()).targetChangesLeft).toBe(0);
  });

  it('lets a Free learner change the position freely', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    moveTo(START.getTime());
    await registerTrial('ACCOUNTANT');
    moveTo(START.getTime() + 8 * DAY_MS);

    await api.setTarget('HR');
    await api.setTarget('MARKETING');
    await expect(api.setTarget('CEO')).resolves.toBeDefined();
    expect((await api.getAccess()).targetChangesLeft).toBeNull();
  });
});

describe('certificates and the upgrade (BR-12, AC-04, AC-08)', () => {
  async function passFirstCourseInTrial() {
    await completeAllLessons('crs-M6-F');
    return api.submitAssessment('crs-M6-F', correctAnswersOf(6));
  }

  it('records a pass in a trial as a pending certificate without a code', async () => {
    await registerTrial();

    const outcome = await passFirstCourseInTrial();

    expect(outcome.passed).toBe(true);
    expect(outcome.certificatePending).toBe(true);
    const [certificate] = await api.getCertificates();
    expect(certificate).toMatchObject({ courseCode: 'M6-F', status: 'PENDING_UPGRADE', code: null, issuedAt: null });
    expect(certificate.passedAt).toBeTruthy();
    const access = await api.getAccess();
    expect(access.pendingCertificates).toBe(1);
    expect(access.checklist.find((item) => item.key === 'first-course')?.done).toBe(true);
  });

  it('issues the waiting certificates on the day of payment and goes straight to the dashboard', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    moveTo(START.getTime());
    const userId = await registerTrial();
    await passFirstCourseInTrial();

    const paidAt = START.getTime() + 10 * DAY_MS;
    moveTo(paidAt);
    const selection = { planCode: 'IND_PLUS', seats: 1, cycle: 'month' as const };
    const draft = (await mockPurchaseService.createDraft(selection, 'individual', userId)).data.data!;
    const order = (await mockCheckoutService.createOrder(selection, draft.id)).data.data!;
    await mockCheckoutService.confirmPayment(order.id, 'paid');

    const session = composeSession(userId)!;
    expect(session.subscription).toMatchObject({ planCode: 'IND_PLUS', status: 'active' });
    expect(session.subscription?.startedAt).toBe(new Date(paidAt).toISOString());
    expect(session.onboardingStatus).toBeUndefined();
    const [certificate] = await api.getCertificates();
    expect(certificate.status).toBe('ISSUED');
    expect(certificate.issuedAt).toBe(new Date(paidAt).toISOString());
    expect(certificate.code).toBe('DTC-20261016-M6-F');
    expect((await api.getAccess()).mode).toBe('full');
  });

  it('sends an upgrader without a target back through onboarding', async () => {
    const userId = await registerTrial(null);
    const selection = { planCode: 'IND_PLUS', seats: 1, cycle: 'month' as const };
    const draft = (await mockPurchaseService.createDraft(selection, 'individual', userId)).data.data!;
    const order = (await mockCheckoutService.createOrder(selection, draft.id)).data.data!;
    await mockCheckoutService.confirmPayment(order.id, 'paid');

    expect(composeSession(userId)?.onboardingStatus).toBe('setup');
  });

  it('keeps a failed payment from changing the trial (edge case 7)', async () => {
    const userId = await registerTrial();
    const selection = { planCode: 'IND_PLUS', seats: 1, cycle: 'month' as const };
    const order = (await mockCheckoutService.createOrder(selection)).data.data!;

    await mockCheckoutService.confirmPayment(order.id, 'failed');

    expect(composeSession(userId)?.subscription?.status).toBe('trialing');
  });

  it('refuses to pay for a plan that is not sold, such as the Free plan', async () => {
    await registerTrial();

    await expect(mockCheckoutService.createOrder({ planCode: 'IND_FREE', seats: 1, cycle: 'month' }))
      .rejects.toMatchObject({ response: { status: 400 } });
  });
});

describe('seen markers (BR-18)', () => {
  it('accepts only known keys', async () => {
    await registerTrial();

    const refused = await failure(apiClient.put('/personal/seen/not-a-key'));

    expect(refused.status).toBe(400);
  });

  it('records the time of the first call and leaves it alone afterwards', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    moveTo(START.getTime());
    await registerTrial();

    const first = await api.markSeen('path');
    moveTo(START.getTime() + DAY_MS);
    const second = await api.markSeen('path');

    expect(first.path).toBe(START.toISOString());
    expect(second.path).toBe(START.toISOString());
    const access = await api.getAccess();
    expect(access.seen.path).toBe(START.toISOString());
    expect(access.checklist.find((item) => item.key === 'path')?.done).toBe(true);
  });
});

describe('what the plan does not open stays on the server', () => {
  it('sends a Free learner the outline of an unfinished lesson without its content, and the finished ones whole', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    moveTo(START.getTime());
    await registerTrial();
    await completeFirstLesson('crs-A1-F');
    moveTo(START.getTime() + 8 * DAY_MS);

    const [first, second] = (await api.getCourse('crs-A1-F')).modules[0].lessons;

    expect(first.completed).toBe(true);
    expect(first.body.length).toBeGreaterThan(0);
    expect(second.completed).toBe(false);
    expect(second.title).toBeTruthy();
    expect(second).toMatchObject({ summary: '', body: [], takeaways: [] });
    expect(second.practice).toBeUndefined();
  });

  it('sends no lesson content for a course the plan locks, in a trial with every slot used or on the Free plan', async () => {
    await registerTrial();
    for (const courseId of SLOT_COURSES) await completeFirstLesson(courseId);

    const locked = await api.getCourse(QUOTA_BLOCKED_COURSE);

    expect(locked.planLocked).toBe(true);
    for (const lesson of locked.modules.flatMap((module) => module.lessons)) {
      expect(lesson).toMatchObject({ summary: '', body: [], takeaways: [] });
    }
    const open = await api.getCourse(SLOT_COURSES[0]);
    expect(open.modules[0].lessons[0].body.length).toBeGreaterThan(0);
  });

  it('lets a paying learner read everything', async () => {
    signInAs('mock-personal');

    const course = await api.getCourse('crs-A1-A');

    for (const lesson of course.modules.flatMap((module) => module.lessons)) expect(lesson.body.length).toBeGreaterThan(0);
  });
});

describe('plan edge cases found in review', () => {
  it('gives an account that has no plan the Free plan, never full access', async () => {
    await mockRegistrationService.registerIndividual({
      fullName: 'Chưa Trả Tiền', email: 'chua.tra@example.vn', password: 'Matkhau1234',
      plan: { planCode: 'IND_PLUS', seats: 1, cycle: 'month' },
    });
    signInAs(findUserByEmail('chua.tra@example.vn')!.id);

    expect((await api.getAccess()).mode).toBe('free');
    expect((await failure(completeFirstLesson('crs-A1-F'))).codes).toEqual(['PLAN_REQUIRED']);
  });

  it('refuses to register for the Free plan as if it were a purchase', async () => {
    await expect(mockRegistrationService.registerIndividual({
      fullName: 'Gói Miễn Phí', email: 'goi.free@example.vn', password: 'Matkhau1234',
      plan: { planCode: 'IND_FREE', seats: 1, cycle: 'month' },
    })).rejects.toMatchObject({ response: { status: 400 } });
    expect(findUserByEmail('goi.free@example.vn')).toBeUndefined();
  });

  it('does not count a pending certificate as a certificate on the overview or in the activity', async () => {
    signInAs('mock-trial');

    const overview = await api.getOverview();

    expect(overview.certificateCount).toBe(0);
    expect(overview.activity.some((item) => item.kind === 'CERTIFICATE')).toBe(false);
  });

  it('offers a Free learner no next course and no lesson to continue', async () => {
    signInAs('mock-free');

    const overview = await api.getOverview();

    expect(overview.nextCourse).toBeNull();
    expect(overview.continueLesson).toBeNull();
    expect((await api.getPath()).nextCourse).toBeNull();
  });

  it('never offers a trial learner a next course the plan locks', async () => {
    await registerTrial();
    for (const courseId of SLOT_COURSES) await completeFirstLesson(courseId);

    const path = await api.getPath();

    expect(path.nextCourse).not.toBeNull();
    expect(path.nextCourse!.planLocked).toBe(false);
    expect(SLOT_COURSES).toContain(path.nextCourse!.id);
  });

  it('reads the saved progress on every call, so a second tab cannot hand out fresh slots', async () => {
    const userId = await registerTrial();
    await completeFirstLesson(SLOT_COURSES[0]);
    // Another tab used the remaining slots: the saved map changes behind this tab's back.
    const saved = JSON.parse(localStorage.getItem(PERSONAL_STATE_KEY)!);
    saved[userId].trialCourseIds.push(SLOT_COURSES[1], SLOT_COURSES[2]);
    localStorage.setItem(PERSONAL_STATE_KEY, JSON.stringify(saved));

    const refused = await failure(completeFirstLesson(QUOTA_BLOCKED_COURSE));

    expect(refused.codes).toEqual(['TRIAL_COURSE_LIMIT']);
    expect((await api.getAccess()).trialCourseIds).toEqual(SLOT_COURSES);
  });

  it('says which step is missing when a trial learner asks for the assessment of a course not started', async () => {
    await registerTrial();

    const refused = await failure(api.getAssessment('crs-A2-F'));

    expect(refused.codes).toEqual(['PLAN_REQUIRED']);
    expect(refused.message).toContain('lượt học thử');
    expect(refused.message).not.toContain('Gói Miễn phí');
  });

  it('lets the seeded trial@ pay and become a paying learner with its certificate issued (AC-08 on a demo account)', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    moveTo(Date.now());
    signInAs('mock-trial');
    const selection = { planCode: 'IND_PLUS', seats: 1, cycle: 'month' as const };
    const draft = (await mockPurchaseService.createDraft(selection, 'individual', 'mock-trial')).data.data!;
    const order = (await mockCheckoutService.createOrder(selection, draft.id)).data.data!;

    await mockCheckoutService.confirmPayment(order.id, 'paid');

    const session = composeSession('mock-trial')!;
    expect(session.subscription).toMatchObject({ planCode: 'IND_PLUS', status: 'active' });
    expect(session.onboardingStatus).toBeUndefined();
    expect((await api.getAccess()).mode).toBe('full');
    const [certificate] = await api.getCertificates();
    expect(certificate.status).toBe('ISSUED');
  });
});

describe('seeded demo accounts', () => {
  it('trial@ is on day 5 with two slots used and a pass recorded', async () => {
    signInAs('mock-trial');
    const access = await api.getAccess();

    expect(access.mode).toBe('trial');
    expect(access.daysLeft).toBe(2);
    expect(access.trialCourseIds).toHaveLength(2);
    expect(access.coursesLeft).toBe(1);
    expect(access.checklist.find((item) => item.key === 'diagnostic')?.done).toBe(true);
    expect(access.checklist.find((item) => item.key === 'first-course')?.done).toBe(true);
    expect(access.pendingCertificates).toBe(1);
  });

  it('free@ finished the trial three days ago and may retake the assessment in about 20 days', async () => {
    signInAs('mock-free');
    const access = await api.getAccess();

    expect(access.mode).toBe('free');
    expect(access.pendingCertificates).toBe(1);
    expect(access.diagnosticAvailable).toBe(false);
    const days = (new Date(access.reassessAvailableAt!).getTime() - Date.now()) / DAY_MS;
    expect(days).toBeGreaterThan(19);
    expect(days).toBeLessThan(21);
    expect(composeSession('mock-free')?.subscription?.planCode).toBe('IND_FREE');
  });

  it('gives the seeded trial and free accounts a verified session', () => {
    expect(composeSession('mock-trial')?.emailVerified).toBe(true);
    expect(composeSession('mock-free')?.emailVerified).toBe(true);
    expect(composeSession('mock-trial')?.subscription?.status).toBe('trialing');
  });
});

describe('personal@ is never blocked (AC-10)', () => {
  beforeEach(() => signInAs('mock-personal'));

  it('is on full access with no checklist and nothing pending', async () => {
    const access = await api.getAccess();

    expect(access.mode).toBe('full');
    expect(access.checklist).toEqual([]);
    expect(access.daysLeft).toBeNull();
    expect(access.courseLimit).toBeNull();
    expect(access.targetChangesLeft).toBeNull();
    expect(access.pendingCertificates).toBe(0);
  });

  it('completes lessons of any course, retakes the entry assessment and changes position freely', async () => {
    await expect(completeFirstLesson('crs-A1-A')).resolves.toBeDefined();
    await expect(api.submitDiagnostic(allCorrect())).resolves.toBeDefined();
    await expect(api.submitDiagnostic(allCorrect())).resolves.toBeDefined();
    await api.setTarget('HR');
    await expect(api.setTarget('CEO')).resolves.toBeDefined();
    const course = await api.getCourse('crs-A1-F');
    expect(course.planLocked).toBe(false);
    expect(course.trialSlot).toBe(false);
  });

  it('keeps issued certificates with a code and the date they were passed', async () => {
    const certificates = await api.getCertificates();

    expect(certificates.length).toBeGreaterThan(0);
    for (const certificate of certificates) {
      expect(certificate.status).toBe('ISSUED');
      expect(certificate.code).toMatch(/^DTC-\d{8}-/);
      expect(certificate.issuedAt).toBe(certificate.passedAt);
    }
  });
});

describe('state saved before the trial existed (edge case 9)', () => {
  it('fills the missing fields with defaults instead of failing', async () => {
    const { trialCourseIds: _a, targetChangeCount: _b, tryOrientation: _c, seen: _d, ...old } = demoState();
    resetMockDb();
    localStorage.setItem(PERSONAL_STATE_KEY, JSON.stringify({ 'mock-personal': old }));
    signInAs('mock-personal');

    const access = await api.getAccess();

    expect(access.mode).toBe('full');
    expect(access.seen).toEqual({});
    await expect(api.getOverview()).resolves.toBeDefined();
    // A course the learner had already started counts as a slot (BR-05).
    expect(getPersonalState('mock-personal').trialCourseIds).toEqual(['crs-M6-F', 'crs-A3-I']);
  });
});
