import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { PERMISSIONS } from '@/hooks/use-permission';
import { ROLES } from '@/lib/roles';
import { NotFoundPage } from '@/features/auth/pages/NotFoundPage';
import { MANAGER_SIDEBAR } from '@/lib/sidebars/manager';
import { SidebarNav } from '@/components/layout/sidebar/SidebarNav';
import { PULSE_PATHS } from '@/features/pulse-employee/lib/paths';
import { legacyRedirectRoutes } from '@/app/routes/legacy-redirects';

function ManagerLegacyRoutes() {
  return useRoutes([
    ...legacyRedirectRoutes,
    { path: '/enterprise/team/reports', element: <h1>Báo cáo chu kỳ</h1> },
  ]);
}

function signIn(role: string, permissions: string[] = []) {
  useCurrentUser.setState({
    user: { id: 'user-1', email: 'user@example.test', fullName: 'Người dùng', roles: [role], permissions, workspace: 'enterprise' },
    isAuthenticated: true,
  });
}

describe('manager personal screens', () => {
  beforeEach(() => signIn(ROLES.MANAGER));

  it('links to personal learning without the retired training page', () => {
    signIn(ROLES.MANAGER, [PERMISSIONS.EMPLOYEE_COMPETENCY_PROFILE_READ, PERMISSIONS.LEARNING_PROGRESS_READ]);
    render(<MemoryRouter><SidebarNav config={MANAGER_SIDEBAR} isRail={false} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Học tập của tôi' })).toHaveAttribute('href', PULSE_PATHS.today);
    expect(screen.queryByRole('link', { name: 'Đào tạo đội ngũ' })).not.toBeInTheDocument();
  });

  it('returns the signed-in manager to the team home from 404', () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Về trang chủ' }).getAttribute('href')).toBe('/enterprise/team');
  });

  it.each(['/enterprise/team/training', '/enterprise/team/training/asg-1'])(
    'redirects the retired URL %s to cycle reports',
    async (path) => {
      render(<MemoryRouter initialEntries={[path]}><ManagerLegacyRoutes /></MemoryRouter>);
      expect(await screen.findByRole('heading', { name: 'Báo cáo chu kỳ' })).toBeInTheDocument();
    },
  );
});
