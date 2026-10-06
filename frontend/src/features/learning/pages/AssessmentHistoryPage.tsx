import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { PageHeader, StatusBadge, DataTable, type Column } from '@/components/shared';
import { useAttemptHistory } from '@/hooks/use-me';
import type { MyAttemptHistoryRow } from '@/services/me.service';
import { ASSESSMENT_TYPE_LABELS, formatDuration } from '@/lib/me-labels';
import { formatDateTime } from '@/lib/utils';

const PAGE_SIZE = 10;

const columns: Column<MyAttemptHistoryRow>[] = [
  {
    key: 'assessment',
    header: 'Bài đánh giá',
    cell: (row) => (
      <div>
        <p className="font-semibold text-sm text-slate-900">{row.assessmentTitle}</p>
        <p className="text-xs text-slate-500">
          {row.courseCode} · {ASSESSMENT_TYPE_LABELS[row.assessmentType] ?? row.assessmentType} · Lần {row.attemptNo}
        </p>
      </div>
    ),
  },
  {
    key: 'score',
    header: 'Kết quả',
    cell: (row) => row.status === 'SCORED' ? (
      <div className="flex items-center gap-2">
        {row.passed ? <CheckCircle2 className="size-4 text-emerald-600 shrink-0" /> : <XCircle className="size-4 text-rose-600 shrink-0" />}
        <span className="font-bold text-sm text-slate-900">{row.score}%</span>
        <span className="text-xs text-slate-500">({row.correctCount}/{row.totalQuestions} câu)</span>
      </div>
    ) : <span className="text-xs text-slate-500">—</span>,
  },
  {
    key: 'status',
    header: 'Trạng thái',
    cell: (row) => row.status === 'SCORED'
      ? <StatusBadge variant={row.passed ? 'success' : 'danger'} label={row.passed ? 'Đạt' : 'Chưa đạt'} />
      : <StatusBadge variant="warning" label="Đang làm dở" />,
  },
  {
    key: 'duration',
    header: 'Thời gian làm',
    hideOnMobile: true,
    cell: (row) => (
      <span className="text-xs text-slate-600 flex items-center gap-1">
        <Clock className="size-3.5 text-slate-400" />
        {row.submittedAt ? formatDuration(row.durationSeconds) : '—'}
      </span>
    ),
  },
  {
    key: 'submittedAt',
    header: 'Thời điểm',
    hideOnMobile: true,
    cell: (row) => <span className="text-xs text-slate-600 font-medium">{formatDateTime(row.submittedAt ?? row.startedAt)}</span>,
  },
  {
    key: 'actions',
    header: '',
    cell: (row) => row.status === 'SCORED' ? (
      <Link
        to={`/enterprise/me/assessments/${row.assessmentId}/result?attempt=${row.attemptId}`}
        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        <span>Xem kết quả</span>
        <ArrowRight className="size-3.5" />
      </Link>
    ) : (
      <Link
        to={`/enterprise/me/assessments/${row.assessmentId}/attempt?attempt=${row.attemptId}`}
        className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1"
      >
        <span>Làm tiếp</span>
        <ArrowRight className="size-3.5" />
      </Link>
    ),
  },
];

/** EM-13: Lịch sử đánh giá — mọi lần làm bài của chính mình. */
export function AssessmentHistoryPage() {
  const [search, setSearch] = useState('');
  const [passed, setPassed] = useState<'' | 'true' | 'false'>('');
  const [pageIndex, setPageIndex] = useState(1);

  const { data, isLoading } = useAttemptHistory({
    search: search.trim() || undefined,
    passed: passed === '' ? undefined : passed === 'true',
    pageIndex,
    pageSize: PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      <Link to="/enterprise/me/assessments" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition">
        <ArrowLeft className="size-4" /> Danh sách bài đánh giá
      </Link>
      <PageHeader title="Lịch sử bài đánh giá" subtitle="Toàn bộ các lần làm bài đánh giá năng lực và kết quả của bạn." />

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        keyExtractor={(row) => row.attemptId}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPageIndex(1);
        }}
        searchPlaceholder="Tìm theo bài đánh giá hoặc khóa học…"
        filters={
          <select
            value={passed}
            onChange={(e) => {
              setPassed(e.target.value as '' | 'true' | 'false');
              setPageIndex(1);
            }}
            aria-label="Lọc theo kết quả"
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700"
          >
            <option value="">Tất cả kết quả</option>
            <option value="true">Chỉ bài đạt</option>
            <option value="false">Chỉ bài chưa đạt</option>
          </select>
        }
        emptyTitle="Chưa có lần làm bài đánh giá nào."
        pageInfo={{
          page: data?.pageIndex ?? pageIndex,
          pageSize: data?.pageSize ?? PAGE_SIZE,
          total: data?.totalItems ?? 0,
          onPageChange: setPageIndex,
        }}
      />
    </div>
  );
}
