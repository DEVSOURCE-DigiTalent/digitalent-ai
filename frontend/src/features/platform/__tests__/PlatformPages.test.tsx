import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routes } from '@/app/router';
import { preloadLazyPages } from '@/app/routes/lazy-page';
import { useCurrentUser } from '@/hooks/use-current-user';
import { MOCK_EMAILS, signInAsMock } from '@/test/session';
import type {
  PlatformCourse,
  PlatformOrganization,
  PlatformOrganizationDetail,
  PlatformOverview,
  PlatformUserDetail,
} from '@/services/platform-admin.service';
import type {
  CatalogCourseDetail,
  CatalogCourseRow,
  CatalogVersionDetail,
  CatalogVersionsOutput,
  CatalogVersionSummary,
  FrameworkDetail,
  FrameworksOutput,
  FrameworkSummary,
} from '@/services/platform-catalog.service';

const service = vi.hoisted(() => ({
  getOverview: vi.fn(),
  getCourses: vi.fn(),
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

const catalog = vi.hoisted(() => ({
  getFrameworks: vi.fn(),
  getFramework: vi.fn(),
  saveFrameworkDraft: vi.fn(),
  publishFramework: vi.fn(),
  addFrameworkDomain: vi.fn(),
  updateDomain: vi.fn(),
  archiveDomain: vi.fn(),
  getVersions: vi.fn(),
  createDraft: vi.fn(),
  getVersion: vi.fn(),
  getPublishCheck: vi.fn(),
  publishVersion: vi.fn(),
  updatePrices: vi.fn(),
  createCourse: vi.fn(),
  getCourse: vi.fn(),
  updateCourse: vi.fn(),
  removeCourse: vi.fn(),
  updateFinal: vi.fn(),
  addModule: vi.fn(),
  updateModule: vi.fn(),
  removeModule: vi.fn(),
  moveModule: vi.fn(),
  addBlock: vi.fn(),
  updateBlock: vi.fn(),
  removeBlock: vi.fn(),
  moveBlock: vi.fn(),
  addQuestion: vi.fn(),
  updateQuestion: vi.fn(),
  removeQuestion: vi.fn(),
  uploadAsset: vi.fn(),
}));

vi.mock('@/services/platform-admin.service', () => ({ platformAdminService: service }));
vi.mock('@/services/platform-catalog.service', () => ({
  platformCatalogService: catalog,
  assetUrl: (asset: { url: string }) => `/api/v1/${asset.url}`,
}));

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
  planCode: 'BUSINESS',
  planName: 'Gói Doanh nghiệp',
  planStatus: 'ACTIVE',
  planCycle: 'year',
  seatLimit: 50,
  planRenewsAt: '2027-10-01T08:00:00Z',
  coursesInUseByLevel: [3, 1, 0],
  participantCount: 4,
};

const LEVELS = ['Cơ bản', 'Trung cấp', 'Nâng cao'];

const course = (code: string, level: number): PlatformCourse => ({
  id: `c-${code}`,
  code,
  frameworkId: 'fw-1',
  frameworkName: 'Chuẩn năng lực số TT02',
  domainCode: 'TT02_D1',
  domainName: 'Khai thác dữ liệu và thông tin',
  level,
  levelName: LEVELS[level - 1]!,
  versionNo: 3,
  title: `Dữ liệu · ${LEVELS[level - 1]}`,
  outcome: 'Áp dụng dữ liệu và thông tin với minh chứng truy vết được.',
  pricePerSeat: level === 1 ? 0 : level === 2 ? 399000 : 699000,
  salesStatus: 'OPEN',
  isFree: level === 1,
  draftPricePerSeat: null,
  draftSalesStatus: null,
  publishedAt: '2026-10-01T08:00:00Z',
  moduleCount: 4,
  questionCount: 24,
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
  trialUserCount: 3,
  trialEndingSoonCount: 1,
  frameworkCount: 1,
  draftFrameworkCount: 0,
  frameworkHasDraft: false,
  domainCount: 6,
  currentVersionNo: 3,
  currentVersionPublishedAt: '2026-10-10T08:00:00Z',
  draftVersionNo: 4,
  draftNewCourseCount: 1,
  draftEditedCourseCount: 2,
  courseCount: 18,
  pausedCourseCount: 0,
  questionCount: 432,
  seatsPurchased: 3,
  seatsGranted: 0,
  revenue: 1197000,
  recentOrganizations: [organization],
  recentActivity: [],
};

const frameworkSummary: FrameworkSummary = {
  id: 'fw-1',
  code: 'TT02_2025',
  name: 'Chuẩn năng lực số TT02',
  description: 'Sáu lĩnh vực năng lực số theo Thông tư 02/2025.',
  status: 'PUBLISHED',
  currentVersionNo: 1,
  domainCount: 6,
  courseCount: 18,
  coursesByLevel: [6, 6, 6],
  draftCourseCount: 19,
  hasDraft: false,
};

const frameworkDetail: FrameworkDetail = {
  ...frameworkSummary,
  currentCatalogVersionNo: 3,
  draftCatalogVersionNo: 4,
  domains: [
    {
      id: 'd-1',
      code: 'TT02_D1',
      name: 'Khai thác dữ liệu và thông tin',
      sortOrder: 1,
      publishedDescription: 'Tìm, đánh giá và quản lý dữ liệu.',
      draftDescription: 'Tìm, đánh giá và quản lý dữ liệu.',
      hasDraft: false,
      courses: [{ courseId: 'c-A1-F', code: 'A1-F', title: 'Dữ liệu · Cơ bản', level: 1, levelName: 'Cơ bản' }],
      draftNewCourses: [{ courseId: 'c-AI1-F', code: 'AI1-F', title: 'AI cho công việc', level: 1, levelName: 'Cơ bản' }],
    },
  ],
  releases: [],
};

const versionSummary = (versionNo: number, status: CatalogVersionSummary['status']): CatalogVersionSummary => ({
  versionNo,
  status,
  basedOnVersionNo: versionNo > 1 ? versionNo - 1 : null,
  releaseNote: null,
  createdAt: '2026-10-09T08:00:00Z',
  publishedAt: status === 'DRAFT' ? null : '2026-10-10T08:00:00Z',
  publishedByEmail: status === 'DRAFT' ? null : 'platform@digitalent.ai',
  courseCount: status === 'DRAFT' ? 19 : 18,
  frameworkCount: 1,
  newCount: status === 'DRAFT' ? 1 : 0,
  editedCount: 0,
});

const versions: CatalogVersionsOutput = {
  items: [versionSummary(4, 'DRAFT'), versionSummary(3, 'CURRENT'), versionSummary(2, 'RETIRED')],
  currentVersionNo: 3,
  draftVersionNo: 4,
};

const row = (code: string, level: number, changeKind: CatalogCourseRow['changeKind'] = 'UNCHANGED'): CatalogCourseRow => ({
  courseId: `c-${code}`,
  code,
  title: `Khóa ${code}`,
  frameworkId: 'fw-1',
  frameworkName: 'Chuẩn năng lực số TT02',
  domainId: 'd-1',
  domainName: 'Khai thác dữ liệu và thông tin',
  level,
  levelName: LEVELS[level - 1]!,
  moduleCount: 4,
  questionCount: 24,
  pricePerSeat: level === 1 ? 0 : 399000,
  salesStatus: 'OPEN',
  changeKind,
});

const versionDetail = (versionNo: number): CatalogVersionDetail => {
  const summary = versions.items.find((v) => v.versionNo === versionNo)!;
  return {
    version: summary,
    editable: summary.status === 'DRAFT',
    courses: summary.status === 'DRAFT' ? [row('A1-F', 1), row('A1-I', 2), row('AI1-F', 1, 'NEW')] : [row('A1-F', 1), row('A1-I', 2)],
  };
};

const courseDetail = (versionNo: number, overrides: Partial<CatalogCourseDetail> = {}): CatalogCourseDetail => ({
  versionNo,
  versionStatus: versionNo === 4 ? 'DRAFT' : 'CURRENT',
  editable: versionNo === 4,
  courseId: 'c-AI1-F',
  code: 'AI1-F',
  codeEditable: versionNo === 4,
  changeKind: versionNo === 4 ? 'NEW' : 'UNCHANGED',
  frameworkId: 'fw-1',
  frameworkName: 'Chuẩn năng lực số TT02',
  domainId: 'd-1',
  domainName: 'Khai thác dữ liệu và thông tin',
  level: 1,
  levelName: 'Cơ bản',
  title: 'AI cho công việc',
  outcome: '',
  pricePerSeat: 0,
  salesStatus: 'OPEN',
  final: { title: 'Bài cuối khóa', promptHtml: '', criteria: ['Đúng yêu cầu'] },
  modules: [{ moduleId: 'm-1', index: 0, title: 'Viết câu lệnh', quizTitle: 'Ôn tập', blocks: [], questions: [] }],
  ...overrides,
});

describe('Platform Admin console (v2)', () => {
  // Pages and layouts are lazy chunks; load them once so each test only waits for its own render.
  beforeAll(() => preloadLazyPages(), 120_000);
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
    signInAsMock(MOCK_EMAILS.platform);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } });
    vi.clearAllMocks();
    service.getOverview.mockResolvedValue(overview);
    service.getCourses.mockResolvedValue([course('A1-F', 1), course('A1-I', 2), course('A1-A', 3)]);
    catalog.getFrameworks.mockResolvedValue({ items: [frameworkSummary], currentCatalogVersionNo: 3, draftCatalogVersionNo: 4 } satisfies FrameworksOutput);
    catalog.getFramework.mockResolvedValue(frameworkDetail);
    catalog.getVersions.mockResolvedValue(versions);
    catalog.getVersion.mockImplementation(async (no: number) => versionDetail(no));
  });

  const renderAt = (path: string) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  it('PA-01 shows the version in use, the draft and what needs attention', async () => {
    renderAt('/platform/dashboard');

    expect(await screen.findByRole('heading', { level: 1, name: 'Toàn cảnh nền tảng hôm nay.' })).toBeInTheDocument();
    expect((await screen.findByText('⚓ Phiên bản đang dùng')).nextElementSibling).toHaveTextContent('v3');
    expect(screen.getByText('1 khóa mới · 2 đã sửa')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mở bản nháp' })).toHaveAttribute('href', '/platform/versions/4');
    expect(screen.getByText('1 người dùng thử hết hạn trong 2 ngày.')).toBeInTheDocument();
    const sidebar = screen.getByRole('complementary', { name: 'Điều hướng quản trị nền tảng' });
    expect(within(sidebar).getByRole('link', { name: /Phiên bản khóa học/ })).toHaveAttribute('href', '/platform/versions');
    expect(within(sidebar).getByRole('link', { name: /Đơn giá/ })).toHaveAttribute('href', '/platform/commerce');
  });

  it('PA-02 shows the one framework with its domains and courses, without adding frameworks', async () => {
    renderAt('/platform/frameworks');

    expect(await screen.findByRole('heading', { level: 1, name: 'Chuẩn năng lực số TT02' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 4, name: 'Khai thác dữ liệu và thông tin' })).toBeInTheDocument();
    expect(screen.getByText('1 khóa trong v3 · +1 trong bản nháp v4')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /AI1-F/ })).toHaveAttribute('href', '/platform/versions/4/courses/c-AI1-F');
    expect(screen.getByRole('button', { name: '+ Thêm lĩnh vực' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Thêm khung/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sửa khung|Xóa khung/ })).not.toBeInTheDocument();
  });

  it('PA-02 adds and renames a domain', async () => {
    catalog.addFrameworkDomain.mockResolvedValue(frameworkDetail);
    catalog.updateDomain.mockResolvedValue(frameworkDetail);
    renderAt('/platform/frameworks');

    fireEvent.click(await screen.findByRole('button', { name: '+ Thêm lĩnh vực' }));
    const addForm = screen.getByRole('form', { name: 'Thêm lĩnh vực' });
    fireEvent.change(within(addForm).getByLabelText('Tên lĩnh vực mới'), { target: { value: 'Dữ liệu khách hàng' } });
    fireEvent.click(within(addForm).getByRole('button', { name: 'Thêm lĩnh vực' }));
    await waitFor(() => expect(catalog.addFrameworkDomain).toHaveBeenCalledWith('fw-1', { name: 'Dữ liệu khách hàng', description: undefined }));

    fireEvent.click(screen.getByRole('button', { name: 'Sửa Khai thác dữ liệu và thông tin' }));
    const editForm = screen.getByRole('form', { name: 'Sửa Lĩnh vực 01' });
    const save = within(editForm).getByRole('button', { name: 'Lưu' });
    expect(save).toBeDisabled();
    fireEvent.change(within(editForm).getByLabelText('Tên lĩnh vực'), { target: { value: 'Dữ liệu và thông tin' } });
    fireEvent.change(within(editForm).getByLabelText(/Mô tả \(bản nháp\)/), { target: { value: 'Tìm, đánh giá và quản lý dữ liệu công việc.' } });
    fireEvent.click(save);

    await waitFor(() =>
      expect(catalog.updateDomain).toHaveBeenCalledWith('fw-1', 'd-1', {
        name: 'Dữ liệu và thông tin',
        description: 'Tìm, đánh giá và quản lý dữ liệu công việc.',
      }),
    );
  });

  it('PA-02 does not delete a domain that has courses', async () => {
    renderAt('/platform/frameworks');

    fireEvent.click(await screen.findByRole('button', { name: 'Xóa Khai thác dữ liệu và thông tin' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Lĩnh vực có 2 khóa học (gồm 1 khóa mới trong bản nháp v4) nên không xóa được.');
    expect(screen.queryByRole('button', { name: 'Xóa lĩnh vực' })).not.toBeInTheDocument();
    expect(catalog.archiveDomain).not.toHaveBeenCalled();
  });

  it('PA-02 deletes a domain without courses', async () => {
    const empty = {
      id: 'd-2', code: 'TT02_2025_D7', name: 'Dữ liệu khách hàng', sortOrder: 7, publishedDescription: '', draftDescription: '',
      hasDraft: false, courses: [], draftNewCourses: [],
    };
    catalog.getFramework.mockResolvedValue({ ...frameworkDetail, domainCount: 2, domains: [...frameworkDetail.domains, empty] });
    catalog.archiveDomain.mockResolvedValue(frameworkDetail);
    renderAt('/platform/frameworks');

    fireEvent.click(await screen.findByRole('button', { name: 'Xóa Dữ liệu khách hàng' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Xóa lĩnh vực “Dữ liệu khách hàng”?');
    fireEvent.click(screen.getByRole('button', { name: 'Xóa lĩnh vực' }));

    await waitFor(() => expect(catalog.archiveDomain).toHaveBeenCalledWith('fw-1', 'd-2'));
  });

  it('redirects an old framework link to the framework page', async () => {
    renderAt('/platform/frameworks/fw-1');

    expect(await screen.findByRole('heading', { level: 1, name: 'Chuẩn năng lực số TT02' })).toBeInTheDocument();
  });

  it('PA-03 keeps the current anchor visible and opens the working draft by default', async () => {
    renderAt('/platform/versions');

    expect(await screen.findByText('Phiên bản v3')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 2, name: 'Khóa học của v4' })).toBeInTheDocument();
    expect(screen.getByText('Bản nháp chép từ v3: 1 khóa mới, 0 khóa đã sửa.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Công bố v4' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Sửa' })).toHaveLength(3);
  });

  it('PA-12 blocks publishing a draft while the publish check has blocking items', async () => {
    catalog.getPublishCheck.mockResolvedValue({
      versionNo: 4,
      canPublish: false,
      changedCount: 1,
      items: [{ level: 'BLOCK', courseId: 'c-AI1-F', courseCode: 'AI1-F', moduleId: 'm-1', message: 'Mô đun 1: chưa có nội dung.' }],
    });
    renderAt('/platform/versions/4');

    expect(await screen.findByRole('heading', { level: 2, name: 'Khóa học của v4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bỏ AI1-F khỏi bản nháp' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Công bố v4' }));

    const dialog = await screen.findByRole('dialog', { name: 'Công bố phiên bản v4' });
    expect(await within(dialog).findByText(/Mô đun 1: chưa có nội dung./)).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Công bố v4 →' })).toBeDisabled();
    expect(catalog.publishVersion).not.toHaveBeenCalled();
  });

  it('PA-04 adds a content block with the "+" of an empty module', async () => {
    catalog.getCourse.mockResolvedValue(courseDetail(4));
    catalog.addBlock.mockResolvedValue(
      courseDetail(4, {
        modules: [
          {
            moduleId: 'm-1',
            index: 0,
            title: 'Viết câu lệnh',
            quizTitle: 'Ôn tập',
            blocks: [{ blockId: 'b-1', index: 0, type: 'IMAGE', bodyHtml: null, asset: null, caption: null, altText: null, items: [] }],
            questions: [],
          },
        ],
      }),
    );
    renderAt('/platform/versions/4/courses/c-AI1-F?s=0');

    expect(await screen.findByRole('textbox', { name: 'Tên mô đun' })).toHaveValue('Viết câu lệnh');
    fireEvent.click(screen.getByRole('button', { name: 'Thêm nội dung đầu tiên' }));
    const menu = screen.getByRole('group', { name: 'Chọn loại khối' });
    expect(within(menu).getAllByRole('button').map((b) => b.querySelector('strong')?.textContent)).toEqual(['Chữ', 'Slide', 'Ảnh', 'Video']);
    fireEvent.click(within(menu).getByRole('button', { name: /Ảnh/ }));

    await waitFor(() => expect(catalog.addBlock).toHaveBeenCalledWith(4, 'c-AI1-F', 'm-1', 'IMAGE', 0));
    expect(await screen.findByRole('button', { name: /Chọn ảnh từ máy/ })).toBeInTheDocument();
  });

  it('PA-04 keeps Basic courses free and a published version read-only', async () => {
    catalog.getCourse.mockImplementation(async (no: number) => courseDetail(no));
    renderAt('/platform/versions/3/courses/c-AI1-F');

    expect(await screen.findByText(/v3 đang dùng — chỉ xem/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Giá mỗi suất/)).toBeDisabled();
    expect(screen.queryByRole('button', { name: '+ Thêm mô đun' })).not.toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: 'Sửa trong v4' }));

    expect(await screen.findByText('Mọi thay đổi được lưu ngay vào bản nháp v4.')).toBeInTheDocument();
    expect(catalog.getCourse).toHaveBeenLastCalledWith(4, 'c-AI1-F');
    expect(screen.getByRole('button', { name: '+ Thêm mô đun' })).toBeInTheDocument();
  });

  it('PA-06 requires a reason before granting a paid seat', async () => {
    const detail: PlatformOrganizationDetail = {
      organization,
      departments: [],
      people: [],
      seats: [],
      orders: [],
      coursesInUse: [{ courseCode: 'A1-F', courseTitle: 'Dữ liệu · Cơ bản', level: 1, levelName: 'Cơ bản', participants: 4, completed: 2 }],
    };
    service.getOrganization.mockResolvedValue(detail);
    service.grantSeats.mockResolvedValue({ ...detail, organization: { ...organization, seatsGranted: 1 } });
    renderAt('/platform/organizations/org-1');

    expect(await screen.findByRole('heading', { level: 1, name: 'Hỗ trợ doanh nghiệp với lý do rõ ràng.' })).toBeInTheDocument();
    expect(await screen.findByText('Northstar Studio')).toBeInTheDocument();
    expect(screen.getByText('Gói Doanh nghiệp')).toBeInTheDocument();
    expect(screen.getByText('4 / 6')).toBeInTheDocument();
    expect(screen.getByText('Dữ liệu · Cơ bản')).toBeInTheDocument();
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
        planCode: null,
        trialState: null,
        trialStartedAt: null,
        trialEndsAt: null,
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

  it('PA-05 lists the plan, the courses in use by level and who takes part', async () => {
    service.getOrganizations.mockResolvedValue({ items: [organization], pageIndex: 1, pageSize: 20, totalItems: 1, totalPages: 1 });
    renderAt('/platform/organizations');

    expect(await screen.findByRole('heading', { level: 1, name: 'Doanh nghiệp đang dùng nền tảng.' })).toBeInTheDocument();
    const row = (await screen.findByText('Northstar Studio')).closest('tr')!;
    expect(within(row).getByText('Gói Doanh nghiệp')).toBeInTheDocument();
    expect(within(row).getByText('Cơ bản · 3')).toBeInTheDocument();
    expect(within(row).getByText('Trung cấp · 1')).toBeInTheDocument();
    expect(row).toHaveTextContent('4 / 6');

    fireEvent.click(screen.getByRole('button', { name: 'Tạm ngưng' }));
    await waitFor(() => expect(service.getOrganizations).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'SUSPENDED' })));
  });

  it('PA-07 follows personal trials', async () => {
    const soon = new Date(Date.now() + 36 * 3600 * 1000).toISOString();
    service.getUsers.mockResolvedValue({
      items: [
        {
          id: 'u-9', email: 'trial@gmail.com', displayName: 'Học viên thử', role: 'LEARNER', roles: [], organizationId: null, organizationName: null,
          departmentName: null, positionName: null, status: 'ACTIVE', isManuallyLocked: false, lockedUntil: null, lastLoginAt: null,
          createdAt: '2026-10-10T08:00:00Z', planCode: 'IND_PLUS', trialState: 'ACTIVE', trialStartedAt: '2026-10-10T08:00:00Z', trialEndsAt: soon,
        },
      ],
      pageIndex: 1, pageSize: 20, totalItems: 1, totalPages: 1,
      trials: { active: 3, endingSoon: 1, ended: 2 },
    });
    renderAt('/platform/users?trial=ENDING_SOON');

    expect(await screen.findByText('Dùng thử · còn 2 ngày')).toBeInTheDocument();
    expect(screen.getByText('Hết hạn trong 2 ngày').nextElementSibling).toHaveTextContent('1');
    expect(screen.getByRole('button', { name: 'Sắp hết hạn' })).toHaveAttribute('aria-pressed', 'true');
    expect(service.getUsers).toHaveBeenCalledWith(expect.objectContaining({ trial: 'ENDING_SOON' }));
  });

  it('PA-09 saves draft prices without touching the price in use', async () => {
    service.getCommerce.mockResolvedValue({
      courses: [course('A1-F', 1), course('A1-I', 2)].map((c) => ({ ...c, draftPricePerSeat: c.pricePerSeat, draftSalesStatus: 'OPEN' })),
      seatsPurchased: 3, seatsGranted: 0, revenue: 1197000,
      orders: { items: [], pageIndex: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
    });
    catalog.updatePrices.mockResolvedValue(versionDetail(4));
    renderAt('/platform/commerce');

    const input = await screen.findByRole('spinbutton', { name: 'Giá bản nháp của A1-I' });
    expect(screen.queryByRole('spinbutton', { name: 'Giá bản nháp của A1-F' })).not.toBeInTheDocument();
    const save = screen.getByRole('button', { name: 'Lưu giá vào bản nháp v4' });
    expect(save).toBeDisabled();
    fireEvent.change(input, { target: { value: '520000' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Trạng thái bán của A1-I' }), { target: { value: 'PAUSED' } });
    fireEvent.click(save);

    await waitFor(() => expect(catalog.updatePrices).toHaveBeenCalledWith(4, [{ courseId: 'c-A1-I', pricePerSeat: 520000, salesStatus: 'PAUSED' }]));
  });

  it('SHR-01 is the Platform Admin profile, opened from the header', async () => {
    service.getAuditLogs.mockResolvedValue({ items: [], pageIndex: 1, pageSize: 1, totalItems: 9, totalPages: 9 });
    renderAt('/platform/account');
    const name = useCurrentUser.getState().user!.fullName;

    expect(await screen.findByRole('heading', { level: 1, name })).toBeInTheDocument();
    expect(await screen.findByText('⚓ v3')).toBeInTheDocument();
    expect(screen.getByText('Khóa học chuẩn').previousElementSibling).toHaveTextContent('18');
    await waitFor(() => expect(screen.getByText('Mục nhật ký').previousElementSibling).toHaveTextContent('9'));
    expect(service.getAuditLogs).toHaveBeenCalledWith(expect.objectContaining({ pageSize: 1, scope: 'platform' }));
    expect(screen.getByRole('link', { name: `Hồ sơ của tôi: ${name}` })).toHaveAttribute('href', '/platform/account');
    expect(screen.getByRole('button', { name: 'Đăng xuất' })).toBeInTheDocument();
  });

  it('redirects the retired curriculum editor to the catalog versions', async () => {
    renderAt('/platform/curriculum/A1-F');

    expect(await screen.findByRole('heading', { level: 1, name: 'Mỗi lần thêm hoặc sửa khóa là một phiên bản.' })).toBeInTheDocument();
  });
});
