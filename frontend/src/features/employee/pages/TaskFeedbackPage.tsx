import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Clock, Upload, ShieldCheck } from 'lucide-react';
import { PageHeader, StatusBadge } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useMyTask } from '@/hooks/use-me';
import type { MyTaskEvaluation } from '@/services/me.service';
import { VERDICT_LABELS, submissionStatus } from '@/lib/me-labels';
import { apiErrorMessage, formatDate, formatDateTime } from '@/lib/utils';
import { TaskAttachments } from '../components/TaskAttachments';

const BANNER: Record<MyTaskEvaluation['verdict'], { title: string; box: string; icon: typeof CheckCircle2; iconColor: string }> = {
  PASSED: {
    title: 'Đã duyệt đạt yêu cầu',
    box: 'bg-gradient-to-r from-emerald-50 to-white border-emerald-200',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
  },
  NEEDS_REVISION: {
    title: 'Yêu cầu bổ sung / chỉnh sửa minh chứng',
    box: 'bg-gradient-to-r from-amber-50 to-white border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
  },
  FAILED: {
    title: 'Chưa đạt yêu cầu đầu ra',
    box: 'bg-gradient-to-r from-rose-50 to-white border-rose-200',
    icon: XCircle,
    iconColor: 'text-rose-600',
  },
};

const VERDICT_VARIANT = { PASSED: 'success', NEEDS_REVISION: 'warning', FAILED: 'danger' } as const;

/** EM-17: Kết quả & phản hồi nhiệm vụ — đánh giá mới nhất cho bài nộp của chính mình. */
export function TaskFeedbackPage() {
  const { id } = useParams<{ id: string }>();
  const { data: task, isLoading, isError, error } = useMyTask(id);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-6" aria-label="Đang tải phản hồi">
        <div className="h-6 w-32 bg-slate-100 animate-pulse rounded" />
        <div className="h-44 bg-slate-100 animate-pulse rounded-2xl" />
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertTriangle className="size-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Không tìm thấy nhiệm vụ</h2>
        <p className="text-sm text-slate-500">{apiErrorMessage(error, 'Nhiệm vụ không tồn tại hoặc không được giao cho bạn.')}</p>
        <Link to="/enterprise/me/tasks" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  // submissions đã sắp theo phiên bản giảm dần → bản đầu tiên có đánh giá là đánh giá mới nhất.
  const evaluated = task.submissions.find((s) => s.evaluation);
  const evaluation = evaluated?.evaluation;
  const pending = task.latestSubmission && !task.latestSubmission.evaluation ? task.latestSubmission : null;
  const history = task.submissions.filter((s) => s.evaluation && s.id !== evaluated?.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <Link
        to={`/enterprise/me/tasks/${task.assignmentId}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="size-4" />
        <span>Quay lại nhiệm vụ</span>
      </Link>

      <PageHeader
        title={`Kết quả & Phản hồi: ${task.title}`}
        subtitle={`Người giao: ${task.assignedByName ?? '—'} • Hạn nộp: ${formatDate(task.dueAt)}`}
      />

      {pending && (
        <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/60 flex items-center gap-3">
          <Clock className="size-6 text-blue-600 shrink-0" />
          <div>
            <h3 className="font-bold text-sm text-blue-900">Bài nộp lần {pending.versionNo} đang chờ chấm</h3>
            <p className="text-xs text-blue-700">
              Bạn đã nộp lúc {formatDateTime(pending.submittedAt)}. Kết quả sẽ hiển thị tại đây ngay khi {task.reviewerName ?? 'người đánh giá'} phản hồi.
            </p>
          </div>
        </div>
      )}

      {!evaluated || !evaluation ? (
        !pending && (
          <div className="p-6 rounded-2xl border border-slate-200 bg-white text-center space-y-3">
            <Clock className="size-10 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-600">Nhiệm vụ này chưa có kết quả đánh giá.</p>
            {task.canSubmit && (
              <Link
                to={`/enterprise/me/tasks/${task.assignmentId}/submit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
              >
                <Upload className="size-3.5" /> Nộp minh chứng
              </Link>
            )}
          </div>
        )
      ) : (
        <>
          <EvaluationBanner evaluation={evaluation} versionNo={evaluated.versionNo} />

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base">Nhận xét của người đánh giá</h3>
            <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-line">
              {evaluation.feedback || 'Người đánh giá không để lại nhận xét.'}
            </p>
            {task.canSubmit && evaluation.verdict === 'NEEDS_REVISION' && (
              <div className="pt-2 flex justify-end">
                <Link
                  to={`/enterprise/me/tasks/${task.assignmentId}/submit`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  <Upload className="size-3.5" />
                  <span>Nộp lại bài chỉnh sửa</span>
                </Link>
              </div>
            )}
          </div>

          {evaluation.competencyResults.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base">Kết quả theo từng năng lực</h3>
              <div className="space-y-3">
                {evaluation.competencyResults.map((result) => (
                  <div key={result.competencyId} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-sm text-slate-900">
                          <span className="font-mono text-xs font-bold text-blue-700">{result.competencyCode}</span> {result.competencyName}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                          Mức mục tiêu <LevelBadge level={result.targetLevel} />
                        </p>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <StatusBadge variant={VERDICT_VARIANT[result.verdict]} label={VERDICT_LABELS[result.verdict] ?? result.verdict} />
                        {result.score != null && <p className="text-xs font-bold text-slate-700">{result.score}/100</p>}
                      </div>
                    </div>
                    {result.levelConfirming && result.confirmedLevel != null && (
                      <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5" /> Đã xác nhận năng lực ở mức {result.confirmedLevel}
                      </p>
                    )}
                    {result.feedback && <p className="text-xs text-slate-600 leading-relaxed">{result.feedback}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base">Minh chứng đã được đánh giá (lần {evaluated.versionNo})</h3>
            {evaluated.note && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {evaluated.note}
              </div>
            )}
            <TaskAttachments assignmentId={task.assignmentId} links={evaluated.links} files={evaluated.files} />
          </div>
        </>
      )}

      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base">Các lần đánh giá trước</h3>
          <ol className="space-y-2">
            {history.map((submission) => {
              const subStatus = submissionStatus(submission.status);
              return (
                <li key={submission.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-600">
                      Lần {submission.versionNo} · chấm {formatDateTime(submission.evaluation!.evaluatedAt)}
                      {submission.evaluation!.score != null && <strong className="ml-1 text-slate-800">· {submission.evaluation!.score}/100</strong>}
                    </span>
                    <StatusBadge variant={subStatus.variant} label={subStatus.label} />
                  </div>
                  {submission.evaluation!.feedback && <p className="text-slate-700 leading-relaxed">{submission.evaluation!.feedback}</p>}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

function EvaluationBanner({ evaluation, versionNo }: { evaluation: MyTaskEvaluation; versionNo: number }) {
  const banner = BANNER[evaluation.verdict];
  const Icon = banner.icon;
  return (
    <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${banner.box}`}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Icon className={`size-6 shrink-0 ${banner.iconColor}`} />
          <h3 className="font-bold text-lg text-slate-900">{banner.title}</h3>
        </div>
        <p className="text-xs text-slate-600">
          Bài nộp lần {versionNo} • Đánh giá bởi <span className="font-semibold">{evaluation.reviewerName ?? '—'}</span> • {formatDateTime(evaluation.evaluatedAt)}
        </p>
        {evaluation.verdict === 'PASSED' && (
          <p className="text-xs text-slate-500">
            {evaluation.countsAsEvidence
              ? 'Kết quả này được ghi nhận làm minh chứng năng lực trong hồ sơ của bạn.'
              : 'Kết quả này không được tính là minh chứng xác nhận cấp độ năng lực.'}
          </p>
        )}
      </div>
      {evaluation.score != null && (
        <div className="text-right">
          <span className="text-3xl sm:text-4xl font-black text-slate-900">{evaluation.score}</span>
          <span className="text-sm font-semibold text-slate-500"> / 100đ</span>
        </div>
      )}
    </div>
  );
}
