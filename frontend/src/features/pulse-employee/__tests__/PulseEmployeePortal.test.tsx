import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import { MANAGER_SIDEBAR, sidebarFor } from '@/lib/sidebars';
import { EMPLOYEE_SCREENS } from '@/lib/screens/enterprise/employee';
import { PulseTodayPage } from '../pages/PulseTodayPage';
import { PulsePathPage } from '../pages/PulsePathPage';
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
import { PulseSidebar } from '../components/PulseSidebar';
import { trialProgramService } from '@/services/trial-program.service';
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
  requiredByDepartment: false,
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
  choiceCount: 10,
  choicePassMark: 7,
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
  choiceCount: 10,
  choicePassMark: 7,
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

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('Pulse employee routes', () => {
  it('serves every employee screen under /enterprise/me for employees and managers, without the old baseline', () => {
    expect(EMPLOYEE_SCREENS.map((s) => s.id)).toEqual(['EM-01', 'EM-02', 'EM-03', 'EM-05', 'EM-06', 'EM-07', 'EM-12', 'EM-15', 'EM-T1', 'EM-T2', 'EM-08', 'EM-09', 'EM-10', 'EM-11', 'EM-13', 'EM-14']);
    for (const screenDef of EMPLOYEE_SCREENS) {
      expect(screenDef.path.startsWith(PULSE_PATHS.today)).toBe(true);
      expect(screenDef.roles).toEqual(expect.arrayContaining([ROLES.EMPLOYEE, ROLES.MANAGER]));
    }
  });

  it('marks Đánh giá active on both exam pages and Lộ trình on the course itself', () => {
    for (const path of [PULSE_PATHS.final('course-1'), PULSE_PATHS.preAssessment('course-1')]) {
      const view = renderAt(path, <PulseHeader />);
      expect(screen.getByRole('link', { name: 'Đánh giá' }).className).toContain('active');
      expect(screen.getByRole('link', { name: 'Lộ trình' }).className).not.toContain('active');
      view.unmount();
    }

    renderAt(PULSE_PATHS.course('course-1'), <PulseHeader />);
    expect(screen.getByRole('link', { name: 'Lộ trình' }).className).toContain('active');
    expect(screen.getByRole('link', { name: 'Đánh giá' }).className).not.toContain('active');
  });

  it('gives a manager the shared roadmap and a way back to the team workspace', async () => {
    signIn({ roles: [ROLES.MANAGER] });
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(overview()));

    renderAt(PULSE_PATHS.path, null, (
      <Route path={PULSE_PATHS.path} element={<><PulseHeader /><PulseSidebar manager /><PulsePathPage /></>} />
    ));

    fireEvent.click(await screen.findByRole('tab', { name: 'Bảng Ma trận Cấp độ' }));
    expect(screen.getByRole('heading', { name: 'Bảng ma trận lộ trình năng lực số · Kế toán' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Về không gian quản lý' })).toHaveAttribute('href', '/enterprise/team');
    expect(screen.getByRole('link', { name: 'Hoạt động' })).toHaveAttribute('href', '/enterprise/notifications');
    const nav = screen.getByRole('navigation', { name: 'Điều hướng học tập' });
    expect(within(nav).getByRole('link', { name: 'Lộ trình năng lực' })).toHaveAttribute('href', PULSE_PATHS.path);
    expect(within(nav).queryByRole('link', { name: 'Góp ý' })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'Báo lỗi' })).not.toBeInTheDocument();
  });
});

describe('enterprise trial detection', () => {
  it('treats the null trial status of the real backend as no trial', async () => {
    signIn({ enterpriseTrialStatus: null });
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(overview()));

    renderAt(PULSE_PATHS.today, <PulseTodayPage />);

    expect((await screen.findAllByRole('link', { name: 'Học tiếp' })).length).toBeGreaterThan(0);
    expect(sidebarFor({ id: 'm', email: 'm@x.test', fullName: 'M', roles: [ROLES.MANAGER], permissions: [], enterpriseTrialStatus: null })).toBe(MANAGER_SIDEBAR);
  });
});

describe('enterprise trial learning', () => {
  // Doanh nghiệp dùng thử: chỉ khóa Cơ bản mở, cao hơn vượt trần (= 1).
  const trialOverview = () => overview({
    hasTargets: false,
    courses: [
      course({ courseId: 'f1', code: 'M1-F', slotStatus: 'COMPLETED', finalStatus: 'APPROVED', approved: true, approvedVia: 'FINAL', progressPercent: 100 }),
      course({ courseId: 'f2', code: 'M2-F', title: 'Giao tiếp số cơ bản nơi công sở', categoryId: 'cat-2', domainNumber: 2, slotStatus: 'TO_LEARN', progressPercent: 0 }),
      course({ courseId: 'i1', code: 'M1-I', title: 'Chiến lược tìm kiếm', tier: 2, zone: 'ABOVE_CEILING', slotStatus: 'ABOVE_CEILING', canWork: false }),
    ],
  });
  const routes = (
    <>
      <Route path={PULSE_PATHS.path} element={<PulsePathPage />} />
    </>
  );

  it('shows the owner the Basic courses only, with the buy button', async () => {
    signIn({ roles: [ROLES.OWNER, ROLES.EMPLOYEE], enterpriseTrialStatus: 'trial_active' });
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(trialOverview()));

    renderAt(PULSE_PATHS.path, null, routes);

    expect(await screen.findByRole('heading', { name: '2 khóa Cơ bản để trải nghiệm.' })).toBeInTheDocument();
    const list = screen.getByRole('list', { name: 'Khóa học thử' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(within(list).queryByText('Chiến lược tìm kiếm')).not.toBeInTheDocument();
    expect(within(list).getByRole('link', { name: /Bắt đầu học/ })).toHaveAttribute('href', PULSE_PATHS.course('f2'));
    expect(screen.getByRole('link', { name: /Mua khóa học/ })).toHaveAttribute('href', '/enterprise/courses?level=2');
  });

  it('sends trial employees from Hôm nay to the one learning page, without the buy button', async () => {
    signIn({ enterpriseTrialStatus: 'trial_active' });
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(trialOverview()));

    renderAt(PULSE_PATHS.today, <PulseTodayPage />, routes);

    expect(await screen.findByRole('heading', { name: /khóa Cơ bản để trải nghiệm/ })).toBeInTheDocument();
    expect(screen.getByText(/Trung cấp, Nâng cao mở khi doanh nghiệp mua khóa/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Mua khóa học/ })).not.toBeInTheDocument();
  });

  it('gives trial employees the Học thử / Kết quả test / Thực hành header', () => {
    signIn({ enterpriseTrialStatus: 'trial_active' });

    renderAt(PULSE_PATHS.today, <PulseHeader />);

    const nav = screen.getByRole('navigation', { name: 'Học tập của tôi' });
    expect(within(nav).getAllByRole('link').map((l) => l.textContent)).toEqual(['Học thử', 'Bài đánh giá', 'Thực hành']);
  });

  it('locks the Basic courses with a warning until the mentor publishes the result', async () => {
    signIn({ enterpriseTrialStatus: 'trial_active' });
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(trialOverview()));
    const mine = { organizationName: 'Demo', testDeadline: '2026-10-31T10:00:00Z', canStart: true, choiceCount: 18, domains: [], essays: [], reportPublished: false };
    const getMine = vi.spyOn(trialProgramService, 'getMine').mockResolvedValue(ok({ ...mine, status: 'NOT_STARTED' }));

    const view = renderAt(PULSE_PATHS.path, null, routes);

    expect(await screen.findByRole('status', { name: 'Làm bài đánh giá trước khi học' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Làm bài đánh giá/ })).toHaveAttribute('href', PULSE_PATHS.trialTest);
    const locked = screen.getByRole('list', { name: 'Khóa học thử (chưa mở)' });
    expect(within(locked).getAllByText('Chưa mở')).toHaveLength(2);
    expect(screen.queryByRole('link', { name: /Bắt đầu học/ })).not.toBeInTheDocument();
    view.unmount();

    getMine.mockResolvedValue(ok({ ...mine, status: 'SUBMITTED', submittedAt: '2026-10-29T03:00:00Z' }));
    renderAt(PULSE_PATHS.path, null, routes);
    expect(await screen.findByRole('status', { name: 'Đang chờ công bố kết quả' })).toBeInTheDocument();
  });
});

describe('PulsePathPage roadmap', () => {
  // Phòng Operations: Khai thác dữ liệu cần Trung cấp (đang ở Cơ bản), Giao tiếp cần Cơ bản (đã đạt).
  // Doanh nghiệp đã mua M1-A và M2-I (học vượt), chưa mua M2-A.
  const roadmapOverview = () => {
    const learning = course({ courseId: 'i1', code: 'M1-I', title: 'Chiến lược tìm kiếm', tier: 2, slotStatus: 'IN_PROGRESS' });
    return overview({
      domains: [
        domain({ pathTop: 2, requiredByDepartment: true, verified: 1, status: 'GAP', gap: 1 }),
        domain({ categoryId: 'cat-2', number: 2, code: 'TT02_D2', name: 'Giao tiếp và hợp tác', target: 2, pathTop: 1, requiredByDepartment: true, verified: 1, status: 'MET', gap: 0, competencies: [] }),
      ],
      courses: [
        course({ courseId: 'f1', code: 'M1-F', slotStatus: 'COMPLETED', finalStatus: 'APPROVED', approved: true, approvedVia: 'FINAL', progressPercent: 100 }),
        learning,
        course({ courseId: 'a1', code: 'M1-A', title: 'Quản trị dữ liệu nâng cao', tier: 3, zone: 'OPTIONAL', inPath: false, access: 'PURCHASED', slotStatus: 'AFTER_PRIOR_LEVEL', enrollmentId: null }),
        course({ courseId: 'f2', code: 'M2-F', title: 'Giao tiếp số cơ bản', categoryId: 'cat-2', domainNumber: 2, slotStatus: 'COMPLETED', approved: true, approvedVia: 'FINAL' }),
        course({ courseId: 'i2', code: 'M2-I', title: 'Hợp tác trực tuyến', categoryId: 'cat-2', domainNumber: 2, tier: 2, zone: 'OPTIONAL', inPath: false, access: 'PURCHASED', slotStatus: 'TO_LEARN', enrollmentId: null }),
        course({ courseId: 'x2', code: 'M2-A', title: 'Lãnh đạo cộng tác số', categoryId: 'cat-2', domainNumber: 2, tier: 3, zone: 'ABOVE_CEILING', inPath: false, access: 'PREVIEW', slotStatus: 'ABOVE_CEILING', canWork: false, enrollmentId: null }),
      ],
      nextCourse: learning,
      nextSteps: [learning],
    });
  };

  it('shows the department minimum, flags the unmet domain and opens every bought course above it', async () => {
    signIn({ enterpriseTrialStatus: null });
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(roadmapOverview()));

    renderAt(PULSE_PATHS.path, null, <Route path={PULSE_PATHS.path} element={<PulsePathPage />} />);

    const summary = await screen.findByRole('status', { name: 'Lĩnh vực chưa đạt mức tối thiểu' });
    expect(within(summary).getByText('Còn 1/2 lĩnh vực chưa đạt mức tối thiểu doanh nghiệp yêu cầu cho Phòng Operations')).toBeInTheDocument();
    expect(within(summary).getByRole('button', { name: /Khai thác dữ liệu và thông tin/ })).toBeInTheDocument();
    expect(screen.queryByText(/Mục tiêu:/)).not.toBeInTheDocument();

    const data = screen.getByRole('article', { name: /Lĩnh vực 01/ });
    expect(within(data).getByText(/Phòng Operations yêu cầu tối thiểu/)).toBeInTheDocument();
    expect(within(data).getByText('Chưa đạt · còn 1 khóa bắt buộc: Chiến lược tìm kiếm')).toBeInTheDocument();
    // Không hiện mã khóa / mã lĩnh vực (M1-I, M1…): nhân viên chỉ thấy tên khóa và cấp độ.
    expect(within(data).queryByText(/\bM1(-[FIA])?\b/)).not.toBeInTheDocument();
    expect(within(data).getAllByText(/^Khóa Trung cấp/).length).toBeGreaterThan(0);
    expect(within(data).getByText('Bắt buộc')).toBeInTheDocument();
    expect(within(data).getByText('Quản trị dữ liệu nâng cao')).toBeInTheDocument();
    expect(within(data).getByText('Mở khi đạt Trung cấp')).toBeInTheDocument();
    expect(within(data).getByText('Nâng cao', { selector: '.pu-req-open strong' })).toBeInTheDocument();
    expect(within(screen.getByRole('article', { name: /Lĩnh vực 02/ })).getByText('Trung cấp', { selector: '.pu-req-open strong' })).toBeInTheDocument();

    const communication = screen.getByRole('article', { name: /Lĩnh vực 02/ });
    expect(within(communication).getByText('Đạt mức yêu cầu')).toBeInTheDocument();
    expect(within(communication).getByRole('link', { name: /Học vượt/ })).toHaveAttribute('href', PULSE_PATHS.course('i2'));
    expect(within(communication).queryByText('Lãnh đạo cộng tác số')).not.toBeInTheDocument();
  });

  it('suggests learning beyond the requirement once every minimum is met', async () => {
    signIn({ enterpriseTrialStatus: null });
    const base = roadmapOverview();
    const beyond = base.courses.find((c) => c.code === 'M2-I')!;
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok({
      ...base,
      domains: base.domains.map((d) => ({ ...d, verified: d.pathTop, status: 'MET' as const, gap: 0 })),
      courses: base.courses.map((c) => (c.code === 'M1-I' ? { ...c, approved: true, slotStatus: 'COMPLETED' as const } : c)),
      nextCourse: beyond,
      nextSteps: [beyond],
    }));

    renderAt(PULSE_PATHS.path, null, <Route path={PULSE_PATHS.path} element={<PulsePathPage />} />);

    expect(await screen.findByText('Bạn đã đạt mọi mức tối thiểu doanh nghiệp yêu cầu cho Phòng Operations.')).toBeInTheDocument();
    expect(screen.getByText(/2 khóa doanh nghiệp đã mua ở cấp cao hơn luôn mở để bạn học vượt/)).toBeInTheDocument();
    expect(screen.getByText('Gợi ý học vượt')).toBeInTheDocument();
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

    renderAt(PULSE_PATHS.today, <PulseTodayPage />);

    const roleCard = await screen.findByRole('complementary', { name: 'Vị trí và người đánh giá' });
    expect(within(roleCard).getByText('Kế toán')).toBeTruthy();
    expect(within(roleCard).getByText('Trần Quản Lý')).toBeTruthy();

    // Bảng lộ trình: tên khóa + cấp độ; đỉnh lộ trình bị trần phòng ban giới hạn, khóa vượt trần không hiện.
    const plan = screen.getByRole('table');
    expect(within(plan).getByText('A1-F')).toBeTruthy();
    expect(within(plan).getByText('A1-I')).toBeTruthy();
    expect(within(plan).getByText('Giới hạn khóa')).toBeTruthy();
    expect(within(plan).getByText('Không có khóa trong lộ trình')).toBeTruthy();
    expect(within(plan).queryByText('Đã đạt')).toBeNull();
    expect(within(plan).queryByText('Đang học')).toBeNull();
    expect(within(plan).queryByText(/%/)).toBeNull();

    // Trạng thái, % đã học và đạt / chưa đạt nằm ở danh sách khóa của lĩnh vực.
    expect(screen.getByText('Đã đạt')).toBeTruthy();
    expect(screen.getAllByText('Đang học').length).toBeGreaterThan(0);
    expect(screen.getByText('40% đã học')).toBeTruthy();
    expect(screen.queryByText('A1-A')).toBeNull();
    expect(screen.queryByText('Ngoài trần')).toBeNull();
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

    renderAt(PULSE_PATHS.today, <PulseTodayPage />);

    expect(await screen.findByText('Bắt đầu bằng bài đánh giá đầu vào')).toBeTruthy();
    expect(screen.getByText('Thực hiện bài đánh giá trước khi học để được miễn học lý thuyết nếu đã đạt năng lực.')).toBeTruthy();
    const links = screen.getAllByRole('link', { name: 'Làm bài đánh giá đầu vào →' });
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => expect(link.getAttribute('href')).toBe(PULSE_PATHS.preAssessment('course-1')));
    expect(screen.queryByText(/% đã học/)).toBeNull();
  });

  it('expands and collapses a domain to show its courses', async () => {
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(overview()));

    renderAt(PULSE_PATHS.today, <PulseTodayPage />);

    const toggle = await screen.findByRole('button', { name: /A1 · Khai thác dữ liệu và thông tin/ });
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('40% đã học')).toBeTruthy();

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('40% đã học')).toBeNull();
  });

  it('explains a missing position instead of an empty path', async () => {
    vi.spyOn(pulseService, 'getOverview').mockResolvedValue(ok(overview({ hasPosition: false, hasTargets: false, domains: [], courses: [], nextCourse: null, nextSteps: [] })));

    renderAt(PULSE_PATHS.today, <PulseTodayPage />);

    expect(await screen.findByText('Bạn chưa được gán vị trí công việc')).toBeTruthy();
  });
});

describe('PulsePreAssessmentPage', () => {
  it('sends a required entry test to the auto-graded multiple-choice test instead of the proctored essay', async () => {
    vi.spyOn(pulseService, 'getPreAssessment').mockResolvedValue(ok(preAssessment()));

    renderAt(
      PULSE_PATHS.preAssessment('course-1'),
      <PulsePreAssessmentPage />,
      <Route path="/enterprise/me/courses/:courseId/skip-test" element={<p>Trang kiểm tra đầu vào</p>} />,
    );

    expect(await screen.findByText('Trang kiểm tra đầu vào')).toBeTruthy();
    expect(screen.queryByText('Bật đủ ba thiết bị để bắt đầu.')).toBeNull();
    expect(screen.queryByText('10 câu trắc nghiệm + tự luận')).toBeNull();
  });

  it('shows the waiting state once submitted', async () => {
    vi.spyOn(pulseService, 'getPreAssessment').mockResolvedValue(ok(preAssessment({
      status: 'PENDING',
      canStart: false,
      submission: { preAssessmentId: 'pa-1', evidenceText: 'Đối chiếu 120 hóa đơn với sổ cái tháng 9.', submittedAt: '2026-10-15T08:00:00Z' },
    })));

    renderAt(PULSE_PATHS.preAssessment('course-1'), <PulsePreAssessmentPage />);

    expect(await screen.findByText('Bài của bạn đang chờ đánh giá.')).toBeTruthy();
    expect(screen.getByText('Đối chiếu 120 hóa đơn với sổ cái tháng 9.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Bắt đầu làm bài/ })).toBeNull();
    expect(screen.getByText(/Đề gồm 10 câu trắc nghiệm \(đúng từ 7 câu\) và một bài tự luận/)).toBeTruthy();
    // Kết quả trắc nghiệm chỉ có sau khi người chấm quyết định.
    expect(screen.queryByText(/Trắc nghiệm: đúng/)).toBeNull();
  });

  it('sends the employee to learn the course after a NOT_YET decision', async () => {
    vi.spyOn(pulseService, 'getPreAssessment').mockResolvedValue(ok(preAssessment({
      status: 'NOT_YET',
      canStart: false,
      submission: {
        preAssessmentId: 'pa-1', evidenceText: 'Bài làm', submittedAt: '2026-10-15T08:00:00Z',
        decision: 'NOT_YET', decisionReason: 'Chưa nêu nguồn dữ liệu.', reviewerName: 'Trần Quản Lý',
        choice: { score: 6, total: 10, passMark: 7, passed: false },
      },
    })));

    renderAt(PULSE_PATHS.preAssessment('course-1'), <PulsePreAssessmentPage />);

    expect(await screen.findByText('Chưa đạt — hãy học khóa này.')).toBeTruthy();
    expect(screen.getByText('Trắc nghiệm: đúng 6/10 câu')).toBeTruthy();
    expect(screen.getByText('Chưa đạt · cần từ 7 câu')).toBeTruthy();
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

  it('points to the entry test while the course still needs it', async () => {
    vi.spyOn(pulseService, 'getFinal').mockResolvedValue(ok(final({ canSubmit: false, status: 'NOT_STARTED', blockReason: 'PRE_ASSESSMENT_REQUIRED' })));

    renderAt(PULSE_PATHS.final('course-1'), <PulseFinalPage />);

    const link = await screen.findByRole('link', { name: 'Làm bài kiểm tra đầu vào →' });
    expect(link.getAttribute('href')).toBe(PULSE_PATHS.skipTest('course-1'));
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
        choice: { score: 8, total: 10, passMark: 7, passed: true },
      }],
    })));

    renderAt(PULSE_PATHS.final('course-1'), <PulseFinalPage />);

    expect(await screen.findByText('Lần nộp đầu chưa đạt.')).toBeTruthy();
    expect(screen.getByText('Trắc nghiệm: đúng 8/10 câu')).toBeTruthy();
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

  it('displays weighted criteria and Gate badge on final view and blocks copied prompt during exam input', async () => {
    const weightedCriteria = [
      { number: '01', title: 'Nguồn & bối cảnh', description: 'Nêu nguồn thực tế.', weightPercent: 20, isRequired: false },
      { number: '02', title: 'Quy trình kiểm chứng', description: 'Kiểm tra lại được.', weightPercent: 20, isRequired: false },
      { number: '03', title: 'Kết luận & bàn giao', description: 'Nêu bước tiếp theo.', weightPercent: 20, isRequired: false },
      { number: '04', title: 'Truy xuất nguồn chéo', description: 'Đối chiếu ít nhất 2 nguồn.', weightPercent: 40, isRequired: true },
    ];
    vi.spyOn(pulseService, 'getFinal').mockResolvedValue(ok(final({
      status: 'PENDING',
      canSubmit: false,
      criteria: weightedCriteria,
    })));

    const view = renderAt(PULSE_PATHS.final('course-1'), <PulseFinalPage />);
    expect(await screen.findByText(/theo 4 tiêu chí dưới đây/)).toBeTruthy();
    expect(screen.getByText('40%')).toBeTruthy();
    expect(screen.getByText('Bắt buộc')).toBeTruthy();
    view.unmount();

    window.history.replaceState(null, '', '/enterprise/me/courses/course-1/final?stage=work');
    vi.spyOn(pulseService, 'getFinal').mockResolvedValue(ok(final({
      canSubmit: true,
      choiceCount: 0,
      criteria: weightedCriteria,
      assignment: {
        title: 'Phân tích dữ liệu',
        promptHtml: '<p>Mô tả một nhiệm vụ thực tế của vị trí Sales / CRM thuộc lĩnh vực khai thác dữ liệu.</p>',
        criteria: weightedCriteria.map((c) => c.title),
      },
    })));

    renderAt('/enterprise/me/courses/course-1/final?stage=work', <PulseFinalPage />);

    const textarea = await screen.findByLabelText('Ghi chú minh chứng');
    const submitBtn = screen.getByRole('button', { name: 'Nộp bài' }) as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);

    fireEvent.change(textarea, {
      target: {
        value: 'Mô tả một nhiệm vụ thực tế của vị trí Sales / CRM thuộc lĩnh vực khai thác dữ liệu và thông tin: nêu nguồn, hành động hoặc phép tính người khác kiểm tra lại được, kết luận và bước tiếp theo.',
      },
    });
    expect(
      screen.getByText('Nội dung đang lặp lại câu chữ đề bài. Hãy mô tả tình huống công việc thực tế và kết quả kiểm chứng.'),
    ).toBeInTheDocument();
    expect(submitBtn.disabled).toBe(true);

    fireEvent.change(textarea, {
      target: {
        value: 'Từ báo cáo doanh thu Q3 xuất trên HubSpot CRM và đối chiếu bảng công nợ ERP MISA, tôi dùng Pivot Table lọc ra 14 mã đơn trùng và gửi danh sách đã làm sạch cho kế toán đối soát chiều thứ Sáu.',
      },
    });
    expect(submitBtn.disabled).toBe(false);
  });
});
