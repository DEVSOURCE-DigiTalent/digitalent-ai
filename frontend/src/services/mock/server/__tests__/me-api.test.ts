import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../../../api-client';
import { resetMockDb } from '../../mock-store';
import { resetOrgStore } from '../org-store';
import { mockAdapter } from '../mock-adapter';
import { getCourseAssessment } from '../../../../features/learning/data/course-content';
import type {
  MyAchievements, MyAttemptResult, MyAttemptSession, MyCourseDetail, MyDashboard, MyEvidenceTimeline, MyTaskDetail,
} from '../../../me.service';

/** Trang cá nhân EM-01..EM-18 trên mock server: chỉ dữ liệu của người đăng nhập, luồng học → đánh giá → chứng chỉ. */

beforeAll(() => {
  apiClient.defaults.adapter = mockAdapter;
});

beforeEach(() => {
  localStorage.clear();
  resetMockDb();
  resetOrgStore();
  vi.stubGlobal('location', { pathname: '/login', search: '', href: '' });
  localStorage.setItem('accessToken', 'mock-token:mock-employee'); // emp-01, phòng Kinh doanh
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function call<T>(method: 'get' | 'post' | 'put', url: string, payload?: unknown): Promise<T> {
  const response = await apiClient.request({ method, url, ...(method === 'get' ? { params: payload } : { data: payload }) });
  return response.data.data as T;
}

async function failure(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    const response = (error as { response: { status: number; data: { message: string } } }).response;
    return { status: response.status, message: response.data.message };
  }
  throw new Error('Expected the request to fail');
}

describe('mock /me/* (EM-01..EM-18)', () => {
  it('builds the dashboard of the signed-in employee only', async () => {
    const dashboard = await call<MyDashboard>('get', '/me/dashboard');

    expect(dashboard.employee.fullName).toBe('Hoàng Văn Nhân Viên');
    expect(dashboard.tasks.total).toBeGreaterThan(0);
    expect(dashboard.activeTasks.every((t) => t.assignmentId !== 'tsk-002')).toBe(true);
  });

  it('takes a course from enrollment to a passed final and an issued certificate', async () => {
    const courseId = 'crs-A3-F';
    expect((await call<MyCourseDetail>('get', `/me/courses/${courseId}`)).canEnroll).toBe(true);
    await call('post', `/me/courses/${courseId}/enroll`);
    expect(await failure(call('post', `/me/courses/${courseId}/enroll`))).toMatchObject({ status: 409 });

    const course = await call<MyCourseDetail>('get', `/me/courses/${courseId}`);
    const [final] = course.assessments;
    expect(final.status).toBe('LOCKED');

    for (const lesson of course.modules.flatMap((m) => m.lessons)) {
      await call('post', `/me/courses/${courseId}/lessons/${lesson.id}/complete`);
    }
    const ready = await call<MyCourseDetail>('get', `/me/courses/${courseId}`);
    expect(ready.enrollment?.status).toBe('READY_FOR_ASSESSMENT');
    expect(ready.assessments[0].status).toBe('AVAILABLE');

    const session = await call<MyAttemptSession>('post', `/me/assessments/${final.id}/attempts`);
    const key = getCourseAssessment(courseId, 'A3-F', ready.title);
    const answers = Object.fromEntries(session.questions.map((q) => {
      const correct = key.questions.find((k) => k.id === q.id)!.correctOptionIndex;
      return [q.id, q.options[correct].id];
    }));
    await call('put', `/me/assessment-attempts/${session.attemptId}/answers`, { answers });
    const result = await call<MyAttemptResult>('post', `/me/assessment-attempts/${session.attemptId}/submit`, { answers: {} });

    expect(result).toMatchObject({ passed: true, score: 100, courseCompleted: true, revealAnswers: true });
    expect(result.certificate?.code).toMatch(/^DT-\d{4}-[0-9A-F]{8}$/);
    // Nộp lại cùng lượt không chấm lại (idempotent)
    expect((await call<MyAttemptResult>('post', `/me/assessment-attempts/${session.attemptId}/submit`, { answers: {} })).score).toBe(100);

    const achievements = await call<MyAchievements>('get', '/me/achievements');
    expect(achievements.certificates.some((c) => c.certificateCode === result.certificate?.code && c.status === 'VALID')).toBe(true);
  });

  it('hides answers of a failed attempt while attempts remain', async () => {
    const courseId = 'crs-A3-F';
    await call('post', `/me/courses/${courseId}/enroll`);
    const course = await call<MyCourseDetail>('get', `/me/courses/${courseId}`);
    for (const lesson of course.modules.flatMap((m) => m.lessons)) {
      await call('post', `/me/courses/${courseId}/lessons/${lesson.id}/complete`);
    }
    const session = await call<MyAttemptSession>('post', `/me/assessments/${course.assessments[0].id}/attempts`);
    const result = await call<MyAttemptResult>('post', `/me/assessment-attempts/${session.attemptId}/submit`, { answers: {} });

    expect(result).toMatchObject({ passed: false, revealAnswers: false, canRetake: true, attemptsRemaining: 2 });
    expect(result.questions.every((q) => q.correctOptionId === null)).toBe(true);
  });

  it('keeps every submitted version of a task and refuses tasks of colleagues', async () => {
    expect(await failure(call('get', '/me/tasks/tsk-002'))).toMatchObject({ status: 404 });
    expect(await failure(call('post', '/me/tasks/tsk-001/submissions', { content: 'quá ngắn' }))).toMatchObject({ status: 400 });

    await call('post', '/me/tasks/tsk-001/submissions', { content: 'Bản nộp đầu tiên cho nhiệm vụ tsk-001', linkUrls: [], attachmentIds: [] });
    expect(await failure(call('post', '/me/tasks/tsk-001/submissions', { content: 'Nộp lại khi đang chờ chấm điểm', linkUrls: [] })))
      .toMatchObject({ status: 409 });

    const detail = await call<MyTaskDetail>('get', '/me/tasks/tsk-001');
    expect(detail).toMatchObject({ status: 'SUBMITTED', canSubmit: false, submissionCount: 1 });

    const evidence = await call<MyEvidenceTimeline>('get', '/me/evidence');
    expect(evidence.items.filter((i) => i.kind === 'TASK_SUBMISSION').every((i) => i.assignmentId === 'tsk-001')).toBe(true);
  });

  it('shows a manager only their own tasks and refuses an account without employee profile', async () => {
    localStorage.setItem('accessToken', 'mock-token:mock-manager'); // emp-02, không được giao tsk-001
    expect(await failure(call('get', '/me/tasks/tsk-001'))).toMatchObject({ status: 404 });

    localStorage.setItem('accessToken', 'mock-token:mock-owner2');
    expect(await failure(call('get', '/me/dashboard'))).toMatchObject({ status: 403 });
  });
});
