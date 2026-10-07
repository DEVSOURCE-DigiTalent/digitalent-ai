import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { InternalCourseListPage } from '@/features/assignments/pages/InternalCourseListPage';
import { InternalCourseEditorPage } from '@/features/assignments/pages/InternalCourseEditorPage';
import { InternalCourseDetailPage } from '../pages/InternalCourseDetailPage';
import * as learningHooks from '@/hooks/use-learning';

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
    it('shows the API course list and its classification limitation', () => {
      vi.spyOn(learningHooks, 'useInternalCourses').mockReturnValue({
        data: {
          items: [
            {
              id: 'icrs-1',
              code: 'INT-001',
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

      expect(screen.getByText('Khóa học trong tổ chức')).toBeInTheDocument();
      expect(screen.getByText(/chưa có trường phân loại khóa chuẩn và khóa nội bộ/i)).toBeInTheDocument();
      expect(screen.getByText('Văn hóa doanh nghiệp & Quy tắc ứng xử số')).toBeInTheDocument();
      expect(screen.getByText('INT-001')).toBeInTheDocument();
      expect(screen.getByText('Tổng khóa tổ chức')).toBeInTheDocument();
    });
  });

  describe('OW-32: InternalCourseEditorPage', () => {
    it('creates only course metadata as a draft', async () => {
      vi.spyOn(learningHooks, 'useInternalCourse').mockReturnValue({
        data: undefined,
        isLoading: false,
      } as any);

      const mutateAsync = vi.fn().mockResolvedValue({ id: 'icrs-new' });
      vi.spyOn(learningHooks, 'useCreateInternalCourse').mockReturnValue({
        mutateAsync,
        isPending: false,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/enterprise/internal-courses/new']}>
            <Routes>
              <Route path="/enterprise/internal-courses/new" element={<InternalCourseEditorPage />} />
              <Route path="/enterprise/internal-courses/:id" element={<p>Đã lưu</p>} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByText('Tạo khóa học nội bộ')).toBeInTheDocument();
      expect(screen.getByText(/chưa có API lưu nội dung từng học phần/i)).toBeInTheDocument();

      // Fill title
      const titleInput = screen.getByLabelText(/Tên khóa học/i);
      fireEvent.change(titleInput, { target: { value: 'Khóa hướng dẫn bảo mật nội bộ 2026' } });

      // Submit
      const submitBtn = screen.getByRole('button', { name: /Tạo bản nháp/i });
      fireEvent.click(submitBtn);
      await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ title: 'Khóa hướng dẫn bảo mật nội bộ 2026', modulesCount: 0, status: 'DRAFT' })));
      await screen.findByText('Đã lưu');
    });

    it('edits an INT course through PUT without creating a duplicate', async () => {
      const create = vi.fn();
      const update = vi.fn().mockResolvedValue({ id: 'course-1' });
      vi.spyOn(learningHooks, 'useInternalCourse').mockReturnValue({
        data: {
          id: 'course-1', code: 'INT-001', title: 'Khóa cũ', description: '', category: 'Nội bộ',
          modulesCount: 0, durationMinutes: 30, status: 'DRAFT',
        }, isLoading: false,
      } as any);
      vi.spyOn(learningHooks, 'useCreateInternalCourse').mockReturnValue({ mutateAsync: create, isPending: false } as any);
      vi.spyOn(learningHooks, 'useUpdateInternalCourse').mockReturnValue({ mutateAsync: update, isPending: false } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/enterprise/internal-courses/course-1/edit']}>
            <Routes>
              <Route path="/enterprise/internal-courses/:id/edit" element={<InternalCourseEditorPage />} />
              <Route path="/enterprise/internal-courses/:id" element={<p>Đã lưu</p>} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );
      fireEvent.change(screen.getByLabelText('Tên khóa học'), { target: { value: 'Khóa mới' } });
      fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
      await waitFor(() => expect(update).toHaveBeenCalledWith({
        id: 'course-1', input: expect.objectContaining({ title: 'Khóa mới' }),
      }));
      await screen.findByText('Đã lưu');
      expect(create).not.toHaveBeenCalled();
    });
  });

  describe('OW-33: InternalCourseDetailPage', () => {
    it('renders only saved BE2 course metadata', () => {
      vi.spyOn(learningHooks, 'useInternalCourse').mockReturnValue({
        data: {
          id: 'icrs-1',
          code: 'INT-001',
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

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/enterprise/internal-courses/icrs-1']}>
            <Routes>
              <Route path="/enterprise/internal-courses/:id" element={<InternalCourseDetailPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByText('Văn hóa làm việc số tại DigiTalent')).toBeInTheDocument();
      expect(screen.getByText('INT-001')).toBeInTheDocument();
      expect(screen.getByText(/chưa trả danh sách nội dung từng học phần/i)).toBeInTheDocument();
      expect(screen.getByText('Chỉnh sửa thông tin')).toBeInTheDocument();
      expect(screen.queryByText('Lê Hoàng Nam')).not.toBeInTheDocument();
    });
  });
});
