import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Send, MessageSquare, Award, BookOpen, UserCheck } from 'lucide-react';
import { EmptyState, StatusBadge } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useMyTask } from '@/hooks/use-me';
import { submissionStatus, taskStatus } from '@/lib/me-labels';
import { apiErrorMessage, formatDate, formatDateTime } from '@/lib/utils';
import { TaskAttachments } from '../components/TaskAttachments';

/** EM-15: Chi tiết nhiệm vụ của tôi — yêu cầu, tiêu chí chấm và lịch sử bài nộp của chính mình. */
export function EmployeeTaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: task, isLoading, isError, error } = useMyTask(id);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-16" aria-label="Đang tải nhiệm vụ">
        <div className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="space-y-6 pb-16">
        <Link to="/enterprise/me/tasks" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="size-4" /> Quay lại danh sách nhiệm vụ
        </Link>
        <EmptyState title="Không tìm thấy nhiệm vụ" description={apiErrorMessage(error, 'Nhiệm vụ này không tồn tại hoặc không được giao cho bạn.')} />
      </div>
    );
  }

  const status = taskStatus(task.status);
  const latest = task.latestSubmission;
  const hasEvaluation = task.submissions.some((s) => s.evaluation);

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      <Link to="/enterprise/me/tasks" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition font-medium">
        <ArrowLeft className="size-4" /> Quay lại nhiệm vụ của tôi
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">Nhiệm vụ thực tế</span>
              <StatusBadge variant={status.variant} label={status.label} />
              {task.isOverdue && <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Quá hạn</span>}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{task.title}</h1>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {task.canSubmit && (
              <Link
                to={`/enterprise/me/tasks/${task.assignmentId}/submit`}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-white font-medium text-sm rounded-xl shadow-xs transition ${
                  task.status === 'NEEDS_REVISION' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Send className="size-4" />
                <span>{task.status === 'NEEDS_REVISION' ? 'Nộp lại minh chứng' : 'Nộp minh chứng'}</span>
              </Link>
            )}
            {hasEvaluation && (
              <Link
                to={`/enterprise/me/tasks/${task.assignmentId}/feedback`}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition"
              >
                <MessageSquare className="size-4" />
                <span>Xem phản hồi</span>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2"><User className="size-4 text-slate-400" /><span>Người giao: <strong>{task.assignedByName ?? '—'}</strong></span></div>
          <div className="flex items-center gap-2"><UserCheck className="size-4 text-slate-400" /><span>Người chấm: <strong>{task.reviewerName ?? '—'}</strong></span></div>
          <div className="flex items-center gap-2"><Calendar className="size-4 text-slate-400" /><span>Hạn nộp: <strong>{formatDate(task.dueAt)}</strong></span></div>
          <div className="flex items-center gap-2"><Award className="size-4 text-slate-400" /><span>Mức mục tiêu: <LevelBadge level={task.targetLevel} /></span></div>
        </div>
        {task.courseTitle && (
          <p className="text-xs text-slate-500 flex items-center gap-1.5"><BookOpen className="size-3.5" /> Gắn với khóa học: {task.courseTitle}</p>
        )}

        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 text-sm">Mô tả công việc:</h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{task.description}</p>
        </div>

        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 space-y-1 text-xs">
          <h4 className="font-bold text-blue-900">Sản phẩm đầu ra yêu cầu:</h4>
          <p className="text-blue-800 leading-relaxed whitespace-pre-line">{task.expectedOutput}</p>
        </div>

        {task.targets.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Năng lực được đánh giá:</h3>
            <ul className="space-y-1.5 text-sm">
              {task.targets.map((target) => (
                <li key={target.competencyId} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-700"><span className="font-mono font-bold text-blue-700 text-xs">{target.code}</span> {target.name}</span>
                  <LevelBadge level={target.targetLevel} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {task.rubric.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 text-sm">Tiêu chí đánh giá:</h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {task.rubric.map((criterion) => (
                <div key={criterion.id} className="p-4 flex items-center justify-between gap-4 bg-slate-50/30">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-800">{criterion.label}</p>
                    {criterion.description && <p className="text-xs text-slate-500">{criterion.description}</p>}
                  </div>
                  {criterion.maxPoints > 0 && (
                    <span className="font-bold text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded shrink-0">{criterion.maxPoints} điểm</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Bài nộp của bạn</h3>

        {!latest ? (
          <div className="py-8 text-center text-slate-500 space-y-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Clock className="size-10 text-slate-300 mx-auto" />
            <p className="text-sm font-medium">Bạn chưa nộp minh chứng cho nhiệm vụ này.</p>
            {task.canSubmit && (
              <Link
                to={`/enterprise/me/tasks/${task.assignmentId}/submit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition"
              >
                <Send className="size-3.5" /> Nộp minh chứng ngay
              </Link>
            )}
          </div>
        ) : (
          <ol className="space-y-4">
            {task.submissions.map((submission) => {
              const subStatus = submissionStatus(submission.status);
              return (
                <li key={submission.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className="text-slate-600">Lần {submission.versionNo} · nộp <strong>{formatDateTime(submission.submittedAt)}</strong></span>
                    <StatusBadge variant={subStatus.variant} label={subStatus.label} />
                  </div>
                  {submission.note && (
                    <p className="text-slate-700 whitespace-pre-line bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">{submission.note}</p>
                  )}
                  <TaskAttachments assignmentId={task.assignmentId} links={submission.links} files={submission.files} />
                  {submission.evaluation && (
                    <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 space-y-1">
                      <p className="font-semibold text-indigo-900 flex items-center gap-1.5">
                        <MessageSquare className="size-3.5" /> {submission.evaluation.reviewerName ?? 'Người đánh giá'}
                        {submission.evaluation.score != null && <span className="ml-auto font-black text-indigo-700">{submission.evaluation.score}/100</span>}
                      </p>
                      {submission.evaluation.feedback && <p className="text-slate-700 leading-relaxed">{submission.evaluation.feedback}</p>}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
