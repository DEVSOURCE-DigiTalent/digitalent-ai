import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PageHeader, DataTable } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { usePracticalTasks } from '@/hooks/use-tasks';
import { formatDate } from '@/lib/utils';
import type { PracticalTaskDto } from '@/services/task.service';

export function PracticalTaskListPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [pageIndex, setPageIndex] = useState(1);

  const { data, isLoading } = usePracticalTasks({
    search: search || undefined,
    status: status || undefined,
    pageIndex,
    pageSize: 15,
  });

  const columns = [
    {
      key: 'title',
      header: 'Bài thực hành / Dự án',
      cell: (row: PracticalTaskDto) => (
        <div className="space-y-1">
          <Link
            to={`/enterprise/tasks/${row.id}`}
            className="font-semibold text-sm text-slate-900 hover:text-blue-600 transition inline-block"
          >
            {row.title}
          </Link>
          <div className="flex items-center gap-2">
            <LevelBadge level={row.targetLevel} />
            {row.departmentName && (
              <span className="text-xs text-slate-500 font-medium">
                {row.departmentName}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'competencies',
      header: 'Năng lực mục tiêu',
      cell: (row: PracticalTaskDto) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.competencyIds.map((code) => (
            <span
              key={code}
              className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-medium"
            >
              {code.toUpperCase()}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'assigned',
      header: 'Nhân sự thực hiện',
      cell: (row: PracticalTaskDto) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <Users className="size-3.5 text-slate-400" />
          <span>{row.assignedEmployeesCount} nhân sự</span>
        </div>
      ),
    },
    {
      key: 'submissions',
      header: 'Tiến độ nộp bài',
      cell: (row: PracticalTaskDto) => {
        const pending = row.pendingReviewCount ?? 0;
        const approved = row.approvedCount ?? 0;
        const total = row.submissionsCount ?? 0;

        return (
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-700">
              Đã nộp: <span className="font-bold">{total}</span> / {row.assignedEmployeesCount}
            </div>
            <div className="flex items-center gap-1.5">
              {pending > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                  {pending} chờ chấm
                </span>
              )}
              {approved > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                  {approved} đã duyệt
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'dueDate',
      header: 'Hạn nộp',
      cell: (row: PracticalTaskDto) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Clock className="size-3.5 text-slate-400" />
          {formatDate(row.dueDate)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (row: PracticalTaskDto) => (
        <Link
          to={`/enterprise/tasks/${row.id}`}
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Nhiệm vụ & Bài tập thực hành"
          subtitle="Giao bài tập tình huống, dự án thực tế để nhân viên áp dụng Khung chuẩn năng lực số vào công việc hàng ngày."
        />
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/enterprise/reviews"
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition"
          >
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>Hàng chờ chấm điểm</span>
          </Link>
          <Link
            to="/enterprise/tasks/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm transition"
          >
            <Plus className="size-4" />
            <span>Giao bài tập mới</span>
          </Link>
        </div>
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
            placeholder="Tìm theo tiêu đề bài thực hành…"
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPageIndex(1);
            }}
            aria-label="Lọc theo trạng thái"
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang kích hoạt</option>
            <option value="ARCHIVED">Đã lưu trữ</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          keyExtractor={(row) => row.id}
          emptyTitle="Chưa có bài thực hành nào"
          pageInfo={{ page: pageIndex, pageSize: 15, total: data?.totalItems ?? 0, onPageChange: setPageIndex }}
        />
      </div>
    </div>
  );
}
