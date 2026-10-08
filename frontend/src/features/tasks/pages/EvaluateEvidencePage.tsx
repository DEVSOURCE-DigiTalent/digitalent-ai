import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, AlertTriangle, XCircle, ExternalLink, Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { usePracticalTask, useSubmissionDetail, useEvaluateSubmission } from '@/hooks/use-tasks';
import type { RubricCriterion } from '@/services/task.service';
import { formatDate } from '@/lib/utils';

export function EvaluateEvidencePage() {
  const { id: taskIdFromParam, submissionId } = useParams<{ id?: string; submissionId?: string }>();
  const [searchParams] = useSearchParams();
  const subIdFromQuery = searchParams.get('subId');

  const targetSubId = submissionId || subIdFromQuery || undefined;
  const { data: submission, isLoading: isSubLoading } = useSubmissionDetail(targetSubId);

  const taskId = taskIdFromParam || submission?.taskId;
  const { data: task, isLoading: isTaskLoading } = usePracticalTask(taskId);
  const evaluateMutation = useEvaluateSubmission();
  const navigate = useNavigate();

  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [decision, setDecision] = useState<'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED'>('APPROVED');

  useEffect(() => {
    if (task?.rubricCriteria) {
      const initialScores: Record<string, number> = {};
      task.rubricCriteria.forEach((r: RubricCriterion) => {
        initialScores[r.id] = r.maxPoints;
      });
      setRubricScores(initialScores);
    }
  }, [task]);

  const handleScoreChange = (rubricId: string, max: number, value: string) => {
    const num = Math.min(Math.max(0, Number(value) || 0), max);
    setRubricScores((prev) => ({ ...prev, [rubricId]: num }));
  };

  const totalScore = Object.values(rubricScores).reduce((sum, s) => sum + s, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSubId) {
      toast.error('Không tìm thấy bài nộp để chấm điểm');
      return;
    }

    try {
      await evaluateMutation.mutateAsync({
        id: targetSubId,
        payload: {
          score: totalScore,
          feedback,
          rubricScores,
          decision,
        },
      });

      toast.success(
        decision === 'APPROVED'
          ? 'Đã duyệt minh chứng và công nhận đạt chuẩn năng lực!'
          : decision === 'REVISION_REQUESTED'
          ? 'Đã gửi yêu cầu chỉnh sửa đến nhân viên'
          : 'Đã hoàn tất đánh giá không đạt',
      );
      navigate(`/enterprise/tasks/${taskId}`);
    } catch {
      toast.error('Có lỗi xảy ra khi lưu kết quả chấm điểm');
    }
  };

  if (isTaskLoading || isSubLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-6">
        <div className="h-6 w-32 bg-slate-100 animate-pulse rounded" />
        <div className="h-44 bg-slate-100 animate-pulse rounded-2xl" />
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!task || !submission) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertTriangle className="size-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Không tìm thấy bài nộp</h2>
        <p className="text-sm text-slate-500">Chưa có bài nộp nào cho nhiệm vụ này hoặc bài nộp không hợp lệ.</p>
        <Link
          to={`/enterprise/tasks/${taskId}`}
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
        >
          Quay lại nhiệm vụ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <Link
        to={`/enterprise/tasks/${taskId}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="size-4" />
        <span>Quay lại nhiệm vụ thực hành</span>
      </Link>

      <PageHeader
        title={`Chấm điểm minh chứng: ${submission.employeeName}`}
        subtitle={`Bài thực hành: ${task.title} • Nộp ngày: ${formatDate(submission.submittedAt)}`}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Minh chứng của nhân viên */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-semibold text-slate-500">Người nộp:</span>
              <h3 className="text-base font-bold text-slate-900">
                {submission.employeeName} ({submission.employeeCode})
              </h3>
            </div>
            <LevelBadge level={task.targetLevel} />
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Nội dung báo cáo & Giải pháp thực hiện:
            </h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 whitespace-pre-line leading-relaxed">
              {submission.content}
            </div>
          </div>

          {submission.linkUrls && submission.linkUrls.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Tài liệu & Đường dẫn đính kèm:
              </h4>
              <div className="space-y-1.5">
                {submission.linkUrls.map((url: string, i: number) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2.5 bg-blue-50/60 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-medium transition border border-blue-200/60 truncate"
                  >
                    <ExternalLink className="size-3.5 shrink-0" />
                    <span className="truncate">{url}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Chấm điểm theo Rubric */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Tiêu chí chấm điểm (Rubric)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Nhập điểm thành phần cho từng tiêu chí đánh giá.</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-blue-600">{totalScore} đ</div>
              <span className="text-xs text-slate-500">Tổng điểm đạt được</span>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {task.rubricCriteria.map((r: RubricCriterion) => (
              <div
                key={r.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <span className="text-sm font-bold text-slate-900">{r.label}</span>
                  {r.description && <p className="text-xs text-slate-500">{r.description}</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-600 font-medium">Điểm chấm:</span>
                  <input
                    type="number"
                    min={0}
                    max={r.maxPoints}
                    value={rubricScores[r.id] ?? 0}
                    onChange={(e) => handleScoreChange(r.id, r.maxPoints, e.target.value)}
                    className="w-16 px-2 py-1.5 text-center text-sm font-bold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-400">/ {r.maxPoints}đ</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Nhận xét & Quyết định */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900">Nhận xét & Quyết định đánh giá</h3>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Nhận xét chi tiết của Manager dành cho nhân viên <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ghi nhận điểm mạnh, các điểm cần cải thiện hoặc yêu cầu bổ sung minh chứng..."
              required
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-sm font-semibold text-slate-800">Quyết định phê duyệt:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDecision('APPROVED')}
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition text-left ${
                  decision === 'APPROVED'
                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <CheckCircle2 className={`size-5 ${decision === 'APPROVED' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div>
                  <p className="font-bold text-xs">Đạt chuẩn (Phê duyệt)</p>
                  <p className="text-[11px] text-slate-500">Ghi nhận năng lực số</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDecision('REVISION_REQUESTED')}
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition text-left ${
                  decision === 'REVISION_REQUESTED'
                    ? 'border-amber-500 bg-amber-50/80 text-amber-900 ring-1 ring-amber-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <AlertTriangle className={`size-5 ${decision === 'REVISION_REQUESTED' ? 'text-amber-600' : 'text-slate-400'}`} />
                <div>
                  <p className="font-bold text-xs">Yêu cầu sửa lại</p>
                  <p className="text-[11px] text-slate-500">Cần bổ sung minh chứng</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDecision('REJECTED')}
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition text-left ${
                  decision === 'REJECTED'
                    ? 'border-rose-500 bg-rose-50/80 text-rose-900 ring-1 ring-rose-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <XCircle className={`size-5 ${decision === 'REJECTED' ? 'text-rose-600' : 'text-slate-400'}`} />
                <div>
                  <p className="font-bold text-xs">Không đạt yêu cầu</p>
                  <p className="text-[11px] text-slate-500">Cần học tập lại kiến thức</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to={`/enterprise/tasks/${taskId}`}
            className="px-5 py-2.5 border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={evaluateMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition disabled:opacity-50"
          >
            <Send className="size-4" />
            <span>{evaluateMutation.isPending ? 'Đang lưu kết quả…' : 'Hoàn tất đánh giá'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
