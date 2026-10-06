import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ArrowRight } from 'lucide-react';
import { PageHeader, DataTable } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useReviewQueue } from '@/hooks/use-tasks';
import { formatDate } from '@/lib/utils';
import type { ReviewQueueItemDto } from '@/services/task.service';

export function ReviewQueuePage() {
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(1);

  const { data, isLoading } = useReviewQueue({
    search: search || undefined,
    pageIndex,
    pageSize: 15,
  });

  const columns = [
    {
      key: 'employee',
      header: 'Nhân sự nộp bài',
      cell: (row: ReviewQueueItemDto) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
            {row.employeeName.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900">{row.employeeName}</p>
            <p className="text-xs text-slate-500 font-mono">
              {row.employeeCode} {row.departmentName && `• ${row.departmentName}`}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'task',
      header: 'Bài thực hành / Dự án',
      cell: (row: ReviewQueueItemDto) => (
        <div className="space-y-1">
          <p className="font-medium text-sm text-slate-900">{row.taskTitle}</p>
          <div className="flex items-center gap-2">
            <LevelBadge level={row.targetLevel} />
            {row.taskDueDate && (
              <span className="text-xs text-slate-400">
                Hạn: {formatDate(row.taskDueDate)}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'submittedAt',
      header: 'Thời điểm nộp',
      cell: (row: ReviewQueueItemDto) => (
        <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
          <Clock className="size-3.5 text-slate-400" />
          {formatDate(row.submittedAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (row: ReviewQueueItemDto) => (
        <Link
          to={`/enterprise/reviews/${row.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <span>Chấm điểm</span>
          <ArrowRight className="size-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Hàng chờ đánh giá minh chứng"
          subtitle="Danh sách các bài thực hành và dự án của nhân sự đang chờ Manager phê duyệt và ghi nhận năng lực số."
        />
        <Link
          to="/enterprise/tasks"
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition shrink-0"
        >
          <span>Tất cả bài thực hành</span>
        </Link>
      </div>

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
            placeholder="Tìm theo tên nhân viên, bài tập…"
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Chờ chấm: <span className="font-bold text-slate-900">{data?.totalItems ?? 0}</span> bài nộp
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          keyExtractor={(row) => row.id}
          emptyTitle="Hàng chờ trống — Tất cả bài tập đã được chấm điểm!"
          pageInfo={{ page: pageIndex, pageSize: 15, total: data?.totalItems ?? 0, onPageChange: setPageIndex }}
        />
      </div>
    </div>
  );
}
