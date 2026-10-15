import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { usePulseFinal, useSubmitPulseFinal } from '@/hooks/use-pulse';
import type { PulseFinal, PulseFinalAttempt } from '@/services/pulse.service';
import { formatDateTime } from '@/lib/utils';
import { CriteriaRubric, FinalStatusPill } from '../components/blocks';
import { LoadError, Mini, Notice, PageHead, PageSkeleton, Pill, PuLink } from '../components/ui';
import { btn } from '../lib/button';
import { BLOCK_MESSAGES, SUPPORT_LABELS, levelName, pulseErrorMessage, timeLeft } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

const MIN_EVIDENCE = 30;
const MAX_EVIDENCE = 8000;

/**
 * Bài cuối của đúng khóa (§9.3, §10): ba tiêu chí, ghi chú minh chứng, quản lý chấm kèm lý do;
 * lần 1 chưa đạt → chờ rồi nộp lần cuối trong hạn; lần 2 chưa đạt → cờ hỗ trợ.
 */
export function PulseFinalPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data, isLoading, error, refetch } = usePulseFinal(courseId);
  if (isLoading) return <PageSkeleton blocks={[140, 80, 280, 220]} />;
  if (error || !data) return <LoadError message={pulseErrorMessage(error, 'Không tải được bài cuối khóa.')} onRetry={() => refetch()} />;
  return <FinalView final={data} />;
}

function FinalView({ final }: { final: PulseFinal }) {
  const { course, status, attempts } = final;
  const submitted = attempts.length;
  const allPassed = final.moduleCount > 0 && final.modulesPassed === final.moduleCount;
  const position = final.positionName ?? 'của bạn';

  return (
    <div className="pu-stack">
      <PageHead
        eyebrow="Bài cuối khóa"
        title="Trình bày điều bạn đã học."
        description="Quản lý phòng ban chấm bài cuối của mỗi khóa. Gợi ý AI chỉ để tham khảo — quản lý đưa ra quyết định cuối cùng và ghi lý do."
        actions={<><FinalStatusPill status={status} /><Pill>{submitted}/{final.maxAttempts} lần nộp</Pill></>}
      />

      <section className="pu-sequence" aria-label="Trình tự của khóa học">
        <div className={allPassed ? 'done' : 'current'}>
          <b>01</b>
          <span>Học các mô đun<small>Đạt {final.modulesPassed}/{final.moduleCount} bài ôn tập</small></span>
        </div>
        <div className={status === 'APPROVED' || status === 'PENDING' ? 'done' : allPassed ? 'current' : ''}>
          <b>02</b>
          <span>Bài cuối khóa<small>{submitted}/{final.maxAttempts} lần nộp</small></span>
        </div>
        <div className={status === 'APPROVED' ? 'done' : status === 'PENDING' ? 'current' : ''}>
          <b>03</b>
          <span>Quản lý quyết định<small>{status === 'APPROVED' ? 'Đã duyệt' : 'Minh chứng được đánh giá kèm lý do'}</small></span>
        </div>
      </section>

      <section className="pu-surface pu-pad">
        <Mini>{course.domainName} · {levelName(course.tier)} · bài cuối khóa</Mini>
        <h2 className="pu-panel-title">Tạo ghi chú công việc có thể kiểm tra.</h2>
        <p className="pu-panel-desc">
          Mô tả một nhiệm vụ thực tế của vị trí {position}: nêu nguồn, hành động hoặc phép tính người khác kiểm tra lại được,
          kết luận và bước tiếp theo.
        </p>
        <CriteriaRubric criteria={final.criteria} />
      </section>

      <section className="pu-surface pu-pad">
        <FinalState final={final} />
      </section>

      {attempts.length > 0 && (
        <section className="pu-surface pu-pad" aria-labelledby="pu-attempts-title">
          <Mini>Lịch sử nộp bài</Mini>
          <h2 className="pu-panel-title" id="pu-attempts-title">Bài đã nộp và phản hồi của quản lý.</h2>
          <div className="pu-attempts">
            {[...attempts].reverse().map((attempt) => <AttemptCard key={attempt.submissionId} attempt={attempt} max={final.maxAttempts} />)}
          </div>
        </section>
      )}

      <div className="pu-course-footer">
        <PuLink to={PULSE_PATHS.course(course.courseId)} kind="ghost" small>← Tổng quan khóa học</PuLink>
        <PuLink to={PULSE_PATHS.practice} kind="ghost" small>Tất cả bài thực hành →</PuLink>
      </div>
    </div>
  );
}

function FinalState({ final }: { final: PulseFinal }) {
  const { course, status, attempts } = final;
  const first = attempts.find((a) => a.attemptNo === 1);
  const last = attempts[attempts.length - 1];

  if (final.blockReason && status !== 'APPROVED') {
    return (
      <div className="pu-stack" style={{ gap: 12 }}>
        <Notice tone="warning">{BLOCK_MESSAGES[final.blockReason]}</Notice>
        <div className="pu-row">
          {final.blockReason === 'NOT_ASSESSED'
            ? <PuLink to={PULSE_PATHS.baseline}>Làm bài đầu vào →</PuLink>
            : <PuLink to={PULSE_PATHS.course(course.courseId)} kind="outline">Xem khóa học →</PuLink>}
        </div>
      </div>
    );
  }

  switch (status) {
    case 'NOT_STARTED':
    case 'LEARNING':
      return (
        <div className="pu-stack" style={{ gap: 14 }}>
          <Notice tone="warning">Hoàn thành câu hỏi ôn tập của tất cả mô đun trước. Hiện đạt {final.modulesPassed}/{final.moduleCount}.</Notice>
          <div>
            <PuLink to={final.firstOpenModuleId ? PULSE_PATHS.module(course.courseId, final.firstOpenModuleId) : PULSE_PATHS.course(course.courseId)}>
              {status === 'NOT_STARTED' ? 'Bắt đầu mô đun →' : 'Tiếp tục bài học →'}
            </PuLink>
          </div>
        </div>
      );
    case 'READY':
    case 'RETRY_READY':
      return <SubmitForm final={final} />;
    case 'PENDING':
      return (
        <Notice>
          <strong>Bài của bạn đang chờ quản lý phòng ban chấm.</strong> Quyết định và lý do sẽ hiện ở đây. Cấp tiếp theo vẫn khóa cho tới khi
          khóa được duyệt; trong lúc chờ bạn không nộp thêm được.
        </Notice>
      );
    case 'RETRY_WAIT':
      return (
        <div>
          <Notice tone="warning">
            <strong>Lần nộp đầu chưa đạt.</strong> Hãy đọc nhận xét bên dưới và chuẩn bị bản sửa. Lần nộp thứ hai — cũng là lần cuối — mở sau thời gian chờ.
          </Notice>
          <div className="pu-countdown">
            <div><small>Mở lần nộp cuối</small><strong>{formatDateTime(first?.retryOpensAt)}</strong><small>{timeLeft(first?.retryOpensAt)}</small></div>
            <div><small>Hạn nộp lần cuối</small><strong>{formatDateTime(first?.retryDueAt)}</strong><small>{timeLeft(first?.retryDueAt)}</small></div>
          </div>
        </div>
      );
    case 'DEADLINE_MISSED':
      return (
        <div className="pu-stack" style={{ gap: 10 }}>
          <Notice tone="warning">
            <strong>Đã quá hạn nộp lần cuối</strong> ({formatDateTime(first?.retryDueAt)}). Quản lý phòng ban sẽ sắp xếp hỗ trợ trước khi lộ trình tiếp tục.
          </Notice>
          {last?.supportAction && <Notice>{SUPPORT_LABELS[last.supportAction]}{last.supportNote ? `: ${last.supportNote}` : '.'}</Notice>}
        </div>
      );
    case 'FLAGGED':
      return (
        <div className="pu-stack" style={{ gap: 10 }}>
          <Notice tone="warning">
            <strong>Hai lần nộp chưa đạt tiêu chí.</strong> Quản lý thấy cờ cần hỗ trợ và sẽ chọn kèm cặp, chu kỳ học mới hoặc tạm dừng lộ trình.
            Cấp tiếp theo chưa mở và mức năng lực không thay đổi.
          </Notice>
          {last?.supportAction && <Notice>{SUPPORT_LABELS[last.supportAction]}{last.supportNote ? `: ${last.supportNote}` : '.'}</Notice>}
        </div>
      );
    case 'APPROVED':
      return (
        <div className="pu-stack" style={{ gap: 14 }}>
          <Notice tone="success">
            <strong>Quản lý đã duyệt khóa học.</strong> Kết quả được ghi vào hồ sơ năng lực; cấp kế tiếp có thể mở khi có suất học phù hợp.
          </Notice>
          <div className="pu-row">
            <PuLink to={PULSE_PATHS.outcomes}>Xem kết quả đã xác nhận →</PuLink>
            <PuLink to={PULSE_PATHS.path} kind="outline">Xem lộ trình tiếp theo</PuLink>
          </div>
        </div>
      );
    default:
      return null;
  }
}

function SubmitForm({ final }: { final: PulseFinal }) {
  const submit = useSubmitPulseFinal();
  const [text, setText] = useState('');
  const isRetry = final.status === 'RETRY_READY';
  const first = final.attempts.find((a) => a.attemptNo === 1);
  const length = text.trim().length;
  const tooShort = length > 0 && length < MIN_EVIDENCE;

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (length < MIN_EVIDENCE || length > MAX_EVIDENCE) return;
    submit.mutate(
      { courseId: final.course.courseId, evidenceText: text.trim() },
      {
        onSuccess: () => toast.success('Đã gửi bài cuối khóa cho quản lý phòng ban.'),
        onError: (err) => toast.error(pulseErrorMessage(err, 'Chưa gửi được bài cuối khóa.')),
      },
    );
  };

  return (
    <form onSubmit={onSubmit}>
      <Mini>{isRetry ? `Lần nộp cuối (${final.maxAttempts}/${final.maxAttempts})` : `Lần nộp 1/${final.maxAttempts}`}</Mini>
      <h2 className="pu-panel-title">Làm cho minh chứng của bạn dễ kiểm tra.</h2>
      {isRetry && (
        <Notice tone="warning">
          Đây là lần nộp cuối. Hạn nộp {formatDateTime(first?.retryDueAt)} ({timeLeft(first?.retryDueAt)}). Hãy sửa theo nhận xét của quản lý.
        </Notice>
      )}
      <label className="pu-field">
        Ghi chú minh chứng
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={MAX_EVIDENCE}
          placeholder="Nêu nguồn, trình bày hành động hoặc phép tính của bạn, rồi giải thích kết luận và bước tiếp theo."
          aria-invalid={tooShort}
          aria-describedby="pu-evidence-hint"
          required
        />
        <small id="pu-evidence-hint" className={tooShort ? 'error' : undefined}>
          {tooShort ? `Cần ít nhất ${MIN_EVIDENCE} ký tự (hiện có ${length}).` : `Ít nhất ${MIN_EVIDENCE} ký tự · ${length}/${MAX_EVIDENCE}. Bài cuối khóa nhận ghi chú văn bản.`}
        </small>
      </label>
      <button type="submit" className={btn()} disabled={length < MIN_EVIDENCE || submit.isPending}>
        {submit.isPending ? 'Đang gửi…' : isRetry ? 'Nộp lần cuối →' : 'Nộp bài cuối khóa →'}
      </button>
    </form>
  );
}

function AttemptCard({ attempt, max }: { attempt: PulseFinalAttempt; max: number }) {
  return (
    <article className="pu-attempt">
      <header>
        <span>Lần nộp {attempt.attemptNo}/{max} · {formatDateTime(attempt.submittedAt)}</span>
        <Pill tone={attempt.decision === 'PASSED' ? 'green' : attempt.decision === 'NOT_YET' ? 'coral' : 'gray'}>
          {attempt.decision === 'PASSED' ? 'Đã duyệt' : attempt.decision === 'NOT_YET' ? 'Chưa đạt · cần sửa' : 'Chờ quản lý'}
        </Pill>
      </header>
      <blockquote>{attempt.evidenceText}</blockquote>
      {attempt.decisionReason && (
        <div className={`pu-feedback${attempt.decision === 'PASSED' ? ' ok' : ''}`}>
          <strong>Nhận xét của {attempt.reviewerName ?? 'quản lý'}</strong>
          {attempt.reviewedAt ? ` · ${formatDateTime(attempt.reviewedAt)}` : ''}: {attempt.decisionReason}
        </div>
      )}
    </article>
  );
}
