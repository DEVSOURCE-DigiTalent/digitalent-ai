import { useState } from 'react';
import { useManagedDepartment } from '@/hooks/use-managed-department';
import { Check, ClipboardCheck, X, ArrowRight, GraduationCap, Building2, Clock, CheckCircle2, AlertCircle, FileCheck2, Sparkles } from 'lucide-react';
import '@/features/trial-program/mentor-workspace.css';
import { toast } from 'sonner';
import { useDecidePulseFinal, useDecidePulsePreAssessment, usePulseFinalReviews, useRecordPulseSupport } from '@/hooks/use-pulse';
import type {
  PulseAiHint,
  PulseChoiceResult,
  PulseCriterion,
  PulseDecision,
  PulseExamKind,
  PulseFinalAttempt,
  PulseFinalReviewItem,
  PulseReviewStatus,
  PulseSupportAction,
} from '@/services/pulse.service';
import { formatDateTime } from '@/lib/utils';
import { CourseFinalBrief } from '@/components/shared/CourseFinalBrief';
import { ChoiceScore } from '@/features/pulse-employee/components/blocks';
import { Empty, LoadError, Mini, Notice, PageHead, PageSkeleton, Pill, PuLink } from '@/features/pulse-employee/components/ui';
import { btn } from '@/features/pulse-employee/lib/button';
import { SUPPORT_LABELS, levelName, pulseErrorMessage, timeLeft } from '@/features/pulse-employee/lib/labels';
import { ManagerPage, NoDepartment } from '../components/ManagerUi';
import { RecordingPlayer } from '../components/RecordingPlayer';
import { RiskTag } from '../components/ProctoringRiskPanel';
import { MANAGER_PATHS } from '../lib/paths';

const MIN_REASON = 10;

type Filter = 'ALL' | 'REVIEWED' | 'PENDING' | 'RETRY' | 'DEADLINE_MISSED' | 'FLAGGED';
type KindFilter = 'ALL' | PulseExamKind;

const KIND_FILTERS: { key: KindFilter; label: string }[] = [
  { key: 'ALL', label: 'Mọi loại bài' },
  { key: 'PRE_ASSESSMENT', label: 'Đánh giá trước khi học' },
  { key: 'FINAL', label: 'Bài cuối khóa' },
];

const KIND_LABELS: Record<PulseExamKind, string> = {
  PRE_ASSESSMENT: 'Đánh giá trước khi học',
  FINAL: 'Bài cuối khóa',
};

const FILTERS: { key: Filter; label: string; match: (status: PulseReviewStatus) => boolean }[] = [
  { key: 'ALL', label: 'Tất cả', match: () => true },
  { key: 'PENDING', label: 'Chờ quyết định', match: (s) => s === 'PENDING' },
  { key: 'RETRY', label: 'Chờ nộp lại', match: (s) => s === 'RETRY_WAIT' || s === 'RETRY_READY' },
  { key: 'DEADLINE_MISSED', label: 'Quá hạn nộp lại', match: (s) => s === 'DEADLINE_MISSED' },
  { key: 'FLAGGED', label: 'Cần hỗ trợ', match: (s) => s === 'FLAGGED' },
  { key: 'REVIEWED', label: 'Đã có kết quả', match: (s) => s === 'APPROVED' || s === 'NOT_YET' },
];

const STATUS_PILL: Record<PulseReviewStatus, { label: string; tone: 'gray' | 'coral' | 'green' }> = {
  PENDING: { label: 'Cần quyết định', tone: 'gray' },
  RETRY_WAIT: { label: 'Chờ nộp lại', tone: 'green' },
  RETRY_READY: { label: 'Đang mở lần nộp cuối', tone: 'green' },
  DEADLINE_MISSED: { label: 'Quá hạn nộp lại', tone: 'coral' },
  FLAGGED: { label: 'Cờ hỗ trợ', tone: 'coral' },
  APPROVED: { label: 'Đã duyệt', tone: 'green' },
  NOT_YET: { label: 'Chưa đạt', tone: 'coral' },
};

const STATUS_HINT: Record<PulseReviewStatus, string> = {
  PENDING: 'Xem kết quả trắc nghiệm, đọc phần tự luận theo ba tiêu chí, rồi ghi quyết định kèm lý do. Đạt cần cả hai phần đạt.',
  RETRY_WAIT: 'Nhân viên đang đọc nhận xét; lần nộp cuối chưa mở.',
  RETRY_READY: 'Lần nộp cuối đang mở, nhân viên cần nộp trước hạn.',
  DEADLINE_MISSED: 'Đã quá hạn nộp lần cuối.',
  FLAGGED: 'Hai lần nộp chưa đạt và cần hỗ trợ.',
  APPROVED: 'Bài đã được duyệt đạt chuẩn và công nhận hoàn thành cấp độ khóa học.',
  NOT_YET: 'Bài đánh giá trước khi học chưa đạt. Nhân viên tiếp tục học khóa và nộp bài cuối cấp.',
};

const PRE_HINT = 'Bài làm trước khi học, theo đề cuối khóa (trắc nghiệm và tự luận). Đạt: khóa được công nhận, nhân viên không cần học. Chưa đạt: nhân viên học khóa rồi làm bài cuối khóa.';

const SUPPORT_OPTIONS: { action: PulseSupportAction; label: string }[] = [
  { action: 'COACHING', label: 'Sắp xếp kèm cặp' },
  { action: 'FRESH_CYCLE', label: 'Đề xuất chu kỳ học mới' },
  { action: 'PAUSE', label: 'Tạm dừng lộ trình' },
];

/** MG-13 hiển thị kết quả bài làm của phòng ban. Chế độ mentor hiển thị thao tác chấm bài. */
export function PulseFinalReviewsPage({ audience = 'manager' }: { audience?: 'manager' | 'mentor' } = {}) {
  const mentor = audience === 'mentor';
  const { department, isLoading: departmentLoading, isError: departmentError, refetch: refetchDepartment } = useManagedDepartment();
  const { data, isLoading, error, refetch } = usePulseFinalReviews({
    enabled: mentor || Boolean(department),
    includeReviewed: !mentor,
    departmentId: mentor ? undefined : department?.id,
  });
  const [filter, setFilter] = useState<Filter>('ALL');
  const [kind, setKind] = useState<KindFilter>('ALL');

  if (isLoading || (!mentor && departmentLoading)) {
    return (
      <ManagerPage>
        <PageSkeleton blocks={[140, 110, 420]} />
      </ManagerPage>
    );
  }
  if (!mentor && departmentError) {
    return <ManagerPage><LoadError message="Không tải được phòng ban bạn phụ trách." onRetry={() => refetchDepartment()} /></ManagerPage>;
  }
  if (!mentor && !department) {
    return <ManagerPage><PageHead eyebrow="Quản lý đội" title="Kết quả bài làm" /><NoDepartment /></ManagerPage>;
  }
  if (error || !data) {
    return (
      <ManagerPage>
        <LoadError message={pulseErrorMessage(error, 'Không tải được hàng chờ bài cuối khóa.')} onRetry={() => refetch()} />
      </ManagerPage>
    );
  }

  const active = FILTERS.find((f) => f.key === filter)!;
  const ofKind = data.items.filter((item) => kind === 'ALL' || item.kind === kind);
  const visible = ofKind.filter((item) => active.match(item.status));

  return (
    <ManagerPage testId="pulse-final-reviews">
{mentor ? (
        <div className="mw-header">
          <div className="mw-breadcrumbs">
            <span>Không gian làm việc</span>
            <span>/</span>
            <span className="current">Bài cuối khóa học thử</span>
          </div>
          <div className="mw-header-main">
            <div className="mw-title-block">
              <div className="mw-title-icon">
                <GraduationCap className="size-6" aria-hidden="true" />
              </div>
              <div>
                <h1>Chấm bài cuối khóa học thử</h1>
                <p>
                  Đánh giá bài nộp cuối khóa và bài tự đánh giá trước khi học của nhân sự các doanh nghiệp dùng thử được phân công.
                </p>
              </div>
            </div>
            <div className="mw-header-actions">
              <span className="mw-chip amber" style={{ fontSize: 13, padding: '6px 12px' }}>
                <Clock size={14} aria-hidden="true" />
                {data.pendingCount} bài chờ quyết định
              </span>
            </div>
          </div>
        </div>
      ) : (
        <PageHead
          eyebrow={department?.name ?? 'Quản lý đội'}
          title="Kết quả bài làm"
          description="Xem bài nộp, kết quả và nhận xét của mentor cho bài đánh giá trước khi học và bài cuối khóa."
        />
      )}

      {mentor ? (
        <div className="mw-kpi-grid">
          <div className="mw-kpi-card">
            <div className="mw-kpi-icon amber">
              <Clock className="size-5" aria-hidden="true" />
            </div>
            <div className="mw-kpi-info">
              <span className="mw-kpi-label">Chờ quyết định</span>
              <span className="mw-kpi-value">{data.pendingCount}</span>
              <span className="mw-kpi-sub">Cần xem xét ngay</span>
            </div>
          </div>
          <div className="mw-kpi-card">
            <div className="mw-kpi-icon indigo">
              <FileCheck2 className="size-5" aria-hidden="true" />
            </div>
            <div className="mw-kpi-info">
              <span className="mw-kpi-label">Đánh giá trước học</span>
              <span className="mw-kpi-value">{data.preAssessmentCount}</span>
              <span className="mw-kpi-sub">Miễn học phần</span>
            </div>
          </div>
          <div className="mw-kpi-card">
            <div className="mw-kpi-icon emerald">
              <CheckCircle2 className="size-5" aria-hidden="true" />
            </div>
            <div className="mw-kpi-info">
              <span className="mw-kpi-label">Chờ nộp lại</span>
              <span className="mw-kpi-value">{data.retryCount}</span>
              <span className="mw-kpi-sub">Đang sửa bài</span>
            </div>
          </div>
          <div className="mw-kpi-card">
            <div className="mw-kpi-icon rose">
              <AlertCircle className="size-5" aria-hidden="true" />
            </div>
            <div className="mw-kpi-info">
              <span className="mw-kpi-label">Cần hỗ trợ</span>
              <span className="mw-kpi-value">{data.flaggedCount + data.deadlineMissedCount}</span>
              <span className="mw-kpi-sub">Quá hạn hoặc gắn cờ</span>
            </div>
          </div>
        </div>
      ) : (
        <section className="pu-metrics pu-review-kpis" aria-label="Tình trạng hàng chờ" style={{ marginTop: 16 }}>
          <div><strong>{data.pendingCount}</strong><span>Chờ mentor chấm</span></div>
          <div><strong>{data.preAssessmentCount}</strong><span>Đánh giá trước khi học</span></div>
          <div><strong>{data.retryCount}</strong><span>Chờ nộp lại</span></div>
          <div className="warn"><strong>{data.deadlineMissedCount}</strong><span>Quá hạn nộp lại</span></div>
          <div className="warn"><strong>{data.flaggedCount}</strong><span>Cần hỗ trợ</span></div>
        </section>
      )}

      {data.items.length === 0 ? (
        <div style={{ marginTop: 22 }}>
          <Empty
            icon={<ClipboardCheck size={24} />}
            title={mentor ? 'Chưa có bài nào cần quyết định.' : 'Phòng ban chưa có bài nộp.'}
            action={mentor ? undefined : <PuLink to={MANAGER_PATHS.overview} kind="outline">Quay lại đội ngũ</PuLink>}
          >
            {mentor
              ? 'Khi nhân viên doanh nghiệp dùng thử nộp bài cuối khóa Cơ bản, bài sẽ xuất hiện ở đây.'
              : 'Khi nhân viên trong phòng ban nộp bài đánh giá trước khi học hoặc bài cuối khóa, bạn có thể theo dõi trạng thái và kết quả tại đây.'}
          </Empty>
        </div>
      ) : (
        <>
          {mentor ? (
            <div className="mw-toolbar">
              <div className="mw-filter-pills">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    className={`mw-filter-btn ${filter === f.key ? 'active' : ''}`}
                    onClick={() => setFilter(f.key)}
                  >
                    <span>{f.label}</span>
                    <span className="mw-filter-count">
                      {ofKind.filter((item) => f.match(item.status)).length}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mw-filter-pills">
                {KIND_FILTERS.map((k) => (
                  <button
                    key={k.key}
                    type="button"
                    className={`mw-filter-btn ${kind === k.key ? 'active' : ''}`}
                    onClick={() => setKind(k.key)}
                  >
                    <span>{k.label}</span>
                    <span className="mw-filter-count">
                      {data.items.filter((item) => k.key === 'ALL' || item.kind === k.key).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="pu-tabs" role="group" aria-label="Lọc theo loại bài">
                {KIND_FILTERS.map((k) => (
                  <button key={k.key} type="button" aria-pressed={kind === k.key} onClick={() => setKind(k.key)}>
                    {k.label}<span>{data.items.filter((item) => k.key === 'ALL' || item.kind === k.key).length}</span>
                  </button>
                ))}
              </div>
              <div className="pu-tabs" role="group" aria-label="Lọc theo trạng thái">
                {FILTERS.map((f) => (
                  <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
                    {f.key === 'PENDING' ? 'Chờ mentor chấm' : f.label}<span>{ofKind.filter((item) => f.match(item.status)).length}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="pu-stack">
            {visible.length === 0 && <Notice>Không có bài nào ở trạng thái này.</Notice>}
            {visible.map((item) => (
              <ReviewCard key={`${item.kind}-${item.submissionId}`} item={item} criteria={data.criteria} showOrganization={mentor} />
            ))}
          </div>
        </>
      )}

      {!mentor && (
      <section className="pu-surface pu-pad" style={{ marginTop: 18 }}>
        <Mini>Luồng minh chứng riêng</Mini>
        <h2 className="pu-panel-title">Nhiệm vụ thực tế không phải bài cuối khóa.</h2>
        <p className="pu-panel-desc">
          Minh chứng công việc được duyệt trong lúc học, ở hàng chờ nhiệm vụ thực tế. Quy tắc hai lần nộp chỉ áp dụng cho bài cuối
          sau mỗi khóa.
        </p>
        <PuLink to={MANAGER_PATHS.evidence} kind="outline" small>Mở minh chứng thực tế →</PuLink>
      </section>
      )}
    </ManagerPage>
  );
}

export function ReviewCard({ item, criteria, showOrganization }: { item: PulseFinalReviewItem; criteria: PulseCriterion[]; showOrganization?: boolean }) {
  const latest = item.attempts[item.attempts.length - 1];
  const earlier = item.attempts.slice(0, -1);
  const pill = STATUS_PILL[item.status];
  const firstMiss = item.attempts.find((a) => a.retryOpensAt || a.retryDueAt);
  const isPre = item.kind === 'PRE_ASSESSMENT';

  return (
    <article className="pu-surface pu-pad pu-review-card" aria-label={`${item.employeeName} · ${item.courseTitle}`}>
      <header>
        <div>
          {showOrganization && item.organizationName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <span className="mw-chip indigo" style={{ fontSize: 11.5, padding: '2px 8px' }}>
                <Building2 size={12} aria-hidden="true" />
                {item.organizationName}
              </span>
              <span style={{ fontSize: 12.5, color: 'var(--mw-slate-500)', fontWeight: 500 }}>
                {item.employeeName} · {item.positionName ?? 'Chưa gán vị trí'} · {item.courseTitle}
              </span>
            </div>
          ) : (
            <Mini>
              {item.employeeName} / {item.positionName ?? 'Chưa gán vị trí'} / {item.courseTitle}
            </Mini>
          )}
          <h2>{isPre ? 'Đánh giá trước khi học' : `Bài cuối khóa · lần nộp ${item.attemptNo}/${item.maxAttempts}`}</h2>
          <p className="pu-review-meta">
            {[item.domainName, item.tier ? levelName(item.tier) : null, latest ? `nộp ${formatDateTime(latest.submittedAt)}` : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <div className="pu-row">
          <span className={`pu-kind-tag ${isPre ? 'pre' : 'final'}`}>{KIND_LABELS[item.kind]}</span>
          {item.recording?.risk && <RiskTag risk={item.recording.risk} />}
          <Pill tone={pill.tone}>{!showOrganization && item.status === 'PENDING' ? 'Chờ mentor chấm' : pill.label}</Pill>
        </div>
      </header>
      <p className="pu-panel-desc" style={{ marginTop: 10 }}>{isPre ? PRE_HINT : !showOrganization && item.status === 'PENDING' ? 'Bài đã nộp và đang chờ mentor chấm.' : STATUS_HINT[item.status]}</p>

      {item.recording ? (
        item.status === 'PENDING' ? (
          <RecordingPlayer recording={item.recording} />
        ) : (
          <details className="pu-review-recording">
            <summary>Xem bản ghi lần nộp gần nhất</summary>
            <RecordingPlayer recording={item.recording} />
          </details>
        )
      ) : item.proctoringSessionId ? (
        <div className="pu-rplayer-missing" style={{ marginTop: 16 }}>Không tải được bản ghi của bài này.</div>
      ) : null}

      {latest?.choice && <ChoiceReview choice={latest.choice} />}
      {item.assignment && <CourseFinalBrief content={item.assignment} />}

      {latest && (
        <div className="pu-review-evidence">
          <Mini>{latest.choice ? 'Phần tự luận · minh chứng đã nộp' : 'Minh chứng đã nộp'}</Mini>
          <p>{latest.evidenceText}</p>
        </div>
      )}

      {showOrganization && item.status === 'PENDING' && (
        <div className="pu-review-grid">
          <div className="pu-rubric" aria-label="Ba tiêu chí của phần tự luận">
            {criteria.map((criterion, index) => {
              const met = item.aiHint?.checks[index] ?? false;
              return (
                <div key={criterion.number || index}>
                  <b>{criterion.number}</b>
                  <span>{criterion.title}<small>{criterion.description}</small></span>
                  <span className={`pu-check${met ? " on" : ""}`} aria-label={met ? "Gợi ý: có" : "Gợi ý: chưa thấy"}>{met ? <Check size={14} className="text-emerald-600" /> : <span style={{ color: "#94a3b8" }}>·</span>}</span>
                </div>
              );
            })}
          </div>
          <AiEvaluationPanel hint={item.aiHint} />
        </div>
      )}

      {earlier.length > 0 && (
        <div className="pu-review-history">
          <Mini>Lần nộp trước</Mini>
          {earlier.map((attempt, idx) => <AttemptHistory key={attempt.submissionId || attempt.attemptNo || idx} attempt={attempt} max={item.maxAttempts} />)}
        </div>
      )}

      {latest?.decisionReason && item.status !== 'RETRY_WAIT' && item.status !== 'RETRY_READY' && (
        <Notice>Nhận xét của {latest.reviewerName ?? 'người chấm'} · {latest.decisionReason}</Notice>
      )}
      {showOrganization && item.status === 'PENDING' && (isPre ? <PreAssessmentDecisionForm item={item} /> : <DecisionForm item={item} />)}
      {(item.status === 'RETRY_WAIT' || item.status === 'RETRY_READY') && (
        <div style={{ marginTop: 16 }}>
          {latest?.decisionReason && (
            <Notice>Nhận xét lần {latest.attemptNo}: {latest.decisionReason}</Notice>
          )}
          <div style={{ marginTop: 10 }}>
            <Notice tone="warning">
              Lần nộp cuối mở {formatDateTime(firstMiss?.retryOpensAt)} ({timeLeft(firstMiss?.retryOpensAt)}) và hết hạn{' '}
              {formatDateTime(firstMiss?.retryDueAt)} ({timeLeft(firstMiss?.retryDueAt)}).
            </Notice>
          </div>
        </div>
      )}
      {showOrganization && (item.status === 'FLAGGED' || item.status === 'DEADLINE_MISSED') && <SupportForm item={item} />}
    </article>
  );
}

const AI_CRITERIA: { key: string; label: string; scoreKey: keyof import('@/services/pulse.service').PulseAiDetail; noteKey: keyof import('@/services/pulse.service').PulseAiDetail; invert?: boolean }[] = [
  { key: 'plagiarism', label: 'Đạo văn / sao chép', scoreKey: 'plagiarismScore', noteKey: 'plagiarismNote', invert: true },
  { key: 'ai', label: 'Nội dung do AI tạo', scoreKey: 'aiGeneratedScore', noteKey: 'aiGeneratedNote', invert: true },
  { key: 'relevance', label: 'Đúng đề bài & liên quan', scoreKey: 'relevanceScore', noteKey: 'relevanceNote' },
  { key: 'depth', label: 'Chiều sâu / chi tiết', scoreKey: 'depthScore', noteKey: 'depthNote' },
  { key: 'clarity', label: 'Rõ ràng, mạch lạc', scoreKey: 'clarityScore', noteKey: 'clarityNote' },
];

function scoreColor(score: number, invert?: boolean): string {
  const v = invert ? score : 100 - score;
  if (v >= 70) return 'var(--pu-bad, #e74c3c)';
  if (v >= 40) return 'var(--pu-warn, #f59e0b)';
  return 'var(--pu-ok, #22c55e)';
}

function FraudLevelColor(level: string) {
  if (level === 'HIGH') return 'var(--pu-bad, #e74c3c)';
  if (level === 'MEDIUM') return 'var(--pu-warn, #f59e0b)';
  return 'var(--pu-ok, #22c55e)';
}

function FraudLevelLabel(level: string) {
  if (level === 'HIGH') return 'CAO';
  if (level === 'MEDIUM') return 'TRUNG BÌNH';
  return 'THẤP';
}

function AiEvaluationPanel({ hint }: { hint?: PulseAiHint | null }) {
  const d = hint?.detail;
  const f = hint?.fraud;
  return (
    <div className="pu-ai">
      {/* Phần cảnh báo gian lận */}
      {f && f.items.length > 0 && (
        <div className="pu-ai-fraud" style={{ borderColor: FraudLevelColor(f.level) }}>
          <h3 style={{ color: FraudLevelColor(f.level) }}>
            Cảnh báo nghi ngờ gian lận · Mức: {FraudLevelLabel(f.level)}
          </h3>
          <p className="pu-ai-fraud-summary">{f.summary}</p>
          <div className="pu-ai-fraud-list">
            {f.items.map((item, i) => (
              <div key={i} className="pu-ai-fraud-item">
                <span className="pu-ai-fraud-time">{item.time}</span>
                <span className="pu-ai-fraud-event">{item.event}</span>
                <span className="pu-ai-fraud-note">{item.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {f && f.items.length === 0 && (
        <div className="pu-ai-fraud pu-ai-fraud--ok">
          <p style={{ display: "flex", alignItems: "center", gap: 6 }}><Check size={14} className="text-emerald-600" aria-hidden="true" /> Không phát hiện hành vi bất thường trong quá trình làm bài.</p>
        </div>
      )}

      {/* Phần đánh giá bài viết */}
      <h3 style={{ display: "flex", alignItems: "center", gap: 6 }}><Sparkles size={15} style={{ color: "var(--mw-ai, #7c3aed)" }} aria-hidden="true" /> Đánh giá của AI (Gemini)</h3>
      {d ? (
        <>
          <div className="pu-ai-scores">
            {AI_CRITERIA.map(({ key, label, scoreKey, noteKey, invert }) => {
              const score = d[scoreKey] as number;
              const note = d[noteKey] as string;
              return (
                <div key={key} className="pu-ai-row">
                  <div className="pu-ai-row-head">
                    <span className="pu-ai-label">{label}</span>
                    <span className="pu-ai-score" style={{ color: scoreColor(score, invert) }}>{score}/100</span>
                  </div>
                  <div className="pu-ai-bar">
                    <div className="pu-ai-bar-fill" style={{ width: `${score}%`, background: scoreColor(score, invert) }} />
                  </div>
                  {note && <p className="pu-ai-note">{note}</p>}
                </div>
              );
            })}
          </div>
          {d.verdict && (
            <div className="pu-ai-verdict">
              <strong>Kết luận:</strong> {d.verdict}
            </div>
          )}
          <small>AI đánh giá tự động dựa trên đề bài và tiêu chí. Kết quả chỉ mang tính tham khảo.</small>
        </>
      ) : (
        <>
          <p>{hint?.summary ?? 'Chưa có gợi ý cho bài này.'}</p>
          <small>AI đánh giá tự động dựa trên đề bài và tiêu chí. Kết quả chỉ mang tính tham khảo.</small>
        </>
      )}
    </div>
  );
}

/**
 * Phần trắc nghiệm của bài (tự chấm lúc nộp): số câu đúng so với ngưỡng, từng câu với phương án đã chọn và đáp án đúng.
 * Nhân viên chưa thấy kết quả này cho tới khi người chấm quyết định.
 */
function ChoiceReview({ choice }: { choice: PulseChoiceResult }) {
  const items = choice.items ?? [];
  const wrong = items.filter((item) => !item.isCorrect).length;
  return (
    <section className="pu-review-choice" aria-label="Phần trắc nghiệm">
      <div className="pu-review-choice-head">
        <Mini>Phần trắc nghiệm · tự chấm</Mini>
        <strong>Đúng {choice.score}/{choice.total} câu</strong>
        <Pill tone={choice.passed ? 'green' : 'coral'}>{choice.passed ? 'Đạt' : 'Chưa đạt'} · cần từ {choice.passMark} câu</Pill>
      </div>
      {items.length > 0 && (
        <details>
          <summary>Xem từng câu{wrong ? ` · ${wrong} câu sai` : ' · không sai câu nào'}</summary>
          <ol className="pu-review-choice-list">
            {items.map((item) => (
              <li key={item.number} className={item.isCorrect ? 'ok' : 'no'}>
                <span className="pu-review-choice-mark" aria-label={item.isCorrect ? 'Đúng' : 'Sai'}>
                  {item.isCorrect ? <Check size={14} strokeWidth={3} aria-hidden /> : <X size={14} strokeWidth={3} aria-hidden />}
                </span>
                <div>
                  <strong>Câu {item.number}. {item.question}</strong>
                  <span>Đã chọn: {item.selected}</span>
                  {!item.isCorrect && <span className="correct">Đáp án đúng: {item.correct}</span>}
                </div>
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}

function AttemptHistory({ attempt, max }: { attempt: PulseFinalAttempt; max: number }) {
  return (
    <div className="pu-attempt">
      <header>
        <span>Lần nộp {attempt.attemptNo}/{max} · {formatDateTime(attempt.submittedAt)}</span>
        <Pill tone={attempt.decision === 'PASSED' ? 'green' : 'coral'}>{attempt.decision === 'PASSED' ? 'Đã duyệt' : 'Chưa đạt'}</Pill>
      </header>
      <ChoiceScore choice={attempt.choice} />
      <blockquote>{attempt.evidenceText}</blockquote>
      {attempt.decisionReason && (
        <div className="pu-feedback">
          <strong>Nhận xét của {attempt.reviewerName ?? 'người chấm'}</strong>: {attempt.decisionReason}
        </div>
      )}
    </div>
  );
}

function DecisionForm({ item }: { item: PulseFinalReviewItem }) {
  const decide = useDecidePulseFinal();
  const [decision, setDecision] = useState<PulseDecision | ''>('');
  const [reason, setReason] = useState('');
  const length = reason.trim().length;
  const isLastAttempt = item.attemptNo >= item.maxAttempts;
  const fieldId = `reason-${item.submissionId}`;
  const latest = item.attempts[item.attempts.length - 1];
  const choiceFails = Boolean(latest?.choice && !latest.choice.passed);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!decision || length < MIN_REASON) return;
    decide.mutate(
      { submissionId: item.submissionId, decision, reason: reason.trim() },
      {
        onSuccess: (result) => {
          toast.success(
            result.status === 'APPROVED'
              ? `Đã duyệt khóa học cho ${item.employeeName}.`
              : result.status === 'FLAGGED'
                ? 'Lần nộp cuối chưa đạt. Đã bật cờ hỗ trợ.'
                : 'Đã ghi nhận xét. Lần nộp cuối mở sau thời gian chờ.',
          );
        },
        onError: (err) => toast.error(pulseErrorMessage(err, 'Chưa ghi được quyết định.')),
      },
    );
  };

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
      <div className="pu-decision">
        <label className="pu-field">
          Quyết định của mentor
          <select value={decision} onChange={(e) => setDecision(e.target.value as PulseDecision | '')} required>
            <option value="">Chọn quyết định</option>
            <option value="PASSED" disabled={choiceFails}>Duyệt khóa học{choiceFails ? ' · trắc nghiệm chưa đạt' : ''}</option>
            <option value="NOT_YET">Chưa đạt · cần sửa</option>
          </select>
        </label>
        <label className="pu-field" htmlFor={fieldId}>
          Lý do gửi nhân viên
          <textarea
            id={fieldId}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            minLength={MIN_REASON}
            maxLength={2000}
            placeholder="Nêu tiêu chí và bước tiếp theo."
            required
          />
          <small className={length > 0 && length < MIN_REASON ? 'error' : undefined}>
            {length > 0 && length < MIN_REASON ? `Cần ít nhất ${MIN_REASON} ký tự (hiện có ${length}).` : `Bắt buộc, tối thiểu ${MIN_REASON} ký tự.`}
          </small>
        </label>
      </div>
      {choiceFails && (
        <div style={{ marginBottom: 12 }}>
          <Notice tone="warning">
            Phần trắc nghiệm đúng {latest!.choice!.score}/{latest!.choice!.total} câu, chưa đủ {latest!.choice!.passMark} câu: bài chỉ có thể chưa đạt.
          </Notice>
        </div>
      )}
      {isLastAttempt && decision === 'NOT_YET' && (
        <div style={{ marginBottom: 12 }}>
          <Notice tone="warning">Đây là lần nộp cuối: chưa đạt sẽ bật cờ hỗ trợ và không mở cấp tiếp theo.</Notice>
        </div>
      )}
      <button type="submit" className={btn()} disabled={!decision || length < MIN_REASON || decide.isPending}>
        {decide.isPending ? 'Đang ghi…' : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span>Ghi quyết định cuối cùng</span>
          <ArrowRight size={14} aria-hidden="true" />
        </span>}
      </button>
    </form>
  );
}

function PreAssessmentDecisionForm({ item }: { item: PulseFinalReviewItem }) {
  const decide = useDecidePulsePreAssessment();
  const [decision, setDecision] = useState<PulseDecision | ''>('');
  const [reason, setReason] = useState('');
  const length = reason.trim().length;
  const fieldId = `pre-reason-${item.submissionId}`;
  const latest = item.attempts[item.attempts.length - 1];
  const choiceFails = Boolean(latest?.choice && !latest.choice.passed);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!decision || length < MIN_REASON) return;
    decide.mutate(
      { preAssessmentId: item.submissionId, decision, reason: reason.trim() },
      {
        onSuccess: (result) => {
          toast.success(
            result.decision === 'PASSED'
              ? `Đã công nhận ${item.courseCode} cho ${item.employeeName}.`
              : `Đã ghi nhận xét. ${item.employeeName} sẽ học ${item.courseCode}.`,
          );
        },
        onError: (err) => toast.error(pulseErrorMessage(err, 'Chưa ghi được quyết định.')),
      },
    );
  };

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
      <div className="pu-decision">
        <label className="pu-field">
          Quyết định của mentor
          <select value={decision} onChange={(e) => setDecision(e.target.value as PulseDecision | '')} required>
            <option value="">Chọn quyết định</option>
            <option value="PASSED" disabled={choiceFails}>Đạt · công nhận khóa, không cần học{choiceFails ? ' · trắc nghiệm chưa đạt' : ''}</option>
            <option value="NOT_YET">Chưa đạt · nhân viên học khóa</option>
          </select>
        </label>
        <label className="pu-field" htmlFor={fieldId}>
          Lý do gửi nhân viên
          <textarea
            id={fieldId}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            minLength={MIN_REASON}
            maxLength={2000}
            placeholder="Nêu tiêu chí đã đạt hoặc phần cần học."
            required
          />
          <small className={length > 0 && length < MIN_REASON ? 'error' : undefined}>
            {length > 0 && length < MIN_REASON ? `Cần ít nhất ${MIN_REASON} ký tự (hiện có ${length}).` : `Bắt buộc, tối thiểu ${MIN_REASON} ký tự.`}
          </small>
        </label>
      </div>
      {choiceFails && (
        <div style={{ marginBottom: 12 }}>
          <Notice tone="warning">
            Phần trắc nghiệm đúng {latest!.choice!.score}/{latest!.choice!.total} câu, chưa đủ {latest!.choice!.passMark} câu: bài chỉ có thể chưa đạt.
          </Notice>
        </div>
      )}
      <button type="submit" className={btn()} disabled={!decision || length < MIN_REASON || decide.isPending}>
        {decide.isPending ? 'Đang ghi…' : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span>Ghi quyết định cuối cùng</span>
          <ArrowRight size={14} aria-hidden="true" />
        </span>}
      </button>
    </form>
  );
}

function SupportForm({ item }: { item: PulseFinalReviewItem }) {
  const record = useRecordPulseSupport();
  const latest = item.attempts[item.attempts.length - 1];
  const [action, setAction] = useState<PulseSupportAction | ''>('');
  const [note, setNote] = useState('');

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!action) return;
    record.mutate(
      { submissionId: item.submissionId, action, note: note.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('Đã ghi hướng hỗ trợ. Nhân viên thấy hướng này ở trang bài cuối khóa.');
          setAction('');
          setNote('');
        },
        onError: (err) => toast.error(pulseErrorMessage(err, 'Chưa ghi được hướng hỗ trợ.')),
      },
    );
  };

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
      {latest?.supportAction && (
        <Notice tone="success">
          {SUPPORT_LABELS[latest.supportAction]}
          {latest.supportNote ? `: ${latest.supportNote}` : '.'}
          {latest.supportRecordedAt ? ` · ${formatDateTime(latest.supportRecordedAt)}` : ''}
        </Notice>
      )}
      <div className="pu-support-options" role="group" aria-label="Hướng hỗ trợ">
        {SUPPORT_OPTIONS.map((option) => (
          <button
            key={option.action}
            type="button"
            className={btn('outline', true)}
            aria-pressed={action === option.action}
            onClick={() => setAction(option.action)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <label className="pu-field">
        Ghi chú cho nhân viên (không bắt buộc)
        <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="Ví dụ: kèm cặp 2 buổi với trưởng nhóm." style={{ minHeight: 80 }} />
      </label>
      <button type="submit" className={btn()} disabled={!action || record.isPending}>
        {record.isPending ? 'Đang ghi…' : latest?.supportAction ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span>Cập nhật hướng hỗ trợ</span><ArrowRight size={14} aria-hidden="true" /></span> : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span>Ghi hướng hỗ trợ</span><ArrowRight size={14} aria-hidden="true" /></span>}
      </button>
    </form>
  );
}
