import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { InternalCourseListPage } from '@/features/assignments/pages/InternalCourseListPage';
import { InternalCourseEditorPage } from '@/features/assignments/pages/InternalCourseEditorPage';
import { InternalCourseDetailPage } from '../pages/InternalCourseDetailPage';
import * as learningHooks from '@/hooks/use-learning';
import * as assignmentHooks from '@/hooks/use-assignments';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('InternalCoursePages (Agent 1 - Phase H: OW-31..33)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    vi.clearAllMocks();
  });

  const renderWithClient = (ui: React.ReactNode) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    );
  };

  describe('OW-31: InternalCourseListPage', () => {
    it('renders course list with TT02 notice banner and KPI cards', () => {
      vi.spyOn(learningHooks, 'useInternalCourses').mockReturnValue({
        data: {
          items: [
            {
              id: 'icrs-1',
              code: 'NB-01',
              title: 'Văn hóa doanh nghiệp & Quy tắc ứng xử số',
              description: 'Bộ quy tắc ứng xử nội bộ trên môi trường làm việc số.',
              category: 'Văn hóa & Hội nhập',
              modulesCount: 3,
              durationMinutes: 45,
              status: 'PUBLISHED',
              createdAt: '2026-09-01T00:00:00Z',
              updatedAt: '2026-09-10T00:00:00Z',
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
      expect(screen.getByText(/không tự động tăng bậc năng lực/i)).toBeInTheDocument();
      expect(screen.getByText('Văn hóa doanh nghiệp & Quy tắc ứng xử số')).toBeInTheDocument();
      expect(screen.getByText('NB-01')).toBeInTheDocument();
      expect(screen.getByText('Tổng khóa nội bộ')).toBeInTheDocument();
    });
  });

  describe('OW-32: InternalCourseEditorPage', () => {
    it('allows building internal course curriculum modules and submitting form', async () => {
      vi.spyOn(learningHooks, 'useInternalCourse').mockReturnValue({
        data: undefined,
        isLoading: false,
      } as any);

      const mutateAsync = vi.fn().mockResolvedValue({ id: 'icrs-new' });
      vi.spyOn(learningHooks, 'useCreateInternalCourse').mockReturnValue({
        mutateAsync,
        isPending: false,
      } as any);

      renderWithClient(<InternalCourseEditorPage />);

      expect(screen.getByText('Soạn khóa học nội bộ mới')).toBeInTheDocument();
      expect(screen.getByText(/Lưu ý giáo trình/i)).toBeInTheDocument();

      // Check default modules count
      expect(screen.getByText(/Học phần & Học liệu/i)).toBeInTheDocument();

      // Click "Thêm học phần"
      const addModuleBtn = screen.getByRole('button', { name: /Thêm học phần/i });
      fireEvent.click(addModuleBtn);

      // Fill title
      const titleInput = screen.getByLabelText(/Tên khóa học/i);
      fireEvent.change(titleInput, { target: { value: 'Khóa hướng dẫn bảo mật nội bộ 2026' } });

      // Submit
      const submitBtn = screen.getByRole('button', { name: /Lưu khóa học nội bộ/i });
      fireEvent.click(submitBtn);
    });
  });

  describe('OW-33: InternalCourseDetailPage', () => {
    it('renders detail page with TT02 notice, tabs and action buttons', () => {
      vi.spyOn(learningHooks, 'useInternalCourse').mockReturnValue({
        data: {
          id: 'icrs-1',
          code: 'NB-01',
          title: 'Văn hóa làm việc số tại DigiTalent',
          description: 'Quy chuẩn giao tiếp, bảo mật và lưu trữ tài liệu.',
          category: 'Văn hóa & Hội nhập',
          modulesCount: 3,
          durationMinutes: 60,
          status: 'PUBLISHED',
          createdAt: '2026-09-01T00:00:00Z',
          updatedAt: '2026-09-15T00:00:00Z',
        },
        isLoading: false,
      } as any);

      vi.spyOn(assignmentHooks, 'useAssignments').mockReturnValue({
        data: {
          items: [
            {
              id: 'asg-1',
              employeeId: 'emp-1',
              employeeName: 'Lê Hoàng Nam',
              departmentName: 'Phòng Kỹ thuật',
              progressPercent: 100,
              dueDate: '2026-10-30T00:00:00Z',
              status: 'COMPLETED',
            },
          ],
          totalItems: 1,
        },
        isLoading: false,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/enterprise/internal-courses/icrs-1']}>
            <Routes>
              <Route path="/enterprise/internal-courses/:id" element={<InternalCourseDetailPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );

      // Hero & notice
      expect(screen.getByText('Văn hóa làm việc số tại DigiTalent')).toBeInTheDocument();
      expect(screen.getByText('NB-01')).toBeInTheDocument();
      expect(screen.getByText(/không tự động tăng bậc năng lực/i)).toBeInTheDocument();

      // Action buttons
      expect(screen.getByText('Chỉnh sửa nội dung')).toBeInTheDocument();
      expect(screen.getByText('Giao khóa học này')).toBeInTheDocument();

      // Tabs exist
      expect(screen.getByRole('button', { name: /Cấu trúc giáo trình/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Danh sách học viên/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cài đặt & Xuất bản/i })).toBeInTheDocument();

      // Switch to learners tab
      fireEvent.click(screen.getByRole('button', { name: /Danh sách học viên/i }));
      expect(screen.getByText('Lê Hoàng Nam')).toBeInTheDocument();

      // Switch to settings tab
      fireEvent.click(screen.getByRole('button', { name: /Cài đặt & Xuất bản/i }));
      expect(screen.getByText('Thông số kỹ thuật & Vận hành')).toBeInTheDocument();
    });
  });
});
