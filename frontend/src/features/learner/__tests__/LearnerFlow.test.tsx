import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiClient from '@/services/api-client';
import { resetMockDb } from '@/services/mock/mock-store';
import { mockAdapter } from '@/services/mock/server/mock-adapter';
import { ENTRY_QUESTIONS, questionsOfDomain } from '@/services/mock/server/personal/question-bank';
import { MOCK_EMAILS, signInAsMock, signOut } from '@/test/session';
import {
  LearnerCertificatesPage,
  LearnerClassroomPage,
  LearnerCourseDetailPage,
  LearnerDashboardPage,
  LearnerDiagnosticPage,
  LearnerPathPage,
  LearnerProgressPage,
  LearnerTargetPage,
  LearnerTasksPage,
} from '../pages';

function renderPage(ui: React.ReactElement, route = '/', path = '*') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeAll(() => {
  apiClient.defaults.adapter = mockAdapter;
});

beforeEach(() => {
  signOut();
  resetMockDb();
  signInAsMock(MOCK_EMAILS.personal);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Personal track (demo learner: Marketing, entry assessment done)', () => {
  it('dashboard shows the target, the lesson to continue and recent activity', async () => {
    renderPage(<LearnerDashboardPage />);

    expect(await screen.findByText(/Mục tiêu: Marketing/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Học tiếp/ })).toHaveAttribute('href', expect.stringContaining('/personal/classroom/crs-A3-I'));
    expect(screen.getByText('Hoạt động gần đây')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tóm tắt năng lực' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /Radar năng lực theo 6 miền/ })).not.toBeInTheDocument();
  });

  it('target page previews another position before saving it', async () => {
    renderPage(<LearnerTargetPage />);

    const marketing = await screen.findByRole('radio', { name: /Marketing/ });
    expect(marketing).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByRole('radio', { name: /Kế toán/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'Kế toán' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Chọn làm mục tiêu' }));

    expect(await screen.findByText(/Đây là mục tiêu của bạn/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('dt-mock-personal-v1')!)['mock-personal'].targetCode).toBe('ACCOUNTANT');
  });

  it('diagnostic shows the stored result and lets the learner retake it question by question', async () => {
    renderPage(<LearnerDiagnosticPage />);

    expect(await screen.findByText('Theo từng miền')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Làm lại/ }));

    for (const [index, question] of ENTRY_QUESTIONS.entries()) {
      const option = await screen.findByRole('radio', { name: question.options[question.correctIndex] });
      fireEvent.click(option);
      if (index < ENTRY_QUESTIONS.length - 1) fireEvent.click(screen.getByRole('button', { name: /Câu tiếp/ }));
    }
    fireEvent.click(screen.getByRole('button', { name: 'Nộp bài' }));

    expect(await screen.findAllByText(/Đạt Nâng cao/, {}, { timeout: 4000 })).toHaveLength(6);
    expect(screen.getByText('18', { selector: 'p' })).toBeInTheDocument();
  });

  it('path lists stages in prerequisite order and the exempt courses', async () => {
    renderPage(<LearnerPathPage />);

    expect(await screen.findByRole('heading', { level: 2, name: 'Nền tảng' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Chuyên sâu' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ứng dụng AI cơ bản' })).toBeInTheDocument();
    expect(screen.getAllByText('Được miễn').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Chờ khóa tiên quyết').length).toBeGreaterThan(0);
  });

  it('course detail shows outcomes, modules and the competencies it raises', async () => {
    renderPage(<LearnerCourseDetailPage />, '/personal/courses/crs-A3-I', '/personal/courses/:id');

    expect(await screen.findByText('Mã: A3-I')).toBeInTheDocument();
    expect(screen.getByText('Chuẩn đầu ra khóa học')).toBeInTheDocument();
    expect(screen.getByText('Nội dung chương trình đào tạo')).toBeInTheDocument();
    expect(screen.getByText('Năng lực được nâng')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Học tiếp/ })).toBeInTheDocument();
  });

  it('classroom completes lessons, saves notes and passes the course assessment', async () => {
    renderPage(<LearnerClassroomPage />, '/personal/classroom/crs-A3-I', '/personal/classroom/:id');
    expect(await screen.findByText('Lớp học số: A3-I')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Ghi chú của tôi' }));
    fireEvent.change(screen.getByLabelText('Ghi chép bài học'), { target: { value: 'Kiểm tra giấy phép ảnh trước khi đăng.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu ghi chú' }));
    expect(await screen.findByText('Đã lưu ghi chú.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Nội dung bài học' }));

    // 5 of 12 lessons are done in the seed: finish the rest.
    for (let remaining = 7; remaining > 0; remaining -= 1) {
      const button = await screen.findByRole('button', { name: 'Đánh dấu hoàn thành' });
      fireEvent.click(button);
      await waitFor(() => expect(screen.getByText(new RegExp(`^${12 - remaining + 1}/12$`))).toBeInTheDocument());
    }

    fireEvent.click(await screen.findByRole('button', { name: 'Làm bài đánh giá' }));
    for (const question of questionsOfDomain(3)) {
      fireEvent.click(await screen.findByRole('radio', { name: question.options[question.correctIndex] }));
    }
    fireEvent.click(screen.getByRole('button', { name: 'Nộp bài đánh giá' }));

    expect(await screen.findByText(/Đạt · 100%/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Xem chứng nhận/ })).toBeInTheDocument();
  });

  it('progress shows the 24-competency profile and milestones', async () => {
    renderPage(<LearnerProgressPage />);

    expect(await screen.findByText('Bằng chứng năng lực')).toBeInTheDocument();
    expect(screen.getByText('Lịch sử hoàn thành')).toBeInTheDocument();
    expect(screen.getByText('Khóa học đầu tiên')).toBeInTheDocument();
    expect(screen.queryByText(/\/6\b/)).not.toBeInTheDocument();
  });

  it('certificates open a printable sheet without a public verification link', async () => {
    renderPage(<LearnerCertificatesPage />);

    expect(await screen.findByRole('heading', { level: 2, name: 'Ứng dụng AI cơ bản' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xem chứng nhận' }));

    const dialog = screen.getByRole('dialog', { name: 'Chứng nhận hoàn thành khóa học' });
    expect(within(dialog).getByText('Bùi Thị Cá Nhân')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /In chứng nhận/ })).toBeInTheDocument();
    expect(within(dialog).queryByText(/Quét để xác thực|\/verify/)).not.toBeInTheDocument();
  });

  it('tasks: submits evidence for the open task of the course in progress', async () => {
    renderPage(<LearnerTasksPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Nộp bài làm' }));
    const dialog = screen.getByRole('dialog', { name: 'Nộp minh chứng công việc thực tế' });

    fireEvent.click(within(dialog).getByRole('button', { name: 'Gửi nộp bài đánh giá' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent(/tối thiểu 20 ký tự/);

    fireEvent.change(within(dialog).getByLabelText(/Liên kết bài làm/), { target: { value: 'https://example.com/infographic-q3' } });
    fireEvent.change(within(dialog).getByLabelText('Mô tả bài làm'), { target: { value: 'Chuyển thể 3 bài blog cũ thành infographic, cập nhật số liệu Q3.' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Gửi nộp bài đánh giá' }));

    expect(await screen.findByText(/Đã gửi nộp bài thực hành/)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Đang chấm/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Chuyển thể 3 bài blog cũ/)).toBeInTheDocument();
  });
});
