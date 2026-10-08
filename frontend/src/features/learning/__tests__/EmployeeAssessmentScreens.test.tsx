import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import * as meHooks from '@/hooks/use-me';
import type { MyAssessmentCard, MyAttemptResult, MyAttemptSession } from '@/services/me.service';
import { MyAssessmentsPage } from '../pages/MyAssessmentsPage';
import { AssessmentIntroPage } from '../pages/AssessmentIntroPage';
import { AssessmentAttemptPage } from '../pages/AssessmentAttemptPage';
import { AssessmentResultPage } from '../pages/AssessmentResultPage';
import { AssessmentHistoryPage } from '../pages/AssessmentHistoryPage';
import { assessmentCard, mutation, query, renderPage, signInAsEmployee } from '@/features/employee/__tests__/em-test-utils';

/** EM-09 Danh sách, EM-10 Giới thiệu, EM-11 Làm bài (tự lưu, hết giờ), EM-12 Kết quả, EM-13 Lịch sử. */

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() } }));

beforeEach(() => {
  vi.restoreAllMocks();
  vi.mocked(toast.warning).mockClear();
  signInAsEmployee();
});

const card = (overrides: Partial<MyAssessmentCard>): MyAssessmentCard => ({ ...assessmentCard, ...overrides });

describe('EM-09 Danh sách bài đánh giá', () => {
  it('filters by status and links a passed assessment to its result', () => {
    vi.spyOn(meHooks, 'useMyAssessments').mockReturnValue(query({
      items: [
        card({ id: 'asm-quiz', title: 'Kiểm tra nhanh: An toàn thông tin', assessmentType: 'QUIZ', isFinal: false }),
        card({ id: 'asm-a2f', title: 'Bài đánh giá cuối khóa A2-F', status: 'PASSED', passed: true, latestAttemptId: 'att-9', canStart: false }),
      ],
      summary: { total: 2, available: 1, inProgress: 0, passed: 1, retake: 0, locked: 0 },
    }));

    renderPage(<MyAssessmentsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Đã đạt (1)' }));

    expect(screen.queryByText('Kiểm tra nhanh: An toàn thông tin')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Xem kết quả/ })).toHaveAttribute('href', '/enterprise/me/assessments/asm-a2f/result?attempt=att-9');
  });
});

describe('EM-10 Giới thiệu bài đánh giá', () => {
  const renderIntro = (assessment: MyAssessmentCard) => {
    vi.spyOn(meHooks, 'useStartAttempt').mockReturnValue(mutation());
    vi.spyOn(meHooks, 'useMyAssessment').mockReturnValue(query({ ...assessment, totalPoints: 3, competencies: [], attempts: [] }));
    renderPage(<AssessmentIntroPage />, { path: '/enterprise/me/assessments/:id', at: `/enterprise/me/assessments/${assessment.id}` });
  };

  it('keeps a locked final closed and says why', () => {
    renderIntro(card({ status: 'LOCKED', canStart: false, lockedReason: 'Hoàn thành các bài học bắt buộc của khóa để mở bài đánh giá cuối khóa.' }));

    expect(screen.getByRole('button', { name: /Bắt đầu làm bài/ })).toBeDisabled();
    expect(screen.getByText('Hoàn thành các bài học bắt buộc của khóa để mở bài đánh giá cuối khóa.')).toBeInTheDocument();
  });

  it('offers to continue an attempt in progress', () => {
    renderIntro(card({ status: 'IN_PROGRESS', inProgressAttemptId: 'att-1' }));
    expect(screen.getByRole('button', { name: /Tiếp tục làm bài/ })).toBeEnabled();
  });

  it('links a passed assessment to its result instead of starting again', () => {
    renderIntro(card({ status: 'PASSED', passed: true, latestAttemptId: 'att-9', canStart: false }));
    expect(screen.getByRole('link', { name: /Xem kết quả đã đạt/ })).toHaveAttribute('href', '/enterprise/me/assessments/asm-1/result?attempt=att-9');
  });
});

describe('EM-11 Làm bài đánh giá', () => {
  const session = (deadline: Date): MyAttemptSession => ({
    attemptId: 'att-1', assessmentId: 'asm-1', assessmentTitle: assessmentCard.title, assessmentType: 'FINAL', isFinal: true,
    courseId: 'crs-1', courseCode: 'A4-I', courseTitle: assessmentCard.courseTitle, attemptNo: 1, status: 'STARTED',
    startedAt: new Date(deadline.getTime() - 15 * 60_000).toISOString(), deadline: deadline.toISOString(), serverNow: new Date().toISOString(),
    timeLimitMinutes: 15, passingScore: 70,
    questions: [
      { id: 'q1', text: 'Cách bảo vệ tài khoản tốt nhất?', questionType: 'MULTIPLE_CHOICE', points: 1, options: [{ id: 'q1-a', content: 'Dùng chung mật khẩu' }, { id: 'q1-b', content: 'Bật xác thực hai lớp' }] },
      { id: 'q2', text: 'Gặp email lừa đảo thì làm gì?', questionType: 'MULTIPLE_CHOICE', points: 1, options: [{ id: 'q2-a', content: 'Báo IT' }, { id: 'q2-b', content: 'Bấm vào link' }] },
    ],
    answers: { q2: 'q2-a' },
  });
  const renderAttempt = (s: MyAttemptSession, save: ReturnType<typeof vi.fn>, submit: ReturnType<typeof vi.fn>) => {
    vi.spyOn(meHooks, 'useStartAttempt').mockReturnValue(mutation());
    vi.spyOn(meHooks, 'useAttemptSession').mockReturnValue(query(s));
    vi.spyOn(meHooks, 'useSaveAttemptAnswers').mockReturnValue(mutation(save));
    vi.spyOn(meHooks, 'useSubmitAttempt').mockReturnValue(mutation(submit));
    renderPage(<AssessmentAttemptPage />, { path: '/enterprise/me/assessments/:id/attempt', at: '/enterprise/me/assessments/asm-1/attempt?attempt=att-1' });
  };

  it('autosaves only the changed answer shortly after it is chosen', async () => {
    const save = vi.fn().mockResolvedValue({ savedCount: 1, serverNow: new Date().toISOString() });
    renderAttempt(session(new Date(Date.now() + 15 * 60_000)), save, vi.fn());

    fireEvent.click(screen.getByRole('radio', { name: /Bật xác thực hai lớp/ }));

    await waitFor(() => expect(save).toHaveBeenCalledWith({ attemptId: 'att-1', answers: { q1: 'q1-b' } }), { timeout: 4000 });
    expect(await screen.findByText('Đã lưu')).toBeInTheDocument();
  });

  it('submits the saved answers automatically when the time is up', async () => {
    const submit = vi.fn().mockResolvedValue({ attemptId: 'att-1', passed: false });
    renderAttempt(session(new Date(Date.now() - 1000)), vi.fn(), submit);

    await waitFor(() => expect(submit).toHaveBeenCalledWith({ attemptId: 'att-1', answers: { q2: 'q2-a' } }));
    expect(toast.warning).toHaveBeenCalledWith('Đã hết giờ làm bài! Hệ thống đang tự động nộp bài của bạn.');
  });

  it('submits when the server says the time ran out while saving', async () => {
    const save = vi.fn().mockRejectedValue({ isAxiosError: true, response: { status: 409 } });
    const submit = vi.fn().mockResolvedValue({ attemptId: 'att-1', passed: false });
    renderAttempt(session(new Date(Date.now() + 15 * 60_000)), save, submit);

    fireEvent.click(screen.getByRole('radio', { name: /Bật xác thực hai lớp/ }));

    await waitFor(() => expect(submit).toHaveBeenCalledWith({ attemptId: 'att-1', answers: { q1: 'q1-b', q2: 'q2-a' } }), { timeout: 4000 });
  });
});

describe('EM-12 Kết quả đánh giá', () => {
  it('hides correct answers of a failed attempt while tries remain and offers a retake', () => {
    const result: MyAttemptResult = {
      attemptId: 'att-1', assessmentId: 'asm-1', assessmentTitle: assessmentCard.title, assessmentType: 'FINAL', isFinal: true,
      courseId: 'crs-1', courseCode: 'A4-I', courseTitle: assessmentCard.courseTitle, attemptNo: 1,
      startedAt: '2026-10-01T08:00:00Z', submittedAt: '2026-10-01T08:10:00Z', durationSeconds: 600, autoSubmitted: false,
      score: 33.33, passingScore: 70, passed: false, earnedPoints: 1, totalPoints: 3, correctCount: 1, totalQuestions: 3,
      attemptsRemaining: 2, canRetake: true, revealAnswers: false, courseCompleted: false, certificate: null,
      questions: [{ id: 'q1', text: 'Câu 1', options: [{ id: 'o1', content: 'A' }, { id: 'o2', content: 'B' }], selectedOptionId: 'o1', correctOptionId: null, isCorrect: false, points: 1, pointsAwarded: 0 }],
    };
    vi.spyOn(meHooks, 'useMyAssessment').mockReturnValue(query(undefined));
    vi.spyOn(meHooks, 'useAttemptResult').mockReturnValue(query(result));

    renderPage(<AssessmentResultPage />, { path: '/enterprise/me/assessments/:id/result', at: '/enterprise/me/assessments/asm-1/result?attempt=att-1' });

    expect(screen.getByText('Hãy ôn tập và thử lại nhé!')).toBeInTheDocument();
    expect(screen.getByText(/Đáp án đúng và lời giải sẽ hiển thị khi bạn đạt bài/)).toBeInTheDocument();
    expect(screen.queryByText('Đáp án đúng')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Làm lại bài \(còn 2 lượt\)/ })).toHaveAttribute('href', '/enterprise/me/assessments/asm-1');
  });
});

describe('EM-13 Lịch sử đánh giá', () => {
  it('asks the API for passed attempts only when that filter is chosen', () => {
    const history = vi.spyOn(meHooks, 'useAttemptHistory').mockReturnValue(query({ items: [], pageIndex: 1, pageSize: 10, totalItems: 0, totalPages: 0 }));

    renderPage(<AssessmentHistoryPage />);
    fireEvent.change(screen.getByLabelText('Lọc theo kết quả'), { target: { value: 'true' } });

    expect(history).toHaveBeenLastCalledWith(expect.objectContaining({ passed: true, pageIndex: 1 }));
    expect(screen.getByText('Chưa có lần làm bài đánh giá nào.')).toBeInTheDocument();
  });
});
