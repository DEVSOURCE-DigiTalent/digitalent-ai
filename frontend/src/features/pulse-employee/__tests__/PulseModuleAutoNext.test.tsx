import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import { pulseService, type PulseCourseSummary, type PulseModuleDetail, type PulseQuizResult } from '@/services/pulse.service';
import { PulseModulePage } from '../pages/PulseModulePage';
import { PULSE_PATHS } from '../lib/paths';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const ok = <T,>(data: T) => ({ data: { success: true, message: 'Success', data } }) as never;

const course = {
  courseId: 'course-1', code: 'M1-F', title: 'Tìm kiếm cơ bản', categoryId: 'cat-1', domainNumber: 1,
  domainName: 'Khai thác dữ liệu và thông tin', tier: 1, zone: 'PATH', inPath: true, access: 'FREE_FULL', canWork: true,
  slotStatus: 'IN_PROGRESS', finalStatus: 'LEARNING', preStatus: 'NOT_YET', canStartPreAssessment: false,
  canStartFinal: false, approved: false, enrollmentId: 'enr-1', enrollmentStatus: 'IN_PROGRESS', moduleCount: 2,
  modulesPassed: 0, progressPercent: 0, finalAttempts: 0, modules: [],
} as PulseCourseSummary;

const detail = (nextModuleId: string | null): PulseModuleDetail => ({
  course,
  module: { moduleId: 'mod-1', index: 0, title: 'Nguồn tin cậy', description: null, estimatedMinutes: 15 },
  modules: [{ moduleId: 'mod-1', index: 0, title: 'Nguồn tin cậy', passed: false, viewable: true }],
  sample: false,
  slides: [{ lessonId: 'l-1', title: 'Lý thuyết', lessonType: 'TEXT', contentBody: 'Nội dung', estimatedMinutes: 5 }],
  viewed: true,
  quizPassed: false,
  lastQuiz: null,
  quiz: {
    assessmentId: 'qz-1',
    attemptNo: 1,
    questions: ['q1', 'q2'].map((id) => ({
      questionId: id,
      content: `Câu hỏi ${id}`,
      options: [{ optionId: `${id}-a`, content: `Phương án A của ${id}` }, { optionId: `${id}-b`, content: `Phương án B của ${id}` }],
    })),
  },
  review: null,
  quizBlockReason: null,
  nextModuleId,
  allModulesPassed: false,
} as PulseModuleDetail);

const passed = (nextModuleId: string | null): PulseQuizResult => ({
  score: 2, total: 2, passed: true, wrong: [], review: null, modulePassed: true, nextModuleId, allModulesPassed: nextModuleId === null,
} as PulseQuizResult);

function Location() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

function renderModule() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[PULSE_PATHS.module('course-1', 'mod-1')]}>
        <Routes>
          <Route path="/enterprise/me/courses/:courseId/modules/:moduleId" element={<PulseModulePage />} />
        </Routes>
        <Location />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function passQuiz(nextModuleId: string | null) {
  // As the real API does: the refetch after passing reports the quiz as passed and already serves a new
  // attempt, which remounts the quiz form (the success card and countdown must survive that).
  const before = detail(nextModuleId);
  const after = { ...before, quizPassed: true, lastQuiz: { score: 2, total: 2, passed: true, at: '2026-11-13T08:00:00Z' }, quiz: { ...before.quiz!, attemptNo: 2 } } as PulseModuleDetail;
  vi.spyOn(pulseService, 'getModule').mockResolvedValueOnce(ok(before)).mockResolvedValue(ok(after));
  vi.spyOn(pulseService, 'submitModuleQuiz').mockResolvedValue(ok(passed(nextModuleId)));
  renderModule();
  fireEvent.click(await screen.findByRole('button', { name: /Bài kiểm tra \(2 câu\)/ }));
  fireEvent.click(await screen.findByLabelText(/Phương án A của q1/));
  fireEvent.click(screen.getByLabelText(/Phương án A của q2/));
  fireEvent.click(screen.getByRole('button', { name: /Nộp bài kiểm tra/ }));
  await screen.findByRole('heading', { name: 'Hoàn thành xuất sắc bài kiểm tra!' });
}

async function wait(seconds: number) {
  for (let i = 0; i < seconds; i += 1) {
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
  }
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.restoreAllMocks();
  useCurrentUser.setState({
    user: { id: 'user-1', email: 'employee@digitalent.ai', fullName: 'Nguyễn An', roles: [ROLES.EMPLOYEE], permissions: [], workspace: 'enterprise' },
    isAuthenticated: true,
  });
  vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok({ person: { positionName: 'Kế toán' } }));
  vi.spyOn(pulseService, 'markModuleViewed').mockResolvedValue(ok({ enrollmentId: 'enr-1', viewed: true, modulePassed: false }));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('after passing a module quiz', () => {
  it('moves on to the next module by itself after a short countdown', async () => {
    await passQuiz('mod-2');
    expect(screen.getByText(/Tự chuyển sang mô-đun tiếp theo sau/).textContent).toMatch(/sau 5 giây/);

    await wait(5);

    expect(screen.getByTestId('location').textContent).toBe(PULSE_PATHS.module('course-1', 'mod-2'));
  });

  it('stays on the page when the learner asks to', async () => {
    await passQuiz('mod-2');
    fireEvent.click(screen.getByRole('button', { name: 'Ở lại trang này' }));

    await wait(6);

    expect(screen.getByTestId('location').textContent).toBe(PULSE_PATHS.module('course-1', 'mod-1'));
    expect(screen.queryByText(/Tự chuyển sang mô-đun tiếp theo/)).toBeNull();
  });

  it('does not open the proctored course final by itself after the last module', async () => {
    await passQuiz(null);
    expect(screen.queryByText(/Tự chuyển sang mô-đun tiếp theo/)).toBeNull();

    await wait(6);

    expect(screen.getByTestId('location').textContent).toBe(PULSE_PATHS.module('course-1', 'mod-1'));
    expect(screen.getByRole('link', { name: 'Đến bài đánh giá cuối khóa →' })).toBeTruthy();
  });
});
