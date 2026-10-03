import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Check, RotateCcw, X } from 'lucide-react';
import { usePersonalAssessment, useSubmitCourseAssessment } from '@/hooks/use-personal-learning';
import { cn } from '@/lib/utils';
import type { AssessmentOutcome, PersonalCourseDetail } from '@/services/personal-learning.service';
import { Card, ErrorBlock, LoadingBlock, PT_BUTTON, PT_BUTTON_SECONDARY, PT_EYEBROW } from './ui';
import { errorMessage } from '../utils/error-message';

/** End-of-course assessment: 4 questions of the course's domain; passing raises the levels and issues a certificate. */
export function CourseAssessment({ course }: { course: PersonalCourseDetail }) {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [outcome, setOutcome] = useState<AssessmentOutcome | null>(null);
  const assessment = usePersonalAssessment(course.id, started);
  const submit = useSubmitCourseAssessment();
  const ready = course.completedLessons === course.lessonCount;

  const restart = () => {
    setAnswers({});
    setOutcome(null);
    setStarted(true);
  };

  if (!started || !assessment.data) {
    return (
      <Card className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="max-w-[52ch]">
          <p className={PT_EYEBROW}>Bài đánh giá cuối khóa</p>
          <p className="mt-3 text-[19px] leading-snug tracking-[-0.015em]">
            {course.assessment.passed
              ? `Bạn đã đạt bài đánh giá (cao nhất ${course.assessment.bestScore}%).`
              : `${course.assessment.questionCount} câu tình huống · cần đúng từ ${course.assessment.passPercent}%`}
          </p>
          <p className="mt-2 text-sm text-pt-fg-2">
            {ready
              ? 'Đạt bài đánh giá để nâng mức các năng lực của khóa và nhận chứng nhận.'
              : `Học hết ${course.lessonCount - course.completedLessons} bài còn lại để mở bài đánh giá.`}
          </p>
        </div>
        {started && assessment.isLoading && <LoadingBlock className="w-40" />}
        {assessment.isError && <ErrorBlock message={errorMessage(assessment.error)} onRetry={() => assessment.refetch()} />}
        <button type="button" disabled={!ready} onClick={restart} className={course.assessment.passed ? PT_BUTTON_SECONDARY : PT_BUTTON}>
          {course.assessment.passed ? 'Làm lại để luyện tập' : 'Làm bài đánh giá'}
        </button>
      </Card>
    );
  }

  const questions = assessment.data.questions;
  const allAnswered = questions.every((question) => answers[question.id] !== undefined);
  const review = new Map(outcome?.review.map((item) => [item.questionId, item]));

  return (
    <Card className="p-6 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className={PT_EYEBROW}>Bài đánh giá · {course.code}</p>
        <p className="text-xs text-pt-fg-3">Đạt từ {assessment.data.passPercent}%</p>
      </div>

      {outcome && (
        <div
          role="status"
          className={cn('mt-5 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between', outcome.passed ? 'border-pt-ok/40 bg-pt-ok/10' : 'border-pt-bad/40 bg-pt-bad/10')}
        >
          <div>
            <p className={cn('text-[22px] font-light tracking-[-0.02em]', outcome.passed ? 'text-pt-ok' : 'text-pt-bad')}>
              {outcome.passed ? 'Đạt' : 'Chưa đạt'} · {outcome.scorePercent}%
            </p>
            <p className="mt-1 text-sm text-pt-fg-2">
              {outcome.correct}/{outcome.total} câu đúng.{' '}
              {outcome.passed ? 'Mức năng lực của khóa đã được cập nhật vào hồ sơ.' : 'Xem giải thích bên dưới rồi thử lại.'}
            </p>
          </div>
          {outcome.passed ? (
            <Link to="/personal/certificates" className={PT_BUTTON}><Award className="size-4" aria-hidden="true" /> Xem chứng nhận</Link>
          ) : (
            <button type="button" onClick={restart} className={PT_BUTTON_SECONDARY}><RotateCcw className="size-4" aria-hidden="true" /> Làm lại</button>
          )}
        </div>
      )}

      <ol className="mt-6 grid gap-6">
        {questions.map((question, index) => {
          const result = review.get(question.id);
          return (
            <li key={question.id}>
              <fieldset disabled={Boolean(outcome)}>
                <legend className="text-[16px] leading-snug text-pt-fg">
                  <span className="mr-2 text-pt-fg-3">{index + 1}.</span>{question.text}
                </legend>
                <div className="mt-3 grid gap-2">
                  {question.options.map((option, optionIndex) => {
                    const checked = answers[question.id] === optionIndex;
                    const isCorrect = result?.correctIndex === optionIndex;
                    return (
                      <label
                        key={option}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-colors',
                          result && isCorrect && 'border-pt-ok/50 bg-pt-ok/10 text-pt-fg',
                          result && checked && !isCorrect && 'border-pt-bad/50 bg-pt-bad/10',
                          !result && (checked ? 'border-pt-fg bg-pt-raised text-pt-fg' : 'border-pt-line text-pt-fg-2 hover:border-pt-fg/40'),
                          result && !checked && !isCorrect && 'border-pt-line text-pt-fg-3',
                        )}
                      >
                        <input
                          type="radio"
                          name={`assessment-${question.id}`}
                          checked={checked}
                          onChange={() => setAnswers((previous) => ({ ...previous, [question.id]: optionIndex }))}
                          className="mt-0.5 accent-current"
                        />
                        <span className="flex-1">{option}</span>
                        {result && isCorrect && <Check className="size-4 text-pt-ok" aria-label="Đáp án đúng" />}
                        {result && checked && !isCorrect && <X className="size-4 text-pt-bad" aria-label="Bạn chọn" />}
                      </label>
                    );
                  })}
                </div>
                {result && <p className="mt-2 text-xs leading-relaxed text-pt-fg-3">{result.explanation}</p>}
              </fieldset>
            </li>
          );
        })}
      </ol>

      {!outcome && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-pt-line pt-6">
          {submit.isError ? <p role="alert" className="text-sm text-pt-bad">{errorMessage(submit.error)}</p> : <span />}
          <button
            type="button"
            disabled={!allAnswered || submit.isPending}
            onClick={() => submit.mutate({ courseId: course.id, answers }, { onSuccess: setOutcome })}
            className={PT_BUTTON}
          >
            {submit.isPending ? 'Đang chấm…' : 'Nộp bài đánh giá'}
          </button>
        </div>
      )}
    </Card>
  );
}
