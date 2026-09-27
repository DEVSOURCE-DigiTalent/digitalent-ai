import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routes } from '../app/router';
import { useCurrentUser } from '../hooks/use-current-user';

function App() {
  return useRoutes(routes);
}

describe('End-to-End Foundation Smoke Tests (SEP-06)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.setState({ user: null, isAuthenticated: false });
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  it('AnonymousCanAccessLandingAndVerifyWithoutRedirect', async () => {
    // 1. Anonymous lands on /
    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Welcome to DigiTalent AI/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Dành cho Doanh nghiệp/i })).toBeInTheDocument();
    unmount();

    // 2. Anonymous visits /verify - MUST NOT redirect to login
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/verify']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Certificate Verification/i)).toBeInTheDocument();
  });

  it('HRManagerCanAccessEnterpriseDepartments', async () => {
    // Set authenticated HR session
    localStorage.setItem('accessToken', 'mock-hr-token');
    useCurrentUser.setState({
      user: {
        id: 'hr-1',
        email: 'hr@digitalent.ai',
        fullName: 'HR Manager',
        roles: ['HR_MANAGER'],
        permissions: ['department.read', 'department.create_update'],
      },
      isAuthenticated: true,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/enterprise/organization/departments']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: 'Departments' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Department' })).toBeInTheDocument();
  });

  it('EmployeeCannotSeeDepartmentCreateButton', async () => {
    // Set authenticated Employee session with read-only department permission
    localStorage.setItem('accessToken', 'mock-emp-token');
    useCurrentUser.setState({
      user: {
        id: 'emp-1',
        email: 'employee@digitalent.ai',
        fullName: 'Employee',
        roles: ['EMPLOYEE'],
        permissions: ['department.read', 'account.view_own'],
      },
      isAuthenticated: true,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/enterprise/organization/departments']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: 'Departments' })).toBeInTheDocument();
    // Employee lacks department.create_update permission
    expect(screen.queryByRole('button', { name: 'Create Department' })).not.toBeInTheDocument();
  });

  it('AnonymousAccessingEnterpriseRouteRedirectsToLogin', async () => {
    // No token in localStorage
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/enterprise/admin/users']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Đăng nhập vào hệ thống/i)).toBeInTheDocument();
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
      expect(screen.getByText(/Đăng nhập vào hệ thống/i)).toBeInTheDocument();
    });
  });
});
