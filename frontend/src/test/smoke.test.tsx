import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routes } from '../app/router';
import { useCurrentUser } from '../hooks/use-current-user';
import { MOCK_EMAILS, signInAsMock } from './session';

function App() {
  return useRoutes(routes);
}

describe('End-to-End Foundation Smoke Tests (SEP-06)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  it('AnonymousCanAccessLandingWithoutRedirect', async () => {
    // 1. Anonymous lands on /
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/business']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // The landing page is lazy-loaded; its first import is slow when the whole suite runs in parallel.
    expect(await screen.findByRole('heading', { level: 1, name: 'DigiTalent AI' }, { timeout: 10_000 })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^Xem bảng giá$/ })[0]).toHaveAttribute('href', '/business/pricing');
  });

  it('OwnerCanAccessEnterpriseDepartments', async () => {
    signInAsMock(MOCK_EMAILS.owner);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/enterprise/departments']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: /Phòng ban/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tạo phòng ban' })).toBeInTheDocument();
  });

  it('OwnerWithoutEditPermissionCannotSeeDepartmentCreateButton', async () => {
    signInAsMock(MOCK_EMAILS.owner, { permissions: ['department.read'] });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/enterprise/departments']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: /Phòng ban/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tạo phòng ban' })).not.toBeInTheDocument();
  });

  it('AnonymousAccessingEnterpriseRouteRedirectsToLogin', async () => {
    // No token in localStorage
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/enterprise/members']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeInTheDocument();
    });
  });

  it('LegacyRouteRedirectsToEnterpriseRouteThenLoginIfAnonymous', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/organization/departments']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeInTheDocument();
    });
  });
});
