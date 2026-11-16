import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePulseSkipTest, useStartPulseSkipTest, useSubmitPulseSkipTest } from '@/hooks/use-pulse';
import type { PulseSkipTest, PulseSkipTestResult } from '@/services/pulse.service';
import { LoadError } from '../components/ui';
import { ExamShell } from '../exam/ExamShell';
import { pulseErrorCode, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';
import { SkipTestIntro } from '../skip-test/SkipTestIntro';
import { SkipTestResult } from '../skip-test/SkipTestResult';
import { SkipTestRunner } from '../skip-test/SkipTestRunner';
import { clearDraft } from '../skip-test/skip-test-draft';
import '../pulse-skip-test.css';

const LABEL = 'Kiểm tra đầu vào';

/**
 * EM-15 · Bài kiểm tra đầu vào của một khóa (bắt buộc trước khi học, thay bài đánh giá đầu vào có tự luận): câu trắc nghiệm
 * rút từ ngân hàng ôn tập các mô-đun, tự chấm, không giám sát, không người chấm, một lần, làm trong thời gian giới hạn. Đúng từ
 * ngưỡng đạt (80%) thì mọi mô-đun được tính là đã qua và bài đánh giá cuối khóa mở; chưa đạt thì học tuần tự.
 * Ba màn: giới thiệu (SkipTestIntro) → làm bài (SkipTestRunner, nháp trong sessionStorage, hết giờ tự nộp) → kết quả
 * (SkipTestResult; mở lại trang khi bài đã xong cũng vào thẳng kết quả).
 */
export function PulseSkipTestPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data, isLoading, error, refetch } = usePulseSkipTest(courseId);
  const start = useStartPulseSkipTest();
  const submit = useSubmitPulseSkipTest();
  const [lastResult, setLastResult] = useState<{ result: PulseSkipTestResult; finalUnlocked: boolean } | null>(null);

  const backTo = courseId ? PULSE_PATHS.course(courseId) : PULSE_PATHS.today;
  const title = data ? `${data.course.code} · ${data.course.title}` : undefined;

  if (isLoading) {
    return <ExamShell label={LABEL} backTo={backTo}><SkipTestSkeleton /></ExamShell>;
  }
  if (error || !data || !courseId) {
    return (
      <ExamShell label={LABEL} backTo={backTo}>
        <LoadError message={pulseErrorMessage(error, 'Không tải được bài kiểm tra đầu vào.')} onRetry={() => refetch()} />
      </ExamShell>
    );
  }

  if (data.status === 'IN_PROGRESS' && data.attempt && !lastResult) {
    const attempt = data.attempt;
    return (
      <ExamShell label={LABEL} title={title} backTo={backTo} size="wide">
        <SkipTestRunner
          key={attempt.attemptNo}
          courseId={courseId}
          test={data}
          attempt={attempt}
          submitting={submit.isPending}
          submitError={submit.error ? pulseErrorMessage(submit.error, 'Không nộp được bài. Hãy thử lại.') : null}
          onSubmit={(answers) =>
            submit.mutate(
              { courseId, attemptNo: attempt.attemptNo, answers },
              {
                onSuccess: (res) => {
                  clearDraft(courseId, attempt.attemptNo);
                  setLastResult({ result: res.result, finalUnlocked: res.finalUnlocked });
                },
                onError: (err) => {
                  // Đề đã đổi (làm ở tab khác) hoặc đã nộp: tải lại trạng thái.
                  const code = pulseErrorCode(err);
                  if (code === 'SKIP_TEST_CHANGED' || code === 'SKIP_TEST_NOT_STARTED') void refetch();
                },
              },
            )
          }
        />
      </ExamShell>
    );
  }

  const result = lastResult?.result ?? settledResult(data);
  return (
    <ExamShell label={LABEL} title={title} backTo={backTo}>
      {result ? (
        <SkipTestResult
          key={result.attemptNo}
          courseId={courseId}
          test={data}
          result={result}
          fresh={Boolean(lastResult)}
          finalUnlocked={lastResult ? lastResult.finalUnlocked : data.course.canStartFinal}
          onRetry={() => start.mutate(courseId, { onSuccess: () => setLastResult(null) })}
          retrying={start.isPending}
          retryError={start.error ? pulseErrorMessage(start.error, 'Không bắt đầu được lần làm mới.') : null}
        />
      ) : (
        <SkipTestIntro
          courseId={courseId}
          test={data}
          starting={start.isPending}
          startError={start.error ? pulseErrorMessage(start.error, 'Không bắt đầu được bài kiểm tra.') : null}
          onStart={() => start.mutate(courseId)}
        />
      )}
    </ExamShell>
  );
}

/** Bài đã xong (đạt hoặc hết lượt): mở lại trang thì xem kết quả — lần đạt, nếu không có thì lần mới nhất. */
function settledResult(test: PulseSkipTest): PulseSkipTestResult | null {
  if ((test.status !== 'PASSED' && test.status !== 'EXHAUSTED') || test.results.length === 0) return null;
  return test.results.find((r) => r.passed) ?? [...test.results].sort((a, b) => b.attemptNo - a.attemptNo)[0] ?? null;
}

function SkipTestSkeleton() {
  return (
    <div className="pu-sk-view" aria-busy="true">
      <span className="pu-sk-sr" role="status">Đang tải bài kiểm tra…</span>
      <div className="pu-sk-card pu-sk-skel" aria-hidden="true">
        <i style={{ width: '28%', height: 12 }} />
        <i style={{ width: '48%', height: 30 }} />
        <i style={{ width: '92%', height: 14 }} />
        <i style={{ width: '74%', height: 14 }} />
        <div className="pu-sk-skel-grid">
          <i /><i /><i /><i />
        </div>
        <i style={{ width: 196, height: 46, borderRadius: 14 }} />
      </div>
    </div>
  );
}
