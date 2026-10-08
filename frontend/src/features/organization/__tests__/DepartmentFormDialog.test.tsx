import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AxiosError, type AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as deptHooks from '@/hooks/use-departments';
import * as memberHooks from '@/hooks/use-members';
import { DepartmentFormDialog } from '../components/DepartmentFormDialog';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const conflict = (message: string) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 409,
    data: { success: false, message, data: null, errors: [] },
  } as AxiosResponse);

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const renderWithClient = (ui: React.ReactElement) =>
  render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);

describe('DepartmentFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(deptHooks, 'useDepartments').mockReturnValue({ data: { items: [] } } as never);
    vi.spyOn(deptHooks, 'useUpdateDepartment').mockReturnValue({ mutateAsync: vi.fn() } as never);
    vi.spyOn(memberHooks, 'useMembers').mockReturnValue({ data: { items: [] } } as never);
  });

  it('shows the reason the server gave when the code is already in use', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(conflict("Department code 'OPS' already exists."));
    vi.spyOn(deptHooks, 'useCreateDepartment').mockReturnValue({ mutateAsync } as never);
    const onClose = vi.fn();
    renderWithClient(<DepartmentFormDialog open onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('Ví dụ: ENG'), { target: { value: 'OPS' } });
    fireEvent.change(screen.getByPlaceholderText('Ví dụ: Kỹ thuật'), { target: { value: 'Operations' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Department code 'OPS' already exists."));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('falls back to a generic message when the server gives none', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error('Network Error'));
    vi.spyOn(deptHooks, 'useCreateDepartment').mockReturnValue({ mutateAsync } as never);
    renderWithClient(<DepartmentFormDialog open onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('Ví dụ: ENG'), { target: { value: 'OPS' } });
    fireEvent.change(screen.getByPlaceholderText('Ví dụ: Kỹ thuật'), { target: { value: 'Operations' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Không tạo được phòng ban'));
  });

  describe('editing', () => {
    const department = { id: 'dept-1', code: 'QA', name: 'Kiểm thử chất lượng', status: 'ACTIVE' as const, managerEmployeeId: 'emp-9' };
    const member = (employeeId: string, fullName: string) => ({ id: `user-${employeeId}`, kind: 'member', employeeId, fullName, email: `${employeeId}@digitalent.ai`, roles: [], status: 'ACTIVE' });
    const managerSelect = () => screen.getByRole('option', { name: 'Chưa phân công Manager' }).closest('select')!;

    beforeEach(() => {
      vi.spyOn(deptHooks, 'useDepartment').mockReturnValue({
        data: { ...department, description: 'Đảm bảo chất lượng sản phẩm', managerName: 'Department Manager' },
        isLoading: false,
      } as never);
    });

    it('selects the manager even when the member list arrives after the department', () => {
      const useMembers = vi.spyOn(memberHooks, 'useMembers').mockReturnValue({ data: undefined, isLoading: true } as never);
      const { rerender } = renderWithClient(<DepartmentFormDialog open onClose={vi.fn()} department={department} />);
      expect(screen.getByRole('button', { name: 'Lưu' })).toBeDisabled();

      useMembers.mockReturnValue({ data: { items: [member('emp-1', 'Employee'), member('emp-9', 'Department Manager')] }, isLoading: false } as never);
      rerender(<QueryClientProvider client={queryClient}><DepartmentFormDialog open onClose={vi.fn()} department={department} /></QueryClientProvider>);

      expect(managerSelect().value).toBe('emp-9');
      expect(screen.getByDisplayValue('Đảm bảo chất lượng sản phẩm')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Lưu' })).toBeEnabled();
    });

    it('keeps a current manager who is not on the first page of members', () => {
      vi.spyOn(memberHooks, 'useMembers').mockReturnValue({ data: { items: [member('emp-1', 'Employee')] }, isLoading: false } as never);
      renderWithClient(<DepartmentFormDialog open onClose={vi.fn()} department={department} />);

      expect(managerSelect().value).toBe('emp-9');
      expect(managerSelect().selectedOptions[0].textContent).toBe('Department Manager');
    });
  });
});
