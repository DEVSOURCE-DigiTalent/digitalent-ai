import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
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
  type PulseCourseSummary,
  type PulseDomain,
  type PulseFinal,
  type PulseOverview,
  type PulsePreAssessment,
} from '@/services/pulse.service';
import { PulseFinalPage } from '../pages/PulseFinalPage';
import { PulsePreAssessmentPage } from '../pages/PulsePreAssessmentPage';
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

const reviewer = { name: 'Trần Quản Lý', role: 'Quản lý phòng Operations' };

const domain = (overrides: Partial<PulseDomain> = {}): PulseDomain => ({
  categoryId: 'cat-1',
  number: 1,
  code: 'TT02_D1',
  name: 'Khai thác dữ liệu và thông tin',
  target: 3,
  ceiling: 3,
  pathTop: 3,
  verified: 0,
  source: 'NONE',
  status: 'GAP',
  gap: 3,
  competencies: [{ code: '1.1', name: 'Tìm kiếm dữ liệu', requiredLevel: 3, core: false }],
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
  zone: 'PATH',
  inPath: true,
  access: 'FREE_FULL',
  canWork: true,
  slotStatus: 'IN_PROGRESS',
  finalStatus: 'LEARNING',
  preStatus: 'NOT_YET',
  preAssessment: null,
  canStartPreAssessment: false,
  canStartFinal: false,
  approved: false,
  approvedVia: null,
  approvedAt: null,
  enrollmentId: 'enr-1',
  enrollmentStatus: 'IN_PROGRESS',
  moduleCount: 3,
  modulesPassed: 1,
  progressPercent: 40,
  finalAttempts: 0,
  modules: [],
  ...overrides,
});

const stats: PulseOverview['stats'] = {
  gapCount: 1,
  pendingCount: 0,
  targetDomainCount: 1,
  metCount: 0,
  requiredCompetencies: 1,
  pathCourses: 3,
  approvedPathCourses: 0,
  optionalCourses: 0,
  aboveCeilingCourses: 0,
  learningCourses: 1,
  preAssessmentsOpen: 0,
  assignedCourses: 1,
  approvedCourses: 0,
  inReview: 0,
};

const overview = (overrides: Partial<PulseOverview> = {}): PulseOverview => ({
  person,
  reviewer,
  hasPosition: true,
  hasTargets: true,
  domains: [domain()],
  courses: [course()],
  nextCourse: course(),
  nextSteps: [course()],
  latestOutcome: null,
  stats,
  ...overrides,
});

const criteria = [
  { number: '01', title: 'Nguồn có thể truy vết', description: 'Nêu nguồn dữ liệu.' },
  { number: '02', title: 'Hành động có thể kiểm tra', description: 'Trình bày cách làm.' },
  { number: '03', title: 'Kết luận có căn cứ', description: 'Kết luận và bước tiếp theo.' },
];

const final = (overrides: Partial<PulseFinal> = {}): PulseFinal => ({
  course: course({ finalStatus: 'READY', slotStatus: 'FINAL_READY', modulesPassed: 3, progressPercent: 100, canStartFinal: true }),
  domain: domain(),
  positionName: 'Kế toán',
  reviewer,
  criteria,
  status: 'READY',
  canSubmit: true,
  closedMessage: null,
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

const preAssessment = (overrides: Partial<PulsePreAssessment> = {}): PulsePreAssessment => ({
  course: course({ slotStatus: 'PRE_ASSESSMENT', preStatus: 'REQUIRED', canStartPreAssessment: true, enrollmentId: null, progressPercent: 0 }),
  domain: domain(),
  positionName: 'Kế toán',
  reviewer,
  criteria,
  status: 'REQUIRED',
  canStart: true,
  closedMessage: null,
  submission: null,
  ...overrides,
});

function renderAt(path: string, element: ReactNode, extraRoutes: ReactNode = null) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/enterprise/me" element={element} />
          <Route path="/enterprise/me/courses/:courseId" element={element} />
          <Route path="/enterprise/me/courses/:courseId/pre-assessment" element={element} />
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
  it('serves every employee screen under /enterprise/me for employees and managers, without the old baseline', () => {
    expect(EMPLOYEE_SCREENS.map((s) => s.id)).toEqual(['EM-01', 'EM-02', 'EM-03', 'EM-05', 'EM-06', 'EM-07', 'EM-12', 'EM-08', 'EM-09', 'EM-10', 'EM-11']);
    for (const screenDef of EMPLOYEE_SCREENS) {
      expect(screenDef.path.startsWith(PULSE_PATHS.today)).toBe(true);
      expect(screenDef.roles).toEqual(expect.arrayContaining([ROLES.EMPLOYEE, ROLES.MANAGER]));
    }
  });

  it('marks Thực hành active on both exam pages and Lộ trình on the course itself', () => {
    for (const path of [PULSE_PATHS.final('course-1'), PULSE_PATHS.preAssessment('course-1')]) {
      const view = renderAt(path, <PulseHeader />);
      expect(screen.getByRole('link', { name: 'Thực hành' }).className).toContain('active');
      expect(screen.getByRole('link', { name: 'Lộ trình' }).className).not.toContain('active');
      view.unmount();
    }

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

    expect((await screen.findAllByRole('link', { name: 'Học tiếp' })).length).toBeGreaterThan(0);
    expect(sidebarFor({ id: 'm', email: 'm@x.test', fullName: 'M', roles: [ROLES.MANAGER], permissions: [], enterpriseTrialStatus: null })).toBe(MANAGER_SIDEBAR);
  });
});

describe('PulseTodayPage', () => {
  const ladder = () => [
    course({
      courseId: 'c-f', code: 'A1-F', tier: 1, slotStatus: 'COMPLETED', finalStatus: 'APPROVED', preStatus: 'PASSED',
      approved: true, approvedVia: 'PRE_ASSESSMENT', approvedAt: '2026-10-10T08:00:00Z', progressPercent: 0,
    }),
    course({ courseId: 'c-i', code: 'A1-I', title: 'Đánh giá độ tin cậy của nguồn dữ liệu', tier: 2, slotStatus: 'IN_PROGRESS', progressPercent: 40 }),
    course({ courseId: 'c-a', code: 'A1-A', title: 'Quản trị dữ liệu nâng cao', tier: 3, zone: 'ABOVE_CEILING', slotStatus: 'ABOVE_CEILING', finalStatus: 'NOT_STARTED', preStatus: 'LOCKED', enrollmentId: null, progressPercent: 0 }),
  ];

  it('shows the role, the reviewer and the roadmap as course names and levels only', async () => {
    const courses = ladder();
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(overview({
      domains: [domain({ ceiling: 2, pathTop: 2, verified: 1 })],
      courses,
      nextSteps: [courses[1]!],
      stats: { ...stats, pathCourses: 2, approvedPathCourses: 1, aboveCeilingCourses: 1 },
    })));

    renderAt(PULSE_PATHS.today, <TrialAwarePulseTodayPage />);

    const roleCard = await screen.findByRole('complementary', { name: 'Vị trí và người đánh giá' });
    expect(within(roleCard).getByText('Kế toán')).toBeTruthy();
    expect(within(roleCard).getByText('Trần Quản Lý')).toBeTruthy();

    // Bảng lộ trình: tên khóa + cấp độ; đỉnh lộ trình bị trần phòng ban giới hạn, khóa vượt trần viền đứt.
    const plan = screen.getByRole('table');
    expect(within(plan).getByText('A1-F')).toBeTruthy();
    expect(within(plan).getByText('A1-I')).toBeTruthy();
    expect(within(plan).getByText('Trần phòng ban')).toBeTruthy();
    expect(within(plan).getByText('A1-A').closest('.pu-plan-course')?.className).toContain('beyond');
    expect(within(plan).queryByText('Đã đạt')).toBeNull();
    expect(within(plan).queryByText('Đang học')).toBeNull();
    expect(within(plan).queryByText(/%/)).toBeNull();

    // Trạng thái, % đã học và đạt / chưa đạt nằm ở danh sách khóa của lĩnh vực.
    expect(screen.getByText('Đã đạt')).toBeTruthy();
    expect(screen.getAllByText('Đang học').length).toBeGreaterThan(0);
    expect(screen.getByText('40% đã học')).toBeTruthy();
    expect(screen.getAllByText('Ngoài trần')).toHaveLength(2);
    expect(screen.getByText(/Được công nhận qua bài đánh giá trước khi học/)).toBeTruthy();
  });

  it('asks a new employee to take the pre-assessment of each course first', async () => {
    const fresh = course({
      slotStatus: 'PRE_ASSESSMENT', finalStatus: 'NOT_STARTED', preStatus: 'REQUIRED', canStartPreAssessment: true,
      enrollmentId: null, enrollmentStatus: null, modulesPassed: 0, progressPercent: 0,
    });
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(overview({
      courses: [fresh], nextSteps: [fresh], stats: { ...stats, preAssessmentsOpen: 1, learningCourses: 0 },
    })));

    renderAt(PULSE_PATHS.today, <TrialAwarePulseTodayPage />);

    expect(await screen.findByText('Bắt đầu bằng bài đánh giá')).toBeTruthy();
    expect(screen.getByText('Bạn cần làm bài đánh giá năng lực trước khi học khóa này.')).toBeTruthy();
    const links = screen.getAllByRole('link', { name: 'Đánh giá trước khi học' });
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => expect(link.getAttribute('href')).toBe(PULSE_PATHS.preAssessment('course-1')));
    expect(screen.queryByText(/% đã học/)).toBeNull();
  });

  it('expands and collapses a domain to show its courses', async () => {
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(overview()));

    renderAt(PULSE_PATHS.today, <TrialAwarePulseTodayPage />);

    const toggle = await screen.findByRole('button', { name: /A1 · Khai thác dữ liệu và thông tin/ });
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('40% đã học')).toBeTruthy();

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('40% đã học')).toBeNull();
  });

  it('explains a missing position instead of an empty path', async () => {
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(overview({ hasPosition: false, hasTargets: false, domains: [], courses: [], nextCourse: null, nextSteps: [] })));

    renderAt(PULSE_PATHS.today, <TrialAwarePulseTodayPage />);

    expect(await screen.findByText('Bạn chưa được gán vị trí công việc')).toBeTruthy();
  });
});

describe('PulsePreAssessmentPage', () => {
  it('opens the proctored check: screen, camera and microphone before the test starts', async () => {
    vi.spyOn(pulseService, 'getPreAssessment').mockResolvedValue(ok(preAssessment()));

    renderAt(PULSE_PATHS.preAssessment('course-1'), <PulsePreAssessmentPage />);

    expect(await screen.findByText('Bật đủ ba thiết bị để bắt đầu.')).toBeTruthy();
    expect(screen.getByText('Chia sẻ toàn bộ màn hình')).toBeTruthy();
    // jsdom không có getDisplayMedia / MediaRecorder: trang báo trình duyệt không hỗ trợ và không cho bắt đầu.
    expect(screen.getByRole('alert').textContent).toMatch(/không hỗ trợ ghi màn hình/);
    expect((screen.getByRole('button', { name: /Bắt đầu làm bài/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows the waiting state once submitted', async () => {
    vi.spyOn(pulseService, 'getPreAssessment').mockResolvedValue(ok(preAssessment({
      status: 'PENDING',
      canStart: false,
      submission: { preAssessmentId: 'pa-1', evidenceText: 'Đối chiếu 120 hóa đơn với sổ cái tháng 9.', submittedAt: '2026-10-15T08:00:00Z' },
    })));

    renderAt(PULSE_PATHS.preAssessment('course-1'), <PulsePreAssessmentPage />);

    expect(await screen.findByText('Bài của bạn đang chờ Trần Quản Lý chấm.')).toBeTruthy();
    expect(screen.getByText('Đối chiếu 120 hóa đơn với sổ cái tháng 9.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Bắt đầu làm bài/ })).toBeNull();
  });

  it('sends the employee to learn the course after a NOT_YET decision', async () => {
    vi.spyOn(pulseService, 'getPreAssessment').mockResolvedValue(ok(preAssessment({
      status: 'NOT_YET',
      canStart: false,
      submission: {
        preAssessmentId: 'pa-1', evidenceText: 'Bài làm', submittedAt: '2026-10-15T08:00:00Z',
        decision: 'NOT_YET', decisionReason: 'Chưa nêu nguồn dữ liệu.', reviewerName: 'Trần Quản Lý',
      },
    })));

    renderAt(PULSE_PATHS.preAssessment('course-1'), <PulsePreAssessmentPage />);

    expect(await screen.findByText('Chưa đạt — hãy học khóa này.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Bắt đầu học →' }).getAttribute('href')).toBe(PULSE_PATHS.course('course-1'));
    expect(screen.getByText(/Chưa nêu nguồn dữ liệu\./)).toBeTruthy();
  });
});

describe('PulseFinalPage', () => {
  it('runs the final as a proctored test when it is open', async () => {
    vi.spyOn(pulseService, 'getFinal').mockResolvedValue(ok(final()));

    renderAt(PULSE_PATHS.final('course-1'), <PulseFinalPage />);

    expect(await screen.findByText('Bật đủ ba thiết bị để bắt đầu.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Thoát' })).toBeTruthy();
    expect((screen.getByRole('button', { name: /Bắt đầu làm bài/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('points to the pre-assessment while the course still needs it', async () => {
    vi.spyOn(pulseService, 'getFinal').mockResolvedValue(ok(final({ canSubmit: false, status: 'NOT_STARTED', blockReason: 'PRE_ASSESSMENT_REQUIRED' })));

    renderAt(PULSE_PATHS.final('course-1'), <PulseFinalPage />);

    const link = await screen.findByRole('link', { name: 'Làm bài đánh giá trước khi học →' });
    expect(link.getAttribute('href')).toBe(PULSE_PATHS.preAssessment('course-1'));
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
    expect(screen.queryByRole('button', { name: /Bắt đầu làm bài/ })).toBeNull();
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
