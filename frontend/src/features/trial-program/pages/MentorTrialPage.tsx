import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useMentorTrial, usePublishTrialReport, useReviewTrialAssessment, useTrialEssayAiReview } from '@/hooks/use-trial-program';
import type { MentorAssessment, MentorTrial } from '@/services/trial-program.service';
import { Box, LoadError, Loading, PageHead } from '@/features/platform/components/pulse-ui';
import { errorMessage } from '@/features/platform/components/pulse-format';
import { RecordingPlayer } from '@/features/pulse-manager/components/RecordingPlayer';
import { LevelBadge, ParticipantStatus, StageBadge } from '../components/TrialUi';
import { LEVEL_LABELS, TIER_LABELS, formatWhen, suggestLevel } from '../lib/trial-format';
import '@/features/pulse-employee/pulse-exam.css';
import '../trial-program.css';

/**
 * MT-02 · Chấm bài dùng thử của một doanh nghiệp: từng nhân viên — bản ghi, điểm từng bài tự luận (AI gợi ý), mức từng lĩnh vực;
 * công bố bảng năng lực.
 */
export function MentorTrialPage() {
  const { organizationId } = useParams();
  const { data, isLoading, error } = useMentorTrial(organizationId);

  return (
    <>
      {isLoading && <Loading />}
      {error && <LoadError error={error} />}
      {data && <MentorTrialView trial={data} />}
    </>
  );
}

function MentorTrialView({ trial }: { trial: MentorTrial }) {
  const [selected, setSelected] = useState<string | null>(trial.assessments.find((a) => !a.reviewedAt)?.assessmentId ?? trial.assessments[0]?.assessmentId ?? null);
  const publish = usePublishTrialReport(trial.organizationId);
  const assessment = trial.assessments.find((a) => a.assessmentId === selected);
  const pending = trial.participants.filter((p) => p.status === 'ACTIVE' || p.status === 'INVITED' || p.status === 'INVITE_EXPIRED').length;
  const reported = trial.stage === 'REPORTED';

  const onPublish = () => {
    if (pending > 0 && !window.confirm(`${pending} nhân viên chưa nộp bài. Công bố sẽ đóng bài của họ. Tiếp tục?`)) return;
    publish.mutate(undefined, {
      onSuccess: () => toast.success('Đã công bố kết quả cho doanh nghiệp'),
      onError: (err) => toast.error(errorMessage(err)),
    });
  };

  return (
    <>
      <PageHead
        eyebrow="Mentor / Chấm bài"
        title={trial.organizationName}
        description={`Hạn làm bài ${formatWhen(trial.testDeadline)} · muốn chấm lúc ${formatWhen(trial.preferredReviewAt)}${trial.requestNote ? ` · “${trial.requestNote}”` : ''}`}
        actions={
          <>
            <Link className="btn btn-outline btn-small" to="/platform/reviews">Danh sách</Link>
            {!reported && (
              <button type="button" className="btn btn-primary" disabled={!trial.canPublish || publish.isPending} onClick={onPublish}>
                Công bố kết quả
              </button>
            )}
          </>
        }
      />
      <div className="tp tp-pu tp-review">
        <Box>
          <div className="tp-card-head" style={{ marginBottom: 8 }}>
            <strong>Nhân viên</strong>
            <StageBadge stage={trial.stage} />
          </div>
          <div className="tp-people">
            {trial.participants.map((p) => {
              const a = trial.assessments.find((x) => x.employeeId === p.employeeId);
              return (
                <button key={p.id} type="button" disabled={!a} aria-current={a?.assessmentId === selected} onClick={() => a && setSelected(a.assessmentId)}>
                  <span>{p.fullName}</span>
                  <small>{[p.departmentName, p.positionName].filter(Boolean).join(' · ')}</small>
                  <ParticipantStatus status={p.status} />
                </button>
              );
            })}
          </div>
        </Box>
        <div className="tp" style={{ minWidth: 0 }}>
          {assessment ? (
            <AssessmentReview key={assessment.assessmentId} trial={trial} assessment={assessment} readOnly={reported} />
          ) : (
            <Box><p className="pa-empty">Chưa có bài nộp.</p></Box>
          )}
        </div>
      </div>
    </>
  );
}

function AssessmentReview({ trial, assessment, readOnly }: { trial: MentorTrial; assessment: MentorAssessment; readOnly: boolean }) {
  const review = useReviewTrialAssessment(trial.organizationId);
  const ai = useTrialEssayAiReview(trial.organizationId);
  const pass = trial.essayPassScore;
  const [scores, setScores] = useState<(number | null)[]>(() => assessment.essays.map((e) => e.score ?? null));
  // Mức mentor tự đổi; lĩnh vực chưa đổi đi theo mức gợi ý (trắc nghiệm + tự luận).
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [note, setNote] = useState(assessment.reviewNote ?? '');
  const [showItems, setShowItems] = useState(false);
  const autoAi = useRef(false);

  // Mở bài chưa có gợi ý: AI đọc ba bài tự luận một lần (kết quả được lưu).
  useEffect(() => {
    if (autoAi.current || readOnly || !trial.aiAvailable || assessment.aiReview) return;
    autoAi.current = true;
    ai.mutate(assessment.assessmentId);
  }, [ai, assessment.aiReview, assessment.assessmentId, readOnly, trial.aiAvailable]);

  const aiScore = (tier: number) => assessment.aiReview?.essays.find((e) => e.tier === tier);
  const scored = scores.every((s) => s != null);
  const essayTotal = scores.reduce<number>((sum, s) => sum + (s ?? 0), 0);
  const levelOf = (d: MentorAssessment['domains'][number]) =>
    overrides[d.categoryId] ?? d.mentorLevel ?? suggestLevel(d.suggestedLevel, scores, pass);

  const runAi = () =>
    ai.mutate(assessment.assessmentId, { onError: (err) => toast.error(errorMessage(err)) });
  const useAiScores = () => {
    if (!assessment.aiReview) return;
    setScores(assessment.essays.map((e, i) => aiScore(e.tier)?.score ?? scores[i]));
  };

  const save = () =>
    review.mutate(
      {
        assessmentId: assessment.assessmentId,
        levels: assessment.domains.map((d) => ({ categoryId: d.categoryId, level: levelOf(d) })),
        essayScores: scores.map((s) => s ?? 0),
        note: note.trim() || null,
      },
      { onSuccess: () => toast.success(`Đã lưu kết quả của ${assessment.fullName}`), onError: (err) => toast.error(errorMessage(err)) },
    );

  return (
    <>
      <Box>
        <div className="tp-card-head">
          <div>
            <h2 style={{ margin: 0, fontSize: 17 }}>{assessment.fullName}</h2>
            <span className="tp-muted">
              {[assessment.departmentName, assessment.positionName].filter(Boolean).join(' · ')} · nộp {formatWhen(assessment.submittedAt)}
            </span>
          </div>
          <span className="tp-row">
            <span className="tp-badge info">Trắc nghiệm {assessment.choiceScore}/{assessment.choiceTotal}</span>
            <span className={`tp-badge${scored ? ' info' : ''}`}>
              Tự luận {scored ? `${essayTotal}/${assessment.essays.length * trial.essayMaxScore}` : 'chưa chấm'}
            </span>
          </span>
        </div>
      </Box>

      {assessment.recording ? <RecordingPlayer recording={assessment.recording} /> : <Box><p className="pa-empty">Không có bản ghi.</p></Box>}

      <Box>
        <div className="tp-card-head" style={{ marginBottom: 8 }}>
          <div>
            <strong>Tự luận</strong>
            <span className="tp-muted"> · chấm 0–{trial.essayMaxScore}, đạt từ {pass}</span>
          </div>
          {!readOnly && (
            <span className="tp-row">
              {assessment.aiReview && (
                <button type="button" className="btn btn-outline btn-small" onClick={useAiScores}>Dùng điểm AI</button>
              )}
              {trial.aiAvailable && (
                <button type="button" className="btn btn-outline btn-small" disabled={ai.isPending} onClick={runAi}>
                  <Sparkles size={14} aria-hidden /> {ai.isPending ? 'AI đang đọc bài…' : assessment.aiReview ? 'AI chấm lại' : 'AI gợi ý điểm'}
                </button>
              )}
            </span>
          )}
        </div>
        {!trial.aiAvailable && <p className="tp-muted" style={{ marginBottom: 8 }}>AI chưa được cấu hình (thiếu khóa Gemini) — mentor tự chấm.</p>}
        {ai.isError && !readOnly && <p className="tp-muted" style={{ marginBottom: 8 }}>{errorMessage(ai.error)} Bấm “AI gợi ý điểm” để thử lại.</p>}
        {assessment.aiReview?.summary && (
          <p className="tp-ai" style={{ marginBottom: 10 }}><Sparkles size={14} aria-hidden /> <span><b>AI:</b> {assessment.aiReview.summary}</span></p>
        )}
        <div className="tp" style={{ gap: 14 }}>
          {assessment.essays.map((e, i) => {
            const suggestion = aiScore(e.tier);
            const score = scores[i];
            return (
              <section key={e.tier} className="tp-essay" aria-label={`Tự luận ${TIER_LABELS[e.tier]}`}>
                <div className="tp-essay-head">
                  <strong>{TIER_LABELS[e.tier]} · {e.title}</strong>
                  {score != null && (
                    <span className={`tp-badge ${score >= pass ? 'ok' : 'bad'}`}>{score}/{trial.essayMaxScore} · {score >= pass ? 'Đạt' : 'Chưa đạt'}</span>
                  )}
                </div>
                <span className="tp-muted">{e.prompt}</span>
                <p>{e.text}</p>
                {suggestion && (
                  <div className="tp-ai">
                    <Sparkles size={14} aria-hidden />
                    <span>
                      <b>AI gợi ý {suggestion.score}/{trial.essayMaxScore} · {suggestion.passed ? 'Đạt' : 'Chưa đạt'}.</b> {suggestion.feedback}
                    </span>
                  </div>
                )}
                <div className="tp-score" role="radiogroup" aria-label={`Điểm tự luận ${TIER_LABELS[e.tier]}`}>
                  {Array.from({ length: trial.essayMaxScore + 1 }, (_, value) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={score === value}
                      data-pass={value >= pass}
                      disabled={readOnly}
                      onClick={() => setScores((prev) => prev.map((s, k) => (k === i ? value : s)))}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </Box>

      <Box>
        <div className="tp-card-head" style={{ marginBottom: 8 }}>
          <strong>Mức theo lĩnh vực</strong>
          <span className="tp-muted">Gợi ý = cấp đạt liên tiếp ở cả trắc nghiệm và tự luận</span>
        </div>
        <div className="tp-table-wrap">
          <table className="tp-table">
            <thead>
              <tr>
                <th>Lĩnh vực</th>
                {[1, 2, 3].map((t) => <th key={t} className="num">{TIER_LABELS[t]}</th>)}
                <th className="num">Gợi ý</th>
                <th>Mức chấm</th>
              </tr>
            </thead>
            <tbody>
              {assessment.domains.map((d) => (
                <tr key={d.categoryId}>
                  <td>{d.number}. {d.name}</td>
                  {[0, 1, 2].map((i) => (
                    <td key={i} className="num">
                      <span className="tp-dots" title={`${d.correct[i]}/${d.total[i]}`}>
                        {Array.from({ length: d.total[i] ?? 0 }, (_, k) => <i key={k} data-ok={k < (d.correct[i] ?? 0)} />)}
                      </span>
                    </td>
                  ))}
                  <td className="num"><LevelBadge level={suggestLevel(d.suggestedLevel, scores, pass)} /></td>
                  <td>
                    <select
                      aria-label={`Mức ${d.name}`}
                      value={levelOf(d)}
                      disabled={readOnly}
                      onChange={(e) => setOverrides((prev) => ({ ...prev, [d.categoryId]: Number(e.target.value) }))}
                    >
                      {LEVEL_LABELS.map((label, level) => <option key={label} value={level}>{label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="btn btn-outline btn-small" style={{ marginTop: 10 }} onClick={() => setShowItems((v) => !v)}>
          {showItems ? 'Ẩn' : 'Xem'} từng câu trắc nghiệm
        </button>
        {showItems && (
          <div className="tp-table-wrap" style={{ marginTop: 8 }}>
            <table className="tp-table">
              <tbody>
                {assessment.choiceItems.map((item) => (
                  <tr key={item.number}>
                    <td className="tp-muted">{item.number}</td>
                    <td>
                      {item.question}
                      <small>Chọn: {item.selected}{item.isCorrect ? '' : ` · Đúng: ${item.correct}`}</small>
                    </td>
                    <td className="num"><span className={`tp-badge ${item.isCorrect ? 'ok' : 'bad'}`}>{item.isCorrect ? 'Đúng' : 'Sai'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Box>

      <Box>
        <label className="tp-field">
          Nhận xét cho nhân viên (không bắt buộc)
          <textarea value={note} maxLength={2000} disabled={readOnly} onChange={(e) => setNote(e.target.value)} style={{ minHeight: 80 }} />
        </label>
        {!readOnly && (
          <div className="pa-row-between" style={{ marginTop: 10 }}>
            <span className="tp-muted">
              {!scored ? 'Cho điểm cả ba bài tự luận để lưu.' : assessment.reviewedAt ? `Đã chấm ${formatWhen(assessment.reviewedAt)}` : 'Chưa chấm'}
            </span>
            <button type="button" className="btn btn-primary" disabled={!scored || review.isPending} onClick={save}>Lưu chấm</button>
          </div>
        )}
      </Box>
    </>
  );
}
