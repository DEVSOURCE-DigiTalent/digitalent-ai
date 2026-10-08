import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, getStatusVariant, ConfirmActionDialog, type Column } from '@/components/shared';
import { useJobPositions, useDeleteJobPosition } from '@/hooks/use-job-positions';
import { useDepartments } from '@/hooks/use-departments';
import { useJobGradeLabel } from '@/hooks/use-job-grades';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { JobPositionFormDialog } from '../components/JobPositionFormDialog';
import { toast } from 'sonner';
import { organizationErrorMessage } from '@/lib/organization-errors';
import { JOB_GRADES } from '@/lib/terms';
import { INPUT_CLASS, PRIMARY_BUTTON } from '@/features/onboarding/components/styles';
import type { JobPositionListItem, JobPositionStatus } from '@/services/job-position.service';

const STATUS_LABELS: Record<string, string> = { ACTIVE: 'Đang dùng', INACTIVE: 'Ngừng dùng', ARCHIVED: 'Đã lưu trữ' };

/**
 * OW-09: Position List (UI/UX spec v2.1 §3.2, §10).
 * - Removed Job Family tab (hidden from UI per frozen design decision §9).
 * - Filters: Department · Grade · Status.
 * - Columns: Code · Position Name · Department · Grade · Headcount · Requirement Status · Status.
 * - Actions: Add Position (OW-11), Edit, Archive.
 */
export function PositionListPage() {
  const navigate = useNavigate();
  const { can } = usePermission();
  const canManagePositions = can(PERMISSIONS.JOB_POSITION_CREATE_UPDATE);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<JobPositionStatus | undefined>(undefined);
  const [departmentId, setDepartmentId] = useState('');
  const [jobGrade, setJobGrade] = useState('');

  const { data: deptData } = useDepartments({ pageSize: 100, status: 'ACTIVE' });
  const departments = deptData?.items || [];
  const gradeLabel = useJobGradeLabel();

  const { data, isLoading } = useJobPositions({
    pageIndex: page,
    pageSize,
    search,
    status,
    departmentId: departmentId || undefined,
    jobGrade: jobGrade || undefined,
  });

  const deletePosMutation = useDeleteJobPosition();
  const [isPosFormOpen, setIsPosFormOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<JobPositionListItem | null>(null);
  const [isPosArchiveOpen, setIsPosArchiveOpen] = useState(false);
  const [archivingPosition, setArchivingPosition] = useState<JobPositionListItem | null>(null);

  const handleEditPos = (pos: JobPositionListItem) => {
    setEditingPosition(pos);
    setIsPosFormOpen(true);
  };

  const handleArchivePosClick = (pos: JobPositionListItem) => {
    setArchivingPosition(pos);
    setIsPosArchiveOpen(true);
  };

  const handleArchivePosConfirm = async () => {
    if (!archivingPosition) return;
    try {
      await deletePosMutation.mutateAsync(archivingPosition.id);
      toast.success('Đã lưu trữ vị trí công việc');
    } catch (error) {
      toast.error(organizationErrorMessage(error, 'Không lưu trữ được vị trí công việc'));
    } finally {
      setIsPosArchiveOpen(false);
      setArchivingPosition(null);
    }
  };

  const columns: Column<JobPositionListItem>[] = [
    {
      key: 'code',
      header: 'Mã',
      cell: (row) => <span className="font-medium font-mono text-slate-900">{row.code}</span>,
    },
    {
      key: 'name',
      header: 'Tên vị trí',
      cell: (row) => (
        <div>
          <span className="font-semibold text-slate-900 hover:text-primary-700">{row.name}</span>
          {row.description && <p className="text-xs text-slate-500 line-clamp-1">{row.description}</p>}
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Phòng ban',
      cell: (row) => row.departmentName || (row as any).jobFamilyName || <span className="text-slate-400">Chưa gắn</span>,
    },
    {
      key: 'jobGrade',
      header: 'Cấp bậc',
      cell: (row) =>
        row.jobGrade ? (
          <span className="text-slate-900">
            {row.jobGradeName ?? row.jobGrade} <span className="font-mono text-xs text-slate-400">{row.jobGrade}</span>
          </span>
        ) : (
          <span className="text-slate-400">Chưa xếp</span>
        ),
      hideOnMobile: true,
    },
    {
      key: 'headcount',
      header: 'Nhân sự',
      cell: (row) => (
        <span className="font-medium tabular-nums text-slate-900">
          {row.headcount ?? 0} người
        </span>
      ),
    },
    {
      key: 'requirementSet',
      header: 'Yêu cầu năng lực',
      cell: (row) =>
        row.hasRequirementSet ? (
          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 ring-inset">
            Đã có yêu cầu
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-600/20 ring-inset">
            Chưa thiết lập
          </span>
        ),
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (row) => (
        <StatusBadge
          label={STATUS_LABELS[row.status] ?? row.status}
          variant={getStatusVariant(row.status)}
        />
      ),
    },
  ];

  if (canManagePositions) {
    columns.push({
      key: 'actions',
      header: '',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditPos(row);
            }}
            className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
            title="Sửa"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleArchivePosClick(row);
            }}
            className="p-1 text-slate-400 hover:text-danger-600 transition-colors"
            title="Lưu trữ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    });
  }

  const resetPage = <T,>(setter: (val: T) => void) => (val: T) => {
    setter(val);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vị trí công việc"
        subtitle="Quản lý danh mục vị trí và bộ tiêu chuẩn năng lực yêu cầu"
      >
        <div className="flex items-center gap-2">
          {canManagePositions && (
            <button
              onClick={() => {
                setEditingPosition(null);
                setIsPosFormOpen(true);
              }}
              className={PRIMARY_BUTTON}
            >
              <Plus className="size-4" />
              Tạo vị trí
            </button>
          )}
        </div>
      </PageHeader>

      <DataTable
        columns={columns}
        data={data?.items || []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={resetPage(setSearch)}
        searchPlaceholder="Tìm theo tên hoặc mã vị trí"
        onRowClick={(row) => navigate(`/enterprise/positions/${row.id}`)}
        emptyTitle="Chưa có vị trí công việc"
        emptyDescription="Tạo vị trí công việc để thiết lập bộ yêu cầu năng lực cho tổ chức."
        filters={
          <>
            <select
              aria-label="Lọc theo phòng ban"
              value={departmentId}
              onChange={(e) => resetPage(setDepartmentId)(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">Mọi phòng ban</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Lọc theo Cấp bậc"
              value={jobGrade}
              onChange={(e) => resetPage(setJobGrade)(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">Mọi Cấp bậc</option>
              {JOB_GRADES.map((code) => (
                <option key={code} value={code}>
                  {gradeLabel(code)}
                </option>
              ))}
            </select>
            <select
              aria-label="Lọc theo trạng thái"
              value={status || ''}
              onChange={(e) => resetPage(setStatus)(e.target.value ? (e.target.value as JobPositionStatus) : undefined)}
              className={INPUT_CLASS}
            >
              <option value="">Mọi trạng thái</option>
              <option value="ACTIVE">Đang dùng</option>
              <option value="INACTIVE">Ngừng dùng</option>
            </select>
          </>
        }
        pageInfo={{
          page,
          pageSize,
          total: data?.totalItems || 0,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {isPosFormOpen && (
        <JobPositionFormDialog
          open={isPosFormOpen}
          onClose={() => setIsPosFormOpen(false)}
          position={editingPosition}
        />
      )}

      {isPosArchiveOpen && archivingPosition && (
        <ConfirmActionDialog
          open={isPosArchiveOpen}
          onClose={() => setIsPosArchiveOpen(false)}
          onConfirm={handleArchivePosConfirm}
          title="Lưu trữ vị trí công việc"
          description={
            <span>
              Lưu trữ vị trí <strong>{archivingPosition.name}</strong>? Vị trí sẽ ẩn khỏi danh sách đang dùng nhưng vẫn giữ dữ liệu lịch sử.
            </span>
          }
          confirmLabel="Lưu trữ"
          confirmVariant="danger"
        />
      )}
    </div>
  );
}
