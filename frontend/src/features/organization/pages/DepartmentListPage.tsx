import { useState } from 'react';
import { PageHeader, DataTable, StatusBadge, getStatusVariant, ConfirmActionDialog, type Column } from '@/components/shared';
import { useDepartments, useDeleteDepartment } from '@/hooks/use-departments';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { DepartmentFormDialog } from '../components/DepartmentFormDialog';
import { toast } from 'sonner';
import { Edit2, Trash2 } from 'lucide-react';
import type { DepartmentListItem, DepartmentStatus } from '@/services/department.service';

export function DepartmentListPage() {
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
      toast.success('Department archived successfully');
    } catch {
      toast.error('Failed to archive department');
    } finally {
      setIsArchiveOpen(false);
      setArchivingDept(null);
    }
  };

  const columns: Column<DepartmentListItem>[] = [
    {
      key: 'code',
      header: 'Code',
      cell: (row) => <span className="font-medium">{row.code}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      cell: (row) => row.name,
    },
    {
      key: 'parent',
      header: 'Parent Department',
      cell: (row) => row.parentDepartmentName || <span className="text-slate-400">None</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge label={row.status} variant={getStatusVariant(row.status)} />,
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
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleArchiveClick(row);
            }}
            className="p-1 text-slate-400 hover:text-danger-600 transition-colors"
            title="Archive"
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
      className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <option value="">All Status</option>
      <option value="ACTIVE">Active</option>
      <option value="INACTIVE">Inactive</option>
    </select>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Departments" subtitle="Manage organizational departments">
        {canManage && (
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
          >
            Create Department
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
        filters={statusFilter}
        emptyTitle="No departments found"
        emptyDescription="Get started by creating a new department."
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
          title="Archive Department"
          description={
            <span>
              Are you sure you want to archive <strong>{archivingDept.name}</strong>? This action will hide the department from active lists but keep its historical data.
            </span>
          }
          confirmLabel="Archive"
          confirmVariant="danger"
        />
      )}
    </div>
  );
}
