import { afterEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { SessionUser } from '@/types/session';
import { useCurrentUser } from '../use-current-user';
import { useSurveyOver } from '../use-survey-over';

const owner = (extra: Partial<SessionUser>) => useCurrentUser.setState({
  user: { id: 'o', email: 'o@x.vn', fullName: 'Chủ', roles: ['OWNER'], permissions: [], workspace: 'enterprise', ...extra } as SessionUser,
  isAuthenticated: true,
});
const over = () => renderHook(() => useSurveyOver()).result.current;
afterEach(() => useCurrentUser.setState({ user: null, isAuthenticated: false }));

describe('useSurveyOver', () => {
  it('keeps the survey open only to a trial organization that has bought nothing', () => {
    owner({ enterpriseTrialStatus: 'trial_active' });
    expect(over()).toBe(false);
    owner({ enterpriseTrialStatus: 'trial_read_only' });
    expect(over()).toBe(false);
  });

  it('closes it once a course is bought or the organization converted', () => {
    owner({ enterpriseTrialStatus: 'trial_active', enterpriseTrialPurchased: true });
    expect(over()).toBe(true);
    owner({ enterpriseTrialStatus: 'converted' });
    expect(over()).toBe(true);
  });

  it('never opens it to a paying company that did not register for the trial', () => {
    // Opening the survey used to create a trial for it and lock most of the owner menu.
    owner({ enterpriseTrialStatus: null });
    expect(over()).toBe(true);
    owner({});
    expect(over()).toBe(true);
  });
});
