import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useLogout } from '../use-auth';
import { useCurrentUser } from '../use-current-user';
import { signInAsMock, MOCK_EMAILS } from '../../test/session';

vi.mock('../../services/auth.service', () => ({
  authService: { login: vi.fn(), getMe: vi.fn(), logout: vi.fn(() => Promise.resolve({})) },
}));

describe('useLogout', () => {
  it('signs the user out and drops everything cached for them', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(['onboarding', 'setup'], { organization: { name: 'Organization of the previous user' } });
    signInAsMock(MOCK_EMAILS.owner);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useLogout(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync();
    });

    await waitFor(() => expect(useCurrentUser.getState().user).toBeNull());
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(queryClient.getQueryData(['onboarding', 'setup'])).toBeUndefined();
  });
});
