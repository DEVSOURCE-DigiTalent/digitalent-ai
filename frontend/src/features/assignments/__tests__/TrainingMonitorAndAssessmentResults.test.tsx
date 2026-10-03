import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { TrainingMonitorPage } from '../pages/TrainingMonitorPage';
import { AssessmentResultsOverviewPage } from '../pages/AssessmentResultsOverviewPage';
import * as assignmentHooks from '@/hooks/use-assignments';
import * as departmentHooks from '@/hooks/use-departments';
import * as jobPositionHooks from '@/hooks/use-job-positions';
import * as learningHooks from '@/hooks/use-learning';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('TrainingMonitorPage & AssessmentResultsOverviewPage (Agent 1 - Phase H)', () => {
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

  describe('OW-30: TrainingMonitorPage', () => {
    it('renders training monitor with job grade filter, dept stats, and assignments', () => {
      vi.spyOn(assignmentHooks, 'useAssignmentSummary').mockReturnValue({
        data: {
          total: 25,
          notStarted: 5,
          inProgress: 10,
          readyForAssessment: 2,
          completed: 8,
          overdue: 2,
          dueSoon: 1,
          completionRate: 32,
          byDepartment: [
            { departmentId: 'dept-1', name: 'Phòng Kỹ thuật', total: 15, completed: 5, overdue: 1, averageProgress: 60 },
            { departmentId: 'dept-2', name: 'Phòng Kinh doanh', total: 10, completed: 3, overdue: 1, averageProgress: 45 },
          ],
        },
        isLoading: false,
      } as any);

      vi.spyOn(departmentHooks, 'useDepartments').mockReturnValue({
        data: {
          items: [
            { id: 'dept-1', name: 'Phòng Kỹ thuật', code: 'TECH', status: 'ACTIVE' },
            { id: 'dept-2', name: 'Phòng Kinh doanh', code: 'SALES', status: 'ACTIVE' },
          ],
        },
        isLoading: false,
      } as any);

      vi.spyOn(jobPositionHooks, 'useJobPositions').mockReturnValue({
        data: {
          items: [
            { id: 'pos-1', name: 'Kỹ sư phần mềm', code: 'SE', jobGrade: 'G1' },
            { id: 'pos-2', name: 'Trưởng nhóm kỹ thuật', code: 'TL', jobGrade: 'G2' },
          ],
        },
        isLoading: false,
      } as any);

      vi.spyOn(assignmentHooks, 'useAssignments').mockReturnValue({
        data: {
          items: [
            {
              id: 'asg-1',
              employeeId: 'emp-1',
              employeeName: 'Nguyễn Văn A',
              employeeCode: 'NV001',
              departmentName: 'Phòng Kỹ thuật',
              positionName: 'Kỹ sư phần mềm',
              courseId: 'crs-1',
              courseCode: 'DIG-101',
              courseTitle: 'An toàn dữ liệu cá nhân',
              assignedAt: '2026-09-01T00:00:00Z',
              assignedByName: 'Admin',
              dueDate: '2026-10-15T00:00:00Z',
              status: 'IN_PROGRESS',
              progressPercent: 65,
              source: 'MANUAL',
              overdue: false,
              dueSoon: false,
            },
          ],
          totalItems: 1,
          pageIndex: 1,
          pageSize: 15,
          totalPages: 1,
        },
        isLoading: false,
      } as any);

      renderWithClient(<TrainingMonitorPage />);

      // Title & KPIs
      expect(screen.getByText('Theo dõi đào tạo')).toBeInTheDocument();
      expect(screen.getAllByText('Phòng Kỹ thuật').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
      expect(screen.getByText('An toàn dữ liệu cá nhân')).toBeInTheDocument();

      // Filters exist
      expect(screen.getByLabelText('Lọc theo trạng thái')).toBeInTheDocument();
      expect(screen.getByLabelText('Lọc theo phòng ban')).toBeInTheDocument();
      expect(screen.getByLabelText('Lọc theo vị trí')).toBeInTheDocument();
      expect(screen.getByLabelText('Lọc theo cấp bậc')).toBeInTheDocument();

      // Select Grade G1
      const gradeSelect = screen.getByLabelText('Lọc theo cấp bậc');
      fireEvent.change(gradeSelect, { target: { value: 'G1' } });
      expect((gradeSelect as HTMLSelectElement).value).toBe('G1');
    });

    it('adapts title and hides org department breakdown when in manager scope', () => {
      vi.spyOn(assignmentHooks, 'useAssignmentSummary').mockReturnValue({
        data: {
          total: 10,
          notStarted: 2,
          inProgress: 5,
          readyForAssessment: 1,
          completed: 2,
          overdue: 0,
          dueSoon: 0,
          completionRate: 20,
          byDepartment: [{ departmentId: 'dept-1', name: 'Phòng Kỹ thuật', total: 10, completed: 2, overdue: 0, averageProgress: 50 }],
        },
        isLoading: false,
      } as any);

      vi.spyOn(departmentHooks, 'useDepartments').mockReturnValue({ data: { items: [] }, isLoading: false } as any);
      vi.spyOn(jobPositionHooks, 'useJobPositions').mockReturnValue({ data: { items: [] }, isLoading: false } as any);
      vi.spyOn(assignmentHooks, 'useAssignments').mockReturnValue({ data: { items: [] }, isLoading: false } as any);

      renderWithClient(<TrainingMonitorPage isManagerScope={true} />);

      // In manager scope
      expect(screen.getByText('Tiến độ đào tạo nhóm')).toBeInTheDocument();
      // Should not render "Theo phòng ban" breakdown
      expect(screen.queryByText('Tiến độ theo phòng ban')).not.toBeInTheDocument();
    });
  });

  describe('OW-34: AssessmentResultsOverviewPage', () => {
    it('renders assessment results and opens drill-down attempt detail modal', () => {
      vi.spyOn(learningHooks, 'useAssessmentHistory').mockReturnValue({
        data: {
          items: [
            {
              id: 'att-1',
              assessmentId: 'asm-101',
              courseId: 'crs-1',
              courseTitle: 'An toàn bảo mật số nâng cao',
              employeeId: 'emp-101',
              employeeName: 'Trần Thị Mai',
              score: 85,
              totalQuestions: 20,
              correctAnswers: 17,
              passed: true,
              startedAt: '2026-09-20T08:00:00Z',
              submittedAt: '2026-09-20T08:25:00Z',
              durationSeconds: 1500,
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

      // Title & list item
      expect(screen.getByText('Kết quả đánh giá năng lực')).toBeInTheDocument();
      expect(screen.getByText('Trần Thị Mai')).toBeInTheDocument();
      expect(screen.getByText('An toàn bảo mật số nâng cao')).toBeInTheDocument();
      expect(screen.getAllByText('85%').length).toBeGreaterThanOrEqual(1);

      // Click "Xem bài thi"
      const viewButton = screen.getByRole('button', { name: /Xem bài thi/i });
      fireEvent.click(viewButton);

      // Modal appears
      expect(screen.getByText('Chi tiết kết quả làm bài')).toBeInTheDocument();
      expect(screen.getByText(/Chi tiết từng câu hỏi/i)).toBeInTheDocument();
      expect(screen.getByText(/Theo chuẩn Khung năng lực số TT 02\/2025\/TT-BGDĐT/i)).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getAllByRole('button', { name: 'Đóng' })[0];
      fireEvent.click(closeButton);

      expect(screen.queryByText('Chi tiết kết quả làm bài')).not.toBeInTheDocument();
    });
  });
});
