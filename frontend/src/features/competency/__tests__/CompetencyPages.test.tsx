import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CompetencyFrameworkPage } from '../pages/CompetencyFrameworkPage';
import { PositionRequirementsPage } from '../pages/PositionRequirementsPage';
import { useCurrentUser } from '@/hooks/use-current-user';
import * as compHooks from '@/hooks/use-competencies';
import * as posHooks from '@/hooks/use-job-positions';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('CompetencyFrameworkPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const mockUserWithPermissions = (
    permissions: string[] = ['competency.read', 'competency.create_update', 'competency.manage']
  ) => {
    useCurrentUser.setState({
      user: {
        id: 'user-1',
        email: 'hr@digitalent.ai',
        fullName: 'HR Specialist',
        roles: ['HR_MANAGER'],
        permissions,
      },
      isAuthenticated: true,
    });
  };

  it('CompetencyFrameworkPageShowsServerRowsAndEmptyState', async () => {
    mockUserWithPermissions();

    vi.spyOn(compHooks, 'useCompetencies').mockReturnValue({
      data: {
        items: [
          {
            id: 'c-1',
            categoryId: 'cat-1',
            categoryName: 'Cloud & DevOps',
            categoryCode: 'COD',
            frameworkCode: '4.2',
            code: 'DIG-01',
            name: 'Cloud Computing Fundamentals',
            description: 'Core concepts of cloud services',
            competencyType: 'CORE_DIGITAL',
            status: 'ACTIVE',
            criteriaCount: 3,
          },
          {
            id: 'c-2',
            categoryId: 'cat-2',
            categoryName: 'Engineering',
            categoryCode: 'ENG',
            code: 'PRO-01',
            name: 'Backend Architecture',
            description: 'Distributed systems design',
            competencyType: 'PROFESSIONAL',
            status: 'DRAFT',
            criteriaCount: 2,
          },
        ],
        totalItems: 2,
        pageIndex: 1,
        pageSize: 10,
        totalPages: 1,
      },
      isLoading: false,
    } as any);

    vi.spyOn(compHooks, 'useCompetency').mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <CompetencyFrameworkPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('DIG-01')).toBeInTheDocument();
    expect(screen.getByText('Cloud Computing Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Cloud & DevOps')).toBeInTheDocument();
    expect(screen.getByText('3 criteria')).toBeInTheDocument();
    expect(screen.getByText('4.2')).toBeInTheDocument();
    expect(screen.getByText('Not mapped')).toBeInTheDocument();

    expect(screen.getByText('PRO-01')).toBeInTheDocument();
    expect(screen.getByText('Backend Architecture')).toBeInTheDocument();

    // Now test empty state
    vi.spyOn(compHooks, 'useCompetencies').mockReturnValue({
      data: { items: [], totalItems: 0, pageIndex: 1, pageSize: 10, totalPages: 0 },
      isLoading: false,
    } as any);

    rerender(
      <QueryClientProvider client={queryClient}>
        <CompetencyFrameworkPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('No competencies found')).toBeInTheDocument();
  });

  it('ReadOnlyUserCannotCreateOrEditCompetencies', async () => {
    mockUserWithPermissions(['competency.read']);

    vi.spyOn(compHooks, 'useCompetencies').mockReturnValue({
      data: {
        items: [
          {
            id: 'c-1',
            categoryId: 'cat-1',
            categoryName: 'Cloud',
            categoryCode: 'COD',
            code: 'DIG-01',
            name: 'Cloud Computing Fundamentals',
            competencyType: 'CORE_DIGITAL',
            status: 'ACTIVE',
            criteriaCount: 3,
          },
        ],
        totalItems: 1,
        pageIndex: 1,
        pageSize: 10,
        totalPages: 1,
      },
      isLoading: false,
    } as any);

    vi.spyOn(compHooks, 'useCompetency').mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <CompetencyFrameworkPage />
      </QueryClientProvider>
    );

    expect(screen.queryByRole('button', { name: /Create Competency/i })).not.toBeInTheDocument();
    expect(screen.queryByTitle('Edit')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Archive')).not.toBeInTheDocument();
    // Viewing criteria should still be allowed
    expect(screen.getByTitle('View Criteria')).toBeInTheDocument();
  });

  it('ViewCompetencyCriteriaModalDisplaysLevels', async () => {
    mockUserWithPermissions();

    vi.spyOn(compHooks, 'useCompetencies').mockReturnValue({
      data: {
        items: [
          {
            id: 'c-1',
            categoryId: 'cat-1',
            categoryName: 'Cloud',
            categoryCode: 'COD',
            code: 'DIG-01',
            name: 'Cloud Computing Fundamentals',
            competencyType: 'CORE_DIGITAL',
            status: 'ACTIVE',
            criteriaCount: 3,
          },
        ],
        totalItems: 1,
        pageIndex: 1,
        pageSize: 10,
        totalPages: 1,
      },
      isLoading: false,
    } as any);

    vi.spyOn(compHooks, 'useCompetency').mockReturnValue({
      data: {
        id: 'c-1',
        code: 'DIG-01',
        name: 'Cloud Computing Fundamentals',
        competencyType: 'CORE_DIGITAL',
        criteria: [
          {
            id: 'cr-1',
            level: 1,
            indicatorCode: 'DIG-01-L1',
            behaviorIndicator: 'Understands basic cloud models (IaaS, PaaS, SaaS)',
            assessmentGuidance: 'Knowledge quiz',
            sortOrder: 1,
          },
          {
            id: 'cr-2',
            level: 2,
            indicatorCode: 'DIG-01-L2',
            behaviorIndicator: 'Deploys services onto cloud platforms',
            assessmentGuidance: 'Hands-on lab',
            sortOrder: 2,
          },
        ],
      },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <CompetencyFrameworkPage />
      </QueryClientProvider>
    );

    const viewBtn = screen.getByTitle('View Criteria');
    fireEvent.click(viewBtn);

    expect(screen.getByText('Understands basic cloud models (IaaS, PaaS, SaaS)')).toBeInTheDocument();
    expect(screen.getByText('Deploys services onto cloud platforms')).toBeInTheDocument();
    expect(screen.getByText('[DIG-01-L1]')).toBeInTheDocument();
    expect(screen.getByText('[DIG-01-L2]')).toBeInTheDocument();
  });

  it('CreateCompetencyShowsModalAndCallsApi', async () => {
    mockUserWithPermissions();
    const createMutateAsync = vi.fn().mockResolvedValue({ data: { data: { id: 'new-comp-id' } } });
    vi.spyOn(compHooks, 'useCreateCompetency').mockReturnValue({
      mutateAsync: createMutateAsync,
    } as any);

    vi.spyOn(compHooks, 'useCompetencies').mockReturnValue({
      data: { items: [], totalItems: 0, pageIndex: 1, pageSize: 10, totalPages: 0 },
      isLoading: false,
    } as any);

    vi.spyOn(compHooks, 'useCompetency').mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <CompetencyFrameworkPage />
      </QueryClientProvider>
    );

    const createBtn = screen.getByRole('button', { name: /Create Competency/i });
    fireEvent.click(createBtn);

    expect(screen.getByRole('heading', { name: 'Create Competency' })).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('Code is required')).toBeInTheDocument();
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    const codeInput = screen.getByPlaceholderText('e.g. DIG-01');
    const nameInput = screen.getByPlaceholderText('e.g. Cloud Architecture');

    fireEvent.change(codeInput, { target: { value: 'AI-01' } });
    fireEvent.change(nameInput, { target: { value: 'Artificial Intelligence Basics' } });

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'AI-01',
          name: 'Artificial Intelligence Basics',
          competencyType: 'CORE_DIGITAL',
        })
      );
    });
  });

  it('ArchiveCompetencyRequiresConfirmation', async () => {
    mockUserWithPermissions();
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.spyOn(compHooks, 'useArchiveCompetency').mockReturnValue({
      mutateAsync,
    } as any);

    vi.spyOn(compHooks, 'useCompetencies').mockReturnValue({
      data: {
        items: [
          {
            id: 'c-1',
            code: 'DIG-01',
            name: 'Cloud Computing Fundamentals',
            categoryName: 'Cloud',
            competencyType: 'CORE_DIGITAL',
            status: 'ACTIVE',
            criteriaCount: 1,
          },
        ],
        totalItems: 1,
        pageIndex: 1,
        pageSize: 10,
        totalPages: 1,
      },
      isLoading: false,
    } as any);

    vi.spyOn(compHooks, 'useCompetency').mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <CompetencyFrameworkPage />
      </QueryClientProvider>
    );

    const archiveBtn = screen.getByTitle('Archive');
    fireEvent.click(archiveBtn);

    expect(screen.getByText(/Are you sure you want to archive/i)).toBeInTheDocument();
    const dialog = screen.getByRole('dialog');
    const confirmBtn = within(dialog).getByRole('button', { name: 'Archive' });

    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('c-1');
    });
  });
});

describe('PositionRequirementsPage', () => {
  let queryClient: QueryClient;

  const CODES = ['1.1', '1.2', '1.3', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '3.1', '3.2', '3.3', '3.4',
    '4.1', '4.2', '4.3', '4.4', '5.1', '5.2', '5.3', '5.4', '6.1', '6.2', '6.3'];
  const DOMAINS = ['1. Khai thác dữ liệu và thông tin', '2. Giao tiếp và hợp tác', '3. Sáng tạo nội dung số',
    '4. An toàn', '5. Giải quyết vấn đề', '6. Ứng dụng trí tuệ nhân tạo'];
  const competency = (code: string) => {
    const domain = Number(code.split('.')[0]);
    return {
      id: `c-${code}`, code: `TT02-${code}`, name: `Competency ${code}`, frameworkCode: code,
      categoryId: `cat-${domain}`, categoryName: DOMAINS[domain - 1], categoryCode: `TT02_D${domain}`,
      categorySortOrder: domain, status: 'ACTIVE', competencyType: 'CORE_DIGITAL', criteriaCount: 3,
    };
  };
  const serverItems = (codes: string[]) => codes.map((code, i) => ({
    ...competency(code),
    id: `item-${code}`,
    competencyId: `c-${code}`,
    competencyCode: `TT02-${code}`,
    competencyName: `Competency ${code}`,
    requiredLevel: 2,
    weightPercent: i < codes.length - 1 ? 4.17 : Math.round((100 - 4.17 * (codes.length - 1)) * 100) / 100,
    isMandatory: code.startsWith('4.'),
    requiresPracticalEvidence: true,
  }));
  const mockSet = (data: Record<string, unknown>) =>
    vi.spyOn(compHooks, 'usePositionRequirements').mockReturnValue({ data, isLoading: false } as any);
  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <PositionRequirementsPage />
      </QueryClientProvider>
    );

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    useCurrentUser.setState({
      user: {
        id: 'user-1', email: 'hr@digitalent.ai', fullName: 'HR Specialist', roles: ['HR_MANAGER'],
        permissions: ['position_requirement.read', 'position_requirement.create_update', 'position_requirement.manage'],
      },
      isAuthenticated: true,
    });
    vi.spyOn(posHooks, 'useJobPositions').mockReturnValue({
      data: { items: [{ id: 'pos-1', code: 'ACCOUNTANT', name: 'Kế toán', status: 'ACTIVE' }], totalItems: 1, pageIndex: 1, pageSize: 100, totalPages: 1 },
      isLoading: false,
    } as any);
    vi.spyOn(compHooks, 'useCompetencies').mockReturnValue({
      data: { items: CODES.map(competency), totalItems: 24, pageIndex: 1, pageSize: 100, totalPages: 1 },
      isLoading: false,
    } as any);
  });

  it('groups a saved set by the 6 domains without any remove button', () => {
    mockSet({ id: 'set-1', jobPositionId: 'pos-1', versionNo: 1, status: 'ACTIVE', items: serverItems(CODES) });

    renderPage();

    expect(screen.getByText('v1')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    DOMAINS.forEach((name) => expect(screen.getByText(name)).toBeInTheDocument());
    expect(screen.getAllByRole('spinbutton')).toHaveLength(24);
    expect(screen.queryByTitle('Remove item')).not.toBeInTheDocument();
    const level42 = screen.getByLabelText('Required level for 4.2 Competency 4.2');
    expect(within(level42).getByRole('option', { name: 'Intermediate · TT02 tiers 3–4', selected: true })).toBeInTheDocument();
  });

  it('starts a position without requirements from a full 24-competency draft and saves it', async () => {
    const createDraft = vi.fn().mockResolvedValue({});
    vi.spyOn(compHooks, 'useCreateDraftPositionRequirements').mockReturnValue({ mutateAsync: createDraft } as any);
    mockSet({ id: undefined, jobPositionId: 'pos-1', versionNo: 0, status: '', items: [] });

    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Save Draft/i }));

    await waitFor(() => expect(createDraft).toHaveBeenCalledTimes(1));
    const payload = createDraft.mock.calls[0][0];
    expect(payload.jobPositionId).toBe('pos-1');
    expect(payload.items).toHaveLength(24);
    const total = payload.items.reduce((sum: number, i: { weightPercent: number }) => sum + i.weightPercent, 0);
    expect(Math.round(total * 100) / 100).toBe(100);
  });

  it('applies a level to a whole domain and flags a line that differs', () => {
    mockSet({ id: 'set-1', jobPositionId: 'pos-1', versionNo: 2, status: 'DRAFT', items: serverItems(CODES) });
    renderPage();

    fireEvent.change(screen.getByLabelText(`Domain level for ${DOMAINS[0]}`), { target: { value: '3' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Apply level to domain' })[0]);

    ['1.1', '1.2', '1.3'].forEach((code) =>
      expect(screen.getByLabelText(`Required level for ${code} Competency ${code}`)).toHaveValue('3'));
    expect(screen.getByLabelText('Mandatory: 1.1 Competency 1.1')).toBeChecked();
    expect(screen.queryByText('Differs from domain level')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Required level for 1.2 Competency 1.2'), { target: { value: '2' } });
    expect(screen.getByText('Differs from domain level')).toBeInTheDocument();
  });

  it('shows the missing Circular codes and blocks activation', () => {
    mockSet({ id: 'set-1', jobPositionId: 'pos-1', versionNo: 2, status: 'DRAFT', items: serverItems(CODES.slice(0, 21)) });

    renderPage();

    expect(screen.getByRole('alert')).toHaveTextContent('Missing: 6.1, 6.2, 6.3');
    expect(screen.getByRole('button', { name: /Activate Version/i })).toBeDisabled();
  });

  it('asks for confirmation before activating', async () => {
    const activate = vi.fn().mockResolvedValue({});
    vi.spyOn(compHooks, 'useActivatePositionRequirements').mockReturnValue({ mutateAsync: activate } as any);
    mockSet({ id: 'set-2', jobPositionId: 'pos-1', versionNo: 2, status: 'DRAFT', items: serverItems(CODES) });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Activate Version/i }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Activate version v2 for Kế toán');
    expect(activate).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Activate' }));

    await waitFor(() => expect(activate).toHaveBeenCalledWith('set-2'));
  });
});
