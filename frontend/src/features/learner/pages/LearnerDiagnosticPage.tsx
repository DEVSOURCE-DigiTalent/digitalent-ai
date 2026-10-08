import { useContext, useEffect, useState } from 'react';
import { Link, UNSAFE_DataRouterContext, useBlocker } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, RotateCcw, X } from 'lucide-react';
import { usePersonalAccess, usePersonalDiagnostic, useSubmitDiagnostic } from '@/hooks/use-personal-learning';
import { usePlanErrorHandler } from '@/hooks/use-plan-error-handler';
import { trackTrialEvent } from '@/features/experience/individual-trial/individual-trial-tracker';
import { formatDmy } from '@/lib/personal-access';
import { INDIVIDUAL_TRIAL } from '@/lib/plans';
import { levelLabelVi } from '@/lib/competency-levels';
import { cn } from '@/lib/utils';
import type { DiagnosticQuestion, DiagnosticResult, PersonalAccess, PersonalDiagnostic } from '@/services/personal-learning.service';
import { usePersonalFocus } from '../components/PersonalFocusContext';
import { DomainRadar, RadarLegend } from '../components/DomainRadar';
import {
  Card, ErrorBlock, LevelPips, LoadingBlock, PT_BUTTON, PT_BUTTON_GOLD, PT_BUTTON_SECONDARY, PT_EYEBROW, PersonalPageHeader, ProgressBar,
  SectionTitle, Tag
} from '../components/ui';
import { InlineTip } from '../components/InlineTip';
import { errorMessage, planErrorOf } from '../utils/error-message';
import { formatDate } from '../utils/format';

type Mode = 'intro' | 'quiz' | 'result';

/** IND-06 "/personal/diagnostic": 18 workplace questions, 3 per domain, one per level. */
export function LearnerDiagnosticPage() {
  const { data, isLoading, isError, error, refetch } = usePersonalDiagnostic();
  const [mode, setMode] = useState<Mode | null>(null);
  const current: Mode = mode ?? (data?.result ? 'result' : 'intro');
  usePersonalFocus(current === 'quiz');
  const { data: access } = usePersonalAccess();

  return (
    <div data-testid="learner-diagnostic-page" className="grid gap-6">
      {current !== 'quiz' && <PersonalPageHeader
        label="Đánh giá đầu vào"
        title="Đánh giá năng lực"
        lead="Mỗi miền năng lực có ba câu tình huống, lần lượt ở mức Cơ bản, Trung cấp và Nâng cao. Mức của bạn trong một miền là mức cao nhất bạn trả lời đúng liên tiếp từ câu Cơ bản."
      />}

      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message={errorMessage(error)} onRetry={() => refetch()} />}
      {data && current === 'intro' && <Intro data={data} onStart={() => setMode('quiz')} />}
      {data && current === 'quiz' && (
        <Quiz
          questions={data.questions}
          access={access}
          previousCompletedAt={data.result?.completedAt}
          onCancel={() => setMode(data.result ? 'result' : 'intro')}
          onDone={() => setMode('result')}
        />
      )}
      {data?.result && current === 'result' && <Result data={data} result={data.result} access={access} onRetake={() => setMode('quiz')} />}
    </div>
  );
}

function Intro({ data, onStart }: { data: PersonalDiagnostic; onStart: () => void }) {
  const facts = [
    { value: String(data.questions.length), label: 'câu tình huống công việc' },
    { value: '6', label: 'miền của Khung chuẩn năng lực số' },
    { value: '~10', label: 'phút ước tính' },
  ];
  return (
    <Card className="grid gap-10 p-7 md:grid-cols-[1.2fr_1fr] md:p-10">
      <div className="flex flex-col justify-between gap-8">
        <div>
          <p className={PT_EYEBROW}>{data.target ? `Mục tiêu: ${data.target.name}` : 'Chưa chọn mục tiêu'}</p>
          <p className="mt-4 max-w-[48ch] text-[17px] leading-relaxed text-pt-fg-2">
            Kết quả cho biết mức hiện tại của bạn ở từng miền, thay vì mặc định bằng không. Lộ trình sẽ miễn các khóa
            bạn đã đạt và chỉ giữ phần còn thiếu so với vị trí mục tiêu.
          </p>
          {data.tryOrientation && (
            <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-pt-fg-2">
              Ở bài thử nhanh bạn đúng {data.tryOrientation.correct}/{data.tryOrientation.total} câu định hướng. Bài này {data.questions.length} câu, đo mức chính xác ở 6 miền.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onStart} className={PT_BUTTON}>
            Bắt đầu làm bài <ArrowRight className="size-4" aria-hidden="true" />
          </button>
          {!data.target && <Link to="/personal/target" className={PT_BUTTON_SECONDARY}>Chọn vị trí trước</Link>}
        </div>
      </div>
      <dl className="grid content-start gap-5">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-baseline gap-4 border-b border-pt-line pb-5 last:border-0">
            <dt className="w-16 shrink-0 text-2xl font-semibold leading-none tracking-[-0.04em] tabular-nums">{fact.value}</dt>
            <dd className="text-sm text-pt-fg-2">{fact.label}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

interface QuizProps {
  questions: DiagnosticQuestion[];
  access: PersonalAccess | undefined;
  /** Completion time of the result being replaced, when this is a retake. */
  previousCompletedAt: string | undefined;
  onCancel: () => void;
  onDone: () => void;
}

function Quiz({ questions, access, previousCompletedAt, onCancel, onDone }: QuizProps) {
  const submit = useSubmitDiagnostic();
  const handlePlanError = usePlanErrorHandler();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const question = questions[index];
  const answered = Object.keys(answers).length;
  const isLast = index === questions.length - 1;
  const allAnswered = answered === questions.length;
  const dataRouter = useContext(UNSAFE_DataRouterContext);
  const dirty = answered > 0 && !submit.isSuccess;
  useEffect(() => {
    if (!dirty) return;
    const preventUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', preventUnload);
    return () => window.removeEventListener('beforeunload', preventUnload);
  }, [dirty]);
  const cancel = () => { if (!dirty || window.confirm('Câu trả lời chưa được lưu. Bạn có muốn thoát bài đánh giá?')) onCancel(); };

  const choose = (option: number) => setAnswers((previous) => ({ ...previous, [question.id]: option }));
  const countSubmission = () => {
    if (access?.mode === 'trial') {
      trackTrialEvent('trial_diagnostic_submitted', { daysSinceStart: INDIVIDUAL_TRIAL.days - (access.daysLeft ?? INDIVIDUAL_TRIAL.days) });
    } else if (access?.mode === 'free' && previousCompletedAt) {
      const days = Math.floor((Date.now() - new Date(previousCompletedAt).getTime()) / (24 * 60 * 60 * 1000));
      trackTrialEvent('free_reassessment_taken', { daysSincePrevious: days });
    }
  };
  const handleSubmit = () => submit.mutate(answers, {
    onSuccess: () => {
      countSubmission();
      onDone();
    },
    onError: handlePlanError,
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
      {dataRouter && <QuizNavigationGuard dirty={dirty} />}
      <aside aria-label="Các câu hỏi" className="order-2 lg:order-1">
        <p className="mb-3 text-xs text-pt-fg-3">{answered}/{questions.length} câu đã trả lời</p>
        <ol className="grid grid-cols-9 gap-1.5 lg:grid-cols-3">
          {questions.map((item, position) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setIndex(position)}
                aria-label={`Câu ${position + 1}${answers[item.id] !== undefined ? ', đã trả lời' : ''}`}
                aria-current={position === index ? 'step' : undefined}
                className={cn(
                  'grid h-9 w-full place-items-center rounded-lg border text-xs tabular-nums transition-colors',
                  position === index
                    ? 'border-pt-fg bg-pt-fg text-pt-bg'
                    : answers[item.id] !== undefined
                      ? 'border-pt-line bg-pt-fg/10 text-pt-fg'
                      : 'border-pt-line text-pt-fg-3 hover:border-pt-fg/40',
                )}
              >
                {position + 1}
              </button>
            </li>
          ))}
        </ol>
      </aside>

      <Card className="order-1 p-6 md:p-9 lg:order-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={PT_EYEBROW}>Câu {index + 1} / {questions.length} · Miền {question.domainNumber}</p>
          <Tag>{question.domainName}</Tag>
        </div>
        <ProgressBar className="mt-4" value={(answered / questions.length) * 100} label="Tiến độ làm bài" />

        <fieldset key={question.id} className="pt-rise mt-8">
          <legend className="text-balance text-[clamp(20px,2.4vw,26px)] font-normal leading-[1.3] tracking-[-0.015em]">{question.text}</legend>
          <div className="mt-7 grid gap-2.5">
            {question.options.map((option, optionIndex) => {
              const checked = answers[question.id] === optionIndex;
              return (
                <label
                  key={option}
                  className={cn(
                    'flex cursor-pointer items-start gap-4 rounded-2xl border p-4 text-[15px] leading-snug transition-colors',
                    checked ? 'border-pt-fg bg-pt-raised text-pt-fg' : 'border-pt-line text-pt-fg-2 hover:border-pt-fg/40 hover:text-pt-fg',
                  )}
                >
                  <input
                    type="radio"
                    name={question.id}
                    checked={checked}
                    onChange={() => choose(optionIndex)}
                    className="mt-1 accent-current"
                  />
                  <span aria-hidden="true" className={cn('grid size-7 shrink-0 place-items-center rounded-full border text-xs', checked ? 'border-pt-fg bg-pt-fg text-pt-bg' : 'border-pt-line text-pt-fg-3')}>
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span className="pt-0.5">{option}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {submit.isError && !planErrorOf(submit.error) && <p role="alert" className="mt-5 text-sm text-pt-bad">{errorMessage(submit.error)}</p>}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-pt-line pt-6">
          <div className="flex gap-2">
            <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0} className={PT_BUTTON_SECONDARY}>
              <ArrowLeft className="size-4" aria-hidden="true" /> Câu trước
            </button>
            <button type="button" onClick={cancel} className="px-3 text-sm text-pt-fg-3 hover:text-pt-fg">Thoát</button>
          </div>
          {isLast || allAnswered ? (
            <button type="button" onClick={handleSubmit} disabled={!allAnswered || submit.isPending} className={PT_BUTTON}>
              {submit.isPending ? 'Đang chấm…' : allAnswered ? 'Nộp bài' : `Còn ${questions.length - answered} câu`}
            </button>
          ) : (
            <button type="button" onClick={() => setIndex(index + 1)} className={PT_BUTTON}>
              Câu tiếp <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}

function QuizNavigationGuard({ dirty }: { dirty: boolean }) {
  const blocker = useBlocker(dirty);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('Câu trả lời chưa được lưu. Bạn có muốn rời bài đánh giá?')) blocker.proceed();
    else blocker.reset();
  }, [blocker]);
  return null;
}

/** Retaking the entry assessment depends on the plan: once in a trial, every 30 days on the Free plan (BR-09). */
function RetakeControl({ access, onRetake }: { access: PersonalAccess | undefined; onRetake: () => void }) {
  if (access?.mode === 'trial' && !access.diagnosticAvailable) {
    return <p className="max-w-[40ch] text-sm text-pt-fg-3">Trong kỳ dùng thử, bài đánh giá làm được một lần.</p>;
  }
  if (access?.mode === 'free') {
    return access.diagnosticAvailable ? (
      <button type="button" onClick={onRetake} className={PT_BUTTON_GOLD}>
        <RotateCcw className="size-4" aria-hidden="true" /> Đánh giá lại để xem tiến bộ
      </button>
    ) : (
      <p className="text-sm text-pt-fg-3">Làm lại từ {access.reassessAvailableAt ? formatDmy(access.reassessAvailableAt) : 'ngày sau'}</p>
    );
  }
  return (
    <button type="button" onClick={onRetake} className={PT_BUTTON_SECONDARY}>
      <RotateCcw className="size-4" aria-hidden="true" /> Làm lại
    </button>
  );
}

function Result({ data, result, access, onRetake }: { data: PersonalDiagnostic; result: DiagnosticResult; access: PersonalAccess | undefined; onRetake: () => void }) {
  const required = data.target?.domains.map((domain) => domain.highestLevel) ?? [0, 0, 0, 0, 0, 0];
  const current = result.domains.map((domain) => domain.level);
  const questions = new Map(data.questions.map((question) => [question.id, question]));

  return (
    <div className="grid gap-3">
      <InlineTip tipKey="tip-diagnostic-result">
        Mỗi miền có mức yêu cầu của vị trí và mức hiện tại của bạn. Chênh lệch chính là phần lộ trình sẽ bù.
      </InlineTip>
      <Card className="grid gap-8 p-7 md:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <p className={PT_EYEBROW}>Kết quả · {formatDate(result.completedAt)}</p>
          <p className="mt-5 text-3xl font-semibold leading-none tracking-[-0.05em] tabular-nums">
            {result.correct}<span className="text-pt-fg-3">/{result.total}</span>
          </p>
          <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-pt-fg-2">
            câu trả lời đúng. {data.target
              ? `Đường nét đứt là yêu cầu của vị trí ${data.target.name}; phần tô là mức của bạn.`
              : 'Chọn một vị trí mục tiêu để so mức của bạn với yêu cầu.'}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to={data.target ? '/personal/path' : '/personal/target'} className={PT_BUTTON}>
              {data.target ? 'Xem lộ trình của bạn' : 'Chọn vị trí mục tiêu'} <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <RetakeControl access={access} onRetake={onRetake} />
          </div>
        </div>
        <div>
          <DomainRadar required={required} current={current} className="mx-auto max-w-[420px]" />
          <RadarLegend className="mt-2 justify-center" />
        </div>
      </Card>

      <p className="text-sm leading-relaxed text-pt-fg-2">Kết quả dựa trên các câu trả lời trong bài đánh giá này, dùng để đề xuất lộ trình. Mức của mỗi miền là mức cao nhất trả lời đúng liên tiếp từ Cơ bản; kết quả không thay thế đánh giá toàn diện qua công việc thực tế.</p>
      <Card className="p-6 md:p-8">
        <SectionTitle title="Theo từng miền" aside="Thang 3 mức: Cơ bản · Trung cấp · Nâng cao" />
        <ul className="mt-6 grid gap-x-10 md:grid-cols-2">
          {result.domains.map((domain) => (
            <li key={domain.number} className="flex items-center justify-between gap-4 border-b border-pt-line py-4">
              <div className="min-w-0">
                <p className="text-sm text-pt-fg"><span className="mr-2 text-pt-fg-3">{domain.number}</span>{domain.name}</p>
                <p className="mt-0.5 text-xs text-pt-fg-3">
                  {domain.correct}/{domain.total} câu đúng · {domain.level === 0 ? 'Chưa đạt mức Cơ bản' : `Đạt ${levelLabelVi(domain.level)}`}
                  {required[domain.number - 1] > 0 && ` · Chuẩn: ${levelLabelVi(required[domain.number - 1])}`}
                </p>
              </div>
              <LevelPips level={domain.level} required={required[domain.number - 1]} />
            </li>
          ))}
        </ul>
      </Card>

      <Card as="details" className="group p-6 md:p-8">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[19px] tracking-[-0.015em] [&::-webkit-details-marker]:hidden">
          Xem lại đáp án
          <span className="text-xs text-pt-fg-3 group-open:hidden">Mở</span>
          <span className="hidden text-xs text-pt-fg-3 group-open:inline">Thu gọn</span>
        </summary>
        <ol className="mt-6 grid gap-5">
          {result.review.map((item, position) => {
            const question = questions.get(item.questionId);
            if (!question) return null;
            const right = item.chosenIndex === item.correctIndex;
            return (
              <li key={item.questionId} className="grid gap-2 border-b border-pt-line pb-5 last:border-0">
                <p className="flex items-start gap-3 text-sm text-pt-fg">
                  <span className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full', right ? 'bg-pt-ok/20 text-pt-ok' : 'bg-pt-bad/20 text-pt-bad')}>
                    {right ? <Check className="size-3" aria-label="Đúng" /> : <X className="size-3" aria-label="Sai" />}
                  </span>
                  <span>Câu {position + 1} ({levelLabelVi(question.level)}). {question.text}</span>
                </p>
                <p className="pl-8 text-xs text-pt-fg-2">Đáp án: {question.options[item.correctIndex]}</p>
                <p className="pl-8 text-xs leading-relaxed text-pt-fg-3">{item.explanation}</p>
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}
