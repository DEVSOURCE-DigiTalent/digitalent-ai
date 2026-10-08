import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Team / Manager Pages
import { TeamCapabilityDashboardPage } from '@/features/manager/pages/team/TeamCapabilityDashboardPage';
import { TeamMembersPage } from '@/features/manager/pages/team/TeamMembersPage';
import { TeamMemberDetailPage } from '@/features/manager/pages/team/TeamMemberDetailPage';
import { TeamSkillGapPage } from '@/features/manager/pages/team/TeamSkillGapPage';
import * as managerSkillGapHooks from '@/features/manager/hooks/use-manager-skill-gaps';

// Task Management Pages
import { PracticalTaskListPage } from '../pages/PracticalTaskListPage';
import { CreatePracticalTaskPage } from '../pages/CreatePracticalTaskPage';
import { TaskDetailPage } from '../pages/TaskDetailPage';
import { EvaluateEvidencePage } from '../pages/EvaluateEvidencePage';
import { ReviewQueuePage } from '../pages/ReviewQueuePage';

// Hooks
import * as taskHooks from '@/hooks/use-tasks';
import * as empHooks from '@/hooks/use-employees';
import * as competencyHooks from '@/hooks/use-competencies';
import * as jobHooks from '@/hooks/use-job-positions';
import * as deptHooks from '@/hooks/use-departments';
import * as analyticsHooks from '@/hooks/use-analytics';
import { useCurrentUser } from '@/hooks/use-current-user';

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

describe('Tasks, Team & Evidence Flow (MGR-01..12)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCurrentUser.setState({
      user: {
        id: 'usr-mgr-01',
        email: 'manager@digitalent.ai',
        fullName: 'Trần Quản Lý',
        roles: ['MANAGER'],
        permissions: ['team.manage', 'task.read', 'task.create', 'task.evaluate'],
      },
      isAuthenticated: true,
    });
  });

  // ==========================================
  // MGR-01: TeamCapabilityDashboardPage
  // ==========================================
  describe('MGR-01: TeamCapabilityDashboardPage', () => {
    it('renders team overview metrics, review queue counter, and quick action links', () => {
      vi.spyOn(empHooks, 'useEmployees').mockReturnValue({
        data: {
          items: [
            { id: 'e1', fullName: 'Lê Văn An', employeeCode: 'NV001' },
            { id: 'e2', fullName: 'Trần Thị Bình', employeeCode: 'NV002' },
            { id: 'e3', fullName: 'Nguyễn Văn Cường', employeeCode: 'NV003' },
          ],
        },
      } as any);
      vi.spyOn(taskHooks, 'usePracticalTasks').mockReturnValue({
        data: { items: [{ id: 't1' }, { id: 't2' }] },
      } as any);
      vi.spyOn(taskHooks, 'useReviewQueue').mockReturnValue({
        data: { totalItems: 4 },
      } as any);
      vi.spyOn(analyticsHooks, 'useCapabilityDashboard').mockReturnValue({
        data: {
          metrics: { overallCompliancePercent: 78 },
          distribution: [],
        },
      } as any);

      renderWithClient(<TeamCapabilityDashboardPage />);

      expect(screen.getByText('Bảng năng lực của nhóm')).toBeInTheDocument();
      expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1); // total employees
      expect(screen.getByText(/Hàng chờ chấm \(4\)/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Giao bài tập mới/i })).toBeInTheDocument();
    });
  });

  // ==========================================
  // MGR-02: TeamMembersPage
  // ==========================================
  describe('MGR-02: TeamMembersPage', () => {
    it('renders team roster with position and search filters', () => {
      vi.spyOn(empHooks, 'useEmployees').mockReturnValue({
        data: {
          items: [
            {
              id: 'emp-01',
              fullName: 'Lê Văn An',
              employeeCode: 'NV-001',
              positionName: 'Chuyên viên Phân tích Dữ liệu',
              workEmail: 'an.le@acme.com',
              departmentName: 'Khối Công nghệ',
            },
          ],
          totalItems: 1,
          pageIndex: 1,
          pageSize: 15,
          totalPages: 1,
        },
        isLoading: false,
      } as any);
      vi.spyOn(jobHooks, 'useJobPositions').mockReturnValue({
        data: { items: [] },
      } as any);

      renderWithClient(<TeamMembersPage />);

      expect(screen.getByText('Thành viên nhóm')).toBeInTheDocument();
      expect(screen.getByText('Lê Văn An')).toBeInTheDocument();
      expect(screen.getByText('NV-001')).toBeInTheDocument();
      expect(screen.getByText('Chuyên viên Phân tích Dữ liệu')).toBeInTheDocument();
      expect(screen.getByText('an.le@acme.com')).toBeInTheDocument();
    });
  });

  // ==========================================
  // MGR-03: TeamMemberDetailPage
  // ==========================================
  describe('MGR-03: TeamMemberDetailPage', () => {
    it('renders individual team member details and contact info', () => {
      vi.spyOn(empHooks, 'useEmployee').mockReturnValue({
        data: {
          id: 'emp-01',
          fullName: 'Lê Văn An',
          employeeCode: 'NV-001',
          positionName: 'Chuyên viên Phân tích Dữ liệu',
          departmentName: 'Khối Công nghệ',
          workEmail: 'an.le@acme.com',
          joinedAt: '2025-01-15T00:00:00Z',
        },
        isLoading: false,
        isError: false,
      } as any);

      renderWithClient(
        <Routes>
          <Route path="/members/:id" element={<TeamMemberDetailPage />} />
        </Routes>,
        '/members/emp-01'
      );

      expect(screen.getByText('Lê Văn An')).toBeInTheDocument();
      expect(screen.getByText('NV-001')).toBeInTheDocument();
      expect(screen.getByText(/Email: an.le@acme.com/)).toBeInTheDocument();
      expect(screen.getByText(/Phòng ban: Khối Công nghệ/)).toBeInTheDocument();
    });
  });

  // ==========================================
  // MGR-04: TeamSkillGapPage
  // ==========================================
  describe('MGR-04: TeamSkillGapPage', () => {
    it('renders competency gaps in the team and quick assignment link', () => {
      vi.spyOn(managerSkillGapHooks, 'useManagerSkillGapPage').mockReturnValue({
        data: { items: [{ runId: 'run-1', employeeId: 'emp-1', employeeName: 'Lê Văn An', employeeCode: 'NV-001', jobPositionName: 'Chuyên viên', coveragePercent: 50, gapCount: 4, highCount: 2 }], totalPages: 1 },
        isLoading: false,
      } as any);

      renderWithClient(<TeamSkillGapPage />);

      expect(screen.getByText(/Khoảng trống năng lực nhóm/i)).toBeInTheDocument();
      expect(screen.getByText('Lê Văn An')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Xem nhân viên/i })).toBeInTheDocument();
    });
  });

  // ==========================================
  // MGR-05: PracticalTaskListPage
  // ==========================================
  describe('MGR-05: PracticalTaskListPage', () => {
    it('renders practical tasks list with badges and actions', () => {
      vi.spyOn(competencyHooks, 'useAllActiveCompetencies').mockReturnValue({ data: [] } as any);
      vi.spyOn(taskHooks, 'usePracticalTasks').mockReturnValue({
        data: {
          items: [
            {
              id: 'tsk-001',
              title: 'Xây dựng quy trình tự động phân loại email và văn bản',
              targetLevel: 2,
              status: 'ACTIVE',
              departmentName: 'Ban Vận hành',
              dueDate: '2026-10-15',
              competencyIds: ['TT02-1.1', 'TT02-3.1'],
              assignedEmployeesCount: 5,
              submittedCount: 2,
              approvedCount: 1,
            },
          ],
          totalItems: 1,
          pageIndex: 1,
          pageSize: 15,
          totalPages: 1,
        },
        isLoading: false,
      } as any);

      renderWithClient(<PracticalTaskListPage />);

      expect(screen.getByText('Nhiệm vụ & Bài tập thực hành')).toBeInTheDocument();
      expect(screen.getByText('Xây dựng quy trình tự động phân loại email và văn bản')).toBeInTheDocument();
      expect(screen.getByText('Ban Vận hành')).toBeInTheDocument();
      expect(screen.getByText(/Đã nộp:/i)).toBeInTheDocument();
    });
  });

  // ==========================================
  // MGR-06: CreatePracticalTaskPage
  // ==========================================
  describe('MGR-06: CreatePracticalTaskPage', () => {
    it('renders task creation form, rubric criteria, and handles submit', async () => {
      const competencyId = 'e3f56e4a-744d-4a11-8f5c-f25696bd0a03';
      const employeeId = 'c7c029cd-9255-446f-ac4b-560329e191b1';
      const mutateAsync = vi.fn().mockResolvedValue({ id: 'tsk-new' });
      vi.spyOn(deptHooks, 'useDepartments').mockReturnValue({
        data: { items: [{ id: 'd-1', name: 'Khối Công nghệ' }] },
      } as any);
      vi.spyOn(empHooks, 'useAllEmployees').mockReturnValue({
        data: [{ id: employeeId, fullName: 'Lê Văn An', employeeCode: 'NV021' }],
        isLoading: false,
        isError: false,
      } as any);
      vi.spyOn(competencyHooks, 'useAllActiveCompetencies').mockReturnValue({
        data: [{ id: competencyId, frameworkCode: '4.2', code: 'TT02-4.2', name: 'Bảo vệ dữ liệu cá nhân' }],
        isLoading: false,
        isError: false,
      } as any);
      vi.spyOn(taskHooks, 'useCreatePracticalTask').mockReturnValue({
        mutateAsync,
        isPending: false,
      } as any);

      renderWithClient(<CreatePracticalTaskPage />);

      expect(screen.getByText('Giao bài tập thực hành & Dự án năng lực')).toBeInTheDocument();

      fireEvent.change(screen.getByPlaceholderText(/VD: Xây dựng quy trình sao lưu và phân quyền dữ liệu khách hàng CRM/i), {
        target: { value: 'Dự án phân tích dữ liệu tự động' },
      });
      fireEvent.change(screen.getByPlaceholderText(/Mô tả cụ thể tình huống doanh nghiệp/i), {
        target: { value: 'Yêu cầu nhân sự thiết kế luồng tự động' },
      });
      fireEvent.change(screen.getByPlaceholderText(/VD: Bản tài liệu hướng dẫn SOP/i), {
        target: { value: 'File SOP PDF' },
      });
      fireEvent.click(screen.getByRole('button', { name: /TT02-4.2/i }));
      fireEvent.click(screen.getByRole('checkbox'));

      const submitBtn = screen.getByRole('button', { name: /Giao nhiệm vụ thực hành/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Dự án phân tích dữ liệu tự động',
            description: 'Yêu cầu nhân sự thiết kế luồng tự động',
            expectedOutput: 'File SOP PDF',
            competencyIds: [competencyId],
            assignedEmployeeIds: [employeeId],
          })
        );
      });
    });
  });

  // ==========================================
  // MGR-08: TaskDetailPage
  // ==========================================
  describe('MGR-08: TaskDetailPage', () => {
    it('renders task details, rubrics, and assigned submissions', () => {
      vi.spyOn(competencyHooks, 'useTaskCompetencies').mockReturnValue({ data: [] } as any);
      vi.spyOn(taskHooks, 'usePracticalTask').mockReturnValue({
        data: {
          id: 'tsk-001',
          title: 'Xây dựng quy trình tự động phân loại email',
          description: 'Mô tả chi tiết dự án thực tế...',
          expectedOutput: 'File kịch bản + Video demo',
          targetLevel: 2,
          status: 'ACTIVE',
          dueDate: '2026-10-15',
          assignedByName: 'Trần Quản Lý',
          competencyIds: ['TT02-1.1'],
          rubricCriteria: [
            { id: 'r1', label: 'Tính hoàn thiện của quy trình', maxPoints: 50, description: 'Đủ các bước' },
          ],
          assignedEmployees: [
            { id: 'emp-001', fullName: 'Lê Văn An', employeeCode: 'NV001' },
          ],
          submissions: [
            {
              id: 'sub-001',
              employeeId: 'emp-001',
              employeeName: 'Lê Văn An',
              employeeCode: 'NV001',
              status: 'PENDING_REVIEW',
              submittedAt: '2026-10-01T10:00:00Z',
              score: null,
            },
          ],
        },
        isLoading: false,
        isError: false,
      } as any);

      renderWithClient(
        <Routes>
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
        </Routes>,
        '/tasks/tsk-001'
      );

      expect(screen.getByText('Xây dựng quy trình tự động phân loại email')).toBeInTheDocument();
      expect(screen.getByText('Mô tả chi tiết dự án thực tế...')).toBeInTheDocument();
      expect(screen.getByText('Tính hoàn thiện của quy trình')).toBeInTheDocument();
      expect(screen.getAllByText('Lê Văn An').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole('link', { name: /Chấm điểm/i })).toBeInTheDocument();
    });
  });

  // ==========================================
  // MGR-10: EvaluateEvidencePage
  // ==========================================
  describe('MGR-10: EvaluateEvidencePage', () => {
    it('renders rubric evaluation inputs, calculates score, and handles decision', async () => {
      const mutateAsync = vi.fn().mockResolvedValue({ id: 'sub-001', status: 'APPROVED' });

      vi.spyOn(taskHooks, 'usePracticalTask').mockReturnValue({
        data: {
          id: 'tsk-001',
          title: 'Xây dựng quy trình tự động',
          targetLevel: 2,
          rubricCriteria: [
            { id: 'r1', label: 'Tính đúng đắn kỹ thuật', maxPoints: 50, description: 'Code chạy đúng' },
            { id: 'r2', label: 'Tính ứng dụng thực tế', maxPoints: 50, description: 'Dễ áp dụng' },
          ],
        },
        isLoading: false,
      } as any);

      vi.spyOn(taskHooks, 'useSubmissionDetail').mockReturnValue({
        data: {
          id: 'sub-001',
          taskId: 'tsk-001',
          employeeName: 'Lê Văn An',
          employeeCode: 'NV001',
          content: 'Em đã xây dựng xong script phân loại.',
          linkUrls: ['https://github.com/acme/script'],
          submittedAt: '2026-10-01T10:00:00Z',
          status: 'PENDING_REVIEW',
        },
        isLoading: false,
      } as any);

      vi.spyOn(taskHooks, 'useEvaluateSubmission').mockReturnValue({
        mutateAsync,
        isPending: false,
      } as any);

      renderWithClient(
        <Routes>
          <Route path="/tasks/:id/evaluate" element={<EvaluateEvidencePage />} />
        </Routes>,
        '/tasks/tsk-001/evaluate?subId=sub-001'
      );

      expect(screen.getByText(/Chấm điểm minh chứng: Lê Văn An/i)).toBeInTheDocument();
      expect(screen.getByText('Em đã xây dựng xong script phân loại.')).toBeInTheDocument();
      expect(screen.getByText('Tính đúng đắn kỹ thuật')).toBeInTheDocument();

      // Change feedback
      const feedbackInput = screen.getByPlaceholderText(/Ghi nhận điểm mạnh/i);
      fireEvent.change(feedbackInput, { target: { value: 'Bài làm rất tốt và đầy đủ.' } });

      const submitBtn = screen.getByRole('button', { name: /Hoàn tất đánh giá/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalledWith({
          id: 'sub-001',
          payload: expect.objectContaining({
            score: 0, // Reviewer must award points explicitly.
            feedback: 'Bài làm rất tốt và đầy đủ.',
            decision: 'APPROVED',
          }),
        });
      });
    });
  });

  // ==========================================
  // MGR-12: ReviewQueuePage
  // ==========================================
  describe('MGR-12: ReviewQueuePage', () => {
    it('renders pending review queue table with direct evaluation links', () => {
      vi.spyOn(taskHooks, 'useReviewQueue').mockReturnValue({
        data: {
          items: [
            {
              id: 'sub-001',
              taskId: 'tsk-001',
              taskTitle: 'Tự động hóa báo cáo',
              targetLevel: 2,
              employeeId: 'emp-001',
              employeeName: 'Lê Văn An',
              employeeCode: 'NV001',
              departmentName: 'Kỹ thuật',
              submittedAt: '2026-10-01T10:00:00Z',
              taskDueDate: '2026-10-15',
            },
          ],
          totalItems: 1,
          pageIndex: 1,
          pageSize: 15,
          totalPages: 1,
        },
        isLoading: false,
      } as any);

      renderWithClient(<ReviewQueuePage />);

      expect(screen.getByText('Hàng chờ đánh giá minh chứng')).toBeInTheDocument();
      expect(screen.getByText('Lê Văn An')).toBeInTheDocument();
      expect(screen.getByText('Tự động hóa báo cáo')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Chấm điểm/i })).toBeInTheDocument();
    });
  });
});
