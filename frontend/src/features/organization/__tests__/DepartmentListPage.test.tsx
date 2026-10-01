import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DepartmentListPage } from '../pages/DepartmentListPage';
import { useCurrentUser } from '@/hooks/use-current-user';
import * as deptHooks from '@/hooks/use-departments';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('DepartmentListPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const mockUserWithPermissions = (permissions: string[] = ['department.read', 'department.create_update']) => {
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

  it('DepartmentPageShowsServerRowsAndEmptyState', async () => {
    mockUserWithPermissions();

    // First test with rows
    vi.spyOn(deptHooks, 'useDepartments').mockReturnValue({
      data: {
        items: [
          { id: '1', code: 'IT', name: 'Information Technology', parentDepartmentName: null, status: 'ACTIVE' },
          { id: '2', code: 'HR', name: 'Human Resources', parentDepartmentName: 'Operations', status: 'INACTIVE' },
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
        <DepartmentListPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Information Technology')).toBeInTheDocument();
    expect(screen.getByText('Human Resources')).toBeInTheDocument();
    expect(screen.getByText('Operations')).toBeInTheDocument();

    // Now test empty state
    vi.spyOn(deptHooks, 'useDepartments').mockReturnValue({
      data: {
        items: [],
        totalItems: 0,
        pageIndex: 1,
        pageSize: 10,
        totalPages: 0,
      },
      isLoading: false,
    } as any);

    rerender(
      <QueryClientProvider client={queryClient}>
        <DepartmentListPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('No departments found')).toBeInTheDocument();
  });

  it('ReadOnlyUserCannotEdit', async () => {
    // User only has department.read permission
    mockUserWithPermissions(['department.read']);

    vi.spyOn(deptHooks, 'useDepartments').mockReturnValue({
      data: {
        items: [
          { id: '1', code: 'IT', name: 'Information Technology', parentDepartmentName: null, status: 'ACTIVE' },
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
        <DepartmentListPage />
      </QueryClientProvider>
    );

    // Read-only user should NOT see "Create Department" button
    expect(screen.queryByRole('button', { name: /Create Department/i })).not.toBeInTheDocument();
    // Read-only user should NOT see Edit or Archive action buttons
    expect(screen.queryByTitle('Edit')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Archive')).not.toBeInTheDocument();
  });

  it('ArchiveDepartmentRequiresConfirmation', async () => {
    mockUserWithPermissions();
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.spyOn(deptHooks, 'useDeleteDepartment').mockReturnValue({
      mutateAsync,
    } as any);

    vi.spyOn(deptHooks, 'useDepartments').mockReturnValue({
      data: {
        items: [
          { id: '1', code: 'IT', name: 'Information Technology', parentDepartmentName: null, status: 'ACTIVE' },
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
        <DepartmentListPage />
      </QueryClientProvider>
    );

    const archiveBtn = screen.getByTitle('Archive');
    fireEvent.click(archiveBtn);

    // Confirmation dialog should appear
    expect(screen.getByText(/Are you sure you want to archive/i)).toBeInTheDocument();
    const dialog = screen.getByRole('dialog');
    const confirmBtn = within(dialog).getByRole('button', { name: 'Archive' });
    expect(confirmBtn).toBeInTheDocument();

    // Confirm archive
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('1');
    });
  });

  it('CreateDepartmentShowsValidationAndRefreshesList', async () => {
    mockUserWithPermissions();
    const createMutateAsync = vi.fn().mockResolvedValue({ data: { data: { id: 'new-id' } } });
    vi.spyOn(deptHooks, 'useCreateDepartment').mockReturnValue({
      mutateAsync: createMutateAsync,
    } as any);

    vi.spyOn(deptHooks, 'useDepartments').mockReturnValue({
      data: { items: [], totalItems: 0, pageIndex: 1, pageSize: 10, totalPages: 0 },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <DepartmentListPage />
      </QueryClientProvider>
    );

    const createBtn = screen.getByRole('button', { name: /Create Department/i });
    fireEvent.click(createBtn);

    // Form dialog should be visible
    expect(screen.getByRole('heading', { name: 'Create Department' })).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveBtn);

    // Validation should trigger
    await waitFor(() => {
      expect(screen.getByText('Code is required')).toBeInTheDocument();
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    // Fill inputs
    const codeInput = screen.getByPlaceholderText('e.g. ENG');
    const nameInput = screen.getByPlaceholderText('e.g. Engineering');

    fireEvent.change(codeInput, { target: { value: 'ENG' } });
    fireEvent.change(nameInput, { target: { value: 'Engineering' } });

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith({
        code: 'ENG',
        name: 'Engineering',
        description: '',
        parentDepartmentId: undefined,
      });
    });
  });
});
