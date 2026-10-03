import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CommandPalette } from '../CommandPalette';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import { PERMISSIONS } from '@/hooks/use-permission';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function loginAs(roles: string[], permissions: string[]) {
  useCurrentUser.getState().setUser({
    id: 'u-1',
    email: 'user@digitalent.ai',
    fullName: 'Test User',
    roles,
    permissions,
    workspace: 'enterprise',
  });
}

describe('CommandPalette', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    loginAs([ROLES.OWNER], [PERMISSIONS.USER_READ, PERMISSIONS.SKILL_GAP_READ]);
  });

  it('does not render when isOpen is false', () => {
    render(
      <MemoryRouter>
        <CommandPalette isOpen={false} onClose={onClose} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('dialog', { name: 'Tìm kiếm' })).not.toBeInTheDocument();
  });

  it('renders input and filtered screens when open', () => {
    render(
      <MemoryRouter>
        <CommandPalette isOpen={true} onClose={onClose} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('dialog', { name: 'Tìm kiếm' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tìm màn hình…')).toBeInTheDocument();
  });

  it('filters results by search query', () => {
    render(
      <MemoryRouter>
        <CommandPalette isOpen={true} onClose={onClose} />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText('Tìm màn hình…');
    fireEvent.change(input, { target: { value: 'Thành viên' } });

    expect(screen.getByText('Thành viên')).toBeInTheDocument();
    expect(screen.queryByText('Khoảng trống năng lực')).not.toBeInTheDocument();
  });

  it('hides screens the user has no permission for', () => {
    // Only give skill gap read, not user read
    loginAs([ROLES.OWNER], [PERMISSIONS.SKILL_GAP_READ]);

    render(
      <MemoryRouter>
        <CommandPalette isOpen={true} onClose={onClose} />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText('Tìm màn hình…');
    fireEvent.change(input, { target: { value: 'Thành viên' } });

    expect(screen.queryByText('Thành viên')).not.toBeInTheDocument();
  });

  it('navigates and closes on item click', () => {
    render(
      <MemoryRouter>
        <CommandPalette isOpen={true} onClose={onClose} />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText('Tìm màn hình…');
    fireEvent.change(input, { target: { value: 'Thành viên' } });

    fireEvent.click(screen.getByText('Thành viên'));
    expect(mockNavigate).toHaveBeenCalledWith('/enterprise/members');
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on Escape key press', () => {
    render(
      <MemoryRouter>
        <CommandPalette isOpen={true} onClose={onClose} />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText('Tìm màn hình…');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
