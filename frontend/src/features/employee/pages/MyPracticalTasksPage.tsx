import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ArrowRight, Upload, FileText, AlertCircle } from 'lucide-react';
import { EmptyState, PageHeader, StatusBadge } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useMyTasks } from '@/hooks/use-me';
import type { MyTaskCard } from '@/services/me.service';
import { taskStatus } from '@/lib/me-labels';
import { formatDate } from '@/lib/utils';

type Filter = 'ALL' | 'TODO' | 'SUBMITTED' | 'DONE';

const matches = (task: MyTaskCard, filter: Filter) =>
  filter === 'ALL'
  || (filter === 'TODO' && task.canSubmit)
  || (filter === 'SUBMITTED' && task.status === 'SUBMITTED')
  || (filter === 'DONE' && (task.status === 'PASSED' || task.status === 'FAILED'));

/** EM-14: Nhiệm vụ của tôi — nhiệm vụ thực tế được giao, hạn nộp và trạng thái đánh giá. */
export function MyPracticalTasksPage() {
  const { data, isLoading, isError, refetch } = useMyTasks();
  const [filter, setFilter] = useState<Filter>('ALL');

  const tasks = (data?.items ?? []).filter((task) => matches(task, filter));
  const summary = data?.summary;
  const tabs: { id: Filter; label: string; count?: number }[] = [
    { id: 'ALL', label: 'Tất cả', count: summary?.total },
    { id: 'TODO', label: 'Cần làm', count: summary?.toDo },
    { id: 'SUBMITTED', label: 'Đang chờ chấm', count: summary?.pendingReview },
    { id: 'DONE', label: 'Đã có kết quả', count: summary ? summary.passed + summary.failed : undefined },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Nhiệm vụ thực tế của tôi"
          subtitle="Áp dụng kiến thức đã học vào công việc thực tế và nộp minh chứng để được quản lý đánh giá."
        />
        <Link
          to="/enterprise/me/evidence"
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition shrink-0"
        >
          <FileText className="size-4 text-blue-600" />
          <span>Dòng thời gian minh chứng</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              filter === tab.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 hover:bg-slate-100 border border-transparent'
            }`}
          >
            {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="Đang tải nhiệm vụ">
          <div className="h-56 bg-slate-100 animate-pulse rounded-2xl" />
          <div className="h-56 bg-slate-100 animate-pulse rounded-2xl" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={<AlertCircle className="size-12 text-slate-300 mx-auto" />}
          title="Không tải được nhiệm vụ"
          description="Có lỗi khi tải dữ liệu. Vui lòng thử lại."
          action={
            <button type="button" onClick={() => refetch()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Thử lại
            </button>
          }
        />
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4 max-w-md mx-auto">
          <ClipboardList className="size-16 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-lg">{data?.items.length ? 'Không có nhiệm vụ trong mục này' : 'Chưa có nhiệm vụ thực tế nào'}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">Quản lý trực tiếp sẽ giao nhiệm vụ thực tế khi bạn hoàn thành các khóa đào tạo tương ứng.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => {
            const status = taskStatus(task.status);
            const evaluation = task.latestSubmission?.evaluation;
            return (
              <div key={task.assignmentId} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-5 hover:border-blue-300 transition shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {task.targetLevel > 0 && <LevelBadge level={task.targetLevel} />}
                      <span className={`text-xs font-medium ${task.isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                        Hạn: {formatDate(task.dueAt)}{task.isOverdue ? ' (quá hạn)' : ''}
                      </span>
                    </div>
                    <StatusBadge
                      variant={status.variant}
                      label={evaluation?.score != null && task.status !== 'SUBMITTED' ? `${status.label} (${evaluation.score}đ)` : status.label}
                    />
                  </div>

                  <Link to={`/enterprise/me/tasks/${task.assignmentId}`} className="block font-bold text-slate-900 text-base leading-snug hover:text-blue-600 transition">
                    {task.title}
                  </Link>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{task.description}</p>

                  <div className="pt-1 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Yêu cầu đầu ra:</p>
                    <p className="text-xs font-medium text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200 line-clamp-2">{task.expectedOutput}</p>
                  </div>

                  {task.targets.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {task.targets.map((target) => (
                        <span key={target.competencyId} className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium" title={target.name}>
                          <span className="font-mono font-bold">{target.code}</span> → mức {target.targetLevel}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    Giao bởi: <span className="font-semibold text-slate-700">{task.assignedByName ?? '—'}</span>
                    {task.submissionCount > 0 ? ` · ${task.submissionCount} lần nộp` : ''}
                  </span>

                  {task.canSubmit ? (
                    <Link
                      to={`/enterprise/me/tasks/${task.assignmentId}/submit`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition shrink-0"
                    >
                      <Upload className="size-3.5" />
                      <span>{task.status === 'NEEDS_REVISION' ? 'Nộp lại bài' : 'Nộp minh chứng'}</span>
                    </Link>
                  ) : (
                    <Link
                      to={`/enterprise/me/tasks/${task.assignmentId}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition shrink-0"
                    >
                      <span>Xem chi tiết</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
