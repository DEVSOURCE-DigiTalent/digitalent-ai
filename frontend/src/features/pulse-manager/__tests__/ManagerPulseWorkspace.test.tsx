import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import { MANAGER_SIDEBAR, OWNER_SIDEBAR, EMPLOYEE_SIDEBAR } from '@/lib/sidebars';
import { findEnterpriseScreen } from '@/lib/screens/enterprise';
import { SidebarNav } from '@/components/layout/sidebar/SidebarNav';
import { SidebarManagerCard } from '@/components/layout/sidebar/SidebarManagerCard';
import { MainLayout } from '@/components/layout/MainLayout';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { WORK_PAGES } from '@/app/routes/enterprise-pages/work';
import { ENTERPRISE_PORTAL } from '@/lib/portals';
import { departmentService } from '@/services/department.service';
import { workforceService, type CompetencyLevelRow, type WorkforceRow } from '@/services/workforce.service';
import { assignmentService, type AssignmentRow } from '@/services/assignment.service';
import { employeeService } from '@/services/employee.service';
import { jobPositionService } from '@/services/job-position.service';
import { TeamMembersPage } from '@/features/manager/pages/team/TeamMembersPage';
import { platformService } from '@/services/platform.service';
import { pulseReviewService } from '@/services/pulse.service';
import { competencyService } from '@/services/competency.service';
import { buildCapability, levelStatus } from '../lib/capability';
import { MANAGER_PATHS } from '../lib/paths';
import { ManagerCapabilityPage } from '../pages/ManagerCapabilityPage';
import { ManagerActivityPage } from '../pages/ManagerActivityPage';
import { ManagerOverviewPage } from '../pages/ManagerOverviewPage';
import { ManagerCycleReportPage } from '../pages/ManagerCycleReportPage';
import { ManagerTeamTrainingPage } from '../pages/ManagerTeamTrainingPage';

const ok = <T,>(data: T) => ({ data: { success: true, message: 'Success', data } }) as never;
const page = <T,>(items: T[]) => ok({ items, pageIndex: 1, pageSize: 100, totalItems: items.length, totalPages: 1 });

const MANAGER_PERMISSIONS = [
  'dashboard.department.read', 'employee.read', 'competency.read', 'competency.profile.read', 'employee_competency_profile.read',
  'skill_gap.read', 'learning_progress.read', 'task.read', 'task.create', 'department.read', 'notification.read_own',
];

function signInManager(permissions = MANAGER_PERMISSIONS) {
  useCurrentUser.setState({
    user: {
      id: 'u-mgr', email: 'manager@digitalent.ai', fullName: 'Lê Quản Lý', employeeId: 'emp-mgr',
      roles: [ROLES.MANAGER], permissions, workspace: 'enterprise',
      organization: { id: 'org-1', name: 'DigiTalent', code: 'DIGITALENT' } as never,
    },
    isAuthenticated: true,
  });
}

function renderAt(path: string, element: ReactNode, routePath = path) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={routePath} element={element} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const DEPARTMENTS = [
  { id: 'dep-ops', code: 'OPS', name: 'Vận hành', managerEmployeeId: 'emp-mgr', headcount: 2, status: 'ACTIVE' },
  { id: 'dep-fin', code: 'FIN', name: 'Tài chính', managerEmployeeId: 'emp-other', headcount: 5, status: 'ACTIVE' },
];

const person = (overrides: Partial<WorkforceRow>): WorkforceRow => ({
  id: 'emp-1', departmentId: 'dep-ops', departmentName: 'Vận hành', employeeCode: 'E1', fullName: 'Nguyễn An',
  jobPositionName: 'Kế toán viên', status: 'ACTIVE', hasSnapshot: true, blocker: null, coveragePercent: 60, gapCount: 1,
  highCount: 0, activeCourses: 1, completedCourses: 0, overdueCourses: 0, ...overrides,
});

const competency = (overrides: Partial<CompetencyLevelRow>): CompetencyLevelRow => ({
  competencyId: 'c-1', frameworkCode: '1.1', name: 'Tìm kiếm thông tin', categoryName: 'Dữ liệu và thông tin',
  categorySortOrder: 1, currentLevel: 1, requiredLevel: 2, source: 'ASSESSMENT', confirmedAt: '2026-10-01T00:00:00Z', note: null,
  ...overrides,
});

beforeEach(() => {
  vi.restoreAllMocks();
  signInManager();
  vi.spyOn(departmentService, 'getList').mockResolvedValue(page(DEPARTMENTS));
});

const labelsOf = (config: typeof MANAGER_SIDEBAR) => config.map((section) => section.label);

it('filters department training and preserves separate links for assigned and independent learning', async () => {
  signInManager([...MANAGER_PERMISSIONS, 'course_assignment.read']);
  const assigned = {
    id: 'assignment-1', employeeId: 'emp-1', employeeName: 'Nguyễn An', employeeCode: 'E1',
    courseId: 'course-1', courseCode: 'M1', courseTitle: 'Kỹ năng số', assignedByName: 'Chủ doanh nghiệp',
    assignedAt: '2026-10-01T00:00:00Z', progressPercent: 100, overdue: true, status: 'IN_PROGRESS',
  } as AssignmentRow;
  const getAssignments = vi.spyOn(assignmentService, 'getList').mockImplementation(async (params) => ok({
    items: params?.pageIndex === 1 ? [assigned] : [{
      ...assigned, id: 'independent-2', employeeId: 'emp-2', employeeName: 'Mai Linh', employeeCode: 'E2',
      source: 'SELF_ENROLLED', overdue: false, progressPercent: 0,
    }],
    totalPages: 2,
  }));
  vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue(ok({ items: [] }));
  renderAt(MANAGER_PATHS.training, <ManagerTeamTrainingPage />);

  const courseTitle = await screen.findByRole('heading', { name: 'Kỹ năng số' });
  fireEvent.click(courseTitle.closest('summary')!);
  expect(await screen.findByRole('link', { name: 'Nguyễn An' })).toHaveAttribute('href', MANAGER_PATHS.trainingDetail('assignment-1'));
  expect(screen.getByRole('link', { name: 'Mai Linh' })).toHaveAttribute('href', MANAGER_PATHS.member('emp-2'));
  expect(screen.getByText('Quá hạn học')).toBeInTheDocument();
  expect(getAssignments).toHaveBeenLastCalledWith(expect.objectContaining({
    departmentId: 'dep-ops', includeIndependentLearning: true, pageIndex: 2,
  }));
  fireEvent.click(screen.getByRole('button', { name: /Cần hỗ trợ/ }));
  expect(screen.queryByRole('link', { name: 'Mai Linh' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'nguyen an' } });
  expect(screen.getByRole('link', { name: 'Nguyễn An' })).toBeInTheDocument();
});

it('uses all assignment pages in the selected department and resets course pagination on search', async () => {
  signInManager([...MANAGER_PERMISSIONS, 'course_assignment.read']);
  const assignment = (index: number): AssignmentRow => ({
    id: `assignment-${index}`, employeeId: 'emp-1', employeeName: 'Nguyễn An',
    courseId: `course-${index}`, courseCode: `M${index}`, courseTitle: `Khóa ${index}`,
    progressPercent: 0, status: 'NOT_STARTED', assignedAt: '2026-10-01T00:00:00Z',
  } as AssignmentRow);
  const getList = vi.spyOn(assignmentService, 'getList').mockImplementation(async (params) => ok({
    items: params?.pageIndex === 2 ? [assignment(7)] : Array.from({ length: 6 }, (_, index) => assignment(index + 1)),
    totalPages: 2,
    totalItems: 7,
  }));
  vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue(ok({ items: [] }));
  renderAt(MANAGER_PATHS.reports, <ManagerCycleReportPage />);

  expect(await screen.findByRole('rowheader', { name: /Khóa 1/ })).toBeInTheDocument();
  expect(getList).toHaveBeenLastCalledWith(expect.objectContaining({
    departmentId: 'dep-ops', includeIndependentLearning: true, pageIndex: 2,
  }));
  expect(screen.queryByRole('rowheader', { name: /Khóa 7/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Trang sau' }));
  expect(screen.getByRole('rowheader', { name: /Khóa 7/ })).toBeInTheDocument();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'M1' } });
  expect(screen.getByRole('rowheader', { name: /Khóa 1/ })).toBeInTheDocument();
  expect(screen.queryByRole('rowheader', { name: /Khóa 7/ })).not.toBeInTheDocument();
});

it('keeps pagination visible for four employees and returns to page one when filters change', async () => {
  const getList = vi.spyOn(employeeService, 'getList').mockImplementation(async (params) => ok({
    items: [person({ fullName: params?.pageIndex === 2 ? 'Nhân viên trang hai' : 'Nguyễn An' })],
    totalItems: 4,
  }));
  vi.spyOn(jobPositionService, 'getAll').mockResolvedValue(page([]));
  renderAt(MANAGER_PATHS.members, <TeamMembersPage />);

  expect(await screen.findByRole('link', { name: /Nguyễn An/ })).toBeInTheDocument();
  const statusFilter = screen.getByRole('button', { name: 'Lọc theo trạng thái' });
  fireEvent.click(statusFilter);
  const currentStatus = within(screen.getByRole('group', { name: 'Lọc theo trạng thái' })).getByRole('button', { pressed: true });
  expect(currentStatus).toHaveFocus();
  fireEvent.keyDown(currentStatus, { key: 'Escape' });
  expect(statusFilter).toHaveFocus();
  expect(statusFilter).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByRole('button', { name: 'Trang sau' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Số dòng mỗi trang' }));
  const picker = within(screen.getByRole('group', { name: 'Số dòng mỗi trang' }));
  expect(picker.getByRole('button', { pressed: true })).toHaveTextContent('10');
  fireEvent.click(picker.getByRole('button', { name: '2 / trang' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Trang sau' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Trang sau' }));
  expect(await screen.findByRole('link', { name: /Nhân viên trang hai/ })).toBeInTheDocument();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Nguyễn' } });
  await waitFor(() => expect(getList).toHaveBeenLastCalledWith(expect.objectContaining({
    departmentId: 'dep-ops', pageIndex: 1, pageSize: 2, search: 'Nguyễn',
  })));
  fireEvent.click(await screen.findByRole('button', { name: 'Số dòng mỗi trang' }));
  fireEvent.click(within(screen.getByRole('group', { name: 'Số dòng mỗi trang' })).getByRole('button', { name: '5 / trang' }));
  await waitFor(() => expect(getList).toHaveBeenLastCalledWith(expect.objectContaining({
    departmentId: 'dep-ops', pageIndex: 1, pageSize: 5, search: 'Nguyễn',
  })));
});

describe('Manager overview', () => {
  it('charts department totals and opens the matching Manager screen', async () => {
    const workforce = vi.spyOn(workforceService, 'getList').mockImplementation(async (params) =>
      ok({ items: [], totalItems: params?.learning === 'ACTIVE' || params?.gap === 'ANY' ? 1 : 0 }),
    );
    const queue = vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue(ok({
      items: [
        { kind: 'FINAL', status: 'PENDING' },
        { kind: 'FINAL', status: 'FLAGGED' },
        { kind: 'PRE_ASSESSMENT', status: 'PENDING' },
      ],
    }));
    renderAt(MANAGER_PATHS.overview, <ManagerOverviewPage />);

    const summary = within(await screen.findByRole('region', { name: 'Tóm tắt phòng ban' }));
    expect(summary.getByRole('link', { name: /Nhân viên.*Đang làm việc/ })).toHaveAttribute('href', MANAGER_PATHS.members);
    const attention = within(await screen.findByRole('region', { name: 'Cần theo dõi' }));
    expect(attention.getByRole('link', { name: /1 Cần hỗ trợ/ })).toHaveAttribute('href', MANAGER_PATHS.finalReviews);
    const metrics = within(await screen.findByRole('region', { name: 'Chỉ số phòng ban' }));
    await waitFor(() => expect(metrics.getByText('Đang có khóa học').closest('li')).toHaveTextContent('1'));
    fireEvent.click(metrics.getByRole('button', { name: 'Năng lực đội ngũ' }));
    await waitFor(() => expect(metrics.getByText('Có khoảng trống năng lực').closest('li')).toHaveTextContent('1'));
    fireEvent.click(metrics.getByRole('button', { name: 'Kết quả bài làm' }));
    expect(metrics.getByText('Chờ đánh giá').closest('li')).toHaveTextContent('1');
    expect(metrics.getByText('Cần hỗ trợ').closest('li')).toHaveTextContent('1');
    expect(metrics.getByRole('link', { name: /Kết quả bài làm/ })).toHaveAttribute('href', MANAGER_PATHS.finalReviews);
    expect(workforce).toHaveBeenCalledWith(expect.objectContaining({ departmentId: 'dep-ops', pageSize: 1, gap: 'ANY' }));
    expect(queue).toHaveBeenCalledWith(true, undefined, false, undefined, 'dep-ops');
  });
});

describe('Manager sidebar (Pulse)', () => {
  it('switches between assigned departments and refreshes the displayed scope', async () => {
    vi.mocked(departmentService.getList).mockResolvedValue(page([
      ...DEPARTMENTS,
      { id: 'dep-support', code: 'SUP', name: 'Hỗ trợ', managerEmployeeId: 'emp-mgr', headcount: 8, status: 'ACTIVE' },
    ]));
    const getWorkforce = vi.spyOn(workforceService, 'getList').mockResolvedValue(ok({ items: [], totalItems: 0, totalPages: 1 }));
    renderAt('/enterprise/team/skill-gap', <><SidebarManagerCard /><ManagerCapabilityPage /></>);

    const select = await screen.findByRole('combobox', { name: 'Phòng ban đang quản lý' });
    fireEvent.click(select);
    const options = within(screen.getByRole('listbox', { name: 'Phòng ban đang quản lý' }));
    expect(options.queryByRole('option', { name: 'Tài chính' })).toBeNull();
    fireEvent.click(options.getByRole('option', { name: 'Hỗ trợ' }));
    await waitFor(() => expect(getWorkforce).toHaveBeenLastCalledWith(expect.objectContaining({ departmentId: 'dep-support' })));
    expect(screen.getByText('8 nhân viên trong phòng ban')).toBeInTheDocument();
    fireEvent.keyDown(select, { key: 'ArrowUp' });
    fireEvent.keyDown(select, { key: 'Home' });
    fireEvent.keyDown(select, { key: 'Enter' });
    await waitFor(() => expect(getWorkforce).toHaveBeenLastCalledWith(expect.objectContaining({ departmentId: 'dep-ops' })));
  });

  it('has the two prototype groups with their items in order', () => {
    expect(labelsOf(MANAGER_SIDEBAR)).toEqual([
      'Quản lý đội', 'Tổng quan', 'Nhân viên', 'Năng lực đội ngũ', 'Kết quả bài làm', 'Báo cáo chu kỳ',
      'Các công cụ khác', 'Đào tạo đội ngũ', 'Hoạt động', 'Góp ý', 'Báo lỗi',
    ]);
  });

  it('only links to screens a manager may open (no owner-only or employee-only entries)', () => {
    for (const section of MANAGER_SIDEBAR) {
      for (const id of [section.screenId, ...(section.activeFor ?? [])].filter(Boolean) as string[]) {
        const screen = findEnterpriseScreen(id);
        expect(screen, id).toBeDefined();
        expect(screen!.roles, id).toContain(ROLES.MANAGER);
      }
    }
  });

  it('leaves the owner and employee sidebars untouched', () => {
    expect(OWNER_SIDEBAR.some((s) => s.screenId === 'OW-01')).toBe(true);
    expect(EMPLOYEE_SIDEBAR).not.toBe(MANAGER_SIDEBAR);
  });

  it.each([
    ['/enterprise/team', 'Tổng quan'],
    ['/enterprise/team/skill-gap', 'Năng lực đội ngũ'],
    ['/enterprise/team/members/emp-1', 'Nhân viên'],
    ['/enterprise/team/competency', 'Năng lực đội ngũ'],
    ['/enterprise/team/final-reviews', 'Kết quả bài làm'],
    ['/enterprise/team/reports', 'Báo cáo chu kỳ'],
    ['/enterprise/team/training', 'Đào tạo đội ngũ'],
    ['/enterprise/team/training/asg-1', 'Đào tạo đội ngũ'],
    ['/enterprise/notifications', 'Hoạt động'],
  ])('on %s highlights exactly "%s"', (path, label) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <SidebarNav config={MANAGER_SIDEBAR} isRail={false} variant="pulse-manager" />
      </MemoryRouter>,
    );
    const current = screen.getAllByRole('link').filter((link) => link.getAttribute('aria-current') === 'page');
    expect(current.map((link) => link.getAttribute('aria-label'))).toEqual([label]);
    expect(current[0].firstElementChild).toHaveClass('pm-side-link', 'active');
  });

  it('shows final results without the grading permission', () => {
    render(
      <MemoryRouter initialEntries={['/enterprise/team']}>
        <SidebarNav config={MANAGER_SIDEBAR} isRail={false} variant="pulse-manager" />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Kết quả bài làm' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Minh chứng thực tế' })).not.toBeInTheDocument();
  });
});

describe('Manager route access', () => {
  it.each(['MG-08', 'MG-09', 'MG-10', 'MG-11', 'MG-12'])('redirects the retired Manager screen %s to the overview', async (id) => {
    const path = findEnterpriseScreen(id)!.path.replace(/:\w+/g, 'example');
    const Page = WORK_PAGES[id]!;
    render(<MemoryRouter initialEntries={[path]}><Routes>
      <Route path={path} element={<Page />} />
      <Route path={MANAGER_PATHS.overview} element={<h1>Tổng quan phòng ban</h1>} />
    </Routes></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: 'Tổng quan phòng ban' })).toBeInTheDocument();
  });

  it('omits practical task screens from Manager quick search', () => {
    renderAt(MANAGER_PATHS.overview, <CommandPalette isOpen onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('Tìm màn hình…'), { target: { value: 'nhiệm vụ' } });
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('keeps the cycle report manager-only and omits the standalone framework', () => {
    expect(findEnterpriseScreen('MG-14')).toMatchObject({ path: '/enterprise/team/reports', roles: [ROLES.MANAGER], permission: 'dashboard.department.read' });
    expect(findEnterpriseScreen('MG-15')).toBeUndefined();
  });

  it('keeps the owner framework and company report closed to managers', () => {
    expect(findEnterpriseScreen('OW-14')!.roles).not.toContain(ROLES.MANAGER);
    expect(findEnterpriseScreen('OW-40')!.roles).not.toContain(ROLES.MANAGER);
  });

  it('builds every manager link from the sitemap', () => {
    expect(MANAGER_PATHS.finalReviews).toBe('/enterprise/team/final-reviews');
    expect(MANAGER_PATHS.member('emp-1')).toBe('/enterprise/team/members/emp-1');
  });
});

describe('Team capability (department scope, honest gaps)', () => {
  it('never counts an unmeasured competency as a gap', () => {
    expect(levelStatus({ currentLevel: null, requiredLevel: 2 })).toBe('PENDING');
    expect(levelStatus({ currentLevel: 1, requiredLevel: 2 })).toBe('GAP');
    expect(levelStatus({ currentLevel: 2, requiredLevel: 2 })).toBe('MET');
    expect(levelStatus({ currentLevel: 3, requiredLevel: 0 })).toBe('OUTSIDE_PATH');
    const { summary } = buildCapability([
      competency({ competencyId: 'a', currentLevel: null }),
      competency({ competencyId: 'b', currentLevel: 1 }),
      competency({ competencyId: 'c', currentLevel: 2 }),
    ]);
    expect(summary).toEqual({ targets: 3, measured: 2, met: 1, gaps: 1, pending: 1 });
  });

  it('asks for the managed department only and shows no one from another department', async () => {
    const getList = vi.spyOn(workforceService, 'getList').mockResolvedValue(page([
      person({ id: 'emp-1', fullName: 'Nguyễn An' }),
      person({ id: 'emp-9', fullName: 'Người Phòng Khác', departmentId: 'dep-fin', departmentName: 'Tài chính' }),
    ]));
    vi.spyOn(workforceService, 'getById').mockResolvedValue(ok({
      employee: person({}), summary: person({}), skillGap: null, recommendations: [], learning: [], evidence: [],
      competencies: [
        competency({ competencyId: 'c-1', frameworkCode: '1.1', currentLevel: 1, requiredLevel: 2 }),
        competency({ competencyId: 'c-2', frameworkCode: '1.2', name: 'Đánh giá dữ liệu', currentLevel: null, requiredLevel: 1, confirmedAt: null }),
      ],
    }));

    renderAt('/enterprise/team/skill-gap', <ManagerCapabilityPage />);

    expect(await screen.findByRole('heading', { level: 1, name: 'Năng lực đội ngũ' })).toBeInTheDocument();
    const select = await screen.findByRole('combobox', { name: /Nhân sự/ });
    expect(getList).toHaveBeenCalledWith(expect.objectContaining({ departmentId: 'dep-ops' }));
    fireEvent.click(select);
    const options = within(screen.getByRole('listbox', { name: 'Nhân sự' }));
    expect(options.getAllByRole('option').map((option) => option.textContent)).toEqual(['Nguyễn An']);
    fireEvent.keyDown(select, { key: 'Escape' });
    expect(screen.queryByRole('listbox', { name: 'Nhân sự' })).not.toBeInTheDocument();
    expect(await screen.findByText('Chưa đạt · Còn 1 mức')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getByText('Chưa xác nhận mức')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Xem chi tiết · Tìm kiếm thông tin/ }));
    expect(screen.getByText('Minh chứng xác nhận')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Tìm năng lực' }), { target: { value: 'danh gia du lieu' } });
    expect(screen.getByRole('rowheader', { name: /Đánh giá dữ liệu/ })).toBeInTheDocument();
    expect(screen.queryByRole('rowheader', { name: /Tìm kiếm thông tin/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Mức yêu cầu chung')).not.toBeInTheDocument();
  });

  it('explains when the manager heads no department instead of showing org-wide data', async () => {
    useCurrentUser.setState((s) => ({ user: { ...s.user!, employeeId: 'emp-nobody' } }));
    const getList = vi.spyOn(workforceService, 'getList');
    renderAt('/enterprise/team/skill-gap', <ManagerCapabilityPage />);
    expect(await screen.findByText('Bạn chưa phụ trách phòng ban nào.')).toBeInTheDocument();
    expect(getList).not.toHaveBeenCalled();
  });
});

describe('Shared framework (read-only)', () => {
  it('shows six domains with three levels and no editing action', async () => {
    const names = ['Dữ liệu và thông tin', 'Giao tiếp và cộng tác', 'Nội dung số', 'An toàn số', 'Giải quyết vấn đề', 'Năng lực AI'];
    vi.spyOn(competencyService, 'getCategories').mockResolvedValue(ok(names.map((name, i) => ({ id: `cat-${i}`, code: `D${i}`, name, sortOrder: i + 1 }))));
    vi.spyOn(competencyService, 'getList').mockResolvedValue(page([]));

    vi.spyOn(workforceService, 'getList').mockResolvedValue(page([]));
    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue(ok({ items: [] }));
    renderAt(MANAGER_PATHS.overview, <ManagerOverviewPage />);
    const trigger = await screen.findByRole('button', { name: 'Khung năng lực chung' });
    expect(competencyService.getCategories).not.toHaveBeenCalled();
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Khung năng lực chung' })).toBeInTheDocument();

    expect(await screen.findAllByRole('article')).toHaveLength(6);
    expect(screen.getAllByText('03 Nâng cao')).toHaveLength(6);
    expect(screen.getByRole('link', { name: 'Xem năng lực đội ngũ' })).toHaveAttribute('href', '/enterprise/team/skill-gap');
    expect(screen.queryByRole('button', { name: /Sửa|Lưu|Tạo/ })).toBeNull();
    expect(screen.queryByRole('link', { name: /Sửa/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Activity (notifications)', () => {
  it('searches older API pages and presents legacy submissions without a grading action', async () => {
    const getNotifications = vi.spyOn(platformService, 'getNotifications').mockImplementation(async (params) => ok({
      items: params?.pageIndex === 1
        ? [{ id: 'a', title: 'Khóa học mới', message: 'Bắt đầu học.', type: 'COURSE', createdAt: '2026-10-14T08:00:00Z', isRead: true }]
        : [{ id: 'b', title: 'Có bài cuối khóa cần chấm', message: 'Hoàng Anh Thư đã nộp bài.', type: 'PULSE_FINAL_SUBMITTED', createdAt: '2026-10-13T08:00:00Z', isRead: false }],
      total: 2, pageSize: 1,
    }));
    renderAt('/enterprise/notifications', <ManagerActivityPage />);

    expect(await screen.findByRole('heading', { name: 'Nhân viên đã nộp bài cuối khóa' })).toBeInTheDocument();
    expect(getNotifications).toHaveBeenLastCalledWith(expect.objectContaining({ pageIndex: 2 }));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'hoang anh thu' } });
    expect(screen.getByText('Hoàng Anh Thư đã nộp bài.')).toBeInTheDocument();
    expect(screen.queryByText('Khóa học mới')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /đánh dấu/i })).not.toBeInTheDocument();
  });

  it('marks one unread item and all items read through the existing notification API', async () => {
    signInManager([...MANAGER_PERMISSIONS, 'notification.mark_read']);
    vi.spyOn(platformService, 'getNotifications').mockResolvedValue(ok([
      { id: 'n-1', title: 'Bài cuối khóa mới', message: 'Nguyễn An đã nộp bài.', type: 'info', createdAt: '2026-10-14T08:00:00Z', isRead: false },
      { id: 'n-2', title: 'Đã duyệt minh chứng', message: 'Lê Chi đạt.', type: 'success', createdAt: '2026-10-13T08:00:00Z', isRead: true },
    ]));
    const markOne = vi.spyOn(platformService, 'markNotificationRead').mockResolvedValue(ok(null));
    const markAll = vi.spyOn(platformService, 'markAllNotificationsRead').mockResolvedValue(ok(null));

    renderAt('/enterprise/notifications', <ManagerActivityPage />);

    fireEvent.click(await screen.findByRole('button', { name: /Bài cuối khóa mới — chưa đọc/ }));
    await waitFor(() => expect(markOne).toHaveBeenCalledWith('n-1'));
    expect(screen.queryByRole('button', { name: /Đã duyệt minh chứng/ })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Đánh dấu tất cả đã đọc' }));
    await waitFor(() => expect(markAll).toHaveBeenCalled());
  });
});

describe('Manager layout', () => {
  it('uses the Owner shell with Manager navigation and personal learning access', () => {
    vi.spyOn(platformService, 'getNotifications').mockResolvedValue(ok([]));
    renderAt('/enterprise/team/reports', (
      <MainLayout portal={ENTERPRISE_PORTAL} sidebarConfig={MANAGER_SIDEBAR}>
        <h1>Tổng hợp đào tạo</h1>
      </MainLayout>
    ));

    expect(screen.getByRole('main').closest('.owner-shell')).toBeInTheDocument();
    const nav = screen.getByRole('complementary', { name: 'Thanh điều hướng' });
    expect(within(nav).getByRole('link', { name: 'Báo cáo chu kỳ' })).toHaveAttribute('href', '/enterprise/team/reports');
    expect(within(nav).getByRole('link', { name: 'Kết quả bài làm' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveTextContent('Báo cáo chu kỳ');
    expect(screen.queryByText(/^\s*\/enterprise/)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Menu tài khoản' }));
    expect(screen.getByRole('button', { name: 'Học tập của tôi' })).toBeInTheDocument();
  });
});
