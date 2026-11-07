import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { MemberListItem } from '@/services/member.service';
import { ChangeRoleModal, PlacementModal } from './MemberDialogs';

const { updateMember } = vi.hoisted(() => ({ updateMember: vi.fn().mockResolvedValue({}) }));

vi.mock('@/hooks/use-current-user', () => ({
  useCurrentUser: (selector: (state: { user: { id: string; roles: string[] } }) => unknown) => selector({ user: { id: 'owner', roles: ['OWNER'] } }),
}));
vi.mock('@/hooks/use-members', () => ({ useUpdateMember: () => ({ mutateAsync: updateMember, isPending: false }) }));
vi.mock('@/hooks/use-departments', () => ({ useDepartments: () => ({ data: { items: [{ id: 'dept-1', name: 'Kế toán' }] } }) }));
vi.mock('@/hooks/use-job-positions', () => ({ useJobPositions: () => ({ data: { items: [{ id: 'position-1', name: 'Kế toán viên' }] } }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const member: MemberListItem = {
  id: 'member-1', kind: 'member', fullName: 'Nguyễn Linh', email: 'linh@example.com', roles: ['OWNER'], status: 'ACTIVE', employeeId: null,
};

describe('MemberDialogs', () => {
  beforeEach(() => updateMember.mockClear());

  it('creates a profile only after a department is selected', async () => {
    render(<PlacementModal member={member} open onClose={vi.fn()} />);
    const save = screen.getByRole('button', { name: 'Lưu thay đổi' });
    expect(save.hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('combobox', { name: 'Phòng ban' }));
    fireEvent.click(screen.getByRole('option', { name: 'Kế toán' }));
    expect(save.hasAttribute('disabled')).toBe(false);
    fireEvent.click(save);
    await waitFor(() => expect(updateMember).toHaveBeenCalledWith({ id: 'member-1', data: { departmentId: 'dept-1', jobPositionId: '' } }));
  });

  it('saves a changed role', async () => {
    render(<ChangeRoleModal member={member} open onClose={vi.fn()} />);
    const save = screen.getByRole('button', { name: 'Lưu thay đổi' });
    expect(save.hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('radio', { name: /Quản lý/ }));
    fireEvent.click(save);
    await waitFor(() => expect(updateMember).toHaveBeenCalledWith({ id: 'member-1', data: { roles: ['MANAGER'] } }));
  });
});
