import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  HelpCircle,
  Lock,
  PlayCircle,
  ScanEye,
  ShieldCheck,
} from 'lucide-react';
import architectureArt from '@/assets/pulse/competency-architecture.webp';
import { usePulseCourse } from '@/hooks/use-pulse';
import type { PulseCourseDetail } from '@/services/pulse.service';
import { Bar, LoadError, PageSkeleton } from '../components/ui';
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
 * PulseCoursePage — Chi tiết Khóa học & Đề cương (Enterprise Standard V2)
 * - Hero Banner chuẩn B2B: Breadcrumb M3-F · H1 Sentence Case · Quick Stats & Primary Action.
 * - Single Unified Status Alert: Khắc phục lỗi lặp thông báo bài đánh giá trước khóa.
 * - Khối Mục tiêu & Tiến độ 2 Cột: 3 chuẩn đầu ra đo lường được + Thước đo % hoàn thành.
 * - Đề cương 5 Mô-đun: Đạt chuẩn cỡ chữ (>=12px), tương phản cao WCAG AA, không dùng transition: padding.
 * - Kỳ thi cuối khóa (Proctored Final Exam): 3 tiêu chí sếp chấm minh bạch + chỉ dẫn thi giám sát.
 */
export function PulseCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data, isLoading, error, refetch } = usePulseCourse(courseId);

  if (isLoading) return <PageSkeleton blocks={[360, 240, 420]} />;
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
  const reviewer = detail.reviewer?.name ?? 'Quản lý trực tiếp';
  const preAssessmentPath = PULSE_PATHS.preAssessment(course.courseId);

  const formattedTitle = toSentenceCase(course.title);

  // Xác định hành động chính ở Hero Banner
  const heroAction = (() => {
    switch (detail.nextAction) {
      case 'PRE_ASSESSMENT':
        return { to: preAssessmentPath, label: 'Làm bài đánh giá đầu vào →', primary: true };
      case 'PRE_REVIEW':
        return { to: preAssessmentPath, label: 'Xem bài đánh giá đã nộp →', primary: false };
      case 'LOCKED':
        return null;
      case 'PREVIEW':
        return detail.nextModuleId
          ? { to: PULSE_PATHS.module(course.courseId, detail.nextModuleId), label: 'Xem trang mẫu đầu tiên →', primary: false }
          : null;
      case 'FINAL':
        return { to: PULSE_PATHS.final(course.courseId), label: 'Làm bài thi cuối khóa →', primary: true };
      case 'DONE':
        return viaPre
          ? { to: preAssessmentPath, label: 'Xem bài đánh giá đạt →', primary: false }
          : { to: PULSE_PATHS.final(course.courseId), label: 'Xem kết quả bài cuối khóa →', primary: false };
      default:
        return detail.nextModuleId
          ? {
              to: PULSE_PATHS.module(course.courseId, detail.nextModuleId),
              label: passed ? 'Tiếp tục học bài giảng →' : `Bắt đầu Mô-đun ${pad2(1)} →`,
              primary: true,
            }
          : null;
    }
  })();

  return (
    <div className="pu-course-wrap">
      {/* ── 1. Enterprise Hero Banner ─────────────────────────────────── */}
      <section className="pu-c-hero" aria-labelledby="pu-course-heading">
        <div className="pu-c-hero-content">
          <nav className="pu-c-hero-breadcrumb" aria-label="Đường dẫn điều hướng">
            <Link to={PULSE_PATHS.path}>Lộ trình năng lực</Link>
            <ChevronRight size={13} className="text-slate-400" aria-hidden />
            <span>{detail.domain.name}</span>
            <span className="pu-c-code-badge">{course.code} · Cấp độ {tier}</span>
          </nav>

          <h1 id="pu-course-heading">{formattedTitle}</h1>

          <p className="pu-c-hero-desc">
            {detail.description?.trim() ||
              `Khóa học gồm ${modules.length} mô-đun bài giảng và bài tập ôn tập mini-quiz. Sau khi hoàn thành, bạn thực hiện bài thi cuối khóa có giám sát để ${reviewer} đánh giá và công nhận năng lực.`}
          </p>

          <div className="pu-c-hero-meta">
            <span className="pu-c-meta-chip">
              <FileText size={14} className="text-amber-400" aria-hidden />
              {pad2(modules.length)} mô-đun bài học
            </span>
            <span className="pu-c-meta-chip">
              <HelpCircle size={14} className="text-indigo-400" aria-hidden />
              {pad2(quizCount)} bài ôn tập mini-quiz
            </span>
            <span className="pu-c-meta-chip">
              <GraduationCap size={14} className="text-emerald-400" aria-hidden />
              01 bài thi cuối khóa
            </span>
          </div>

          {heroAction && (
            <Link to={heroAction.to} className="pu-c-hero-cta">
              <PlayCircle size={17} />
              <span>{heroAction.label}</span>
            </Link>
          )}
        </div>

        <div className="pu-c-hero-art" aria-hidden>
          <img src={architectureArt} alt="Minh họa kiến trúc năng lực số" />
        </div>
      </section>

      {/* ── 2. Unified Status Alert (Khắc phục lỗi thông báo kép) ──────── */}
      {approved ? (
        <aside className="pu-c-alert green" role="status">
          <div className="pu-c-alert-left">
            <CheckCircle2 size={20} className="pu-c-alert-icon text-emerald-600" aria-hidden />
            <p className="pu-c-alert-text">
              {viaPre
                ? 'Khóa học đã được công nhận qua bài đánh giá đầu vào. Bạn vẫn có thể đọc lại toàn bộ bài giảng bất cứ lúc nào.'
                : `Khóa học đã được ${reviewer} công nhận đạt chuẩn. Kết quả đã được đồng bộ vào hồ sơ năng lực của bạn.`}
            </p>
          </div>
          <Link to={viaPre ? preAssessmentPath : PULSE_PATHS.final(course.courseId)} className="pu-c-alert-btn">
            Xem hồ sơ bài thi
          </Link>
        </aside>
      ) : course.preStatus === 'NOT_YET' ? (
        <aside className="pu-c-alert amber" role="status">
          <div className="pu-c-alert-left">
            <AlertCircle size={20} className="pu-c-alert-icon text-amber-600" aria-hidden />
            <p className="pu-c-alert-text">
              Bài đánh giá đầu vào chưa đạt: Vui lòng học lần lượt các mô-đun bài giảng bên dưới và hoàn thành các bài ôn tập để mở khóa bài thi cuối môn.
            </p>
          </div>
          <Link to={preAssessmentPath} className="pu-c-alert-btn">
            Xem lại bài đánh giá
          </Link>
        </aside>
      ) : course.preStatus === 'REQUIRED' ? (
        <aside className="pu-c-alert blue" role="status">
          <div className="pu-c-alert-left">
            <ScanEye size={20} className="pu-c-alert-icon text-blue-600" aria-hidden />
            <p className="pu-c-alert-text">
              Bài đánh giá đầu vào đang mở: Bạn có thể làm bài đánh giá để được miễn học toàn bộ khóa nếu đạt yêu cầu.
            </p>
          </div>
          <Link to={preAssessmentPath} className="pu-c-alert-btn">
            Bắt đầu bài đánh giá →
          </Link>
        </aside>
      ) : course.preStatus === 'PENDING' ? (
        <aside className="pu-c-alert amber" role="status">
          <div className="pu-c-alert-left">
            <Clock size={20} className="pu-c-alert-icon text-amber-600" aria-hidden />
            <p className="pu-c-alert-text">
              Bài đánh giá đầu vào đã nộp thành công, đang chờ {reviewer} chấm điểm kèm bản ghi giám sát màn hình và camera.
            </p>
          </div>
          <Link to={preAssessmentPath} className="pu-c-alert-btn">
            Xem bài đã nộp
          </Link>
        </aside>
      ) : null}

      {/* ── 3. Outcomes & Progress Grid ───────────────────────────────── */}
      <div className="pu-c-overview-grid">
        <section className="pu-c-outcome-card" aria-labelledby="pu-outcomes-title">
          <h2 id="pu-outcomes-title" className="pu-c-card-title">Mục tiêu & Chuẩn đầu ra thực tế</h2>
          <p className="pu-c-card-subtitle">
            {detail.purpose?.trim() ||
              `Áp dụng kiến thức ${detail.domain.name.toLowerCase()} ở cấp độ ${tier.toLowerCase()} với các kết quả công việc đo lường được.`}
          </p>

          <div className="pu-c-outcome-items">
            {detail.learningOutcomes.length > 0 ? (
              detail.learningOutcomes.slice(0, 3).map((outcome, idx) => (
                <div key={outcome} className="pu-c-outcome-item">
                  <span className="pu-c-outcome-num">{pad2(idx + 1)}</span>
                  <span>{outcome}</span>
                </div>
              ))
            ) : (
              <>
                <div className="pu-c-outcome-item">
                  <span className="pu-c-outcome-num">01</span>
                  <span><strong>Hiểu bối cảnh thực tế:</strong> Nhận diện đúng mục đích và đối tượng tiếp nhận sản phẩm nội dung số.</span>
                </div>
                <div className="pu-c-outcome-item">
                  <span className="pu-c-outcome-num">02</span>
                  <span><strong>Quyết định có kiểm chứng:</strong> Lựa chọn cấu trúc và ứng dụng công cụ AI theo đúng quy định.</span>
                </div>
                <div className="pu-c-outcome-item">
                  <span className="pu-c-outcome-num">03</span>
                  <span><strong>Minh chứng rõ ràng:</strong> Trình bày tài liệu chuẩn hóa, có thể đo lường và bàn giao trong công việc.</span>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="pu-c-progress-card" aria-labelledby="pu-progress-title">
          <div>
            <h2 id="pu-progress-title" className="pu-c-card-title">Tiến độ hoàn thành</h2>
            <div className="pu-c-progress-stat">
              <span className="pu-c-progress-number">{course.progressPercent}%</span>
              <span className="pu-c-progress-unit">({passed}/{modules.length} mô-đun)</span>
            </div>
            <Bar value={course.progressPercent} label="Phần trăm khóa học đã học" />
            <p className="pu-c-progress-desc">
              {approved
                ? 'Khóa học đã hoàn tất thành công và được ghi nhận vào hồ sơ.'
                : detail.nextAction === 'FINAL'
                ? 'Đã đạt toàn bộ bài ôn tập mô-đun. Bài thi cuối khóa đã sẵn sàng!'
                : 'Đạt câu hỏi ôn tập của từng mô-đun để mở khóa bài thi kết thúc môn.'}
            </p>
          </div>

          <div className="pu-c-access-pill">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>{approved ? 'Đã công nhận năng lực' : ACCESS_LABELS[course.access] || 'Suất học đã kích hoạt'}</span>
          </div>
        </section>
      </div>

      {/* ── 4. Course Syllabus & Modules ──────────────────────────────── */}
      <section className="pu-c-syllabus" aria-labelledby="pu-syllabus-title">
        <div className="pu-c-syllabus-head">
          <div>
            <h2 id="pu-syllabus-title" className="pu-c-card-title">Đề cương khóa học ({modules.length} mô-đun)</h2>
            <p className="pu-c-card-subtitle" style={{ margin: 0 }}>
              Học các mô-đun bài giảng theo thứ tự, làm bài ôn tập mini-quiz sau mỗi chương để củng cố kiến thức.
            </p>
          </div>
          <span className="pu-c-syllabus-badge">{passed}/{modules.length} bài ôn tập đạt</span>
        </div>

        <div className="pu-c-modules-grid">
          {modules.map((module) => {
            const isNext = module.moduleId === firstOpen?.moduleId;
            const preview = course.access === 'PREVIEW';
            const badge = module.passed
              ? { text: '✓ Đã đạt', tone: 'green' as const }
              : !module.viewable
              ? { text: 'Chưa mở', tone: 'slate' as const }
              : preview
              ? { text: 'Xem trước', tone: 'blue' as const }
              : !module.unlocked
              ? { text: 'Theo thứ tự', tone: 'slate' as const }
              : isNext
              ? { text: '▶ Tiếp theo', tone: 'amber' as const }
              : { text: 'Sẵn sàng', tone: 'blue' as const };

            return (
              <article
                key={module.moduleId}
                className={`pu-c-module-card${module.passed ? ' passed' : ''}${isNext ? ' is-next' : ''}`}
              >
                <div>
                  <div className="pu-c-mod-top">
                    <span className="pu-c-mod-index">Mô-đun {pad2(module.index + 1)}</span>
                    <span className={`pu-c-mod-badge ${badge.tone}`}>{badge.text}</span>
                  </div>

                  <h3 className="pu-c-mod-title">{toSentenceCase(module.title)}</h3>

                  {module.description && (
                    <p className="pu-c-mod-desc" title={module.description}>
                      {module.description}
                    </p>
                  )}
                </div>

                <div>
                  <div className="pu-c-mod-meta">
                    <div className="pu-c-mod-meta-row">
                      <FileText size={14} className="text-slate-500 shrink-0" />
                      <span>{module.slideCount} trang bài học{module.estimatedMinutes ? ` · ${module.estimatedMinutes} phút` : ''}</span>
                    </div>
                    {module.hasQuiz && (
                      <div className="pu-c-mod-meta-row">
                        <HelpCircle size={14} className="text-slate-500 shrink-0" />
                        <span>
                          {module.quizBankQuestionCount != null ? `Ngân hàng ${module.quizBankQuestionCount} câu · ` : ''}
                          Làm {module.quizQuestionCount} câu ôn tập / lượt
                        </span>
                      </div>
                    )}
                  </div>

                  {module.viewable ? (
                    <Link
                      to={PULSE_PATHS.module(course.courseId, module.moduleId)}
                      className={`pu-c-mod-action-btn ${isNext || !module.passed ? 'primary' : 'outline'}`}
                    >
                      {preview ? 'Xem trang mẫu →' : module.passed ? 'Ôn lại bài giảng ↻' : 'Vào học mô-đun →'}
                    </Link>
                  ) : (
                    <div className="pu-c-mod-locked">
                      <Lock size={13} />
                      <span>Khóa · Cần đạt mô-đun trước</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── 5. Final Exam Strip ───────────────────────────────────────── */}
      <section className="pu-c-final-card" aria-labelledby="pu-final-title">
        <div className="pu-c-final-icon" aria-hidden>
          <GraduationCap size={28} />
        </div>

        <div className="pu-c-final-info">
          <h2 id="pu-final-title" className="pu-c-card-title">Kỳ thi đánh giá cuối khóa (Proctored Exam)</h2>
          <p className="pu-c-card-subtitle" style={{ margin: 0 }}>
            Bài thi thực hiện có giám sát trực tuyến qua camera, microphone và chia sẻ toàn màn hình. {reviewer} sẽ đánh giá trực tiếp dựa trên 3 tiêu chí cốt lõi:
          </p>
          <div className="pu-c-final-chips">
            {detail.finalCriteria.map((criterion) => (
              <span key={criterion.number} className="pu-c-rubric-chip">
                {criterion.number}. {criterion.title}
              </span>
            ))}
          </div>
        </div>

        <div>
          <Link
            to={PULSE_PATHS.final(course.courseId)}
            className={`pu-c-final-btn ${detail.nextAction === 'FINAL' ? 'primary' : 'outline'}`}
          >
            {detail.nextAction === 'FINAL' ? 'Làm bài cuối khóa →' : 'Xem tiêu chí bài cuối →'}
          </Link>
        </div>
      </section>

      {/* ── 6. Course Footer Navigation ──────────────────────────────── */}
      <footer className="pu-c-footer">
        <Link to={PULSE_PATHS.path} className="pu-c-back-link">
          <ArrowLeft size={16} />
          <span>Quay lại Bản vẽ lộ trình</span>
        </Link>
        <span className="pu-c-meta-version">
          Khóa {course.code} · Phiên bản v{detail.versionNo} · {detail.domain.name} / Cấp độ {tier}
        </span>
      </footer>
    </div>
  );
}
