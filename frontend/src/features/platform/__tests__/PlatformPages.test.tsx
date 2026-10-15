import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routes } from '@/app/router';
import { useCurrentUser } from '@/hooks/use-current-user';
import { MOCK_EMAILS, signInAsMock } from '@/test/session';
import type {
  PlatformCourse,
  PlatformOrganization,
  PlatformOrganizationDetail,
  PlatformOverview,
  PlatformUserDetail,
} from '@/services/platform-admin.service';

const service = vi.hoisted(() => ({
  getOverview: vi.fn(),
  getFramework: vi.fn(),
  saveFrameworkDraft: vi.fn(),
  publishFramework: vi.fn(),
  getCourses: vi.fn(),
  getCourse: vi.fn(),
  saveCourseDraft: vi.fn(),
  publishCourse: vi.fn(),
  addCourseQuestion: vi.fn(),
  getOrganizations: vi.fn(),
  getOrganization: vi.fn(),
  grantSeats: vi.fn(),
  suspendOrganization: vi.fn(),
  restoreOrganization: vi.fn(),
  getUsers: vi.fn(),
  getUser: vi.fn(),
  lockUser: vi.fn(),
  unlockUser: vi.fn(),
  getCommerce: vi.fn(),
  getAuditLogs: vi.fn(),
}));

vi.mock('@/services/platform-admin.service', () => ({ platformAdminService: service }));

function App() {
  return useRoutes(routes);
}

const organization: PlatformOrganization = {
  id: 'org-1',
  code: 'NORTHSTAR',
  name: 'Northstar Studio',
  status: 'ACTIVE',
  stage: 'TRIAL',
  ownerName: 'Lan Nguyễn',
  ownerEmail: 'owner@northstar.vn',
  departmentCount: 2,
  employeeCount: 6,
  managerCount: 2,
  userCount: 9,
  seatsPurchased: 0,
  seatsGranted: 0,
  revenue: 0,
  setupCompleted: true,
  createdAt: '2026-10-01T08:00:00Z',
};

const course = (code: string, level: number, domain = 'TT02_D1', domainName = 'Khai thác dữ liệu và thông tin'): PlatformCourse => ({
  id: code,
  code,
  domainCode: domain,
  domainName,
  level,
  levelName: ['Cơ bản', 'Trung cấp', 'Nâng cao'][level - 1],
  versionNo: 1,
  title: `${domainName} · ${['Cơ bản', 'Trung cấp', 'Nâng cao'][level - 1]}`,
  outcome: 'Áp dụng dữ liệu và thông tin với minh chứng truy vết được.',
  pricePerSeat: level === 1 ? 0 : level === 2 ? 399000 : 699000,
  salesStatus: 'OPEN',
  isFree: level === 1,
  hasDraft: false,
  draft: null,
  publishedAt: '2026-10-01T08:00:00Z',
  publishedQuestionCount: 1,
  draftQuestionCount: 0,
  seatsPurchased: 0,
  seatsGranted: 0,
  revenue: 0,
});

const overview: PlatformOverview = {
  organizationCount: 2,
  trialOrganizationCount: 1,
  paidOrganizationCount: 1,
  suspendedOrganizationCount: 0,
  conversionRate: 50,
  userCount: 12,
  employeeCount: 9,
  lockedUserCount: 0,
  frameworkVersion: 1,
  frameworkHasDraft: false,
  domainCount: 6,
  courseCount: 18,
  pausedCourseCount: 0,
  coursesWithDraft: 0,
  publishedQuestionCount: 18,
  draftQuestionCount: 0,
  seatsPurchased: 3,
  seatsGranted: 0,
  revenue: 1197000,
  recentOrganizations: [organization],
  recentActivity: [],
};

describe('Platform Admin console (Pulse)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
    signInAsMock(MOCK_EMAILS.platform);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } });
    vi.clearAllMocks();
    service.getOverview.mockResolvedValue(overview);
    service.getCourses.mockResolvedValue([course('A1-F', 1), course('A1-I', 2), course('A1-A', 3)]);
  });

  const renderAt = (path: string) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  it('PA-01 shows customers, conversion and the console modules', async () => {
    renderAt('/platform/dashboard');

    expect(await screen.findByRole('heading', { level: 1, name: 'Duy trì chuẩn chung và hỗ trợ khách hàng.' })).toBeInTheDocument();
    expect(await screen.findByText('50%')).toBeInTheDocument();
    expect(screen.getByText('v1.0')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Mở ↗/ })).toHaveLength(6);
    expect(screen.getAllByText('Northstar Studio').length).toBeGreaterThan(0);
    const sidebar = screen.getByRole('complementary', { name: 'Điều hướng quản trị nền tảng' });
    expect(within(sidebar).getByRole('link', { name: /Nhật ký kiểm tra/ })).toHaveAttribute('href', '/platform/audit-log');
  });

  it('PA-03 edits a course picked from the 18 and keeps Basic courses free', async () => {
    service.getCourse.mockImplementation(async (code: string) => ({
      course: course(code, ({ F: 1, I: 2, A: 3 } as Record<string, number>)[code.slice(-1)]),
      questions: [],
      releases: [{ versionNo: 1, title: 'x', pricePerSeat: 0, salesStatus: 'OPEN', publishedByEmail: null, publishedAt: '2026-10-01T08:00:00Z' }],
    }));
    renderAt('/platform/curriculum/A1-F');

    expect(await screen.findByText('Bộ chỉnh sửa khóa học')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Chọn khóa học' })).toHaveValue('A1-F');
    expect(screen.getByLabelText('Giá mỗi suất (VND)')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Công bố v2 →' })).toBeDisabled();
  });

  it('PA-06 requires a reason before granting a paid seat', async () => {
    const detail: PlatformOrganizationDetail = { organization, departments: [], people: [], seats: [], orders: [] };
    service.getOrganization.mockResolvedValue(detail);
    service.grantSeats.mockResolvedValue({ ...detail, organization: { ...organization, seatsGranted: 1 } });
    renderAt('/platform/organizations/org-1');

    expect(await screen.findByRole('heading', { level: 1, name: 'Hỗ trợ doanh nghiệp với lý do rõ ràng.' })).toBeInTheDocument();
    expect(await screen.findByText('Northstar Studio')).toBeInTheDocument();
    const submit = screen.getByRole('button', { name: 'Ghi nhận thao tác hỗ trợ →' });
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Khóa có phí để cấp suất' })).toHaveValue('A1-I'));
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Lý do ghi nhật ký'), { target: { value: 'Bù suất do lỗi thanh toán' } });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() =>
      expect(service.grantSeats).toHaveBeenCalledWith('org-1', { courseCode: 'A1-I', seats: 1, reason: 'Bù suất do lỗi thanh toán' }),
    );
  });

  it('PA-08 locks an employee account with a reason', async () => {
    const detail: PlatformUserDetail = {
      user: {
        id: 'u-1',
        email: 'mia@northstar.vn',
        displayName: 'Mia Trần',
        role: 'EMPLOYEE',
        roles: ['EMPLOYEE'],
        organizationId: 'org-1',
        organizationName: 'Northstar Studio',
        departmentName: 'Kế toán',
        positionName: 'Kế toán viên',
        status: 'ACTIVE',
        isManuallyLocked: false,
        lockedUntil: null,
        lastLoginAt: null,
        createdAt: '2026-10-01T08:00:00Z',
      },
      organizationStatus: 'ACTIVE',
      supportHistory: [],
    };
    service.getUser.mockResolvedValue(detail);
    service.lockUser.mockResolvedValue({ ...detail, user: { ...detail.user, status: 'LOCKED', isManuallyLocked: true } });
    renderAt('/platform/users/u-1');

    expect(await screen.findByRole('heading', { level: 1, name: 'Mia Trần' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Lý do ghi nhật ký'), { target: { value: 'Tài khoản bị chia sẻ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Khóa tài khoản →' }));

    await waitFor(() => expect(service.lockUser).toHaveBeenCalledWith('u-1', 'Tài khoản bị chia sẻ'));
  });

  it('SHR-01 is the Platform Admin profile of the mock, opened from the header', async () => {
    service.getAuditLogs.mockResolvedValue({ items: [], pageIndex: 1, pageSize: 1, totalItems: 9, totalPages: 9 });
    renderAt('/platform/account');
    const name = useCurrentUser.getState().user!.fullName;

    expect(await screen.findByRole('heading', { level: 1, name })).toBeInTheDocument();
    expect(await screen.findByText('Đã công bố v1.0')).toBeInTheDocument();
    expect(screen.getByText('Khóa học chuẩn').previousElementSibling).toHaveTextContent('18');
    await waitFor(() => expect(screen.getByText('Mục nhật ký').previousElementSibling).toHaveTextContent('9'));
    expect(service.getAuditLogs).toHaveBeenCalledWith(expect.objectContaining({ pageSize: 1, scope: 'platform' }));
    expect(screen.getByRole('link', { name: `Hồ sơ của tôi: ${name}` })).toHaveAttribute('href', '/platform/account');
    expect(screen.getByRole('button', { name: 'Đăng xuất' })).toBeInTheDocument();
  });

  it('redirects retired platform paths to the new console', async () => {
    renderAt('/platform/plans');
    service.getCommerce.mockResolvedValue({ courses: [], seatsPurchased: 0, seatsGranted: 0, revenue: 0, orders: { items: [], pageIndex: 1, pageSize: 20, totalItems: 0, totalPages: 0 } });

    expect(await screen.findByRole('heading', { level: 1, name: 'Quyền truy cập khóa học được mua theo suất.' })).toBeInTheDocument();
  });
});
