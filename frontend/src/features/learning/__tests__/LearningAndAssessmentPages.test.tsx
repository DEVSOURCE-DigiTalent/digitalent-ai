import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CourseDetailPage } from '../pages/CourseDetailPage';
import { LessonViewerPage } from '../pages/LessonViewerPage';
import { AssessmentIntroPage } from '../pages/AssessmentIntroPage';
import { AssessmentAttemptPage } from '../pages/AssessmentAttemptPage';
import { AssessmentResultPage } from '../pages/AssessmentResultPage';
import { AssessmentHistoryPage } from '../pages/AssessmentHistoryPage';
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

describe('Learning & Assessment Flow (EMP-05..10 & LCA-14..17)', () => {
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
      expect(screen.getByText(/Chương 1: Tổng quan GenAI/)).toBeInTheDocument();
      expect(screen.getByText('Bài 1: Khái niệm LLM')).toBeInTheDocument();
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
  // EMP-07: AssessmentIntroPage
  // ==========================================
  describe('EMP-07: AssessmentIntroPage', () => {
    const mockAssessment = {
      id: 'asm-genai-01',
      courseId: 'crs-genai-01',
      courseCode: 'GENAI-101',
      courseTitle: 'Ứng dụng AI Tạo sinh trong Công việc Hàng ngày',
      passPercentage: 80,
      timeLimitMinutes: 20,
      questions: [
        { id: 'q1', questionText: 'Prompt là gì?', options: ['A', 'B', 'C', 'D'], score: 10 },
      ],
    };

    it('renders assessment instructions and start button', () => {
      vi.spyOn(learningHooks, 'useAssessment').mockReturnValue({
        data: mockAssessment,
        isLoading: false,
        isError: false,
      } as any);

      renderWithClient(
        <Routes>
          <Route path="/assessments/:id" element={<AssessmentIntroPage />} />
        </Routes>,
        '/assessments/crs-genai-01'
      );

      expect(screen.getByText('Ứng dụng AI Tạo sinh trong Công việc Hàng ngày')).toBeInTheDocument();
      expect(screen.getByText('20 phút')).toBeInTheDocument();
      expect(screen.getByText(/80%/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Bắt đầu làm bài ngay/i })).toBeInTheDocument();
    });
  });

  // ==========================================
  // EMP-08: AssessmentAttemptPage
  // ==========================================
  describe('EMP-08: AssessmentAttemptPage', () => {
    const mockAssessment = {
      id: 'asm-genai-01',
      courseId: 'crs-genai-01',
      courseCode: 'GENAI-101',
      courseTitle: 'Ứng dụng AI Tạo sinh trong Công việc Hàng ngày',
      passPercentage: 80,
      timeLimitMinutes: 20,
      questions: [
        {
          id: 'q-1',
          questionText: 'Khái niệm nào mô tả đúng nhất về Large Language Model (LLM)?',
          options: [
            'Mô hình xử lý bảng tính tự động',
            'Mô hình học máy xử lý và tạo sinh ngôn ngữ tự nhiên',
            'Phần mềm chống virus',
            'Hệ quản trị cơ sở dữ liệu quan hệ',
          ],
          score: 50,
        },
        {
          id: 'q-2',
          questionText: 'Kỹ thuật prompt engineering nào cung cấp ví dụ mẫu trước khi yêu cầu câu trả lời?',
          options: ['Zero-shot', 'Few-shot', 'Instruction only', 'Fine-tuning'],
          score: 50,
        },
      ],
    };

    it('allows answering questions, toggling flags, and opens confirmation modal', async () => {
      const mutateAsync = vi.fn().mockResolvedValue({
        passed: true,
        score: 100,
        passPercentage: 80,
        correctCount: 2,
        totalQuestions: 2,
        questions: [],
      });

      vi.spyOn(learningHooks, 'useAssessment').mockReturnValue({
        data: mockAssessment,
        isLoading: false,
        isError: false,
      } as any);
      vi.spyOn(learningHooks, 'useSubmitAttempt').mockReturnValue({
        mutateAsync,
        isPending: false,
      } as any);

      renderWithClient(
        <Routes>
          <Route path="/assessments/:id/attempt" element={<AssessmentAttemptPage />} />
        </Routes>,
        '/assessments/asm-genai-01/attempt'
      );

      expect(screen.getByText(/Câu hỏi 1 \/ 2/i)).toBeInTheDocument();
      expect(screen.getByText('Khái niệm nào mô tả đúng nhất về Large Language Model (LLM)?')).toBeInTheDocument();

      // Select option 1 (index 1)
      const option2 = screen.getByText('Mô hình học máy xử lý và tạo sinh ngôn ngữ tự nhiên');
      fireEvent.click(option2);

      // Flag question
      const flagBtn = screen.getByRole('button', { name: /Đánh dấu/i });
      fireEvent.click(flagBtn);

      // Navigate to question 2
      const nextBtn = screen.getByRole('button', { name: /Câu tiếp/i });
      fireEvent.click(nextBtn);

      expect(screen.getByText(/Câu hỏi 2 \/ 2/i)).toBeInTheDocument();
      expect(screen.getByText('Few-shot')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Few-shot'));

      // Submit
      const submitBtn = screen.getByRole('button', { name: /Nộp bài/i });
      fireEvent.click(submitBtn);

      // Confirm modal pops up
      expect(screen.getByText('Xác nhận nộp bài đánh giá')).toBeInTheDocument();
      const confirmBtn = screen.getByRole('button', { name: /Xác nhận nộp bài/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalledWith({
          id: 'asm-genai-01',
          input: expect.objectContaining({
            answers: {
              'q-1': 1,
              'q-2': 1,
            },
          }),
        });
      });
    });
  });

  // ==========================================
  // EMP-09: AssessmentResultPage
  // ==========================================
  describe('EMP-09: AssessmentResultPage', () => {
    it('renders result banner, score, and questions review from sessionStorage', () => {
      const mockResult = {
        passed: true,
        score: 90,
        passPercentage: 80,
        correctCount: 9,
        totalQuestions: 10,
        certificate: {
          certificateCode: 'CERT-GENAI-2026-001',
          issueDate: '2026-10-01',
        },
        questions: [
          {
            id: 'q-1',
            questionText: 'Prompt là gì?',
            options: ['Lệnh đầu vào cho AI', 'Phần cứng', 'Mạng máy tính'],
            userAnswerIndex: 0,
            correctAnswerIndex: 0,
            isCorrect: true,
            explanation: 'Prompt là câu lệnh chỉ thị đưa vào cho mô hình AI.',
          },
        ],
      };

      sessionStorage.setItem('dt_last_result_asm-01', JSON.stringify(mockResult));

      renderWithClient(
        <Routes>
          <Route path="/assessments/:id/result" element={<AssessmentResultPage />} />
        </Routes>,
        '/assessments/asm-01/result'
      );

      expect(screen.getByText(/Chúc mừng bạn đã hoàn thành bài thi/i)).toBeInTheDocument();
      expect(screen.getByText('90%')).toBeInTheDocument();
      expect(screen.getByText(/CERT-GENAI-2026-001/)).toBeInTheDocument();
      expect(screen.getByText(/Prompt là gì\?/)).toBeInTheDocument();
    });

    it('renders friendly fallback when no session result exists', () => {
      renderWithClient(
        <Routes>
          <Route path="/assessments/:id/result" element={<AssessmentResultPage />} />
        </Routes>,
        '/assessments/asm-non-existent/result'
      );

      expect(screen.getByText('Không tìm thấy kết quả gần nhất')).toBeInTheDocument();
    });
  });

  // ==========================================
  // EMP-10: AssessmentHistoryPage
  // ==========================================
  describe('EMP-10: AssessmentHistoryPage', () => {
    it('renders learner assessment history list', () => {
      vi.spyOn(learningHooks, 'useAssessmentHistory').mockReturnValue({
        data: {
          items: [
            {
              id: 'att-1',
              assessmentId: 'asm-genai-01',
              courseId: 'crs-genai-01',
              courseTitle: 'Ứng dụng AI Tạo sinh',
              score: 90,
              passed: true,
              submittedAt: '2026-09-28T10:00:00Z',
              durationSeconds: 900,
              correctAnswers: 9,
              totalQuestions: 10,
            },
          ],
          totalItems: 1,
          pageIndex: 1,
          pageSize: 10,
          totalPages: 1,
        },
        isLoading: false,
      } as any);

      renderWithClient(<AssessmentHistoryPage />);

      expect(screen.getByText('Lịch sử bài đánh giá')).toBeInTheDocument();
      expect(screen.getByText('Ứng dụng AI Tạo sinh')).toBeInTheDocument();
      expect(screen.getByText('90%')).toBeInTheDocument();
      expect(screen.getByText('Đạt')).toBeInTheDocument();
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
