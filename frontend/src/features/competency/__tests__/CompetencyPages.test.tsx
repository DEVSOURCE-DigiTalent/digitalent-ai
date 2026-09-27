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

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    vi.spyOn(posHooks, 'useJobPositions').mockReturnValue({
      data: {
        items: [
          { id: 'pos-1', code: 'SWE', name: 'Software Engineer', status: 'ACTIVE' },
          { id: 'pos-2', code: 'DEV', name: 'DevOps Engineer', status: 'ACTIVE' },
        ],
        totalItems: 2,
        pageIndex: 1,
        pageSize: 100,
        totalPages: 1,
      },
      isLoading: false,
    } as any);

    vi.spyOn(compHooks, 'useCompetencies').mockReturnValue({
      data: {
        items: [
          { id: 'c-1', code: 'DIG-01', name: 'Cloud Computing', status: 'ACTIVE' },
          { id: 'c-2', code: 'PRO-01', name: 'Clean Architecture', status: 'ACTIVE' },
        ],
        totalItems: 2,
        pageIndex: 1,
        pageSize: 100,
        totalPages: 1,
      },
      isLoading: false,
    } as any);
  });

  const mockUserWithPermissions = (
    permissions: string[] = ['position_requirement.read', 'position_requirement.create_update', 'position_requirement.manage']
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

  it('PositionRequirementsPageRendersPositionAndItems', async () => {
    mockUserWithPermissions();

    vi.spyOn(compHooks, 'usePositionRequirements').mockReturnValue({
      data: {
        id: 'req-set-1',
        jobPositionId: 'pos-1',
        jobPositionCode: 'SWE',
        jobPositionName: 'Software Engineer',
        versionNo: 1,
        status: 'ACTIVE',
        items: [
          {
            id: 'item-1',
            competencyId: 'c-1',
            competencyCode: 'DIG-01',
            competencyName: 'Cloud Computing',
            requiredLevel: 2,
            weightPercent: 60,
            isMandatory: true,
            requiresPracticalEvidence: true,
            note: 'AWS or Azure',
          },
          {
            id: 'item-2',
            competencyId: 'c-2',
            competencyCode: 'PRO-01',
            competencyName: 'Clean Architecture',
            requiredLevel: 3,
            weightPercent: 40,
            isMandatory: false,
            requiresPracticalEvidence: true,
            note: 'Domain driven design',
          },
        ],
      },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <PositionRequirementsPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('v1')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();

    const weightInputs = screen.getAllByRole('spinbutton');
    expect(weightInputs.length).toBe(2);
    expect(weightInputs[0]).toHaveValue(60);
    expect(weightInputs[1]).toHaveValue(40);
  });

  it('PositionRequirementsEditorAllowsAddingItemAndSaveDraft', async () => {
    mockUserWithPermissions();
    const createDraftMutateAsync = vi.fn().mockResolvedValue({
      data: { data: { id: 'new-set', versionNo: 1, status: 'DRAFT' } },
    });
    vi.spyOn(compHooks, 'useCreateDraftPositionRequirements').mockReturnValue({
      mutateAsync: createDraftMutateAsync,
    } as any);

    vi.spyOn(compHooks, 'usePositionRequirements').mockReturnValue({
      data: {
        id: undefined,
        jobPositionId: 'pos-1',
        jobPositionCode: 'SWE',
        jobPositionName: 'Software Engineer',
        versionNo: 0,
        status: '',
        items: [],
      },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <PositionRequirementsPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('No competency requirements mapped')).toBeInTheDocument();

    // Click "Add First Competency"
    const addBtn = screen.getByRole('button', { name: /Add First Competency/i });
    fireEvent.click(addBtn);

    // Now table should show 1 row
    expect(screen.getByText('Required Competency Matrix')).toBeInTheDocument();
    const saveDraftBtn = screen.getByRole('button', { name: /Save Draft/i });
    expect(saveDraftBtn).toBeInTheDocument();

    fireEvent.click(saveDraftBtn);

    await waitFor(() => {
      expect(createDraftMutateAsync).toHaveBeenCalledWith({
        jobPositionId: 'pos-1',
        items: [
          expect.objectContaining({
            competencyId: 'c-1',
            requiredLevel: 2,
            weightPercent: 20,
            isMandatory: true,
            requiresPracticalEvidence: true,
          }),
        ],
      });
    });
  });

  it('ActivateVersionCallsMutationWhenValid', async () => {
    mockUserWithPermissions();
    const activateMutateAsync = vi.fn().mockResolvedValue({
      data: { data: { id: 'req-draft-1', versionNo: 2, status: 'ACTIVE' } },
    });
    vi.spyOn(compHooks, 'useActivatePositionRequirements').mockReturnValue({
      mutateAsync: activateMutateAsync,
    } as any);

    vi.spyOn(compHooks, 'usePositionRequirements').mockReturnValue({
      data: {
        id: 'req-draft-1',
        jobPositionId: 'pos-1',
        jobPositionCode: 'SWE',
        jobPositionName: 'Software Engineer',
        versionNo: 2,
        status: 'DRAFT',
        items: [
          {
            id: 'item-1',
            competencyId: 'c-1',
            competencyCode: 'DIG-01',
            competencyName: 'Cloud Computing',
            requiredLevel: 2,
            weightPercent: 100,
            isMandatory: true,
            requiresPracticalEvidence: true,
          },
        ],
      },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <PositionRequirementsPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('DRAFT')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();

    const activateBtn = screen.getByRole('button', { name: /Activate Version/i });
    expect(activateBtn).toBeEnabled();

    fireEvent.click(activateBtn);

    await waitFor(() => {
      expect(activateMutateAsync).toHaveBeenCalledWith('req-draft-1');
    });
  });
});
