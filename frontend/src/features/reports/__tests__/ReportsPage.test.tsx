import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ReportsPage } from '../pages/ReportsPage';
import * as departmentHooks from '@/hooks/use-departments';
import * as jobPositionHooks from '@/hooks/use-job-positions';
import * as employeeHooks from '@/hooks/use-employees';
import * as assignmentHooks from '@/hooks/use-assignments';
import * as analyticsHooks from '@/hooks/use-analytics';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ReportsPage (Agent 1 - Phase H: OW-40)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    vi.clearAllMocks();

    vi.spyOn(departmentHooks, 'useDepartments').mockReturnValue({
      data: {
        items: [
          { id: 'dept-1', name: 'Phòng Công nghệ thông tin', code: 'IT', status: 'ACTIVE' },
          { id: 'dept-2', name: 'Phòng Tài chính kế toán', code: 'FIN', status: 'ACTIVE' },
        ],
      },
      isLoading: false,
    } as any);

    vi.spyOn(jobPositionHooks, 'useJobPositions').mockReturnValue({
      data: {
        items: [
          { id: 'pos-1', name: 'Lập trình viên', code: 'DEV', jobGrade: 'G1', departmentId: 'dept-1' },
          { id: 'pos-2', name: 'Trưởng nhóm giải pháp', code: 'ARCH', jobGrade: 'G2', departmentId: 'dept-1' },
        ],
      },
      isLoading: false,
    } as any);

    vi.spyOn(employeeHooks, 'useEmployees').mockReturnValue({
      data: {
        items: [
          { id: 'emp-1', fullName: 'Phạm Minh Cường', departmentId: 'dept-1', jobPositionId: 'pos-1', status: 'ACTIVE' },
          { id: 'emp-2', fullName: 'Vũ Thị Lan', departmentId: 'dept-1', jobPositionId: 'pos-2', status: 'ACTIVE' },
        ],
      },
      isLoading: false,
    } as any);

    vi.spyOn(assignmentHooks, 'useAssignmentSummary').mockReturnValue({
      data: {
        total: 48,
        completed: 36,
        inProgress: 10,
        completionRate: 75,
        overdue: 2,
        byDepartment: [],
      },
      isLoading: false,
    } as any);

    vi.spyOn(analyticsHooks, 'useCapabilityDashboard').mockReturnValue({
      data: {
        kpis: { averageCoverage: 80 },
        domains: [
          { name: 'Miền 1: Dữ liệu và thông tin', averageCurrent: 2.1, averageRequired: 2.5 },
        ],
      },
      isLoading: false,
    } as any);

    vi.spyOn(analyticsHooks, 'useCompetencyGaps').mockReturnValue({
      data: [
        { frameworkCode: 'D4.02', name: 'Bảo vệ dữ liệu cá nhân', employeesWithGap: 14, highCount: 2 },
      ],
      isLoading: false,
    } as any);

    vi.spyOn(analyticsHooks, 'useReportsOverview').mockReturnValue({
      data: {
        workforce: {
          totalEmployees: 2,
          activeEmployees: 2,
          g1Count: 1,
          g2Count: 1,
          g3Count: 0,
          byDepartment: [
            { id: 'dept-1', name: 'Phòng Công nghệ thông tin', code: 'IT', employeeCount: 2, averageCoverage: 80 },
          ],
        },
        training: {
          totalAssignments: 48,
          completedAssignments: 36,
          inProgressAssignments: 10,
          completionRate: 75,
          courses: [
            { id: 'c1', title: 'An toàn thông tin và văn hóa số doanh nghiệp', domainName: 'Miền 4: An toàn số', learnerCount: 12, averageProgress: 85 },
          ],
        },
        assessment: {
          totalAttempts: 32,
          passRate: 85,
          averageScore: 78,
          retakeCount: 4,
          excellentCount: 10,
          standardCount: 18,
          failedCount: 4,
          excellentPercent: 31,
          standardPercent: 56,
          failedPercent: 13,
        },
        evidence: {
          assignedTotal: 15,
          submittedTotal: 12,
          approvedTotal: 10,
          overallApprovalRate: 83,
          byDepartment: [
            { departmentId: 'dept-1', departmentName: 'Phòng Công nghệ thông tin', assignedCount: 15, submittedCount: 12, approvedCount: 10, approvalRate: 83 },
          ],
        },
      },
      isLoading: false,
    } as any);
  });

  const renderWithClient = (ui: React.ReactNode) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('renders reports overview with all 5 specialized tabs and multi-dimension filters', () => {
    renderWithClient(<ReportsPage />);

    expect(screen.getByText('Báo cáo & Phân tích tổng thể')).toBeInTheDocument();
    expect(screen.getByText('Bộ lọc dữ liệu phân tích')).toBeInTheDocument();

    // 5 tabs present
    expect(screen.getByRole('button', { name: 'Nhân sự' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Năng lực TT02' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đào tạo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đánh giá' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Minh chứng & Nhiệm vụ' })).toBeInTheDocument();

    // Tab 1: Workforce
    expect(screen.getByText('Phân bố theo Cấp bậc')).toBeInTheDocument();
    expect(screen.getByText('Quy mô nhân sự theo phòng ban')).toBeInTheDocument();

    // Switch to Tab 2: Competency TT02
    fireEvent.click(screen.getByRole('button', { name: 'Năng lực TT02' }));
    expect(screen.getByText(/Tiến độ đạt chuẩn theo 6 Miền năng lực/i)).toBeInTheDocument();
    expect(screen.getByText(/Miền 1: Dữ liệu và thông tin/i)).toBeInTheDocument();
    expect(screen.getByText(/Top Skill Gaps/i)).toBeInTheDocument();

    // Switch to Tab 3: Training
    fireEvent.click(screen.getByRole('button', { name: 'Đào tạo' }));
    expect(screen.getByText('Lượt giao khóa học')).toBeInTheDocument();
    expect(screen.getByText(/An toàn thông tin và văn hóa số doanh nghiệp/i)).toBeInTheDocument();

    // Switch to Tab 4: Assessment
    fireEvent.click(screen.getByRole('button', { name: 'Đánh giá' }));
    expect(screen.getByText('Phân bố phổ điểm kiểm tra')).toBeInTheDocument();
    expect(screen.getByText(/Chất lượng bài đánh giá trắc nghiệm/i)).toBeInTheDocument();

    // Switch to Tab 5: Evidence
    fireEvent.click(screen.getByRole('button', { name: 'Minh chứng & Nhiệm vụ' }));
    expect(screen.getByText('Nhiệm vụ thực tế đã giao')).toBeInTheDocument();
    expect(screen.getByText(/Tình hình đánh giá minh chứng thực tế theo phòng ban/i)).toBeInTheDocument();
  });

  it('renders EmptyState when competency domains and skill gaps are empty', () => {
    vi.spyOn(analyticsHooks, 'useCapabilityDashboard').mockReturnValue({
      data: { kpis: { averageCoverage: 0 }, domains: [] },
      isLoading: false,
    } as any);

    vi.spyOn(analyticsHooks, 'useCompetencyGaps').mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    renderWithClient(<ReportsPage />);

    // Switch to Tab 2: Competency TT02
    fireEvent.click(screen.getByRole('button', { name: 'Năng lực TT02' }));
    expect(screen.getByText('Chưa có dữ liệu miền năng lực')).toBeInTheDocument();
    expect(screen.getByText('Không có khoảng trống năng lực')).toBeInTheDocument();
  });
});
