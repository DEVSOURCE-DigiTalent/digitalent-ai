import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CompetencyFrameworkPage } from '../pages/CompetencyFrameworkPage';
import { CompetencyDetailPage } from '../pages/CompetencyDetailPage';
import { RequirementHistoryPage } from '../pages/RequirementHistoryPage';
import { PositionRequirementsPage } from '../pages/PositionRequirementsPage';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import * as compHooks from '@/hooks/use-competencies';
import * as posHooks from '@/hooks/use-job-positions';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('CompetencyFrameworkPage (read-only)', () => {
  let queryClient: QueryClient;

  const row = (overrides: Record<string, unknown> = {}) => ({
    id: 'c-1',
    categoryId: 'cat-1',
    categoryName: 'An toàn',
    categoryCode: 'TT02_D4',
    frameworkCode: '4.2',
    code: 'TT02-4.2',
    name: 'Bảo vệ dữ liệu cá nhân',
    description: 'Giữ an toàn dữ liệu cá nhân',
    competencyType: 'CORE_DIGITAL',
    status: 'ACTIVE',
    criteriaCount: 3,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    useCurrentUser.setState({
      user: { id: 'user-1', email: 'hr@digitalent.ai', fullName: 'HR', roles: [ROLES.OWNER], permissions: ['competency.read'] },
      isAuthenticated: true,
    });
  });

  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CompetencyFrameworkPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  it('lists the framework in Vietnamese and links each name to its detail page', () => {
    vi.spyOn(compHooks, 'useCompetencies').mockReturnValue({
      data: { items: [row(), row({ id: 'c-2', frameworkCode: null, name: 'Năng lực nội bộ', competencyType: 'INTERNAL' })], totalItems: 2, pageIndex: 1, pageSize: 10, totalPages: 1 },
      isLoading: false,
    } as any);

    renderPage();

    expect(screen.getByRole('link', { name: 'Bảo vệ dữ liệu cá nhân' })).toHaveAttribute('href', '/enterprise/framework/c-1');
    expect(screen.getByText('4.2')).toBeInTheDocument();
    expect(screen.getByText('Chưa ánh xạ')).toBeInTheDocument();
    expect(screen.getAllByText('3 tiêu chí')).toHaveLength(2);
  });

  it('offers no way to create, edit or archive a competency', () => {
    vi.spyOn(compHooks, 'useCompetencies').mockReturnValue({
      data: { items: [row()], totalItems: 1, pageIndex: 1, pageSize: 10, totalPages: 1 },
      isLoading: false,
    } as any);

    renderPage();

    expect(screen.queryByRole('button', { name: /tạo|thêm|create/i })).not.toBeInTheDocument();
    expect(screen.queryByTitle(/sửa|lưu trữ|edit|archive/i)).not.toBeInTheDocument();
  });

  it('explains an empty result', () => {
    vi.spyOn(compHooks, 'useCompetencies').mockReturnValue({
      data: { items: [], totalItems: 0, pageIndex: 1, pageSize: 10, totalPages: 0 },
      isLoading: false,
    } as any);

    renderPage();

    expect(screen.getByText('Không tìm thấy năng lực nào')).toBeInTheDocument();
  });
});

describe('CompetencyDetailPage', () => {
  const renderDetail = () =>
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter initialEntries={['/enterprise/framework/c-1']}>
          <Routes>
            <Route path="/enterprise/framework/:id" element={<CompetencyDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

  it('shows criteria per level, where the competency is required and how people stand', () => {
    vi.spyOn(compHooks, 'useCompetency').mockReturnValue({
      data: {
        id: 'c-1', code: 'TT02-4.2', name: 'Bảo vệ dữ liệu cá nhân', categoryName: 'An toàn', categoryCode: 'D4', competencyType: 'CORE_DIGITAL', status: 'ACTIVE',
        criteria: [
          { id: 'cr-1', level: 1, indicatorCode: '4.2-L1', behaviorIndicator: 'Nhận biết dữ liệu cá nhân' },
          { id: 'cr-2', level: 3, indicatorCode: '4.2-L3', behaviorIndicator: 'Thiết kế quy trình bảo vệ dữ liệu' },
        ],
      },
      isLoading: false,
    } as any);
    vi.spyOn(compHooks, 'useCompetencyUsage').mockReturnValue({
      data: {
        positions: [{ positionId: 'p-1', positionName: 'Kế toán', requiredLevel: 1, isMandatory: true, weightPercent: 5, employees: 3 }],
        courses: [{ id: 'k-1', code: 'SEC-F', title: 'An toàn dữ liệu', level: 1, assigned: 2 }],
        levelDistribution: { '0': 1, '1': 2, '2': 1, '3': 0 },
      },
      isLoading: false,
    } as any);

    renderDetail();

    expect(screen.getByRole('heading', { name: 'Bảo vệ dữ liệu cá nhân' })).toBeInTheDocument();
    expect(screen.getByText('Nhận biết dữ liệu cá nhân')).toBeInTheDocument();
    expect(screen.getByText('Thiết kế quy trình bảo vệ dữ liệu')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kế toán' })).toHaveAttribute('href', '/enterprise/positions/p-1');
    expect(screen.getByText('An toàn dữ liệu')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('says so when the competency does not exist', () => {
    vi.spyOn(compHooks, 'useCompetency').mockReturnValue({ data: undefined, isLoading: false, isError: true } as any);
    vi.spyOn(compHooks, 'useCompetencyUsage').mockReturnValue({ data: undefined, isLoading: false } as any);

    renderDetail();

    expect(screen.getByRole('alert')).toHaveTextContent('Không tìm thấy năng lực này.');
  });
});

describe('RequirementHistoryPage', () => {
  const item = (code: string, level: number, mandatory = false) => ({
    id: `i-${code}`, competencyId: `c-${code}`, competencyCode: `TT02-${code}`, competencyName: `NL ${code}`, competencyType: 'CORE_DIGITAL',
    categoryId: 'cat', categoryName: 'Miền', frameworkCode: code, requiredLevel: level, weightPercent: 10, isMandatory: mandatory, requiresPracticalEvidence: true,
  });
  const versions = [{ id: 'v2', versionNo: 2, status: 'ACTIVE' }, { id: 'v1', versionNo: 1, status: 'RETIRED' }];

  it('compares the newest version with the one before it', () => {
    vi.spyOn(posHooks, 'useJobPositions').mockReturnValue({ data: { items: [{ id: 'p-1', name: 'Kế toán', code: 'ACC' }] }, isLoading: false } as any);
    vi.spyOn(compHooks, 'usePositionRequirements').mockImplementation(((_id: string | undefined, versionNo?: number) => {
      const base = { id: 'x', jobPositionId: 'p-1', jobPositionCode: 'ACC', jobPositionName: 'Kế toán', versions };
      if (versionNo === 1) return { data: { ...base, versionNo: 1, status: 'RETIRED', items: [item('1.1', 1), item('2.1', 2), item('4.1', 1)] }, isLoading: false };
      if (versionNo === 2) return { data: { ...base, versionNo: 2, status: 'ACTIVE', items: [item('1.1', 3), item('3.1', 1), item('4.1', 1, true)] }, isLoading: false };
      return { data: { ...base, versionNo: 2, status: 'ACTIVE', items: [] }, isLoading: false };
    }) as any);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/enterprise/positions/requirements/history?positionId=p-1']}>
          <RequirementHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const table = within(screen.getByRole('table'));
    expect(table.getByText(/Tăng mức/)).toBeInTheDocument();
    expect(table.getByText(/Thêm mới/)).toBeInTheDocument();
    expect(table.getByText(/Bỏ khỏi yêu cầu/)).toBeInTheDocument();
    expect(table.getByText(/Đổi tính bắt buộc/)).toBeInTheDocument();
  });

  it('asks for a position first', () => {
    vi.spyOn(posHooks, 'useJobPositions').mockReturnValue({ data: { items: [] }, isLoading: false } as any);
    vi.spyOn(compHooks, 'usePositionRequirements').mockReturnValue({ data: undefined, isLoading: false } as any);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <RequirementHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Chọn một vị trí')).toBeInTheDocument();
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
        <MemoryRouter>
          <PositionRequirementsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    useCurrentUser.setState({
      user: {
        id: 'user-1', email: 'hr@digitalent.ai', fullName: 'HR Specialist', roles: [ROLES.OWNER],
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
    expect(screen.getByText('Đang áp dụng')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    DOMAINS.forEach((name) => expect(screen.getByText(name)).toBeInTheDocument());
    expect(screen.getAllByRole('spinbutton')).toHaveLength(24);
    expect(screen.queryByTitle('Remove item')).not.toBeInTheDocument();
    const level42 = screen.getByLabelText('Trình độ yêu cầu của 4.2 Competency 4.2');
    expect(within(level42).getByRole('option', { name: 'Trung cấp · bậc 3–4', selected: true })).toBeInTheDocument();
  });

  it('starts a position without requirements from a full 24-competency draft and saves it', async () => {
    const createDraft = vi.fn().mockResolvedValue({});
    vi.spyOn(compHooks, 'useCreateDraftPositionRequirements').mockReturnValue({ mutateAsync: createDraft } as any);
    mockSet({ id: undefined, jobPositionId: 'pos-1', versionNo: 0, status: '', items: [] });

    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Lưu bản nháp/i }));

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

    fireEvent.change(screen.getByLabelText(`Mức cho cả miền ${DOMAINS[0]}`), { target: { value: '3' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Áp mức cho cả miền' })[0]);

    ['1.1', '1.2', '1.3'].forEach((code) =>
      expect(screen.getByLabelText(`Trình độ yêu cầu của ${code} Competency ${code}`)).toHaveValue('3'));
    expect(screen.getByLabelText('Bắt buộc: 1.1 Competency 1.1')).toBeChecked();
    expect(screen.queryByText('Khác mức của miền')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Trình độ yêu cầu của 1.2 Competency 1.2'), { target: { value: '2' } });
    expect(screen.getByText('Khác mức của miền')).toBeInTheDocument();
  });

  it('lists the whole framework and shows unselected competencies as "Not required" (D-B7)', async () => {
    const createDraft = vi.fn().mockResolvedValue({});
    vi.spyOn(compHooks, 'useCreateDraftPositionRequirements').mockReturnValue({ mutateAsync: createDraft } as any);
    mockSet({ id: 'set-1', jobPositionId: 'pos-1', versionNo: 1, status: 'ACTIVE', items: serverItems(CODES.slice(0, 21)) });

    renderPage();

    expect(screen.getByText('21/24')).toBeInTheDocument();
    expect(screen.getAllByRole('spinbutton')).toHaveLength(24);
    expect(screen.getByLabelText('Trình độ yêu cầu của 6.2 Competency 6.2')).toHaveValue('0');
    expect(screen.getByLabelText('Trọng số của 6.2 Competency 6.2')).toBeDisabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Only the selected competencies are saved
    fireEvent.click(screen.getByRole('button', { name: /Lưu bản nháp/i }));
    await waitFor(() => expect(createDraft).toHaveBeenCalledTimes(1));
    expect(createDraft.mock.calls[0][0].items).toHaveLength(21);
  });

  it('blocks activation without the core safety competencies or with fewer than 9 competencies', () => {
    mockSet({
      id: 'set-1', jobPositionId: 'pos-1', versionNo: 2, status: 'DRAFT',
      items: serverItems(CODES.filter((c) => c.startsWith('1.') || c.startsWith('2.') || c === '4.1')),
    });
    renderPage();

    expect(screen.getByRole('alert')).toHaveTextContent('Còn thiếu: 4.2');
    expect(screen.getByRole('button', { name: /Kích hoạt phiên bản/i })).toBeDisabled();

    // dropping below 9 selected competencies adds the count message
    fireEvent.change(screen.getByLabelText(`Mức cho cả miền ${DOMAINS[1]}`), { target: { value: '0' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Áp mức cho cả miền' })[1]);

    expect(screen.getByText('4/24')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('cần từ 9 đến 24 năng lực');
  });

  it('asks for confirmation before activating', async () => {
    const activate = vi.fn().mockResolvedValue({});
    vi.spyOn(compHooks, 'useActivatePositionRequirements').mockReturnValue({ mutateAsync: activate } as any);
    mockSet({ id: 'set-2', jobPositionId: 'pos-1', versionNo: 2, status: 'DRAFT', items: serverItems(CODES) });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Kích hoạt phiên bản/i }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Kích hoạt phiên bản v2 cho Kế toán');
    expect(activate).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Kích hoạt' }));

    await waitFor(() => expect(activate).toHaveBeenCalledWith('set-2'));
  });

  const VERSIONS = [
    { id: 'set-2', versionNo: 2, status: 'DRAFT' },
    { id: 'set-1', versionNo: 1, status: 'ACTIVE' },
  ];

  it('lets HR open the draft that sits next to the active version', () => {
    const useRequirements = mockSet({
      id: 'set-1', jobPositionId: 'pos-1', versionNo: 1, status: 'ACTIVE', items: serverItems(CODES), versions: VERSIONS,
    });
    renderPage();

    const versionSelect = screen.getByLabelText('Phiên bản');
    expect(versionSelect).toHaveValue('1');
    expect(within(versionSelect).getByRole('option', { name: 'v2 · Bản nháp' })).toBeInTheDocument();
    fireEvent.change(versionSelect, { target: { value: '2' } });

    expect(useRequirements).toHaveBeenLastCalledWith('pos-1', 2);
  });

  it('opens the new draft after saving changes made on the active version', async () => {
    const createDraft = vi.fn().mockResolvedValue({ data: { data: { id: 'set-2', versionNo: 2, status: 'DRAFT' } } });
    vi.spyOn(compHooks, 'useCreateDraftPositionRequirements').mockReturnValue({ mutateAsync: createDraft } as any);
    const useRequirements = mockSet({
      id: 'set-1', jobPositionId: 'pos-1', versionNo: 1, status: 'ACTIVE', items: serverItems(CODES),
      versions: [VERSIONS[1]],
    });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Lưu bản nháp/i }));

    await waitFor(() => expect(useRequirements).toHaveBeenLastCalledWith('pos-1', 2));
  });
});
