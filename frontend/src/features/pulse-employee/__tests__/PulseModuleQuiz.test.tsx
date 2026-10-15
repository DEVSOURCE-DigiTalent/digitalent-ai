import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import {
  pulseService,
  type PulseCourseSummary,
  type PulseModuleDetail,
  type PulseModuleQuiz,
  type PulseQuizResult,
  type PulseQuizReview,
} from '@/services/pulse.service';
import { PulseModulePage } from '../pages/PulseModulePage';
import { PULSE_PATHS } from '../lib/paths';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const ok = <T,>(data: T) => ({ data: { success: true, message: 'Success', data } }) as never;

const course: PulseCourseSummary = {
  courseId: 'course-1',
  code: 'M6-F',
  title: 'Ứng dụng AI cơ bản',
  categoryId: 'cat-6',
  domainNumber: 6,
  domainName: 'Ứng dụng trí tuệ nhân tạo',
  tier: 1,
  inPath: true,
  access: 'FREE_FULL',
  canWork: true,
  slotStatus: 'IN_PROGRESS',
  finalStatus: 'LEARNING',
  enrollmentId: 'enr-1',
  enrollmentStatus: 'IN_PROGRESS',
  moduleCount: 3,
  modulesPassed: 0,
  finalAttempts: 0,
};

const slides = [
  { lessonId: 'l-1', title: 'Lý thuyết nền tảng', lessonType: 'VIDEO', contentBody: 'Nội dung trang một', estimatedMinutes: 5 },
  { lessonId: 'l-2', title: 'Tình huống thực tế', lessonType: 'CASE_STUDY', contentBody: 'Nội dung trang hai', estimatedMinutes: 5 },
  { lessonId: 'l-3', title: 'Thực hành có hướng dẫn', lessonType: 'GUIDED_PRACTICE', contentBody: 'Nội dung trang ba', estimatedMinutes: 5 },
];

const quiz = (attemptNo: number, ids: string[]): PulseModuleQuiz => ({
  assessmentId: 'qz-1',
  attemptNo,
  questions: ids.map((id) => ({
    questionId: id,
    content: `Câu hỏi ${id}`,
    options: [
      { optionId: `${id}-a`, content: `Phương án A của ${id}` },
      { optionId: `${id}-b`, content: `Phương án B của ${id}` },
    ],
  })),
});

const review = (lessonId: string, index: number, done: boolean): PulseQuizReview => ({
  attemptNo: 1,
  failedAt: '2026-10-15T08:00:00Z',
  done,
  pages: [{ lessonId, index, title: slides[index]!.title, done }],
});

const lastQuiz = { score: 1, total: 2, passed: false, at: '2026-10-15T08:00:00Z' };

const detail = (overrides: Partial<PulseModuleDetail> = {}): PulseModuleDetail => ({
  course,
  module: { moduleId: 'mod-1', index: 0, title: 'Hiểu biết về AI', description: null, estimatedMinutes: 15 },
  modules: [{ moduleId: 'mod-1', index: 0, title: 'Hiểu biết về AI', passed: false, viewable: true }],
  sample: false,
  slides,
  viewed: true,
  quizPassed: false,
  lastQuiz: null,
  quiz: quiz(1, ['q1', 'q2']),
  review: null,
  quizBlockReason: null,
  nextModuleId: null,
  allModulesPassed: false,
  ...overrides,
});

const reviewing = (lessonId = 'l-2', index = 1) =>
  detail({ quiz: null, review: review(lessonId, index, false), quizBlockReason: 'REVIEW_REQUIRED', lastQuiz });

function renderModule() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[PULSE_PATHS.module('course-1', 'mod-1')]}>
        <Routes>
          <Route path="/enterprise/me/courses/:courseId/modules/:moduleId" element={<PulseModulePage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const answerAll = (ids: string[]) => {
  for (const id of ids) fireEvent.click(screen.getByLabelText(`Phương án A của ${id}`));
};

beforeEach(() => {
  vi.restoreAllMocks();
  useCurrentUser.setState({
    user: { id: 'user-1', email: 'employee@digitalent.ai', fullName: 'Nguyễn An', roles: [ROLES.EMPLOYEE], permissions: [], workspace: 'enterprise' },
    isAuthenticated: true,
  });
  vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok({ person: { positionName: 'Kế toán' } }));
  vi.spyOn(pulseService, 'markModuleViewed').mockResolvedValue(ok({ enrollmentId: 'enr-1', viewed: true, modulePassed: false }));
});

describe('Câu hỏi ôn tập mô đun (§9.2)', () => {
  it('sends the attempt number and, after a wrong attempt, points to the page to reopen instead of the answer', async () => {
    vi.spyOn(pulseService, 'getModule').mockResolvedValueOnce(ok(detail())).mockResolvedValue(ok(reviewing()));
    const result: PulseQuizResult = {
      score: 1,
      total: 2,
      passed: false,
      wrong: [{ questionId: 'q1', lessonId: 'l-2', pageIndex: 1, pageTitle: 'Tình huống thực tế' }],
      review: review('l-2', 1, false),
      modulePassed: false,
      nextModuleId: null,
      allModulesPassed: false,
    };
    const submit = vi.spyOn(pulseService, 'submitModuleQuiz').mockResolvedValue(ok(result));

    renderModule();
    expect(await screen.findByText(/Chưa đạt thì mở lại trang liên quan rồi làm lại với câu hỏi khác/)).toBeTruthy();
    answerAll(['q1', 'q2']);
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra câu trả lời →' }));

    await waitFor(() =>
      expect(submit).toHaveBeenCalledWith('course-1', 'mod-1', [{ questionId: 'q1', optionId: 'q1-a' }, { questionId: 'q2', optionId: 'q2-a' }], 1),
    );
    expect(await screen.findByRole('heading', { name: 'Xem lại trước lần làm thứ 2' })).toBeTruthy();
    expect(screen.getByText(/Lần 1 chưa đạt \(đúng 1\/2\)/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Mở lại trang 02 →' })).toBeTruthy();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    expect(screen.queryByText(/Đã đạt câu hỏi ôn tập/)).toBeNull();
    expect(screen.getByText('Xem lại trang trước khi làm lại')).toBeTruthy();
  });

  it('records the page when the learner reopens it, then serves the next attempt with other questions', async () => {
    vi.spyOn(pulseService, 'getModule')
      .mockResolvedValueOnce(ok(reviewing()))
      .mockResolvedValue(ok(detail({ quiz: quiz(2, ['q3', 'q4']), review: review('l-2', 1, true), lastQuiz })));
    const markPage = vi.spyOn(pulseService, 'markPageViewed').mockResolvedValue(ok({ lessonId: 'l-2', viewedAt: '2026-10-15T08:05:00Z', review: review('l-2', 1, true) }));
    const submit = vi.spyOn(pulseService, 'submitModuleQuiz').mockResolvedValue(ok({ score: 2, total: 2, passed: true, wrong: [], review: null, modulePassed: true, nextModuleId: null, allModulesPassed: true }));

    renderModule();
    fireEvent.click(await screen.findByRole('button', { name: 'Mở lại trang 02 →' }));
    await waitFor(() => expect(markPage).toHaveBeenCalledWith('course-1', 'mod-1', 'l-2'));
    expect(screen.getByText('Nội dung trang hai')).toBeTruthy();

    expect(await screen.findByText('Câu hỏi q3')).toBeTruthy();
    expect(screen.queryByText('Câu hỏi q1')).toBeNull();
    expect(screen.getByText(/lần làm thứ 2/)).toBeTruthy();
    answerAll(['q3', 'q4']);
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra câu trả lời →' }));
    await waitFor(() => expect(submit).toHaveBeenCalledWith('course-1', 'mod-1', expect.any(Array), 2));
  });

  it('counts a page only when the learner navigates to it, not the page already on screen', async () => {
    vi.spyOn(pulseService, 'getModule').mockResolvedValue(ok(reviewing('l-1', 0)));
    const markPage = vi.spyOn(pulseService, 'markPageViewed').mockResolvedValue(ok({ lessonId: 'l-1', viewedAt: '2026-10-15T08:05:00Z', review: review('l-1', 0, false) }));

    renderModule();
    expect(await screen.findByText('Nội dung trang một')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Trang tiếp theo →' }));
    expect(markPage).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '← Trước đó' }));
    await waitFor(() => expect(markPage).toHaveBeenCalledWith('course-1', 'mod-1', 'l-1'));
    expect(markPage).toHaveBeenCalledTimes(1);
  });
});
