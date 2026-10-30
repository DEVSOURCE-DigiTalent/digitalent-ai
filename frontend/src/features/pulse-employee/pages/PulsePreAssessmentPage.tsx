import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { PULSE_KEYS, usePulsePreAssessment } from '@/hooks/use-pulse';
import { pulseService, type PulsePreAssessment } from '@/services/pulse.service';
import { formatDateTime } from '@/lib/utils';
import { ChoiceScore, CriteriaRubric } from '../components/blocks';
import { LoadError, Mini, Notice, PageSkeleton, Pill, PuLink } from '../components/ui';
import { ExamShell } from '../exam/ExamShell';
import { ProctoredExam } from '../exam/ProctoredExam';
import { PRE_LABELS, examStructure, levelName, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

const LABEL = 'Đánh giá trước khi học';

/**
 * EM-12 · Bài đánh giá trước khi học của một khóa: đề như bài cuối khóa (trắc nghiệm + tự luận), một lần làm, có giám sát
 * (toàn bộ màn hình + camera + micro), người chấm quyết định; kết quả chỉ hiện sau khi chấm. Đạt: khóa được công nhận, không
 * cần học. Chưa đạt: học khóa rồi làm bài cuối khóa.
 */
export function PulsePreAssessmentPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data, isLoading, error, refetch } = usePulsePreAssessment(courseId);
  const qc = useQueryClient();
  // Giữ trang làm bài sau khi nộp (dữ liệu tải lại sẽ không còn "làm được" nữa) để nhân viên thấy màn hình đã nộp.
  const [keepExam, setKeepExam] = useState(false);
  useEffect(() => {
    if (data?.canStart) setKeepExam(true);
  }, [data?.canStart]);

  const backTo = courseId ? PULSE_PATHS.course(courseId) : PULSE_PATHS.today;
  if (isLoading) {
    return <ExamShell label={LABEL} backTo={backTo}><PageSkeleton blocks={[160, 320]} /></ExamShell>;
  }
  if (error || !data) {
    return (
      <ExamShell label={LABEL} backTo={backTo}>
        <LoadError message={pulseErrorMessage(error, 'Không tải được bài đánh giá.')} onRetry={() => refetch()} />
      </ExamShell>
    );
  }

  if (data.canStart || keepExam) {
    const code = data.course.code;
    return (
      <ProctoredExam
        kind="PRE_ASSESSMENT"
        course={data.course}
        domainName={data.domain.name}
        positionName={data.positionName}
        reviewer={data.reviewer}
        criteria={data.criteria}
        choiceCount={data.choiceCount}
        choicePassMark={data.choicePassMark}
        attemptLabel="Một lần làm"
        outcomes={{
          pass: `${code} được công nhận, bạn không cần học khóa này và khóa tiếp theo của lĩnh vực mở.`,
          fail: `Bạn học ${code} rồi làm bài cuối khóa của khóa này.`,
        }}
        onSubmit={async (evidenceText, sessionId, answers) => {
          const result = (await pulseService.submitPreAssessment(data.course.courseId, evidenceText, sessionId, answers)).data.data!;
          await qc.invalidateQueries({ queryKey: PULSE_KEYS.all });
          return { durationMs: result.durationMs };
        }}
      />
    );
  }

  return (
    <ExamShell label={LABEL} title={`${data.course.code} · ${data.course.title}`} backTo={backTo}>
      <PreAssessmentStatus data={data} />
    </ExamShell>
  );
}

function PreAssessmentStatus({ data }: { data: PulsePreAssessment }) {
  const { course, submission, status } = data;
  const reviewer = submission?.reviewerName ?? data.reviewer?.name ?? 'người chấm';
  const tone = status === 'PASSED' ? 'green' : status === 'NOT_YET' ? 'coral' : status === 'PENDING' ? '' : 'gray';
  return (
    <div className="pu-stack">
      <section className="pu-surface pu-pad">
        <div className="pu-row" style={{ justifyContent: 'space-between' }}>
          <Mini>{LABEL} · {data.domain.name} · {levelName(course.tier)}</Mini>
          <Pill tone={tone}>{PRE_LABELS[status]}</Pill>
        </div>
        <h1 className="pu-panel-title">
          {status === 'PENDING' ? `Bài của bạn đang chờ ${reviewer} chấm.`
            : status === 'PASSED' ? `Đạt — ${course.code} được công nhận.`
            : status === 'NOT_YET' ? 'Chưa đạt — hãy học khóa này.'
            : 'Bài đánh giá chưa mở.'}
        </h1>
        <p className="pu-panel-desc">
          {status === 'PENDING' ? 'Người chấm xem bài làm cùng bản ghi màn hình, camera và micro. Kết quả hai phần và nhận xét sẽ hiện ở đây khi chấm xong.'
            : status === 'PASSED' ? 'Bạn không cần học khóa này. Khóa tiếp theo của lĩnh vực đã mở trên lộ trình.'
            : status === 'NOT_YET' ? 'Học các mô-đun của khóa, rồi làm bài cuối khóa (cũng có giám sát, tối đa 2 lần nộp).'
            : data.closedMessage}
        </p>
        <div className="pu-row">
          {status === 'NOT_YET' && <PuLink to={PULSE_PATHS.course(course.courseId)}>Bắt đầu học →</PuLink>}
          <PuLink to={PULSE_PATHS.today} kind={status === 'NOT_YET' ? 'outline' : 'primary'}>Về trang Tổng quan</PuLink>
          <PuLink to={PULSE_PATHS.path} kind="outline">Xem lộ trình</PuLink>
        </div>
      </section>

      {submission && (
        <section className="pu-surface pu-pad" aria-labelledby="pu-pre-sub-title">
          <Mini>Bài đã nộp · {formatDateTime(submission.submittedAt)}</Mini>
          <h2 className="pu-panel-title" id="pu-pre-sub-title">Bài làm của bạn</h2>
          <div className="pu-attempt">
            <ChoiceScore choice={submission.choice} />
            <blockquote>{submission.evidenceText}</blockquote>
            {submission.decisionReason && (
              <div className={`pu-feedback${submission.decision === 'PASSED' ? ' ok' : ''}`}>
                <strong>Nhận xét của {submission.reviewerName ?? 'người chấm'}</strong>: {submission.decisionReason}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="pu-surface pu-pad">
        <Mini>Đề bài và tiêu chí chấm</Mini>
        <p className="pu-panel-desc">{examStructure(data.choiceCount, data.choicePassMark)}</p>
        <CriteriaRubric criteria={data.criteria} />
      </section>
      {status === 'LOCKED' && <Notice>Mỗi khóa có một bài đánh giá trước khi học; bài mở khi khóa nằm trong lộ trình và khóa cấp trước đã đạt.</Notice>}
    </div>
  );
}
