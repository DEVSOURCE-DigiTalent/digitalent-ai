import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { PULSE_KEYS, usePulseFinal } from '@/hooks/use-pulse';
import { pulseService, type PulseFinal, type PulseFinalAttempt } from '@/services/pulse.service';
import { formatDateTime } from '@/lib/utils';
import { ChoiceScore, CriteriaRubric, FinalStatusPill } from '../components/blocks';
import { LoadError, Mini, Notice, PageSkeleton, Pill, PuLink } from '../components/ui';
import { ExamShell } from '../exam/ExamShell';
import { ProctoredExam } from '../exam/ProctoredExam';
import { BLOCK_MESSAGES, SUPPORT_LABELS, examStructure, levelName, pulseErrorMessage, timeLeft } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

const LABEL = 'Bài cuối khóa';

/**
 * EM-07 · Bài cuối khóa trên trang riêng (§9.3, §10): khi mở, nhân viên làm bài có giám sát (toàn bộ màn hình + camera +
 * micro): phần trắc nghiệm và ghi chú minh chứng; người chấm quyết định kèm lý do, kết quả chỉ hiện sau khi chấm. Lần 1 chưa đạt → chờ rồi nộp lần cuối trong hạn;
 * lần 2 chưa đạt → cờ hỗ trợ. Khi chưa / không làm được bài, trang cho thấy trạng thái và các lần nộp.
 */
export function PulseFinalPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data, isLoading, error, refetch } = usePulseFinal(courseId);
  const qc = useQueryClient();
  // Giữ trang làm bài sau khi nộp (dữ liệu tải lại sẽ không còn "nộp được") để nhân viên thấy màn hình đã nộp.
  const [keepExam, setKeepExam] = useState(false);
  useEffect(() => {
    if (data?.canSubmit) setKeepExam(true);
  }, [data?.canSubmit]);

  const backTo = courseId ? PULSE_PATHS.course(courseId) : PULSE_PATHS.today;
  if (isLoading) {
    return <ExamShell label={LABEL} backTo={backTo}><PageSkeleton blocks={[140, 80, 280]} /></ExamShell>;
  }
  if (error || !data) {
    return (
      <ExamShell label={LABEL} backTo={backTo}>
        <LoadError message={pulseErrorMessage(error, 'Không tải được bài cuối khóa.')} onRetry={() => refetch()} />
      </ExamShell>
    );
  }

  if (data.canSubmit || keepExam) {
    const attemptNo = Math.min(data.attempts.length + 1, data.maxAttempts);
    const code = data.course.code;
    const last = data.attempts[data.attempts.length - 1];
    return (
      <ProctoredExam
        kind="FINAL"
        course={data.course}
        domainName={data.domain.name}
        positionName={data.positionName}
        reviewer={data.reviewer}
        criteria={data.criteria}
        choiceCount={data.choiceCount}
        choicePassMark={data.choicePassMark}
        attemptLabel={`Lần nộp ${attemptNo}/${data.maxAttempts}`}
        outcomes={{
          pass: `${code} đạt, mức ${levelName(data.course.tier)} của lĩnh vực được xác nhận và khóa tiếp theo mở.`,
          fail: attemptNo < data.maxAttempts
            ? 'Bạn đọc nhận xét, sửa bài và nộp lần cuối sau thời gian chờ.'
            : 'Đây là lần nộp cuối: chưa đạt thì quản lý sắp xếp hỗ trợ trước khi lộ trình tiếp tục.',
        }}
        intro={last?.decisionReason ? (
          <Notice tone="warning">
            <strong>Nhận xét lần {last.attemptNo}:</strong> {last.decisionReason} Đây là lần nộp cuối, hạn {formatDateTime(last.retryDueAt)} ({timeLeft(last.retryDueAt)}).
          </Notice>
        ) : undefined}
        onSubmit={async (evidenceText, sessionId, answers) => {
          const result = (await pulseService.submitFinal(data.course.courseId, evidenceText, sessionId, answers)).data.data!;
          await qc.invalidateQueries({ queryKey: PULSE_KEYS.all });
          return { durationMs: result.durationMs };
        }}
      />
    );
  }

  return (
    <ExamShell label={LABEL} title={`${data.course.code} · ${data.course.title}`} backTo={backTo}>
      <FinalView final={data} />
    </ExamShell>
  );
}

function FinalView({ final }: { final: PulseFinal }) {
  const { course, status, attempts } = final;
  const submitted = attempts.length;
  const allPassed = final.moduleCount > 0 && final.modulesPassed === final.moduleCount;
  const position = final.positionName ?? 'của bạn';

  return (
    <div className="pu-stack">
      <div className="pu-page-head">
        <div>
          <span className="pu-eyebrow">{LABEL}</span>
          <h1>Trình bày điều bạn đã học.</h1>
          <p>
            {final.reviewer?.name ?? 'Người chấm'} chấm bài cuối của mỗi khóa cùng bản ghi màn hình, camera và micro. Gợi ý AI chỉ để tham
            khảo — người chấm đưa ra quyết định cuối cùng và ghi lý do.
          </p>
        </div>
        <div className="pu-row"><FinalStatusPill status={status} /><Pill>{submitted}/{final.maxAttempts} lần nộp</Pill></div>
      </div>

      <section className="pu-sequence" aria-label="Trình tự của khóa học">
        <div className={allPassed ? 'done' : 'current'}>
          <b>01</b>
          <span>Học các mô đun<small>Đạt {final.modulesPassed}/{final.moduleCount} bài ôn tập</small></span>
        </div>
        <div className={status === 'APPROVED' || status === 'PENDING' ? 'done' : allPassed ? 'current' : ''}>
          <b>02</b>
          <span>Bài cuối khóa có giám sát<small>{submitted}/{final.maxAttempts} lần nộp</small></span>
        </div>
        <div className={status === 'APPROVED' ? 'done' : status === 'PENDING' ? 'current' : ''}>
          <b>03</b>
          <span>Người chấm quyết định<small>{status === 'APPROVED' ? 'Đã duyệt' : 'Minh chứng và bản ghi được đánh giá kèm lý do'}</small></span>
        </div>
      </section>

      <section className="pu-surface pu-pad">
        <Mini>{course.domainName} · {levelName(course.tier)} · bài cuối khóa</Mini>
        <h2 className="pu-panel-title">{final.choiceCount > 0 ? 'Trắc nghiệm và ghi chú công việc có thể kiểm tra.' : 'Tạo ghi chú công việc có thể kiểm tra.'}</h2>
        <p className="pu-panel-desc">
          {examStructure(final.choiceCount, final.choicePassMark)} Phần tự luận: mô tả một nhiệm vụ thực tế của vị trí {position}, nêu nguồn,
          hành động hoặc phép tính người khác kiểm tra lại được, kết luận và bước tiếp theo. Khi làm bài, bạn chia sẻ toàn bộ màn hình,
          bật camera và micro.
        </p>
        <CriteriaRubric criteria={final.criteria} />
      </section>

      <section className="pu-surface pu-pad">
        <FinalState final={final} />
      </section>

      {attempts.length > 0 && (
        <section className="pu-surface pu-pad" aria-labelledby="pu-attempts-title">
          <Mini>Lịch sử nộp bài</Mini>
          <h2 className="pu-panel-title" id="pu-attempts-title">Bài đã nộp và phản hồi của người chấm.</h2>
          <div className="pu-attempts">
            {[...attempts].reverse().map((attempt) => <AttemptCard key={attempt.submissionId} attempt={attempt} max={final.maxAttempts} />)}
          </div>
        </section>
      )}

      <div className="pu-course-footer">
        <PuLink to={PULSE_PATHS.course(course.courseId)} kind="ghost" small>← Tổng quan khóa học</PuLink>
        <PuLink to={PULSE_PATHS.practice} kind="ghost" small>Tất cả bài đã nộp →</PuLink>
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
          {final.blockReason === 'PRE_ASSESSMENT_REQUIRED'
            ? <PuLink to={PULSE_PATHS.preAssessment(course.courseId)}>Làm bài đánh giá trước khi học →</PuLink>
            : <PuLink to={PULSE_PATHS.course(course.courseId)} kind="outline">Xem khóa học →</PuLink>}
        </div>
      </div>
    );
  }

  switch (status) {
    case 'NOT_STARTED':
    case 'LEARNING':
    case 'READY':
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
    case 'PENDING':
      return (
        <Notice>
          <strong>Bài của bạn đang chờ {final.reviewer?.name ?? 'người chấm'} chấm.</strong> Quyết định và lý do sẽ hiện ở đây. Cấp tiếp theo vẫn
          khóa cho tới khi khóa được duyệt; trong lúc chờ bạn không nộp thêm được.
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
            <strong>Khóa học đã được duyệt.</strong> Kết quả được ghi vào hồ sơ năng lực; khóa tiếp theo của lĩnh vực đã mở trên lộ trình.
          </Notice>
          <div className="pu-row">
            <PuLink to={PULSE_PATHS.outcomes}>Xem kết quả đã xác nhận →</PuLink>
            <PuLink to={PULSE_PATHS.path} kind="outline">Xem lộ trình tiếp theo</PuLink>
          </div>
        </div>
      );
    default:
      return final.closedMessage ? <Notice>{final.closedMessage}</Notice> : null;
  }
}

function AttemptCard({ attempt, max }: { attempt: PulseFinalAttempt; max: number }) {
  return (
    <article className="pu-attempt">
      <header>
        <span>Lần nộp {attempt.attemptNo}/{max} · {formatDateTime(attempt.submittedAt)}</span>
        <Pill tone={attempt.decision === 'PASSED' ? 'green' : attempt.decision === 'NOT_YET' ? 'coral' : 'gray'}>
          {attempt.decision === 'PASSED' ? 'Đã duyệt' : attempt.decision === 'NOT_YET' ? 'Chưa đạt · cần sửa' : 'Chờ người chấm'}
        </Pill>
      </header>
      <ChoiceScore choice={attempt.choice} />
      <blockquote>{attempt.evidenceText}</blockquote>
      {attempt.decisionReason && (
        <div className={`pu-feedback${attempt.decision === 'PASSED' ? ' ok' : ''}`}>
          <strong>Nhận xét của {attempt.reviewerName ?? 'người chấm'}</strong>
          {attempt.reviewedAt ? ` · ${formatDateTime(attempt.reviewedAt)}` : ''}: {attempt.decisionReason}
        </div>
      )}
    </article>
  );
}
