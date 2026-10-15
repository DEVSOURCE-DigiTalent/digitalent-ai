import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import { NotFoundPage } from '@/features/auth/pages/NotFoundPage';
import { MANAGER_SIDEBAR } from '@/lib/sidebars/manager';

function signIn(role: string) {
  useCurrentUser.setState({
    user: { id: 'user-1', email: 'user@example.test', fullName: 'Người dùng', roles: [role], permissions: [], workspace: 'enterprise' },
    isAuthenticated: true,
  });
}

describe('manager personal screens', () => {
  beforeEach(() => signIn(ROLES.MANAGER));

  it('sends the manager’s own learning to the Pulse employee portal', () => {
    const personal = MANAGER_SIDEBAR.find((section) => section.label === 'Cá nhân');
    expect(personal?.items?.map((item) => item.screenId)).toEqual(['EM-01', 'EM-02', 'EM-03', 'EM-08']);
  });

  it('returns the signed-in manager to the team home from 404', () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Về trang chủ' }).getAttribute('href')).toBe('/enterprise/team');
  });
});
