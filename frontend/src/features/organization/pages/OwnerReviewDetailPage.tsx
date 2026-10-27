import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, AlertTriangle, XCircle, ExternalLink, Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePracticalTask, useSubmissionDetail, useEvaluateSubmission } from '@/hooks/use-tasks';
import type { RubricCriterion } from '@/services/task.service';
import { apiErrorMessage, formatDate } from '@/lib/utils';

const PULSE_TOKENS = {
  '--po-canvas': '#f7f9fd',
  '--po-surface': '#fff',
  '--po-ink': '#172442',
  '--po-muted': '#62718d',
  '--po-accent': '#304bdf',
  '--po-coral': '#ef735c',
  '--po-lime': '#c6ec78',
  '--po-line': '#dfe6f3',
  '--po-soft': '#eef2ff',
  '--po-tint': '#edf1ff',
  '--po-warm': '#f1816b',
} as React.CSSProperties;

const inputStyle: React.CSSProperties = {
  borderColor: 'var(--po-line)',
  color: 'var(--po-ink)',
  background: 'var(--po-canvas)',
};

export function OwnerReviewDetailPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  const { data: submission, isLoading: subLoading } = useSubmissionDetail(submissionId);
  const taskId = submission?.taskId;
  const { data: task, isLoading: taskLoading } = usePracticalTask(taskId);
  const evaluateMutation = useEvaluateSubmission();

  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [decision, setDecision] = useState<'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED'>('APPROVED');

  useEffect(() => {
    if (task?.rubricCriteria) {
      const init: Record<string, number> = {};
      task.rubricCriteria.forEach((r: RubricCriterion) => { init[r.id] = 0; });
      setRubricScores(init);
    }
  }, [task]);

  const totalScore = Object.values(rubricScores).reduce((s, v) => s + v, 0);
  const alreadyEvaluated = submission?.status !== 'PENDING_REVIEW';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionId || alreadyEvaluated) return;
    try {
      await evaluateMutation.mutateAsync({
        id: submissionId,
        payload: { score: totalScore, feedback, rubricScores, decision },
      });
      toast.success(
        decision === 'APPROVED'
          ? 'Đã duyệt đạt bài thực hành.'
          : decision === 'REVISION_REQUESTED'
            ? 'Đã gửi yêu cầu chỉnh sửa.'
            : 'Đã đánh giá không đạt.',
      );
      navigate(`/enterprise/tasks/${taskId}`);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Không thể lưu kết quả.'));
    }
  };

  if (subLoading || taskLoading) {
    return (
      <div
        className="-m-4 md:-m-6 min-h-screen flex items-center justify-center"
        style={{ ...PULSE_TOKENS, background: 'var(--po-canvas)' }}
      >
        <p className="text-sm" style={{ color: 'var(--po-muted)' }}>Đang tải…</p>
      </div>
    );
  }

  if (!task || !submission) {
    return (
      <div
        className="-m-4 md:-m-6 min-h-screen px-4 md:px-6 py-20"
        style={{ ...PULSE_TOKENS, background: 'var(--po-canvas)' }}
      >
        <div className="mx-auto text-center" style={{ maxWidth: 500 }}>
          <div
            className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl text-2xl"
            style={{ background: '#fef3c7', color: '#d97706' }}
          >
            !
          </div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--po-ink)' }}>
            Không tìm thấy bài nộp
          </h2>
          <Link
            to="/enterprise/reviews"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold"
            style={{ color: 'var(--po-accent)' }}
          >
            <ArrowLeft className="size-3.5" /> Hàng chờ chấm điểm
          </Link>
        </div>
      </div>
    );
  }

  const DECISIONS = [
    { key: 'APPROVED' as const, label: 'Đạt bài thực hành', desc: 'Ghi nhận kết quả', Icon: CheckCircle2, colors: { active: '#16a34a', bg: '#ecfdf5', border: '#bbf7d0' } },
    { key: 'REVISION_REQUESTED' as const, label: 'Yêu cầu sửa lại', desc: 'Cần bổ sung minh chứng', Icon: AlertTriangle, colors: { active: '#d97706', bg: '#fef3c7', border: '#fdddb6' } },
    { key: 'REJECTED' as const, label: 'Không đạt', desc: 'Cần học tập lại', Icon: XCircle, colors: { active: '#dc2626', bg: '#fee2e2', border: '#fecaca' } },
  ];

  return (
    <div
      className="-m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'var(--po-canvas)',
        backgroundImage: 'radial-gradient(ellipse 80% 55% at 50% 0%, #dce5ff 0%, transparent 65%)',
      }}
    >
      <div className="px-4 md:px-6 pt-6 pb-8 mx-auto" style={{ maxWidth: 900 }}>
        <Link
          to={`/enterprise/tasks/${taskId}`}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold mb-4 transition-opacity hover:opacity-70"
          style={{ color: 'var(--po-muted)' }}
        >
          <ArrowLeft className="size-3" /> Quay lại nhiệm vụ
        </Link>

        <h1 className="text-2xl font-bold" style={{ color: 'var(--po-ink)', letterSpacing: '-0.04em' }}>
          Chấm điểm: {submission.employeeName}
        </h1>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--po-muted)' }}>
          {task.title} · Nộp ngày {formatDate(submission.submittedAt)}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Evidence */}
          <section
            className="rounded-[22px] border p-6 space-y-4"
            style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)', boxShadow: '0 10px 35px rgba(29,48,102,.025)' }}
          >
            <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--po-line)', paddingBottom: 12 }}>
              <div>
                <span className="text-[10px] font-bold" style={{ color: 'var(--po-muted)' }}>Người nộp</span>
                <strong className="block text-xs" style={{ color: 'var(--po-ink)' }}>
                  {submission.employeeName} ({submission.employeeCode})
                </strong>
              </div>
              <span
                className="text-[9px] font-black px-1.5 py-0.5 rounded"
                style={{ background: '#eef1ff', color: '#5364a6' }}
              >
                LV{task.targetLevel}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--po-muted)' }}>
                Nội dung báo cáo & giải pháp
              </span>
              <div
                className="mt-1 rounded-[11px] border p-4 text-xs leading-relaxed whitespace-pre-line"
                style={{ borderColor: 'var(--po-line)', background: 'var(--po-canvas)', color: 'var(--po-ink)' }}
              >
                {submission.content}
              </div>
            </div>

            {submission.linkUrls && submission.linkUrls.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--po-muted)' }}>
                  Đường dẫn đính kèm
                </span>
                <div className="mt-1 space-y-1.5">
                  {submission.linkUrls.map((url: string, i: number) =>
                    /^https?:\/\//i.test(url) ? (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-medium truncate"
                        style={{ background: 'var(--po-soft)', color: 'var(--po-accent)' }}
                      >
                        <ExternalLink className="size-3 shrink-0" />
                        <span className="truncate">{url}</span>
                      </a>
                    ) : null,
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Already evaluated */}
          {alreadyEvaluated && (
            <div
              className="rounded-[13px] border p-5 space-y-2"
              style={{ borderColor: 'var(--po-line)', background: 'var(--po-canvas)' }}
            >
              <strong className="text-xs" style={{ color: 'var(--po-ink)' }}>Bài nộp đã được đánh giá</strong>
              <p className="text-[11px]" style={{ color: 'var(--po-muted)' }}>
                Điểm: {submission.evaluation?.score ?? '—'} ·{' '}
                {{ APPROVED: 'Đạt', REVISION_REQUESTED: 'Cần sửa', REJECTED: 'Không đạt', PENDING_REVIEW: 'Chờ chấm' }[submission.status]}
              </p>
              {submission.evaluation?.feedback && (
                <p className="text-[11px] whitespace-pre-line" style={{ color: 'var(--po-ink)' }}>
                  {submission.evaluation.feedback}
                </p>
              )}
            </div>
          )}

          {!alreadyEvaluated && (
            <>
              {/* Rubric scoring */}
              <section
                className="rounded-[22px] border p-6 space-y-4"
                style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)', boxShadow: '0 10px 35px rgba(29,48,102,.025)' }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: 'var(--po-muted)' }}>
                    Tiêu chí chấm (Rubric)
                  </p>
                  <div className="text-right">
                    <span className="text-xl font-black" style={{ color: 'var(--po-accent)' }}>{totalScore}</span>
                    <span className="text-[10px] block" style={{ color: 'var(--po-muted)' }}>Tổng điểm</span>
                  </div>
                </div>

                {task.rubricCriteria.map((r: RubricCriterion) => (
                  <div
                    key={r.id}
                    className="rounded-[11px] border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    style={{ borderColor: 'var(--po-line)', background: 'var(--po-canvas)' }}
                  >
                    <div className="flex-1">
                      <strong className="text-xs" style={{ color: 'var(--po-ink)' }}>{r.label}</strong>
                      {r.description && (
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--po-muted)' }}>{r.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={r.maxPoints}
                        value={rubricScores[r.id] ?? 0}
                        onChange={(e) => {
                          const v = Math.min(Math.max(0, Number(e.target.value) || 0), r.maxPoints);
                          setRubricScores((p) => ({ ...p, [r.id]: v }));
                        }}
                        className="w-14 rounded-lg border px-2 py-1.5 text-xs text-center font-bold outline-none"
                        style={inputStyle}
                      />
                      <span className="text-[10px]" style={{ color: 'var(--po-muted)' }}>/ {r.maxPoints}đ</span>
                    </div>
                  </div>
                ))}
              </section>

              {/* Decision */}
              <section
                className="rounded-[22px] border p-6 space-y-4"
                style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)', boxShadow: '0 10px 35px rgba(29,48,102,.025)' }}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: 'var(--po-muted)' }}>
                  Nhận xét & quyết định
                </p>

                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Điểm mạnh, điểm cần cải thiện, yêu cầu bổ sung…"
                  required
                  className="w-full rounded-lg border px-3 py-2 text-xs outline-none resize-none"
                  style={inputStyle}
                />

                <div className="grid sm:grid-cols-3 gap-3">
                  {DECISIONS.map(({ key, label, desc, Icon, colors }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDecision(key)}
                      className="rounded-[11px] border p-3 flex items-center gap-2.5 text-left transition-all"
                      style={
                        decision === key
                          ? { borderColor: colors.border, background: colors.bg }
                          : { borderColor: 'var(--po-line)' }
                      }
                    >
                      <Icon
                        className="size-5 shrink-0"
                        style={{ color: decision === key ? colors.active : 'var(--po-muted)' }}
                      />
                      <div>
                        <strong className="text-[11px] block" style={{ color: 'var(--po-ink)' }}>{label}</strong>
                        <span className="text-[10px]" style={{ color: 'var(--po-muted)' }}>{desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <Link
              to={`/enterprise/tasks/${taskId}`}
              className="rounded-[11px] border px-4 py-2.5 text-xs font-bold transition-transform hover:-translate-y-0.5"
              style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)' }}
            >
              Hủy
            </Link>
            {!alreadyEvaluated && (
              <button
                type="submit"
                disabled={evaluateMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-[11px] px-5 py-2.5 text-xs font-extrabold transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: 'var(--po-accent)', color: '#fff' }}
              >
                <Send className="size-3.5" />
                {evaluateMutation.isPending ? 'Đang lưu…' : 'Hoàn tất đánh giá'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
