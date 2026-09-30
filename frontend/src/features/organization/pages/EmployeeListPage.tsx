import { useState } from 'react';
import { PageHeader, DataTable, StatusBadge, getStatusVariant, ConfirmActionDialog, type Column } from '@/components/shared';
import { useEmployees, useArchiveEmployee } from '@/hooks/use-employees';
import { useDepartments } from '@/hooks/use-departments';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { EmployeeFormDialog } from '../components/EmployeeFormDialog';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/utils';
import { Edit2, Trash2 } from 'lucide-react';
import type { EmployeeListItem } from '@/services/employee.service';

export function EmployeeListPage() {
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.EMPLOYEE_CREATE_UPDATE);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('');

  const { data: deptData } = useDepartments({ pageSize: 100 });

  const { data, isLoading } = useEmployees({
    pageIndex: page,
    pageSize,
    search: search.trim() || undefined,
    departmentId: departmentId || undefined,
    status: status || undefined,
  });

  const archiveMutation = useArchiveEmployee();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeListItem | null>(null);

  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [archivingEmployee, setArchivingEmployee] = useState<EmployeeListItem | null>(null);

  const handleEdit = (employee: EmployeeListItem) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleArchiveClick = (employee: EmployeeListItem) => {
    setArchivingEmployee(employee);
    setIsArchiveOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!archivingEmployee) return;
    try {
      await archiveMutation.mutateAsync(archivingEmployee.id);
      toast.success('Employee archived successfully');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to archive employee'));
    } finally {
      setIsArchiveOpen(false);
      setArchivingEmployee(null);
    }
  };

  const handleCreateNew = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  const columns: Column<EmployeeListItem>[] = [
    {
      key: 'employeeCode',
      header: 'Code',
      cell: (row) => <span className="font-medium text-slate-800">{row.employeeCode}</span>,
    },
    {
      key: 'fullName',
      header: 'Full Name',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.fullName}</div>
          {row.workEmail && <div className="text-xs text-slate-500">{row.workEmail}</div>}
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      cell: (row) => row.departmentName || <span className="text-slate-400">-</span>,
    },
    {
      key: 'position',
      header: 'Position',
      cell: (row) => row.positionName || row.jobPositionName || <span className="text-slate-400">-</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (row) => row.phone || <span className="text-slate-400">-</span>,
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

  const filters = (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={departmentId}
        onChange={(e) => {
          setDepartmentId(e.target.value);
          setPage(1);
        }}
        className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Departments</option>
        {deptData?.items?.map((dept) => (
          <option key={dept.id} value={dept.id}>
            {dept.name}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setPage(1);
        }}
        className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Status</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
        <option value="TRANSFERRED">Transferred</option>
        <option value="ARCHIVED">Archived</option>
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" subtitle="Manage employee profiles, assignments, and organizational positions">
        {canManage && (
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
          >
            Create Employee
          </button>
        )}
      </PageHeader>

      <DataTable
        columns={columns}
        data={data?.items || []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        filters={filters}
        emptyTitle="No employees found"
        emptyDescription="Get started by adding a new employee to the organization."
        pageInfo={{
          page,
          pageSize,
          total: data?.totalItems || 0,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {isFormOpen && (
        <EmployeeFormDialog
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          employee={editingEmployee}
        />
      )}

      {isArchiveOpen && archivingEmployee && (
        <ConfirmActionDialog
          open={isArchiveOpen}
          onClose={() => setIsArchiveOpen(false)}
          onConfirm={handleArchiveConfirm}
          title="Archive Employee"
          description={
            <span>
              Are you sure you want to archive <strong>{archivingEmployee.fullName}</strong> ({archivingEmployee.employeeCode})? This action will mark the employee as archived.
            </span>
          }
          confirmLabel="Archive"
          confirmVariant="danger"
        />
      )}
    </div>
  );
}
