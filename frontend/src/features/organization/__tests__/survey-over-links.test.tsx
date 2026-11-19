import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import type { OrganizationOverview } from '@/services/organization.service';
import type { SessionUser } from '@/types/session';
import { OwnerQuickOperations } from '../components/OwnerQuickOperations';
import { OwnerOverviewHero } from '../components/OwnerOverviewHero';
import { TrialProgramPage } from '@/features/trial-program/pages/TrialProgramPage';

vi.mock('@/hooks/use-trial-program', async (original) => ({
  ...(await original<typeof import('@/hooks/use-trial-program')>()),
  useTrialProgram: () => ({ data: undefined }),
}));

function signInOwner(user: Partial<SessionUser>) {
  useCurrentUser.setState({
    user: { id: 'owner', email: 'owner@trial.test', fullName: 'Owner', roles: [ROLES.OWNER], permissions: [], workspace: 'enterprise', ...user },
    isAuthenticated: true,
  });
}
afterEach(() => { cleanup(); useCurrentUser.setState({ user: null, isAuthenticated: false }); });

const org = { members: { active: 1, pending: 0 }, setupCompleted: false } as unknown as OrganizationOverview;

describe('once the trial organization bought a course, the survey is over', () => {
  it('quick operations drop the survey tile while it runs it is there', () => {
    signInOwner({ enterpriseTrialStatus: 'trial_active' });
    const { unmount } = render(<MemoryRouter><OwnerQuickOperations /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /Khảo sát năng lực số/ })).toHaveAttribute('href', '/enterprise/trial');
    unmount();

    signInOwner({ enterpriseTrialStatus: 'trial_active', enterpriseTrialPurchased: true });
    render(<MemoryRouter><OwnerQuickOperations /></MemoryRouter>);
    expect(screen.queryByRole('link', { name: /Khảo sát năng lực số/ })).toBeNull();
    expect(screen.getByRole('link', { name: /Khoảng cách năng lực/ })).toHaveAttribute('href', '/enterprise/skill-gap');
  });

  it('the overview hero leads to the gaps instead of the survey, once', () => {
    signInOwner({ enterpriseTrialStatus: 'trial_active', enterpriseTrialPurchased: true });
    render(<MemoryRouter><OwnerOverviewHero org={org} /></MemoryRouter>);
    expect(screen.queryByRole('link', { name: /khảo sát/i })).toBeNull();
    expect(screen.getAllByRole('link', { name: 'Xem khoảng trống năng lực' })).toHaveLength(1);
  });

  it('the survey address opens Khoảng trống năng lực', () => {
    signInOwner({ enterpriseTrialStatus: 'converted' });
    render(
      <MemoryRouter initialEntries={['/enterprise/trial']}>
        <Routes>
          <Route path="/enterprise/trial" element={<TrialProgramPage />} />
          <Route path="/enterprise/skill-gap" element={<p>Trang khoảng trống</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Trang khoảng trống')).toBeInTheDocument();
  });
});
