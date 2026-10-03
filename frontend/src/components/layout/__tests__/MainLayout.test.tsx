import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ENTERPRISE_PORTAL } from '@/lib/portals';
import { ROLES } from '@/lib/roles';
import { PERMISSIONS } from '@/hooks/use-permission';
import type { SubscriptionContext } from '@/types/session';
import { MainLayout } from '../MainLayout';
import { useSidebarState } from '@/hooks/use-sidebar-state';

const PRO: SubscriptionContext = {
  planCode: 'PRO',
  planName: 'Pro',
  status: 'active',
  entitlements: ['internal_learning', 'practical_tasks'],
};

function loginAs(roles: string[], permissions: string[], subscription: SubscriptionContext = PRO) {
  useCurrentUser.getState().setUser({
    id: 'u-1',
    email: 'u@digitalent.ai',
    fullName: 'User',
    roles,
    permissions,
    workspace: 'enterprise',
    subscription,
  });
}

function renderLayout(path = '/enterprise/dashboard') {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/enterprise" element={<MainLayout portal={ENTERPRISE_PORTAL} />}>
            <Route path="*" element={<p>Page content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('MainLayout navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset sidebar to open state for predictable test environment
    useSidebarState.setState({ state: 'open', isMobileOpen: false });
    loginAs([ROLES.OWNER], [
      PERMISSIONS.SKILL_GAP_READ,
      PERMISSIONS.JOB_POSITION_READ,
      PERMISSIONS.POSITION_REQUIREMENT_READ,
      PERMISSIONS.EMPLOYEE_READ,
      PERMISSIONS.DEPARTMENT_READ,
    ]);
  });

  it('hides sidebar items whose page the user has no permission for', () => {
    loginAs([ROLES.OWNER], [PERMISSIONS.SKILL_GAP_READ]);
    renderLayout();
    const nav = within(screen.getByRole('navigation', { name: /Điều hướng chính|Thanh điều hướng/i }));

    expect(nav.getByText(/Khoảng trống năng lực/i)).toBeInTheDocument();
    // Without audit.read, audit log is hidden
    expect(nav.queryByText('Nhật ký kiểm toán')).not.toBeInTheDocument();
  });

  it('hides the items of other roles', () => {
    loginAs([ROLES.EMPLOYEE], [PERMISSIONS.DASHBOARD_EMPLOYEE_READ]);
    renderLayout('/enterprise/me');
    const nav = within(screen.getByRole('navigation', { name: /Điều hướng chính|Thanh điều hướng/i }));

    // Employees should not see Owner administration links
    expect(nav.queryByText('Phân quyền')).not.toBeInTheDocument();
    expect(nav.queryByText('Gói & Thanh toán')).not.toBeInTheDocument();
  });

  it('renders navigation items as links', () => {
    renderLayout();

    const nav = screen.getByRole('navigation', { name: /Điều hướng chính|Thanh điều hướng/i });
    expect(within(nav).getByRole('link', { name: /Khoảng trống năng lực/i })).toHaveAttribute(
      'href',
      '/enterprise/skill-gap',
    );
  });

  it('keeps items that need a missing plan feature visible but locked', () => {
    loginAs([ROLES.OWNER], [PERMISSIONS.COURSE_UPDATE], { ...PRO, entitlements: [] });
    renderLayout();

    const nav = screen.getByRole('navigation', { name: /Điều hướng chính|Thanh điều hướng/i });
    const link = within(nav).getByRole('link', { name: /Khóa nội bộ/i });
    expect(within(link).getByLabelText('Chưa có trong gói')).toBeInTheDocument();
  });

  it('does not lock items when the plan includes the feature', () => {
    renderLayout();

    const nav = screen.getByRole('navigation', { name: /Điều hướng chính|Thanh điều hướng/i });
    const link = within(nav).getByRole('link', { name: /Khóa nội bộ/i });
    expect(within(link).queryByLabelText('Chưa có trong gói')).not.toBeInTheDocument();
  });

  it('marks only the most specific item as the current page', () => {
    renderLayout('/enterprise/requirements');

    const nav = screen.getByRole('navigation', { name: /Điều hướng chính|Thanh điều hướng/i });
    expect(within(nav).getByRole('link', { name: /Yêu cầu theo vị trí/i })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: /Vị trí & Cấp bậc/i })).not.toHaveAttribute('aria-current');
  });

  it('opens the navigation drawer on small screens and closes it from the backdrop or after navigating', () => {
    renderLayout();
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mở điều hướng' }));
    expect(screen.getByTestId('sidebar-backdrop')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('sidebar-backdrop'));
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mở điều hướng' }));
    fireEvent.click(screen.getByRole('link', { name: /Khoảng trống năng lực/i }));
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument();
  });

  it('names the icon-only buttons', () => {
    renderLayout();

    const topbar = within(screen.getByRole('banner'));
    expect(topbar.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument();
    expect(topbar.getByRole('button', { name: /Thông báo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thu gọn thanh bên' })).toBeInTheDocument();
  });
});
