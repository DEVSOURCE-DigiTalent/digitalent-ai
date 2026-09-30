import { useState } from 'react';
import { PageHeader, DataTable, StatusBadge, getStatusVariant, ConfirmActionDialog, type Column } from '@/components/shared';
import { useCompetencies, useArchiveCompetency, useCompetency } from '@/hooks/use-competencies';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { CompetencyFormDialog } from '../components/CompetencyFormDialog';
import { toast } from 'sonner';
import { Edit2, Trash2, Eye, X } from 'lucide-react';
import type { CompetencyListItem } from '@/services/competency.service';

export function CompetencyFrameworkPage() {
  const { can } = usePermission();
  const canManage =
    can(PERMISSIONS.COMPETENCY_MANAGE) ||
    can('competency.create_update');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [competencyType, setCompetencyType] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useCompetencies({
    pageIndex: page,
    pageSize,
    search: search.trim() || undefined,
    competencyType: competencyType || undefined,
    status: status || undefined,
  });

  const archiveMutation = useArchiveCompetency();

  // Create / Edit Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompetency, setEditingCompetency] = useState<CompetencyListItem | null>(null);

  // Archive Dialog State
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [archivingCompetency, setArchivingCompetency] = useState<CompetencyListItem | null>(null);

  // View Criteria Modal State
  const [viewingCompetencyId, setViewingCompetencyId] = useState<string | null>(null);
  const { data: detailData, isLoading: detailLoading } = useCompetency(viewingCompetencyId || '');

  const handleEdit = (comp: CompetencyListItem) => {
    setEditingCompetency(comp);
    setIsFormOpen(true);
  };

  const handleArchiveClick = (comp: CompetencyListItem) => {
    setArchivingCompetency(comp);
    setIsArchiveOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!archivingCompetency) return;
    try {
      await archiveMutation.mutateAsync(archivingCompetency.id);
      toast.success('Competency archived successfully');
    } catch {
      toast.error('Failed to archive competency');
    } finally {
      setIsArchiveOpen(false);
      setArchivingCompetency(null);
    }
  };

  const handleCreateNew = () => {
    setEditingCompetency(null);
    setIsFormOpen(true);
  };

  const columns: Column<CompetencyListItem>[] = [
    {
      key: 'code',
      header: 'Code',
      cell: (row) => <span className="font-semibold text-slate-800">{row.code}</span>,
    },
    {
      key: 'frameworkCode',
      header: 'Circular 02/2025',
      cell: (row) =>
        row.frameworkCode ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            {row.frameworkCode}
          </span>
        ) : (
          <span className="text-xs text-slate-400">Not mapped</span>
        ),
    },
    {
      key: 'name',
      header: 'Name',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.name}</div>
          {row.description && <div className="text-xs text-slate-500 line-clamp-1">{row.description}</div>}
        </div>
      ),
    },
    {
      key: 'competencyType',
      header: 'Type',
      cell: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          {row.competencyType}
        </span>
      ),
    },
    {
      key: 'categoryName',
      header: 'Domain / Category',
      cell: (row) => row.categoryName || <span className="text-slate-400">-</span>,
    },
    {
      key: 'criteriaCount',
      header: 'Criteria',
      cell: (row) => (
        <span className="text-xs font-medium text-slate-600">
          {row.criteriaCount ?? 0} criteria
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge label={row.status} variant={getStatusVariant(row.status)} />,
    },
    {
      key: 'actions',
      header: '',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewingCompetencyId(row.id);
            }}
            className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
            title="View Criteria"
          >
            <Eye className="w-4 h-4" />
          </button>
          {canManage && (
            <>
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
            </>
          )}
        </div>
      ),
    },
  ];

  const filters = (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={competencyType}
        onChange={(e) => {
          setCompetencyType(e.target.value);
          setPage(1);
        }}
        className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Types</option>
        <option value="CORE_DIGITAL">Core Digital</option>
        <option value="PROFESSIONAL">Professional</option>
        <option value="INTERNAL">Internal</option>
        <option value="BEHAVIOURAL">Behavioural</option>
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
        <option value="DRAFT">Draft</option>
        <option value="ARCHIVED">Archived</option>
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competency Framework"
        subtitle="Define competencies, proficiency levels, and behavioral criteria"
      >
        {canManage && (
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
          >
            Create Competency
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
        emptyTitle="No competencies found"
        emptyDescription="Get started by defining competencies and proficiency levels."
        pageInfo={{
          page,
          pageSize,
          total: data?.totalItems || 0,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {/* Criteria Details Modal */}
      {viewingCompetencyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setViewingCompetencyId(null)} />
          <div
            className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
            role="dialog"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {detailData?.name || 'Competency Criteria'}
                </h3>
                <p className="text-xs text-slate-500">
                  Code: <span className="font-semibold">{detailData?.code}</span> | Type:{' '}
                  <span className="font-medium">{detailData?.competencyType}</span>
                </p>
              </div>
              <button
                onClick={() => setViewingCompetencyId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-8 text-center text-sm text-slate-500">Loading criteria...</div>
            ) : detailData?.criteria && detailData.criteria.length > 0 ? (
              <div className="space-y-4">
                {detailData.criteria.map((cr) => (
                  <div key={cr.id || cr.indicatorCode} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary-100 text-primary-800">
                        Level {cr.level}
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-600">
                        [{cr.indicatorCode}]
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 mt-1">{cr.behaviorIndicator}</p>
                    {cr.assessmentGuidance && (
                      <div className="mt-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">Assessment: </span>
                        {cr.assessmentGuidance}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-slate-500">
                No criteria defined for this competency yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Dialog */}
      {isFormOpen && (
        <CompetencyFormDialog
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          competency={editingCompetency}
        />
      )}

      {/* Archive Confirm Dialog */}
      {isArchiveOpen && archivingCompetency && (
        <ConfirmActionDialog
          open={isArchiveOpen}
          onClose={() => setIsArchiveOpen(false)}
          onConfirm={handleArchiveConfirm}
          title="Archive Competency"
          description={
            <span>
              Are you sure you want to archive <strong>{archivingCompetency.name}</strong> ({archivingCompetency.code})?
            </span>
          }
          confirmLabel="Archive"
          confirmVariant="danger"
        />
      )}
    </div>
  );
}
