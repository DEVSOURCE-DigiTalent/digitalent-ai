import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  List,
  Lock,
  Maximize2,
  MessageSquare,
  PlayCircle,
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
import { LoadError, PageSkeleton, PuLink } from '../components/ui';
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
 * PulseModulePage — Không gian Học tập & Đọc bài giảng (Module Reader V2)
 * Thiết kế Enterprise SaaS chuẩn Brand Blue (#1e40af), Zero Emoji, Vector SVG:
 * 1. Header Canvas tinh gọn với Breadcrumb và Thanh tiến độ khóa học mini
 * 2. Cột Đề cương bên trái dạng Curriculum Playlist (Active/Passed/Locked/Final Exam)
 * 3. Trình đọc bài giảng tập trung, thanh công cụ hỏi hỗ trợ & phóng to
 * 4. Thanh điều hướng phân trang mượt mà (Trang trước · Trang XX/YY · Trang sau / Làm quiz)
 * 5. Khối ôn tập Mini-quiz tuần tự mở khóa sau khi đọc xong
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
  const reviewerName = overview?.reviewer?.name ?? 'Người hướng dẫn chuyên môn';
  const reviewerRole = overview?.reviewer?.role ?? 'Người đánh giá học tập';
  const canRecord = !detail.sample && course.canWork;
  const slide = slides[index];
  const isLast = index === slides.length - 1;
  const total = detail.modules.length;
  const passedCount = detail.modules.filter((m) => m.passed).length;
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

  const progressPct = Math.round(
    ((module.index + (detail.quizPassed ? 1 : 0)) / Math.max(1, total)) * 100
  );

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
      {/* ── 1. Header Canvas & Thanh tiến độ mini ───────────────────────── */}
      <header className="pu-m-header-block">
        <div className="pu-m-header-top">
          <nav className="pu-m-breadcrumb" aria-label="Điều hướng">
            <Link to={PULSE_PATHS.path} className="pu-m-back-link">
              <ArrowLeft size={14} />
              <span>Lộ trình năng lực</span>
            </Link>
            <ChevronRight size={13} className="pu-m-bc-separator" aria-hidden />
            <Link to={PULSE_PATHS.course(courseId)} className="pu-m-bc-course">
              {toSentenceCase(course.title)}
            </Link>
            <ChevronRight size={13} className="pu-m-bc-separator" aria-hidden />
            <span className="pu-m-bc-tag">{course.domainName} · Cấp {course.tier}</span>
          </nav>
        </div>

        <div className="pu-m-progress-strip">
          <div className="pu-m-prog-left">
            <span className="pu-m-prog-kicker">Mô-đun {pad2(module.index + 1)} / {pad2(total)}</span>
            <span className="pu-m-prog-dot" />
            <span className="pu-m-prog-status">{status}</span>
          </div>

          <div className="pu-m-prog-center">
            <div className="pu-m-prog-bar-track">
              <div
                className="pu-m-prog-bar-fill"
                style={{
                  width: `${progressPct}%`,
                  backgroundColor: detail.quizPassed ? '#059669' : '#1e40af',
                }}
              />
            </div>
            <span className="pu-m-prog-pct">{progressPct}%</span>
          </div>
        </div>
      </header>

      {/* ── 2. Bố cục 2 Cột: Mục lục Khóa học + Khu vực Đọc bài giảng ─── */}
      <div className="pu-module-layout">
        {/* Cột Mục lục Đề cương bên trái (Curriculum Playlist) */}
        <nav className="pu-module-nav" aria-label="Đề cương các mô-đun trong khóa học">
          <div className="pu-nav-head">
            <span>Đề cương khóa học</span>
            <span className="pu-nav-count">{passedCount}/{total} đã đạt</span>
          </div>

          <div className="pu-nav-list">
            {detail.modules.map((item) => {
              const isActive = item.moduleId === module.moduleId;
              const isPassed = item.passed;

              return item.viewable ? (
                <Link
                  key={item.moduleId}
                  to={PULSE_PATHS.module(courseId, item.moduleId)}
                  className={`pu-nav-item ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <b className="pu-nav-num">
                    {isPassed ? (
                      <Check size={12} strokeWidth={3} className="text-emerald-700" />
                    ) : isActive ? (
                      <PlayCircle size={12} className="text-blue-700" />
                    ) : (
                      pad2(item.index + 1)
                    )}
                  </b>
                  <span className="pu-nav-text">
                    <strong>{toSentenceCase(item.title)}</strong>
                    <span className="pu-nav-sub-meta">
                      {isPassed ? (
                        <span className="pu-nav-status passed">Đã đạt câu hỏi ôn tập</span>
                      ) : isActive ? (
                        <span className="pu-nav-status active">Đang học mô-đun này</span>
                      ) : (
                        <span className="pu-nav-status pending">Sẵn sàng học</span>
                      )}
                    </span>
                  </span>
                </Link>
              ) : (
                <div key={item.moduleId} className="pu-nav-item locked">
                  <b className="pu-nav-num">
                    <Lock size={11} className="text-slate-400" />
                  </b>
                  <span className="pu-nav-text">
                    <strong>{toSentenceCase(item.title)}</strong>
                    <span className="pu-nav-sub-meta">
                      <span className="pu-nav-status locked">Khóa theo thứ tự</span>
                    </span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chặng cuối: Kỳ thi đánh giá năng lực cuối khóa */}
          <div className="pu-nav-final">
            <div className="pu-nav-final-card">
              <div className="pu-nav-final-icon">
                <GraduationCap size={16} />
              </div>
              <div className="pu-nav-final-info">
                <strong>Kỳ thi cuối khóa</strong>
                <small>Giám sát trực tuyến · 3 tiêu chí</small>
              </div>
            </div>
            <Link to={PULSE_PATHS.final(courseId)} className="pu-nav-final-btn">
              Xem tiêu chí bài cuối →
            </Link>
          </div>
        </nav>

        {/* Khu vực Trình đọc Bài giảng Chính */}
        <main className="pu-module-main">
          {/* Tiêu đề Mô-đun Canvas */}
          <div className="pu-module-title-strip">
            <div className="pu-eyebrow-row">
              <span className="pu-eyebrow-pill">{course.domainName}</span>
              <span className="pu-eyebrow-dot">·</span>
              <span className="pu-eyebrow-tier">Cấp độ {levelName(course.tier)}</span>
              {detail.sample && <span className="pu-eyebrow-sample">Trang mẫu</span>}
            </div>

            <h1 className="pu-module-heading">{formattedModuleTitle}</h1>
            {module.description && <p className="pu-module-desc">{module.description}</p>}
          </div>

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
              {/* Thanh công cụ đầu bài đọc */}
              <div className="pu-lesson-toolbar">
                <div className="pu-toolbar-left">
                  <span className="pu-lesson-live-dot" />
                  <span>Bài học trực tuyến</span>
                </div>

                <div className="pu-lesson-toolbar-actions">
                  <button
                    type="button"
                    className="pu-ask-reviewer-btn"
                    onClick={() => setAskOpen(true)}
                    title="Gửi câu hỏi nghiệp vụ tới người hướng dẫn"
                  >
                    <MessageSquare size={13} />
                    <span>Hỏi người hướng dẫn</span>
                  </button>

                  <button
                    type="button"
                    className="pu-focus-btn"
                    onClick={() => setFocused(!focused)}
                    aria-pressed={focused}
                    title={focused ? 'Mở lại mục lục khóa học' : 'Ẩn mục lục để tập trung đọc'}
                  >
                    {focused ? <List size={13} /> : <Maximize2 size={13} />}
                    <span>{focused ? 'Hiện mục lục' : 'Tập trung đọc'}</span>
                  </button>
                </div>
              </div>

              {/* Nội dung Slide bài giảng */}
              <LessonSlide
                key={slide.lessonId}
                slide={slide}
                courseCode={course.code}
                moduleIndex={module.index}
                index={index}
                count={slides.length}
              />

              {/* Thanh điều hướng phân trang cố định dưới chân bài */}
              <div className="pu-lesson-nav-bar">
                <div className="pu-nav-bar-left">
                  <button
                    type="button"
                    className="pu-nav-action-btn prev"
                    onClick={() => openPage(index - 1)}
                    disabled={index === 0}
                    aria-label="Trang trước"
                  >
                    <ArrowLeft size={14} />
                    <span>Trang trước</span>
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

                <div className="pu-nav-bar-right">
                  {isLast ? (
                    <button
                      type="button"
                      className="pu-nav-action-btn next quiz-cta"
                      onClick={() => {
                        document.getElementById('pu-module-quiz')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      <span>Làm bài ôn tập ({detail.quiz?.questions.length ?? 2} câu)</span>
                      <ArrowDown size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="pu-nav-action-btn next"
                      onClick={() => openPage(index + 1)}
                      aria-label="Trang tiếp theo"
                    >
                      <span>Trang tiếp theo</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="pu-quiz-locked-card">
              <AlertCircle size={20} className="text-amber-500" />
              <p>Mô đun này hiện chưa có trang bài giảng.</p>
            </div>
          )}

          {/* Gợi ý áp dụng cho vị trí nhân sự */}
          <div className="pu-reflection-box">
            <div className="pu-reflection-head">
              <span className="pu-reflection-badge">
                <Lightbulb size={13} className="inline mr-1 text-amber-600" />
                Gợi ý áp dụng thực tế
              </span>
              <span className="pu-reflection-target">
                Vị trí: {overview?.person.positionName ?? 'Chuyên viên Kế toán tài chính'}
              </span>
            </div>
            <p>
              Hãy liên hệ một nghiệp vụ thực tế trong công việc hàng ngày mà bạn có thể áp dụng ngay kiến thức của bài học này (chuẩn hóa định dạng, trích dẫn nguồn và kiểm chứng minh chứng). Đây sẽ là tư liệu hữu ích cho bài thi đánh giá cuối khóa.
            </p>
          </div>

          {/* Khu vực Ôn tập Mini-quiz */}
          <div id="pu-module-quiz" className="pu-lesson-quiz-anchor">
            {!isLast && !detail.quizPassed && !detail.review ? (
              <div className="pu-quiz-locked-card">
                <div className="pu-quiz-locked-left">
                  <div className="pu-quiz-lock-icon">
                    <Lock size={18} />
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
                  Đến trang {pad2(slides.length)} để mở khóa →
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
          <CheckCircle2 size={24} className="text-emerald-700" />
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
