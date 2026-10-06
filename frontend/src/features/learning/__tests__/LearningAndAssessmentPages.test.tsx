import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AssessmentResultsOverviewPage } from '@/features/assignments/pages/AssessmentResultsOverviewPage';
import { InternalCourseListPage } from '@/features/assignments/pages/InternalCourseListPage';
import { InternalCourseEditorPage } from '@/features/assignments/pages/InternalCourseEditorPage';
import * as learningHooks from '@/hooks/use-learning';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

function renderWithClient(ui: React.ReactElement, initialRoute = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Learning & Assessment Flow (LCA-14..17)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    useCurrentUser.setState({
      user: {
        id: 'usr-learner-01',
        email: 'learner@digitalent.demo',
        fullName: 'Nguyễn Văn Học',
        roles: [ROLES.EMPLOYEE, ROLES.OWNER],
        permissions: ['learning.read', 'learning.manage', 'lesson.complete'],
      },
      isAuthenticated: true,
    });
  });

  // ==========================================
  // LCA-14: AssessmentResultsOverviewPage
  // ==========================================
  describe('LCA-14: AssessmentResultsOverviewPage', () => {
    it('renders enterprise wide assessment results', () => {
      vi.spyOn(learningHooks, 'useAssessmentHistory').mockReturnValue({
        data: {
          items: [
            {
              id: 'att-101',
              employeeId: 'emp-001',
              employeeName: 'Nguyễn Văn A',
              assessmentId: 'asm-01',
              courseTitle: 'An toàn thông tin cơ bản',
              score: 85,
              passed: true,
              submittedAt: '2026-10-01T08:30:00Z',
              durationSeconds: 1200,
              correctAnswers: 17,
              totalQuestions: 20,
            },
          ],
          totalItems: 1,
          pageIndex: 1,
          pageSize: 15,
          totalPages: 1,
        },
        isLoading: false,
      } as any);

      renderWithClient(<AssessmentResultsOverviewPage />);

      expect(screen.getByText('Kết quả đánh giá năng lực')).toBeInTheDocument();
      expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
      expect(screen.getByText('An toàn thông tin cơ bản')).toBeInTheDocument();
      expect(screen.getAllByText('85%').length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // LCA-16 & 17: Internal Courses
  // ==========================================
  describe('LCA-16 & 17: Internal Courses', () => {
    it('LCA-16: renders internal course list', () => {
      vi.spyOn(learningHooks, 'useInternalCourses').mockReturnValue({
        data: {
          items: [
            {
              id: 'crs-int-01',
              code: 'INT-ONBOARD-2026',
              title: 'Văn hóa & Quy trình bảo mật số nội bộ',
              description: 'Chương trình bắt buộc cho nhân sự mới',
              category: 'Văn hóa & Hội nhập',
              modulesCount: 3,
              durationMinutes: 90,
              status: 'PUBLISHED',
              createdAt: '2026-01-01',
              updatedAt: '2026-01-01',
            },
          ],
          totalItems: 1,
          pageIndex: 1,
          pageSize: 15,
          totalPages: 1,
        },
        isLoading: false,
      } as any);

      renderWithClient(<InternalCourseListPage />);

      expect(screen.getByText('Khóa học nội bộ')).toBeInTheDocument();
      expect(screen.getByText('INT-ONBOARD-2026')).toBeInTheDocument();
      expect(screen.getByText('Văn hóa & Quy trình bảo mật số nội bộ')).toBeInTheDocument();
    });

    it('LCA-17: renders internal course editor form and handles submit', async () => {
      const mutateAsync = vi.fn().mockResolvedValue({ id: 'crs-new-01' });
      vi.spyOn(learningHooks, 'useInternalCourse').mockReturnValue({
        data: undefined,
        isLoading: false,
      } as any);
      vi.spyOn(learningHooks, 'useCreateInternalCourse').mockReturnValue({
        mutateAsync,
        isPending: false,
      } as any);

      renderWithClient(
        <Routes>
          <Route path="/internal-courses/:id" element={<InternalCourseEditorPage />} />
        </Routes>,
        '/internal-courses/new'
      );

      expect(screen.getByText('Soạn khóa học nội bộ mới')).toBeInTheDocument();

      fireEvent.change(screen.getByPlaceholderText(/VD: NB-03/i), {
        target: { value: 'INT-TEST-01' },
      });
      fireEvent.change(screen.getByPlaceholderText(/VD: Hướng dẫn an toàn thông tin/i), {
        target: { value: 'Khóa học kiểm thử tự động' },
      });

      const submitBtn = screen.getByRole('button', { name: /Lưu khóa học/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'INT-TEST-01',
            title: 'Khóa học kiểm thử tự động',
          })
        );
      });
    });
  });
});
