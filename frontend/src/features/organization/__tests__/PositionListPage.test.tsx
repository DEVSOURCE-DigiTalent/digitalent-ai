import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PositionListPage } from '../pages/PositionListPage';
import { useCurrentUser } from '@/hooks/use-current-user';
import * as posHooks from '@/hooks/use-job-positions';
import * as famHooks from '@/hooks/use-job-families';

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
        roles: ['HR_MANAGER'],
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
        <PositionListPage />
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
        <PositionListPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('No job positions found')).toBeInTheDocument();
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
        <PositionListPage />
      </QueryClientProvider>
    );

    expect(screen.queryByRole('button', { name: /Create Position/i })).not.toBeInTheDocument();
    expect(screen.queryByTitle('Edit')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Archive')).not.toBeInTheDocument();
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
        <PositionListPage />
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
        <PositionListPage />
      </QueryClientProvider>
    );

    const createBtn = screen.getByRole('button', { name: /Create Position/i });
    fireEvent.click(createBtn);

    expect(screen.getByRole('heading', { name: 'Create Job Position' })).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('Code is required')).toBeInTheDocument();
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    const codeInput = screen.getByPlaceholderText('e.g. SWE-01');
    const nameInput = screen.getByPlaceholderText('e.g. Software Engineer');

    fireEvent.change(codeInput, { target: { value: 'QA-01' } });
    fireEvent.change(nameInput, { target: { value: 'Quality Assurance' } });

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith({
        code: 'QA-01',
        name: 'Quality Assurance',
        description: '',
        jobFamilyId: undefined,
      });
    });
  });

  it('JobFamiliesTabSwitchesAndDisplaysFamilies', async () => {
    mockUserWithPermissions();

    vi.spyOn(famHooks, 'useJobFamilies').mockReturnValue({
      data: {
        items: [
          { id: 'f1', code: 'TECH', name: 'Technology', description: 'Tech jobs', status: 'ACTIVE', createdAt: '' },
        ],
        totalItems: 1,
        pageIndex: 1,
        pageSize: 10,
      },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <PositionListPage />
      </QueryClientProvider>
    );

    const familiesTab = screen.getByRole('button', { name: /Job Families/i });
    fireEvent.click(familiesTab);

    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('TECH')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Job Family/i })).toBeInTheDocument();
  });
});
