import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PulseEmployeeLayout } from '@/app/layouts/PulseEmployeeLayout';
import { PULSE_PATHS } from '@/features/pulse-employee/lib/paths';

const session = vi.hoisted(() => ({ purchased: false }));
vi.mock('@/hooks/use-current-user', () => ({
  useCurrentUser: (select: (state: unknown) => unknown) => select({
    user: { roles: ['EMPLOYEE'], enterpriseTrialStatus: 'trial_active', enterpriseTrialPurchased: session.purchased },
  }),
}));
vi.mock('@/hooks/use-trial-program', () => ({
  useIsEnterpriseTrial: () => true,
  // The owner never started the survey round. The data stays in the query cache even when this caller disables the
  // query (the header may have loaded it), as with TanStack Query.
  useMyTrialAssessment: () => ({
    data: { status: 'NOT_STARTED', canStart: false, testDeadline: null, reportPublished: false },
    isLoading: false,
  }),
}));
vi.mock('@/hooks/use-pulse', () => ({ usePulseOverview: () => ({ data: undefined }) }));
vi.mock('@/hooks/use-enterprise-theme', () => ({ useEnterpriseTheme: vi.fn() }));
vi.mock('@/components/guards/AuthGuard', () => ({ AuthGuard: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/components/guards/RequireWorkspace', () => ({ RequireWorkspace: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/components/guards/RequireOnboarded', () => ({ RequireOnboarded: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/components/layout/MainLayout', () => ({ MainLayout: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/features/pulse-employee/components/PulseHeader', () => ({ PulseHeader: () => null }));
vi.mock('@/features/pulse-employee/components/PulseSidebar', () => ({ PulseSidebar: () => null }));
vi.mock('@/features/assistant/components/AssistantWidget', () => ({ AssistantWidget: () => null }));
vi.mock('@/features/onboarding-tutorial', () => ({ RoleTutorialContainer: () => null }));

afterEach(cleanup);

function openRoadmap() {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  render(
    <MemoryRouter initialEntries={[PULSE_PATHS.path]}>
      <Routes>
        <Route element={<PulseEmployeeLayout />}>
          <Route path={PULSE_PATHS.trialTest} element={<h1>Khảo sát</h1>} />
          <Route path={PULSE_PATHS.path} element={<h1>Lộ trình học tập</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('employee of a trial company', () => {
  it('waits on the survey page while the company is in its trial', () => {
    session.purchased = false;
    openRoadmap();
    expect(screen.getByRole('heading', { name: 'Khảo sát' })).toBeInTheDocument();
  });

  it('learns as in any company once the company bought a course (the survey is over)', () => {
    session.purchased = true;
    openRoadmap();
    expect(screen.getByRole('heading', { name: 'Lộ trình học tập' })).toBeInTheDocument();
  });
});
