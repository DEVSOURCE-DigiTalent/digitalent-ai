import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HubConnectionBuilder } from '@microsoft/signalr';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import { notificationHubUrl, useNotificationHub } from '@/hooks/use-notification-hub';

vi.mock('sonner', () => ({ toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }));

// @microsoft/signalr đã được mock trong test/setup.ts; ở đây ghi đè builder để bắt handler
const handlers = new Map<string, (payload: unknown) => void>();
const connection = {
  on: vi.fn((event: string, handler: (payload: unknown) => void) => handlers.set(event, handler)),
  off: vi.fn(),
  start: vi.fn(() => Promise.resolve()),
  stop: vi.fn(() => Promise.resolve()),
};
interface FakeBuilder {
  withUrl: () => FakeBuilder;
  withAutomaticReconnect: () => FakeBuilder;
  configureLogging: () => FakeBuilder;
  build: () => typeof connection;
}
const builder: FakeBuilder = {
  withUrl: () => builder,
  withAutomaticReconnect: () => builder,
  configureLogging: () => builder,
  build: () => connection,
};
const hub = { handlers, connection };

function renderHub(queryClient = new QueryClient()) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, ...renderHook(() => useNotificationHub(), { wrapper }) };
}

function signIn(isAuthenticated: boolean) {
  useCurrentUser.setState({
    user: isAuthenticated ? { id: 'u-1', email: 'e@digitalent.ai', fullName: 'E', roles: [ROLES.EMPLOYEE], permissions: [] } : null,
    isAuthenticated,
  });
}

describe('useNotificationHub', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hub.handlers.clear();
    vi.mocked(HubConnectionBuilder).mockImplementation(() => builder as unknown as HubConnectionBuilder);
  });

  it('does not connect when signed out', () => {
    signIn(false);
    renderHub();
    expect(hub.connection.start).not.toHaveBeenCalled();
  });

  it('shows a toast and refreshes skill gap data on SKILL_GAP_UPDATED', () => {
    signIn(true);
    const { queryClient } = renderHub();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    hub.handlers.get('ReceiveNotification')!({
      title: 'Skill gap updated',
      message: '2 competency gap(s) remaining.',
      type: 'SKILL_GAP_UPDATED',
      timestamp: '2026-09-29T08:00:00Z',
    });

    expect(hub.connection.start).toHaveBeenCalled();
    expect(toast.info).toHaveBeenCalledWith('Skill gap updated', { description: '2 competency gap(s) remaining.' });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['skill-gaps'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['recommendations'] });
  });

  it('only shows a toast for other notification types', () => {
    signIn(true);
    const { queryClient } = renderHub();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    hub.handlers.get('ReceiveNotification')!({ title: 'Hi', message: 'Other', type: 'INFO', timestamp: '' });

    expect(toast.info).toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('stops the connection on unmount', () => {
    signIn(true);
    const { unmount } = renderHub();

    unmount();

    expect(hub.connection.stop).toHaveBeenCalled();
  });

  it('resolves the hub URL from the API base URL', () => {
    expect(notificationHubUrl('/api/v1')).toBe('/hubs/notifications');
    expect(notificationHubUrl('https://api.digitalent.ai/api/v1')).toBe('https://api.digitalent.ai/hubs/notifications');
  });
});
