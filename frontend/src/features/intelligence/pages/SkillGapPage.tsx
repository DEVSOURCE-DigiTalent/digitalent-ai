import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, PageHeader, type Column } from '@/components/shared';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { useCalculateSkillGap, useCalculateSkillGapBatch, useSkillGapRuns } from '@/hooks/use-skill-gaps';
import { skillGapErrorMessage } from '@/lib/competency-levels';
import type { CalculateSkillGapBatchResult, SkillGapRunListItem } from '@/services/intelligence.service';
import { BatchResultPanel } from '../components/BatchResultPanel';
import { SkillGapDetailDrawer } from '../components/SkillGapDetailDrawer';

const SELECT_CLASS =
  'px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

/**
 * Team Skill Gap (S3-T016): latest snapshot per employee in the caller's scope,
 * sorted by number of gaps. HR sees the organization, department managers their department.
 */
export function SkillGapPage() {
  const { can, is } = usePermission();
  const canCalculate = can(PERMISSIONS.SKILL_GAP_CALCULATE);
  // Department managers are scoped to their own department by the API — no department filter for them.
  const showDepartmentFilter = !is('DEPARTMENT_MANAGER') && can(PERMISSIONS.DEPARTMENT_READ);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [jobPositionId, setJobPositionId] = useState('');
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [batchResult, setBatchResult] = useState<CalculateSkillGapBatchResult | null>(null);

  const { data: departments } = useDepartments({ pageSize: 100 });
  const { data: positions } = useJobPositions({ pageSize: 100 });
  const { data, isLoading, isError } = useSkillGapRuns({
    pageIndex: page,
    pageSize,
    search: search.trim() || undefined,
    departmentId: departmentId || undefined,
    jobPositionId: jobPositionId || undefined,
  });
  const calculateMutation = useCalculateSkillGap();
  const batchMutation = useCalculateSkillGapBatch();

  const handleRecalculate = async (employeeId: string) => {
    try {
      const run = await calculateMutation.mutateAsync({ employeeId });
      setSelectedRunId(run.runId);
      toast.success(`Skill gap recalculated for ${run.employeeName}`);
    } catch (error) {
      toast.error(skillGapErrorMessage(error, 'Failed to recalculate skill gap'));
    }
  };

  const handleRecalculateAll = async () => {
    try {
      const result = await batchMutation.mutateAsync({
        departmentId: departmentId || undefined,
        jobPositionId: jobPositionId || undefined,
      });
      setBatchResult(result);
      toast.success(`Skill gap calculated for ${result.calculatedCount} employee(s)`);
    } catch (error) {
      toast.error(skillGapErrorMessage(error, 'Failed to recalculate skill gaps'));
    }
  };

  const columns: Column<SkillGapRunListItem>[] = [
    {
      key: 'employee',
      header: 'Employee',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.employeeName}</div>
          <div className="text-xs text-slate-500">{row.employeeCode}</div>
        </div>
      ),
    },
    { key: 'department', header: 'Department', cell: (row) => row.departmentName ?? '-' },
    { key: 'position', header: 'Position', cell: (row) => row.jobPositionName ?? '-' },
    {
      key: 'gaps',
      header: 'Gaps',
      cell: (row) => (
        <span className="tabular-nums">
          {row.gapCount}
          {row.highCount > 0 && <span className="ml-2 text-xs font-medium text-danger-600">{row.highCount} high</span>}
        </span>
      ),
    },
    {
      key: 'coverage',
      header: 'Coverage',
      cell: (row) => <span className="tabular-nums">{row.coveragePercent.toFixed(1)}%</span>,
    },
    {
      key: 'generatedAt',
      header: 'Calculated',
      hideOnMobile: true,
      cell: (row) => <span className="text-xs text-slate-500">{new Date(row.generatedAt).toLocaleString()}</span>,
    },
  ];

  const filters = (
    <div className="flex flex-wrap items-center gap-3">
      {showDepartmentFilter && (
        <select
          aria-label="Department"
          value={departmentId}
          onChange={(e) => {
            setDepartmentId(e.target.value);
            setPage(1);
          }}
          className={SELECT_CLASS}
        >
          <option value="">All Departments</option>
          {departments?.items?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      )}
      <select
        aria-label="Position"
        value={jobPositionId}
        onChange={(e) => {
          setJobPositionId(e.target.value);
          setPage(1);
        }}
        className={SELECT_CLASS}
      >
        <option value="">All Positions</option>
        {positions?.items?.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );

  const recalculateAllButton = canCalculate && (
    <button
      type="button"
      onClick={handleRecalculateAll}
      disabled={batchMutation.isPending}
      className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:opacity-50"
    >
      <RefreshCw className={batchMutation.isPending ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
      Recalculate all
    </button>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Skill Gap Analysis" subtitle="Latest competency gaps per employee against their position standard">
        {recalculateAllButton}
      </PageHeader>

      {batchResult && <BatchResultPanel result={batchResult} onDismiss={() => setBatchResult(null)} />}

      {isError && (
        <p role="alert" className="text-sm text-danger-600">
          Could not load skill gap analyses. Please refresh the page.
        </p>
      )}

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        keyExtractor={(row) => row.runId}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search employee name or code..."
        filters={filters}
        onRowClick={(row) => setSelectedRunId(row.runId)}
        emptyTitle="No skill gap analysis yet"
        emptyDescription={
          canCalculate
            ? 'Run the analysis to compare employees with their position standards.'
            : 'Analyses appear here once HR or your manager runs them.'
        }
        emptyAction={recalculateAllButton || undefined}
        pageInfo={{
          page,
          pageSize,
          total: data?.totalItems ?? 0,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {selectedRunId && (
        <SkillGapDetailDrawer
          runId={selectedRunId}
          onClose={() => setSelectedRunId(null)}
          canRecalculate={canCalculate}
          isRecalculating={calculateMutation.isPending}
          onRecalculate={handleRecalculate}
        />
      )}
    </div>
  );
}
