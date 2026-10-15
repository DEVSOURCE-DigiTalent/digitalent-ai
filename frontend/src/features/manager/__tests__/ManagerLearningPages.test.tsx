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

  it('keeps the manager’s own learning (Pulse employee portal) out of the primary team sidebar', () => {
    const ids = MANAGER_SIDEBAR.flatMap((section) => [section.screenId, ...(section.items ?? []).map((item) => item.screenId)]);
    expect(ids.filter((id) => id?.startsWith('EM-'))).toEqual([]);
  });

  it('returns the signed-in manager to the team home from 404', () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Về trang chủ' }).getAttribute('href')).toBe('/enterprise/team');
  });
});
