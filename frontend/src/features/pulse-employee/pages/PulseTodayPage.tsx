import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  FileText,
  Layers,
  LayoutGrid,
  Target,
  UserX,
  BookOpen,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { usePulseOverview } from '@/hooks/use-pulse';
import type { PulseCourseSummary, PulseOverview } from '@/services/pulse.service';
import { formatDate } from '@/lib/utils';
import { Bar, Empty, LoadError, PageSkeleton, PuLink } from '../components/ui';
import { levelName, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';
import { QuickSyllabusDrawer } from '../components/QuickSyllabusDrawer';

/**
 * Hôm nay (EM-01) - Actionable Enterprise Dashboard
 * - Hero Summary: Lời chào cá nhân hóa, chỉ số khóa học rõ ràng, mục tiêu chuẩn hóa chức danh.
 * - Action Center (Việc nên làm tiếp): Băng chuyền tiêu điểm & chế độ hiển thị linh hoạt.
 * - Domain Progress Overview: Tóm tắt tiến độ 6 lĩnh vực năng lực, liên kết trực tiếp sang Lộ trình.
 * - Quick Syllabus Slide-over Drawer: Xem nhanh đề cương khóa học.
 */
export function PulseTodayPage() {
  const { data, isLoading, error, refetch } = usePulseOverview();
  const [selectedCourse, setSelectedCourse] = useState<PulseCourseSummary | null>(null);

  if (isLoading) return <PageSkeleton blocks={[200, 240, 500]} />;
  if (error || !data) return <LoadError message={pulseErrorMessage(error, 'Không tải được không gian học của bạn.')} onRetry={() => refetch()} />;
  if (!data.hasPosition || !data.hasTargets) return <NoPath overview={data} />;

  return (
    <div className="pu-home">
      {/* 1. Bento Summary Header */}
      <section className="pu-home-top" data-tour="emp-today-header">
        <GreetingCard overview={data} />
        <RoleCard overview={data} />
      </section>

      {/* 2. Action Center: Việc nên làm tiếp & Thông báo chờ chấm */}
      <ActionCenter overview={data} onSelectCourse={setSelectedCourse} />

      {/* 3. Domain Progress Overview (thay thế ma trận lặp lại để trang tổng quan gọn gàng) */}
      <DomainProgressOverview overview={data} onSelectCourse={setSelectedCourse} />

      {/* 4. Quick Nav Links */}
      <nav className="pu-more-links" aria-label="Truy cập nhanh">
        <span className="pu-more-links-title">Truy cập nhanh:</span>
        <PuLink to={PULSE_PATHS.path} kind="outline" small>Lộ trình đào tạo chi tiết →</PuLink>
        <PuLink to={PULSE_PATHS.practice} kind="outline" small>Sổ kiểm tra & bài tập thực tế →</PuLink>
        <PuLink to={PULSE_PATHS.outcomes} kind="outline" small>Chứng chỉ chức danh →</PuLink>
        <PuLink to={PULSE_PATHS.profile} kind="outline" small>Hồ sơ cá nhân →</PuLink>
      </nav>

      {/* 5. Quick Syllabus Slide-over Drawer (540px Sheet) */}
      <QuickSyllabusDrawer
        course={selectedCourse}
        overview={data}
        open={Boolean(selectedCourse)}
        onClose={() => setSelectedCourse(null)}
      />
    </div>
  );
}

const firstName = (fullName: string) => fullName.trim().split(/\s+/).pop() || fullName;

const todayDateString = () =>
  new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' }).format(new Date());

function cleanDomainCode(code: string): string {
  if (!code) return '';
  return code.replace(/^TT02_D(\d+)$/, 'Lĩnh vực 0$1').replace(/^TT02_/, '');
}

function toSentenceCase(str: string): string {
  if (!str) return '';
  const s = str.trim();
  if (s === s.toUpperCase() && s.length > 3) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
  return s;
}

/* ── 1. Bento Header Components ────────────────────────────────────────── */
function GreetingCard({ overview }: { overview: PulseOverview }) {
  const { person, stats, courses } = overview;
  const position = person.positionName ?? 'của bạn';
  const total = stats.pathCourses;
  const approved = stats.approvedPathCourses;
  const inReview = courses.filter((c) => c.slotStatus === 'PRE_REVIEW' || c.slotStatus === 'IN_REVIEW').length;
  const remaining = Math.max(0, total - approved - inReview);
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <article className="pu-greeting-card">
      <div className="pu-greeting-body">
        <div className="pu-greeting-header">
          <span className="pu-date-chip">{todayDateString()}</span>
          <span className="pu-goal-pill">Kế hoạch đào tạo 2026</span>
        </div>

        <h1 className="pu-greeting-title">
          Chào {firstName(person.fullName)}, bạn đang ở lộ trình <span>{position}</span>
        </h1>

        <p className="pu-greeting-subtitle">
          Theo dõi tiến độ hoàn thành các khóa học và bài kiểm tra để đạt chuẩn năng lực vị trí.
        </p>

        <div className="pu-hero-stats-row">
          <div className="pu-stat-pill success">
            <Check size={14} />
            <span><strong>{approved}</strong> hoàn thành</span>
          </div>
          {inReview > 0 && (
            <div className="pu-stat-pill warning">
              <Clock size={14} />
              <span><strong>{inReview}</strong> chờ mentor chấm</span>
            </div>
          )}
          <div className="pu-stat-pill neutral">
            <BookOpen size={14} />
            <span><strong>{remaining}</strong> cần học</span>
          </div>
        </div>

        <div className="pu-hero-progress">
          <div className="pu-hero-progress-meta">
            <span>Tiến độ hoàn thành vị trí: <strong>{approved}/{total} khóa</strong></span>
            <span className="pu-hero-pct">{pct}%</span>
          </div>
          <div className="pu-hero-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="pu-hero-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="pu-greeting-visual" aria-hidden="true">
        <div className="pu-visual-badge-wrap">
          <div className="pu-visual-circle">
            <GraduationCap size={36} className="pu-visual-icon" />
          </div>
          <div className="pu-visual-ring-label">
            <span>Mục tiêu</span>
            <strong>Chuẩn chức danh</strong>
          </div>
        </div>
      </div>
    </article>
  );
}

function RoleCard({ overview }: { overview: PulseOverview }) {
  const { person } = overview;
  const deptRaw = person.departmentName?.trim();
  const dept = deptRaw
    ? deptRaw.toLowerCase().startsWith('phòng')
      ? deptRaw
      : `Phòng ${deptRaw}`
    : null;
  const orgSub = [dept, person.organizationName].filter(Boolean).join(' · ');

  return (
    <aside className="pu-role-card" aria-label="Thông tin vị trí và mục tiêu">
      <div className="pu-role-row">
        <span className="pu-role-icon position" aria-hidden><BriefcaseBusiness size={20} /></span>
        <div className="pu-role-content">
          <small className="pu-role-label">VỊ TRÍ CÔNG VIỆC</small>
          <strong>{person.positionName ?? 'Chưa gán vị trí'}</strong>
          <span>{orgSub || 'Doanh nghiệp'}</span>
        </div>
      </div>

      <div className="pu-role-row">
        <span className="pu-role-icon goal" aria-hidden><Target size={20} /></span>
        <div className="pu-role-content">
          <small className="pu-role-label">MỤC TIÊU VỊ TRÍ</small>
          <strong>Chuẩn hóa 6 lĩnh vực năng lực</strong>
          <span>Chấm điểm và hướng dẫn bởi Mentor chuyên môn</span>
        </div>
      </div>
    </aside>
  );
}

/* ── 2. Action Center (Việc nên làm tiếp & Chờ chấm) ───────────────────── */
const stepKicker = (course: PulseCourseSummary) => {
  switch (course.slotStatus) {
    case 'FINAL_READY':
      return 'Bài cuối khóa · Đã học 100%';
    case 'IN_PROGRESS':
      return `Đang học · ${course.progressPercent}%`;
    case 'PRE_ASSESSMENT':
      return `Đánh giá đầu vào · ${levelName(course.tier)}`;
    default:
      return `Cần học · ${levelName(course.tier)}`;
  }
};

function ActionCenter({
  overview,
  onSelectCourse,
}: {
  overview: PulseOverview;
  onSelectCourse: (course: PulseCourseSummary) => void;
}) {
  const steps = overview.nextSteps;
  const waiting = overview.courses.filter((c) => c.slotStatus === 'PRE_REVIEW' || c.slotStatus === 'IN_REVIEW');
  const fresh = steps.length > 0 && overview.stats.approvedPathCourses === 0 && steps.every((s) => s.slotStatus === 'PRE_ASSESSMENT');

  const [activeSlide, setActiveSlide] = useState(0);
  const [mode, setMode] = useState<'carousel' | 'grid'>('carousel');

  const currentCourse = steps[activeSlide] ?? steps[0];

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % Math.max(1, steps.length));
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + steps.length) % Math.max(1, steps.length));

  return (
    <section className="pu-action-center" data-tour="emp-action-center" aria-labelledby="pu-action-title">
      {/* Pending Reviews Amber Banner */}
      {waiting.length > 0 && (
        <div className="pu-pending-banner">
          <Clock size={18} className="pu-pending-icon" aria-hidden />
          <div className="pu-pending-content">
            <strong>Đang chờ người hướng dẫn (Mentor) chấm điểm:</strong>{' '}
            <span>{waiting.map((c) => `${c.code} · ${toSentenceCase(c.title)}`).join('; ')}</span>
            {waiting.length === 1 && waiting[0]?.preAssessment && (
              <small> (Nộp ngày {formatDate(waiting[0].preAssessment.submittedAt)})</small>
            )}
          </div>
        </div>
      )}

      {/* Action Header */}
      <div className="pu-action-head">
        <div>
          <h2 id="pu-action-title" className="pu-action-title">
            {steps.length === 0 ? 'Không còn việc đang mở' : fresh ? 'Bắt đầu bằng bài đánh giá đầu vào' : 'Việc nên làm tiếp'}
          </h2>
          <p className="pu-action-desc">
            {steps.length === 0
              ? 'Tất cả các khóa hiện tại đã đạt hoặc đang chờ người hướng dẫn chấm duyệt.'
              : fresh
                ? 'Thực hiện bài đánh giá trước khi học để được miễn học lý thuyết nếu đã đạt năng lực.'
                : 'Các khóa học và bài kiểm tra ưu tiên theo tiến trình của bạn.'}
          </p>
        </div>

        {steps.length > 1 && (
          <div className="pu-action-controls">
            {/* View Mode Toggle */}
            <div className="pu-view-toggle">
              <button
                type="button"
                className={`pu-toggle-btn ${mode === 'carousel' ? 'active' : ''}`}
                onClick={() => setMode('carousel')}
                title="Dạng băng chuyền trọng tâm"
              >
                <Layers size={14} />
                <span>Tiêu điểm</span>
              </button>
              <button
                type="button"
                className={`pu-toggle-btn ${mode === 'grid' ? 'active' : ''}`}
                onClick={() => setMode('grid')}
                title="Dạng lưới hiển thị tất cả"
              >
                <LayoutGrid size={14} />
                <span>Tất cả ({steps.length})</span>
              </button>
            </div>

            {/* Carousel navigation arrows */}
            {mode === 'carousel' && (
              <div className="pu-carousel-nav">
                <button
                  type="button"
                  className="pu-carousel-arrow-btn"
                  onClick={prevSlide}
                  aria-label="Việc trước"
                  title="Việc trước"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="pu-carousel-counter">
                  {activeSlide + 1} / {steps.length}
                </span>
                <button
                  type="button"
                  className="pu-carousel-arrow-btn"
                  onClick={nextSlide}
                  aria-label="Việc tiếp theo"
                  title="Việc tiếp theo"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mode 1: Carousel Slide */}
      {steps.length > 0 && mode === 'carousel' && currentCourse && (
        <article className="pu-action-featured-slide">
          <div className="pu-featured-slide-top">
            <div className="pu-featured-kicker-group">
              <span className="pu-featured-priority-badge">
                Ưu tiên #{activeSlide + 1}
              </span>
              <span className="pu-action-kicker">{stepKicker(currentCourse)}</span>
              <span className="pu-action-tier">{levelName(currentCourse.tier)}</span>
            </div>

            {/* Dots */}
            {steps.length > 1 && (
              <div className="pu-carousel-dots" role="tablist" aria-label="Danh sách việc cần làm">
                {steps.map((s, idx) => (
                  <button
                    key={s.courseId}
                    type="button"
                    role="tab"
                    className={`pu-carousel-dot ${idx === activeSlide ? 'active' : ''}`}
                    onClick={() => setActiveSlide(idx)}
                    aria-selected={idx === activeSlide}
                    aria-label={`Chuyển tới việc ${idx + 1}: ${s.code}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="pu-featured-slide-main">
            <h3 className="pu-featured-title">
              <button
                type="button"
                className="pu-action-title-btn"
                onClick={() => onSelectCourse(currentCourse)}
                title="Bấm để xem nhanh đề cương"
              >
                {currentCourse.code} · {toSentenceCase(currentCourse.title)}
              </button>
            </h3>

            <p className="pu-featured-desc">
              {currentCourse.slotStatus === 'PRE_ASSESSMENT'
                ? 'Làm bài đánh giá đầu vào gồm 10 câu trắc nghiệm và 1 câu tự luận. Đạt từ 80% trở lên sẽ được công nhận hoàn thành mà không cần học lại lý thuyết.'
                : currentCourse.slotStatus === 'FINAL_READY'
                ? 'Bạn đã hoàn thành 100% bài giảng. Hãy làm bài thi cuối khóa để hoàn tất chứng nhận môn học.'
                : currentCourse.slotStatus === 'IN_PROGRESS'
                ? `Đã hoàn thành ${currentCourse.progressPercent}% bài học. Hãy tiếp tục học các mô đun tiếp theo để mở khóa bài thi cuối khóa.`
                : 'Khóa học chuẩn hóa theo khung năng lực chức danh.'}
            </p>

            {currentCourse.slotStatus === 'IN_PROGRESS' && (
              <div className="pu-action-progress" style={{ maxWidth: 400 }}>
                <Bar value={currentCourse.progressPercent} label={`Tiến độ ${currentCourse.code}`} />
              </div>
            )}
          </div>

          <div className="pu-featured-slide-footer">
            <div className="pu-featured-actions">
              <ActionCardCTA course={currentCourse} />
              <button
                type="button"
                className="pu-featured-drawer-btn"
                onClick={() => onSelectCourse(currentCourse)}
              >
                <FileText size={14} />
                <span>Xem nhanh đề cương</span>
              </button>
            </div>

            {steps.length > 1 && (
              <div className="pu-featured-queue-hint">
                <span>Còn {steps.length - 1} việc khác trong hàng đợi</span>
              </div>
            )}
          </div>
        </article>
      )}

      {/* Mode 2: Multi-Card Grid */}
      {steps.length > 0 && mode === 'grid' && (
        <div className="pu-action-grid">
          {steps.map((course, idx) => (
            <article key={course.courseId} className={`pu-action-card${idx === 0 ? ' priority' : ''}`}>
              <div className="pu-action-card-top">
                <span className="pu-action-kicker">{stepKicker(course)}</span>
                <span className="pu-action-tier">{levelName(course.tier)}</span>
              </div>

              <h3 className="pu-action-course-title">
                <button
                  type="button"
                  className="pu-action-title-btn"
                  onClick={() => onSelectCourse(course)}
                  title="Bấm để xem nhanh đề cương"
                >
                  {course.code} · {toSentenceCase(course.title)}
                </button>
              </h3>

              {course.slotStatus === 'IN_PROGRESS' && (
                <div className="pu-action-progress">
                  <Bar value={course.progressPercent} label={`Tiến độ ${course.code}`} />
                </div>
              )}

              <div className="pu-action-footer">
                <ActionCardCTA course={course} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ActionCardCTA({ course }: { course: PulseCourseSummary }) {
  switch (course.slotStatus) {
    case 'PRE_ASSESSMENT':
      return (
        <PuLink to={PULSE_PATHS.preAssessment(course.courseId)} kind="primary" small>
          Làm bài đánh giá đầu vào →
        </PuLink>
      );
    case 'FINAL_READY':
      return (
        <PuLink to={PULSE_PATHS.final(course.courseId)} kind="primary" small>
          Làm bài thi cuối khóa →
        </PuLink>
      );
    case 'IN_PROGRESS':
      return (
        <PuLink to={PULSE_PATHS.course(course.courseId)} kind="primary" small>
          Học tiếp bài giảng →
        </PuLink>
      );
    default:
      return (
        <PuLink to={PULSE_PATHS.course(course.courseId)} kind="outline" small>
          Vào xem khóa học →
        </PuLink>
      );
  }
}

/* ── 3. Domain Progress Overview (Gọn gàng, tránh lặp lại ma trận) ────────── */
function DomainProgressOverview({
  overview,
  onSelectCourse,
}: {
  overview: PulseOverview;
  onSelectCourse: (course: PulseCourseSummary) => void;
}) {
  const domains = overview.domains.filter((d) => d.pathTop > 0);

  return (
    <section className="pu-domain-overview-section" data-tour="emp-roadmap-matrix" aria-labelledby="pu-domain-overview-title">
      <div className="pu-domain-overview-head">
        <div>
          <h2 id="pu-domain-overview-title" className="pu-domain-overview-title">
            Tiến độ theo lĩnh vực năng lực
          </h2>
          <p className="pu-domain-overview-desc">
            Tổng hợp kết quả học tập và rèn luyện qua 6 lĩnh vực theo chuẩn vị trí công việc của bạn.
          </p>
        </div>
        <PuLink to={PULSE_PATHS.path} kind="outline" small>
          Xem bản đồ lộ trình chi tiết <ArrowRight size={13} style={{ display: 'inline', marginLeft: 4 }} />
        </PuLink>
      </div>

      <div className="pu-domain-grid">
        {domains.map((domain) => {
          const domainCourses = overview.courses.filter(
            (c) => c.categoryId === domain.categoryId && c.zone === 'PATH'
          );
          const completedCount = domainCourses.filter((c) => c.slotStatus === 'COMPLETED').length;
          const waitingCount = domainCourses.filter((c) => c.slotStatus === 'PRE_REVIEW' || c.slotStatus === 'IN_REVIEW').length;
          const inProgressCount = domainCourses.filter((c) => c.slotStatus === 'IN_PROGRESS' || c.slotStatus === 'FINAL_READY').length;
          const totalCourses = domainCourses.length;
          const pct = totalCourses > 0 ? Math.round((completedCount / totalCourses) * 100) : 0;

          const isFullyCompleted = completedCount === totalCourses && totalCourses > 0;
          const isLearning = inProgressCount > 0 || waitingCount > 0;

          const statusClass = isFullyCompleted
            ? 'completed'
            : isLearning
            ? 'learning'
            : 'not-started';

          const statusText = isFullyCompleted
            ? 'Đã đạt'
            : waitingCount > 0
            ? 'Chờ chấm'
            : isLearning
            ? 'Đang học'
            : 'Chưa bắt đầu';

          return (
            <article key={domain.categoryId} className="pu-domain-card">
              <div className="pu-domain-card-head">
                <div className="pu-domain-card-info">
                  <span className="pu-domain-card-code">{cleanDomainCode(domain.code)}</span>
                  <h3 className="pu-domain-card-title">{domain.name}</h3>
                </div>
                <span className={`pu-domain-status-badge ${statusClass}`}>{statusText}</span>
              </div>

              <div className="pu-domain-progress-row">
                <div className="pu-domain-progress-meta">
                  <strong>{completedCount}/{totalCourses} khóa đạt</strong>
                  <span>{pct}%</span>
                </div>
                <div className="pu-hero-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} style={{ height: 6 }}>
                  <div className="pu-hero-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="pu-domain-courses-list">
                {domainCourses.map((c) => {
                  const isDone = c.slotStatus === 'COMPLETED';
                  const isWait = c.slotStatus === 'PRE_REVIEW' || c.slotStatus === 'IN_REVIEW';
                  const chipClass = isDone ? 'completed' : isWait ? 'waiting' : '';

                  return (
                    <button
                      key={c.courseId}
                      type="button"
                      className={`pu-domain-course-chip ${chipClass}`}
                      onClick={() => onSelectCourse(c)}
                      title={`${c.code} · ${c.title} (${levelName(c.tier)})`}
                    >
                      {isDone && <Check size={11} />}
                      {isWait && <Clock size={11} />}
                      <span>{c.code}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pu-domain-card-foot">
                <Link to={PULSE_PATHS.path} className="pu-domain-link">
                  <span>Chi tiết</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* ── Empty State ──────────────────────────────────────────────────────── */
function NoPath({ overview }: { overview: PulseOverview }) {
  return (
    <Empty
      icon={overview.hasPosition ? <Compass size={24} /> : <UserX size={24} />}
      title={overview.hasPosition ? 'Vị trí của bạn chưa có lộ trình' : 'Bạn chưa được gán vị trí công việc'}
    >
      {overview.hasPosition
        ? `Chủ doanh nghiệp chưa công bố yêu cầu năng lực cho vị trí ${overview.person.positionName ?? ''}, hoặc chưa mở lĩnh vực nào cho phòng ban của bạn. Lộ trình sẽ hiện khi được thiết lập.`
        : 'Lộ trình học đi theo phòng ban và vị trí của bạn. Hãy liên hệ ban quản trị để được xếp vào đúng vị trí.'}
    </Empty>
  );
}
