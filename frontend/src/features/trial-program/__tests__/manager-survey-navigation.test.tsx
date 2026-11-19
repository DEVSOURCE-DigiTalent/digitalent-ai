import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PulseEmployeeLayout } from '@/app/layouts/PulseEmployeeLayout';
import { TrialTestPage } from '../pages/TrialTestPage';
import { PULSE_PATHS } from '@/features/pulse-employee/lib/paths';

const scenario = vi.hoisted(() => ({ status: 'NOT_STARTED', canStart: false }));
vi.mock('@/hooks/use-current-user', () => ({
  useCurrentUser: (select: (state: { user: { roles: string[] } }) => unknown) => select({ user: { roles: ['MANAGER'] } }),
}));
vi.mock('@/hooks/use-trial-program', () => ({
  useIsEnterpriseTrial: () => true,
  useMyTrialAssessment: () => ({
    data: {
      status: scenario.status, canStart: scenario.canStart,
      testDeadline: '2020-01-01T00:00:00Z', closedMessage: 'Đã hết hạn khảo sát',
      choiceCount: 90, organizationName: 'Doanh nghiệp', domains: [], levels: [], reportPublished: true,
    },
    isLoading: false, isFetching: false, refetch: vi.fn(),
  }),
}));
vi.mock('@/hooks/use-pulse', () => ({ usePulseOverview: () => ({ data: { hasPosition: false, hasTargets: false, courses: [] } }) }));
vi.mock('@/hooks/use-enterprise-theme', () => ({ useEnterpriseTheme: vi.fn() }));
vi.mock('@/components/guards/AuthGuard', () => ({ AuthGuard: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/components/guards/RequireWorkspace', () => ({ RequireWorkspace: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/components/guards/RequireOnboarded', () => ({ RequireOnboarded: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/components/layout/MainLayout', () => ({ MainLayout: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/features/pulse-employee/components/PulseHeader', () => ({ PulseHeader: () => null }));
vi.mock('@/features/pulse-employee/components/PulseSidebar', () => ({ PulseSidebar: () => null }));
vi.mock('@/features/assistant/components/AssistantWidget', () => ({ AssistantWidget: () => null }));
vi.mock('@/features/onboarding-tutorial', () => ({ RoleTutorialContainer: () => null }));
vi.mock('../components/TrialExam', () => ({ TrialExam: () => null }));

afterEach(cleanup);

describe('manager survey return navigation', () => {
  it.each(['NOT_STARTED', 'SUBMITTED', 'REVIEWED'])('returns to learning without a redirect loop from %s', (status) => {
    scenario.status = status;
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(
      <MemoryRouter initialEntries={[PULSE_PATHS.trialTest]}>
        <Routes>
          <Route element={<PulseEmployeeLayout />}>
            <Route path={PULSE_PATHS.trialTest} element={<TrialTestPage />} />
            <Route path={PULSE_PATHS.path} element={<h1>Lộ trình học tập</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    const back = screen.getByRole('link', { name: 'Về học tập của tôi' });
    expect(back).toHaveAttribute('href', PULSE_PATHS.path);
    if (status === 'NOT_STARTED') {
      expect(screen.getByText('Đã hết hạn khảo sát')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Vào phòng thi/ })).not.toBeInTheDocument();
    }
    fireEvent.click(back);
    expect(screen.getByRole('heading', { name: 'Lộ trình học tập' })).toBeInTheDocument();
    scroll.mockRestore();
  });
});
