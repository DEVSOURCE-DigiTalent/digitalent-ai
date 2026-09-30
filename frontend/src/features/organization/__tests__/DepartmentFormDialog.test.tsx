import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AxiosError, type AxiosResponse } from 'axios';
import { toast } from 'sonner';
import * as deptHooks from '@/hooks/use-departments';
import { DepartmentFormDialog } from '../components/DepartmentFormDialog';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const conflict = (message: string) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 409,
    data: { success: false, message, data: null, errors: [] },
  } as AxiosResponse);

describe('DepartmentFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(deptHooks, 'useDepartments').mockReturnValue({ data: { items: [] } } as never);
    vi.spyOn(deptHooks, 'useUpdateDepartment').mockReturnValue({ mutateAsync: vi.fn() } as never);
  });

  it('shows the reason the server gave when the code is already in use', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(conflict("Department code 'OPS' already exists."));
    vi.spyOn(deptHooks, 'useCreateDepartment').mockReturnValue({ mutateAsync } as never);
    const onClose = vi.fn();
    render(<DepartmentFormDialog open onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('e.g. ENG'), { target: { value: 'OPS' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Engineering'), { target: { value: 'Operations' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Department code 'OPS' already exists."));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('falls back to a generic message when the server gives none', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error('Network Error'));
    vi.spyOn(deptHooks, 'useCreateDepartment').mockReturnValue({ mutateAsync } as never);
    render(<DepartmentFormDialog open onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('e.g. ENG'), { target: { value: 'OPS' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Engineering'), { target: { value: 'Operations' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to create department'));
  });
});
