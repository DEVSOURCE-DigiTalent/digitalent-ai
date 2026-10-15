import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, FileQuestion, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { usePulseBaseline, useSubmitPulseBaseline } from '@/hooks/use-pulse';
import type { PulseBaseline } from '@/services/pulse.service';
import { formatDate } from '@/lib/utils';
import { Empty, LoadError, Mini, Notice, PageHead, PageSkeleton, PuLink } from '../components/ui';
import { btn } from '../lib/button';
import { levelShort, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

/**
 * Bài kiểm tra đầu vào (§7.1): câu tình huống chỉ ở các lĩnh vực và mức thuộc mục tiêu vị trí. Mức Lk chỉ ghi nhận khi
 * trả lời đúng liên tiếp L1..Lk (chấm ở máy chủ). Làm một lần.
 */
export function PulseBaselinePage() {
  const { data, isLoading, error, refetch } = usePulseBaseline();
  if (isLoading) return <PageSkeleton blocks={[140, 640]} />;
  if (error || !data) return <LoadError message={pulseErrorMessage(error, 'Không tải được bài kiểm tra đầu vào.')} onRetry={() => refetch()} />;
  if (data.assessed) return <BaselineResult baseline={data} />;
  if (data.blockReason) return <BaselineBlocked baseline={data} />;
  return <BaselineForm baseline={data} />;
}

function BaselineForm({ baseline }: { baseline: PulseBaseline }) {
  const navigate = useNavigate();
  const submit = useSubmitPulseBaseline();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const questions = baseline.domains.flatMap((d) => d.questions);
  const answered = questions.filter((q) => answers[q.questionId]).length;
  const position = baseline.person.positionName ?? 'vị trí của bạn';

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (answered < questions.length) return;
    submit.mutate(
      questions.map((q) => ({ questionId: q.questionId, optionId: answers[q.questionId]! })),
      {
        onSuccess: () => {
          toast.success('Đã ghi nhận mức đầu vào. Lộ trình của bạn đã mở.');
          navigate(PULSE_PATHS.path);
        },
        onError: (err) => toast.error(pulseErrorMessage(err, 'Chưa nộp được bài kiểm tra đầu vào.')),
      },
    );
  };

  return (
    <>
      <PageHead
        eyebrow="Kiểm tra đầu vào"
        title="Đo năng lực theo đúng vị trí."
        description={`Bài kiểm tra chỉ hỏi những lĩnh vực trong lộ trình ${position}${baseline.person.departmentName ? ` của phòng ${baseline.person.departmentName}` : ''}. Kết quả tạo mức khởi điểm để so với mục tiêu doanh nghiệp.`}
      />
      <section className="pu-surface pu-pad">
        <Mini>{baseline.person.fullName} · {position}</Mini>
        <h2 className="pu-panel-title">Trả lời từng tình huống ngắn.</h2>
        <p className="pu-panel-desc">
          Mỗi mức tiếp theo chỉ được ghi nhận khi các mức trước đều trả lời đúng. Đây là bộ câu hỏi minh họa của bản Pulse,
          chưa phải bài đo lường đã kiểm định.
        </p>
        <form onSubmit={onSubmit}>
          <div className="pu-assess-grid">
            {baseline.domains.filter((d) => d.questions.length > 0).map((domain) => (
              <fieldset key={domain.categoryId} className="pu-assess-domain">
                <legend>{domain.name} <small>· mục tiêu L{domain.target}</small></legend>
                {domain.questions.map((question, index) => (
                  <div className="pu-assess-q" key={question.questionId} role="radiogroup" aria-label={question.content}>
                    <strong>{index + 1}. {question.content}</strong>
                    {question.options.map((option) => (
                      <label key={option.optionId} className="pu-choice">
                        <input
                          type="radio"
                          name={question.questionId}
                          value={option.optionId}
                          checked={answers[question.questionId] === option.optionId}
                          onChange={() => setAnswers((prev) => ({ ...prev, [question.questionId]: option.optionId }))}
                        />
                        <span>{option.content}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </fieldset>
            ))}
          </div>
          <div className="pu-assess-submit">
            <span aria-live="polite">Đã trả lời {answered}/{questions.length} câu · bạn chỉ nộp bài một lần</span>
            <button type="submit" className={btn()} disabled={answered < questions.length || submit.isPending}>
              {submit.isPending ? 'Đang chấm…' : 'Nộp bài và xem khoảng cách năng lực →'}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

function BaselineResult({ baseline }: { baseline: PulseBaseline }) {
  return (
    <>
      <PageHead
        eyebrow="Kiểm tra đầu vào"
        title="Đã ghi nhận mức khởi điểm."
        description={`Bạn hoàn thành bài kiểm tra đầu vào ngày ${formatDate(baseline.assessedAt)}. Mức đầu vào giữ nguyên để so với tiến bộ sau này.`}
        actions={<PuLink to={PULSE_PATHS.path}>Xem khoảng cách và lộ trình →</PuLink>}
      />
      <div className="pu-baseline-result">
        {baseline.domains.map((domain) => (
          <div key={domain.categoryId}>
            <small>{domain.name}</small>
            <strong>{levelShort(domain.baseline)} <span>→ mục tiêu L{domain.target}</span></strong>
          </div>
        ))}
      </div>
    </>
  );
}

function BaselineBlocked({ baseline }: { baseline: PulseBaseline }) {
  if (baseline.blockReason === 'NO_POSITION') {
    return (
      <Empty icon={<UserX size={24} />} title="Bạn chưa được gán vị trí công việc">
        Bài kiểm tra đầu vào hỏi theo mục tiêu của vị trí. Hãy liên hệ chủ doanh nghiệp để được xếp vào phòng ban và vị trí phù hợp.
      </Empty>
    );
  }
  if (baseline.blockReason === 'NO_TARGETS') {
    return (
      <Empty icon={<ClipboardCheck size={24} />} title="Vị trí của bạn chưa có mục tiêu năng lực">
        Chủ doanh nghiệp cần công bố mục tiêu năng lực cho vị trí trước khi bài kiểm tra đầu vào mở.
      </Empty>
    );
  }
  return (
    <>
      <Empty icon={<FileQuestion size={24} />} title="Chưa có bộ câu hỏi đầu vào">
        Doanh nghiệp chưa có câu hỏi đầu vào cho các lĩnh vực trong vị trí của bạn.
      </Empty>
      <div style={{ marginTop: 16 }}><Notice>Bạn vẫn có thể đọc các khóa Cơ bản; tiến độ lộ trình sẽ bắt đầu ghi sau bài đầu vào.</Notice></div>
    </>
  );
}
