import { Link } from 'react-router-dom';
import {
  ClipboardList, ArrowRight, Upload, FileText,
} from 'lucide-react';
import { PageHeader, StatusBadge } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useMyTasks } from '@/hooks/use-tasks';
import { formatDate } from '@/lib/utils';

export function MyPracticalTasksPage() {
  const { data, isLoading } = useMyTasks();

  const tasks = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Nhiệm vụ thực hành của tôi"
          subtitle="Áp dụng kiến thức đã học vào các tình huống thực tế và dự án công việc để được công nhận chuẩn năng lực số."
        />
        <Link
          to="/enterprise/me/evidence"
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition shrink-0"
        >
          <FileText className="size-4 text-blue-600" />
          <span>Hồ sơ minh chứng đã nộp</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-56 bg-slate-100 animate-pulse rounded-2xl" />
          <div className="h-56 bg-slate-100 animate-pulse rounded-2xl" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4 max-w-md mx-auto">
          <ClipboardList className="size-16 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-lg">Chưa có nhiệm vụ thực hành nào</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Quản lý trực tiếp sẽ giao bài thực hành tình huống khi bạn hoàn thành các khóa đào tạo tương ứng.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => {
            const sub = task.submission;
            const isApproved = sub?.status === 'APPROVED';
            const isPending = sub?.status === 'PENDING_REVIEW';
            const isRevision = sub?.status === 'REVISION_REQUESTED';
            const notSubmitted = !sub;

            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-5 hover:border-blue-300 transition shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <LevelBadge level={task.targetLevel} />
                      <span className="text-xs text-slate-500 font-medium">
                        Hạn: {formatDate(task.dueDate)}
                      </span>
                    </div>

                    <StatusBadge
                      variant={
                        isApproved
                          ? 'success'
                          : isRevision
                          ? 'warning'
                          : isPending
                          ? 'info'
                          : 'default'
                      }
                      label={
                        isApproved
                          ? `Đã duyệt (${sub.evaluation?.score ?? 0}đ)`
                          : isRevision
                          ? 'Cần chỉnh sửa'
                          : isPending
                          ? 'Đang chấm điểm'
                          : 'Chưa nộp bài'
                      }
                    />
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {task.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>

                  <div className="pt-1 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Yêu cầu đầu ra:
                    </p>
                    <p className="text-xs font-medium text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200 line-clamp-1">
                      {task.expectedOutput}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {(task.competencyIds ?? []).map((code) => (
                      <span
                        key={code}
                        className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-bold"
                      >
                        TT02-{code.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Giao bởi: <span className="font-semibold text-slate-700">{task.assignedByName}</span>
                  </span>

                  {notSubmitted || isRevision ? (
                    <Link
                      to={`/enterprise/me/tasks/${task.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                    >
                      <Upload className="size-3.5" />
                      <span>{isRevision ? 'Nộp lại bài' : 'Nộp minh chứng'}</span>
                    </Link>
                  ) : (
                    <Link
                      to={`/enterprise/me/tasks/${task.id}/feedback`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition"
                    >
                      <span>Xem phản hồi</span>
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
