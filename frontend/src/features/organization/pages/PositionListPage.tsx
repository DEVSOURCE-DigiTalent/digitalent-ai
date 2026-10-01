import { useState } from 'react';
import { PageHeader, DataTable, StatusBadge, getStatusVariant, ConfirmActionDialog, type Column } from '@/components/shared';
import { useJobPositions, useDeleteJobPosition } from '@/hooks/use-job-positions';
import { useJobFamilies, useDeleteJobFamily } from '@/hooks/use-job-families';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { JobPositionFormDialog } from '../components/JobPositionFormDialog';
import { JobFamilyFormDialog } from '../components/JobFamilyFormDialog';
import { toast } from 'sonner';
import { Edit2, Trash2 } from 'lucide-react';
import type { JobPositionListItem, JobPositionStatus } from '@/services/job-position.service';
import type { JobFamilyListItem, JobFamilyStatus } from '@/services/job-family.service';

export function PositionListPage() {
  const { can } = usePermission();
  const canManagePositions = can(PERMISSIONS.JOB_POSITION_CREATE_UPDATE);
  const canManageFamilies = can(PERMISSIONS.JOB_FAMILY_CREATE_UPDATE) || canManagePositions;

  const [activeTab, setActiveTab] = useState<'positions' | 'families'>('positions');

  // Positions state
  const [posPage, setPosPage] = useState(1);
  const [posPageSize, setPosPageSize] = useState(10);
  const [posSearch, setPosSearch] = useState('');
  const [posStatus, setPosStatus] = useState<JobPositionStatus | undefined>(undefined);

  const { data: posData, isLoading: posLoading } = useJobPositions({
    pageIndex: posPage,
    pageSize: posPageSize,
    search: posSearch,
    status: posStatus,
  });

  const deletePosMutation = useDeleteJobPosition();
  const [isPosFormOpen, setIsPosFormOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<JobPositionListItem | null>(null);
  const [isPosArchiveOpen, setIsPosArchiveOpen] = useState(false);
  const [archivingPosition, setArchivingPosition] = useState<JobPositionListItem | null>(null);

  // Families state
  const [famPage, setFamPage] = useState(1);
  const [famPageSize, setFamPageSize] = useState(10);
  const [famSearch, setFamSearch] = useState('');
  const [famStatus, setFamStatus] = useState<JobFamilyStatus | undefined>(undefined);

  const { data: famData, isLoading: famLoading } = useJobFamilies({
    pageIndex: famPage,
    pageSize: famPageSize,
    search: famSearch,
    status: famStatus,
  });

  const deleteFamMutation = useDeleteJobFamily();
  const [isFamFormOpen, setIsFamFormOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<JobFamilyListItem | null>(null);
  const [isFamArchiveOpen, setIsFamArchiveOpen] = useState(false);
  const [archivingFamily, setArchivingFamily] = useState<JobFamilyListItem | null>(null);

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
      toast.success('Job position archived successfully');
    } catch {
      toast.error('Failed to archive job position');
    } finally {
      setIsPosArchiveOpen(false);
      setArchivingPosition(null);
    }
  };

  const handleEditFam = (fam: JobFamilyListItem) => {
    setEditingFamily(fam);
    setIsFamFormOpen(true);
  };

  const handleArchiveFamClick = (fam: JobFamilyListItem) => {
    setArchivingFamily(fam);
    setIsFamArchiveOpen(true);
  };

  const handleArchiveFamConfirm = async () => {
    if (!archivingFamily) return;
    try {
      await deleteFamMutation.mutateAsync(archivingFamily.id);
      toast.success('Job family archived successfully');
    } catch {
      toast.error('Failed to archive job family');
    } finally {
      setIsFamArchiveOpen(false);
      setArchivingFamily(null);
    }
  };

  const posColumns: Column<JobPositionListItem>[] = [
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

  if (canManagePositions) {
    posColumns.push({
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
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleArchivePosClick(row);
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

  const famColumns: Column<JobFamilyListItem>[] = [
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
      key: 'description',
      header: 'Description',
      cell: (row) => row.description || <span className="text-slate-400">-</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge label={row.status} variant={getStatusVariant(row.status)} />,
    },
  ];

  if (canManageFamilies) {
    famColumns.push({
      key: 'actions',
      header: '',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditFam(row);
            }}
            className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleArchiveFamClick(row);
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

  return (
    <div className="space-y-6">
      <PageHeader title="Job Architecture" subtitle="Manage job positions, job families, and requirements">
        <div className="flex items-center gap-3">
          {activeTab === 'positions' && canManagePositions && (
            <button
              onClick={() => {
                setEditingPosition(null);
                setIsPosFormOpen(true);
              }}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
            >
              Create Position
            </button>
          )}
          {activeTab === 'families' && canManageFamilies && (
            <button
              onClick={() => {
                setEditingFamily(null);
                setIsFamFormOpen(true);
              }}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
            >
              Create Job Family
            </button>
          )}
        </div>
      </PageHeader>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('positions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'positions'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Job Positions ({posData?.totalItems || 0})
        </button>
        <button
          onClick={() => setActiveTab('families')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'families'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Job Families ({famData?.totalItems || 0})
        </button>
      </div>

      {activeTab === 'positions' ? (
        <DataTable
          columns={posColumns}
          data={posData?.items || []}
          keyExtractor={(row) => row.id}
          isLoading={posLoading}
          searchValue={posSearch}
          onSearchChange={setPosSearch}
          filters={
            <select
              value={posStatus || ''}
              onChange={(e) => setPosStatus(e.target.value ? (e.target.value as JobPositionStatus) : undefined)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          }
          emptyTitle="No job positions found"
          emptyDescription="Get started by creating a new job position."
          pageInfo={{
            page: posPage,
            pageSize: posPageSize,
            total: posData?.totalItems || 0,
            onPageChange: setPosPage,
            onPageSizeChange: setPosPageSize,
          }}
        />
      ) : (
        <DataTable
          columns={famColumns}
          data={famData?.items || []}
          keyExtractor={(row) => row.id}
          isLoading={famLoading}
          searchValue={famSearch}
          onSearchChange={setFamSearch}
          filters={
            <select
              value={famStatus || ''}
              onChange={(e) => setFamStatus(e.target.value ? (e.target.value as JobFamilyStatus) : undefined)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          }
          emptyTitle="No job families found"
          emptyDescription="Get started by creating a new job family."
          pageInfo={{
            page: famPage,
            pageSize: famPageSize,
            total: famData?.totalItems || 0,
            onPageChange: setFamPage,
            onPageSizeChange: setFamPageSize,
          }}
        />
      )}

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

      {isFamFormOpen && (
        <JobFamilyFormDialog
          open={isFamFormOpen}
          onClose={() => setIsFamFormOpen(false)}
          family={editingFamily}
        />
      )}

      {isFamArchiveOpen && archivingFamily && (
        <ConfirmActionDialog
          open={isFamArchiveOpen}
          onClose={() => setIsFamArchiveOpen(false)}
          onConfirm={handleArchiveFamConfirm}
          title="Archive Job Family"
          description={
            <span>
              Are you sure you want to archive <strong>{archivingFamily.name}</strong>? This action will hide the family from active lists.
            </span>
          }
          confirmLabel="Archive"
          confirmVariant="danger"
        />
      )}
    </div>
  );
}
