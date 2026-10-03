import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, AlertTriangle, Clock,
  Upload, ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { usePracticalTask } from '@/hooks/use-tasks';
import { formatDate } from '@/lib/utils';

export function TaskFeedbackPage() {
  const { id } = useParams<{ id: string }>();
  const { data: task, isLoading } = usePracticalTask(id);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-6">
        <div className="h-6 w-32 bg-slate-100 animate-pulse rounded" />
        <div className="h-44 bg-slate-100 animate-pulse rounded-2xl" />
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertTriangle className="size-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Không tìm thấy bài thực hành</h2>
        <Link
          to="/enterprise/me/tasks"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  // Get current submission (or default first)
  const submission = task.submissions?.[0];
  const evaluation = submission?.evaluation;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <Link
        to="/enterprise/me/tasks"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="size-4" />
        <span>Quay lại bài thực hành của tôi</span>
      </Link>

      <PageHeader
        title={`Kết quả & Phản hồi: ${task.title}`}
        subtitle={`Người giao: ${task.assignedByName} • Hạn nộp: ${formatDate(task.dueDate)}`}
      />

      {/* Decision Status Banner */}
      {evaluation ? (
        <div
          className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            evaluation.decision === 'APPROVED'
              ? 'bg-gradient-to-r from-emerald-50 to-white border-emerald-200'
              : evaluation.decision === 'REVISION_REQUESTED'
              ? 'bg-gradient-to-r from-amber-50 to-white border-amber-200'
              : 'bg-gradient-to-r from-rose-50 to-white border-rose-200'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {evaluation.decision === 'APPROVED' ? (
                <CheckCircle2 className="size-6 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="size-6 text-amber-600 shrink-0" />
              )}
              <h3 className="font-bold text-lg text-slate-900">
                {evaluation.decision === 'APPROVED'
                  ? 'Đã duyệt đạt chuẩn năng lực'
                  : evaluation.decision === 'REVISION_REQUESTED'
                  ? 'Yêu cầu bổ sung / Chỉnh sửa minh chứng'
                  : 'Chưa đạt yêu cầu chuẩn đầu ra'}
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Đánh giá bởi: <span className="font-semibold">{evaluation.evaluatedBy}</span> •{' '}
              {formatDate(evaluation.evaluatedAt)}
            </p>
          </div>

          <div className="text-right">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">{evaluation.score}</span>
            <span className="text-sm font-semibold text-slate-500"> / 100đ</span>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50/60 flex items-center gap-3">
          <Clock className="size-6 text-blue-600 shrink-0" />
          <div>
            <h3 className="font-bold text-sm text-blue-900">Bài nộp đang chờ Quản lý chấm điểm</h3>
            <p className="text-xs text-blue-700">
              Bạn đã nộp bài vào ngày {submission?.submittedAt ? formatDate(submission.submittedAt) : 'gần đây'}. Kết quả sẽ hiển thị tại đây ngay khi có phản hồi.
            </p>
          </div>
        </div>
      )}

      {/* Manager Feedback */}
      {evaluation?.feedback && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base">Nhận xét chi tiết của Quản lý</h3>
          <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-line">
            {evaluation.feedback}
          </p>

          {evaluation.decision === 'REVISION_REQUESTED' && (
            <div className="pt-2 flex justify-end">
              <Link
                to={`/enterprise/me/tasks/${task.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                <Upload className="size-3.5" />
                <span>Nộp lại bài chỉnh sửa</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Rubric scores breakdown */}
      {evaluation?.rubricScores && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base">Điểm chi tiết theo từng tiêu chí</h3>
          <div className="space-y-3">
            {task.rubricCriteria.map((r) => {
              const score = evaluation.rubricScores?.[r.id] ?? 0;
              return (
                <div key={r.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{r.label}</p>
                    {r.description && <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-sm text-blue-600">{score}</span>
                    <span className="text-xs text-slate-400"> / {r.maxPoints}đ</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submitted content review */}
      {submission && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base">Minh chứng bạn đã gửi</h3>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {submission.content}
          </div>

          {submission.linkUrls && submission.linkUrls.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Đường dẫn đính kèm:</p>
              <div className="space-y-1.5">
                {submission.linkUrls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 bg-blue-50/50 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-medium transition truncate"
                  >
                    <ExternalLink className="size-3.5 shrink-0" />
                    <span className="truncate">{url}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
