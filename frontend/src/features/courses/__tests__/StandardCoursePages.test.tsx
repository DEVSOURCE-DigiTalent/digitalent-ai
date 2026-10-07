import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { StandardCourseCatalogPage } from '../pages/StandardCourseCatalogPage';
import { StandardCourseDetailPage } from '../pages/StandardCourseDetailPage';
import { useCurrentUser } from '@/hooks/use-current-user';
import * as assignmentHooks from '@/hooks/use-assignments';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('StandardCoursePages (Agent 1 - Phase D)', () => {
  let queryClient: QueryClient;

  const mockCourses = [
    {
      id: 'crs-001',
      code: 'DIG-101',
      title: 'An toàn dữ liệu cá nhân trong môi trường số',
      description: 'Nâng cao ý thức bảo mật dữ liệu khách hàng theo TT02.',
      categoryId: 'cat-4',
      categoryName: 'An toàn',
      level: 1,
      durationMinutes: 120,
      estimatedDurationMinutes: 120,
      passingScore: 80,
      competencyCode: 'TT02-4.2',
      competencyName: 'Bảo vệ dữ liệu cá nhân',
      targetAudience: 'Toàn bộ nhân viên',
      prerequisites: 'Không có',
      activeLearnersCount: 24,
      completionRate: 88,
      status: 'PUBLISHED',
      modules: [
        {
          id: 'm-1',
          title: 'Học phần 1: Nhận diện rủi ro',
          durationMinutes: 60,
          lessons: [
            { id: 'l-1', title: 'Bài 1: Lỗ hổng mật khẩu', durationMinutes: 30 },
            { id: 'l-2', title: 'Bài 2: Tấn công phi kỹ thuật', durationMinutes: 30 },
          ],
        },
      ],
    },
    {
      id: 'crs-002',
      code: 'DIG-201',
      title: 'Kỹ năng cộng tác trực tuyến với Google Workspace',
      description: 'Thành thạo công cụ cộng tác đám mây.',
      categoryId: 'cat-2',
      categoryName: 'Giao tiếp & Cộng tác',
      level: 2,
      durationMinutes: 180,
      estimatedDurationMinutes: 180,
      passingScore: 85,
      competencyCode: 'TT02-2.1',
      competencyName: 'Tương tác thông qua công nghệ số',
      targetAudience: 'Trưởng nhóm, Chuyên viên',
      prerequisites: 'DIG-101',
      activeLearnersCount: 12,
      completionRate: 75,
      status: 'PUBLISHED',
      modules: [],
    },
  ];
  const catalogCourses = mockCourses.map((course) => ({ ...course, modules: course.modules.length, assignedCount: 0 }));

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    useCurrentUser.setState({
      user: {
        id: 'owner-1',
        email: 'owner@acme.corp',
        fullName: 'Nguyễn Văn Chủ',
        roles: ['ORGANIZATION_ADMIN'],
        permissions: ['course.read', 'training.read'],
      },
      isAuthenticated: true,
    });
  });

  describe('StandardCourseCatalogPage', () => {
    it('renders page header, KPI cards, and course items', () => {
      vi.spyOn(assignmentHooks, 'useCourseCatalog').mockReturnValue({
        data: {
          items: catalogCourses,
          totalItems: 2,
          pageIndex: 1,
          pageSize: 20,
          totalPages: 1,
        } as any,
        isLoading: false,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <StandardCourseCatalogPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(screen.getByText(/Chương trình chuẩn \(Standard Course Catalog\)/i)).toBeDefined();
      expect(screen.getByText(/Tổng số khóa học chuẩn/i)).toBeDefined();
      expect(screen.getByText('An toàn dữ liệu cá nhân trong môi trường số')).toBeDefined();
      expect(screen.getByText('Kỹ năng cộng tác trực tuyến với Google Workspace')).toBeDefined();
    });

    it('filters courses by search keyword', () => {
      vi.spyOn(assignmentHooks, 'useCourseCatalog').mockImplementation(({ search }: any) => {
        const filtered = search
          ? catalogCourses.filter((c) => c.title.includes(search) || c.code.includes(search))
          : catalogCourses;
        return {
          data: { items: filtered, totalItems: filtered.length, pageIndex: 1, pageSize: 20, totalPages: 1 },
          isLoading: false,
        } as any;
      });

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <StandardCourseCatalogPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      const searchInput = screen.getByPlaceholderText(/Tìm theo tên khóa học hoặc mã/i);
      fireEvent.change(searchInput, { target: { value: 'Google' } });

      expect(screen.getByText('Kỹ năng cộng tác trực tuyến với Google Workspace')).toBeDefined();
    });

    it('sorts the filtered catalog before paging and lets the owner change pages', () => {
      const items = Array.from({ length: 14 }, (_, index) => ({
        ...mockCourses[0], id: `course-${index + 1}`, code: `C${String(index + 1).padStart(2, '0')}`,
        title: `Khóa học ${index + 1}`, modules: 3, assignedCount: 0,
      }));
      vi.spyOn(assignmentHooks, 'useCourseCatalog').mockReturnValue({
        data: { items, totalItems: 14 }, isLoading: false, isError: false,
      } as any);

      render(<QueryClientProvider client={queryClient}><MemoryRouter><StandardCourseCatalogPage /></MemoryRouter></QueryClientProvider>);

      expect(screen.queryByText('Khóa học 14')).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Trang 2' }));
      expect(screen.getByText('Khóa học 14')).toBeDefined();
      fireEvent.change(screen.getByRole('combobox', { name: 'Sắp xếp khóa học' }), { target: { value: 'title-desc' } });
      expect(screen.getByText('Khóa học 14')).toBeDefined();
      expect(screen.queryByText('Khóa học 1')).toBeNull();
    });
  });

  describe('StandardCourseDetailPage', () => {
    it('renders course detail with TT02 standard note and tabs', () => {
      vi.spyOn(assignmentHooks, 'useCourse').mockReturnValue({
        data: mockCourses[0] as any,
        isLoading: false,
      } as any);

      vi.spyOn(assignmentHooks, 'useAssignments').mockReturnValue({
        data: { items: [], totalItems: 0 } as any,
        isLoading: false,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/enterprise/courses/crs-001']}>
            <Routes>
              <Route path="/enterprise/courses/:id" element={<StandardCourseDetailPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(screen.getByText('An toàn dữ liệu cá nhân trong môi trường số')).toBeDefined();
      expect(screen.getAllByText('DIG-101').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Chuẩn hóa TT02')).toBeDefined();
      expect(screen.getByText('Khóa học chuẩn hóa nền tảng')).toBeDefined();
      expect(screen.getByRole('button', { name: /Giao khóa học này/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Thêm vào đợt đào tạo/i })).toBeDefined();
    });

    it('switches to curriculum tab and displays syllabus modules', () => {
      vi.spyOn(assignmentHooks, 'useCourse').mockReturnValue({
        data: mockCourses[0] as any,
        isLoading: false,
      } as any);

      vi.spyOn(assignmentHooks, 'useAssignments').mockReturnValue({
        data: { items: [], totalItems: 0 } as any,
        isLoading: false,
      } as any);
      vi.spyOn(assignmentHooks, 'useCourseLesson').mockReturnValue({
        data: { id: 'l-1', title: 'Bài 1: Lỗ hổng mật khẩu', lessonType: 'TEXT', contentBody: 'Nội dung thật từ BE2', moduleTitle: 'Học phần 1' },
        isLoading: false,
        isError: false,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/enterprise/courses/crs-001']}>
            <Routes>
              <Route path="/enterprise/courses/:id" element={<StandardCourseDetailPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>,
      );

      const syllabusButton = screen.getByRole('button', { name: /^Luồng đào tạo$/i });
      fireEvent.click(syllabusButton);

      expect(screen.getAllByText(/Học phần 1: Nhận diện rủi ro/).length).toBeGreaterThan(0);
      expect(screen.getAllByText('Bài 1: Lỗ hổng mật khẩu').length).toBeGreaterThan(0);
      expect(screen.getByText('Video bài học đang được cập nhật')).toBeDefined();
      expect(screen.getByText('Nội dung thật từ BE2')).toBeDefined();
    });
  });
});
