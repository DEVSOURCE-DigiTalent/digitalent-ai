import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Lock } from 'lucide-react';
import { toast } from 'sonner';
import journeyArt from '@/assets/pulse/learning-journey-abstract.webp';
import { useMarkPulseModuleViewed, usePulseModule, usePulseOverview, useSubmitPulseModuleQuiz } from '@/hooks/use-pulse';
import type { PulseModuleDetail, PulseQuizResult } from '@/services/pulse.service';
import { RichText } from '../components/RichText';
import { Bar, Eyebrow, LoadError, Mini, Notice, PageSkeleton, PuLink } from '../components/ui';
import { btn } from '../lib/button';
import { BLOCK_MESSAGES, LESSON_TYPE_LABELS, levelName, pad2, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

/** Trang học mô đun (§9.2): các trang nội dung, câu hỏi ôn tập mở sau trang cuối, cần đúng tất cả câu. */
export function PulseModulePage() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const { data, isLoading, error, refetch } = usePulseModule(courseId, moduleId);
  if (isLoading) return <PageSkeleton blocks={[60, 520, 240]} />;
  if (error || !data) return <LoadError message={pulseErrorMessage(error, 'Không mở được mô đun này.')} onRetry={() => refetch()} />;
  return <ModuleView key={data.module.moduleId} detail={data} />;
}

function ModuleView({ detail }: { detail: PulseModuleDetail }) {
  const { course, module, slides } = detail;
  const courseId = course.courseId;
  const [index, setIndex] = useState(0);
  const markViewed = useMarkPulseModuleViewed();
  const marked = useRef(detail.viewed);
  const { data: overview } = usePulseOverview();
  const canRecord = !detail.sample && course.canWork;
  const slide = slides[index];
  const isLast = index === slides.length - 1;
  const total = detail.modules.length;
  const status = detail.quizPassed ? 'Đã đạt câu hỏi ôn tập'
    : detail.sample ? 'Trang mẫu'
    : detail.quizBlockReason === 'PREVIOUS_MODULE_REQUIRED' ? 'Cần đạt mô đun trước'
    : detail.viewed ? 'Sẵn sàng làm câu hỏi ôn tập'
    : 'Đang đọc nội dung';

  // Đọc tới trang cuối → ghi nhận đã xem (mở câu hỏi ôn tập). Chỉ khi được ghi tiến độ, một lần.
  useEffect(() => {
    if (!isLast || !canRecord || marked.current) return;
    marked.current = true;
    markViewed.mutate(
      { courseId, moduleId: module.moduleId },
      { onError: (err) => { marked.current = false; toast.error(pulseErrorMessage(err, 'Chưa lưu được tiến độ đọc.')); } },
    );
  }, [isLast, canRecord, courseId, module.moduleId, markViewed]);

  return (
    <div>
      <div className="pu-crumb">
        <PuLink to={PULSE_PATHS.course(courseId)} kind="ghost" small>← Tổng quan khóa học</PuLink>
        <span>{course.domainName} · {levelName(course.tier)}</span>
      </div>
      <div className="pu-progress">
        <span>Mô đun {pad2(module.index + 1)} / {pad2(total)}</span>
        <Bar value={((module.index + (detail.quizPassed ? 1 : 0)) / Math.max(1, total)) * 100} label="Tiến độ trong khóa" />
        <strong>{status}</strong>
      </div>

      <div className="pu-module-layout">
        <nav className="pu-module-nav" aria-label="Các mô đun của khóa">
          <Mini>Trong khóa học này</Mini>
          {detail.modules.map((item) =>
            item.viewable ? (
              <Link
                key={item.moduleId}
                to={PULSE_PATHS.module(courseId, item.moduleId)}
                className={`${item.moduleId === module.moduleId ? 'active' : ''} ${item.passed ? 'passed' : ''}`}
                aria-current={item.moduleId === module.moduleId ? 'page' : undefined}
              >
                <b>{item.passed ? <Check size={14} /> : pad2(item.index + 1)}</b>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.passed ? 'Đã đạt câu ôn tập' : item.moduleId === module.moduleId ? 'Bạn đang ở đây' : 'Trang nội dung + câu ôn tập'}</small>
                </span>
              </Link>
            ) : (
              <span key={item.moduleId} className="pu-nav-locked">
                <b><Lock size={13} /></b>
                <span><strong>{item.title}</strong><small>Cần suất học</small></span>
              </span>
            ),
          )}
          <div className="pu-module-nav-final">
            <b>{pad2(total + 1)}</b>
            <span><strong>Bài cuối khóa</strong><small>Quản lý phòng ban chấm</small></span>
          </div>
          <PuLink to={PULSE_PATHS.final(courseId)} kind="outline" small>Xem bài cuối →</PuLink>
        </nav>

        <main className="pu-module-main">
          <div className="pu-module-title">
            <Eyebrow>{course.domainName} · {levelName(course.tier)}{detail.sample ? ' · trang mẫu' : ''}</Eyebrow>
            <h1>{module.title}</h1>
            {module.description && <p>{module.description}</p>}
          </div>

          {slide ? (
            <div className="pu-player" aria-label="Trang nội dung của mô đun">
              <div className="pu-player-bar">
                <span>Trang nội dung bài học</span>
                <span aria-live="polite">{pad2(index + 1)} / {pad2(slides.length)}</span>
              </div>
              <div className="pu-slide-head">
                <div>
                  <span>{pad2(index + 1)} / {LESSON_TYPE_LABELS[slide.lessonType] ?? 'Nội dung'}</span>
                  <h2>{slide.title}</h2>
                  {slide.estimatedMinutes ? <small>Khoảng {slide.estimatedMinutes} phút</small> : null}
                </div>
                <img src={journeyArt} alt="" />
              </div>
              <div className="pu-slide-body">
                <RichText body={slide.contentBody} />
              </div>
              <div className="pu-player-bar">
                <div className="pu-slide-dots" aria-hidden>
                  {slides.map((s, i) => <i key={s.lessonId} className={i === index ? 'active' : ''} />)}
                </div>
                <div className="pu-row">
                  <button type="button" className={btn('outline', true)} onClick={() => setIndex((i) => i - 1)} disabled={index === 0}>
                    ← Trước đó
                  </button>
                  <button type="button" className={btn('outline', true)} onClick={() => setIndex((i) => i + 1)} disabled={isLast}>
                    Trang tiếp theo →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Notice>Mô đun này chưa có trang nội dung.</Notice>
          )}

          <div className="pu-reflection">
            <span>Thử áp dụng vào vị trí của bạn</span>
            <p>
              Nghĩ về một nhiệm vụ trong vị trí {overview?.person.positionName ?? 'của bạn'} mà bạn có thể trình bày rõ nguồn,
              cách làm và kết quả. Ghi lại để dùng cho bài cuối khóa.
            </p>
          </div>

          <QuizArea detail={detail} viewed={detail.viewed || (markViewed.isSuccess && canRecord)} reachedEnd={isLast} />
        </main>
      </div>
    </div>
  );
}

function QuizArea({ detail, viewed, reachedEnd }: { detail: PulseModuleDetail; viewed: boolean; reachedEnd: boolean }) {
  const { course, module } = detail;
  const submit = useSubmitPulseModuleQuiz();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PulseQuizResult | null>(null);
  const nextPath = detail.nextModuleId ? PULSE_PATHS.module(course.courseId, detail.nextModuleId) : PULSE_PATHS.final(course.courseId);
  const nextLabel = detail.nextModuleId ? 'Mô đun tiếp theo →' : 'Đến bài cuối khóa →';

  if (detail.quizPassed || (!detail.quiz && viewed && !detail.sample && course.canWork)) {
    const score = detail.lastQuiz;
    return (
      <div className="pu-passed">
        <span aria-hidden><Check size={20} strokeWidth={3} /></span>
        <div>
          <strong>{detail.quiz || score ? `Đã đạt câu hỏi ôn tập${score ? ` · đúng ${score.score}/${score.total}` : ''}` : 'Đã đọc hết mô đun'}</strong>
          <p>Tiến độ đã được lưu. {detail.nextModuleId ? 'Mô đun tiếp theo đã sẵn sàng.' : 'Bạn đã sẵn sàng cho bài cuối khóa.'}</p>
        </div>
        <PuLink to={nextPath} small>{nextLabel}</PuLink>
      </div>
    );
  }

  if (detail.sample || detail.quizBlockReason || !detail.quiz) {
    const reason = detail.quizBlockReason;
    return (
      <div className="pu-stack" style={{ gap: 11 }}>
        <Notice tone="warning">
          {reason ? BLOCK_MESSAGES[reason] : detail.sample ? BLOCK_MESSAGES.SEAT_REQUIRED : 'Mô đun này chưa có câu hỏi ôn tập.'}
        </Notice>
        {reason === 'NOT_ASSESSED' && <div><PuLink to={PULSE_PATHS.baseline} kind="outline" small>Làm bài đầu vào →</PuLink></div>}
      </div>
    );
  }

  const questions = detail.quiz.questions;
  const answered = questions.filter((q) => answers[q.questionId]).length;
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    submit.mutate(
      { courseId: course.courseId, moduleId: module.moduleId, answers: questions.map((q) => ({ questionId: q.questionId, optionId: answers[q.questionId]! })) },
      {
        onSuccess: (res) => {
          setResult(res);
          if (res.passed) toast.success(res.allModulesPassed ? 'Đã qua mọi mô đun. Bài cuối khóa đã sẵn sàng.' : 'Đạt câu hỏi ôn tập. Mô đun tiếp theo đã mở.');
        },
        onError: (err) => toast.error(pulseErrorMessage(err, 'Chưa chấm được câu trả lời.')),
      },
    );
  };

  return (
    <section className="pu-quiz" aria-labelledby="pu-quiz-title">
      <Mini>Kiểm tra kiến thức của bạn</Mini>
      <h2 id="pu-quiz-title">Câu hỏi ôn tập mô đun {pad2(module.index + 1)}</h2>
      <p>Trả lời đúng tất cả {questions.length} câu để hoàn thành mô đun. Bạn có thể làm lại.</p>
      {!viewed ? (
        <p className="pu-quiz-intro">{reachedEnd ? 'Đang lưu tiến độ đọc…' : 'Đọc hết các trang nội dung để mở câu hỏi ôn tập.'}</p>
      ) : (
        <form onSubmit={onSubmit}>
          {questions.map((question, qIndex) => (
            <fieldset key={question.questionId}>
              <legend><span>{pad2(qIndex + 1)}</span>{question.content}</legend>
              {question.options.map((option) => (
                <label key={option.optionId}>
                  <input
                    type="radio"
                    name={question.questionId}
                    value={option.optionId}
                    checked={answers[question.questionId] === option.optionId}
                    onChange={() => { setAnswers((prev) => ({ ...prev, [question.questionId]: option.optionId })); setResult(null); }}
                  />
                  <span>{option.content}</span>
                </label>
              ))}
            </fieldset>
          ))}
          {result && !result.passed && (
            <div className="pu-quiz-feedback" role="alert">
              Đúng {result.score}/{result.total}. Xem lại ví dụ trên các trang và thử lại:
              <ul>{result.wrong.map((w) => <li key={w.questionId}>{w.explanation ?? 'Đọc lại phần nội dung liên quan.'}</li>)}</ul>
            </div>
          )}
          <button type="submit" className={btn()} disabled={answered < questions.length || submit.isPending}>
            {submit.isPending ? 'Đang chấm…' : 'Kiểm tra câu trả lời →'}
          </button>
        </form>
      )}
    </section>
  );
}
