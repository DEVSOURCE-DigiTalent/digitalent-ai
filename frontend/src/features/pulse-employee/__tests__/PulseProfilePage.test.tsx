import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import { platformService, type LoginHistoryEntry } from '@/services/platform.service';
import {
  pulseService,
  type PulseCourseSummary,
  type PulseDomain,
  type PulseOutcome,
  type PulseOverview,
} from '@/services/pulse.service';
import { PulseProfilePage } from '../pages/PulseProfilePage';
import { PULSE_PATHS } from '../lib/paths';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const ok = <T,>(data: T) => ({ data: { success: true, message: 'Success', data } }) as never;

const makeDomain = (overrides: Partial<PulseDomain> = {}): PulseDomain => ({
  categoryId: 'cat-1',
  number: 1,
  code: 'TT02_D1',
  name: 'Khai thác dữ liệu và thông tin',
  target: 2,
  ceiling: 2,
  pathTop: 2,
  verified: 2,
  source: 'COURSE',
  status: 'MET',
  gap: 0,
  competencies: [{ code: '1.1', name: 'Tìm kiếm dữ liệu', requiredLevel: 2, core: true }],
  ...overrides,
});

const makeCourse = (overrides: Partial<PulseCourseSummary> = {}): PulseCourseSummary => ({
  courseId: 'course-1',
  code: 'D1-L1',
  title: 'Khai thác dữ liệu cơ bản',
  categoryId: 'cat-1',
  domainNumber: 1,
  domainName: 'Khai thác dữ liệu và thông tin',
  tier: 1,
  zone: 'PATH',
  inPath: true,
  access: 'FREE_FULL',
  canWork: true,
  slotStatus: 'COMPLETED',
  finalStatus: 'APPROVED',
  preStatus: 'NOT_NEEDED',
  preAssessment: null,
  canStartPreAssessment: false,
  canStartFinal: false,
  approved: true,
  approvedVia: 'FINAL',
  approvedAt: '2026-10-01T00:00:00Z',
  enrollmentId: 'enr-1',
  enrollmentStatus: 'COMPLETED',
  moduleCount: 3,
  modulesPassed: 3,
  progressPercent: 100,
  finalAttempts: 1,
  modules: [],
  ...overrides,
});

const makeOverview = (overrides: Partial<PulseOverview> = {}): PulseOverview => ({
  person: {
    employeeId: 'cbb187bb-1234-5678-90ab-cdef01234567',
    fullName: 'Trần Minh Châu',
    workEmail: 'chau.tran@example.com',
    departmentName: 'Phòng Kế toán',
    positionName: 'Chuyên viên Tài chính',
    organizationName: 'Công ty ABC',
  },
  reviewer: { name: 'Lê Quản Lý', role: 'Trưởng phòng Kế toán' },
  hasPosition: true,
  hasTargets: true,
  domains: [makeDomain()],
  courses: [makeCourse()],
  nextCourse: null,
  nextSteps: [],
  latestOutcome: null,
  stats: {
    gapCount: 0,
    pendingCount: 0,
    targetDomainCount: 1,
    metCount: 1,
    requiredCompetencies: 1,
    pathCourses: 5,
    approvedPathCourses: 4,
    optionalCourses: 0,
    aboveCeilingCourses: 0,
    learningCourses: 0,
    preAssessmentsOpen: 0,
    assignedCourses: 5,
    approvedCourses: 4,
    inReview: 2,
  },
  ...overrides,
});

const makeOutcome = (overrides: Partial<PulseOutcome> = {}): PulseOutcome => ({
  id: 'out-1',
  kind: 'CERTIFICATE',
  title: 'Khai thác dữ liệu và thông tin (L2)',
  subtitle: 'Lĩnh vực 01 · Khai thác dữ liệu và thông tin',
  level: 2,
  issuedAt: '2026-10-05T08:00:00Z',
  source: 'COURSE',
  reference: 'CERT-2026-001',
  reviewerName: 'Lê Quản Lý',
  reviewNote: null,
  holderName: 'Trần Minh Châu',
  organizationName: 'Công ty ABC',
  courseId: 'course-1',
  ...overrides,
});

function signIn(overrides: Record<string, unknown> = {}) {
  useCurrentUser.setState({
    user: {
      id: 'user-1',
      email: 'chau.tran@example.com',
      fullName: 'Trần Minh Châu',
      roles: [ROLES.EMPLOYEE],
      permissions: [],
      workspace: 'enterprise',
      ...overrides,
    },
    isAuthenticated: true,
  });
}

function renderProfile() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[PULSE_PATHS.profile]}>
        <Routes>
          <Route path={PULSE_PATHS.profile} element={<PulseProfilePage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  signIn();
  vi.spyOn(platformService, 'getLoginHistory').mockResolvedValue(ok<LoginHistoryEntry[]>([]));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PulseProfilePage', () => {
  it('syncs KPI counts and renders MET, ceiling-capped MET, GAP, OUTSIDE_PATH, and highest outcome link accurately', async () => {
    const overviewData = makeOverview({
      domains: [
        makeDomain({
          categoryId: 'cat-1',
          number: 1,
          code: 'TT02_D1',
          name: 'Khai thác dữ liệu và thông tin',
          target: 2,
          ceiling: 2,
          pathTop: 2,
          verified: 2,
          status: 'MET',
          gap: 0,
        }),
        makeDomain({
          categoryId: 'cat-2',
          number: 2,
          code: 'TT02_D2',
          name: 'Giao tiếp và hợp tác trong môi trường số',
          target: 3,
          ceiling: 2,
          pathTop: 2,
          verified: 2,
          status: 'MET',
          gap: 0,
        }),
        makeDomain({
          categoryId: 'cat-3',
          number: 3,
          code: 'TT02_D3',
          name: 'Sáng tạo nội dung số',
          target: 3,
          ceiling: 3,
          pathTop: 3,
          verified: 1,
          status: 'GAP',
          gap: 2,
        }),
        makeDomain({
          categoryId: 'cat-4',
          number: 4,
          code: 'TT02_D4',
          name: 'An toàn và bảo mật thông tin số',
          target: 0,
          ceiling: 0,
          pathTop: 0,
          verified: 0,
          status: 'OUTSIDE_PATH',
          gap: 0,
        }),
      ],
      courses: [
        makeCourse({ courseId: 'course-1', categoryId: 'cat-1', tier: 1 }),
        makeCourse({ courseId: 'course-1b', categoryId: 'cat-1', tier: 2 }),
        makeCourse({ courseId: 'course-2', categoryId: 'cat-2', domainNumber: 2, tier: 2 }),
        makeCourse({
          courseId: 'course-3',
          categoryId: 'cat-3',
          domainNumber: 3,
          tier: 2,
          approved: false,
          slotStatus: 'IN_PROGRESS',
        }),
      ],
    });

    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(overviewData));
    vi.spyOn(pulseService, 'getOutcomes').mockResolvedValue(
      ok({
        items: [
          makeOutcome({ id: 'out-l1', courseId: 'course-1', level: 1, reference: 'REF-L1' }),
          makeOutcome({ id: 'out-l2', courseId: 'course-1b', level: 2, reference: 'REF-L2' }),
        ],
      }),
    );

    renderProfile();

    expect(await screen.findByRole('heading', { name: 'Trần Minh Châu' })).toBeInTheDocument();
    expect(screen.getByText('EMP-CBB187BB')).toBeInTheDocument();
    expect(screen.getByText('4/5 chuyên đề')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();

    const kpiRegion = screen.getByRole('region', { name: 'Chỉ số năng lực' });
    expect(within(kpiRegion).getByText('2 lĩnh vực')).toBeInTheDocument();
    expect(within(kpiRegion).getByText('1 lĩnh vực')).toBeInTheDocument();
    expect(within(kpiRegion).getByText('2 bài làm')).toBeInTheDocument();
    expect(within(kpiRegion).getByText('Quản lý đang đánh giá')).toBeInTheDocument();

    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');

    // Row 1: normal MET -> links to highest-level outcome (out-l2)
    expect(within(rows[1]).getByText('Lĩnh vực 01')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Đạt chuẩn')).toBeInTheDocument();
    const certLink = await within(rows[1]).findByRole('link', { name: /Xem chứng chỉ/i });
    expect(certLink).toHaveAttribute('href', PULSE_PATHS.outcome('out-l2'));

    // Row 2: ceiling-capped MET (target 3, ceiling 2, verified 2) -> must show Đạt chuẩn without false gap
    expect(within(rows[2]).getByText('Đạt chuẩn')).toBeInTheDocument();
    expect(within(rows[2]).queryByText(/Thiếu/i)).not.toBeInTheDocument();
    expect(within(rows[2]).getByText('Trần L2')).toHaveAttribute(
      'title',
      'Lộ trình hiện dừng ở L2 theo trần đào tạo phòng ban',
    );
    expect(within(rows[2]).getByRole('link', { name: 'Xem lộ trình' })).toHaveAttribute('href', PULSE_PATHS.path);

    // Row 3: GAP (verified 1, effective target 3 -> Thiếu 2 cấp)
    expect(within(rows[3]).getByText('Thiếu 2 cấp')).toBeInTheDocument();
    expect(within(rows[3]).getByRole('link', { name: /Bồi dưỡng ngay/i })).toHaveAttribute('href', PULSE_PATHS.path);

    // Row 4: OUTSIDE_PATH (target 0, ceiling 0) -> must NOT invent L1 or "Thiếu 1 cấp"
    expect(within(rows[4]).getByText('Không yêu cầu')).toBeInTheDocument();
    expect(within(rows[4]).getByText('Chưa mở')).toBeInTheDocument();
    expect(within(rows[4]).getByText('Ngoài lộ trình')).toBeInTheDocument();
    expect(within(rows[4]).getByText('Không bắt buộc')).toBeInTheDocument();
    expect(within(rows[4]).queryByText(/Thiếu/i)).not.toBeInTheDocument();
  });

  it('uses neutral person fallbacks and shows an empty domain matrix state cleanly', async () => {
    signIn({ fullName: 'Employee', email: '', organization: undefined });
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(
      ok(
        makeOverview({
          person: {
            employeeId: '',
            fullName: 'Employee',
            workEmail: null,
            departmentName: null,
            positionName: null,
            organizationName: null,
          },
          domains: [],
          courses: [],
          stats: {
            ...makeOverview().stats,
            pathCourses: 0,
            approvedPathCourses: 0,
            inReview: 0,
          },
        }),
      ),
    );
    vi.spyOn(pulseService, 'getOutcomes').mockResolvedValue(ok({ items: [] }));

    renderProfile();

    expect(await screen.findByRole('heading', { name: 'Nhân viên' })).toBeInTheDocument();
    expect(screen.getByText('Chưa phân bổ phòng ban')).toBeInTheDocument();
    expect(screen.getByText('Chưa gán vị trí công việc')).toBeInTheDocument();
    expect(screen.getByText('Chưa cập nhật')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sao chép mã định danh/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Chưa có dữ liệu lĩnh vực năng lực cho vị trí hiện tại\./)).toBeInTheDocument();
  });

  it('copies employee code safely and handles clipboard failures', async () => {
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(makeOverview()));
    vi.spyOn(pulseService, 'getOutcomes').mockResolvedValue(ok({ items: [] }));

    const writeText = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('Denied'));
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    renderProfile();

    const copyBtn = await screen.findByRole('button', { name: /Sao chép mã định danh/i });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('EMP-CBB187BB');
      expect(toast.success).toHaveBeenCalledWith('Đã sao chép mã định danh: EMP-CBB187BB');
    });
    expect(screen.getByRole('button', { name: /Đã sao chép mã/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Đã sao chép mã/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Không thể sao chép tự động. Vui lòng chọn và sao chép mã thủ công.',
      );
    });
  });

  it('enforces backend password rules, extracts Axios error messages, and renders login history fallbacks', async () => {
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(makeOverview()));
    vi.spyOn(pulseService, 'getOutcomes').mockResolvedValue(ok({ items: [] }));
    vi.spyOn(platformService, 'getLoginHistory').mockResolvedValue(
      ok<LoginHistoryEntry[]>([
        {
          id: 'lh-1',
          timestamp: '2026-10-08T10:30:00Z',
          ip: '10.0.1.5',
          browser: 'Chrome',
          os: 'Windows 11',
          status: 'SUCCESS',
        },
        {
          id: 'lh-2',
          timestamp: '2026-10-07T09:15:00Z',
          ip: '',
          browser: '',
          os: '',
          status: 'FAILED',
        },
      ]),
    );
    const changePasswordSpy = vi.spyOn(platformService, 'changePassword');

    renderProfile();
    fireEvent.click(await screen.findByRole('tab', { name: /Bảo mật & đổi mật khẩu/i }));

    expect(screen.getByRole('tabpanel', { name: /Bảo mật & đổi mật khẩu/i })).toBeInTheDocument();
    const browserLabel = await screen.findByText('Chrome');
    expect(browserLabel.closest('td')).toHaveTextContent('Chrome (Windows 11)');
    expect(screen.getByText('Thành công')).toBeInTheDocument();
    expect(screen.getByText('Thất bại')).toBeInTheDocument();
    expect(screen.getAllByText('Không rõ')).toHaveLength(2);

    const curInput = screen.getByLabelText(/^Mật khẩu hiện tại/i, { selector: 'input' });
    const newInput = screen.getByLabelText(/^Mật khẩu mới \*/i, { selector: 'input' });
    const confirmInput = screen.getByLabelText(/^Xác nhận mật khẩu mới/i, { selector: 'input' });
    const submitBtn = screen.getByRole('button', { name: /Lưu mật khẩu mới/i });

    // Rejects short password (< 12 chars)
    fireEvent.change(curInput, { target: { value: 'OldPass12345!' } });
    fireEvent.change(newInput, { target: { value: 'Short123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Short123!' } });
    expect(screen.getByText('Độ mạnh: Yếu')).toBeInTheDocument();
    fireEvent.submit(submitBtn.closest('form')!);
    expect(toast.error).toHaveBeenCalledWith('Mật khẩu mới phải từ 12 đến 128 ký tự.');
    expect(changePasswordSpy).not.toHaveBeenCalled();

    // Rejects reusing current password
    fireEvent.change(newInput, { target: { value: 'OldPass12345!' } });
    fireEvent.change(confirmInput, { target: { value: 'OldPass12345!' } });
    fireEvent.submit(submitBtn.closest('form')!);
    expect(toast.error).toHaveBeenCalledWith('Mật khẩu mới phải khác mật khẩu hiện tại.');
    expect(changePasswordSpy).not.toHaveBeenCalled();

    // Rejects mismatched confirmation
    fireEvent.change(newInput, { target: { value: 'StrongNewPass#2026' } });
    fireEvent.change(confirmInput, { target: { value: 'DifferentNewPass#2026' } });
    expect(screen.getByText('Độ mạnh: Mạnh')).toBeInTheDocument();
    fireEvent.submit(submitBtn.closest('form')!);
    expect(toast.error).toHaveBeenCalledWith('Mật khẩu xác nhận không khớp với mật khẩu mới.');
    expect(changePasswordSpy).not.toHaveBeenCalled();

    // Propagates backend validation message from AxiosError
    changePasswordSpy.mockRejectedValueOnce(
      new AxiosError('Request failed with status code 400', '400', undefined, undefined, {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as never,
        data: { success: false, message: 'Mật khẩu hiện tại không đúng.' },
      }),
    );
    fireEvent.change(confirmInput, { target: { value: 'StrongNewPass#2026' } });
    fireEvent.submit(submitBtn.closest('form')!);

    await waitFor(() => {
      expect(changePasswordSpy).toHaveBeenCalledWith({
        currentPassword: 'OldPass12345!',
        newPassword: 'StrongNewPass#2026',
      });
      expect(toast.error).toHaveBeenCalledWith('Mật khẩu hiện tại không đúng.');
    });

    // Clears fields on success
    changePasswordSpy.mockResolvedValueOnce(ok(null));
    fireEvent.submit(submitBtn.closest('form')!);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Đã đổi mật khẩu thành công.');
    });
    expect(curInput).toHaveValue('');
    expect(newInput).toHaveValue('');
    expect(confirmInput).toHaveValue('');
  });

  it('loads and saves preferences in localStorage and shows error toast when storage fails', async () => {
    localStorage.setItem(
      'digitalent_user_preferences',
      JSON.stringify({
        reviews: false,
        reminders: true,
        newCourses: false,
        language: 'en',
        focusMode: false,
      }),
    );

    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(makeOverview()));
    vi.spyOn(pulseService, 'getOutcomes').mockResolvedValue(ok({ items: [] }));

    renderProfile();
    fireEvent.click(await screen.findByRole('tab', { name: /Tùy chọn & thông báo/i }));

    expect(screen.getByRole('tabpanel', { name: /Tùy chọn & thông báo/i })).toBeInTheDocument();

    const reviewsCheckbox = document.getElementById('pref-reviews') as HTMLInputElement;
    const focusCheckbox = document.getElementById('pref-focus') as HTMLInputElement;
    const languageSelect = screen.getByLabelText('Ngôn ngữ hiển thị') as HTMLSelectElement;

    expect(reviewsCheckbox.checked).toBe(false);
    expect(focusCheckbox.checked).toBe(false);
    expect(languageSelect.value).toBe('en');

    fireEvent.click(reviewsCheckbox);
    fireEvent.change(languageSelect, { target: { value: 'vi' } });
    fireEvent.click(screen.getByRole('button', { name: /Lưu tùy chọn thông báo/i }));

    expect(toast.success).toHaveBeenCalledWith('Đã lưu tùy chọn cá nhân.');
    const saved = JSON.parse(localStorage.getItem('digitalent_user_preferences') ?? '{}');
    expect(saved).toMatchObject({ reviews: true, language: 'vi', focusMode: false });

    // Simulate QuotaExceededError / storage failure
    vi.mocked(toast.success).mockClear();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('QuotaExceededError');
    });

    fireEvent.click(screen.getByRole('button', { name: /Lưu cấu hình trải nghiệm/i }));
    expect(toast.error).toHaveBeenCalledWith(
      'Không thể lưu tùy chọn trên trình duyệt này. Vui lòng kiểm tra quyền lưu trữ.',
    );
    expect(toast.success).not.toHaveBeenCalled();
  });
});
