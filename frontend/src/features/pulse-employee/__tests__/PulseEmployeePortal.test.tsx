import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import { MANAGER_SIDEBAR, sidebarFor } from '@/lib/sidebars';
import { EMPLOYEE_SCREENS } from '@/lib/screens/enterprise/employee';
import { TrialAwarePulseTodayPage } from '@/features/experience/enterprise-trial/TrialAwareDashboardPages';
import {
  pulseService,
  type PulseBaseline,
  type PulseCourseSummary,
  type PulseDomain,
  type PulseFinal,
  type PulseOverview,
} from '@/services/pulse.service';
import { PulseBaselinePage } from '../pages/PulseBaselinePage';
import { PulseFinalPage } from '../pages/PulseFinalPage';
import { PulseHeader } from '../components/PulseHeader';
import { PULSE_PATHS } from '../lib/paths';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/hooks/use-platform', () => ({ useNotifications: () => ({ data: [] }) }));

const ok = <T,>(data: T) => ({ data: { success: true, message: 'Success', data } }) as never;

const person = {
  employeeId: 'emp-1',
  fullName: 'Nguyễn An',
  departmentName: 'Operations',
  positionName: 'Kế toán',
  organizationName: 'DigiTalent Demo',
};

const domain = (overrides: Partial<PulseDomain> = {}): PulseDomain => ({
  categoryId: 'cat-1',
  number: 1,
  code: 'TT02_D1',
  name: 'Khai thác dữ liệu và thông tin',
  target: 3,
  baseline: 1,
  verified: 1,
  source: 'BASELINE',
  status: 'GAP',
  gap: 2,
  ...overrides,
});

const course = (overrides: Partial<PulseCourseSummary> = {}): PulseCourseSummary => ({
  courseId: 'course-1',
  code: 'A1-F',
  title: 'Tìm kiếm và lưu trữ thông tin cơ bản',
  categoryId: 'cat-1',
  domainNumber: 1,
  domainName: 'Khai thác dữ liệu và thông tin',
  tier: 1,
  inPath: true,
  access: 'FREE_FULL',
  canWork: true,
  slotStatus: 'IN_PROGRESS',
  finalStatus: 'LEARNING',
  enrollmentId: 'enr-1',
  enrollmentStatus: 'IN_PROGRESS',
  moduleCount: 3,
  modulesPassed: 1,
  finalAttempts: 0,
  ...overrides,
});

const overview = (overrides: Partial<PulseOverview> = {}): PulseOverview => ({
  person,
  hasPosition: true,
  hasTargets: true,
  assessed: true,
  assessedAt: '2026-10-01T08:00:00Z',
  domains: [domain()],
  courses: [course()],
  nextCourse: course(),
  latestOutcome: null,
  stats: { gapCount: 1, pendingCount: 0, targetDomainCount: 1, metCount: 0, assignedCourses: 1, approvedCourses: 0, inReview: 0 },
  ...overrides,
});

const criteria = [
  { number: '01', title: 'Nguồn có thể truy vết', description: 'Nêu nguồn dữ liệu.' },
  { number: '02', title: 'Hành động có thể kiểm tra', description: 'Trình bày cách làm.' },
  { number: '03', title: 'Kết luận có căn cứ', description: 'Kết luận và bước tiếp theo.' },
];

const final = (overrides: Partial<PulseFinal> = {}): PulseFinal => ({
  course: course({ finalStatus: 'READY', modulesPassed: 3 }),
  domain: domain(),
  positionName: 'Kế toán',
  criteria,
  status: 'READY',
  canSubmit: true,
  blockReason: null,
  modulesPassed: 3,
  moduleCount: 3,
  firstOpenModuleId: null,
  maxAttempts: 2,
  attempts: [],
  cooldownHours: 48,
  deadlineDays: 7,
  ...overrides,
});

function renderAt(path: string, element: ReactNode, extraRoutes: ReactNode = null) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/enterprise/me" element={element} />
          <Route path="/enterprise/me/baseline" element={element} />
          <Route path="/enterprise/me/courses/:courseId" element={element} />
          <Route path="/enterprise/me/courses/:courseId/final" element={element} />
          {extraRoutes}
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function signIn(overrides: Record<string, unknown> = {}) {
  useCurrentUser.setState({
    user: { id: 'user-1', email: 'employee@digitalent.ai', fullName: 'Nguyễn An', roles: [ROLES.EMPLOYEE], permissions: [], workspace: 'enterprise', ...overrides },
    isAuthenticated: true,
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
  signIn();
});

describe('Pulse employee routes', () => {
  it('serves every employee screen under /enterprise/me for employees and managers', () => {
    expect(EMPLOYEE_SCREENS.map((s) => s.id)).toEqual(['EM-01', 'EM-02', 'EM-03', 'EM-04', 'EM-05', 'EM-06', 'EM-07', 'EM-08', 'EM-09', 'EM-10', 'EM-11']);
    for (const screenDef of EMPLOYEE_SCREENS) {
      expect(screenDef.path.startsWith(PULSE_PATHS.today)).toBe(true);
      expect(screenDef.roles).toEqual(expect.arrayContaining([ROLES.EMPLOYEE, ROLES.MANAGER]));
    }
  });

  it('marks Thực hành active on a course final and Lộ trình on the course itself', () => {
    const view = renderAt(PULSE_PATHS.final('course-1'), <PulseHeader />);
    expect(screen.getByRole('link', { name: 'Thực hành' }).className).toContain('active');
    expect(screen.getByRole('link', { name: 'Lộ trình' }).className).not.toContain('active');
    view.unmount();

    renderAt(PULSE_PATHS.course('course-1'), <PulseHeader />);
    expect(screen.getByRole('link', { name: 'Lộ trình' }).className).toContain('active');
    expect(screen.getByRole('link', { name: 'Thực hành' }).className).not.toContain('active');
  });
});

describe('enterprise trial detection', () => {
  it('treats the null trial status of the real backend as no trial', async () => {
    signIn({ enterpriseTrialStatus: null });
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(overview()));

    renderAt(PULSE_PATHS.today, <TrialAwarePulseTodayPage />);

    expect(await screen.findByRole('link', { name: 'Tiếp tục khóa học →' })).toBeTruthy();
    expect(sidebarFor({ id: 'm', email: 'm@x.test', fullName: 'M', roles: [ROLES.MANAGER], permissions: [], enterpriseTrialStatus: null })).toBe(MANAGER_SIDEBAR);
  });
});

describe('PulseTodayPage', () => {
  it('sends an employee who has not taken the entry test to the baseline', async () => {
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(overview({ assessed: false, assessedAt: null, nextCourse: null })));

    renderAt(PULSE_PATHS.today, <TrialAwarePulseTodayPage />);

    const links = await screen.findAllByRole('link', { name: 'Làm bài đầu vào →' });
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => expect(link.getAttribute('href')).toBe(PULSE_PATHS.baseline));
  });

  it('continues the next course once the baseline is recorded', async () => {
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(overview()));

    renderAt(PULSE_PATHS.today, <TrialAwarePulseTodayPage />);

    const hero = await screen.findByRole('link', { name: 'Tiếp tục khóa học →' });
    expect(hero.getAttribute('href')).toBe(PULSE_PATHS.course('course-1'));
    expect(screen.getByText('Tìm kiếm và lưu trữ thông tin cơ bản')).toBeTruthy();
  });

  it('explains a missing position instead of an empty path', async () => {
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(overview({ hasPosition: false, hasTargets: false, domains: [], courses: [], nextCourse: null })));

    renderAt(PULSE_PATHS.today, <TrialAwarePulseTodayPage />);

    expect(await screen.findByText('Bạn chưa được gán vị trí công việc')).toBeTruthy();
  });
});

describe('PulseBaselinePage', () => {
  const baseline: PulseBaseline = {
    person,
    assessed: false,
    assessedAt: null,
    blockReason: null,
    domains: [
      {
        categoryId: 'cat-1',
        number: 1,
        name: 'Khai thác dữ liệu và thông tin',
        target: 2,
        baseline: null,
        questions: [
          { questionId: 'q1', level: 1, content: 'Trước khi dùng bảng dữ liệu, bạn kiểm tra điều gì?', options: [{ optionId: 'q1-a', content: 'Nguồn và độ cập nhật' }, { optionId: 'q1-b', content: 'Màu của bảng' }] },
          { questionId: 'q2', level: 2, content: 'Hai nguồn cho số liệu khác nhau. Bạn làm gì?', options: [{ optionId: 'q2-a', content: 'Chọn số lớn hơn' }, { optionId: 'q2-b', content: 'Đối chiếu định nghĩa' }] },
        ],
      },
    ],
  };

  it('submits once every question is answered, then opens the path', async () => {
    vi.spyOn(pulseService, 'getBaseline').mockResolvedValue(ok(baseline));
    const submit = vi.spyOn(pulseService, 'submitBaseline').mockResolvedValue(ok({ assessedAt: '2026-10-14T08:00:00Z', domains: baseline.domains }));

    renderAt(PULSE_PATHS.baseline, <PulseBaselinePage />, <Route path="/enterprise/me/path" element={<p>Trang lộ trình</p>} />);

    const button = await screen.findByRole('button', { name: 'Nộp bài và xem khoảng cách năng lực →' });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/Đã trả lời 0\/2 câu/)).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Nguồn và độ cập nhật'));
    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByLabelText('Đối chiếu định nghĩa'));
    expect((button as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(button);

    await waitFor(() => expect(submit).toHaveBeenCalledWith([
      { questionId: 'q1', optionId: 'q1-a' },
      { questionId: 'q2', optionId: 'q2-b' },
    ]));
    expect(await screen.findByText('Trang lộ trình')).toBeTruthy();
  });

  it('shows the recorded baseline instead of the form after the one attempt', async () => {
    vi.spyOn(pulseService, 'getBaseline').mockResolvedValue(ok({
      ...baseline,
      assessed: true,
      assessedAt: '2026-10-01T08:00:00Z',
      domains: [{ ...baseline.domains[0]!, baseline: 1 }],
    }));

    renderAt(PULSE_PATHS.baseline, <PulseBaselinePage />);

    expect(await screen.findByText('Đã ghi nhận mức khởi điểm.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Nộp bài/ })).toBeNull();
  });
});

describe('PulseFinalPage', () => {
  it('requires at least 30 characters of evidence before submitting', async () => {
    vi.spyOn(pulseService, 'getFinal').mockResolvedValue(ok(final()));
    const submit = vi.spyOn(pulseService, 'submitFinal').mockResolvedValue(ok({ submissionId: 's1', attemptNo: 1, submittedAt: '2026-10-14T08:00:00Z', status: 'PENDING' }));

    renderAt(PULSE_PATHS.final('course-1'), <PulseFinalPage />);

    const textarea = await screen.findByLabelText(/Ghi chú minh chứng/);
    const button = screen.getByRole('button', { name: 'Nộp bài cuối khóa →' });
    fireEvent.change(textarea, { target: { value: 'Quá ngắn' } });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('Cần ít nhất 30 ký tự (hiện có 8).')).toBeTruthy();

    const evidence = 'Nguồn: sổ cái tháng 9; đối chiếu 120 hóa đơn, lệch 2 khoản đã sửa.';
    fireEvent.change(textarea, { target: { value: `  ${evidence}  ` } });
    expect((button as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(button);

    await waitFor(() => expect(submit).toHaveBeenCalledWith('course-1', evidence));
  });

  it('shows the retry window after a first NOT_YET decision', async () => {
    const opensAt = new Date(Date.now() + 47 * 3_600_000).toISOString();
    const dueAt = new Date(Date.now() + 9 * 24 * 3_600_000).toISOString();
    vi.spyOn(pulseService, 'getFinal').mockResolvedValue(ok(final({
      status: 'RETRY_WAIT',
      canSubmit: false,
      attempts: [{
        submissionId: 's1', attemptNo: 1, evidenceText: 'Bản nộp đầu tiên của tôi', submittedAt: '2026-10-12T08:00:00Z',
        decision: 'NOT_YET', decisionReason: 'Cần nêu rõ phép tính kiểm tra được.', reviewerName: 'Trưởng phòng', reviewedAt: '2026-10-13T08:00:00Z',
        retryOpensAt: opensAt, retryDueAt: dueAt,
      }],
    })));

    renderAt(PULSE_PATHS.final('course-1'), <PulseFinalPage />);

    expect(await screen.findByText('Lần nộp đầu chưa đạt.')).toBeTruthy();
    expect(screen.getByText('còn 47 giờ')).toBeTruthy();
    expect(screen.getByText('còn 9 ngày')).toBeTruthy();
    expect(screen.getByText(/Cần nêu rõ phép tính kiểm tra được\./)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Nộp/ })).toBeNull();
  });

  it('shows the support flag and the manager’s support action after two NOT_YET decisions', async () => {
    vi.spyOn(pulseService, 'getFinal').mockResolvedValue(ok(final({
      status: 'FLAGGED',
      canSubmit: false,
      attempts: [
        { submissionId: 's1', attemptNo: 1, evidenceText: 'Lần một', submittedAt: '2026-10-01T08:00:00Z', decision: 'NOT_YET', decisionReason: 'Thiếu nguồn rõ ràng.' },
        { submissionId: 's2', attemptNo: 2, evidenceText: 'Lần hai', submittedAt: '2026-10-05T08:00:00Z', decision: 'NOT_YET', decisionReason: 'Vẫn thiếu kết luận.', supportAction: 'COACHING', supportNote: 'Kèm cặp 2 buổi' },
      ],
    })));

    renderAt(PULSE_PATHS.final('course-1'), <PulseFinalPage />);

    expect(await screen.findByText('Hai lần nộp chưa đạt tiêu chí.')).toBeTruthy();
    expect(screen.getByText('Quản lý sắp xếp kèm cặp: Kèm cặp 2 buổi')).toBeTruthy();
  });
});
