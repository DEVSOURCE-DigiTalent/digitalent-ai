import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, PageHeader, type Column } from '@/components/shared';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { useCalculateSkillGap, useCalculateSkillGapBatch, useLatestRunLookup, useSkillGapRuns } from '@/hooks/use-skill-gaps';
import { skillGapErrorMessage } from '@/lib/competency-levels';
import { formatDateTime } from '@/lib/utils';
import { ROLES } from '@/lib/roles';
import type { CalculateSkillGapBatchResult, SkillGapRunListItem } from '@/services/intelligence.service';
import { BatchResultPanel } from '../components/BatchResultPanel';
import { SkillGapDetailDrawer } from '../components/SkillGapDetailDrawer';

const SELECT_CLASS =
  'px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

/**
 * Team Skill Gap (S3-T016): latest snapshot per employee in the caller's scope,
 * sorted by number of gaps. HR sees the organization, department managers their department.
 */
export function SkillGapPage({ embedded = false }: { embedded?: boolean }) {
  const { can, is } = usePermission();
  const canCalculate = can(PERMISSIONS.SKILL_GAP_CALCULATE);
  // Department managers are scoped to their own department by the API — no department filter for them.
  const showDepartmentFilter = !is(ROLES.MANAGER) && can(PERMISSIONS.DEPARTMENT_READ);

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
  const lookupLatestRun = useLatestRunLookup();

  // Backend đã tính lại skill gap trong cùng transaction → chuyển panel sang snapshot mới nhất
  const handleLevelConfirmed = async (employeeId: string) => {
    try {
      const latestRunId = await lookupLatestRun(employeeId);
      if (latestRunId) setSelectedRunId(latestRunId);
    } catch {
      toast.error('Đã lưu mức năng lực nhưng chưa tải được phân tích mới nhất. Hãy tải lại trang.');
    }
  };

  const handleRecalculate = async (employeeId: string) => {
    try {
      const run = await calculateMutation.mutateAsync({ employeeId });
      setSelectedRunId(run.runId);
      toast.success(`Đã tính lại skill gap cho ${run.employeeName}`);
    } catch (error) {
      toast.error(skillGapErrorMessage(error, 'Không tính lại được skill gap'));
    }
  };

  const handleRecalculateAll = async () => {
    try {
      const result = await batchMutation.mutateAsync({
        departmentId: departmentId || undefined,
        jobPositionId: jobPositionId || undefined,
      });
      setBatchResult(result);
      toast.success(`Đã tính skill gap cho ${result.calculatedCount} nhân viên`);
    } catch (error) {
      toast.error(skillGapErrorMessage(error, 'Không tính lại được skill gap'));
    }
  };

  const columns: Column<SkillGapRunListItem>[] = [
    {
      key: 'employee',
      header: 'Nhân viên',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.employeeName}</div>
          <div className="text-xs text-slate-500">{row.employeeCode}</div>
        </div>
      ),
    },
    { key: 'department', header: 'Phòng ban', cell: (row) => row.departmentName ?? '-' },
    { key: 'position', header: 'Vị trí', cell: (row) => row.jobPositionName ?? '-' },
    {
      key: 'gaps',
      header: 'Khoảng trống',
      cell: (row) => (
        <span className="tabular-nums">
          {row.gapCount}
          {row.highCount > 0 && <span className="ml-2 text-xs font-medium text-danger-600">{row.highCount} mức cao</span>}
        </span>
      ),
    },
    {
      key: 'coverage',
      header: 'Tỷ lệ đáp ứng năng lực',
      cell: (row) => <span className="tabular-nums">{row.coveragePercent.toFixed(1)}%</span>,
    },
    {
      key: 'generatedAt',
      header: 'Tính lúc',
      hideOnMobile: true,
      cell: (row) => <span className="text-xs text-slate-500">{formatDateTime(row.generatedAt)}</span>,
    },
  ];

  const filters = (
    <div className="flex flex-wrap items-center gap-3">
      {showDepartmentFilter && (
        <select
          aria-label="Phòng ban"
          value={departmentId}
          onChange={(e) => {
            setDepartmentId(e.target.value);
            setPage(1);
          }}
          className={SELECT_CLASS}
        >
          <option value="">Mọi phòng ban</option>
          {departments?.items?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      )}
      <select
        aria-label="Vị trí"
        value={jobPositionId}
        onChange={(e) => {
          setJobPositionId(e.target.value);
          setPage(1);
        }}
        className={SELECT_CLASS}
      >
        <option value="">Mọi vị trí</option>
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
      Tính lại tất cả
    </button>
  );

  return (
    <div className="space-y-6">
      {embedded ? (
        <div className="flex justify-end">{recalculateAllButton}</div>
      ) : (
        <PageHeader title="Skill gap theo nhân viên" subtitle="Khoảng trống năng lực mới nhất của từng nhân viên so với chuẩn vị trí">
          {recalculateAllButton}
        </PageHeader>
      )}

      {batchResult && <BatchResultPanel result={batchResult} onDismiss={() => setBatchResult(null)} />}

      {isError && (
        <p role="alert" className="text-sm text-danger-600">
          Không tải được kết quả skill gap. Hãy tải lại trang.
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
        searchPlaceholder="Tìm theo tên hoặc mã nhân viên"
        filters={filters}
        onRowClick={(row) => setSelectedRunId(row.runId)}
        emptyTitle="Chưa có kết quả skill gap"
        emptyDescription={
          canCalculate
            ? 'Hãy chạy phân tích để so sánh nhân viên với chuẩn vị trí.'
            : 'Kết quả hiện ở đây khi quản trị học tập hoặc quản lý chạy phân tích.'
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
          onLevelConfirmed={handleLevelConfirmed}
        />
      )}
    </div>
  );
}
