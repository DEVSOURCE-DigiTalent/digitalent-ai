import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BriefcaseBusiness, CircleCheck, Plus, Edit2, Trash2, UsersRound } from 'lucide-react';
import { DataTable, StatusBadge, getStatusVariant, type Column } from '@/components/shared';
import { useJobPositions, useDeleteJobPosition } from '@/hooks/use-job-positions';
import { useDepartments } from '@/hooks/use-departments';
import { useJobGradeLabel } from '@/hooks/use-job-grades';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { JobPositionFormDialog } from '../components/JobPositionFormDialog';
import { PositionArchiveDialog } from '../components/PositionArchiveDialog';
import { OwnerFilterSelect } from '../components/OwnerFilterSelect';
import { toast } from 'sonner';
import { organizationErrorMessage } from '@/lib/organization-errors';
import { JOB_GRADES } from '@/lib/terms';
import type { JobPositionListItem, JobPositionStatus } from '@/services/job-position.service';
import './position-list.css';

const STATUS_LABELS: Record<string, string> = { ACTIVE: 'Đang dùng', INACTIVE: 'Ngừng dùng', ARCHIVED: 'Đã lưu trữ' };

/**
 * OW-09: Position List (UI/UX spec v2.1 §3.2, §10).
 * - Removed Job Family tab (hidden from UI per frozen design decision §9).
 * - Filters: Department · Grade · Status.
 * - Columns: Code · Position Name · Department · Grade · Headcount · Requirement Status · Status.
 * - Actions: Add Position (OW-11), Edit, Archive.
 */
export function PositionListPage() {
  useUiLanguage();
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
          {row.description && <p className="text-xs text-slate-500 line-clamp-1">{translateUi(row.description)}</p>}
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Phòng ban',
      cell: (row) => row.departmentName || (row as any).jobFamilyName || <span className="text-slate-400">{translateUi("Chưa gắn")}</span>,
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
          <span className="text-slate-400">{translateUi("Chưa xếp")}</span>
        ),
      hideOnMobile: true,
    },
    {
      key: 'headcount',
      header: 'Nhân sự',
      cell: (row) => (
        <span className="font-medium tabular-nums text-slate-900">
          {row.headcount ?? 0}{translateUi(" người")}</span>
      ),
    },
    {
      key: 'requirementSet',
      header: 'Yêu cầu năng lực',
      cell: (row) =>
        row.hasRequirementSet ? (
          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 ring-inset">{translateUi("Đã có yêu cầu")}</span>
        ) : (
          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-600/20 ring-inset">{translateUi("Chưa thiết lập")}</span>
        ),
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (row) => (
        <StatusBadge
          label={translateUi(translateUi(STATUS_LABELS[row.status]) ?? row.status)}
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
            title={translateUi("Sửa")}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleArchivePosClick(row);
            }}
            className="p-1 text-slate-400 hover:text-danger-600 transition-colors"
            title={translateUi("Lưu trữ")}
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

  const pageItems = data?.items ?? [];
  const pageHeadcount = pageItems.reduce((sum, position) => sum + (position.headcount ?? 0), 0);
  const configuredOnPage = pageItems.filter((position) => position.hasRequirementSet).length;

  return (
    <div className="positions-page -m-4 min-h-screen space-y-6 px-5 py-7 md:-m-6 md:px-7 xl:px-10">
      <div className="positions-heading">
        <div>
          <Link to="/enterprise/setup?tab=positions" className="positions-back"><ArrowLeft className="size-4" />{translateUi(" Khung năng lực số")}</Link>
          <div className="positions-eyebrow"><BriefcaseBusiness className="size-4" />{translateUi(" CẤU TRÚC TỔ CHỨC")}</div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-[-0.04em] heading-gradient">{translateUi("Quản lý vị trí công việc")}</h1>
        </div>
        {canManagePositions && (
          <button
            type="button"
            onClick={() => {
              setEditingPosition(null);
              setIsPosFormOpen(true);
            }}
            className="positions-create"
          >
            <Plus className="size-4" />{translateUi(" Tạo vị trí mới")}</button>
        )}
      </div>

      <div className="positions-stats">
        <div className="positions-stat positions-stat-sky"><BriefcaseBusiness className="size-5" /><span>{translateUi("Vị trí phù hợp")}</span><strong>{data?.totalItems ?? 0}</strong></div>
        <div className="positions-stat positions-stat-teal"><UsersRound className="size-5" /><span>{translateUi("Nhân sự trên trang")}</span><strong>{pageHeadcount}</strong></div>
        <div className="positions-stat positions-stat-violet"><CircleCheck className="size-5" /><span>{translateUi("Có chuẩn trên trang")}</span><strong>{configuredOnPage}<small> / {pageItems.length}</small></strong></div>
      </div>

      <DataTable
        className="positions-table"
        forceScrollX
        columns={columns}
        data={data?.items || []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={resetPage(setSearch)}
        searchPlaceholder={translateUi("Tìm theo tên hoặc mã vị trí")}
        onRowClick={(row) => navigate(`/enterprise/positions/${row.id}`)}
        emptyTitle="Chưa có vị trí công việc"
        emptyDescription="Tạo vị trí công việc để thiết lập bộ yêu cầu năng lực cho tổ chức."
        filters={
          <>
            <OwnerFilterSelect
              label={translateUi("Lọc theo phòng ban")}
              value={departmentId}
              onChange={resetPage(setDepartmentId)}
              options={[{ value: '', label: 'Mọi phòng ban' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]}
              className="positions-filter"
            />
            <OwnerFilterSelect
              label={translateUi("Lọc theo cấp bậc")}
              value={jobGrade}
              onChange={resetPage(setJobGrade)}
              options={[{ value: '', label: 'Mọi cấp bậc' }, ...JOB_GRADES.map((code) => ({ value: code, label: gradeLabel(code) }))]}
              className="positions-filter"
            />
            <OwnerFilterSelect
              label={translateUi("Lọc theo trạng thái")}
              value={status || ''}
              onChange={(value) => resetPage(setStatus)(value ? value as JobPositionStatus : undefined)}
              options={[{ value: '', label: 'Mọi trạng thái' }, { value: 'ACTIVE', label: 'Đang dùng' }, { value: 'INACTIVE', label: 'Ngừng dùng' }]}
              className="positions-filter"
            />
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
        <PositionArchiveDialog
          name={archivingPosition.name}
          busy={deletePosMutation.isPending}
          onClose={() => setIsPosArchiveOpen(false)}
          onConfirm={handleArchivePosConfirm}
        />
      )}
    </div>
  );
}
