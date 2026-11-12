import { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Clock,
  Building2,
  UserCheck,
  Check,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  XCircle,
  Award,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useMentorTrial,
  usePublishTrialReport,
  useReviewTrialAssessment,
  useTrialEssayAiReview,
} from '@/hooks/use-trial-program';
import type { MentorAssessment, MentorTrial } from '@/services/trial-program.service';
import { LoadError, Loading } from '@/features/platform/components/pulse-ui';
import { errorMessage } from '@/features/platform/components/pulse-format';
import { RecordingPlayer } from '@/features/pulse-manager/components/RecordingPlayer';
import { LevelBadge, ParticipantStatus, StageBadge } from '../components/TrialUi';
import { LEVEL_LABELS, TIER_LABELS, formatWhen, suggestLevel } from '../lib/trial-format';
import '@/features/pulse-employee/pulse-exam.css';
import '../trial-program.css';
import '../mentor-workspace.css';

/**
 * MT-02 · Chấm bài dùng thử của một doanh nghiệp.
 * Thiết kế chuẩn UI doanh nghiệp: Điều hướng thí sinh mượt mà, thang chấm 0-10 trực quan,
 * tích hợp gợi ý AI Gemini, ma trận 5 miền năng lực số và thanh lưu kết quả tiện lợi.
 */
export function MentorTrialPage() {
  const { organizationId } = useParams();
  const { data, isLoading, error } = useMentorTrial(organizationId);

  return (
    <div className="pulse-ui">
      {isLoading && <Loading />}
      {error && <LoadError error={error} />}
      {data && <MentorTrialView trial={data} />}
    </div>
  );
}

function MentorTrialView({ trial }: { trial: MentorTrial }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(
    trial.assessments.find((a) => !a.reviewedAt)?.assessmentId ?? trial.assessments[0]?.assessmentId ?? null,
  );
  const [candidateSearch, setCandidateSearch] = useState('');
  const publish = usePublishTrialReport(trial.organizationId);
  const assessment = trial.assessments.find((a) => a.assessmentId === selected);
  const pending = trial.participants.filter(
    (p) => p.status === 'ACTIVE' || p.status === 'INVITED' || p.status === 'INVITE_EXPIRED',
  ).length;
  const reported = trial.stage === 'REPORTED';

  const onPublish = () => {
    if (pending > 0 && !window.confirm(`${pending} nhân viên chưa nộp bài. Công bố sẽ đóng bài của họ. Tiếp tục?`)) return;
    publish.mutate(undefined, {
      onSuccess: () => toast.success('Đã công bố kết quả cho doanh nghiệp'),
      onError: (err) => toast.error(errorMessage(err)),
    });
  };

  // Filtered candidate list
  const filteredParticipants = useMemo(() => {
    return trial.participants.filter((p) => {
      const q = candidateSearch.toLowerCase().trim();
      return (
        p.fullName.toLowerCase().includes(q) ||
        (p.departmentName && p.departmentName.toLowerCase().includes(q)) ||
        (p.positionName && p.positionName.toLowerCase().includes(q))
      );
    });
  }, [trial.participants, candidateSearch]);

  return (
    <>
      {/* Page Header */}
      <div className="mw-header">
        <div className="mw-breadcrumbs">
          <Link to="/mentor/reviews">
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Đánh giá doanh nghiệp</span>
          </Link>
          <span>/</span>
          <span className="current">{trial.organizationName}</span>
        </div>

        <div className="mw-header-main">
          <div className="mw-title-block">
            <div className="mw-title-icon">
              <Building2 className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h1>{trial.organizationName}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                <span className="tp-vars">
                  <StageBadge stage={trial.stage} />
                </span>
                <span className="mw-chip slate">
                  <Calendar size={13} aria-hidden="true" />
                  Hạn nộp: {formatWhen(trial.testDeadline)}
                </span>
                {trial.preferredReviewAt && (
                  <span className="mw-chip slate" title="Mốc thời gian doanh nghiệp mong muốn nhận báo cáo đánh giá hoàn chỉnh">
                    <Clock size={13} aria-hidden="true" />
                    Hạn trả KQ: {formatWhen(trial.preferredReviewAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mw-header-actions">
            <button
              type="button"
              className="mw-btn mw-btn-outline mw-btn-small"
              onClick={() => navigate('/mentor/reviews')}
            >
              <ArrowLeft size={14} aria-hidden="true" />
              <span>Quay lại</span>
            </button>
            {!reported && (
              <button
                type="button"
                className="mw-btn mw-btn-primary mw-btn-small"
                disabled={!trial.canPublish || publish.isPending}
                onClick={onPublish}
              >
                <CheckCircle2 size={14} aria-hidden="true" />
                <span>Công bố kết quả</span>
              </button>
            )}
          </div>
        </div>

        {trial.requestNote && (
          <div
            style={{
              marginTop: 14,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'var(--mw-primary-light)',
              border: '1px solid var(--mw-primary-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              color: 'var(--mw-primary-text)',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, color: 'var(--mw-primary)' }} aria-hidden="true" />
            <span>
              <b>Ghi chú từ doanh nghiệp:</b> “{trial.requestNote}”
            </span>
          </div>
        )}
      </div>

      {/* Review Split Workspace */}
      <div className="mw-review-layout">
        {/* Left Side: Candidates Navigator */}
        <aside className="mw-participants-panel">
          <div className="mw-panel-head">
            <span className="mw-panel-title">
              <UserCheck size={16} style={{ color: 'var(--mw-primary)' }} aria-hidden="true" />
              <span>Thí sinh ({trial.participants.length})</span>
            </span>
            <span className="mw-chip indigo" style={{ fontSize: 11, padding: '2px 8px' }}>
              {trial.assessments.filter((a) => a.reviewedAt).length}/{trial.assessments.length} đã chấm
            </span>
          </div>

          <div style={{ marginBottom: 10 }}>
            <input
              type="search"
              className="mw-search-input"
              style={{ height: 34, fontSize: 12.5 }}
              placeholder="Tìm thí sinh..."
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              aria-label="Tìm kiếm thí sinh"
            />
          </div>

          <div className="mw-participants-list">
            {filteredParticipants.map((p) => {
              const a = trial.assessments.find((x) => x.employeeId === p.employeeId);
              const isSelected = a?.assessmentId === selected;
              const isReviewed = Boolean(a?.reviewedAt);

              return (
                <button
                  key={p.id}
                  type="button"
                  className={`mw-candidate-card ${isSelected ? 'active' : ''}`}
                  disabled={!a}
                  onClick={() => a && setSelected(a.assessmentId)}
                  title={!a ? 'Thí sinh chưa nộp bài' : undefined}
                >
                  <div className="mw-avatar">
                    {p.fullName
                      .trim()
                      .split(' ')
                      .slice(-2)
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div className="mw-candidate-details">
                    <span className="mw-candidate-name">{p.fullName}</span>
                    <span className="mw-candidate-role">
                      {[p.departmentName, p.positionName].filter(Boolean).join(' · ') || 'Chưa gán vị trí'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span className="tp-vars">
                        <ParticipantStatus status={p.status} />
                      </span>
                      {isReviewed && (
                        <span className="mw-chip emerald" style={{ fontSize: 10.5, padding: '1px 6px' }}>
                          <Check size={10} aria-hidden="true" /> Đã chấm
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Side: Detailed Assessment & Grading Form */}
        <div style={{ minWidth: 0 }}>
          {assessment ? (
            <AssessmentReview
              key={assessment.assessmentId}
              trial={trial}
              assessment={assessment}
              readOnly={reported}
            />
          ) : (
            <div className="mw-workspace-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <FileText size={36} style={{ color: 'var(--mw-slate-400)', margin: '0 auto 12px auto' }} />
              <h3 style={{ margin: '0 0 6px 0', fontSize: 16, color: 'var(--mw-slate-800)' }}>
                Chưa chọn bài làm
              </h3>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--mw-slate-500)' }}>
                Chọn một thí sinh từ danh sách bên trái để bắt đầu đánh giá bài làm.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function AssessmentReview({
  trial,
  assessment,
  readOnly,
}: {
  trial: MentorTrial;
  assessment: MentorAssessment;
  readOnly: boolean;
}) {
  const review = useReviewTrialAssessment(trial.organizationId);
  const ai = useTrialEssayAiReview(trial.organizationId);
  const pass = trial.essayPassScore;
  const [scores, setScores] = useState<(number | null)[]>(() => assessment.essays.map((e) => e.score ?? null));
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [note, setNote] = useState(assessment.reviewNote ?? '');
  const [showItems, setShowItems] = useState(false);
  const autoAi = useRef(false);

  // Auto trigger AI evaluation once if missing
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

  const applyAiScores = () => {
    if (!assessment.aiReview) return;
    setScores(assessment.essays.map((e, i) => aiScore(e.tier)?.score ?? scores[i]));
    toast.success('Đã áp dụng toàn bộ điểm AI gợi ý vào các câu tự luận.');
  };

  const applySingleAiScore = (tier: number, index: number) => {
    const s = aiScore(tier);
    if (!s) return;
    setScores((prev) => prev.map((item, i) => (i === index ? s.score : item)));
    toast.success(`Đã áp dụng gợi ý AI (${s.score} điểm) cho cấp ${TIER_LABELS[tier]}`);
  };

  const save = () =>
    review.mutate(
      {
        assessmentId: assessment.assessmentId,
        levels: assessment.domains.map((d) => ({ categoryId: d.categoryId, level: levelOf(d) })),
        essayScores: scores.map((s) => s ?? 0),
        note: note.trim() || null,
      },
      {
        onSuccess: () => toast.success(`Đã lưu kết quả đánh giá của ${assessment.fullName}`),
        onError: (err) => toast.error(errorMessage(err)),
      },
    );

  return (
    <>
      {/* Candidate Banner Card */}
      <div className="mw-workspace-card">
        <div className="mw-candidate-banner">
          <div className="mw-banner-user">
            <div className="mw-avatar" style={{ width: 44, height: 44, fontSize: 15 }}>
              {assessment.fullName
                .trim()
                .split(' ')
                .slice(-2)
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>
            <div className="mw-banner-meta">
              <h2>{assessment.fullName}</h2>
              <span>
                {[assessment.departmentName, assessment.positionName].filter(Boolean).join(' · ')} · Nộp bài lúc{' '}
                {formatWhen(assessment.submittedAt)}
              </span>
            </div>
          </div>

          <div className="mw-banner-scores">
            <span className="mw-chip indigo" style={{ fontSize: 13, padding: '5px 12px' }}>
              Trắc nghiệm: <b>{assessment.choiceScore}/{assessment.choiceTotal}</b>
            </span>
            <span
              className={`mw-chip ${scored ? 'emerald' : 'amber'}`}
              style={{ fontSize: 13, padding: '5px 12px' }}
            >
              Tự luận: {scored ? `${essayTotal}/${assessment.essays.length * trial.essayMaxScore}` : 'Chưa chấm xong'}
            </span>
          </div>
        </div>
      </div>

      {/* Proctoring & Recording Player */}
      <div className="mw-workspace-card">
        <div className="mw-panel-head" style={{ marginBottom: 14 }}>
          <span className="mw-panel-title">
            <Video size={16} style={{ color: 'var(--mw-primary)' }} aria-hidden="true" />
            <span>Bản ghi giám sát phòng thi</span>
          </span>
          {assessment.recording && (
            <span className="mw-chip emerald">Bản ghi hợp lệ</span>
          )}
        </div>
        {assessment.recording ? (
          <RecordingPlayer recording={assessment.recording} />
        ) : (
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              background: 'var(--mw-slate-50)',
              borderRadius: 12,
              border: '1px dashed var(--mw-slate-300)',
              color: 'var(--mw-slate-500)',
              fontSize: 13.5,
            }}
          >
            Thí sinh làm bài không yêu cầu quay video hoặc không có bản ghi giám sát.
          </div>
        )}
      </div>

      {/* Essay Evaluation Section */}
      <div className="mw-workspace-card">
        <div className="mw-panel-head" style={{ marginBottom: 14 }}>
          <div>
            <span className="mw-panel-title">
              <FileText size={16} style={{ color: 'var(--mw-primary)' }} aria-hidden="true" />
              <span>Chấm điểm bài tự luận</span>
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--mw-slate-500)' }}>
              Thang điểm từ 0 đến {trial.essayMaxScore} mỗi bài · Đạt từ {pass} điểm trở lên
            </span>
          </div>

          {!readOnly && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {assessment.aiReview && (
                <button
                  type="button"
                  className="mw-btn mw-btn-outline mw-btn-small"
                  onClick={applyAiScores}
                >
                  <Sparkles size={13} style={{ color: 'var(--mw-ai)' }} aria-hidden="true" />
                  <span>Áp dụng tất cả điểm AI</span>
                </button>
              )}
              {trial.aiAvailable && (
                <button
                  type="button"
                  className="mw-btn mw-btn-outline mw-btn-small"
                  disabled={ai.isPending}
                  onClick={runAi}
                >
                  <Sparkles size={13} aria-hidden="true" />
                  <span>{ai.isPending ? 'AI đang phân tích…' : assessment.aiReview ? 'AI chấm lại' : 'AI gợi ý điểm'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Global AI Summary Box */}
        {assessment.aiReview?.summary && (
          <div className="mw-ai-box">
            <Sparkles size={18} className="mw-ai-icon" aria-hidden="true" />
            <div className="mw-ai-content">
              <b>Nhận xét tổng thể từ Gemini AI:</b> {assessment.aiReview.summary}
            </div>
          </div>
        )}

        {/* Essay Questions Loop */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {assessment.essays.map((e, i) => {
            const suggestion = aiScore(e.tier);
            const score = scores[i];
            const isPassed = score != null && score >= pass;

            return (
              <section key={e.tier} className="mw-essay-card" aria-label={`Tự luận ${TIER_LABELS[e.tier]}`}>
                <div className="mw-essay-header">
                  <div className="mw-essay-tier">
                    <span className="mw-chip indigo">{TIER_LABELS[e.tier]}</span>
                    <span>{e.title}</span>
                  </div>
                  {score != null && (
                    <span className={`mw-chip ${isPassed ? 'emerald' : 'rose'}`}>
                      {score}/{trial.essayMaxScore} điểm · {isPassed ? 'Đạt yêu cầu' : 'Chưa đạt'}
                    </span>
                  )}
                </div>

                <div className="mw-essay-prompt">
                  <b>Đề bài:</b> {e.prompt}
                </div>

                <div className="mw-essay-text">
                  {e.text}
                </div>

                {suggestion && (
                  <div className="mw-ai-box" style={{ margin: '8px 0 12px 0', padding: '10px 14px' }}>
                    <Sparkles size={15} className="mw-ai-icon" aria-hidden="true" />
                    <div className="mw-ai-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span>
                        <b>Gợi ý AI: {suggestion.score}/{trial.essayMaxScore} điểm ({suggestion.passed ? 'Đạt' : 'Chưa đạt'}).</b>{' '}
                        {suggestion.feedback}
                      </span>
                      {!readOnly && score !== suggestion.score && (
                        <button
                          type="button"
                          className="mw-btn mw-btn-outline mw-btn-small"
                          style={{ height: 26, fontSize: 11.5, padding: '0 8px', marginLeft: 12, flexShrink: 0 }}
                          onClick={() => applySingleAiScore(e.tier, i)}
                        >
                          Chọn {suggestion.score}đ
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Score Selector Strip */}
                <div className="mw-score-row">
                  <span className="mw-score-label">
                    Chọn điểm (Đạt: ≥ {pass}):
                  </span>
                  <div className="mw-score-buttons" role="radiogroup" aria-label={`Điểm bài tự luận ${TIER_LABELS[e.tier]}`}>
                    {Array.from({ length: trial.essayMaxScore + 1 }, (_, value) => {
                      const isSelected = score === value;
                      const isValPass = value >= pass;
                      return (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          className={`mw-score-btn ${isSelected ? (isValPass ? 'selected-pass' : 'selected-fail') : ''
                            }`}
                          disabled={readOnly}
                          onClick={() => setScores((prev) => prev.map((s, k) => (k === i ? value : s)))}
                          title={`${value} điểm (${isValPass ? 'Đạt' : 'Chưa đạt'})`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Domain Matrix Section */}
      <div className="mw-workspace-card">
        <div className="mw-panel-head" style={{ marginBottom: 12 }}>
          <div>
            <span className="mw-panel-title">
              <Award size={16} style={{ color: 'var(--mw-primary)' }} aria-hidden="true" />
              <span>Đánh giá 5 miền năng lực số</span>
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--mw-slate-500)' }}>
              Mức gợi ý tổng hợp từ trắc nghiệm và tự luận
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid var(--mw-slate-200)', borderRadius: 12 }}>
          <table className="mw-domain-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Lĩnh vực năng lực</th>
                {[1, 2, 3].map((t) => (
                  <th key={t} style={{ width: '12%', textAlign: 'center' }}>
                    {TIER_LABELS[t]}
                  </th>
                ))}
                <th style={{ width: '14%', textAlign: 'center' }}>Mức gợi ý</th>
                <th style={{ width: '18%' }}>Mức chốt của Mentor</th>
              </tr>
            </thead>
            <tbody>
              {assessment.domains.map((d) => (
                <tr key={d.categoryId}>
                  <td>
                    <strong style={{ color: 'var(--mw-slate-900)' }}>
                      {d.number}. {d.name}
                    </strong>
                  </td>
                  {[0, 1, 2].map((i) => {
                    const correct = d.correct[i] ?? 0;
                    const total = d.total[i] ?? 0;
                    const isPerfect = total > 0 && correct === total;
                    return (
                      <td key={i} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: isPerfect ? 'var(--mw-success)' : 'var(--mw-slate-600)' }}>
                            {correct}/{total}
                          </span>
                          <div className="mw-tier-bars" title={`${correct}/${total} câu đúng`}>
                            {Array.from({ length: total }, (_, k) => (
                              <div
                                key={k}
                                className={`mw-tier-bar ${k < correct ? 'ok' : 'fail'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'center' }}>
                    <LevelBadge level={suggestLevel(d.suggestedLevel, scores, pass)} />
                  </td>
                  <td>
                    <select
                      className="mw-select"
                      aria-label={`Mức ${d.name}`}
                      value={levelOf(d)}
                      disabled={readOnly}
                      onChange={(e) =>
                        setOverrides((prev) => ({ ...prev, [d.categoryId]: Number(e.target.value) }))
                      }
                      style={{ width: '100%' }}
                    >
                      {LEVEL_LABELS.map((label, level) => (
                        <option key={label} value={level}>
                          {label} (Mức {level})
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Collapsible Questions Detail Toggle */}
        <div style={{ marginTop: 14 }}>
          <button
            type="button"
            className="mw-btn mw-btn-outline mw-btn-small"
            onClick={() => setShowItems((v) => !v)}
          >
            {showItems ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
            <span>{showItems ? 'Thu gọn' : 'Xem chi tiết'} từng câu trắc nghiệm ({assessment.choiceItems.length} câu)</span>
          </button>
        </div>

        {showItems && (
          <div style={{ marginTop: 12, border: '1px solid var(--mw-slate-200)', borderRadius: 12, overflow: 'hidden' }}>
            <table className="mw-table">
              <thead>
                <tr>
                  <th style={{ width: '8%', textAlign: 'center' }}>Câu</th>
                  <th style={{ width: '77%' }}>Nội dung câu hỏi & Lựa chọn</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>Kết quả</th>
                </tr>
              </thead>
              <tbody>
                {assessment.choiceItems.map((item) => (
                  <tr key={item.number}>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--mw-slate-500)' }}>
                      #{item.number}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--mw-slate-900)', marginBottom: 4 }}>
                        {item.question}
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--mw-slate-600)' }}>
                        <span>Đã chọn: <b>{item.selected}</b></span>
                        {!item.isCorrect && (
                          <span style={{ color: 'var(--mw-success-text)', marginLeft: 8 }}>
                            · Đáp án đúng: <b>{item.correct}</b>
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.isCorrect ? (
                        <span className="mw-chip emerald" style={{ fontSize: 11 }}>
                          <CheckCircle2 size={12} aria-hidden="true" /> Chính xác
                        </span>
                      ) : (
                        <span className="mw-chip rose" style={{ fontSize: 11 }}>
                          <XCircle size={12} aria-hidden="true" /> Chưa đúng
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mentor Feedback Textarea Card */}
      <div className="mw-workspace-card">
        <div className="mw-panel-head" style={{ marginBottom: 10 }}>
          <span className="mw-panel-title">
            <FileText size={16} style={{ color: 'var(--mw-primary)' }} aria-hidden="true" />
            <span>Nhận xét và khuyến nghị từ Mentor</span>
          </span>
          <span style={{ fontSize: 12, color: 'var(--mw-slate-500)' }}>
            Hiển thị trực tiếp trên báo cáo năng lực gửi cho doanh nghiệp
          </span>
        </div>

        <textarea
          className="tp textarea"
          placeholder="Ghi nhận xét chuyên môn, đánh giá điểm mạnh, khoảng trống kỹ năng cần cải thiện cho thí sinh..."
          value={note}
          maxLength={2000}
          disabled={readOnly}
          onChange={(e) => setNote(e.target.value)}
          style={{
            width: '100%',
            minHeight: 100,
            borderRadius: 10,
            border: '1px solid var(--mw-slate-300)',
            padding: 12,
            fontSize: 13.5,
            lineHeight: 1.5,
          }}
        />
      </div>

      {/* Sticky Bottom Action Save Bar */}
      {!readOnly && (
        <div className="mw-sticky-save-bar">
          <div className="mw-sticky-status">
            <Award size={18} style={{ color: '#818cf8' }} aria-hidden="true" />
            <span>
              {!scored
                ? 'Vui lòng cho điểm cả 3 câu tự luận trước khi lưu kết quả.'
                : assessment.reviewedAt
                  ? `Đã chấm lúc ${formatWhen(assessment.reviewedAt)}. Có thể sửa đổi và lưu lại.`
                  : 'Đã sẵn sàng lưu kết quả chấm cho thí sinh này.'}
            </span>
          </div>

          <div className="mw-sticky-actions">
            <button
              type="button"
              className="mw-btn mw-btn-primary"
              disabled={!scored || review.isPending}
              onClick={save}
            >
              <Check size={16} aria-hidden="true" />
              <span>{review.isPending ? 'Đang lưu…' : 'Lưu kết quả chấm'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
