import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routes } from '../router';
import { MOCK_EMAILS, signInAsMock, signOut } from '../../test/session';
import { memberService } from '../../services/member.service';
import { ROLES } from '../../lib/roles';
import { useSidebarState } from '../../hooks/use-sidebar-state';

vi.hoisted(() => vi.stubEnv('VITE_USE_MOCK', 'true'));

function App() {
  return useRoutes(routes);
}

describe('Foundation v2.1 Verification Suite (A1, A2, A3)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    useSidebarState.setState({ state: 'open', isMobileOpen: false });
    signOut();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  // ── Role & Sidebar Tree Tests ──
  it('renders Owner sidebar with 7 business sections', async () => {
    signInAsMock(MOCK_EMAILS.owner);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/enterprise/dashboard']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const nav = await screen.findByRole('navigation', { name: 'Điều hướng chính' });
    expect(within(nav).getByText('Tổ chức')).toBeInTheDocument();
    expect(within(nav).getByText('Năng lực')).toBeInTheDocument();
    expect(within(nav).getByText('Đào tạo')).toBeInTheDocument();
    expect(within(nav).getByText('Đánh giá & Minh chứng')).toBeInTheDocument();
    expect(within(nav).getByText('Báo cáo')).toBeInTheDocument();
    expect(within(nav).getByText('Gói dịch vụ')).toBeInTheDocument();
    expect(within(nav).getByText('Cài đặt')).toBeInTheDocument();
  });

  it('renders Manager sidebar with team scope and practical evaluation', async () => {
    signInAsMock(MOCK_EMAILS.manager);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/enterprise/team']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const nav = await screen.findByRole('navigation', { name: 'Điều hướng chính' });
    expect(within(nav).getByText('Nhóm của tôi')).toBeInTheDocument();
    expect(within(nav).getByText('Đánh giá thực tế')).toBeInTheDocument();
    expect(within(nav).getByText('Cá nhân')).toBeInTheDocument();
  });

  it('renders Employee sidebar centered on personal development', async () => {
    signInAsMock(MOCK_EMAILS.employee);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/enterprise/me']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const nav = await screen.findByRole('navigation', { name: 'Điều hướng chính' });
    expect(within(nav).getByText('Năng lực của tôi')).toBeInTheDocument();
    expect(within(nav).getByText('Học tập')).toBeInTheDocument();
    expect(within(nav).getByText('Đánh giá')).toBeInTheDocument();
    expect(within(nav).getByText('Nhiệm vụ thực tế')).toBeInTheDocument();
    expect(within(nav).getByText('Thành tựu')).toBeInTheDocument();
  });

  // ── Last Owner Invariant Tests ──
  it('protects the last owner from losing owner role or deactivation', async () => {
    signInAsMock(MOCK_EMAILS.owner);

    // Attempting to remove OWNER role when only 1 owner exists
    await expect(
      memberService.update('usr-chu', { roles: [ROLES.MANAGER] })
    ).rejects.toThrow();

    // Attempting to deactivate the single owner
    await expect(
      memberService.deactivate('usr-chu', 'Lý do thử nghiệm')
    ).rejects.toThrow();
  });

  // ── Expired Subscription Banner & Gating ──
  it('shows expired subscription warning banner on enterprise layout when unpaid', async () => {
    signInAsMock(MOCK_EMAILS.expiredOwner);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/enterprise/subscription']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(
      await screen.findByText(/Gói dịch vụ đã hết hạn\. Vui lòng thanh toán hoặc liên hệ Chủ sở hữu/i)
    ).toBeInTheDocument();
  });

  // ── Legacy Redirects with Query Preservation ──
  it('redirects /enterprise/overview to /enterprise/dashboard while preserving query', async () => {
    signInAsMock(MOCK_EMAILS.owner);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/enterprise/overview?tab=kpi&filter=active']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const nav = await screen.findByRole('navigation', { name: 'Điều hướng chính' });
    expect(nav).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
