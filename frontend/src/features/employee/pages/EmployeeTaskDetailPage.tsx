import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, User, CheckCircle2, Clock, AlertTriangle, Send, MessageSquare, Award,
} from 'lucide-react';
import { EmptyState } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { usePracticalTask, useMyTasks } from '@/hooks/use-tasks';
import { formatDate } from '@/lib/utils';

export function EmployeeTaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: task, isLoading } = usePracticalTask(id);
  const { data: myTasksData } = useMyTasks();

  const myTask = myTasksData?.items?.find((t) => t.id === id);
  const sub = myTask?.submission;
  const submission = sub;

  if (isLoading) {
    return (
      <div className="space-y-6 pb-16">
        <div className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="space-y-6 pb-16">
        <Link
          to="/enterprise/me/tasks"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="size-4" /> Quay lại danh sách nhiệm vụ
        </Link>
        <EmptyState
          title="Không tìm thấy nhiệm vụ"
          description="Nhiệm vụ này không tồn tại hoặc bạn không được phân công."
        />
      </div>
    );
  }

  const isApproved = submission?.status === 'APPROVED';
  const isRevision = submission?.status === 'REVISION_REQUESTED';
  const isPending = submission?.status === 'PENDING_REVIEW';
  const hasSubmitted = Boolean(submission);

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      <Link
        to="/enterprise/me/tasks"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition font-medium"
      >
        <ArrowLeft className="size-4" /> Quay lại nhiệm vụ của tôi
      </Link>

      {/* Task Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                Nhiệm vụ thực tế
              </span>
              <LevelBadge level={task.targetLevel} />
              {isApproved && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="size-3.5" /> Đã xác nhận đạt
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  <Clock className="size-3.5" /> Đang chờ đánh giá
                </span>
              )}
              {isRevision && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <AlertTriangle className="size-3.5" /> Cần chỉnh sửa lại
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{task.title}</h1>
          </div>

          {/* Action CTA */}
          <div className="shrink-0 flex items-center gap-2">
            {!hasSubmitted ? (
              <Link
                to={`/enterprise/me/tasks/${task.id}/submit`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-xs transition"
              >
                <Send className="size-4" />
                <span>Nộp minh chứng</span>
              </Link>
            ) : isRevision ? (
              <Link
                to={`/enterprise/me/tasks/${task.id}/submit`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-xl shadow-xs transition"
              >
                <Send className="size-4" />
                <span>Nộp lại minh chứng</span>
              </Link>
            ) : null}
          </div>
        </div>

        {/* Task Meta details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <User className="size-4 text-slate-400" />
            <span>Người giao: <strong>{task.assignedByName || 'Quản lý phòng ban'}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-slate-400" />
            <span>Hạn nộp: <strong>{formatDate(task.dueDate)}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="size-4 text-slate-400" />
            <span>Trình độ mục tiêu: <strong>Cấp độ {task.targetLevel}</strong></span>
          </div>
        </div>

        {/* Task Description */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 text-sm">Mô tả công việc:</h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{task.description}</p>
        </div>

        {/* Expected Output */}
        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 space-y-1 text-xs">
          <h4 className="font-bold text-blue-900">Sản phẩm đầu ra yêu cầu:</h4>
          <p className="text-blue-800 leading-relaxed">{task.expectedOutput}</p>
        </div>

        {/* Rubric Criteria */}
        {task.rubricCriteria && task.rubricCriteria.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 text-sm">Tiêu chí đánh giá & rubric:</h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {task.rubricCriteria.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between gap-4 bg-slate-50/30">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-800">{c.label}</p>
                    <p className="text-xs text-slate-500">{c.description}</p>
                  </div>
                  <span className="font-bold text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded shrink-0">
                    {c.maxPoints} điểm
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submission Status Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Trạng thái bài nộp của bạn</h3>

        {!sub ? (
          <div className="py-8 text-center text-slate-500 space-y-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Clock className="size-10 text-slate-300 mx-auto" />
            <p className="text-sm font-medium">Bạn chưa nộp minh chứng cho nhiệm vụ này.</p>
            <Link
              to={`/enterprise/me/tasks/${task.id}/submit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition"
            >
              <Send className="size-3.5" /> Nộp minh chứng ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">
                  Ngày nộp: <strong>{formatDate(sub.submittedAt)}</strong>
                </span>
                <span className="font-semibold text-slate-700">
                  Trạng thái: {sub.status}
                </span>
              </div>
              <div>
                <p className="font-semibold text-slate-700 mb-1">Nội dung báo cáo:</p>
                <p className="text-slate-600 whitespace-pre-line bg-white p-3 rounded-lg border border-slate-200">
                  {sub.content}
                </p>
              </div>
              {sub.linkUrls && sub.linkUrls.length > 0 && (
                <div>
                  <p className="font-semibold text-slate-700 mb-1">Liên kết minh chứng:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-600">
                    {sub.linkUrls.map((url, i) => (
                      <li key={i}>
                        <a href={url} target="_blank" rel="noreferrer" className="hover:underline">
                          {url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Evaluation feedback if exists */}
            {sub.evaluation && (
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-indigo-900 flex items-center gap-1.5">
                    <MessageSquare className="size-4" /> Đánh giá từ: {sub.evaluation.evaluatedBy}
                  </span>
                  <span className="font-black text-sm text-indigo-700">
                    Điểm: {sub.evaluation.score} / 100
                  </span>
                </div>
                <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-indigo-100">
                  {sub.evaluation.feedback || 'Không có nhận xét thêm.'}
                </p>
                <div className="pt-2 flex justify-end">
                  <Link
                    to={`/enterprise/me/tasks/${task.id}/feedback`}
                    className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                  >
                    Xem toàn bộ phiếu đánh giá &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
