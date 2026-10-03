import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { DataTable, type Column, PageHeader, StatusBadge, getStatusVariant, ConfirmActionDialog } from '@/components/shared';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import {
  useQuestionBanks,
  useCreateQuestionBank,
  useQuestionTags,
  useQuestions,
  useDeleteQuestion,
  useApproveQuestion,
} from '@/hooks/use-question-bank';
import type { QuestionDto } from '@/services/question-bank.service';
import { QuestionEditorModal } from '../components/QuestionEditorModal';

export function QuestionBankPage() {
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.QUESTION_CREATE_UPDATE);
  const canApprove = can(PERMISSIONS.QUESTION_APPROVE_PUBLISH);

  const { data: banks, isLoading: banksLoading } = useQuestionBanks();
  const { data: tags } = useQuestionTags();
  const createBank = useCreateQuestionBank();

  const [bankId, setBankId] = useState<string>('');
  const [newBankTitle, setNewBankTitle] = useState('');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;

  const activeBankId = bankId || banks?.items[0]?.id || '';

  const { data: questionPage, isLoading: questionsLoading } = useQuestions(
    activeBankId,
    { pageIndex, pageSize, search: search || undefined },
    tagFilter || undefined,
  );
  const deleteQuestion = useDeleteQuestion(activeBankId);
  const approveQuestion = useApproveQuestion(activeBankId);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuestionDto | null>(null);

  const openCreate = () => {
    setEditingQuestion(null);
    setEditorOpen(true);
  };
  const openEdit = (q: QuestionDto) => {
    setEditingQuestion(q);
    setEditorOpen(true);
  };

  const handleCreateBank = async () => {
    const title = newBankTitle.trim();
    if (!title) return;
    try {
      const res = await createBank.mutateAsync({ title });
      setBankId(res.data.data!.id);
      setNewBankTitle('');
      toast.success('Question bank created');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create question bank');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteQuestion.mutateAsync(deleteTarget.id);
      toast.success('Question deleted');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete question');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleApprove = async (q: QuestionDto) => {
    try {
      await approveQuestion.mutateAsync(q.id);
      toast.success('Question published');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to approve question');
    }
  };

  const columns: Column<QuestionDto>[] = [
      {
        key: 'content',
        header: 'Question',
        cell: (q) => (
          <div className="max-w-md">
            <p className="font-medium text-slate-900 truncate">{q.content}</p>
            <p className="text-xs text-slate-400">{q.questionType.replace('_', ' ')}</p>
          </div>
        ),
      },
      {
        key: 'difficulty',
        header: 'Difficulty',
        cell: (q) => <span className="text-xs text-slate-600">{q.difficulty ?? '—'}</span>,
      },
      {
        key: 'tags',
        header: 'Tags',
        cell: (q) => (
          <div className="flex flex-wrap gap-1">
            {q.tags.length === 0 && <span className="text-xs text-slate-400">—</span>}
            {q.tags.map((t) => (
              <StatusBadge key={t.id} label={t.name} variant="default" />
            ))}
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (q) => <StatusBadge label={q.status} variant={getStatusVariant(q.status)} />,
      },
      {
        key: 'actions',
        header: '',
        className: 'text-right',
        cell: (q) => (
          <div className="flex items-center justify-end gap-2">
            {canApprove && q.status === 'DRAFT' && (
              <button
                title="Publish"
                onClick={() => handleApprove(q)}
                className="text-slate-400 hover:text-success-600"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
            {canManage && (
              <button title="Edit" onClick={() => openEdit(q)} className="text-slate-400 hover:text-primary-600">
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {canManage && q.status === 'DRAFT' && (
              <button
                title="Delete"
                onClick={() => setDeleteTarget(q)}
                className="text-slate-400 hover:text-danger-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ),
      },
  ];

  return (
    <div>
      <PageHeader title="Question Bank" subtitle="Manage reusable assessment questions">
        {canManage && (
          <button
            onClick={openCreate}
            disabled={!activeBankId}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Create Question
          </button>
        )}
      </PageHeader>

      {!banksLoading && banks?.items.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-4">
          <p className="text-sm text-slate-500 mb-3">No question banks yet. Create one to get started.</p>
          {canManage && (
            <div className="flex items-center gap-2">
              <input
                value={newBankTitle}
                onChange={(e) => setNewBankTitle(e.target.value)}
                placeholder="Bank title, e.g. General Aptitude"
                className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleCreateBank}
                disabled={!newBankTitle.trim() || createBank.isPending}
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                Create Bank
              </button>
            </div>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={questionPage?.items ?? []}
          keyExtractor={(q) => q.id}
          isLoading={questionsLoading}
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPageIndex(1);
          }}
          searchPlaceholder="Search questions..."
          emptyTitle="No questions found"
          emptyDescription="Create a question or adjust your filters."
          filters={
            <>
              <select
                value={activeBankId}
                onChange={(e) => {
                  setBankId(e.target.value);
                  setPageIndex(1);
                }}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {banks?.items.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.questionCount})
                  </option>
                ))}
              </select>
              <select
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value);
                  setPageIndex(1);
                }}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All tags</option>
                {tags?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </>
          }
          pageInfo={{
            page: pageIndex,
            pageSize,
            total: questionPage?.totalItems ?? 0,
            onPageChange: setPageIndex,
          }}
        />
      )}

      {editorOpen && (
        <QuestionEditorModal
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          bankId={activeBankId}
          tags={tags ?? []}
          question={editingQuestion}
        />
      )}

      <ConfirmActionDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete question?"
        description="This draft question will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
