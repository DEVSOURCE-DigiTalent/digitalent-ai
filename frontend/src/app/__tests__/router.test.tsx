import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routes } from '../router';

function AppRoutes() {
  return useRoutes(routes);
}

describe('Router Configuration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  it('AnonymousCanOpenLandingAndVerifyRoute', async () => {
    // Open Landing page /
    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Welcome to DigiTalent AI/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Dành cho Doanh nghiệp/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Người học theo vị trí/i })).toBeInTheDocument();
    unmount();

    // Open public /verify page
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/verify']}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Certificate Verification/i)).toBeInTheDocument();
  });

  it('AnonymousCannotOpenEnterpriseRoute', async () => {
    // When anonymous accesses enterprise route, AuthGuard redirects to /login
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/enterprise/organization/departments']}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Đăng nhập vào hệ thống/i)).toBeInTheDocument();
    });
  });

  it('LegacyDepartmentPathRedirectsToEnterprisePath', async () => {
    // When anonymous accesses legacy /organization/departments, redirects to enterprise then login
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/organization/departments']}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Đăng nhập vào hệ thống/i)).toBeInTheDocument();
    });
  });
});
