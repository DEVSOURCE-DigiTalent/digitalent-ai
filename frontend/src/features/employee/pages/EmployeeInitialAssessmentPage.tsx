import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Loader2, Send } from 'lucide-react';
import {
  useSaveTrialAnswers,
  useStartTrialDiagnostic,
  useSubmitTrialDiagnostic,
  useTrialDiagnostic,
  useTrialResult,
} from '@/hooks/use-enterprise-trial';

export function EmployeeInitialAssessmentPage() {
  const diagnostic = useTrialDiagnostic();
  const result = useTrialResult();
  const start = useStartTrialDiagnostic();
  const save = useSaveTrialAnswers();
  const submit = useSubmitTrialDiagnostic();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const session = diagnostic.data;
  const saved = useMemo(() => Object.fromEntries((session?.savedAnswers ?? []).map((answer) => [answer.questionId, answer.optionId])), [session]);
  const mergedAnswers = { ...saved, ...answers };
  const answeredCount = session?.questions.filter((question) => mergedAnswers[question.id]).length ?? 0;

  const persistAnswers = async () => {
    if (!session) return;
    await save.mutateAsync({
      attemptId: session.attemptId,
      revision: session.revision,
      answers: Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId })),
    });
    setAnswers({});
  };

  const submitDiagnostic = async () => {
    if (!session) return;
    if (Object.keys(answers).length > 0) await persistAnswers();
    await submit.mutateAsync(session.attemptId);
  };

  if (diagnostic.isLoading || result.isLoading) {
    return <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 text-sm text-slate-500">Đang tải bài đánh giá…</div>;
  }

  if (result.data) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
          <CheckCircle2 className="mb-3 size-7" />
          <h1 className="text-2xl font-bold">Đã nộp diagnostic</h1>
          <p className="mt-2 text-sm">Kết quả đã được tính trên server và version tiêu chuẩn đã được lưu cùng attempt.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {result.data.items.map((item) => (
            <article key={item.competencyId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">{item.name}</h2>
              <p className="mt-2 text-sm text-slate-600">
                {item.classification === 'insufficient_data'
                  ? 'Chưa đủ dữ liệu để suy luận cấp độ.'
                  : `Hiện tại ${item.currentLevel}, yêu cầu ${item.requiredLevel}, khoảng trống ${item.gapSteps}.`}
              </p>
              <p className="mt-3 text-xs text-slate-500">{item.basis}</p>
            </article>
          ))}
        </div>
        <Link to="/enterprise/me/learning-path" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white">
          Xem lộ trình học tập
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Bài đánh giá năng lực đầu vào</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Bài đánh giá này được cấp từ backend theo vị trí trial đã được chủ sở hữu chọn. Câu trả lời được lưu server-side; frontend không tự chấm điểm.
        </p>
        <button
          type="button"
          onClick={() => start.mutate()}
          disabled={start.isPending}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
        >
          {start.isPending && <Loader2 className="size-4 animate-spin" />}
          Bắt đầu bài đánh giá
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">{session.positionName}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Requirement {session.requirementVersion} · Assessment {session.assessmentVersion} · Rubric {session.rubricVersion}
        </p>
        <p className="mt-2 text-sm text-slate-500">Đã trả lời {answeredCount}/{session.questions.length} câu. Bạn có thể lưu nháp rồi quay lại.</p>
      </div>

      <div className="grid gap-4">
        {session.questions.map((question, index) => (
          <article key={question.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">Câu {index + 1} · {question.competencyId}</div>
            <h2 className="mt-2 text-base font-semibold text-slate-950">{question.text}</h2>
            <div className="mt-4 grid gap-3">
              {question.options.map((option) => {
                const selected = mergedAnswers[question.id] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition ${selected ? 'border-blue-500 bg-blue-50 text-blue-950' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={persistAnswers}
          disabled={save.isPending || Object.keys(answers).length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
        >
          {save.isPending && <Loader2 className="size-4 animate-spin" />}
          Lưu nháp
        </button>
        <button
          type="button"
          onClick={submitDiagnostic}
          disabled={submit.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
        >
          {submit.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Nộp và xem skill gap
        </button>
      </div>
    </div>
  );
}
