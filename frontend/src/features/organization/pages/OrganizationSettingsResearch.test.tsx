import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  access: { researchers: 0, pendingInvitations: 0 },
  setEnabled: vi.fn(),
  // one object for every render: the page resets its form when the organization changes
  organization: {
    data: { id: 'org', name: 'Khang Thịnh', industry: 'Công nghệ thông tin', size: '11-50', timezone: 'Asia/Ho_Chi_Minh', defaultAssignmentDays: 3 },
    isLoading: false, isError: false, refetch: () => {},
  },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/hooks/use-current-user', () => ({
  useCurrentUser: (select: (s: unknown) => unknown) => select({ user: { id: 'owner', fullName: 'Chủ', email: 'o@x.vn', roles: ['OWNER'] } }),
}));
vi.mock('@/hooks/use-organization', () => ({
  useOrganization: () => state.organization,
  useUpdateOrganizationSettings: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/enterprise-research/research-api', () => ({
  useResearchSettings: () => ({ data: true, isPending: false, isError: false }),
  useResearchAccess: () => ({ data: state.access }),
  useSetResearchEnabled: () => ({ mutateAsync: state.setEnabled, isPending: false }),
}));

const { OrganizationSettingsPage } = await import('./OrganizationSettingsPage');

function mount() {
  render(<MemoryRouter initialEntries={['/enterprise/settings']}><OrganizationSettingsPage /></MemoryRouter>);
  return screen.getByRole('switch', { name: /Bật tính năng R&D/ });
}

describe('Switching R&D off', () => {
  beforeEach(() => {
    state.setEnabled.mockReset().mockResolvedValue(false);
  });

  it('asks first when R&D invitations are still open, saying they will be revoked', async () => {
    state.access = { researchers: 0, pendingInvitations: 2 };
    fireEvent.click(mount());

    const dialog = await screen.findByRole('dialog', { name: 'Tắt R&D?' });
    expect(dialog).toHaveTextContent('2 lời mời R&D chưa kích hoạt sẽ bị thu hồi.');
    expect(dialog).not.toHaveTextContent('tài khoản R&D sẽ không sửa');
    expect(state.setEnabled).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Tắt R&D' }));
    await waitFor(() => expect(state.setEnabled).toHaveBeenCalledWith(false));
  });

  it('switches off at once when nobody is in R&D', async () => {
    state.access = { researchers: 0, pendingInvitations: 0 };
    fireEvent.click(mount());
    await waitFor(() => expect(state.setEnabled).toHaveBeenCalledWith(false));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
