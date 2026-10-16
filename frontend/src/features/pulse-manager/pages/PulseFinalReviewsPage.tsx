import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useDecidePulseFinal, usePulseFinalReviews, useRecordPulseSupport } from '@/hooks/use-pulse';
import type {
  PulseCriterion,
  PulseDecision,
  PulseFinalAttempt,
  PulseFinalReviewItem,
  PulseReviewStatus,
  PulseSupportAction,
} from '@/services/pulse.service';
import { formatDateTime } from '@/lib/utils';
import { Empty, LoadError, Mini, Notice, PageHead, PageSkeleton, Pill, PuLink } from '@/features/pulse-employee/components/ui';
import { RichText } from '@/features/pulse-employee/components/RichText';
import { btn } from '@/features/pulse-employee/lib/button';
import { SUPPORT_LABELS, levelName, pulseErrorMessage, timeLeft } from '@/features/pulse-employee/lib/labels';
import { ManagerPage } from '../components/ManagerUi';
import { MANAGER_PATHS } from '../lib/paths';

const MIN_REASON = 10;

type Filter = 'ALL' | 'PENDING' | 'RETRY' | 'DEADLINE_MISSED' | 'FLAGGED';

const FILTERS: { key: Filter; label: string; match: (status: PulseReviewStatus) => boolean }[] = [
  { key: 'ALL', label: 'Tất cả', match: () => true },
  { key: 'PENDING', label: 'Chờ quyết định', match: (s) => s === 'PENDING' },
  { key: 'RETRY', label: 'Chờ nộp lại', match: (s) => s === 'RETRY_WAIT' || s === 'RETRY_READY' },
  { key: 'DEADLINE_MISSED', label: 'Quá hạn nộp lại', match: (s) => s === 'DEADLINE_MISSED' },
  { key: 'FLAGGED', label: 'Cần hỗ trợ', match: (s) => s === 'FLAGGED' },
];

const STATUS_PILL: Record<PulseReviewStatus, { label: string; tone: 'gray' | 'coral' | 'green' }> = {
  PENDING: { label: 'Cần quyết định', tone: 'gray' },
  RETRY_WAIT: { label: 'Chờ nộp lại', tone: 'green' },
  RETRY_READY: { label: 'Đang mở lần nộp cuối', tone: 'green' },
  DEADLINE_MISSED: { label: 'Quá hạn nộp lại', tone: 'coral' },
  FLAGGED: { label: 'Cờ hỗ trợ', tone: 'coral' },
};

const STATUS_HINT: Record<PulseReviewStatus, string> = {
  PENDING: 'Đọc ghi chú của nhân viên theo cả ba tiêu chí của khóa, rồi ghi quyết định kèm lý do.',
  RETRY_WAIT: 'Nhân viên đang đọc nhận xét; lần nộp cuối chưa mở.',
  RETRY_READY: 'Lần nộp cuối đang mở, nhân viên cần nộp trước hạn.',
  DEADLINE_MISSED: 'Đã quá hạn nộp lần cuối. Chọn cách hỗ trợ trước khi lộ trình tiếp tục.',
  FLAGGED: 'Hai lần nộp chưa đạt. Chọn kèm cặp, một chu kỳ học mới hoặc tạm dừng lộ trình.',
};

const SUPPORT_OPTIONS: { action: PulseSupportAction; label: string }[] = [
  { action: 'COACHING', label: 'Sắp xếp kèm cặp' },
  { action: 'FRESH_CYCLE', label: 'Đề xuất chu kỳ học mới' },
  { action: 'PAUSE', label: 'Tạm dừng lộ trình' },
];

/**
 * MG-13 · Chấm bài cuối khóa (mock `#/review`, docs/ui-redesign/16 §10): hàng chờ của phòng ban quản lý. Gợi ý AI chỉ để
 * tham khảo; quản lý ghi quyết định cuối cùng kèm lý do. Lần 1 chưa đạt mở cửa sổ nộp lại, lần 2 chưa đạt bật cờ hỗ trợ.
 */
export function PulseFinalReviewsPage() {
  const { data, isLoading, error, refetch } = usePulseFinalReviews();
  const [filter, setFilter] = useState<Filter>('ALL');

  if (isLoading) {
    return (
      <ManagerPage>
        <PageSkeleton blocks={[140, 110, 420]} />
      </ManagerPage>
    );
  }
  if (error || !data) {
    return (
      <ManagerPage>
        <LoadError message={pulseErrorMessage(error, 'Không tải được hàng chờ bài cuối khóa.')} onRetry={() => refetch()} />
      </ManagerPage>
    );
  }

  const department = data.items.find((item) => item.departmentName)?.departmentName;
  const active = FILTERS.find((f) => f.key === filter)!;
  const visible = data.items.filter((item) => active.match(item.status));

  return (
    <ManagerPage testId="pulse-final-reviews">
      <PageHead
        eyebrow={`Quản lý đánh giá${department ? ` · ${department}` : ''}`}
        title="Ra quyết định dựa trên minh chứng."
        description="Mỗi người học có một bài cuối cho mỗi khóa. Gợi ý AI chỉ để tham khảo — quản lý ghi quyết định cuối cùng và lý do."
        actions={<Pill>{data.pendingCount} bài chờ đánh giá</Pill>}
      />

      <section className="pm-banner" aria-label="Nguyên tắc chấm bài cuối khóa">
        <div>
          <span className="pu-mini">{department ? `${department} / ` : ''}Đánh giá khóa học</span>
          <h2>Một người học. Một khóa. Một quyết định rõ ràng.</h2>
          <p>AI gợi ý điểm cần xem; quản lý đọc minh chứng và ghi đạt hoặc chưa đạt kèm lý do.</p>
        </div>
        <div className="pm-banner-count">
          <strong>{data.pendingCount}</strong>
          <span>chờ bạn quyết định</span>
        </div>
      </section>

      <section className="pu-metrics pu-review-kpis" aria-label="Tình trạng hàng chờ" style={{ marginTop: 16 }}>
        <div><strong>{data.pendingCount}</strong><span>Chờ quyết định</span></div>
        <div><strong>{data.retryCount}</strong><span>Chờ nộp lại</span></div>
        <div className="warn"><strong>{data.deadlineMissedCount}</strong><span>Quá hạn nộp lại</span></div>
        <div className="warn"><strong>{data.flaggedCount}</strong><span>Cần hỗ trợ</span></div>
      </section>

      {data.items.length === 0 ? (
        <div style={{ marginTop: 22 }}>
          <Empty
            icon={<ClipboardCheck size={24} />}
            title="Chưa có bài nào cần quyết định."
            action={<PuLink to={MANAGER_PATHS.overview} kind="outline">Quay lại đội ngũ</PuLink>}
          >
            Khi nhân viên trong phòng ban nộp bài cuối khóa, bài sẽ xuất hiện ở đây cho quản lý phòng ban chấm.
          </Empty>
        </div>
      ) : (
        <>
          <div className="pu-tabs" role="group" aria-label="Lọc theo trạng thái">
            {FILTERS.map((f) => (
              <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
                {f.label}<span>{data.items.filter((item) => f.match(item.status)).length}</span>
              </button>
            ))}
          </div>
          <div className="pu-stack">
            {visible.length === 0 && <Notice>Không có bài nào ở trạng thái này.</Notice>}
            {visible.map((item) => (
              <ReviewCard key={item.submissionId} item={item} criteria={data.criteria} />
            ))}
          </div>
        </>
      )}

      <section className="pu-surface pu-pad" style={{ marginTop: 18 }}>
        <Mini>Luồng minh chứng riêng</Mini>
        <h2 className="pu-panel-title">Nhiệm vụ thực tế không phải bài cuối khóa.</h2>
        <p className="pu-panel-desc">
          Minh chứng công việc được duyệt trong lúc học, ở hàng chờ nhiệm vụ thực tế. Quy tắc hai lần nộp chỉ áp dụng cho bài cuối
          sau mỗi khóa.
        </p>
        <PuLink to={MANAGER_PATHS.evidence} kind="outline" small>Mở minh chứng thực tế →</PuLink>
      </section>
    </ManagerPage>
  );
}

function ReviewCard({ item, criteria }: { item: PulseFinalReviewItem; criteria: PulseCriterion[] }) {
  const latest = item.attempts[item.attempts.length - 1];
  const earlier = item.attempts.slice(0, -1);
  const pill = STATUS_PILL[item.status];
  const firstMiss = item.attempts.find((a) => a.retryOpensAt || a.retryDueAt);

  return (
    <article className="pu-surface pu-pad pu-review-card" aria-label={`${item.employeeName} · ${item.courseTitle}`}>
      <header>
        <div>
          <Mini>{item.employeeName} / {item.positionName ?? 'Chưa gán vị trí'} / {item.courseTitle}</Mini>
          <h2>Lần nộp {item.attemptNo}/{item.maxAttempts}</h2>
          <p className="pu-review-meta">
            {[item.domainName, item.tier ? levelName(item.tier) : null, latest ? `nộp ${formatDateTime(latest.submittedAt)}` : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <Pill tone={pill.tone}>{pill.label}</Pill>
      </header>
      <p className="pu-panel-desc" style={{ marginTop: 10 }}>{STATUS_HINT[item.status]}</p>

      {item.assignment && (
        <section className="pu-review-assignment" aria-label="Đề và thang chấm của khóa học">
          <Mini>Đề cuối khóa theo vị trí · {item.positionName ?? 'Chung'}</Mini>
          <h3>{item.assignment.title}</h3>
          <RichText body={item.assignment.description} />
          <strong>Sản phẩm cần nộp</strong>
          <RichText body={item.assignment.expectedOutput} />
          <strong>Thang chấm · đạt từ {item.assignment.passScore}/100 điểm</strong>
          <ul>{item.assignment.rubric.map((criterion) => <li key={criterion.title}>{criterion.title}: {criterion.points} điểm</li>)}</ul>
        </section>
      )}

      {latest && (
        <div className="pu-review-evidence">
          <Mini>Minh chứng đã nộp</Mini>
          <p>{latest.evidenceText}</p>
        </div>
      )}

      {item.status === 'PENDING' && (
        <div className="pu-grid-2 pu-review-grid">
          <div className="pu-rubric" aria-label="Ba tiêu chí của bài cuối khóa">
            {criteria.map((criterion, index) => {
              const met = item.aiHint?.checks[index] ?? false;
              return (
                <div key={criterion.number}>
                  <b>{criterion.number}</b>
                  <span>{criterion.title}<small>{criterion.description}</small></span>
                  <span className={`pu-check${met ? ' on' : ''}`} aria-label={met ? 'Gợi ý: có' : 'Gợi ý: chưa thấy'}>{met ? '✓' : '·'}</span>
                </div>
              );
            })}
          </div>
          <div className="pu-ai">
            <h3>✦ Gợi ý chấm của AI · minh họa</h3>
            <p>{item.aiHint?.summary ?? 'Chưa có gợi ý cho bài này.'}</p>
            <small>Đây là kiểm tra văn bản minh họa, không đọc được tệp thật và không thay quyết định của quản lý.</small>
          </div>
        </div>
      )}

      {earlier.length > 0 && (
        <div className="pu-review-history">
          <Mini>Lần nộp trước</Mini>
          {earlier.map((attempt) => <AttemptHistory key={attempt.submissionId} attempt={attempt} max={item.maxAttempts} />)}
        </div>
      )}

      {item.status === 'PENDING' && <DecisionForm item={item} />}
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
      {(item.status === 'FLAGGED' || item.status === 'DEADLINE_MISSED') && <SupportForm item={item} />}
    </article>
  );
}

function AttemptHistory({ attempt, max }: { attempt: PulseFinalAttempt; max: number }) {
  return (
    <div className="pu-attempt">
      <header>
        <span>Lần nộp {attempt.attemptNo}/{max} · {formatDateTime(attempt.submittedAt)}</span>
        <Pill tone={attempt.decision === 'PASSED' ? 'green' : 'coral'}>{attempt.decision === 'PASSED' ? 'Đã duyệt' : 'Chưa đạt'}</Pill>
      </header>
      <blockquote>{attempt.evidenceText}</blockquote>
      {attempt.decisionReason && (
        <div className="pu-feedback">
          <strong>Nhận xét của {attempt.reviewerName ?? 'quản lý'}</strong>: {attempt.decisionReason}
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
                ? 'Lần nộp cuối chưa đạt — đã bật cờ hỗ trợ.'
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
          Quyết định của quản lý
          <select value={decision} onChange={(e) => setDecision(e.target.value as PulseDecision | '')} required>
            <option value="">Chọn quyết định</option>
            <option value="PASSED">Duyệt khóa học</option>
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
      {isLastAttempt && decision === 'NOT_YET' && (
        <div style={{ marginBottom: 12 }}>
          <Notice tone="warning">Đây là lần nộp cuối: chưa đạt sẽ bật cờ hỗ trợ và không mở cấp tiếp theo.</Notice>
        </div>
      )}
      <button type="submit" className={btn()} disabled={!decision || length < MIN_REASON || decide.isPending}>
        {decide.isPending ? 'Đang ghi…' : 'Ghi quyết định cuối cùng →'}
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
        {record.isPending ? 'Đang ghi…' : latest?.supportAction ? 'Cập nhật hướng hỗ trợ →' : 'Ghi hướng hỗ trợ →'}
      </button>
    </form>
  );
}
