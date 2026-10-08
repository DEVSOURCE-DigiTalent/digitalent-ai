import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useTrialResult } from '@/hooks/use-enterprise-trial';

const api = vi.hoisted(() => ({ result: vi.fn() }));
vi.mock('@/services/enterprise-trial.service', () => ({ enterpriseTrialService: api }));

const user = (id: string, organizationId: string) => ({
  id,
  organizationId,
  organization: { id: organizationId, name: organizationId },
  email: `${id}@example.test`,
  fullName: id,
  roles: ['EMPLOYEE'],
  permissions: [],
});

function wrapper(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  api.result.mockReset();
  useCurrentUser.getState().clearUser();
});

describe('enterprise trial query isolation', () => {
  it('uses a different cache key after switching organizations', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    api.result
      .mockResolvedValueOnce({ data: { success: true, data: { sourceAttemptId: 'attempt-a' } } })
      .mockResolvedValueOnce({ data: { success: true, data: { sourceAttemptId: 'attempt-b' } } });
    useCurrentUser.getState().setUser(user('employee-a', 'org-a'));
    const rendered = renderHook(() => useTrialResult(), { wrapper: wrapper(client) });
    await waitFor(() => expect(rendered.result.current.data?.sourceAttemptId).toBe('attempt-a'));

    act(() => useCurrentUser.getState().setUser(user('employee-b', 'org-b')));

    await waitFor(() => expect(rendered.result.current.data?.sourceAttemptId).toBe('attempt-b'));
    expect(api.result).toHaveBeenCalledTimes(2);
    const keys = client.getQueryCache().getAll().map(query => query.queryKey.join('/'));
    expect(keys).toContain('enterprise-trial/org-a/result');
    expect(keys).toContain('enterprise-trial/org-b/result');
  });

  it('fails closed when a successful HTTP response contains a failed API envelope', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    api.result.mockResolvedValue({ data: { success: false, data: null, message: 'denied' } });
    useCurrentUser.getState().setUser(user('employee', 'org'));
    const rendered = renderHook(() => useTrialResult(), { wrapper: wrapper(client) });

    await waitFor(() => expect(rendered.result.current.isError).toBe(true));
    expect(rendered.result.current.error).toEqual(new Error('denied'));
  });
});
