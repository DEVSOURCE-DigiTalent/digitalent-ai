import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, CheckCircle2, XCircle, Search, ArrowRight,
} from 'lucide-react';
import { PageHeader, StatusBadge, DataTable } from '@/components/shared';
import { useAssessmentHistory } from '@/hooks/use-learning';
import { formatDate } from '@/lib/utils';
import type { AssessmentAttemptRowDto } from '@/services/learning.service';

export function AssessmentHistoryPage() {
  const [search, setSearch] = useState('');
  const [passed, setPassed] = useState<string>('');
  const [pageIndex, setPageIndex] = useState(1);

  const { data, isLoading } = useAssessmentHistory({
    search: search || undefined,
    passed: passed || undefined,
    pageIndex,
    pageSize: 10,
  });

  const columns = [
    {
      key: 'courseTitle',
      header: 'Khóa học / Bài đánh giá',
      cell: (row: AssessmentAttemptRowDto) => (
        <div>
          <p className="font-semibold text-sm text-slate-900">{row.courseTitle}</p>
          <p className="text-xs text-slate-500 font-mono">Mã bài: {row.assessmentId}</p>
        </div>
      ),
    },
    {
      key: 'score',
      header: 'Kết quả',
      cell: (row: AssessmentAttemptRowDto) => (
        <div className="flex items-center gap-2">
          {row.passed ? (
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="size-4 text-rose-600 shrink-0" />
          )}
          <span className="font-bold text-sm text-slate-900">{row.score}%</span>
          <span className="text-xs text-slate-500">
            ({row.correctAnswers}/{row.totalQuestions} câu)
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (row: AssessmentAttemptRowDto) => (
        <StatusBadge
          variant={row.passed ? 'success' : 'danger'}
          label={row.passed ? 'Đạt' : 'Chưa đạt'}
        />
      ),
    },
    {
      key: 'duration',
      header: 'Thời gian làm',
      cell: (row: AssessmentAttemptRowDto) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Clock className="size-3.5 text-slate-400" />
          {Math.floor(row.durationSeconds / 60)} phút {row.durationSeconds % 60}s
        </span>
      ),
    },
    {
      key: 'submittedAt',
      header: 'Ngày nộp',
      cell: (row: AssessmentAttemptRowDto) => (
        <span className="text-xs text-slate-600 font-medium">
          {formatDate(row.submittedAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (row: AssessmentAttemptRowDto) => (
        <Link
          to={`/enterprise/me/assessments/${row.courseId}`}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span>Chi tiết</span>
          <ArrowRight className="size-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch sử bài đánh giá"
        subtitle="Theo dõi toàn bộ các lần làm bài kiểm tra năng lực và kết quả đạt chuẩn của bạn."
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(1);
            }}
            placeholder="Tìm theo tên khóa học…"
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={passed}
            onChange={(e) => {
              setPassed(e.target.value);
              setPageIndex(1);
            }}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700"
          >
            <option value="">Tất cả kết quả</option>
            <option value="true">Chỉ bài đạt (≥ 70%)</option>
            <option value="false">Chỉ bài chưa đạt</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 bg-slate-100 animate-pulse rounded-xl" />
      ) : (
        <DataTable
          data={data?.items ?? []}
          columns={columns}
          keyExtractor={(row) => row.id}
          emptyTitle="Chưa có lịch sử làm bài đánh giá nào."
        />
      )}
    </div>
  );
}
