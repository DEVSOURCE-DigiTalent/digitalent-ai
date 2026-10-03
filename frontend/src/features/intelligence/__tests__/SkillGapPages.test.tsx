import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import * as skillGapHooks from '@/hooks/use-skill-gaps';
import * as departmentHooks from '@/hooks/use-departments';
import * as positionHooks from '@/hooks/use-job-positions';
import type { SkillGapRunDetail } from '@/services/intelligence.service';
import { MyCompetencyProfilePage } from '@/features/employee/pages/MyCompetencyProfilePage';
import { SkillGapPage } from '../pages/SkillGapPage';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const run: SkillGapRunDetail = {
  runId: 'run-1',
  employeeId: 'emp-1',
  employeeCode: 'EMP-0004',
  employeeName: 'Employee',
  departmentName: 'Operations',
  jobPositionName: 'Data Analyst',
  requirementSetVersionNo: 1,
  generatedAt: '2026-09-29T08:00:00Z',
  generatedBy: 'USER_REQUEST',
  gapCount: 3,
  highCount: 2,
  coveragePercent: 47.5,
  requirementSetId: 'set-1',
  calculationVersion: 'SG-2.0',
  summary: {
    totalRequired: 5, totalMet: 2, totalGap: 3, highCount: 2, mediumCount: 0, lowCount: 1, coveragePercent: 47.5,
    config: { mandatoryMultiplier: 1.5 },
  },
  items: [
    { competencyId: 'c1', competencyCode: 'DATA_LITERACY', competencyName: 'Data literacy', categoryName: 'Digital core', requiredLevel: 3, currentLevel: 1, gapSteps: 2, weightPercent: 30, mandatory: true, mandatoryMultiplier: 1.5, priorityScore: 90, severity: 'HIGH' },
    { competencyId: 'c3', competencyCode: 'INFORMATION_SECURITY', competencyName: 'Information security', categoryName: 'Digital core', requiredLevel: 2, currentLevel: null, gapSteps: 2, weightPercent: 25, mandatory: true, mandatoryMultiplier: 1.5, priorityScore: 75, severity: 'HIGH' },
    { competencyId: 'c2', competencyCode: 'DIGITAL_COMMUNICATION', competencyName: 'Digital communication', categoryName: 'Digital core', requiredLevel: 2, currentLevel: 2, gapSteps: 0, weightPercent: 20, mandatory: false, mandatoryMultiplier: 1, priorityScore: 0, severity: null },
  ],
};

// Only the fields the pages read; cast keeps the tests focused on page behaviour.
const queryResult = (overrides: Record<string, unknown>) =>
  ({ data: undefined, isLoading: false, isError: false, refetch: vi.fn(), ...overrides }) as never;
const mutationResult = () => ({ mutateAsync: vi.fn(), isPending: false }) as never;

function renderWithClient(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

function loginAs(roles: string[], permissions: string[]) {
  useCurrentUser.setState({
    user: { id: 'u-1', email: 'u@digitalent.ai', fullName: 'User', roles, permissions },
    isAuthenticated: true,
  });
}

describe('MyCompetencyProfilePage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    loginAs([ROLES.EMPLOYEE], ['skill_gap.read']);
  });

  it('shows a skeleton while loading', () => {
    vi.spyOn(skillGapHooks, 'useMySkillGap').mockReturnValue(queryResult({ isLoading: true }));
    renderWithClient(<MyCompetencyProfilePage />);
    expect(screen.getByLabelText('Đang tải skill gap')).toBeInTheDocument();
  });

  it('explains how an analysis gets created when none exists', () => {
    vi.spyOn(skillGapHooks, 'useMySkillGap').mockReturnValue(queryResult({ data: null }));
    renderWithClient(<MyCompetencyProfilePage />);
    expect(screen.getByText('Chưa có phân tích skill gap')).toBeInTheDocument();
  });

  it('renders KPIs and gap lines of the latest snapshot', () => {
    vi.spyOn(skillGapHooks, 'useMySkillGap').mockReturnValue(queryResult({ data: run }));
    renderWithClient(<MyCompetencyProfilePage />);

    expect(screen.getByText('47.5%')).toBeInTheDocument();
    const table = within(screen.getByRole('table'));
    expect(table.getByText('Information security')).toBeInTheDocument();
    expect(table.getByText('Chưa xác nhận')).toBeInTheDocument();
    expect(table.getAllByText('Cao')).toHaveLength(2);
    expect(table.getByText('Đạt')).toBeInTheDocument();
  });

  it('offers a retry when loading fails', () => {
    const refetch = vi.fn();
    vi.spyOn(skillGapHooks, 'useMySkillGap').mockReturnValue(queryResult({ isError: true, refetch }));
    renderWithClient(<MyCompetencyProfilePage />);

    fireEvent.click(screen.getByText('Thử lại'));
    expect(refetch).toHaveBeenCalled();
  });

  it('tells a user without the skill gap permission that the analysis is not available, without calling the API', () => {
    loginAs([ROLES.EMPLOYEE], ['recommendation.read']);
    const useMySkillGap = vi.spyOn(skillGapHooks, 'useMySkillGap').mockReturnValue(queryResult({}));
    renderWithClient(<MyCompetencyProfilePage />);

    expect(screen.getByText('Vai trò của bạn không xem được phân tích skill gap')).toBeInTheDocument();
    expect(screen.queryByText('Chưa có phân tích skill gap')).not.toBeInTheDocument();
    expect(useMySkillGap).toHaveBeenCalledWith(false);
  });
});

describe('SkillGapPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(departmentHooks, 'useDepartments').mockReturnValue(queryResult({ data: { items: [{ id: 'd-1', name: 'Operations' }] } }));
    vi.spyOn(positionHooks, 'useJobPositions').mockReturnValue(queryResult({ data: { items: [{ id: 'p-1', name: 'Data Analyst' }] } }));
    vi.spyOn(skillGapHooks, 'useSkillGapRuns').mockReturnValue(queryResult({ data: { items: [run], totalItems: 1, pageIndex: 1, pageSize: 10, totalPages: 1 } }));
    vi.spyOn(skillGapHooks, 'useSkillGapRun').mockReturnValue(queryResult({ data: run }));
    vi.spyOn(skillGapHooks, 'useCalculateSkillGap').mockReturnValue(mutationResult());
    vi.spyOn(skillGapHooks, 'useCalculateSkillGapBatch').mockReturnValue(mutationResult());
  });

  it('lists snapshots and lets HR recalculate and filter by department', () => {
    loginAs([ROLES.OWNER], ['skill_gap.read', 'skill_gap.calculate', 'department.read']);
    renderWithClient(<SkillGapPage />);

    expect(screen.getByText('EMP-0004')).toBeInTheDocument();
    expect(screen.getByText('2 mức cao')).toBeInTheDocument();
    expect(screen.getByText('Tính lại tất cả')).toBeInTheDocument();
    expect(screen.getByLabelText('Phòng ban')).toBeInTheDocument();
  });

  it('hides recalculation and the department filter for a read-only department manager', () => {
    loginAs([ROLES.MANAGER], ['skill_gap.read', 'department.read']);
    renderWithClient(<SkillGapPage />);

    expect(screen.queryByText('Tính lại tất cả')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Phòng ban')).not.toBeInTheDocument();
  });

  it('opens the detail drawer when a row is clicked', () => {
    loginAs([ROLES.OWNER], ['skill_gap.read', 'skill_gap.calculate']);
    renderWithClient(<SkillGapPage />);

    fireEvent.click(screen.getByText('EMP-0004'));

    expect(screen.getByRole('dialog', { name: 'Chi tiết skill gap' })).toBeInTheDocument();
    expect(screen.getByText('Tính lại')).toBeInTheDocument();
  });
});
