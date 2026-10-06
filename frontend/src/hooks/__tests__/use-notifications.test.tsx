import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiClient from '../../services/api-client';
import { useNotifications } from '../use-platform';

const unread = {
  id: 'notice-1',
  title: 'Nhiệm vụ mới',
  message: 'Bạn có nhiệm vụ mới',
  type: 'TASK_ASSIGNED',
  createdAt: '2026-10-06T08:00:00Z',
  isRead: false,
};
const read = { ...unread, id: 'notice-2', isRead: true };

function renderNotifications(params?: { unreadOnly?: boolean }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useNotifications(params), { wrapper });
}

describe('useNotifications', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('extracts items from the BE2 paged response for the shared notification UI', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        success: true,
        message: 'OK',
        data: { items: [unread, read], total: 2, unread: 1, pageIndex: 1, pageSize: 20 },
        errors: [],
      },
    });

    const { result } = renderNotifications();
    await waitFor(() => expect(result.current.data).toEqual([unread, read]));
  });

  it('filters the BE2 page locally when unreadOnly is requested', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        success: true,
        message: 'OK',
        data: { items: [unread, read], total: 2, unread: 1, pageIndex: 1, pageSize: 20 },
        errors: [],
      },
    });

    const { result } = renderNotifications({ unreadOnly: true });
    await waitFor(() => expect(result.current.data).toEqual([unread]));
  });

  it('keeps mock array responses', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { success: true, message: 'OK', data: [unread, read], errors: [] },
    });

    const { result } = renderNotifications();
    await waitFor(() => expect(result.current.data).toEqual([unread, read]));
  });
});
