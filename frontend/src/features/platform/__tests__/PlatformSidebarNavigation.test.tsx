import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routes } from '@/app/router';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useSidebarState } from '@/hooks/use-sidebar-state';
import { MOCK_EMAILS, signInAsMock } from '@/test/session';
import apiClient from '@/services/api-client';
import { mockAdapter } from '@/services/mock/server/mock-adapter';

function App() {
  return useRoutes(routes);
}

describe('Platform Admin Sidebar Navigation', () => {
  let queryClient: QueryClient;

  beforeAll(() => {
    apiClient.defaults.adapter = mockAdapter;
  });

  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
    signInAsMock(MOCK_EMAILS.platform);
    useSidebarState.setState({ state: 'open', isMobileOpen: false });
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const renderWithRouter = (initialPath: string = '/platform/dashboard') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialPath]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('renders sidebar with valid platform routes and no "#" fallback links', async () => {
    renderWithRouter('/platform/dashboard');

    expect(await screen.findByRole('heading', { level: 1, name: 'Bảng điều khiển nền tảng' })).toBeInTheDocument();

    const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' });
    expect(nav).toBeInTheDocument();

    // Verify all sidebar links have non-# hrefs
    const links = nav.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => {
      const href = link.getAttribute('href');
      expect(href).not.toBe('#');
      expect(href).toMatch(/^\/platform\//);
    });

    // Check specific navigation items
    const dashboardLink = screen.getByRole('link', { name: 'Tổng quan' });
    expect(dashboardLink).toHaveAttribute('href', '/platform/dashboard');

    const orgsLink = screen.getByRole('link', { name: 'Doanh nghiệp' });
    expect(orgsLink).toHaveAttribute('href', '/platform/organizations');

    const usersLink = screen.getByRole('link', { name: 'Người dùng' });
    expect(usersLink).toHaveAttribute('href', '/platform/users');

    const frameworkLink = screen.getByRole('link', { name: 'Khung năng lực TT02' });
    expect(frameworkLink).toHaveAttribute('href', '/platform/framework');

    const plansLink = screen.getByRole('link', { name: 'Gói dịch vụ' });
    expect(plansLink).toHaveAttribute('href', '/platform/plans');
  });

  it('navigates to Organizations page when clicking Doanh nghiệp link in sidebar', async () => {
    renderWithRouter('/platform/dashboard');

    expect(await screen.findByRole('heading', { level: 1, name: 'Bảng điều khiển nền tảng' })).toBeInTheDocument();

    const orgsLink = screen.getByRole('link', { name: 'Doanh nghiệp' });
    fireEvent.click(orgsLink);

    expect(await screen.findByRole('heading', { level: 1, name: 'Danh sách tổ chức khách hàng' })).toBeInTheDocument();
  });

  it('navigates to Framework page when clicking Khung năng lực TT02 link in sidebar', async () => {
    renderWithRouter('/platform/dashboard');

    expect(await screen.findByRole('heading', { level: 1, name: 'Bảng điều khiển nền tảng' })).toBeInTheDocument();

    const frameworkLink = screen.getByRole('link', { name: 'Khung năng lực TT02' });
    fireEvent.click(frameworkLink);

    expect(await screen.findByRole('heading', { level: 1, name: 'Quản lý khung năng lực số Thông tư 02/2025' })).toBeInTheDocument();
  });

  it('navigates to Plans page when clicking Gói dịch vụ link in sidebar', async () => {
    renderWithRouter('/platform/dashboard');

    expect(await screen.findByRole('heading', { level: 1, name: 'Bảng điều khiển nền tảng' })).toBeInTheDocument();

    const plansLink = screen.getByRole('link', { name: 'Gói dịch vụ' });
    fireEvent.click(plansLink);

    expect(await screen.findByRole('heading', { level: 1, name: 'Gói dịch vụ & Quyền tính năng' })).toBeInTheDocument();
  });

  it('displays DigiTalent Platform and Quản trị hệ thống in the sidebar org block', async () => {
    renderWithRouter('/platform/dashboard');

    expect(await screen.findByText('DigiTalent Platform')).toBeInTheDocument();
    expect(screen.getByText('Quản trị hệ thống')).toBeInTheDocument();
  });
});
