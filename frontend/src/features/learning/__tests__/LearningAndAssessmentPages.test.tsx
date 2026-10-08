import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CourseDetailPage } from '../pages/CourseDetailPage';
import { LessonViewerPage } from '../pages/LessonViewerPage';
import { AssessmentResultsOverviewPage } from '@/features/assignments/pages/AssessmentResultsOverviewPage';
import { InternalCourseListPage } from '@/features/assignments/pages/InternalCourseListPage';
import { InternalCourseEditorPage } from '@/features/assignments/pages/InternalCourseEditorPage';
import * as learningHooks from '@/hooks/use-learning';
import * as assignmentHooks from '@/hooks/use-assignments';
import * as myLearningHooks from '@/hooks/use-my-learning';
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

describe('Learning & Assessment Flow (EMP-05..06 & LCA-14..17)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    useCurrentUser.setState({
      user: {
        id: 'usr-learner-01',
        email: 'learner@digitalent.ai',
        fullName: 'Nguyễn Văn Học',
        roles: [ROLES.EMPLOYEE, ROLES.OWNER],
        permissions: ['learning.read', 'learning.manage', 'lesson.complete'],
      },
      isAuthenticated: true,
    });
  });

  // ==========================================
  // EMP-05: CourseDetailPage
  // ==========================================
  describe('EMP-05: CourseDetailPage', () => {
    const mockCourse = {
      id: 'crs-genai-01',
      code: 'GENAI-101',
      title: 'Ứng dụng AI Tạo sinh trong Công việc Hàng ngày',
      description: 'Làm quen và ứng dụng các công cụ AI tạo sinh cơ bản.',
      level: 2,
      estimatedDurationMinutes: 120,
      competencyIds: ['TT02_D1_01', 'TT02_D3_02'],
      assignment: {
        status: 'IN_PROGRESS' as const,
        progressPercent: 50,
        completedLessons: ['les-01'],
      },
      modules: [
        {
          id: 'mod-1',
          title: 'Chương 1: Tổng quan GenAI',
          lessons: [
            { id: 'les-01', title: 'Bài 1: Khái niệm LLM', estimatedMinutes: 15 },
            { id: 'les-02', title: 'Bài 2: Viết prompt cơ bản', estimatedMinutes: 20 },
          ],
        },
      ],
    };

    it('renders course details, modules, and lessons correctly', () => {
      vi.spyOn(assignmentHooks, 'useCourse').mockReturnValue({
        data: mockCourse,
        isLoading: false,
        isError: false,
        error: null,
      } as any);
      vi.spyOn(myLearningHooks, 'useMyLearning').mockReturnValue({ data: { items: [{ courseId: mockCourse.id, progressPercent: 50, completedLessons: 1, totalLessons: 2 }] } } as any);

      renderWithClient(
        <Routes>
          <Route path="/courses/:id" element={<CourseDetailPage />} />
        </Routes>,
        '/courses/crs-genai-01'
      );

      expect(screen.getAllByText('GENAI-101').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Ứng dụng AI Tạo sinh trong Công việc Hàng ngày')).toBeInTheDocument();
      expect(screen.getAllByText(/Chương 1: Tổng quan GenAI/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Bài 1: Khái niệm LLM').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Bài 2: Viết prompt cơ bản')).toBeInTheDocument();
      expect(screen.getByText(/Tiến độ: 50%/)).toBeInTheDocument();
    });

    it('shows error state when course cannot be loaded', () => {
      vi.spyOn(assignmentHooks, 'useCourse').mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Course not found'),
      } as any);

      renderWithClient(
        <Routes>
          <Route path="/courses/:id" element={<CourseDetailPage />} />
        </Routes>,
        '/courses/crs-genai-01'
      );

      expect(screen.getByText('Không thể tải thông tin khóa học.')).toBeInTheDocument();
    });
  });

  // ==========================================
  // EMP-06: LessonViewerPage
  // ==========================================
  describe('EMP-06: LessonViewerPage', () => {
    const mockLessonData = {
      id: 'les-01',
      title: 'Bài 1: Khái niệm LLM',
      estimatedMinutes: 15,
      lessonType: 'TEXT',
      moduleTitle: 'Chương 1: Tổng quan GenAI',
      contentBody: 'Các mô hình ngôn ngữ lớn hoạt động dựa trên transformer...',
    };

    it('renders lesson content and completion navigation', async () => {
      const mutateAsync = vi.fn().mockResolvedValue({ success: true });
      vi.spyOn(assignmentHooks, 'useCourseLesson').mockReturnValue({
        data: mockLessonData,
        isLoading: false,
        isError: false,
      } as any);
      vi.spyOn(assignmentHooks, 'useCourse').mockReturnValue({ data: { id: 'crs-genai-01', title: 'Ứng dụng AI Tạo sinh', modules: [{ id: 'mod-1', lessons: [{ id: 'les-01' }, { id: 'les-02' }] }] }, isLoading: false, isError: false } as any);
      vi.spyOn(myLearningHooks, 'useMyLearning').mockReturnValue({ data: { items: [{ courseId: 'crs-genai-01' }] }, isLoading: false } as any);
      vi.spyOn(myLearningHooks, 'useCompleteMyLesson').mockReturnValue({
        mutateAsync,
        isPending: false,
      } as any);

      renderWithClient(
        <Routes>
          <Route path="/courses/:id/lessons/:lessonId" element={<LessonViewerPage />} />
        </Routes>,
        '/courses/crs-genai-01/lessons/les-01'
      );

      expect(screen.getByText('Bài 1: Khái niệm LLM')).toBeInTheDocument();
      expect(screen.getByText(/Các mô hình ngôn ngữ lớn hoạt động dựa trên transformer/i)).toBeInTheDocument();

      const completeBtn = screen.getByRole('button', { name: /Hoàn thành bài học/i });
      expect(completeBtn).toBeInTheDocument();

      fireEvent.click(completeBtn);
      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalledWith('les-01');
      });
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

      expect(screen.getByText('Khóa học trong tổ chức')).toBeInTheDocument();
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

      expect(screen.getByText('Tạo khóa học nội bộ')).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('Tên khóa học'), {
        target: { value: 'Khóa học kiểm thử tự động' },
      });

      const submitBtn = screen.getByRole('button', { name: /Tạo bản nháp/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Khóa học kiểm thử tự động',
            modulesCount: 0,
            status: 'DRAFT',
          })
        );
      });
    });
  });
});
