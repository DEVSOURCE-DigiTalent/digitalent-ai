import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { PositionListPage } from '../pages/PositionListPage';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import * as posHooks from '@/hooks/use-job-positions';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('PositionListPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const mockUserWithPermissions = (permissions: string[] = ['job_position.read', 'job_position.create_update', 'job_family.read', 'job_family.create_update']) => {
    useCurrentUser.setState({
      user: {
        id: 'user-1',
        email: 'hr@digitalent.ai',
        fullName: 'HR Manager',
        roles: [ROLES.OWNER],
        permissions,
      },
      isAuthenticated: true,
    });
  };

  it('PositionPageShowsServerRowsAndEmptyState', async () => {
    mockUserWithPermissions();

    vi.spyOn(posHooks, 'useJobPositions').mockReturnValue({
      data: {
        items: [
          { id: '1', code: 'SWE', name: 'Software Engineer', jobFamilyName: 'Engineering', status: 'ACTIVE' },
          { id: '2', code: 'PM', name: 'Product Manager', jobFamilyName: 'Product', status: 'INACTIVE' },
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
        <MemoryRouter><PositionListPage /></MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Product Manager')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();

    // Empty state
    vi.spyOn(posHooks, 'useJobPositions').mockReturnValue({
      data: { items: [], totalItems: 0, pageIndex: 1, pageSize: 10, totalPages: 0 },
      isLoading: false,
    } as any);

    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter><PositionListPage /></MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Chưa có vị trí công việc')).toBeInTheDocument();
  });

  it('ReadOnlyUserCannotEditPositions', async () => {
    mockUserWithPermissions(['job_position.read']);

    vi.spyOn(posHooks, 'useJobPositions').mockReturnValue({
      data: {
        items: [
          { id: '1', code: 'SWE', name: 'Software Engineer', jobFamilyName: null, status: 'ACTIVE' },
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
        <MemoryRouter><PositionListPage /></MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.queryByRole('button', { name: /Tạo vị trí/i })).not.toBeInTheDocument();
    expect(screen.queryByTitle('Sửa')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Lưu trữ')).not.toBeInTheDocument();
  });

  it('ArchivePositionRequiresConfirmation', async () => {
    mockUserWithPermissions();
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.spyOn(posHooks, 'useDeleteJobPosition').mockReturnValue({
      mutateAsync,
    } as any);

    vi.spyOn(posHooks, 'useJobPositions').mockReturnValue({
      data: {
        items: [
          { id: '1', code: 'SWE', name: 'Software Engineer', jobFamilyName: null, status: 'ACTIVE' },
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
        <MemoryRouter><PositionListPage /></MemoryRouter>
      </QueryClientProvider>
    );

    const archiveBtn = screen.getByTitle('Lưu trữ');
    fireEvent.click(archiveBtn);

    expect(screen.getByText(/ẩn khỏi danh sách đang dùng/i)).toBeInTheDocument();
    const dialog = screen.getByRole('dialog');
    const confirmBtn = within(dialog).getByRole('button', { name: 'Lưu trữ' });
    expect(confirmBtn).toBeInTheDocument();

    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('1');
    });
  });

  it('CreatePositionShowsValidationAndCallsApi', async () => {
    mockUserWithPermissions();
    const createMutateAsync = vi.fn().mockResolvedValue({ data: { data: { id: 'new-id' } } });
    vi.spyOn(posHooks, 'useCreateJobPosition').mockReturnValue({
      mutateAsync: createMutateAsync,
    } as any);

    vi.spyOn(posHooks, 'useJobPositions').mockReturnValue({
      data: { items: [], totalItems: 0, pageIndex: 1, pageSize: 10, totalPages: 0 },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter><PositionListPage /></MemoryRouter>
      </QueryClientProvider>
    );

    const createBtn = screen.getByRole('button', { name: /Tạo vị trí/i });
    fireEvent.click(createBtn);

    expect(screen.getByRole('heading', { name: 'Tạo vị trí công việc' })).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: 'Lưu' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('Vui lòng nhập mã')).toBeInTheDocument();
      expect(screen.getByText('Vui lòng nhập tên')).toBeInTheDocument();
    });

    const codeInput = screen.getByPlaceholderText('Ví dụ: KT-01');
    const nameInput = screen.getByPlaceholderText('Ví dụ: Kế toán viên');

    fireEvent.change(codeInput, { target: { value: 'QA-01' } });
    fireEvent.change(nameInput, { target: { value: 'Quality Assurance' } });

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'QA-01',
          name: 'Quality Assurance',
        }),
      );
    });
  });

  it('FilterByGradeAndDepartmentWorks', async () => {
    mockUserWithPermissions();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter><PositionListPage /></MemoryRouter>
      </QueryClientProvider>
    );

    // According to spec v2.1 OW-09, Job Family tab is removed in favor of Grade & Department filters
    expect(screen.getByLabelText('Lọc theo phòng ban')).toBeInTheDocument();
    expect(screen.getByLabelText('Lọc theo Cấp bậc')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Cấu hình Cấp bậc/i })).toHaveAttribute(
      'href',
      '/enterprise/positions/grades',
    );
  });
});
