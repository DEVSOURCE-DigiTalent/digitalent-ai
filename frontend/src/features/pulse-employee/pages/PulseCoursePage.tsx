import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  HelpCircle,
  Lock,
  PlayCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { usePulseCourse } from '@/hooks/use-pulse';
import type { PulseCourseDetail } from '@/services/pulse.service';
import { LoadError, PageSkeleton } from '../components/ui';
import { ACCESS_LABELS, levelName, pad2, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

/**
 * Chuyển đổi tiêu đề viết in hoa toàn bộ (ALL-CAPS) thành Sentence case thanh lịch
 * Khắc phục triệt để lỗi đâm dấu tiếng Việt trên các ký tự hoa lớn (Ạ, Ự, Ậ...)
 */
function toSentenceCase(str: string): string {
  if (!str) return '';
  const trimmed = str.trim();
  const isAllUpper = trimmed === trimmed.toUpperCase() && trimmed !== trimmed.toLowerCase();
  if (!isAllUpper) return trimmed;
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/**
 * PulseCoursePage — Chi tiết Khóa học & Đề cương
 * Nâng cấp theo Phương án 1 (Sequential Timeline Stepper):
 * 1. Tiêu đề Canvas thanh thoát viết trực tiếp trên nền (loại bỏ Hero hộp đen cồng kềnh)
 * 2. Cụm Badge tóm tắt nhanh (Thời lượng, Mô đun, Mini-quiz, Thi kết thúc môn)
 * 3. Thẻ Hành động & Mục tiêu Trọng tâm (Chuẩn đầu ra thực tế + Tiến độ % + CTA ưu tiên)
 * 4. Lộ trình Học tập Tuần tự Dọc (Timeline 01 -> 02 -> 03 -> Chặng đích: Kỳ thi Proctored)
 * 5. Chuẩn Brand Blue (#1e40af), Zero emoji, icon SVG vector chuyên nghiệp
 */
export function PulseCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data, isLoading, error, refetch } = usePulseCourse(courseId);

  if (isLoading) return <PageSkeleton blocks={[120, 240, 420]} />;
  if (error || !data) {
    return <LoadError message={pulseErrorMessage(error, 'Không tải được khóa học.')} onRetry={() => refetch()} />;
  }

  return <CourseView detail={data} />;
}

function CourseView({ detail }: { detail: PulseCourseDetail }) {
  const { course, modules } = detail;
  const passed = modules.filter((m) => m.passed).length;
  const quizCount = modules.filter((m) => m.hasQuiz).length;
  const firstOpen = modules.find((m) => !m.passed);
  const tier = levelName(course.tier);
  const approved = course.approved;
  const viaPre = course.approvedVia === 'PRE_ASSESSMENT';
  const preAssessmentPath = PULSE_PATHS.preAssessment(course.courseId);
  const formattedTitle = toSentenceCase(course.title);

  // Tính tổng thời lượng ước tính
  const totalMinutes = modules.reduce((sum, m) => sum + (m.estimatedMinutes || 60), 0);
  const totalHours = Math.ceil(totalMinutes / 60);

  // Trạng thái hành động
  const canPreAssess = course.preStatus === 'REQUIRED' || detail.nextAction === 'PRE_ASSESSMENT';
  const isPrePending = course.preStatus === 'PENDING' || detail.nextAction === 'PRE_REVIEW';
  const isFinalReady = detail.nextAction === 'FINAL' || (!approved && passed === modules.length && modules.length > 0);

  return (
    <div className="pu-course-wrap">
      {/* ── 1. Tiêu đề Canvas Tinh gọn (Viết trực tiếp trên nền) ────────── */}
      <header className="pu-c-header-block">
        <nav className="pu-c-breadcrumb" aria-label="Điều hướng lộ trình">
          <Link to={PULSE_PATHS.path} className="pu-c-back-link">
            <ArrowLeft size={14} />
            <span>Lộ trình năng lực</span>
          </Link>
          <ChevronRight size={13} className="pu-c-bc-separator" aria-hidden />
          <span className="pu-c-bc-domain">{detail.domain.name}</span>
          <ChevronRight size={13} className="pu-c-bc-separator" aria-hidden />
          <span className="pu-c-bc-tag">{course.code} · Cấp {course.tier} ({tier})</span>
        </nav>

        <h1 className="pu-c-main-title">{formattedTitle}</h1>

        <p className="pu-c-main-desc">
          {detail.description?.trim() ||
            `Khóa học chuẩn hóa thuộc lĩnh vực ${detail.domain.name}, cấp độ ${tier}. Cung cấp các kiến thức và kỹ năng thực tế với hệ thống bài giảng tương tác, câu hỏi ôn tập và đánh giá có giám sát.`}
        </p>

        {/* Dải thông số tóm tắt nhanh */}
        <div className="pu-c-meta-row">
          <span className="pu-c-meta-pill">
            <BookOpen size={13} className="text-blue-700" />
            <span>{pad2(modules.length)} mô-đun bài giảng</span>
          </span>
          <span className="pu-c-meta-pill">
            <Clock size={13} className="text-blue-700" />
            <span>Ước tính ~{totalHours > 0 ? pad2(totalHours) : '08'} giờ ({totalMinutes} phút)</span>
          </span>
          <span className="pu-c-meta-pill">
            <HelpCircle size={13} className="text-blue-700" />
            <span>{pad2(quizCount)} bài mini-quiz ôn tập</span>
          </span>
          <span className="pu-c-meta-pill">
            <GraduationCap size={13} className="text-blue-700" />
            <span>01 kỳ thi proctored kết thúc môn</span>
          </span>
          <span className={`pu-c-meta-pill ${approved ? 'approved' : 'access'}`}>
            <ShieldCheck size={13} className={approved ? 'text-emerald-700' : 'text-blue-700'} />
            <span>{approved ? 'Đã công nhận năng lực' : ACCESS_LABELS[course.access] || 'Suất học đã kích hoạt'}</span>
          </span>
        </div>
      </header>

      {/* ── 2. Thẻ Mục tiêu & Hành động Trọng tâm ──────────────────────── */}
      <section className="pu-c-summary-card" aria-labelledby="pu-summary-heading">
        {/* Cột trái: Chuẩn đầu ra thực tế */}
        <div className="pu-c-outcomes-col">
          <div className="pu-c-card-header">
            <Target size={16} className="text-blue-700" />
            <h2 id="pu-summary-heading" className="pu-c-card-heading">
              Mục tiêu & Chuẩn đầu ra thực tế
            </h2>
          </div>
          <p className="pu-c-card-subheading">
            {detail.purpose?.trim() ||
              `Áp dụng kiến thức ${detail.domain.name.toLowerCase()} ở cấp độ ${tier.toLowerCase()} với các kết quả công việc đo lường được trong nghiệp vụ thực tế:`}
          </p>

          <div className="pu-c-outcome-list">
            {detail.learningOutcomes.length > 0 ? (
              detail.learningOutcomes.slice(0, 3).map((outcome, idx) => (
                <div key={idx} className="pu-c-outcome-pill">
                  <span className="pu-c-outcome-idx">{pad2(idx + 1)}</span>
                  <span className="pu-c-outcome-txt">{outcome}</span>
                </div>
              ))
            ) : (
              <>
                <div className="pu-c-outcome-pill">
                  <span className="pu-c-outcome-idx">01</span>
                  <span className="pu-c-outcome-txt">
                    <strong>Hiểu bối cảnh nghiệp vụ:</strong> Nhận diện đúng mục đích và đối tượng tiếp nhận trong môi trường số.
                  </span>
                </div>
                <div className="pu-c-outcome-pill">
                  <span className="pu-c-outcome-idx">02</span>
                  <span className="pu-c-outcome-txt">
                    <strong>Quyết định có kiểm chứng:</strong> Áp dụng công cụ và phương pháp số đúng quy chuẩn của doanh nghiệp.
                  </span>
                </div>
                <div className="pu-c-outcome-pill">
                  <span className="pu-c-outcome-idx">03</span>
                  <span className="pu-c-outcome-txt">
                    <strong>Minh chứng rõ ràng:</strong> Xây dựng sản phẩm đầu ra có thể đo lường và bàn giao trong công việc thực tế.
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Cột phải: Tiến độ học tập & Khối CTA hành động */}
        <div className="pu-c-action-col">
          <div className="pu-c-progress-box">
            <div className="pu-c-prog-head">
              <span className="pu-c-prog-label">Tiến độ học tập</span>
              <span className="pu-c-prog-count">{passed}/{modules.length} mô-đun</span>
            </div>
            <div className="pu-c-prog-bar-wrap">
              <div
                className="pu-c-prog-bar-fill"
                style={{
                  width: `${course.progressPercent}%`,
                  backgroundColor: course.progressPercent >= 100 || approved ? '#059669' : '#1e40af',
                }}
              />
            </div>
            <div className="pu-c-prog-sub">
              <span className="pu-c-prog-pct">{course.progressPercent}%</span>
              <span className="pu-c-prog-hint">
                {approved
                  ? 'Đã hoàn tất toàn bộ khóa học'
                  : isFinalReady
                  ? 'Đã sẵn sàng làm bài thi cuối khóa'
                  : 'Đạt bài ôn tập từng mô-đun để mở khóa bài thi'}
              </span>
            </div>
          </div>

          {/* Contextual Action CTA */}
          <div className="pu-c-action-box">
            {approved ? (
              <div className="pu-c-action-done">
                <div className="pu-c-act-head">
                  <span className="pu-c-act-kicker">Trạng thái</span>
                  <span className="pu-c-act-badge done">
                    <Check size={11} strokeWidth={3} /> Đã hoàn thành
                  </span>
                </div>
                <p className="pu-c-action-text">
                  {viaPre
                    ? 'Khóa học được công nhận đạt chuẩn qua bài đánh giá đầu vào.'
                    : 'Khóa học đã được công nhận đạt chuẩn và đồng bộ vào hồ sơ năng lực.'}
                </p>
                <div className="pu-c-action-btns">
                  <Link
                    to={viaPre ? preAssessmentPath : PULSE_PATHS.final(course.courseId)}
                    className="pu-c-btn-secondary"
                  >
                    <span>Xem hồ sơ bài thi</span>
                  </Link>
                  {modules[0] && (
                    <Link
                      to={PULSE_PATHS.module(course.courseId, modules[0].moduleId)}
                      className="pu-c-btn-outline"
                    >
                      <span>Xem lại bài giảng</span>
                    </Link>
                  )}
                </div>
              </div>
            ) : canPreAssess ? (
              <div className="pu-c-action-pretest">
                <div className="pu-c-act-head">
                  <span className="pu-c-act-kicker">Nhiệm vụ ưu tiên</span>
                  <span className="pu-c-act-badge pretest">Được miễn học</span>
                </div>
                <p className="pu-c-action-text">
                  Làm bài kiểm tra đánh giá năng lực đầu vào (~20 phút). Đạt kết quả sẽ được xét miễn học ngay toàn bộ khóa học này.
                </p>
                <div className="pu-c-action-btns">
                  <Link to={preAssessmentPath} className="pu-c-btn-primary">
                    <Zap size={14} />
                    <span>Làm test vượt cấp ngay</span>
                    <ChevronRight size={14} />
                  </Link>
                  {detail.nextModuleId && (
                    <Link
                      to={PULSE_PATHS.module(course.courseId, detail.nextModuleId)}
                      className="pu-c-btn-secondary"
                    >
                      <span>Học tuần tự Mô-đun 01</span>
                    </Link>
                  )}
                </div>
              </div>
            ) : isPrePending ? (
              <div className="pu-c-action-waiting">
                <div className="pu-c-act-head">
                  <span className="pu-c-act-kicker">Trạng thái bài thi</span>
                  <span className="pu-c-act-badge waiting">Chờ xác nhận</span>
                </div>
                <p className="pu-c-action-text">
                  Bài kiểm tra đầu vào đã nộp thành công và đang chờ xác nhận kết quả chấm thi kèm bản ghi giám sát.
                </p>
                <div className="pu-c-action-btns">
                  <Link to={preAssessmentPath} className="pu-c-btn-secondary">
                    <span>Xem lại bài đã nộp</span>
                  </Link>
                </div>
              </div>
            ) : isFinalReady ? (
              <div className="pu-c-action-final">
                <div className="pu-c-act-head">
                  <span className="pu-c-act-kicker">Chặng cuối</span>
                  <span className="pu-c-act-badge final">Sẵn sàng</span>
                </div>
                <p className="pu-c-action-text">
                  Bạn đã hoàn thành toàn bộ bài ôn tập của các mô-đun. Hãy thực hiện kỳ thi cuối khóa có giám sát để hoàn tất khóa học.
                </p>
                <div className="pu-c-action-btns">
                  <Link to={PULSE_PATHS.final(course.courseId)} className="pu-c-btn-primary final">
                    <GraduationCap size={15} />
                    <span>Làm bài thi cuối khóa ngay</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ) : detail.nextModuleId ? (
              <div className="pu-c-action-study">
                <div className="pu-c-act-head">
                  <span className="pu-c-act-kicker">Mô-đun tiếp theo</span>
                  <span className="pu-c-act-badge current">Cần học</span>
                </div>
                <p className="pu-c-action-text">
                  {passed > 0
                    ? `Tiếp tục bài giảng Mô-đun ${pad2(firstOpen ? firstOpen.index + 1 : 1)} để hoàn thành mục tiêu ôn tập.`
                    : 'Bắt đầu Mô-đun 01 để xây dựng nền tảng kiến thức bài học.'}
                </p>
                <div className="pu-c-action-btns">
                  <Link
                    to={PULSE_PATHS.module(course.courseId, detail.nextModuleId)}
                    className="pu-c-btn-primary"
                  >
                    <PlayCircle size={14} />
                    <span>{passed > 0 ? 'Tiếp tục học ngay' : 'Bắt đầu Mô-đun 01'}</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── 3. Lộ trình Học tập Tuần tự Dọc (Sequential Stepper) ───────── */}
      <section className="pu-c-timeline-section" aria-labelledby="pu-timeline-heading">
        <div className="pu-c-timeline-header">
          <div>
            <h2 id="pu-timeline-heading" className="pu-c-section-title">
              Lộ trình học tập tuần tự ({modules.length} mô-đun bài giảng & 01 kỳ thi tốt nghiệp)
            </h2>
            <p className="pu-c-section-subtitle">
              Hoàn thành bài giảng và câu hỏi ôn tập theo thứ tự từ trên xuống dưới để mở khóa kỳ thi đánh giá năng lực cuối khóa.
            </p>
          </div>
          <div className="pu-c-timeline-badge">
            <span>{passed}/{modules.length} mô-đun đạt chuẩn</span>
          </div>
        </div>

        <div className="pu-c-timeline-flow">
          {modules.map((module) => {
            const isNext = module.moduleId === firstOpen?.moduleId;
            const preview = course.access === 'PREVIEW';
            const isPassed = module.passed;
            const isLocked = !module.viewable || (!module.unlocked && !preview && !isPassed);

            return (
              <div
                key={module.moduleId}
                className={`pu-c-timeline-step ${
                  isPassed ? 'passed' : isNext ? 'current' : isLocked ? 'locked' : 'ready'
                }`}
              >
                {/* Trục chỉ báo Node & Đường kẻ nối dọc */}
                <div className="pu-c-step-track">
                  <div className="pu-c-step-node">
                    {isPassed ? (
                      <Check size={14} strokeWidth={3} className="text-emerald-700" />
                    ) : isNext ? (
                      <span className="pu-c-node-pulse" />
                    ) : isLocked ? (
                      <Lock size={12} className="text-slate-400" />
                    ) : (
                      <span className="pu-c-node-dot" />
                    )}
                  </div>
                  <div className="pu-c-step-line" />
                </div>

                {/* Thẻ Nội dung Mô đun */}
                <article className="pu-c-step-card">
                  <div className="pu-c-card-main-info">
                    <div className="pu-c-card-kicker-row">
                      <span className="pu-c-card-kicker">Mô-đun {pad2(module.index + 1)}</span>
                      <span
                        className={`pu-c-step-status ${
                          isPassed
                            ? 'passed'
                            : isNext
                            ? 'current'
                            : isLocked
                            ? 'locked'
                            : 'ready'
                        }`}
                      >
                        {isPassed ? (
                          <>
                            <Check size={11} strokeWidth={3} />
                            <span>Đã đạt</span>
                          </>
                        ) : isNext ? (
                          <>
                            <PlayCircle size={11} />
                            <span>Đang học</span>
                          </>
                        ) : isLocked ? (
                          <>
                            <Lock size={10} />
                            <span>Theo thứ tự</span>
                          </>
                        ) : (
                          <span>Sẵn sàng</span>
                        )}
                      </span>
                    </div>

                    <h3 className="pu-c-step-title">{toSentenceCase(module.title)}</h3>

                    {module.description && (
                      <p className="pu-c-step-desc">{module.description}</p>
                    )}

                    {/* Thông số bài giảng */}
                    <div className="pu-c-step-meta">
                      <span className="pu-c-step-meta-item">
                        <FileText size={13} className="text-slate-500" />
                        <span>{module.slideCount} trang bài học</span>
                      </span>
                      {module.estimatedMinutes && (
                        <>
                          <span className="pu-c-meta-dot" />
                          <span className="pu-c-step-meta-item">
                            <Clock size={13} className="text-slate-500" />
                            <span>~{module.estimatedMinutes} phút</span>
                          </span>
                        </>
                      )}
                      {module.hasQuiz && (
                        <>
                          <span className="pu-c-meta-dot" />
                          <span className="pu-c-step-meta-item">
                            <HelpCircle size={13} className="text-slate-500" />
                            <span>
                              {module.quizBankQuestionCount != null
                                ? `Ngân hàng ${module.quizBankQuestionCount} câu · `
                                : ''}
                              Làm {module.quizQuestionCount} câu ôn tập
                            </span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Cột Hành động của Thẻ */}
                  <div className="pu-c-card-action-side">
                    {module.viewable ? (
                      <Link
                        to={PULSE_PATHS.module(course.courseId, module.moduleId)}
                        className={`pu-c-step-btn ${
                          isNext || (!isPassed && !isLocked) ? 'primary' : 'outline'
                        }`}
                      >
                        {preview ? (
                          <span>Xem trang mẫu →</span>
                        ) : isPassed ? (
                          <>
                            <RotateCcw size={12} />
                            <span>Ôn lại bài</span>
                          </>
                        ) : (
                          <>
                            <span>Vào học mô-đun</span>
                            <ChevronRight size={13} />
                          </>
                        )}
                      </Link>
                    ) : (
                      <div className="pu-c-step-locked-hint">
                        <Lock size={12} />
                        <span>Khóa · Học Mô-đun {pad2(module.index)} trước</span>
                      </div>
                    )}
                  </div>
                </article>
              </div>
            );
          })}

          {/* Chặng Đích: Kỳ thi cuối khóa (Final Milestone Node) */}
          <div
            className={`pu-c-timeline-step final-milestone ${
              approved ? 'passed' : isFinalReady ? 'current' : 'pending'
            }`}
          >
            <div className="pu-c-step-track">
              <div className="pu-c-step-node milestone">
                <GraduationCap size={16} />
              </div>
            </div>

            <article className="pu-c-step-card milestone">
              <div className="pu-c-card-main-info">
                <div className="pu-c-card-kicker-row">
                  <span className="pu-c-card-kicker milestone">Chặng đích cuối môn</span>
                  <span
                    className={`pu-c-step-status ${
                      approved ? 'passed' : isFinalReady ? 'current' : 'locked'
                    }`}
                  >
                    {approved ? (
                      <>
                        <Check size={11} strokeWidth={3} />
                        <span>Đã công nhận năng lực</span>
                      </>
                    ) : isFinalReady ? (
                      <>
                        <Sparkles size={11} />
                        <span>Sẵn sàng thi</span>
                      </>
                    ) : (
                      <>
                        <Lock size={10} />
                        <span>Mở sau khi xong {modules.length} mô-đun</span>
                      </>
                    )}
                  </span>
                </div>

                <h3 className="pu-c-step-title">
                  Kỳ thi đánh giá năng lực cuối khóa (Proctored Final Exam)
                </h3>
                <p className="pu-c-step-desc">
                  Bài thi thực hiện trực tuyến có giám sát camera, mic và chia sẻ màn hình. Đánh giá toàn diện dựa trên 3 tiêu chí cốt lõi:
                </p>

                <div className="pu-c-rubric-chips">
                  {detail.finalCriteria.map((c) => (
                    <span key={c.number} className="pu-c-rubric-pill">
                      <strong>{c.number}.</strong> {c.title}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pu-c-card-action-side">
                {approved ? (
                  <Link
                    to={viaPre ? preAssessmentPath : PULSE_PATHS.final(course.courseId)}
                    className="pu-c-step-btn outline"
                  >
                    <span>Xem kết quả bài thi</span>
                  </Link>
                ) : isFinalReady ? (
                  <Link
                    to={PULSE_PATHS.final(course.courseId)}
                    className="pu-c-step-btn primary pulse"
                  >
                    <span>Làm bài thi cuối khóa</span>
                    <ChevronRight size={13} />
                  </Link>
                ) : (
                  <div className="pu-c-step-locked-hint">
                    <Lock size={12} />
                    <span>Chưa mở bài thi</span>
                  </div>
                )}
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ── 4. Điều hướng Chân trang ──────────────────────────────────── */}
      <footer className="pu-c-footer-nav">
        <Link to={PULSE_PATHS.path} className="pu-c-footer-back">
          <ArrowLeft size={15} />
          <span>Quay lại Bản đồ Lộ trình Năng lực</span>
        </Link>
        <span className="pu-c-footer-meta">
          Khóa {course.code} · Phiên bản v{detail.versionNo} · Lĩnh vực {detail.domain.name} / Cấp độ {tier}
        </span>
      </footer>
    </div>
  );
}
