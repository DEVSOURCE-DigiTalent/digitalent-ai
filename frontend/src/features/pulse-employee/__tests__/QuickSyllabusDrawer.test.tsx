
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import { pulseService, type PulseCourseDetail, type PulseCourseSummary } from '@/services/pulse.service';
import { QuickSyllabusDrawer } from '../components/QuickSyllabusDrawer';
import { PULSE_PATHS } from '../lib/paths';

const ok = <T,>(data: T) => ({ data: { success: true, data } }) as never;
const course: PulseCourseSummary = {
  courseId: 'course-1', code: 'M2-F', title: 'Giao tiếp số cơ bản', categoryId: 'cat-2',
  domainNumber: 2, domainName: 'Giao tiếp', tier: 1, zone: 'PATH', inPath: true,
  access: 'FREE_FULL', canWork: true, slotStatus: 'IN_PROGRESS', finalStatus: 'LEARNING',
  preStatus: 'NOT_YET', canStartPreAssessment: false, canStartFinal: false, approved: false,
  enrollmentId: 'enrollment-1', moduleCount: 2, modulesPassed: 0, progressPercent: 0,
  finalAttempts: 0, modules: [{ title: 'Bài một', passed: false }, { title: 'Bài hai', passed: false }],
};

function detail(overrides: Partial<PulseCourseDetail> = {}): PulseCourseDetail {
  return {
    course, versionNo: 1, domain: {} as PulseCourseDetail['domain'], learningOutcomes: [],
    estimatedMinutes: 45, finalCriteria: [], nextAction: 'MODULE', nextModuleId: 'mod-1',
    modules: [
      { moduleId: 'mod-1', index: 0, title: 'Bài một', slideCount: 2, hasQuiz: true,
        quizQuestionCount: 3, viewed: false, passed: false, unlocked: true, viewable: true },
      { moduleId: 'mod-2', index: 1, title: 'Bài hai', slideCount: 2, hasQuiz: true,
        quizQuestionCount: 4, viewed: false, passed: false, unlocked: false, viewable: true },
    ],
    ...overrides,
  };
}

function renderDrawer(summary = course) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><MemoryRouter>
    <QuickSyllabusDrawer open course={summary} onClose={vi.fn()} />
  </MemoryRouter></QueryClientProvider>);
}

beforeEach(() => vi.restoreAllMocks());

describe.each([ROLES.EMPLOYEE, ROLES.MANAGER])('shared course outline for %s', (role) => {
  beforeEach(() => {
    useCurrentUser.setState({
      isAuthenticated: true,
      user: { id: 'learner', email: 'learner@test.local', fullName: 'Người học',
        roles: [role], permissions: [], workspace: 'enterprise' },
    });
  });

  it('uses API module access and quiz counts instead of linking to every lesson', async () => {
    vi.spyOn(pulseService, 'getCourse').mockResolvedValue(ok(detail()));
    renderDrawer();
    expect(await screen.findByRole('link', { name: 'Vào học →' }))
      .toHaveAttribute('href', PULSE_PATHS.module('course-1', 'mod-1'));
    expect(screen.queryByRole('link', { name: /Bài hai/ })).not.toBeInTheDocument();
    const second = screen.getByText('Bài hai').closest('.pu-drawer-mod-item')!;
    expect(within(second as HTMLElement).queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Quiz ôn tập 3 câu')).toBeInTheDocument();
    expect(screen.getByText('45 phút học')).toBeInTheDocument();
  });

  it('opens the next module and permits reviewing passed modules', async () => {
    const data = detail();
    data.modules[0] = { ...data.modules[0], passed: true, unlocked: false };
    data.modules[1] = { ...data.modules[1], unlocked: true };
    vi.spyOn(pulseService, 'getCourse').mockResolvedValue(ok(data));
    renderDrawer();
    expect(await screen.findByRole('link', { name: 'Ôn lại →' }))
      .toHaveAttribute('href', PULSE_PATHS.module('course-1', 'mod-1'));
    expect(screen.getByRole('link', { name: 'Vào học →' }))
      .toHaveAttribute('href', PULSE_PATHS.module('course-1', 'mod-2'));
  });

  it('uses fresh course status to offer the final assessment', async () => {
    vi.spyOn(pulseService, 'getCourse').mockResolvedValue(ok(detail({
      course: { ...course, slotStatus: 'FINAL_READY', canStartFinal: true },
      nextAction: 'FINAL',
    })));
    renderDrawer();
    const links = await screen.findAllByRole('link', { name: /Vào làm bài đánh giá cuối khóa/ });
    links.forEach((link) => expect(link).toHaveAttribute('href', PULSE_PATHS.final('course-1')));
    expect(screen.queryByRole('link', { name: 'Tiếp tục học chuyên đề →' })).not.toBeInTheDocument();
  });

  it('keeps all modules closed when the course is locked', async () => {
    vi.spyOn(pulseService, 'getCourse').mockResolvedValue(ok(detail({ nextAction: 'LOCKED' })));
    renderDrawer();
    expect(await screen.findByRole('button', { name: 'Mở ở giai đoạn sau' })).toBeDisabled();
    expect(screen.queryByRole('link', { name: 'Vào học →' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Tiếp tục học chuyên đề →' })).not.toBeInTheDocument();
  });
});
