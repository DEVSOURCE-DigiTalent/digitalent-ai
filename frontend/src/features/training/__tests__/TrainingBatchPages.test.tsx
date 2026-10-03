import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TrainingBatchListPage } from '../pages/TrainingBatchListPage';
import { TrainingBatchWizardPage } from '../pages/TrainingBatchWizardPage';
import { TrainingBatchDetailPage } from '../pages/TrainingBatchDetailPage';
import { useCurrentUser } from '@/hooks/use-current-user';
import * as batchHooks from '@/hooks/use-training-batches';
import * as asgHooks from '@/hooks/use-assignments';
import * as depHooks from '@/hooks/use-departments';
import * as posHooks from '@/hooks/use-job-positions';
import * as memHooks from '@/hooks/use-members';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('TrainingBatchPages (Agent 1 - Phase D)', () => {
  let queryClient: QueryClient;

  const mockBatches = [
    {
      id: 'tb-001',
      code: 'DOT-2026-01',
      name: 'Đợt 1: Phổ cập An toàn thông tin Q1/2026',
      description: 'Chương trình bắt buộc toàn công ty theo chuẩn TT02',
      status: 'RUNNING' as const,
      startDate: '2026-01-15',
      endDate: '2026-03-31',
      coursesCount: 2,
      participantsCount: 30,
      completedParticipantsCount: 12,
      averageProgressPercent: 68,
      createdAt: '2026-01-10T08:00:00Z',
      createdByName: 'Nguyễn Văn Chủ',
    },
    {
      id: 'tb-002',
      code: 'DOT-2026-02',
      name: 'Đợt 2: Kỹ năng số cho Cấp bậc G2',
      description: 'Chương trình bồi dưỡng cán bộ phó phòng',
      status: 'SCHEDULED' as const,
      startDate: '2026-04-01',
      endDate: '2026-05-30',
      coursesCount: 1,
      participantsCount: 8,
      completedParticipantsCount: 0,
      averageProgressPercent: 0,
      createdAt: '2026-02-15T09:00:00Z',
      createdByName: 'Nguyễn Văn Chủ',
    },
  ];

  const mockBatchDetail = {
    ...mockBatches[0],
    courseIds: ['crs-001'],
    participantEmployeeIds: ['emp-1'],
    courses: [
      {
        id: 'crs-001',
        code: 'DIG-101',
        title: 'An toàn dữ liệu cá nhân trong môi trường số',
        domain: 'An toàn',
        level: 'Cơ bản',
        durationMinutes: 120,
        passingScore: 80,
        activeLearnersCount: 30,
        completionRate: 40,
      },
    ],
    participants: [
      {
        employeeId: 'emp-1',
        employeeName: 'Trần Thị B',
        employeeCode: 'NV002',
        departmentName: 'Phòng Kỹ thuật',
        positionName: 'Kỹ sư phần mềm',
        jobGrade: 'G1',
        progressPercent: 75,
        completedCoursesCount: 0,
        totalCoursesCount: 1,
        isFullyCompleted: false,
      },
    ],
    overallProgressPercent: 68,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    useCurrentUser.setState({
      user: {
        id: 'owner-1',
        email: 'owner@acme.corp',
        fullName: 'Nguyễn Văn Chủ',
        roles: ['ORGANIZATION_ADMIN'],
        permissions: ['training.read', 'training.create', 'training.update', 'training.cancel'],
      },
      isAuthenticated: true,
    });
  });

  describe('TrainingBatchListPage', () => {
    it('renders list of training batches and KPI summary cards', () => {
      vi.spyOn(batchHooks, 'useTrainingBatchSummary').mockReturnValue({
        data: {
          totalBatches: 2,
          runningBatches: 1,
          scheduledBatches: 1,
          completedBatches: 0,
          totalParticipants: 38,
          totalCompletedCertificates: 12,
        },
        isLoading: false,
      } as any);

      vi.spyOn(batchHooks, 'useTrainingBatches').mockReturnValue({
        data: { items: mockBatches, totalItems: 2, pageIndex: 1, pageSize: 10, totalPages: 1 },
        isLoading: false,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <TrainingBatchListPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(screen.getByText('Đợt đào tạo (Training Batches)')).toBeDefined();
      expect(screen.getByText('Đợt 1: Phổ cập An toàn thông tin Q1/2026')).toBeDefined();
      expect(screen.getByText('Đợt 2: Kỹ năng số cho Cấp bậc G2')).toBeDefined();
      expect(screen.getByText('DOT-2026-01')).toBeDefined();
      expect(screen.getByText('DOT-2026-02')).toBeDefined();
      expect(screen.getByText(/Tạo đợt đào tạo mới/i)).toBeDefined();
    });

    it('filters batches by search input', () => {
      vi.spyOn(batchHooks, 'useTrainingBatchSummary').mockReturnValue({
        data: undefined,
        isLoading: false,
      } as any);

      vi.spyOn(batchHooks, 'useTrainingBatches').mockReturnValue({
        data: { items: [mockBatches[0]], totalItems: 1, pageIndex: 1, pageSize: 10, totalPages: 1 },
        isLoading: false,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <TrainingBatchListPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      const searchInput = screen.getByPlaceholderText(/Tìm theo tên đợt hoặc mã đợt/i);
      fireEvent.change(searchInput, { target: { value: 'Đợt 1' } });

      expect(screen.getByText('Đợt 1: Phổ cập An toàn thông tin Q1/2026')).toBeDefined();
      expect(screen.queryByText('Đợt 2: Kỹ năng số cho Cấp bậc G2')).toBeNull();
    });
  });

  describe('TrainingBatchWizardPage', () => {
    it('renders step 1 and navigates to step 2 after entering name', async () => {
      vi.spyOn(asgHooks, 'useCourses').mockReturnValue({
        data: {
          items: [
            {
              id: 'crs-001',
              code: 'DIG-101',
              title: 'An toàn dữ liệu cá nhân',
              domain: 'An toàn',
              level: 1,
              durationMinutes: 120,
            },
          ],
        } as any,
        isLoading: false,
      } as any);

      vi.spyOn(depHooks, 'useDepartments').mockReturnValue({
        data: { items: [{ id: 'dep-1', name: 'Phòng Công nghệ' }] } as any,
        isLoading: false,
      } as any);

      vi.spyOn(posHooks, 'useJobPositions').mockReturnValue({
        data: { items: [{ id: 'pos-1', name: 'Kỹ sư phần mềm', jobGrade: 'G1' }] } as any,
        isLoading: false,
      } as any);

      vi.spyOn(memHooks, 'useMembers').mockReturnValue({
        data: { items: [{ id: 'usr-1', employeeId: 'emp-1', fullName: 'Lê Văn C', jobGrade: 'G1' }] } as any,
        isLoading: false,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <TrainingBatchWizardPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(screen.getByText('Tạo đợt đào tạo mới')).toBeDefined();
      expect(screen.getByText(/1. Thông tin chung/i)).toBeDefined();

      const nameInput = screen.getByPlaceholderText(/Ví dụ: Đợt 1\/2026/i);
      fireEvent.change(nameInput, { target: { value: 'Chương trình đào tạo mới 2026' } });

      const nextButton = screen.getByRole('button', { name: /Tiếp tục/i });
      fireEvent.click(nextButton);

      // Now should see Step 2: Chọn khóa học
      expect(screen.getByText(/2. Chọn các khóa học đưa vào đợt/i)).toBeDefined();
      expect(screen.getByText('An toàn dữ liệu cá nhân')).toBeDefined();
    });
  });

  describe('TrainingBatchDetailPage', () => {
    it('renders batch detail with courses, participants, and action buttons', () => {
      vi.spyOn(batchHooks, 'useTrainingBatch').mockReturnValue({
        data: mockBatchDetail as any,
        isLoading: false,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/enterprise/training-batches/tb-001']}>
            <Routes>
              <Route path="/enterprise/training-batches/:id" element={<TrainingBatchDetailPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(screen.getByText('Đợt 1: Phổ cập An toàn thông tin Q1/2026')).toBeDefined();
      expect(screen.getByText('DOT-2026-01')).toBeDefined();
      expect(screen.getByRole('button', { name: /Kết thúc đợt/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Hủy đợt/i })).toBeDefined();
      expect(screen.getByText('Khóa học trong đợt (1)')).toBeDefined();
      expect(screen.getByText('Danh sách học viên (1)')).toBeDefined();
    });

    it('switches to participants tab and shows employee row with G1 job grade', () => {
      vi.spyOn(batchHooks, 'useTrainingBatch').mockReturnValue({
        data: mockBatchDetail as any,
        isLoading: false,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/enterprise/training-batches/tb-001']}>
            <Routes>
              <Route path="/enterprise/training-batches/:id" element={<TrainingBatchDetailPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>,
      );

      const participantsTab = screen.getByRole('button', { name: /Danh sách học viên/i });
      fireEvent.click(participantsTab);

      expect(screen.getByText('Trần Thị B')).toBeDefined();
      expect(screen.getByText('NV002')).toBeDefined();
      expect(screen.getByText('G1')).toBeDefined();
      expect(screen.getByText('Phòng Kỹ thuật')).toBeDefined();
    });
  });
});
