import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RequireTrialOpen } from '@/components/guards/RequireTrialOpen';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { SessionUser } from '@/types/session';
import { isTrialLimitedOwner, isTrialLockedPath, TRIAL_LOCKED_SCREEN_IDS } from '../trial-lock';

const owner = (extra: Partial<SessionUser> = {}): SessionUser => ({
  id: 'owner', email: 'owner@trial.test', fullName: 'Owner', roles: ['OWNER'], permissions: [], workspace: 'enterprise',
  enterpriseTrialStatus: 'trial_active', ...extra,
});
afterEach(() => { cleanup(); useCurrentUser.setState({ user: null, isAuthenticated: false }); });

describe('enterprise trial lock', () => {
  it('locks the owner menu entries without a trial rule and the screens they are active for', () => {
    for (const id of ['OW-01', 'OW-02', 'OW-03', 'OW-21', 'OW-22', 'OW-40', 'OW-46', 'SHR-03']) {
      expect(TRIAL_LOCKED_SCREEN_IDS.has(id), id).toBe(true);
    }
    for (const id of ['OW-T1', 'OW-05', 'OW-14', 'OW-23', 'OW-24', 'SHR-04', 'SHR-05']) {
      expect(TRIAL_LOCKED_SCREEN_IDS.has(id), id).toBe(false);
    }
  });

  it('matches addresses, details and queries included', () => {
    expect(isTrialLockedPath('/enterprise/skill-gap/emp-1')).toBe(true);
    expect(isTrialLockedPath('/enterprise/members?invite=1')).toBe(true);
    expect(isTrialLockedPath('/enterprise/dashboard')).toBe(true);
    expect(isTrialLockedPath('/enterprise/courses/abc')).toBe(false);
    expect(isTrialLockedPath('/enterprise/setup?tab=departments')).toBe(false);
    expect(isTrialLockedPath('/enterprise/trial?resume=1')).toBe(false);
  });

  it('applies to a trial owner until the organization buys a course, never to staff', () => {
    expect(isTrialLimitedOwner(owner())).toBe(true);
    expect(isTrialLimitedOwner(owner({ enterpriseTrialPurchased: true }))).toBe(false);
    expect(isTrialLimitedOwner(owner({ enterpriseTrialStatus: 'converted' }))).toBe(false);
    expect(isTrialLimitedOwner(owner({ roles: ['MANAGER'] }))).toBe(false);
    expect(isTrialLimitedOwner(null)).toBe(false);
  });

  it('a locked address sends the trial owner to the survey, and lets a customer in', () => {
    const app = () => render(
      <MemoryRouter initialEntries={['/enterprise/members']}>
        <Routes>
          <Route path="/enterprise/members" element={<RequireTrialOpen><p>Nhân sự</p></RequireTrialOpen>} />
          <Route path="/enterprise/trial" element={<p>Khảo sát</p>} />
        </Routes>
      </MemoryRouter>,
    );
    useCurrentUser.setState({ user: owner(), isAuthenticated: true });
    const { unmount } = app();
    expect(screen.getByText('Khảo sát')).toBeInTheDocument();
    unmount();

    useCurrentUser.setState({ user: owner({ enterpriseTrialPurchased: true }), isAuthenticated: true });
    app();
    expect(screen.getByText('Nhân sự')).toBeInTheDocument();
  });
});
