import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { DataTable, PageHeader, StatusBadge, getStatusVariant, ConfirmActionDialog, type Column } from '@/components/shared';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { useQuestionBanks, useQuestionTags } from '@/hooks/use-question-banks';
import { useQuestions, useDeleteQuestion, useApproveQuestion } from '@/hooks/use-questions';
import type { QuestionListItem } from '@/services/question-bank.service';
import { QuestionFormDialog } from '../components/QuestionFormDialog';
import { QuestionBankFormDialog } from '../components/QuestionBankFormDialog';

export function QuestionBankPage() {
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.QUESTION_CREATE_UPDATE);
  const canApprove = can(PERMISSIONS.QUESTION_APPROVE_PUBLISH);

  const { data: banksData, isLoading: banksLoading } = useQuestionBanks({ pageIndex: 1, pageSize: 100 });
  const { data: tagsData } = useQuestionTags();
  const tags = tagsData?.items ?? [];

  const [selectedBankId, setSelectedBankId] = useState('');
  const [isBankFormOpen, setIsBankFormOpen] = useState(false);

  const activeBankId = selectedBankId || banksData?.items[0]?.id || '';

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const { data: questionsData, isLoading: questionsLoading } = useQuestions(activeBankId, {
    pageIndex: page,
    pageSize,
    search,
    tagId: tagFilter || undefined,
  });

  const deleteMutation = useDeleteQuestion(activeBankId);
  const approveMutation = useApproveQuestion(activeBankId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionListItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState<QuestionListItem | null>(null);

  const handleEdit = (q: QuestionListItem) => {
    setEditingQuestion(q);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (q: QuestionListItem) => {
    setDeletingQuestion(q);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingQuestion) return;
    try {
      await deleteMutation.mutateAsync(deletingQuestion.id);
      toast.success('Question deleted successfully');
    } catch {
      toast.error('Failed to delete question');
    } finally {
      setIsDeleteOpen(false);
      setDeletingQuestion(null);
    }
  };

  const handleApprove = async (q: QuestionListItem) => {
    try {
      await approveMutation.mutateAsync(q.id);
      toast.success('Question published successfully');
    } catch {
      toast.error('Failed to publish question');
    }
  };

  const columns: Column<QuestionListItem>[] = [
    {
      key: 'content',
      header: 'Question',
      cell: (row) => (
        <div className="max-w-md">
          <p className="font-medium text-slate-900 truncate">{row.content}</p>
          <p className="text-xs text-slate-400">{row.questionType.replace('_', ' ')}</p>
        </div>
      ),
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      cell: (row) => <span className="text-xs text-slate-600">{row.difficulty || '—'}</span>,
    },
    {
      key: 'tags',
      header: 'Tags',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.tags.length === 0 && <span className="text-xs text-slate-400">—</span>}
          {row.tags.map((t) => (
            <StatusBadge key={t.id} label={t.name} variant="default" />
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge label={row.status} variant={getStatusVariant(row.status)} />,
    },
  ];

  if (canManage || canApprove) {
    columns.push({
      key: 'actions',
      header: '',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          {canApprove && row.status === 'DRAFT' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleApprove(row);
              }}
              className="p-1 text-slate-400 hover:text-success-600 transition-colors"
              title="Publish"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
          {canManage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row);
              }}
              className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {canManage && row.status === 'DRAFT' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(row);
              }}
              className="p-1 text-slate-400 hover:text-danger-600 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Question Bank" subtitle="Manage reusable assessment questions">
        {canManage && (
          <button
            onClick={() => {
              setEditingQuestion(null);
              setIsFormOpen(true);
            }}
            disabled={!activeBankId}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Create Question
          </button>
        )}
      </PageHeader>

      {!banksLoading && banksData?.items.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-500 mb-3">No question banks yet. Create one to get started.</p>
          {canManage && (
            <button
              onClick={() => setIsBankFormOpen(true)}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
            >
              Create Question Bank
            </button>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={questionsData?.items ?? []}
          keyExtractor={(row) => row.id}
          isLoading={questionsLoading}
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search questions..."
          emptyTitle="No questions found"
          emptyDescription="Create a question or adjust your filters."
          filters={
            <>
              <select
                value={activeBankId}
                onChange={(e) => {
                  setSelectedBankId(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {banksData?.items.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.questionCount})
                  </option>
                ))}
              </select>
              <select
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All tags</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </>
          }
          pageInfo={{
            page,
            pageSize,
            total: questionsData?.totalItems || 0,
            onPageChange: setPage,
            onPageSizeChange: setPageSize,
          }}
        />
      )}

      {isFormOpen && (
        <QuestionFormDialog
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          bankId={activeBankId}
          tags={tags}
          question={editingQuestion}
        />
      )}

      {isBankFormOpen && (
        <QuestionBankFormDialog
          open={isBankFormOpen}
          onClose={() => setIsBankFormOpen(false)}
          onCreated={(bankId) => setSelectedBankId(bankId)}
        />
      )}

      {isDeleteOpen && deletingQuestion && (
        <ConfirmActionDialog
          open={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Question"
          description={
            <span>
              Are you sure you want to delete this draft question? This action cannot be undone.
            </span>
          }
          confirmLabel="Delete"
          confirmVariant="danger"
        />
      )}
    </div>
  );
}
