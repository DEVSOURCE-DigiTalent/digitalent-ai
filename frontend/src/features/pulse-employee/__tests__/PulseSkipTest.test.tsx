import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import {
  pulseService,
  type PulseCourseSummary,
  type PulseSkipTest,
  type PulseSkipTestResult,
} from '@/services/pulse.service';
import { PulseSkipTestPage } from '../pages/PulseSkipTestPage';
import { PULSE_PATHS } from '../lib/paths';

const ok = <T,>(data: T) => ({ data: { success: true, message: 'Success', data } }) as never;

const course: PulseCourseSummary = {
  courseId: 'course-1',
  code: 'M1-F',
  title: 'Công cụ số cơ bản',
  categoryId: 'cat-1',
  domainNumber: 1,
  domainName: 'Khai thác dữ liệu và thông tin',
  tier: 1,
  zone: 'PATH',
  inPath: true,
  access: 'FREE_FULL',
  canWork: true,
  slotStatus: 'IN_PROGRESS',
  finalStatus: 'LEARNING',
  preStatus: 'NOT_YET',
  canStartPreAssessment: false,
  canStartFinal: false,
  approved: false,
  enrollmentId: 'enr-1',
  enrollmentStatus: 'IN_PROGRESS',
  moduleCount: 2,
  modulesPassed: 0,
  progressPercent: 0,
  finalAttempts: 0,
  modules: [],
};

const ids = ['q1', 'q2', 'q3', 'q4', 'q5'];

const base: PulseSkipTest = {
  course,
  status: 'AVAILABLE',
  message: null,
  questionCount: 5,
  passPercent: 80,
  passMark: 4,
  timeLimitMinutes: 30,
  maxAttempts: 1,
  attemptsUsed: 0,
  attemptsLeft: 1,
  moduleCount: 2,
  attempt: null,
  results: [],
};

const inProgress: PulseSkipTest = {
  ...base,
  status: 'IN_PROGRESS',
  attemptsUsed: 1,
  attemptsLeft: 0,
  attempt: {
    attemptNo: 1,
    startedAt: new Date().toISOString(),
    deadlineAt: new Date(Date.now() + 30 * 60_000).toISOString(),
    questions: ids.map((id, i) => ({
      questionId: id,
      number: i + 1,
      content: `Câu hỏi ${id}`,
      options: [
        { optionId: `${id}-a`, content: `Phương án A của ${id}` },
        { optionId: `${id}-b`, content: `Phương án B của ${id}` },
      ],
    })),
  },
};

const passedResult: PulseSkipTestResult = {
  attemptNo: 1,
  score: 5,
  total: 5,
  percent: 100,
  passMark: 4,
  passed: true,
  expired: false,
  startedAt: new Date().toISOString(),
  submittedAt: new Date().toISOString(),
  modules: [
    { index: 0, title: 'Tìm kiếm thông tin', correct: 3, total: 3 },
    { index: 1, title: 'Lưu trữ dữ liệu', correct: 2, total: 2 },
  ],
};

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[PULSE_PATHS.skipTest('course-1')]}>
        <Routes>
          <Route path="/enterprise/me/courses/:courseId/skip-test" element={<PulseSkipTestPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  try {
    sessionStorage.clear();
  } catch {
    /* jsdom */
  }
  useCurrentUser.setState({
    user: { id: 'user-1', email: 'employee@digitalent.ai', fullName: 'Nguyễn An', roles: [ROLES.EMPLOYEE], permissions: [], workspace: 'enterprise' },
    isAuthenticated: true,
  });
});

describe('Kiểm tra đầu vào (EM-15)', () => {
  it('starts the timed test, sends the chosen options and opens the final on a pass', async () => {
    vi.spyOn(pulseService, 'getSkipTest').mockResolvedValue(ok(base));
    vi.spyOn(pulseService, 'startSkipTest').mockResolvedValue(ok(inProgress));
    const submit = vi.spyOn(pulseService, 'submitSkipTest').mockResolvedValue(
      ok({ ...base, status: 'PASSED', attemptsUsed: 1, attemptsLeft: 0, results: [passedResult], result: passedResult, finalUnlocked: true }),
    );
    renderPage();

    expect(await screen.findByText(/Đạt khi đúng từ/)).toBeTruthy();
    expect(screen.getByText('1 lần duy nhất')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Bắt đầu làm bài/ }));
    // Chỉ một lần làm: phải xác nhận trước khi tính giờ.
    expect(screen.getByRole('alertdialog').textContent).toContain('Bạn chỉ có một lần làm');
    expect(pulseService.startSkipTest).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu ngay' }));

    // Một câu mỗi lần: chọn rồi sang câu sau; câu cuối có nút xem lại & nộp.
    expect(await screen.findByText('Câu hỏi q1')).toBeTruthy();
    ids.forEach((id, i) => {
      fireEvent.click(screen.getByLabelText(`Phương án A của ${id}`));
      if (i < ids.length - 1) fireEvent.click(screen.getByRole('button', { name: 'Câu sau' }));
    });
    fireEvent.click(screen.getByRole('button', { name: 'Xem lại & nộp bài' }));

    // Luôn hỏi lại trước khi nộp, kể cả khi đã chọn đủ.
    expect(screen.getByRole('alertdialog').textContent).toContain('Bạn đã chọn đủ 5 câu');
    expect(submit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận nộp bài' }));

    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    const [courseId, attemptNo, answers] = submit.mock.calls[0]!;
    expect(courseId).toBe('course-1');
    expect(attemptNo).toBe(1);
    expect(answers).toHaveLength(5);
    expect(answers).toContainEqual({ questionId: 'q1', optionId: 'q1-a' });

    expect(await screen.findByText('Chúc mừng! Bạn được bỏ qua phần học')).toBeTruthy();
    const finalLink = screen.getByRole('link', { name: /Làm bài đánh giá cuối khóa/ });
    expect(finalLink.getAttribute('href')).toBe(PULSE_PATHS.final('course-1'));
  });

  it('asks for confirmation before submitting with unanswered questions', async () => {
    vi.spyOn(pulseService, 'getSkipTest').mockResolvedValue(ok(inProgress));
    const submit = vi.spyOn(pulseService, 'submitSkipTest');
    renderPage();

    expect(await screen.findByText('Câu hỏi q1')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Phương án A của q1'));
    fireEvent.click(screen.getByRole('button', { name: 'Nộp bài' }));

    expect(screen.getByRole('alertdialog').textContent).toContain('Còn 4 câu chưa chọn');
    expect(submit).not.toHaveBeenCalled();

    // Bấm số câu chưa chọn trong hộp thoại: đóng hộp thoại và mở đúng câu đó.
    fireEvent.click(screen.getByRole('button', { name: 'Tới câu 03' }));
    expect(await screen.findByText('Câu hỏi q3')).toBeTruthy();
    expect(submit).not.toHaveBeenCalled();
  });

  it('answers, moves and flags with the keyboard', async () => {
    vi.spyOn(pulseService, 'getSkipTest').mockResolvedValue(ok(inProgress));
    renderPage();

    expect(await screen.findByText('Câu hỏi q1')).toBeTruthy();
    fireEvent.keyDown(document.body, { key: 'b' });
    expect((screen.getByLabelText('Phương án B của q1') as HTMLInputElement).checked).toBe(true);
    expect(screen.getByRole('button', { name: 'Câu 01, đã chọn' })).toBeTruthy();

    fireEvent.keyDown(document.body, { key: 'ArrowRight' });
    expect(await screen.findByText('Câu hỏi q2')).toBeTruthy();
    fireEvent.keyDown(document.body, { key: 'f' });
    expect(screen.getByRole('button', { name: /Đã đánh dấu xem lại/ }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Câu 02, chưa chọn, đánh dấu xem lại' })).toBeTruthy();

    fireEvent.keyDown(document.body, { key: 'ArrowLeft' });
    expect(await screen.findByText('Câu hỏi q1')).toBeTruthy();
  });

  it('restores the saved choices, position and flags after a reload', async () => {
    sessionStorage.setItem('dt-skip-test:course-1:1', JSON.stringify({ q2: 'q2-b', q9: 'x' }));
    sessionStorage.setItem('dt-skip-test:course-1:1:ui', JSON.stringify({ index: 1, flags: ['q3'] }));
    vi.spyOn(pulseService, 'getSkipTest').mockResolvedValue(ok(inProgress));
    renderPage();

    expect(await screen.findByText('Câu hỏi q2')).toBeTruthy();
    expect((screen.getByLabelText('Phương án B của q2') as HTMLInputElement).checked).toBe(true);
    expect(screen.getByRole('button', { name: 'Câu 03, chưa chọn, đánh dấu xem lại' })).toBeTruthy();
    // Lựa chọn không thuộc đề (q9) bị bỏ.
    expect(screen.getByRole('progressbar', { name: 'Số câu đã chọn' }).getAttribute('aria-valuenow')).toBe('1');
  });

  it('does not offer a second attempt after the only one failed', async () => {
    const message = 'Bài kiểm tra đầu vào chỉ được làm một lần và bạn đã làm nhưng chưa đạt.';
    vi.spyOn(pulseService, 'getSkipTest').mockResolvedValue(
      ok({
        ...base,
        status: 'EXHAUSTED',
        attemptsUsed: 1,
        attemptsLeft: 0,
        message,
        results: [{ ...passedResult, passed: false, score: 2 }],
      }),
    );
    renderPage();

    // Mở lại trang khi bài đã xong: vào thẳng kết quả, không có nút làm lại.
    expect(await screen.findByText(message)).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Chưa đạt bài kiểm tra đầu vào' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Bắt đầu làm bài|Làm lại/ })).toBeNull();
    const learn = screen.getByRole('link', { name: /Bắt đầu học các mô-đun/ });
    expect(learn.getAttribute('href')).toBe(PULSE_PATHS.course('course-1'));
    expect(screen.getByText('Tìm kiếm thông tin')).toBeTruthy();
  });
});
