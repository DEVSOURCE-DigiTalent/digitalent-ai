import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  Lightbulb,
  List,
  Lock,
  Maximize2,
  MessageSquare,
  PlayCircle,
  Sparkles,
  Target,
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
  const [focused, setFocused] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'reading' | 'quiz'>('reading');
  const [forceRetake, setForceRetake] = useState(false);
  const markViewed = useMarkPulseModuleViewed();
  const markPage = useMarkPulsePageViewed();
  const marked = useRef(detail.viewed);
  const playerRef = useRef<HTMLDivElement>(null);
  const { data: overview } = usePulseOverview();
  const reviewerName = overview?.reviewer?.name ?? 'Người hướng dẫn chuyên môn';
  const reviewerRole = overview?.reviewer?.role ?? 'Người đánh giá học tập';
  const canRecord = !detail.sample && course.canWork;
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
    ? 'Xem lại bài trước khi làm lại'
    : detail.viewed
    ? 'Sẵn sàng làm bài kiểm tra'
    : 'Đang đọc nội dung bài học';

  const progressPct = Math.round(
    ((module.index + (detail.quizPassed ? 1 : 0)) / Math.max(1, total)) * 100
  );

  // Tự động ghi nhận đã xem bài học của chương khi người học mở vào
  useEffect(() => {
    if (!canRecord || marked.current) return;
    marked.current = true;
    markViewed.mutate(
      { courseId, moduleId: module.moduleId },
      {
        onError: () => {
          marked.current = false;
        },
      },
    );
  }, [canRecord, courseId, module.moduleId, markViewed]);

  const scrollToPart = (partNum: number) => {
    const el = document.getElementById(`chapter-part-${partNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleReviewOpenPart = (partIndex: number) => {
    setViewMode('reading');
    setForceRetake(false);
    setTimeout(() => {
      scrollToPart(partIndex + 1);
    }, 100);
    const page = slides[partIndex];
    if (page && canRecord && review?.pages.some((p) => p.lessonId === page.lessonId && !p.done) && !markPage.isPending) {
      markPage.mutate(
        { courseId, moduleId: module.moduleId, lessonId: page.lessonId },
        { onError: (err) => toast.error(pulseErrorMessage(err, 'Chưa ghi nhận được phần đã xem lại.')) },
      );
    }
  };

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
                <strong>Đánh giá cuối khóa</strong>
                <small>Giám sát trực tuyến · 3 tiêu chí</small>
              </div>
            </div>
            <Link to={PULSE_PATHS.final(courseId)} className="pu-nav-final-btn">
              Xem tiêu chí bài cuối →
            </Link>
          </div>
        </nav>

        {/* Khu vực Trình đọc Bài giảng & Làm bài kiểm tra */}
        <main className="pu-module-main">
          {viewMode === 'quiz' ? (
            <div className="pu-dedicated-quiz-page">
              <div className="pu-quiz-screen-header">
                <button
                  type="button"
                  className="pu-quiz-back-btn"
                  onClick={() => {
                    setViewMode('reading');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>← Quay lại bài đọc của chương</span>
                </button>
                <span className="pu-quiz-screen-module-title">
                  Mô-đun {pad2(module.index + 1)}: {formattedModuleTitle}
                </span>
              </div>

              <QuizArea
                detail={detail}
                viewed={true}
                forceRetake={forceRetake}
                onRetake={() => setForceRetake(true)}
                onOpenPart={handleReviewOpenPart}
                opening={markPage.isPending}
                onBackToLesson={() => {
                  setViewMode('reading');
                  setForceRetake(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          ) : (
            <>
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

              {slides.length > 0 ? (
                <div
                  className="pu-lesson-player"
                  aria-label="Toàn bộ giáo trình mô đun"
                  ref={playerRef}
                >
                  {/* Thanh công cụ đầu bài đọc */}
                  <div className="pu-lesson-toolbar">
                    <div className="pu-toolbar-left">
                      <span className="pu-lesson-live-dot" />
                      <span>Bài học trực tuyến</span>
                      <span className="pu-tb-dot" style={{ margin: '0 6px', color: '#cbd5e1' }}>·</span>
                      <span className="pu-tb-sub" style={{ color: '#64748b', fontWeight: 500 }}>
                        Giáo trình chuẩn hóa {slides.length} phần liên tục
                      </span>
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

                  {/* Thanh mục lục nhảy nhanh các phần của chương */}
                  <nav className="pu-chapter-anchors-bar" aria-label="Mục lục các phần trong chương">
                    <div className="pu-cab-left">
                      <BookOpen size={14} className="text-blue-700" />
                      <span className="pu-cab-label">Nội dung chương:</span>
                    </div>

                    <div className="pu-cab-links">
                      {slides.map((s, sIdx) => {
                        const titleShort =
                          sIdx === 0
                            ? '01. Lý thuyết & Quy chuẩn'
                            : sIdx === 1
                            ? '02. Tình huống thực tế'
                            : '03. Cẩm nang tác nghiệp';
                        return (
                          <button
                            key={s.lessonId}
                            type="button"
                            className="pu-cab-anchor-btn"
                            onClick={() => scrollToPart(sIdx + 1)}
                            title={s.title}
                          >
                            <span className="pu-cab-pill-num">{pad2(sIdx + 1)}</span>
                            <span>{titleShort}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      className="pu-cab-quiz-jump-btn"
                      onClick={() => {
                        setViewMode('quiz');
                        setForceRetake(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <Target size={13} />
                      <span>Bài kiểm tra ({detail.quiz?.questions.length ?? 3} câu) →</span>
                    </button>
                  </nav>

                  {/* Luồng đọc liên tục toàn bộ các phần của chương (Không phân trang) */}
                  <div className="pu-chapter-reading-flow">
                    {slides.map((s, sIdx) => (
                      <div
                        key={s.lessonId}
                        id={`chapter-part-${sIdx + 1}`}
                        className="pu-chapter-part-block"
                      >
                        {sIdx > 0 && (
                          <div className="pu-part-divider-strip" aria-hidden="true">
                            <span className="pu-pds-line" />
                            <span className="pu-pds-badge">
                              {sIdx === 1
                                ? 'Phần 02 · Nghiên cứu tình huống thực tế (Case study)'
                                : 'Phần 03 · Cẩm nang tác nghiệp & Tiêu chuẩn bàn giao (Job Aid)'}
                            </span>
                            <span className="pu-pds-line" />
                          </div>
                        )}
                        <LessonSlide
                          slide={s}
                          courseCode={course.code}
                          moduleIndex={module.index}
                          index={sIdx}
                          count={slides.length}
                          hideMedia={sIdx > 0}
                          partNumber={sIdx + 1}
                          partTitle={
                            sIdx === 0
                              ? 'Phần 01 · Lý thuyết nền tảng & Quy chuẩn số'
                              : sIdx === 1
                              ? 'Phần 02 · Nghiên cứu tình huống thực tế (Case study)'
                              : 'Phần 03 · Cẩm nang tác nghiệp & Tiêu chuẩn bàn giao'
                          }
                        />
                      </div>
                    ))}
                  </div>

                  {/* Banner hoàn thành hoặc nút chuyển tiếp sang làm bài trắc nghiệm cuối chương */}
                  {detail.quizPassed ? (
                    <div className="pu-module-completion-card">
                      <div className="pu-mcc-left">
                        <CheckCircle2 size={24} className="text-emerald-600 flex-shrink-0" />
                        <div>
                          <h4>Mô-đun {pad2(module.index + 1)} đã hoàn thành!</h4>
                          <p>Bạn đã hoàn thành nội dung giáo trình và đạt bài kiểm tra củng cố năng lực.</p>
                        </div>
                      </div>
                      <div className="pu-mcc-actions">
                        <button
                          type="button"
                          className="pu-btn-outline small"
                          onClick={() => {
                            setViewMode('quiz');
                            setForceRetake(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          Làm lại bài kiểm tra
                        </button>
                        {detail.nextModuleId ? (
                          <Link
                            to={PULSE_PATHS.module(courseId, detail.nextModuleId)}
                            className="pu-btn-primary small"
                          >
                            Học mô-đun tiếp theo →
                          </Link>
                        ) : (
                          <Link
                            to={PULSE_PATHS.final(courseId)}
                            className="pu-btn-primary small"
                          >
                            Đến bài đánh giá cuối khóa →
                          </Link>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="pu-module-ready-quiz-banner">
                      <div className="pu-mrqb-left">
                        <div className="pu-mrqb-icon-wrap">
                          <Target size={22} className="text-blue-700" />
                        </div>
                        <div>
                          <h4>Hoàn thành nội dung giáo trình chương {pad2(module.index + 1)}</h4>
                          <p>
                            Bạn đã nghiên cứu toàn bộ lý thuyết, tình huống thực tế và cẩm nang tác nghiệp. Hãy làm bài kiểm tra gồm {detail.quiz?.questions.length ?? 3} câu trắc nghiệm để hoàn tất mô-đun và mở khóa bài tiếp theo.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="pu-mrqb-btn"
                        onClick={() => {
                          setViewMode('quiz');
                          setForceRetake(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <span>Bắt đầu bài kiểm tra ({detail.quiz?.questions.length ?? 3} câu trắc nghiệm)</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pu-quiz-locked-card">
                  <AlertCircle size={20} className="text-amber-500" />
                  <p>Mô đun này hiện chưa có nội dung bài học.</p>
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
                  Hãy liên hệ một nghiệp vụ thực tế trong công việc hàng ngày mà bạn có thể áp dụng ngay kiến thức của bài học này (chuẩn hóa định dạng, trích dẫn nguồn và kiểm chứng minh chứng). Đây sẽ là tư liệu hữu ích cho bài đánh giá năng lực cuối khóa.
                </p>
              </div>
            </>
          )}
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
        slideIndex={0}
        slideTitle={slides[0]?.title}
      />
    </div>
  );
}

interface QuizAreaProps {
  detail: PulseModuleDetail;
  viewed: boolean;
  reachedEnd?: boolean;
  onOpenPart?: (partIndex: number) => void;
  opening: boolean;
  onBackToLesson?: () => void;
  forceRetake?: boolean;
  onRetake?: () => void;
}

function QuizArea({ detail, viewed, reachedEnd, onOpenPart, opening, onBackToLesson, forceRetake, onRetake }: QuizAreaProps) {
  const { course } = detail;
  const nextPath = detail.nextModuleId
    ? PULSE_PATHS.module(course.courseId, detail.nextModuleId)
    : PULSE_PATHS.final(course.courseId);
  const nextLabel = detail.nextModuleId ? 'Học mô-đun tiếp theo →' : 'Đến bài đánh giá cuối khóa →';

  if (!forceRetake && (detail.quizPassed || (!detail.quiz && !detail.quizBlockReason && viewed && !detail.sample && course.canWork))) {
    const score = detail.lastQuiz;
    return (
      <section className="pu-quiz-passed-view" aria-labelledby="pu-quiz-passed-title">
        <div className="pu-qpv-card">
          <div className="pu-qpv-badge">
            <CheckCircle2 size={15} className="text-emerald-700" />
            <span>Mô-đun {pad2(detail.module.index + 1)} · Đạt chuẩn năng lực</span>
          </div>
          <h2 id="pu-quiz-passed-title" className="pu-qpv-title">
            Hoàn thành xuất sắc bài kiểm tra!
          </h2>
          <p className="pu-qpv-desc">
            {detail.quiz || score
              ? `Bạn đã đạt bài kiểm tra củng cố${score ? ` (đúng ${score.score}/${score.total} câu)` : ''}. Tiến độ học tập đã được lưu thành công.`
              : 'Bạn đã hoàn thành nội dung bài học này. Tiến độ đã được lưu thành công.'}
          </p>

          <div className="pu-qpv-actions">
            {onBackToLesson && (
              <button
                type="button"
                className="pu-btn-outline"
                onClick={onBackToLesson}
              >
                ← Xem lại bài học
              </button>
            )}
            {detail.quiz && onRetake && (
              <button
                type="button"
                className="pu-btn-outline"
                onClick={onRetake}
              >
                Luyện tập lại đề trắc nghiệm
              </button>
            )}
            <Link to={nextPath} className="pu-btn-primary">
              {nextLabel}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (detail.review && !detail.review.done) {
    return <ReviewPanel detail={detail} onOpenPart={onOpenPart} opening={opening} onBackToLesson={onBackToLesson} />;
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
      reachedEnd={reachedEnd ?? true}
      onBackToLesson={onBackToLesson}
    />
  );
}

function ReviewPanel({
  detail,
  onOpenPart,
  opening,
  onBackToLesson,
}: {
  detail: PulseModuleDetail;
  onOpenPart?: (partIndex: number) => void;
  opening: boolean;
  onBackToLesson?: () => void;
}) {
  const review = detail.review!;
  const last = detail.lastQuiz;
  return (
    <section className="pu-quiz-card" aria-labelledby="pu-quiz-title">
      <div className="pu-quiz-card-header">
        <div className="pu-quiz-header-badge" style={{ background: '#fef3c7', borderColor: '#fde68a', color: '#b45309' }}>
          <AlertCircle size={13} className="text-amber-700" />
          <span>Cần ôn tập trước lần làm thứ {review.attemptNo + 1}</span>
        </div>
        <h2 id="pu-quiz-title" className="pu-quiz-main-title">
          Xem lại nội dung cần củng cố
        </h2>
        <div className="pu-quiz-feedback-box failed" role="status">
          <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
          <div>
            <strong>Lần làm thứ {review.attemptNo} chưa đạt{last ? ` (đúng ${last.score}/${last.total} câu)` : ''}</strong>
            <p>
              Vui lòng xem lại các phần nội dung dưới đây để nắm chắc kiến thức trước khi làm lại với bộ câu hỏi mới.
            </p>
          </div>
        </div>
      </div>

      <div className="pu-review-pages-list" style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '20px 0' }}>
        {review.pages.map((page) => (
          <div
            key={page.lessonId}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
            }}
          >
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', display: 'block' }}>
                Phần {pad2(page.index + 1)}
              </span>
              <strong style={{ fontSize: 14, color: '#0f172a' }}>{page.title}</strong>
            </div>
            {page.done ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#16a34a', fontSize: 13, fontWeight: 600 }}>
                <CheckCircle2 size={16} /> Đã xem lại
              </span>
            ) : (
              <button
                type="button"
                className="pu-btn-outline small"
                onClick={() => onOpenPart?.(page.index)}
                disabled={opening}
              >
                Xem lại phần này →
              </button>
            )}
          </div>
        ))}
      </div>

      {onBackToLesson && (
        <button type="button" className="pu-btn-outline" onClick={onBackToLesson}>
          ← Quay lại bài học
        </button>
      )}
    </section>
  );
}

function QuizForm({
  detail,
  quiz,
  viewed,
  reachedEnd,
  onBackToLesson,
}: {
  detail: PulseModuleDetail;
  quiz: PulseModuleQuiz;
  viewed: boolean;
  reachedEnd: boolean;
  onBackToLesson?: () => void;
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
                ? 'Đã hoàn thành mọi mô đun! Bài đánh giá cuối khóa đã sẵn sàng.'
                : 'Đạt câu hỏi kiểm tra! Mô đun tiếp theo đã mở.',
            );
          }
        },
        onError: (err) => toast.error(pulseErrorMessage(err, 'Chưa gửi được câu trả lời.')),
      },
    );
  };

  const nextPath = detail.nextModuleId
    ? PULSE_PATHS.module(course.courseId, detail.nextModuleId)
    : PULSE_PATHS.final(course.courseId);
  const nextLabel = detail.nextModuleId ? 'Học mô-đun tiếp theo →' : 'Đến bài đánh giá cuối khóa →';

  // Khi đã submit và đạt
  if (result?.passed) {
    return (
      <section className="pu-quiz-passed-view" aria-labelledby="pu-quiz-passed-title">
        <div className="pu-qpv-card">
          <div className="pu-qpv-badge">
            <CheckCircle2 size={15} className="text-emerald-700" />
            <span>Mô-đun {pad2(module.index + 1)} · Đạt chuẩn năng lực</span>
          </div>
          <h2 id="pu-quiz-passed-title" className="pu-qpv-title">
            Hoàn thành xuất sắc bài kiểm tra!
          </h2>
          <p className="pu-qpv-desc">
            Bạn đã trả lời đúng {result.score}/{result.total} câu hỏi. Kết quả đã được ghi nhận tự động vào lộ trình học tập của bạn.
          </p>

          <div className="pu-qpv-actions">
            {onBackToLesson && (
              <button
                type="button"
                className="pu-btn-outline"
                onClick={onBackToLesson}
              >
                ← Xem lại bài học
              </button>
            )}
            <Link to={nextPath} className="pu-btn-primary">
              {nextLabel}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <section className="pu-quiz-card" aria-labelledby="pu-quiz-title">
      <div className="pu-quiz-card-header">
        <div className="pu-quiz-header-badge">
          <Sparkles size={13} className="text-blue-700" />
          <span>Câu hỏi kiểm tra mô-đun {pad2(module.index + 1)}</span>
        </div>
        <h2 id="pu-quiz-title" className="pu-quiz-main-title">
          Kiểm tra củng cố: {toSentenceCase(module.title)}
        </h2>

        <div className="pu-quiz-meta-chips">
          <span className="pu-quiz-chip">
            <BookOpen size={13} className="text-blue-700" />
            {questions.length} câu trắc nghiệm ngẫu nhiên
          </span>
          <span className="pu-quiz-chip highlight">
            <Target size={13} className="text-emerald-700" />
            Yêu cầu: Đúng {questions.length}/{questions.length} câu
          </span>
          <span className="pu-quiz-chip">
            <Clock3 size={13} className="text-slate-500" />
            Không giới hạn lượt làm
          </span>
        </div>

        <p className="pu-quiz-lead-text">
          Lượt kiểm tra này gồm {questions.length} câu được chọn ngẫu nhiên từ ngân hàng câu hỏi của mô-đun.
          Trả lời đúng tất cả {questions.length} câu để hoàn thành mô-đun. Nếu chưa đạt, bạn có thể xem lại bài học và làm lại với bộ câu hỏi mới.
        </p>
      </div>

      {!viewed ? (
        <div className="pu-quiz-waiting-view" style={{ padding: '20px 0', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            {reachedEnd ? 'Đang lưu tiến độ học tập…' : 'Vui lòng đọc hết các trang nội dung để mở câu hỏi kiểm tra.'}
          </p>
          {onBackToLesson && (
            <button type="button" className="pu-btn-outline" onClick={onBackToLesson} style={{ marginTop: 12 }}>
              ← Quay lại đọc nội dung bài học
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="pu-quiz-questions-list">
            {questions.map((question, qIndex) => (
              <fieldset key={question.questionId} className="pu-quiz-question-card">
                <legend className="pu-quiz-question-legend">
                  <span className="pu-q-num-pill">{pad2(qIndex + 1)}</span>
                  <span className="pu-q-text">{question.content}</span>
                </legend>
                <div className="pu-quiz-options-group">
                  {question.options.map((option, optIdx) => {
                    const isSelected = answers[question.questionId] === option.optionId;
                    return (
                      <label
                        key={option.optionId}
                        className={`pu-quiz-option-item ${isSelected ? 'is-selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name={question.questionId}
                          value={option.optionId}
                          checked={isSelected}
                          onChange={() => {
                            setAnswers((prev) => ({ ...prev, [question.questionId]: option.optionId }));
                            setResult(null);
                          }}
                        />
                        <span className="pu-opt-letter-circle">{optionLetters[optIdx] ?? (optIdx + 1)}</span>
                        <span className="pu-opt-text">{option.content}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          {result && !result.passed && (
            <div className="pu-quiz-feedback-box failed" role="alert">
              <AlertCircle size={20} className="text-rose-600 flex-shrink-0" />
              <div>
                <strong>Chưa đạt yêu cầu: Đúng {result.score}/{result.total} câu</strong>
                <p>
                  Bạn cần trả lời đúng tất cả các câu để hoàn thành mô-đun. Hãy xem lại bài học hoặc thử lại với bộ câu hỏi mới.
                </p>
                <div className="pu-feedback-actions" style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  {onBackToLesson && (
                    <button
                      type="button"
                      className="pu-btn-outline small"
                      onClick={onBackToLesson}
                    >
                      ← Xem lại bài học
                    </button>
                  )}
                  <button
                    type="button"
                    className="pu-btn-outline small"
                    onClick={() => {
                      setAnswers({});
                      setResult(null);
                    }}
                  >
                    Làm lại bài kiểm tra
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="pu-quiz-submit-row">
            <button
              type="submit"
              className="pu-quiz-submit-btn"
              disabled={answered < questions.length || submit.isPending}
            >
              {submit.isPending ? (
                'Đang kiểm tra kết quả…'
              ) : answered < questions.length ? (
                `Vui lòng chọn đủ câu trả lời (${answered}/${questions.length})`
              ) : (
                `Nộp bài kiểm tra (${answered}/${questions.length} câu) →`
              )}
            </button>
            {onBackToLesson && (
              <button
                type="button"
                className="pu-quiz-cancel-btn"
                onClick={onBackToLesson}
              >
                Xem lại bài học
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
