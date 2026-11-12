import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import { UserAvatarMenu } from '../UserAvatarMenu';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderUserAvatarMenu(props = { accountPath: '/enterprise/account', settingsPath: '/enterprise/settings', canManageSettings: true }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <UserAvatarMenu {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('UserAvatarMenu', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    useCurrentUser.getState().setUser({
      id: 'owner-1',
      email: 'owner@digitalent.ai',
      fullName: 'Enterprise Owner',
      roles: [ROLES.OWNER],
      permissions: [],
      workspace: 'enterprise',
    });
  });

  it('renders user name and role badge', () => {
    renderUserAvatarMenu();
    expect(screen.getByText('Enterprise Owner')).toBeInTheDocument();
    expect(screen.getByText('Chủ doanh nghiệp')).toBeInTheDocument();
  });

  it('toggles dropdown menu on button click', () => {
    renderUserAvatarMenu();
    const button = screen.getByRole('button', { name: 'Menu tài khoản' });

    expect(screen.queryByText('Hồ sơ của tôi')).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(button);
    expect(screen.getByText('Hồ sơ của tôi')).toBeInTheDocument();
    expect(screen.getByText('Bảo mật tài khoản')).toBeInTheDocument();
    expect(screen.getByText('Đăng xuất')).toBeInTheDocument();

    // Click to close
    fireEvent.click(button);
    expect(screen.queryByText('Hồ sơ của tôi')).not.toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', () => {
    renderUserAvatarMenu();
    const button = screen.getByRole('button', { name: 'Menu tài khoản' });

    fireEvent.click(button);
    expect(screen.getByText('Hồ sơ của tôi')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Hồ sơ của tôi')).not.toBeInTheDocument();
  });

  it('navigates to account profile on click', () => {
    renderUserAvatarMenu();
    const button = screen.getByRole('button', { name: 'Menu tài khoản' });

    fireEvent.click(button);
    fireEvent.click(screen.getByText('Hồ sơ của tôi'));

    expect(mockNavigate).toHaveBeenCalledWith('/enterprise/account');
    expect(screen.queryByText('Hồ sơ của tôi')).not.toBeInTheDocument();
  });
});
