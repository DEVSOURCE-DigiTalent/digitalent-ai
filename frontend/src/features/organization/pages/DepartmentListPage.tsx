import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, DataTable, StatusBadge, getStatusVariant, ConfirmActionDialog, type Column } from '@/components/shared';
import { useDepartments, useDeleteDepartment } from '@/hooks/use-departments';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { DepartmentFormDialog } from '../components/DepartmentFormDialog';
import { toast } from 'sonner';
import { organizationErrorMessage } from '@/lib/organization-errors';
import { Edit2, Trash2 } from 'lucide-react';
import type { DepartmentListItem, DepartmentStatus } from '@/services/department.service';

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
    try {
      await deleteMutation.mutateAsync(archivingDept.id);
      toast.success('Đã lưu trữ phòng ban');
    } catch (error) {
      toast.error(organizationErrorMessage(error, 'Không lưu trữ được phòng ban'));
    } finally {
      setIsArchiveOpen(false);
      setArchivingDept(null);
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
      header: 'Quản lý (Manager)',
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
            className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
            title="Sửa"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleArchiveClick(row);
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

  const handleCreateNew = () => {
    setEditingDept(null);
    setIsFormOpen(true);
  };

  const statusFilter = (
    <select
      value={status || ''}
      onChange={(e) => setStatus(e.target.value ? (e.target.value as DepartmentStatus) : undefined)}
      aria-label="Lọc theo trạng thái"
      className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <option value="">Mọi trạng thái</option>
      <option value="ACTIVE">Đang dùng</option>
      <option value="INACTIVE">Ngừng dùng</option>
    </select>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Phòng ban / nhóm" subtitle="Cơ cấu phòng ban của tổ chức; mỗi nhân viên thuộc một phòng ban">
        {canManage && (
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
          >
            Tạo phòng ban
          </button>
        )}
      </PageHeader>

      <DataTable
        columns={columns}
        data={data?.items || []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
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
        <ConfirmActionDialog
          open={isArchiveOpen}
          onClose={() => setIsArchiveOpen(false)}
          onConfirm={handleArchiveConfirm}
          title="Lưu trữ phòng ban"
          description={
            <span>
              Lưu trữ phòng ban <strong>{archivingDept.name}</strong>? Phòng ban sẽ ẩn khỏi danh sách đang dùng nhưng vẫn giữ dữ liệu lịch sử.
            </span>
          }
          confirmLabel="Lưu trữ"
          confirmVariant="danger"
        />
      )}
    </div>
  );
}
