import { useParams, Link, useNavigate } from 'react-router-dom';
import { FileCheck, Clock, Award, ShieldAlert, CheckCircle2, ArrowLeft, ArrowRight, HelpCircle, Lock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/shared';
import { useMyAssessment, useStartAttempt } from '@/hooks/use-me';
import { ASSESSMENT_TYPE_LABELS, assessmentStatus } from '@/lib/me-labels';
import { apiErrorMessage, formatDateTime } from '@/lib/utils';

/** EM-10: Giới thiệu bài đánh giá — quy chế, thời gian, số lượt và bắt đầu / tiếp tục làm bài. */
export function AssessmentIntroPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: assessment, isLoading, isError, error } = useMyAssessment(id);
  const startAttempt = useStartAttempt();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6" aria-label="Đang tải bài đánh giá">
        <div className="h-8 w-48 bg-slate-100 animate-pulse rounded" />
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (isError || !assessment) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 max-w-xl mx-auto my-12">
        <p className="text-red-600 font-medium">{apiErrorMessage(error, 'Không tìm thấy bài đánh giá.')}</p>
        <Link to="/enterprise/me/assessments" className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">
          <ArrowLeft className="size-4" /> Quay lại danh sách bài đánh giá
        </Link>
      </div>
    );
  }

  const status = assessmentStatus(assessment.status);
  const canStart = assessment.canStart && assessment.questionCount > 0;
  const isInProgress = assessment.status === 'IN_PROGRESS';

  const handleStart = async () => {
    try {
      const session = await startAttempt.mutateAsync(assessment.id);
      if (session.status === 'SCORED') {
        navigate(`/enterprise/me/assessments/${assessment.id}/result?attempt=${session.attemptId}`);
        return;
      }
      navigate(`/enterprise/me/assessments/${assessment.id}/attempt?attempt=${session.attemptId}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không bắt đầu được bài đánh giá.'));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <Link to={`/enterprise/me/courses/${assessment.courseId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition">
        <ArrowLeft className="size-4" />
        <span>Quay lại khóa học {assessment.courseCode}</span>
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-start gap-4">
          <div className="size-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileCheck className="size-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                {ASSESSMENT_TYPE_LABELS[assessment.assessmentType] ?? assessment.assessmentType}
              </span>
              <StatusBadge variant={status.variant} label={status.label} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{assessment.title}</h1>
            <p className="text-sm text-slate-600">{assessment.courseCode} · {assessment.courseTitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-y border-slate-100 py-6">
          <div className="flex items-center gap-3">
            <Clock className="size-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Thời gian</p>
              <p className="text-base font-bold text-slate-900">{assessment.timeLimitMinutes ? `${assessment.timeLimitMinutes} phút` : 'Không giới hạn'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HelpCircle className="size-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Số câu hỏi</p>
              <p className="text-base font-bold text-slate-900">{assessment.questionCount} câu</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Award className="size-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Điểm đạt</p>
              <p className="text-base font-bold text-slate-900">≥ {assessment.passingScore}%</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RotateCcw className="size-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Số lượt còn lại</p>
              <p className="text-base font-bold text-slate-900">
                {assessment.attemptsRemaining == null ? 'Không giới hạn' : `${assessment.attemptsRemaining}/${assessment.maxAttempts}`}
              </p>
            </div>
          </div>
        </div>

        {assessment.competencies.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">Năng lực được đánh giá</h2>
            <div className="flex flex-wrap gap-1.5">
              {assessment.competencies.map((c) => (
                <span key={c.competencyId} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                  <span className="font-mono font-bold">{c.code}</span> {c.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 text-sm text-slate-700">
          <h2 className="font-bold text-slate-900">Quy chế làm bài:</h2>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Tự động lưu đáp án:</strong> lựa chọn của bạn được lưu trên hệ thống; mất kết nối hay đổi thiết bị vẫn làm tiếp đúng lượt.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldAlert className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Đếm ngược theo giờ hệ thống:</strong> thời gian tính từ lúc bắt đầu; hết giờ bài được nộp tự động, câu chưa trả lời tính 0 điểm.
              </span>
            </li>
            {assessment.isFinal && (
              <li className="flex items-start gap-2.5">
                <Award className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Bài cuối khóa:</strong> đạt điểm chuẩn sẽ hoàn thành khóa học và được cấp chứng chỉ (nếu khóa có cấp chứng chỉ).</span>
              </li>
            )}
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Xem đáp án:</strong> đáp án đúng và lời giải hiển thị khi bạn đạt bài, hoặc khi đã dùng hết số lượt làm.</span>
            </li>
          </ul>
        </div>

        {assessment.lockedReason && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700">
            <Lock className="size-4 mt-0.5 shrink-0" /> <span>{assessment.lockedReason}</span>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to={`/enterprise/me/courses/${assessment.courseId}`} className="w-full sm:w-auto px-5 py-2.5 text-center text-sm font-medium text-slate-600 hover:text-slate-900">
            Ôn tập lại bài giảng
          </Link>
          {assessment.status === 'PASSED' && assessment.latestAttemptId ? (
            <Link
              to={`/enterprise/me/assessments/${assessment.id}/result?attempt=${assessment.latestAttemptId}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition"
            >
              <span>Xem kết quả đã đạt</span>
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleStart}
              disabled={!canStart || startAttempt.isPending}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{startAttempt.isPending ? 'Đang chuẩn bị đề…' : isInProgress ? 'Tiếp tục làm bài' : assessment.status === 'RETAKE' ? 'Làm lại bài' : 'Bắt đầu làm bài'}</span>
              <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </div>

      {assessment.attempts.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Các lần làm bài của bạn</h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {assessment.attempts.map((attempt) => (
              <li key={attempt.id} className="py-2.5 flex items-center justify-between gap-3">
                <span className="text-slate-700">Lần {attempt.attemptNo} · {formatDateTime(attempt.submittedAt ?? attempt.startedAt)}</span>
                {attempt.status === 'SCORED' ? (
                  <Link
                    to={`/enterprise/me/assessments/${assessment.id}/result?attempt=${attempt.id}`}
                    className={`text-xs font-semibold hover:underline ${attempt.passed ? 'text-emerald-700' : 'text-rose-700'}`}
                  >
                    {attempt.score}% · {attempt.passed ? 'Đạt' : 'Chưa đạt'} →
                  </Link>
                ) : (
                  <span className="text-xs font-semibold text-amber-700">Đang làm dở</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
