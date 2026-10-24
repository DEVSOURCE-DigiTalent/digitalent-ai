import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../../../api-client';
import { resetMockDb } from '../../mock-store';
import { mockAdapter } from '../mock-adapter';
import { personalLearningService as api } from '../../../personal-learning.service';
import { ENTRY_QUESTIONS, questionsOfDomain } from '../personal/question-bank';

beforeAll(() => {
  apiClient.defaults.adapter = mockAdapter;
});

beforeEach(() => {
  localStorage.clear();
  resetMockDb();
  vi.stubGlobal('location', { pathname: '/login', search: '', href: '' });
  localStorage.setItem('accessToken', 'mock-token:mock-personal');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function failure(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    const response = (error as { response: { status: number; data: { errors: { message: string }[] } } }).response;
    return { status: response.status, codes: response.data.errors?.map((e) => e.message) ?? [] };
  }
  throw new Error('Expected the request to fail');
}

const allCorrect = () => Object.fromEntries(ENTRY_QUESTIONS.map((q) => [q.id, q.correctIndex]));

describe('personal track mock API', () => {
  it.each([
    ['fast-track-course', { courseId: 'crs-A3-I' }],
    ['fast-track-target', { positionCode: 'MARKETING' }],
    ['reset', {}],
  ])('does not expose demo mutation %s to learners', async (operation, body) => {
    const before = await api.getProgress();
    const response = await failure(apiClient.post(`/personal/demo/${operation}`, body));

    expect(response.status).toBe(404);
    expect(await api.getProgress()).toEqual(before);
  });

  it('does not disclose answer keys before an assessment is submitted', async () => {
    const assessment = await api.getAssessment('crs-A3-I');

    expect(assessment.questions.length).toBeGreaterThan(0);
    assessment.questions.forEach((question) => {
      expect(question).not.toHaveProperty('correctOptionIndex');
      expect(question).not.toHaveProperty('correctIndex');
    });
  });

  it('seeds the demo learner mid-way: Marketing target, assessed, one course done, one in progress', async () => {
    const overview = await api.getOverview();

    expect(overview.target?.code).toBe('MARKETING');
    expect(overview.assessed).toBe(true);
    expect(overview.certificateCount).toBe(1);
    expect(overview.continueLesson?.courseId).toBe('crs-A3-I');
    expect(overview.domains).toHaveLength(6);
  });

  it('builds the path in level stages from the assessed levels, exempting what is already reached', async () => {
    const path = await api.getPath();

    expect(path.stages.map((stage) => stage.level)).toEqual([1, 2, 3]);
    const codes = path.stages.flatMap((stage) => stage.courses.map((course) => course.code));
    // Domain 6 assessed at 0: the foundation course is on the path and already completed.
    expect(codes).toContain('M6-F');
    expect(path.stages[0].courses.find((c) => c.code === 'M6-F')?.status).toBe('COMPLETED');
    // Domain 1 assessed at Trung cấp: A1-F and A1-I are exempt, only A1-A remains.
    expect(path.exempt.map((course) => course.code)).toEqual(expect.arrayContaining(['A1-F', 'A1-I']));
    expect(codes).toContain('A1-A');
    expect(codes).not.toContain('A1-I');
    // A2-A needs A2-I first.
    expect(path.stages[2].courses.find((c) => c.code === 'A2-A')?.status).toBe('LOCKED');
  });

  it('scores the entry assessment adaptively: a level needs both of its questions right, a miss ends the domain', async () => {
    const answers = allCorrect();
    const wrong = ENTRY_QUESTIONS.find((q) => q.domainNumber === 4 && q.level === 2)!;
    answers[wrong.id] = (wrong.correctIndex + 1) % 4;

    const result = await api.submitDiagnostic(answers);

    expect(result.domains.map((d) => d.level)).toEqual([3, 3, 3, 1, 3, 3]);
    // The two Nâng cao questions of domain 4 are never asked once Trung cấp is missed.
    expect(result.total).toBe(ENTRY_QUESTIONS.length - 2);
    expect(result.correct).toBe(ENTRY_QUESTIONS.length - 3);
  });

  it('plans the entry assessment pair by pair', async () => {
    const first = await api.planDiagnostic({});
    expect(first).toMatchObject({ done: false, domainsDone: 0 });
    expect(first.askedIds).toHaveLength(2);

    // One wrong answer at Cơ bản ends domain 1 and moves on to domain 2.
    const [a, b] = first.askedIds;
    const question = ENTRY_QUESTIONS.find((q) => q.id === a)!;
    const next = await api.planDiagnostic({ [a]: (question.correctIndex + 1) % 4, [b]: 0 });
    expect(next.domainsDone).toBe(1);
    expect(next.askedIds.slice(2).every((id) => ENTRY_QUESTIONS.find((q) => q.id === id)!.domainNumber === 2)).toBe(true);
  });

  it('rejects an incomplete entry assessment', async () => {
    const { status, codes } = await failure(api.submitDiagnostic({ [ENTRY_QUESTIONS[0].id]: 0 }));
    expect(status).toBe(400);
    expect(codes).toContain('UNANSWERED_QUESTIONS');
  });

  it('completes a course: lessons, then the assessment raises levels and issues a certificate', async () => {
    const before = await api.getCourse('crs-A3-I');
    expect(before.status).toBe('IN_PROGRESS');
    expect((await failure(api.submitAssessment('crs-A3-I', {}))).codes).toContain('LESSONS_NOT_COMPLETED');

    for (const lesson of before.modules.flatMap((m) => m.lessons).filter((l) => !l.completed)) {
      await api.setLessonCompleted('crs-A3-I', lesson.id, true);
    }
    const answers = Object.fromEntries(questionsOfDomain(3).map((q) => [q.id, q.correctIndex]));
    const outcome = await api.submitAssessment('crs-A3-I', answers);

    // A Trung cấp course waits for its practice task: no certificate, no level yet.
    expect(outcome).toMatchObject({ passed: true, taskRequired: true, certificateId: null });
    const waiting = await api.getCourse('crs-A3-I');
    expect(waiting).toMatchObject({ status: 'IN_PROGRESS', awaitingTask: true });
    expect((await api.getCertificates()).map((c) => c.courseCode)).not.toContain('A3-I');

    const task = await api.submitTask('tsk-A3-I', { linkUrl: 'https://example.com/ke-hoach', content: `Kế hoạch nội dung tháng 10: chuyển thể 3 bài blog cũ thành infographic, cập nhật số liệu Q3 từ báo cáo nội bộ,
kiểm tra giấy phép từng ảnh và ghi nguồn, lịch đăng 4 tuần với người duyệt cho từng bài. Mỗi tiêu chí có ví dụ trong tài liệu.`, checks: [0, 1, 2] });
    expect(task.status).toBe('APPROVED');
    const after = await api.getCourse('crs-A3-I');
    expect(after.status).toBe('COMPLETED');
    expect(after.competencies.every((c) => c.currentLevel >= 2)).toBe(true);
    expect((await api.getCertificates()).map((c) => c.courseCode)).toContain('A3-I');
    // The advanced course of the domain opens.
    expect((await api.getCourse('crs-A3-A')).status).toBe('AVAILABLE');
  });

  it('refuses lessons of a locked course and tasks of a course not started', async () => {
    const lesson = (await api.getCourse('crs-A2-A')).modules[0].lessons[0];
    expect((await failure(api.setLessonCompleted('crs-A2-A', lesson.id, true))).codes).toContain('PREREQUISITE_NOT_MET');
    expect((await failure(api.submitTask('tsk-A2-I', { linkUrl: '', content: 'Mô tả đủ dài cho bài làm thực hành.', checks: [] }))).codes)
      .toContain('TASK_LOCKED');
  });

  it('reviews a practical task against its rubric at once: revision first, then approval', async () => {
    const draft = await api.submitTask('tsk-A3-I', {
      linkUrl: 'https://example.com/ke-hoach-noi-dung',
      content: 'Chuyển thể 3 bài blog cũ thành infographic, cập nhật số liệu Q3.',
      checks: [0],
    });
    expect(draft.status).toBe('REVISION_REQUESTED');
    expect(draft.submission?.criteria?.filter((c) => !c.met)).toHaveLength(draft.rubric.length - 1);
    expect(draft.submission?.reviewer).toBe('AI_RUBRIC');
    expect(draft.required).toBe(true);
    expect(draft.attemptsLeft).toBe(2);

    const approved = await api.submitTask('tsk-A3-I', {
      linkUrl: 'https://example.com/ke-hoach-noi-dung', content: `Kế hoạch nội dung tháng 10: chuyển thể 3 bài blog cũ thành infographic, cập nhật số liệu Q3 từ báo cáo nội bộ,
kiểm tra giấy phép từng ảnh và ghi nguồn, lịch đăng 4 tuần với người duyệt cho từng bài. Mỗi tiêu chí có ví dụ trong tài liệu.`, checks: draft.rubric.map((_, index) => index),
    });
    expect(approved.status).toBe('APPROVED');
    expect(approved.submission?.score).toBeGreaterThanOrEqual(80);
    expect((await failure(api.submitTask('tsk-A3-I', { linkUrl: '', content: 'Nộp lại lần nữa với mô tả đủ dài.', checks: [] }))).codes)
      .toContain('ALREADY_SUBMITTED');
  });

  it('allows three submissions of a task in 24 hours', async () => {
    const weak = { linkUrl: '', content: 'Bài làm còn sơ sài, chưa đủ ý.', checks: [] };
    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect((await api.submitTask('tsk-A3-I', weak)).status).toBe('REVISION_REQUESTED');
    }
    expect((await failure(api.submitTask('tsk-A3-I', weak))).codes).toContain('TASK_ATTEMPT_LIMIT');
  });

  it('keeps enterprise accounts out of the personal track', async () => {
    localStorage.setItem('accessToken', 'mock-token:mock-employee');
    expect((await failure(api.getOverview())).status).toBe(403);
  });
});
