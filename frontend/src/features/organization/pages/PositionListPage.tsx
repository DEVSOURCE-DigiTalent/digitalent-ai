import { useState } from 'react';
import { PageHeader, DataTable, StatusBadge, getStatusVariant, ConfirmActionDialog, type Column } from '@/components/shared';
import { useJobPositions, useDeleteJobPosition } from '@/hooks/use-job-positions';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { JobPositionFormDialog } from '../components/JobPositionFormDialog';
import { toast } from 'sonner';
import { Edit2, Trash2 } from 'lucide-react';
import type { JobPositionListItem, JobPositionStatus } from '@/services/job-position.service';

export function PositionListPage() {
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.JOB_POSITION_CREATE_UPDATE);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<JobPositionStatus | undefined>(undefined);

  const { data, isLoading } = useJobPositions({
    pageIndex: page,
    pageSize,
    search,
    status,
  });

  const deleteMutation = useDeleteJobPosition();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<JobPositionListItem | null>(null);

  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [archivingPosition, setArchivingPosition] = useState<JobPositionListItem | null>(null);

  const handleEdit = (pos: JobPositionListItem) => {
    setEditingPosition(pos);
    setIsFormOpen(true);
  };

  const handleArchiveClick = (pos: JobPositionListItem) => {
    setArchivingPosition(pos);
    setIsArchiveOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!archivingPosition) return;
    try {
      await deleteMutation.mutateAsync(archivingPosition.id);
      toast.success('Job position archived successfully');
    } catch {
      toast.error('Failed to archive job position');
    } finally {
      setIsArchiveOpen(false);
      setArchivingPosition(null);
    }
  };

  const columns: Column<JobPositionListItem>[] = [
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
      key: 'family',
      header: 'Job Family',
      cell: (row) => row.jobFamilyName || <span className="text-slate-400">None</span>,
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
    setEditingPosition(null);
    setIsFormOpen(true);
  };

  const statusFilter = (
    <select
      value={status || ''}
      onChange={(e) => setStatus(e.target.value ? (e.target.value as JobPositionStatus) : undefined)}
      className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <option value="">All Status</option>
      <option value="ACTIVE">Active</option>
      <option value="INACTIVE">Inactive</option>
    </select>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Job Positions" subtitle="Manage positions and competency requirements">
        {canManage && (
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
          >
            Create Position
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
        emptyTitle="No job positions found"
        emptyDescription="Get started by creating a new job position."
        pageInfo={{
          page,
          pageSize,
          total: data?.totalItems || 0,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {isFormOpen && (
        <JobPositionFormDialog
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          position={editingPosition}
        />
      )}

      {isArchiveOpen && archivingPosition && (
        <ConfirmActionDialog
          open={isArchiveOpen}
          onClose={() => setIsArchiveOpen(false)}
          onConfirm={handleArchiveConfirm}
          title="Archive Job Position"
          description={
            <span>
              Are you sure you want to archive <strong>{archivingPosition.name}</strong>? This action will hide the position from active lists.
            </span>
          }
          confirmLabel="Archive"
          confirmVariant="danger"
        />
      )}
    </div>
  );
}
