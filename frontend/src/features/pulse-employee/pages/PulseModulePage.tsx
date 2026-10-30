import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Focus,
  List,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useMarkPulseModuleViewed,
  useMarkPulsePageViewed,
  usePulseModule,
  usePulseOverview,
  useSubmitPulseModuleQuiz,
} from '@/hooks/use-pulse';
import type { PulseModuleDetail, PulseModuleQuiz, PulseQuizResult } from '@/services/pulse.service';
import { LessonSlide } from '../components/LessonSlide';
import { AskReviewerModal } from '../components/AskReviewerModal';
import { Bar, LoadError, PageSkeleton, PuLink } from '../components/ui';
import { btn } from '../lib/button';
import { BLOCK_MESSAGES, levelName, pad2, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';
import '../pulse-lesson.css';

function toSentenceCase(str: string): string {
  if (!str) return '';
  const trimmed = str.trim();
  const isAllUpper = trimmed === trimmed.toUpperCase() && trimmed !== trimmed.toLowerCase();
  if (!isAllUpper) return trimmed;
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/**
 * PulseModulePage — Không gian học tập (Module Reader) V2
 * - Chuẩn hóa bố cục 2 cột thoáng đãng: giải phóng không gian chữ đọc (max-w-3xl, ~720px).
 * - Mục lục khóa học bên trái có độ tương phản cao (text-slate-600/700 >= 12px).
 * - Thanh điều hướng phân trang 1 hàng duy nhất ở chân bài đọc: Bài trước · 01/04 · Bài tiếp theo.
 * - Luồng học tập tuần tự: Đọc đủ các trang bài giảng mới mở khóa bài kiểm tra mini-quiz.
 * - Loại bỏ toàn bộ prompt kỹ thuật Canva/Figma thô, tập trung vào kiến thức cốt lõi.
 */
export function PulseModulePage() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const { data, isLoading, error, refetch } = usePulseModule(courseId, moduleId);

  if (isLoading) return <PageSkeleton blocks={[60, 520, 240]} />;
  if (error || !data) {
    return <LoadError message={pulseErrorMessage(error, 'Không mở được mô đun này.')} onRetry={() => refetch()} />;
  }

  return <ModuleView key={data.module.moduleId} detail={data} />;
}

function ModuleView({ detail }: { detail: PulseModuleDetail }) {
  const { course, module, slides } = detail;
  const courseId = course.courseId;
  const [index, setIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const markViewed = useMarkPulseModuleViewed();
  const markPage = useMarkPulsePageViewed();
  const marked = useRef(detail.viewed);
  const playerRef = useRef<HTMLDivElement>(null);
  const { data: overview } = usePulseOverview();
  const reviewerName = overview?.reviewer?.name ?? 'Quản lý phụ trách';
  const reviewerRole = overview?.reviewer?.role ?? 'Quản lý phòng ban · Người đánh giá';
  const canRecord = !detail.sample && course.canWork;
  const slide = slides[index];
  const isLast = index === slides.length - 1;
  const total = detail.modules.length;
  const review = detail.review && !detail.review.done ? detail.review : null;

  const status = detail.quizPassed
    ? 'Đã đạt câu hỏi ôn tập'
    : detail.sample
    ? 'Trang mẫu'
    : detail.quizBlockReason === 'PREVIOUS_MODULE_REQUIRED'
    ? 'Cần đạt mô đun trước'
    : review
    ? 'Xem lại trang trước khi làm lại'
    : detail.viewed
    ? 'Sẵn sàng làm câu hỏi ôn tập'
    : 'Đang đọc nội dung bài giảng';

  // Chuyển tới một trang bài đọc
  const goTo = (target: number) => {
    if (target < 0 || target >= slides.length) return;
    setIndex(target);
    const page = slides[target];
    if (!page || !canRecord || !review?.pages.some((p) => p.lessonId === page.lessonId && !p.done) || markPage.isPending) {
      return;
    }
    markPage.mutate(
      { courseId, moduleId: module.moduleId, lessonId: page.lessonId },
      { onError: (err) => toast.error(pulseErrorMessage(err, 'Chưa ghi nhận được trang đã xem lại.')) },
    );
  };

  const openPage = (target: number) => {
    goTo(target);
    playerRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  };

  // Đọc tới trang cuối → ghi nhận đã xem (mở câu hỏi ôn tập)
  useEffect(() => {
    if (!isLast || !canRecord || marked.current) return;
    marked.current = true;
    markViewed.mutate(
      { courseId, moduleId: module.moduleId },
      {
        onError: (err) => {
          marked.current = false;
          toast.error(pulseErrorMessage(err, 'Chưa lưu được tiến độ đọc.'));
        },
      },
    );
  }, [isLast, canRecord, courseId, module.moduleId, markViewed]);

  const formattedModuleTitle = toSentenceCase(module.title);

  return (
    <div className={`pu-learning-space ${focused ? 'is-focused' : ''}`}>
      {/* ── 1. Breadcrumb & Progress Header ───────────────────────────── */}
      <div className="pu-crumb">
        <Link to={PULSE_PATHS.course(courseId)}>← Tổng quan khóa học</Link>
        <span>·</span>
        <span>{course.domainName}</span>
        <span>·</span>
        <span>Cấp độ {levelName(course.tier)}</span>
      </div>

      <div className="pu-progress">
        <span>Mô-đun {pad2(module.index + 1)} / {pad2(total)}</span>
        <Bar
          value={((module.index + (detail.quizPassed ? 1 : 0)) / Math.max(1, total)) * 100}
          label="Tiến độ trong khóa"
        />
        <strong>{status}</strong>
      </div>

      {/* ── 2. Course Layout (Sidebar + Reading Area) ─────────────────── */}
      <div className="pu-module-layout">
        {/* Left Course Outline Navigation */}
        <nav className="pu-module-nav" aria-label="Đề cương các mô đun trong khóa học">
          <div className="pu-nav-head">Đề cương khóa học</div>

          {detail.modules.map((item) => {
            const isActive = item.moduleId === module.moduleId;
            return item.viewable ? (
              <Link
                key={item.moduleId}
                to={PULSE_PATHS.module(courseId, item.moduleId)}
                className={`pu-nav-item ${isActive ? 'active' : ''} ${item.passed ? 'passed' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <b className="pu-nav-num">
                  {item.passed ? <Check size={13} strokeWidth={3} /> : pad2(item.index + 1)}
                </b>
                <span className="pu-nav-text">
                  <strong>{toSentenceCase(item.title)}</strong>
                  <small className={item.passed ? 'passed' : isActive ? 'active' : ''}>
                    {item.passed ? '✓ Đã đạt bài ôn tập' : isActive ? '● Bạn đang học' : '4 bài đọc · 2 câu ôn tập'}
                  </small>
                </span>
              </Link>
            ) : (
              <span key={item.moduleId} className="pu-nav-locked">
                <b className="pu-nav-num"><Lock size={12} /></b>
                <span className="pu-nav-text">
                  <strong>{toSentenceCase(item.title)}</strong>
                  <small>Học theo thứ tự</small>
                </span>
              </span>
            );
          })}

          <div className="pu-nav-final">
            <div className="pu-nav-item" style={{ cursor: 'default' }}>
              <b className="pu-nav-num">{pad2(total + 1)}</b>
              <span className="pu-nav-text">
                <strong>Bài thi cuối khóa</strong>
                <small>Giám sát trực tuyến · Quản lý chấm</small>
              </span>
            </div>
            <Link to={PULSE_PATHS.final(courseId)} className="pu-nav-final-btn">
              Xem tiêu chí bài cuối →
            </Link>
          </div>
        </nav>

        {/* Main Reading Main Area */}
        <main className="pu-module-main">
          <header className="pu-module-title">
            <span className="pu-eyebrow">
              {course.domainName} · Cấp độ {levelName(course.tier)}
              {detail.sample ? ' · Trang mẫu' : ''}
            </span>
            <h1>{formattedModuleTitle}</h1>
            {module.description && <p>{module.description}</p>}
          </header>

          {slide ? (
            <div
              className="pu-lesson-player"
              aria-label="Trang nội dung của mô đun"
              ref={playerRef}
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                  event.preventDefault();
                  goTo(index + (event.key === 'ArrowRight' ? 1 : -1));
                }
              }}
            >
              {/* Top Reading Toolbar */}
              <div className="pu-lesson-toolbar">
                <span>
                  <span className="pu-lesson-live-dot" />
                  Không gian học tập chuẩn
                </span>
                <div className="pu-lesson-toolbar-actions">
                  <button
                    type="button"
                    className="pu-ask-reviewer-btn"
                    onClick={() => setAskOpen(true)}
                    title={`Gửi câu hỏi trực tiếp tới ${reviewerName}`}
                  >
                    <MessageSquare size={14} />
                    <span>Hỏi quản lý: {reviewerName}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFocused(!focused)}
                    aria-pressed={focused}
                    title={focused ? 'Mở lại mục lục khóa học' : 'Ẩn mục lục để tập trung đọc'}
                  >
                    {focused ? <List size={15} /> : <Focus size={15} />}
                    <span>{focused ? 'Hiện mục lục' : 'Tập trung đọc'}</span>
                  </button>
                </div>
              </div>

              {/* Lesson Slide Content & Key Takeaways */}
              <LessonSlide
                key={slide.lessonId}
                slide={slide}
                courseCode={course.code}
                moduleIndex={module.index}
                index={index}
                count={slides.length}
              />

              {/* ── Single Unified Pagination Bar (Sticky to Viewport Bottom) ── */}
              <div className="pu-lesson-nav-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    className="pu-nav-action-btn prev"
                    onClick={() => openPage(index - 1)}
                    disabled={index === 0}
                    aria-label="Bài trước"
                  >
                    <ArrowLeft size={16} />
                    <span>Bài trước</span>
                  </button>
                  <button
                    type="button"
                    className="pu-nav-ask-btn"
                    onClick={() => setAskOpen(true)}
                    title={`Gửi câu hỏi tới Quản lý ${reviewerName}`}
                  >
                    <MessageSquare size={14} />
                    <span>Hỏi quản lý</span>
                  </button>
                </div>

                <div className="pu-nav-center-group">
                  <span className="pu-nav-page-indicator">
                    Trang {pad2(index + 1)} / {pad2(slides.length)}
                  </span>
                  <nav className="pu-nav-pills" aria-label="Chọn nhanh trang bài học">
                    {slides.map((page, pageIndex) => (
                      <button
                        key={page.lessonId}
                        type="button"
                        onClick={() => openPage(pageIndex)}
                        className={`pu-nav-pill-btn ${pageIndex === index ? 'active' : ''}`}
                        aria-current={pageIndex === index ? 'step' : undefined}
                        aria-label={`Trang ${pad2(pageIndex + 1)}: ${page.title}`}
                        title={page.title}
                      >
                        {pad2(pageIndex + 1)}
                      </button>
                    ))}
                  </nav>
                </div>

                {isLast ? (
                  <button
                    type="button"
                    className="pu-nav-action-btn next quiz-cta"
                    onClick={() => {
                      document.getElementById('pu-module-quiz')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    <span>Làm bài ôn tập ({detail.quiz?.questions.length ?? 2} câu)</span>
                    <ArrowDown size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="pu-nav-action-btn next"
                    onClick={() => openPage(index + 1)}
                    aria-label="Bài tiếp theo"
                  >
                    <span>Bài tiếp theo</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="pu-quiz-locked-card">
              <AlertCircle size={20} className="text-amber-500" />
              <p>Mô đun này hiện chưa có trang bài giảng.</p>
            </div>
          )}

          {/* ── Callout: Gợi ý áp dụng cho vị trí nhân sự ──────────── */}
          <div className="pu-reflection-box">
            <div className="pu-reflection-head">
              <span className="pu-reflection-badge">💡 Gợi ý áp dụng thực tế</span>
              <span className="pu-reflection-target">
                Vị trí: {overview?.person.positionName ?? 'Chuyên viên Kế toán tài chính'}
              </span>
            </div>
            <p>
              Hãy liên hệ một nghiệp vụ thực tế trong công việc hàng ngày mà bạn có thể áp dụng ngay kiến thức của bài học này (chuẩn hóa định dạng, trích dẫn nguồn và kiểm chứng minh chứng). Đây sẽ là tư liệu hữu ích cho bài thi đánh giá cuối khóa.
            </p>
          </div>

          {/* ── Sequential Quiz Flow: Mở khóa tuần tự ở trang cuối ──── */}
          <div id="pu-module-quiz" className="pu-lesson-quiz-anchor">
            {!isLast && !detail.quizPassed && !detail.review ? (
              <div className="pu-quiz-locked-card">
                <div className="pu-quiz-locked-left">
                  <div className="pu-quiz-lock-icon">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h4>Câu hỏi ôn tập mô-đun {pad2(module.index + 1)} ({detail.quiz?.questions.length ?? 2} câu trắc nghiệm)</h4>
                    <p>
                      Vui lòng đọc tuần tự các trang bài giảng (Đang ở trang {pad2(index + 1)} / {pad2(slides.length)}) để mở khóa bài kiểm tra kiến thức cuối mô-đun.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="pu-quiz-unlock-step-btn"
                  onClick={() => openPage(slides.length - 1)}
                >
                  Đến trang 4 để mở khóa →
                </button>
              </div>
            ) : (
              <QuizArea
                detail={detail}
                viewed={detail.viewed || (markViewed.isSuccess && canRecord)}
                reachedEnd={isLast}
                onOpenPage={openPage}
                opening={markPage.isPending}
              />
            )}
          </div>
        </main>
      </div>

      {/* ── Ask Reviewer Modal ─────────────────────────────────────────── */}
      <AskReviewerModal
        open={askOpen}
        onClose={() => setAskOpen(false)}
        reviewerName={reviewerName}
        reviewerRole={reviewerRole}
        courseCode={course.code}
        courseTitle={course.title}
        moduleTitle={module.title}
        slideIndex={index}
        slideTitle={slide?.title}
      />
    </div>
  );
}

interface QuizAreaProps {
  detail: PulseModuleDetail;
  viewed: boolean;
  reachedEnd: boolean;
  onOpenPage: (index: number) => void;
  opening: boolean;
}

function QuizArea({ detail, viewed, reachedEnd, onOpenPage, opening }: QuizAreaProps) {
  const { course } = detail;
  const nextPath = detail.nextModuleId
    ? PULSE_PATHS.module(course.courseId, detail.nextModuleId)
    : PULSE_PATHS.final(course.courseId);
  const nextLabel = detail.nextModuleId ? 'Học mô-đun tiếp theo →' : 'Đến bài thi cuối khóa →';

  if (detail.quizPassed || (!detail.quiz && !detail.quizBlockReason && viewed && !detail.sample && course.canWork)) {
    const score = detail.lastQuiz;
    return (
      <div className="pu-passed">
        <span aria-hidden>
          <CheckCircle2 size={24} />
        </span>
        <div>
          <strong>
            {detail.quiz || score
              ? `Đã đạt câu hỏi ôn tập${score ? ` (đúng ${score.score}/${score.total} câu)` : ''}`
              : 'Đã hoàn thành nội dung bài học'}
          </strong>
          <p>
            Tiến độ đã được lưu thành công. {detail.nextModuleId ? 'Mô đun tiếp theo đã sẵn sàng.' : 'Bạn đã sẵn sàng cho bài thi cuối khóa.'}
          </p>
        </div>
        <PuLink to={nextPath} small>
          {nextLabel}
        </PuLink>
      </div>
    );
  }

  if (detail.review && !detail.review.done) {
    return <ReviewPanel detail={detail} onOpenPage={onOpenPage} opening={opening} />;
  }

  if (detail.sample || detail.quizBlockReason || !detail.quiz) {
    const reason = detail.quizBlockReason;
    return (
      <div className="pu-quiz-locked-card">
        <AlertCircle size={20} className="text-amber-500" />
        <p>
          {reason
            ? BLOCK_MESSAGES[reason]
            : detail.sample
            ? BLOCK_MESSAGES.SEAT_REQUIRED
            : 'Mô đun này chưa có câu hỏi ôn tập.'}
        </p>
        {(reason === 'PRE_ASSESSMENT_REQUIRED' || reason === 'PRE_ASSESSMENT_PENDING') && (
          <PuLink to={PULSE_PATHS.preAssessment(course.courseId)} kind="outline" small>
            Đánh giá trước khi học →
          </PuLink>
        )}
      </div>
    );
  }

  return (
    <QuizForm
      key={detail.quiz.attemptNo}
      detail={detail}
      quiz={detail.quiz}
      viewed={viewed}
      reachedEnd={reachedEnd}
    />
  );
}

function ReviewPanel({
  detail,
  onOpenPage,
  opening,
}: {
  detail: PulseModuleDetail;
  onOpenPage: (index: number) => void;
  opening: boolean;
}) {
  const review = detail.review!;
  const last = detail.lastQuiz;
  return (
    <section className="pu-quiz" aria-labelledby="pu-quiz-title">
      <h2 id="pu-quiz-title">Xem lại nội dung trước lần làm thứ {review.attemptNo + 1}</h2>
      <div className="pu-quiz-feedback" role="status">
        Lần làm thứ {review.attemptNo} chưa đạt{last ? ` (đúng ${last.score}/${last.total} câu)` : ''}. Vui lòng mở lại các trang nội dung chưa đúng bên dưới để củng cố kiến thức. Lần làm tiếp theo sẽ là một bộ câu hỏi khác.
      </div>
      <ul className="pu-review-pages" aria-label="Trang cần xem lại" style={{ listStyle: 'none', padding: 0 }}>
        {review.pages.map((page) => (
          <li
            key={page.lessonId}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              marginBottom: 8,
              background: page.done ? '#f0fdf4' : '#ffffff',
            }}
          >
            <span>
              <b style={{ marginRight: 8 }}>Trang {pad2(page.index + 1)}:</b>
              {page.title}
            </span>
            {page.done ? (
              <small style={{ color: '#166534', fontWeight: 600 }}>
                <Check size={14} style={{ display: 'inline', marginRight: 4 }} /> Đã xem lại
              </small>
            ) : (
              <button
                type="button"
                className={btn('outline', true)}
                onClick={() => onOpenPage(page.index)}
                disabled={opening}
              >
                Mở lại trang {pad2(page.index + 1)} →
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function QuizForm({
  detail,
  quiz,
  viewed,
  reachedEnd,
}: {
  detail: PulseModuleDetail;
  quiz: PulseModuleQuiz;
  viewed: boolean;
  reachedEnd: boolean;
}) {
  const { course, module } = detail;
  const submit = useSubmitPulseModuleQuiz();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PulseQuizResult | null>(null);
  const questions = quiz.questions;
  const answered = questions.filter((q) => answers[q.questionId]).length;

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    submit.mutate(
      {
        courseId: course.courseId,
        moduleId: module.moduleId,
        attemptNo: quiz.attemptNo,
        answers: questions.map((q) => ({ questionId: q.questionId, optionId: answers[q.questionId]! })),
      },
      {
        onSuccess: (res) => {
          setResult(res);
          if (res.passed) {
            toast.success(
              res.allModulesPassed
                ? 'Đã hoàn thành mọi mô đun! Bài thi cuối khóa đã sẵn sàng.'
                : 'Đạt câu hỏi ôn tập! Mô đun tiếp theo đã mở.',
            );
          }
        },
        onError: (err) => toast.error(pulseErrorMessage(err, 'Chưa gửi được câu trả lời.')),
      },
    );
  };

  return (
    <section className="pu-quiz" aria-labelledby="pu-quiz-title">
      <h2 id="pu-quiz-title">Câu hỏi ôn tập mô-đun {pad2(module.index + 1)}</h2>
      {module.quizBankQuestionCount != null && (
        <p>
          Lượt thi này gồm {questions.length} câu được chọn ngẫu nhiên từ ngân hàng {module.quizBankQuestionCount} câu hỏi của mô-đun.
        </p>
      )}
      <p>
        Trả lời đúng tất cả {questions.length} câu để hoàn thành mô-đun. Nếu chưa đạt, bạn có thể xem lại trang bài giảng và làm lại với bộ câu hỏi mới.
      </p>

      {!viewed ? (
        <p style={{ color: '#64748b', fontSize: 13.5 }}>
          {reachedEnd ? 'Đang lưu tiến độ đọc bài giảng…' : 'Vui lòng đọc hết các trang nội dung để mở câu hỏi ôn tập.'}
        </p>
      ) : (
        <form onSubmit={onSubmit}>
          {questions.map((question, qIndex) => (
            <fieldset key={question.questionId}>
              <legend>
                <span>{pad2(qIndex + 1)}</span>
                {question.content}
              </legend>
              {question.options.map((option) => (
                <label key={option.optionId}>
                  <input
                    type="radio"
                    name={question.questionId}
                    value={option.optionId}
                    checked={answers[question.questionId] === option.optionId}
                    onChange={() => {
                      setAnswers((prev) => ({ ...prev, [question.questionId]: option.optionId }));
                      setResult(null);
                    }}
                  />
                  <span>{option.content}</span>
                </label>
              ))}
            </fieldset>
          ))}

          {result && !result.passed && (
            <div className="pu-quiz-feedback" role="alert">
              Kết quả: Đúng {result.score}/{result.total} câu. Bạn cần đúng tất cả các câu để đạt. Hãy xem lại bài giảng và thử lại.
            </div>
          )}

          <button
            type="submit"
            className={btn()}
            disabled={answered < questions.length || submit.isPending}
            style={{ marginTop: 8 }}
          >
            {submit.isPending ? 'Đang chấm điểm…' : 'Nộp bài ôn tập →'}
          </button>
        </form>
      )}
    </section>
  );
}
