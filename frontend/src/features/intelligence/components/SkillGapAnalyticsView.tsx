import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCw, Search, ArrowRight } from 'lucide-react';
import { EmptyState, PageHeader, ScoreCard, Tabs, DataTable, type Column } from '@/components/shared';
import { useCompetencyGaps, useGapOverview } from '@/hooks/use-analytics';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import { useSkillGapRuns, useCalculateSkillGapBatch } from '@/hooks/use-skill-gaps';
import { INPUT_CLASS } from '@/features/onboarding/components/styles';
import { JOB_GRADES } from '@/lib/terms';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import { skillGapErrorMessage } from '@/lib/competency-levels';
import type { SkillGapRunListItem, CalculateSkillGapBatchResult } from '@/services/intelligence.service';
import { BatchResultPanel } from './BatchResultPanel';

export type GroupBy = 'department' | 'position' | 'grade';

export interface SkillGapAnalyticsViewProps {
  departmentId?: string;
  hideDepartmentFilter?: boolean;
  title?: string;
  subtitle?: string;
  readOnly?: boolean;
}

/**
 * OW-21 / MG-05: Skill Gap Analytics View
 * Bảng điều khiển phân tích khoảng trống năng lực đa chiều:
 * - Theo Tổng quan (Phòng ban / Vị trí / Cấp bậc G1–G3)
 * - Theo Năng lực chuẩn TT02
 * - Theo Danh sách nhân viên
 * Hỗ trợ tái sử dụng cho cả Owner (toàn tổ chức) và Manager (theo nhóm phòng ban).
 */
export function SkillGapAnalyticsView({
  departmentId: fixedDeptId,
  hideDepartmentFilter = false,
  title = 'Phân tích khoảng trống năng lực (Skill Gap)',
  subtitle = 'So sánh mức năng lực hiện tại với yêu cầu của vị trí, phân tích theo phòng ban, vị trí, cấp bậc và nhân sự',
  readOnly = false,
}: SkillGapAnalyticsViewProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [groupBy, setGroupBy] = useState<GroupBy>('department');
  const [departmentId, setDepartmentId] = useState(fixedDeptId || '');
  const [jobPositionId, setJobPositionId] = useState('');
  const [jobGrade, setJobGrade] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [batchResult, setBatchResult] = useState<CalculateSkillGapBatchResult | null>(null);

  const effectiveDeptId = fixedDeptId || departmentId;

  const departments = useDepartments({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];
  const positions = useJobPositions({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];

  const filter = {
    departmentId: effectiveDeptId || undefined,
    jobPositionId: jobPositionId || undefined,
    jobGrade: jobGrade || undefined,
  };

  const overview = useGapOverview({ groupBy, ...filter });
  const competencies = useCompetencyGaps(filter);

  const { data: runsData, isLoading: runsLoading } = useSkillGapRuns({
    pageIndex: page,
    pageSize,
    search: search.trim() || undefined,
    departmentId: effectiveDeptId || undefined,
    jobPositionId: jobPositionId || undefined,
  });

  const batchMutation = useCalculateSkillGapBatch();

  const handleRecalculateAll = async () => {
    try {
      const result = await batchMutation.mutateAsync({
        departmentId: effectiveDeptId || undefined,
        jobPositionId: jobPositionId || undefined,
      });
      setBatchResult(result);
      toast.success(`Đã tính khoảng trống năng lực cho ${result.calculatedCount} nhân viên`);
    } catch (error) {
      toast.error(skillGapErrorMessage(error, 'Không tính lại được khoảng trống năng lực'));
    }
  };

  const columns: Column<SkillGapRunListItem>[] = [
    {
      key: 'employee',
      header: 'Nhân viên',
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.employeeName}</div>
          <div className="text-xs text-slate-500">{row.employeeCode}</div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Phòng ban',
      cell: (row) => <span className="text-slate-600">{row.departmentName ?? '—'}</span>,
    },
    {
      key: 'position',
      header: 'Vị trí',
      cell: (row) => <span className="text-slate-700 font-medium">{row.jobPositionName ?? '—'}</span>,
    },
    {
      key: 'gaps',
      header: 'Khoảng trống',
      cell: (row) => (
        <span className="tabular-nums">
          <span className="font-bold text-slate-800">{row.gapCount}</span>
          {row.highCount > 0 && (
            <span className="ml-2 rounded bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
              {row.highCount} mức cao
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'coverage',
      header: 'Tỷ lệ đáp ứng năng lực',
      cell: (row) => (
        <span
          className={`font-bold tabular-nums ${
            row.coveragePercent >= 100
              ? 'text-emerald-700'
              : row.coveragePercent >= 70
                ? 'text-amber-700'
                : 'text-rose-700'
          }`}
        >
          {row.coveragePercent.toFixed(1)}%
        </span>
      ),
    },
    {
      key: 'generatedAt',
      header: 'Tính lúc',
      hideOnMobile: true,
      cell: (row) => <span className="text-xs text-slate-500">{formatDateTime(row.generatedAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      cell: (row) => (
        <Link
          to={`/enterprise/skill-gap/${row.employeeId}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:text-primary-800 hover:underline"
        >
          Chi tiết
          <ArrowRight className="size-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title={title} subtitle={subtitle} />
        {!readOnly && (
          <button
            type="button"
            onClick={handleRecalculateAll}
            disabled={batchMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
          >
            <RefreshCw className={batchMutation.isPending ? 'size-4 animate-spin' : 'size-4'} />
            Tính lại toàn bộ
          </button>
        )}
      </div>

      {batchResult && <BatchResultPanel result={batchResult} onDismiss={() => setBatchResult(null)} />}

      <Tabs
        label="Góc nhìn phân tích khoảng trống"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'overview', label: 'Tổng quan so sánh' },
          { id: 'competencies', label: 'Theo năng lực TT02' },
          { id: 'employees', label: 'Theo nhân viên' },
        ]}
      >
        {/* Global Toolbar Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {tab === 'overview' && (
            <div role="group" aria-label="Nhóm theo" className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
              <button
                type="button"
                aria-pressed={groupBy === 'department'}
                onClick={() => setGroupBy('department')}
                className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                  groupBy === 'department' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Theo phòng ban
              </button>
              <button
                type="button"
                aria-pressed={groupBy === 'position'}
                onClick={() => setGroupBy('position')}
                className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                  groupBy === 'position' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Theo vị trí
              </button>
              <button
                type="button"
                aria-pressed={groupBy === 'grade'}
                onClick={() => setGroupBy('grade')}
                className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                  groupBy === 'grade' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Theo Cấp bậc (G1–G3)
              </button>
            </div>
          )}

          {tab !== 'employees' && (
            <>
              {!hideDepartmentFilter && !fixedDeptId && (
                <select
                  aria-label="Lọc theo phòng ban"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className={INPUT_CLASS}
                >
                  <option value="">Tất cả phòng ban</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              )}

              <select
                aria-label="Lọc theo vị trí"
                value={jobPositionId}
                onChange={(e) => setJobPositionId(e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="">Tất cả vị trí</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                aria-label="Lọc theo Cấp bậc"
                value={jobGrade}
                onChange={(e) => setJobGrade(e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="">Mọi cấp bậc</option>
                {JOB_GRADES.map((g: string) => (
                  <option key={g} value={g}>
                    Cấp bậc {g}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* TAB 1: OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {overview.data && (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <ScoreCard label="Nhân sự được phân tích" value={overview.data.totals.employees} />
                <ScoreCard
                  label="Tỷ lệ đáp ứng năng lực"
                  value={`${overview.data.totals.averageCoverage.toFixed(1)}%`}
                />
                <ScoreCard
                  label="Tổng khoảng trống"
                  value={overview.data.totals.totalGaps}
                  subtitle={`${overview.data.totals.mediumCount} mức TB · ${overview.data.totals.lowCount} mức thấp`}
                />
                <ScoreCard
                  label="Khoảng trống mức cao"
                  value={overview.data.totals.highCount}
                  variant={overview.data.totals.highCount > 0 ? 'danger' : 'success'}
                  subtitle={`${overview.data.totals.employeesWithHigh} nhân sự bị thiếu`}
                />
              </div>
            )}

            {overview.isLoading ? (
              <p className="text-sm text-slate-500">Đang tải số liệu tổng quan…</p>
            ) : overview.data && overview.data.groups.length === 0 ? (
              <EmptyState
                title="Chưa có dữ liệu khoảng trống"
                description="Cần có nhân viên đã gán vị trí và vị trí đã có bộ yêu cầu năng lực đang áp dụng."
              />
            ) : (
              overview.data && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">
                          {groupBy === 'department'
                            ? 'Phòng ban'
                            : groupBy === 'grade'
                              ? 'Cấp bậc (Job Grade)'
                              : 'Vị trí công việc'}
                        </th>
                        <th className="px-4 py-3 text-center">Nhân sự</th>
                        <th className="px-4 py-3 text-center">Tỷ lệ đáp ứng TB</th>
                        <th className="px-4 py-3">Khoảng trống tổng</th>
                        <th className="px-4 py-3">Mức cao (Cần ưu tiên)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {overview.data.groups.map((group) => (
                        <tr key={group.id} className="hover:bg-slate-50/80">
                          <th className="px-4 py-3 font-semibold text-slate-900">{group.name}</th>
                          <td className="px-4 py-3 text-center tabular-nums text-slate-600">
                            {group.employees}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`font-bold tabular-nums ${
                                group.averageCoverage >= 100
                                  ? 'text-emerald-700'
                                  : group.averageCoverage >= 70
                                    ? 'text-amber-700'
                                    : 'text-rose-700'
                              }`}
                            >
                              {group.averageCoverage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 tabular-nums text-slate-700 font-medium">
                            {group.totalGaps} gap
                          </td>
                          <td className="px-4 py-3">
                            {group.highCount > 0 ? (
                              <span className="rounded bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                                {group.highCount} khoảng trống cao
                              </span>
                            ) : (
                              <span className="text-xs text-emerald-600 font-medium">Không có</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        )}

        {/* TAB 2: COMPETENCIES */}
        {tab === 'competencies' && (
          <div>
            {competencies.isLoading ? (
              <p className="text-sm text-slate-500">Đang tải dữ liệu năng lực…</p>
            ) : competencies.data && competencies.data.length === 0 ? (
              <EmptyState title="Không có năng lực nào" description="Không có số liệu năng lực theo bộ lọc hiện tại." />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Năng lực TT02</th>
                      <th className="px-4 py-3 text-center">Số người yêu cầu</th>
                      <th className="px-4 py-3 text-center">Số người thiếu</th>
                      <th className="px-4 py-3 text-center">Trình độ yêu cầu TB</th>
                      <th className="px-4 py-3 text-center">Trình độ hiện tại TB</th>
                      <th className="px-4 py-3">Mức độ khoảng trống</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {competencies.data?.map((comp) => (
                      <tr key={comp.competencyId} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3">
                          <Link
                            to={`/enterprise/framework/${comp.competencyId}`}
                            className="font-medium text-slate-900 hover:text-primary-700 hover:underline"
                          >
                            <span className="mr-2 font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {comp.frameworkCode}
                            </span>
                            {comp.name}
                          </Link>
                          {comp.categoryName && (
                            <div className="text-[11px] text-slate-500">{comp.categoryName}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{comp.employeesRequired}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`font-bold ${
                              comp.employeesWithGap > 0 ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {comp.employeesWithGap}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center tabular-nums">
                          {comp.averageRequiredLevel.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-center tabular-nums font-semibold">
                          {comp.averageCurrentLevel.toFixed(1)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-xs">
                            {comp.highCount > 0 && (
                              <span className="rounded bg-rose-50 px-1.5 py-0.5 text-rose-700 font-semibold border border-rose-200">
                                {comp.highCount} Cao
                              </span>
                            )}
                            {comp.mediumCount > 0 && (
                              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-700 font-semibold border border-amber-200">
                                {comp.mediumCount} TB
                              </span>
                            )}
                            {comp.lowCount > 0 && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
                                {comp.lowCount} Thấp
                              </span>
                            )}
                            {comp.highCount === 0 && comp.mediumCount === 0 && comp.lowCount === 0 && (
                              <span className="text-emerald-600 font-medium">Đạt chuẩn 100%</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EMPLOYEES */}
        {tab === 'employees' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Tìm theo tên hoặc mã nhân viên..."
                    className={`${INPUT_CLASS} pl-9`}
                  />
                </div>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={runsData?.items ?? []}
              keyExtractor={(row) => row.runId}
              isLoading={runsLoading}
              onRowClick={(row) => navigate(`/enterprise/skill-gap/${row.employeeId}`)}
              emptyTitle="Chưa có kết quả khoảng trống năng lực"
              emptyDescription="Hãy chạy phân tích để so sánh năng lực nhân viên với chuẩn vị trí."
              pageInfo={{
                page,
                pageSize,
                total: runsData?.totalItems ?? 0,
                onPageChange: setPage,
                onPageSizeChange: setPageSize,
              }}
            />
          </div>
        )}
      </Tabs>
    </div>
  );
}
