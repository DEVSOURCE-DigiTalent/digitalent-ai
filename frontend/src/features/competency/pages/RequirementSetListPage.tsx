import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sliders, History, PlusCircle, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { PageHeader, StatusBadge, type Column, DataTable } from '@/components/shared';
import { usePositionRequirementSummaries } from '@/hooks/use-competencies';
import { useDepartments } from '@/hooks/use-departments';
import { INPUT_CLASS } from '@/features/onboarding/components/styles';
import { formatDate } from '@/lib/utils';
import type { PositionRequirementSummary } from '@/services/competency.service';

const STATUS_MAP: Record<PositionRequirementSummary['status'], { label: string; variant: 'success' | 'warning' | 'default' }> = {
  ACTIVE: { label: 'Đang áp dụng', variant: 'success' },
  DRAFT: { label: 'Có bản nháp', variant: 'warning' },
  NOT_CONFIGURED: { label: 'Chưa thiết lập', variant: 'default' },
};

/**
 * OW-16: Requirement Set List (/enterprise/requirements)
 * Danh sách bộ yêu cầu năng lực theo vị trí: Trạng thái (Đang áp dụng / Bản nháp / Chưa thiết lập),
 * Cấp bậc G1–G3, phòng ban, phiên bản, ngày hiệu lực và số lượng năng lực yêu cầu.
 */
export function RequirementSetListPage() {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: summaries = [], isLoading } = usePositionRequirementSummaries();
  const { data: departmentsData } = useDepartments({ pageSize: 100 });
  const departments = departmentsData?.items ?? [];

  // Filter items
  const filtered = summaries.filter((item) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.jobPositionName.toLowerCase().includes(q);
      const matchCode = item.jobPositionCode.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    if (selectedDept && item.departmentId !== selectedDept) {
      return false;
    }
    if (selectedStatus && item.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  const total = filtered.length;
  const pagedItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  // KPIs
  const activeCount = summaries.filter((s) => s.status === 'ACTIVE').length;
  const draftCount = summaries.filter((s) => s.status === 'DRAFT').length;
  const unconfiguredCount = summaries.filter((s) => s.status === 'NOT_CONFIGURED').length;

  const columns: Column<PositionRequirementSummary>[] = [
    {
      key: 'position',
      header: 'Vị trí công việc',
      cell: (row) => (
        <div>
          <div className="flex items-center gap-2">
            <Link
              to={`/enterprise/positions/${row.jobPositionId}`}
              className="font-medium text-slate-900 hover:text-primary-700 hover:underline"
            >
              {row.jobPositionName}
            </Link>
            {row.jobGrade && (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                {row.jobGrade}
              </span>
            )}
          </div>
          <div className="text-xs font-mono text-slate-400">{row.jobPositionCode}</div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Phòng ban',
      cell: (row) => <span className="text-slate-600">{row.departmentName}</span>,
    },
    {
      key: 'employees',
      header: 'Nhân sự',
      cell: (row) => (
        <span className="text-xs font-medium text-slate-600">
          {row.employeeCount} nhân viên
        </span>
      ),
    },
    {
      key: 'version',
      header: 'Phiên bản áp dụng',
      cell: (row) =>
        row.activeSet ? (
          <div>
            <span className="font-semibold text-slate-800">Phiên bản {row.activeSet.versionNo}</span>
            <div className="text-[11px] text-slate-500">
              {row.activeSet.competencyCount} năng lực yêu cầu
            </div>
          </div>
        ) : row.draftSet ? (
          <div>
            <span className="font-medium text-amber-700">Bản nháp v{row.draftSet.versionNo}</span>
            <div className="text-[11px] text-slate-500">
              {row.draftSet.competencyCount} năng lực
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Chưa thiết lập</span>
        ),
    },
    {
      key: 'effectiveFrom',
      header: 'Hiệu lực',
      cell: (row) =>
        row.activeSet?.effectiveFrom ? (
          <span className="text-xs text-slate-600">{formatDate(row.activeSet.effectiveFrom)}</span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (row) => {
        const conf = STATUS_MAP[row.status];
        return <StatusBadge label={conf.label} variant={conf.variant} />;
      },
    },
    {
      key: 'actions',
      header: '',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/enterprise/requirements/builder?positionId=${row.jobPositionId}`}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            title="Thiết lập bộ yêu cầu năng lực"
          >
            <Sliders className="size-3.5" />
            <span>{row.status === 'NOT_CONFIGURED' ? 'Thiết lập' : 'Chỉnh sửa'}</span>
          </Link>
          {row.totalVersions > 0 && (
            <Link
              to={`/enterprise/requirements/history?positionId=${row.jobPositionId}`}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              title="Lịch sử phiên bản"
            >
              <History className="size-3.5" />
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Yêu cầu năng lực theo vị trí"
          subtitle="Quản lý và thiết lập bộ chuẩn năng lực cho từng vị trí công việc trong tổ chức"
        />
        <Link
          to="/enterprise/requirements/builder"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
        >
          <PlusCircle className="size-4" />
          Thiết lập yêu cầu vị trí
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{activeCount}</div>
            <div className="text-xs text-slate-500">Vị trí đã áp dụng bộ yêu cầu</div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <FileText className="size-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{draftCount}</div>
            <div className="text-xs text-slate-500">Vị trí đang có bản nháp chờ kích hoạt</div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
            <AlertCircle className="size-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{unconfiguredCount}</div>
            <div className="text-xs text-slate-500">Vị trí chưa thiết lập bộ yêu cầu</div>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex-1 min-w-[220px]">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên vị trí hoặc mã..."
            className={INPUT_CLASS}
          />
        </div>
        <div className="w-56">
          <select
            aria-label="Lọc theo phòng ban"
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setPage(1);
            }}
            className={INPUT_CLASS}
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-48">
          <select
            aria-label="Lọc theo trạng thái"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className={INPUT_CLASS}
          >
            <option value="">Mọi trạng thái</option>
            <option value="ACTIVE">Đang áp dụng</option>
            <option value="DRAFT">Có bản nháp</option>
            <option value="NOT_CONFIGURED">Chưa thiết lập</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={pagedItems}
        keyExtractor={(row) => row.jobPositionId}
        isLoading={isLoading}
        emptyTitle="Chưa tìm thấy bộ yêu cầu nào"
        emptyDescription="Thử thay đổi bộ lọc hoặc chọn vị trí công việc để thiết lập yêu cầu năng lực."
        pageInfo={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </div>
  );
}
