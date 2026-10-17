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
import { ManagerTopbar } from '@/components/layout/ManagerTopbar';
import { ENTERPRISE_PORTAL } from '@/lib/portals';
import { departmentService } from '@/services/department.service';
import { workforceService, type CompetencyLevelRow, type WorkforceRow } from '@/services/workforce.service';
import { taskService } from '@/services/task.service';
import { platformService } from '@/services/platform.service';
import { competencyService } from '@/services/competency.service';
import { buildCapability, levelStatus } from '../lib/capability';
import { MANAGER_PATHS } from '../lib/paths';
import { ManagerCapabilityPage } from '../pages/ManagerCapabilityPage';
import { ManagerEvidencePage } from '../pages/ManagerEvidencePage';
import { ManagerActivityPage } from '../pages/ManagerActivityPage';
import { ManagerFrameworkPage } from '../pages/ManagerFrameworkPage';

const ok = <T,>(data: T) => ({ data: { success: true, message: 'Success', data } }) as never;
const page = <T,>(items: T[]) => ok({ items, pageIndex: 1, pageSize: 100, totalItems: items.length, totalPages: 1 });

const MANAGER_PERMISSIONS = [
  'dashboard.department.read', 'employee.read', 'competency.read', 'competency.profile.read', 'employee_competency_profile.read',
  'skill_gap.read', 'learning_progress.read', 'task.read', 'task.create', 'task.evaluate', 'department.read', 'notification.read_own',
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

describe('Manager sidebar (Pulse)', () => {
  it('has the two prototype groups with the eight items in order', () => {
    expect(labelsOf(MANAGER_SIDEBAR)).toEqual([
      'Quản lý đội', 'Tổng quan', 'Năng lực đội ngũ', 'Chấm bài', 'Báo cáo chu kỳ',
      'Các công cụ khác', 'Khung năng lực chung', 'Đào tạo đội ngũ', 'Minh chứng thực tế', 'Hoạt động',
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
    ['/enterprise/team/members/emp-1', 'Năng lực đội ngũ'],
    ['/enterprise/team/competency', 'Năng lực đội ngũ'],
    ['/enterprise/team/final-reviews', 'Chấm bài'],
    ['/enterprise/team/reports', 'Báo cáo chu kỳ'],
    ['/enterprise/team/framework', 'Khung năng lực chung'],
    ['/enterprise/team/training', 'Đào tạo đội ngũ'],
    ['/enterprise/team/training/asg-1', 'Đào tạo đội ngũ'],
    ['/enterprise/reviews', 'Minh chứng thực tế'],
    ['/enterprise/reviews/sub-9', 'Minh chứng thực tế'],
    ['/enterprise/tasks/new', 'Minh chứng thực tế'],
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

  it('hides an item the manager lacks the permission for', () => {
    signInManager(MANAGER_PERMISSIONS.filter((p) => p !== 'task.evaluate'));
    render(
      <MemoryRouter initialEntries={['/enterprise/team']}>
        <SidebarNav config={MANAGER_SIDEBAR} isRail={false} variant="pulse-manager" />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('link', { name: 'Chấm bài' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Minh chứng thực tế' })).toBeNull();
  });
});

describe('Manager route access', () => {
  it('opens the cycle report and the shared framework as manager-only, read-only screens', () => {
    expect(findEnterpriseScreen('MG-14')).toMatchObject({ path: '/enterprise/team/reports', roles: [ROLES.MANAGER], permission: 'dashboard.department.read' });
    expect(findEnterpriseScreen('MG-15')).toMatchObject({ path: '/enterprise/team/framework', roles: [ROLES.MANAGER], permission: 'competency.read' });
  });

  it('keeps the owner framework and company report closed to managers', () => {
    expect(findEnterpriseScreen('OW-14')!.roles).not.toContain(ROLES.MANAGER);
    expect(findEnterpriseScreen('OW-40')!.roles).not.toContain(ROLES.MANAGER);
  });

  it('builds every manager link from the sitemap', () => {
    expect(MANAGER_PATHS.finalReviews).toBe('/enterprise/team/final-reviews');
    expect(MANAGER_PATHS.evidence).toBe('/enterprise/reviews');
    expect(MANAGER_PATHS.evidenceDetail('sub-1')).toBe('/enterprise/reviews/sub-1');
    expect(MANAGER_PATHS.member('emp-1')).toBe('/enterprise/team/members/emp-1');
  });
});

describe('Evidence and final assignment are separate flows', () => {
  it('routes "Minh chứng thực tế" and "Chấm bài" to different screens', () => {
    const evidence = MANAGER_SIDEBAR.find((s) => s.label === 'Minh chứng thực tế')!;
    const finals = MANAGER_SIDEBAR.find((s) => s.label === 'Chấm bài')!;
    expect(findEnterpriseScreen(evidence.screenId!)!.path).toBe('/enterprise/reviews');
    expect(findEnterpriseScreen(finals.screenId!)!.path).toBe('/enterprise/team/final-reviews');
    expect(evidence.activeFor).not.toContain(finals.screenId);
  });

  it('lists only this department’s practical evidence and sends the decision to the evaluation screen', async () => {
    vi.spyOn(taskService, 'getTasks').mockResolvedValue(page([
      { id: 'tsk-1', title: 'Báo cáo tài chính truy vết được', description: 'Dùng báo cáo nguồn.', expectedOutput: '', competencyIds: [], targetLevel: 2,
        departmentId: 'dep-ops', assignedEmployeesCount: 2, assignedByEmployeeId: 'emp-mgr', assignedByName: 'Lê Quản Lý', assignedAt: '2026-10-01',
        dueDate: '2026-10-21', status: 'ACTIVE', submissionsCount: 1, approvedCount: 0,
        rubricCriteria: [{ id: 'r1', label: 'Nguồn', maxPoints: 5, description: 'Nguồn được nêu rõ' }] },
    ]));
    const getQueue = vi.spyOn(taskService, 'getReviewQueue').mockResolvedValue(page([
      { id: 'sub-ops', taskId: 'tsk-1', taskTitle: 'Báo cáo tài chính truy vết được', targetLevel: 2, employeeId: 'emp-1', employeeName: 'Nguyễn An',
        employeeCode: 'E1', departmentName: 'Vận hành', submittedAt: '2026-10-10T08:00:00Z', content: 'Đã đối chiếu sổ cái.', linkUrls: [], status: 'PENDING_REVIEW' },
      { id: 'sub-fin', taskId: 'tsk-9', taskTitle: 'Việc của phòng khác', targetLevel: 1, employeeId: 'emp-9', employeeName: 'Phòng Khác',
        employeeCode: 'E9', departmentName: 'Tài chính', submittedAt: '2026-10-10T08:00:00Z', content: 'Không được thấy.', linkUrls: [], status: 'PENDING_REVIEW' },
    ]));

    renderAt('/enterprise/reviews', <ManagerEvidencePage />);

    const card = await screen.findByRole('article', { name: 'Báo cáo tài chính truy vết được' });
    expect(within(card).getByText('Nguồn được nêu rõ · tối đa 5 điểm', { exact: false })).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Đánh giá minh chứng →' })).toHaveAttribute('href', '/enterprise/reviews/sub-ops');
    expect(screen.queryByText('Phòng Khác', { exact: false })).toBeNull();
    expect(screen.queryByRole('article', { name: 'Việc của phòng khác' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Chấm bài' })).toHaveAttribute('href', '/enterprise/team/final-reviews');
    expect(getQueue).toHaveBeenCalled();
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

    expect(await screen.findByRole('heading', { level: 1, name: 'Xem tiến độ đã xác nhận bên cạnh mục tiêu.' })).toBeInTheDocument();
    expect(getList).toHaveBeenCalledWith(expect.objectContaining({ departmentId: 'dep-ops' }));
    const select = screen.getByRole('combobox', { name: /Nhân sự/ });
    expect(within(select).getAllByRole('option').map((o) => o.textContent)).toEqual(['Nguyễn An · Kế toán viên']);
    expect(await screen.findByText('Còn 1 mức')).toBeInTheDocument();
    expect(screen.getByText('Chưa xác nhận mức')).toBeInTheDocument();
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

    renderAt('/enterprise/team/framework', <ManagerFrameworkPage />);

    expect(await screen.findAllByRole('article')).toHaveLength(6);
    expect(screen.getAllByText('03 Nâng cao')).toHaveLength(6);
    expect(screen.getByText('Chỉ đọc')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem năng lực đội ngũ' })).toHaveAttribute('href', '/enterprise/team/skill-gap');
    expect(screen.queryByRole('button', { name: /Sửa|Lưu|Tạo/ })).toBeNull();
    expect(screen.queryByRole('link', { name: /Sửa/ })).toBeNull();
  });
});

describe('Activity (notifications)', () => {
  it('marks one unread item and all items read through the existing notification API', async () => {
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

describe('Manager topbar', () => {
  it('shows the four Pulse sections and keeps the manager’s own learning in the account menu', async () => {
    vi.spyOn(platformService, 'getNotifications').mockResolvedValue(ok([]));
    renderAt('/enterprise/team/reports', <ManagerTopbar portal={ENTERPRISE_PORTAL} />, '/enterprise/team/reports');

    const nav = screen.getByRole('navigation', { name: 'Không gian quản lý' });
    expect(within(nav).getAllByRole('link').map((a) => a.textContent)).toEqual(['Tổng quan', 'Năng lực', 'Khóa học', 'Báo cáo']);
    expect(within(nav).getByRole('link', { name: 'Báo cáo' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Tổng quan' })).not.toHaveAttribute('aria-current');
    expect(screen.queryByText(/^\s*\/enterprise/)).toBeNull();
    expect(document.querySelector('a[href^="#/"]')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Menu tài khoản' }));
    expect(screen.getByRole('button', { name: 'Học tập của tôi' })).toBeInTheDocument();
  });
});
