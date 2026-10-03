import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ConfirmActionDialog, DataTable, Modal, PageHeader, StatusBadge, type Column } from '@/components/shared';
import { useAcceptReview, useDismissReview, useRecommendationReviews, useReopenReview } from '@/hooks/use-analytics';
import { useCurrentUser } from '@/hooks/use-current-user';
import { PERMISSIONS } from '@/hooks/use-permission';
import { apiErrorMessage, formatDate } from '@/lib/utils';
import type { RecommendationReviewRow, ReviewStatus } from '@/services/analytics.service';
import { INPUT_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '@/features/onboarding/components/styles';

const PAGE_SIZE = 12;

const STATUS_LABELS: Record<ReviewStatus, string> = {
  PENDING: 'Chờ duyệt',
  ASSIGNED: 'Đã được giao',
  ACCEPTED: 'Đã nhận đề xuất',
  DISMISSED: 'Đã bỏ qua',
};
const STATUS_VARIANTS = { PENDING: 'warning', ASSIGNED: 'info', ACCEPTED: 'success', DISMISSED: 'default' } as const;

/** LCA-11: review the rule-based course suggestions: give the course, or set it aside with a reason. */
export function RecommendationReviewPage() {
  const canAssign = useCurrentUser((s) => s.hasPermission)(PERMISSIONS.COURSE_ASSIGNMENT_CREATE);
  const [status, setStatus] = useState<ReviewStatus | ''>('PENDING');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useRecommendationReviews({ pageIndex: page, pageSize: PAGE_SIZE, status: status || undefined });

  const accept = useAcceptReview();
  const dismiss = useDismissReview();
  const reopen = useReopenReview();
  const [accepting, setAccepting] = useState<RecommendationReviewRow | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [dismissing, setDismissing] = useState<RecommendationReviewRow | null>(null);

  const doAccept = async () => {
    if (!accepting) return;
    try {
      await accept.mutateAsync({ employeeId: accepting.employeeId, courseId: accepting.courseId, dueDate: dueDate || undefined });
      toast.success(`Đã giao ${accepting.courseCode} cho ${accepting.employeeName}.`);
      setAccepting(null);
      setDueDate('');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Không giao được khóa học.'));
    }
  };

  const columns: Column<RecommendationReviewRow>[] = [
    {
      key: 'employee',
      header: 'Nhân viên',
      cell: (r) => (
        <div>
          <Link to={`/enterprise/competency-profiles/${r.employeeId}`} className="font-medium text-slate-900 hover:underline">{r.employeeName}</Link>
          <p className="text-xs text-slate-500">{r.positionName ?? '—'} · {r.departmentName ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'course',
      header: 'Khóa được đề xuất',
      cell: (r) => (
        <div>
          <p className="text-slate-900">{r.title}</p>
          <p className="font-mono text-xs text-slate-500">{r.courseCode}</p>
        </div>
      ),
    },
    {
      key: 'why',
      header: 'Vì sao',
      cell: (r) => (
        <details>
          <summary className="cursor-pointer text-sm text-slate-700">
            Đóng {r.gapsClosed} khoảng trống{r.mandatoryClosed ? `, ${r.mandatoryClosed} bắt buộc` : ''}{r.highClosed ? `, ${r.highClosed} mức cao` : ''}
          </summary>
          <p className="mt-2 text-xs text-slate-600">{r.explanation}</p>
          <ul className="mt-1 list-disc pl-4 text-xs text-slate-600">{r.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        </details>
      ),
    },
    { key: 'score', header: 'Điểm', cell: (r) => <span className="tabular-nums">{r.score.toFixed(1)}</span>, hideOnMobile: true },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (r) => (
        <div>
          <StatusBadge label={STATUS_LABELS[r.status]} variant={STATUS_VARIANTS[r.status]} />
          {r.status === 'DISMISSED' && <p className="mt-1 max-w-48 text-xs text-slate-500">{r.decisionReason} · {r.decidedByName}, {formatDate(r.decidedAt)}</p>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (r) => {
        if (!canAssign) return null;
        if (r.status === 'PENDING') {
          return (
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setAccepting(r)} className={PRIMARY_BUTTON} aria-label={`Giao ${r.courseCode} cho ${r.employeeName}`}>Giao khóa</button>
              <button type="button" onClick={() => setDismissing(r)} className={SECONDARY_BUTTON} aria-label={`Bỏ qua ${r.courseCode} của ${r.employeeName}`}>Bỏ qua</button>
            </div>
          );
        }
        if (r.status === 'DISMISSED') {
          return (
            <button
              type="button"
              className={SECONDARY_BUTTON}
              onClick={() => reopen.mutate({ employeeId: r.employeeId, courseId: r.courseId }, { onSuccess: () => toast.success('Đã mở lại đề xuất.') })}
              aria-label={`Mở lại đề xuất ${r.courseCode} của ${r.employeeName}`}
            >
              Mở lại
            </button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div>
      <PageHeader title="Duyệt đề xuất học tập" subtitle="Hệ thống đề xuất khóa học theo khoảng trống kỹ năng. Quản trị học tập quyết định giao hay bỏ qua." />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        keyExtractor={(r) => `${r.employeeId}:${r.courseId}`}
        isLoading={isLoading}
        emptyTitle={status === 'PENDING' ? 'Không còn đề xuất nào chờ duyệt' : 'Không có đề xuất nào'}
        emptyDescription="Đề xuất mới xuất hiện khi skill gap thay đổi hoặc có nhân viên mới."
        filters={
          <select aria-label="Lọc theo trạng thái" value={status} onChange={(e) => { setStatus(e.target.value as ReviewStatus | ''); setPage(1); }} className={INPUT_CLASS}>
            <option value="">Tất cả</option>
            {(Object.keys(STATUS_LABELS) as ReviewStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        }
        pageInfo={{ page, pageSize: PAGE_SIZE, total: data?.totalItems ?? 0, onPageChange: setPage }}
      />

      <Modal
        open={Boolean(accepting)}
        onClose={() => setAccepting(null)}
        size="sm"
        title="Giao khóa học theo đề xuất"
        description={accepting ? `${accepting.courseCode} · ${accepting.title} cho ${accepting.employeeName}` : undefined}
        footer={
          <>
            <button type="button" onClick={() => setAccepting(null)} className={SECONDARY_BUTTON}>Hủy</button>
            <button type="button" onClick={doAccept} disabled={accept.isPending} className={PRIMARY_BUTTON}>{accept.isPending ? 'Đang giao…' : 'Giao khóa học'}</button>
          </>
        }
      >
        <div className="grid gap-1.5">
          <label htmlFor="review-due" className="text-sm font-medium text-slate-700">Hạn hoàn thành</label>
          <input id="review-due" type="date" min={new Date().toISOString().slice(0, 10)} value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={INPUT_CLASS} />
          <p className="text-xs text-slate-500">Để trống để dùng thời hạn mặc định của tổ chức.</p>
        </div>
      </Modal>

      <ConfirmActionDialog
        open={Boolean(dismissing)}
        onClose={() => setDismissing(null)}
        title="Bỏ qua đề xuất này?"
        description={dismissing ? `${dismissing.courseCode} cho ${dismissing.employeeName}. Đề xuất được giữ lại ở mục "Đã bỏ qua" và có thể mở lại.` : ''}
        confirmLabel="Bỏ qua đề xuất"
        requireReason
        reasonPlaceholder="Ví dụ: đã học khóa tương đương bên ngoài"
        onConfirm={async (reason) => {
          if (!dismissing) return;
          try {
            await dismiss.mutateAsync({ employeeId: dismissing.employeeId, courseId: dismissing.courseId, reason });
            toast.success('Đã bỏ qua đề xuất.');
          } catch (error) {
            toast.error(apiErrorMessage(error, 'Không bỏ qua được đề xuất.'));
          }
        }}
      />
    </div>
  );
}
