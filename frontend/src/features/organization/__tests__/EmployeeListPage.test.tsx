import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmployeeListPage } from '../pages/EmployeeListPage';
import { useCurrentUser } from '@/hooks/use-current-user';
import * as empHooks from '@/hooks/use-employees';
import * as deptHooks from '@/hooks/use-departments';
import * as posHooks from '@/hooks/use-job-positions';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('EmployeeListPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Mock default department and job position hooks for selects
    vi.spyOn(deptHooks, 'useDepartments').mockReturnValue({
      data: {
        items: [
          { id: 'dept-1', code: 'ENG', name: 'Engineering', status: 'ACTIVE' },
          { id: 'dept-2', code: 'HR', name: 'Human Resources', status: 'ACTIVE' },
        ],
        totalItems: 2,
        pageIndex: 1,
        pageSize: 100,
        totalPages: 1,
      },
      isLoading: false,
    } as any);

    vi.spyOn(posHooks, 'useJobPositions').mockReturnValue({
      data: {
        items: [
          { id: 'pos-1', code: 'SWE', name: 'Software Engineer', status: 'ACTIVE' },
          { id: 'pos-2', code: 'HRM', name: 'HR Manager', status: 'ACTIVE' },
        ],
        totalItems: 2,
        pageIndex: 1,
        pageSize: 100,
        totalPages: 1,
      },
      isLoading: false,
    } as any);
  });

  const mockUserWithPermissions = (permissions: string[] = ['employee.read', 'employee.create_update']) => {
    useCurrentUser.setState({
      user: {
        id: 'user-1',
        email: 'admin@digitalent.ai',
        fullName: 'Admin User',
        roles: ['HR_MANAGER'],
        permissions,
      },
      isAuthenticated: true,
    });
  };

  it('EmployeePageShowsServerRowsAndEmptyState', async () => {
    mockUserWithPermissions();

    vi.spyOn(empHooks, 'useEmployees').mockReturnValue({
      data: {
        items: [
          {
            id: 'emp-1',
            employeeCode: 'EMP-001',
            fullName: 'Nguyen Van A',
            workEmail: 'a.nguyen@company.com',
            departmentId: 'dept-1',
            departmentName: 'Engineering',
            positionId: 'pos-1',
            positionName: 'Software Engineer',
            phone: '0901234567',
            status: 'ACTIVE',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
          },
          {
            id: 'emp-2',
            employeeCode: 'EMP-002',
            fullName: 'Tran Thi B',
            workEmail: 'b.tran@company.com',
            departmentId: 'dept-2',
            departmentName: 'Human Resources',
            positionId: 'pos-2',
            positionName: 'HR Manager',
            phone: '0907654321',
            status: 'INACTIVE',
            createdAt: '2026-01-02',
            updatedAt: '2026-01-02',
          },
        ],
        totalItems: 2,
        pageIndex: 1,
        pageSize: 10,
        totalPages: 1,
      },
      isLoading: false,
    } as any);

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <EmployeeListPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('EMP-001')).toBeInTheDocument();
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('a.nguyen@company.com')).toBeInTheDocument();
    expect(screen.getAllByText('Engineering').length).toBeGreaterThan(0);
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();

    expect(screen.getByText('EMP-002')).toBeInTheDocument();
    expect(screen.getByText('Tran Thi B')).toBeInTheDocument();
    expect(screen.getAllByText('Human Resources').length).toBeGreaterThan(0);

    // Now test empty state
    vi.spyOn(empHooks, 'useEmployees').mockReturnValue({
      data: { items: [], totalItems: 0, pageIndex: 1, pageSize: 10, totalPages: 0 },
      isLoading: false,
    } as any);

    rerender(
      <QueryClientProvider client={queryClient}>
        <EmployeeListPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('No employees found')).toBeInTheDocument();
  });

  it('ReadOnlyUserCannotEditEmployees', async () => {
    mockUserWithPermissions(['employee.read']);

    vi.spyOn(empHooks, 'useEmployees').mockReturnValue({
      data: {
        items: [
          {
            id: 'emp-1',
            employeeCode: 'EMP-001',
            fullName: 'Nguyen Van A',
            departmentName: 'Engineering',
            positionName: 'Software Engineer',
            status: 'ACTIVE',
          },
        ],
        totalItems: 1,
        pageIndex: 1,
        pageSize: 10,
        totalPages: 1,
      },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <EmployeeListPage />
      </QueryClientProvider>
    );

    expect(screen.queryByRole('button', { name: /Create Employee/i })).not.toBeInTheDocument();
    expect(screen.queryByTitle('Edit')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Archive')).not.toBeInTheDocument();
  });

  it('ArchiveEmployeeRequiresConfirmation', async () => {
    mockUserWithPermissions();
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.spyOn(empHooks, 'useArchiveEmployee').mockReturnValue({
      mutateAsync,
    } as any);

    vi.spyOn(empHooks, 'useEmployees').mockReturnValue({
      data: {
        items: [
          {
            id: 'emp-1',
            employeeCode: 'EMP-001',
            fullName: 'Nguyen Van A',
            departmentName: 'Engineering',
            positionName: 'Software Engineer',
            status: 'ACTIVE',
          },
        ],
        totalItems: 1,
        pageIndex: 1,
        pageSize: 10,
        totalPages: 1,
      },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <EmployeeListPage />
      </QueryClientProvider>
    );

    const archiveBtn = screen.getByTitle('Archive');
    fireEvent.click(archiveBtn);

    expect(screen.getByText(/Are you sure you want to archive/i)).toBeInTheDocument();
    const dialog = screen.getByRole('dialog');
    const confirmBtn = within(dialog).getByRole('button', { name: 'Archive' });
    expect(confirmBtn).toBeInTheDocument();

    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('emp-1');
    });
  });

  it('CreateEmployeeShowsValidationAndCallsApi', async () => {
    mockUserWithPermissions();
    const createMutateAsync = vi.fn().mockResolvedValue({ data: { data: { id: 'new-emp-id' } } });
    vi.spyOn(empHooks, 'useCreateEmployee').mockReturnValue({
      mutateAsync: createMutateAsync,
    } as any);

    vi.spyOn(empHooks, 'useEmployees').mockReturnValue({
      data: { items: [], totalItems: 0, pageIndex: 1, pageSize: 10, totalPages: 0 },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <EmployeeListPage />
      </QueryClientProvider>
    );

    const createBtn = screen.getByRole('button', { name: /Create Employee/i });
    fireEvent.click(createBtn);

    expect(screen.getByRole('heading', { name: 'Create Employee' })).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('Employee code is required')).toBeInTheDocument();
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
      expect(screen.getByText('Department is required')).toBeInTheDocument();
    });

    // Fill valid fields
    const codeInput = screen.getByPlaceholderText('e.g. EMP-001');
    const nameInput = screen.getByPlaceholderText('e.g. Nguyen Van A');
    const deptSelect = screen.getByLabelText(/Department \*/i);

    fireEvent.change(codeInput, { target: { value: 'EMP-999' } });
    fireEvent.change(nameInput, { target: { value: 'Le Van C' } });
    fireEvent.change(deptSelect, { target: { value: 'dept-1' } });

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith({
        employeeCode: 'EMP-999',
        fullName: 'Le Van C',
        departmentId: 'dept-1',
        jobPositionId: undefined,
        positionId: undefined,
        workEmail: undefined,
        phone: undefined,
        status: 'ACTIVE',
      });
    });
  });

  it('EditEmployeePrefillsAndUpdates', async () => {
    mockUserWithPermissions();
    const updateMutateAsync = vi.fn().mockResolvedValue({ data: { data: { id: 'emp-1' } } });
    vi.spyOn(empHooks, 'useUpdateEmployee').mockReturnValue({
      mutateAsync: updateMutateAsync,
    } as any);

    vi.spyOn(empHooks, 'useEmployees').mockReturnValue({
      data: {
        items: [
          {
            id: 'emp-1',
            employeeCode: 'EMP-001',
            fullName: 'Nguyen Van A',
            workEmail: 'a.nguyen@company.com',
            departmentId: 'dept-1',
            departmentName: 'Engineering',
            jobPositionId: 'pos-1',
            positionId: 'pos-1',
            positionName: 'Software Engineer',
            phone: '0901234567',
            status: 'ACTIVE',
          },
        ],
        totalItems: 1,
        pageIndex: 1,
        pageSize: 10,
        totalPages: 1,
      },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <EmployeeListPage />
      </QueryClientProvider>
    );

    const editBtn = screen.getByTitle('Edit');
    fireEvent.click(editBtn);

    expect(screen.getByRole('heading', { name: 'Edit Employee' })).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('e.g. Nguyen Van A');
    expect(nameInput).toHaveValue('Nguyen Van A');

    fireEvent.change(nameInput, { target: { value: 'Nguyen Van A Updated' } });

    const saveBtn = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith({
        id: 'emp-1',
        data: expect.objectContaining({
          fullName: 'Nguyen Van A Updated',
          employeeCode: 'EMP-001',
          departmentId: 'dept-1',
        }),
      });
    });
  });
});
