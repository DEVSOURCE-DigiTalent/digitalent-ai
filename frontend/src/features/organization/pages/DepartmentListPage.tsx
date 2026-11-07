import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, StatusBadge, getStatusVariant, Modal, type Column } from '@/components/shared';
import { useDepartments, useDeleteDepartment } from '@/hooks/use-departments';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { DepartmentFormDialog } from '../components/DepartmentFormDialog';
import { OwnerFilterSelect } from '../components/OwnerFilterSelect';
import { toast } from 'sonner';
import { organizationErrorMessage } from '@/lib/organization-errors';
import { Archive, Building2, CircleCheck, Edit2, Plus, UsersRound } from 'lucide-react';
import type { DepartmentListItem, DepartmentStatus } from '@/services/department.service';
import './position-list.css';
import './department-archive.css';

const STATUS_LABELS: Record<string, string> = { ACTIVE: 'Đang dùng', INACTIVE: 'Ngừng dùng', ARCHIVED: 'Đã lưu trữ' };

export function DepartmentListPage() {
  const navigate = useNavigate();
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.DEPARTMENT_CREATE_UPDATE);


  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DepartmentStatus | undefined>(undefined);

  const { data, isLoading } = useDepartments({
    pageIndex: page,
    pageSize,
    search,
    status,
  });

  const deleteMutation = useDeleteDepartment();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentListItem | null>(null);

  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [archivingDept, setArchivingDept] = useState<DepartmentListItem | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const handleEdit = (dept: DepartmentListItem) => {
    setEditingDept(dept);
    setIsFormOpen(true);
  };

  const handleArchiveClick = (dept: DepartmentListItem) => {
    setArchivingDept(dept);
    setIsArchiveOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!archivingDept) return;
    setIsArchiving(true);
    try {
      await deleteMutation.mutateAsync(archivingDept.id);
      toast.success('Đã lưu trữ phòng ban');
      setIsArchiveOpen(false);
      setArchivingDept(null);
    } catch (error) {
      toast.error(organizationErrorMessage(error, 'Không lưu trữ được phòng ban'));
    } finally {
      setIsArchiving(false);
    }
  };

  const columns: Column<DepartmentListItem>[] = [
    {
      key: 'code',
      header: 'Mã',
      cell: (row) => <span className="font-medium font-mono text-slate-900">{row.code}</span>,
    },
    {
      key: 'name',
      header: 'Tên phòng ban',
      cell: (row) => (
        <div>
          <span className="font-semibold text-slate-900 hover:text-primary-700">{row.name}</span>
          {row.parentDepartmentName && (
            <p className="text-xs text-slate-500">{row.parentDepartmentName}</p>
          )}
        </div>
      ),
    },
    {
      key: 'manager',
      header: 'Quản lý',
      cell: (row) =>
        row.managerName ? (
          <span className="font-medium text-slate-800">{row.managerName}</span>
        ) : (
          <span className="text-xs text-slate-400">Chưa phân công</span>
        ),
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
      key: 'grades',
      header: 'Phân bố Cấp bậc',
      cell: (row) => {
        const gd = row.gradeDistribution ?? {};
        const g1 = gd.G1 ?? 0;
        const g2 = gd.G2 ?? 0;
        const g3 = gd.G3 ?? 0;
        if (g1 === 0 && g2 === 0 && g3 === 0) {
          return <span className="text-xs text-slate-400">—</span>;
        }
        return (
          <div className="flex items-center gap-1.5 text-xs">
            {g1 > 0 && <span className="rounded-sm bg-teal-50 px-1 py-0.5 text-teal-700">G1: {g1}</span>}
            {g2 > 0 && <span className="rounded-sm bg-blue-50 px-1 py-0.5 text-blue-700">G2: {g2}</span>}
            {g3 > 0 && <span className="rounded-sm bg-purple-50 px-1 py-0.5 text-purple-700">G3: {g3}</span>}
          </div>
        );
      },
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (row) => <StatusBadge label={STATUS_LABELS[row.status] ?? row.status} variant={getStatusVariant(row.status)} />,
    },
  ];


  if (canManage) {
    columns.push({
      key: 'actions',
      header: '',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="departments-row-action departments-row-action--edit"
            title="Sửa"
            aria-label={`Sửa ${row.name}`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleArchiveClick(row);
            }}
            className="departments-row-action departments-row-action--archive"
            title="Lưu trữ"
            aria-label={`Lưu trữ ${row.name}`}
          >
            <Archive className="w-4 h-4" />
          </button>
        </div>
      ),
    });
  }

  const handleCreateNew = () => {
    setEditingDept(null);
    setIsFormOpen(true);
  };

  const statusFilter = (
    <OwnerFilterSelect
      value={status || ''}
      onChange={(value) => { setStatus(value ? value as DepartmentStatus : undefined); setPage(1); }}
      label="Lọc theo trạng thái"
      className="positions-filter"
      options={[{ value: '', label: 'Mọi trạng thái' }, { value: 'ACTIVE', label: 'Đang dùng' }, { value: 'INACTIVE', label: 'Ngừng dùng' }]}
    />
  );

  const pageItems = data?.items ?? [];
  const pageHeadcount = pageItems.reduce((sum, department) => sum + (department.headcount ?? 0), 0);
  const managedOnPage = pageItems.filter((department) => Boolean(department.managerName)).length;

  return (
    <div className="positions-page departments-page -m-4 min-h-screen space-y-6 px-5 py-7 md:-m-6 md:px-7 xl:px-10">
      <div className="positions-heading">
        <div>
          <div className="positions-eyebrow"><Building2 className="size-4" /> CẤU TRÚC TỔ CHỨC</div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-[-0.04em] heading-gradient">Quản lý phòng ban</h1>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={handleCreateNew}
            className="positions-create"
          >
            <Plus className="size-4" /> Tạo phòng ban
          </button>
        )}
      </div>

      <div className="positions-stats">
        <div className="positions-stat positions-stat-sky"><Building2 className="size-5" /><span>Phòng ban phù hợp</span><strong>{data?.totalItems ?? 0}</strong></div>
        <div className="positions-stat positions-stat-teal"><UsersRound className="size-5" /><span>Nhân sự trên trang</span><strong>{pageHeadcount}</strong></div>
        <div className="positions-stat positions-stat-violet"><CircleCheck className="size-5" /><span>Có quản lý trên trang</span><strong>{managedOnPage}<small> / {pageItems.length}</small></strong></div>
      </div>

      <DataTable
        className="positions-table"
        forceScrollX
        columns={columns}
        data={data?.items || []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        searchPlaceholder="Tìm theo tên hoặc mã phòng ban"
        onRowClick={(row) => navigate(`/enterprise/departments/${row.id}`)}
        filters={statusFilter}
        emptyTitle="Chưa có phòng ban nào"
        emptyDescription="Tạo phòng ban đầu tiên để bắt đầu."

        pageInfo={{
          page,
          pageSize,
          total: data?.totalItems || 0,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {isFormOpen && (
        <DepartmentFormDialog
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          department={editingDept}
        />
      )}

      {isArchiveOpen && archivingDept && (
        <Modal
          open={isArchiveOpen}
          onClose={() => { if (!isArchiving) setIsArchiveOpen(false); }}
          title="Lưu trữ phòng ban"
          description="Kiểm tra phòng ban trước khi xác nhận."
          size="md"
          className="department-archive-dialog"
          footer={
            <>
              <button type="button" className="department-archive-cancel" onClick={() => setIsArchiveOpen(false)} disabled={isArchiving}>Giữ lại</button>
              <button type="button" className="department-archive-confirm" onClick={handleArchiveConfirm} disabled={isArchiving}>
                <Archive size={16} aria-hidden="true" />{isArchiving ? 'Đang lưu trữ…' : 'Lưu trữ'}
              </button>
            </>
          }
        >
          <div className="department-archive-target">
            <span className="department-archive-icon"><Building2 size={22} aria-hidden="true" /></span>
            <div><strong>{archivingDept.name}</strong><small>Mã phòng ban: {archivingDept.code}</small></div>
          </div>
          <p className="department-archive-explanation">Phòng ban sẽ ẩn khỏi danh sách đang dùng nhưng vẫn giữ dữ liệu lịch sử. Bạn có thể kiểm tra nhân sự và vị trí liên quan trước khi tiếp tục.</p>
        </Modal>
      )}
    </div>
  );
}
