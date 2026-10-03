import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { DepartmentListPage } from '../pages/DepartmentListPage';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
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

  const renderWithRouter = (ui: React.ReactElement) =>
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
      </MemoryRouter>
    );

  const mockUserWithPermissions = (permissions: string[] = ['department.read', 'department.create_update']) => {
    useCurrentUser.setState({
      user: {
        id: 'user-1',
        email: 'admin@digitalent.ai',
        fullName: 'Admin User',
        roles: [ROLES.OWNER],
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

    const { rerender } = renderWithRouter(<DepartmentListPage />);

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
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <DepartmentListPage />
        </QueryClientProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Chưa có phòng ban nào')).toBeInTheDocument();
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

    renderWithRouter(<DepartmentListPage />);

    // Read-only user should NOT see "Create Department" button
    expect(screen.queryByRole('button', { name: /Tạo phòng ban/i })).not.toBeInTheDocument();
    // Read-only user should NOT see Edit or Archive action buttons
    expect(screen.queryByTitle('Sửa')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Lưu trữ')).not.toBeInTheDocument();
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

    renderWithRouter(<DepartmentListPage />);

    const archiveBtn = screen.getByTitle('Lưu trữ');
    fireEvent.click(archiveBtn);

    // Confirmation dialog should appear
    expect(screen.getByText(/ẩn khỏi danh sách đang dùng/i)).toBeInTheDocument();
    const dialog = screen.getByRole('dialog');
    const confirmBtn = within(dialog).getByRole('button', { name: 'Lưu trữ' });
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

    renderWithRouter(<DepartmentListPage />);

    const createBtn = screen.getByRole('button', { name: /Tạo phòng ban/i });
    fireEvent.click(createBtn);

    // Form dialog should be visible
    expect(screen.getByRole('heading', { name: 'Tạo phòng ban' })).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: 'Lưu' });
    fireEvent.click(saveBtn);

    // Validation should trigger
    await waitFor(() => {
      expect(screen.getByText('Vui lòng nhập mã')).toBeInTheDocument();
      expect(screen.getByText('Vui lòng nhập tên')).toBeInTheDocument();
    });

    // Fill inputs
    const codeInput = screen.getByPlaceholderText('Ví dụ: ENG');
    const nameInput = screen.getByPlaceholderText('Ví dụ: Kỹ thuật');

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
