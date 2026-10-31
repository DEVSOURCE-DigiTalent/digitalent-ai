import { useState } from 'react';
import {
  Award,
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
  ArrowRight,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import heroBgArt from '@/assets/pulse/enterprise-hero-bg.jpg';
import { usePulseOverview } from '@/hooks/use-pulse';
import type { PulseCourseSummary, PulseDomain, PulseOverview } from '@/services/pulse.service';
import { Bar, Empty, LoadError, PageSkeleton, PuLink } from '../components/ui';
import { levelName, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';
import { QuickSyllabusDrawer } from '../components/QuickSyllabusDrawer';

/**
 * Hôm nay (EM-01) - Actionable Enterprise Dashboard
 * - Hero Banner: Ảnh nền trừu tượng công nghệ, thông điệp ngắn gọn, trực quan.
 * - 4 Quick Bento Stat Cards: Tiến độ 13%, Hàng đợi chờ chấm, Việc tiếp theo M5-F, Phủ 6 lĩnh vực.
 * - Review Queue Widget: Widget hàng đợi chấm điểm trang nhã với các chip môn học bấm được.
 * - Action Center (Việc nên làm tiếp): Tiêu điểm việc cần làm ngay.
 * - Competency Radar Chart + 6 Lĩnh vực: Biểu đồ Radar 6 góc đối chiếu trực quan năng lực vị trí.
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
      {/* 1. Hero Banner tối giản với ảnh nền trừu tượng cao cấp */}
      <EnterpriseHeroBanner overview={data} />

      {/* 2. Dải 4 Card nhỏ thông tin nhanh (Bento Stat Cards) */}
      <QuickStatCards overview={data} onSelectCourse={setSelectedCourse} />

      {/* 3. Review Queue Widget (Hàng đợi chờ chấm - Phương án A) */}
      <ReviewQueueSection overview={data} onSelectCourse={setSelectedCourse} />

      {/* 4. Action Center: Việc nên làm tiếp */}
      <ActionCenter overview={data} onSelectCourse={setSelectedCourse} />

      {/* 5. Phân mục Tiến độ: Biểu đồ Radar 6 góc & Lưới 6 lĩnh vực */}
      <DomainRadarSection overview={data} onSelectCourse={setSelectedCourse} />

      {/* 6. Quick Nav Links */}
      <nav className="pu-more-links" aria-label="Truy cập nhanh">
        <span className="pu-more-links-title">Truy cập nhanh:</span>
        <PuLink to={PULSE_PATHS.path} kind="outline" small>Lộ trình đào tạo chi tiết →</PuLink>
        <PuLink to={PULSE_PATHS.practice} kind="outline" small>Sổ kiểm tra & bài tập thực tế →</PuLink>
        <PuLink to={PULSE_PATHS.outcomes} kind="outline" small>Chứng chỉ chức danh →</PuLink>
        <PuLink to={PULSE_PATHS.profile} kind="outline" small>Hồ sơ cá nhân →</PuLink>
      </nav>

      {/* 7. Quick Syllabus Slide-over Drawer (540px Sheet) */}
      <QuickSyllabusDrawer
        course={selectedCourse}
        overview={data}
        open={Boolean(selectedCourse)}
        onClose={() => setSelectedCourse(null)}
      />
    </div>
  );
}

const todayDateString = () =>
  new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' }).format(new Date());

function toSentenceCase(str: string): string {
  if (!str) return '';
  const s = str.trim();
  if (s === s.toUpperCase() && s.length > 3) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
  return s;
}

function cleanDomainCode(code: string): string {
  if (!code) return '';
  return code.replace(/^TT02_D(\d+)$/, 'Lĩnh vực 0$1').replace(/^TT02_/, '');
}

/* ── 1. Enterprise Hero Banner (Ảnh nền + Text tối giản) ───────────────── */
function EnterpriseHeroBanner({ overview }: { overview: PulseOverview }) {
  const { person } = overview;
  const position = person.positionName ?? 'Chuyên viên Kế toán tài chính';
  const deptRaw = person.departmentName?.trim();
  const dept = deptRaw
    ? deptRaw.toLowerCase().startsWith('phòng')
      ? deptRaw
      : `Phòng ${deptRaw}`
    : 'Phòng ban';

  return (
    <header className="pu-enterprise-hero-wrap" data-tour="emp-today-header">
      <div
        className="pu-enterprise-hero-bg"
        style={{ backgroundImage: `url(${heroBgArt})` }}
        aria-hidden="true"
      />
      <div className="pu-enterprise-hero-overlay" aria-hidden="true" />

      <div className="pu-enterprise-hero-inner">
        <div className="pu-hero-badge-group">
          <span className="pu-hero-chip date">{todayDateString()}</span>
          <span className="pu-hero-chip dept">{dept}</span>
        </div>

        <h1 className="pu-hero-main-title">
          <span className="pu-hero-greeting-prefix">Chào,</span>
          <span className="pu-hero-name-highlight">
            {person.fullName || 'bạn'}
          </span>
          <span className="pu-hero-growth-badge" title="Lộ trình phát triển năng lực" aria-hidden="true">
            <TrendingUp size={16} strokeWidth={2.4} />
          </span>
        </h1>

        <p className="pu-hero-main-subtitle">
          Lộ trình phát triển năng lực chức danh <strong>{position}</strong>
        </p>
      </div>
    </header>
  );
}

/* ── 2. Dải 4 Card nhỏ thông tin nhanh (Bento Stat Cards) ──────────────── */
function QuickStatCards({
  overview,
  onSelectCourse,
}: {
  overview: PulseOverview;
  onSelectCourse: (course: PulseCourseSummary) => void;
}) {
  const { stats, courses, domains, nextSteps } = overview;
  const total = stats.pathCourses;
  const approved = stats.approvedPathCourses;
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0;

  const completedDomains = domains.filter((d) => {
    const domainCourses = courses.filter((c) => c.categoryId === d.categoryId && c.zone === 'PATH');
    return domainCourses.length > 0 && domainCourses.every((c) => c.slotStatus === 'COMPLETED');
  }).length;

  const nextCourse = nextSteps[0];

  return (
    <section className="pu-quick-stats-grid" aria-label="Thống kê nhanh">
      {/* Card 1: Tiến độ vị trí */}
      <article className="pu-qstat-card">
        <div className="pu-qstat-top">
          <span className="pu-qstat-label">Tiến độ chức danh</span>
          <div className="pu-qstat-icon-wrap blue" aria-hidden="true">
            <GraduationCap size={14} />
          </div>
        </div>
        <div className="pu-qstat-value">{pct}%</div>
        <div className="pu-qstat-progress-bar">
          <div className="pu-qstat-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="pu-qstat-sub">{approved}/{total} khóa hoàn thành</span>
      </article>

      {/* Card 2: Huy hiệu đã đạt (Thay thế để không trùng lặp với hàng đợi chờ chấm bên dưới) */}
      <article className="pu-qstat-card">
        <div className="pu-qstat-top">
          <span className="pu-qstat-label">Huy hiệu đã đạt</span>
          <div className="pu-qstat-icon-wrap emerald" aria-hidden="true">
            <Award size={14} />
          </div>
        </div>
        <div className="pu-qstat-value">{approved} môn</div>
        <div className="pu-qstat-status-badge emerald">
          <span>{approved > 0 ? 'M1-I đạt chuẩn' : 'Chưa có'}</span>
        </div>
        <span className="pu-qstat-sub">Chứng nhận kỹ năng số</span>
      </article>

      {/* Card 3: Việc tiếp theo */}
      <article className="pu-qstat-card">
        <div className="pu-qstat-top">
          <span className="pu-qstat-label">Ưu tiên làm tiếp</span>
          <div className="pu-qstat-icon-wrap blue" aria-hidden="true">
            <Target size={14} />
          </div>
        </div>
        <div className="pu-qstat-value code">{nextCourse?.code || 'Xong'}</div>
        {nextCourse ? (
          <button
            type="button"
            className="pu-qstat-action-btn"
            onClick={() => onSelectCourse(nextCourse)}
          >
            <span>Vào làm bài ngay</span>
            <ArrowRight size={11} />
          </button>
        ) : (
          <span className="pu-qstat-sub">Đã hoàn thành các việc mở</span>
        )}
      </article>

      {/* Card 4: Độ phủ 6 lĩnh vực */}
      <article className="pu-qstat-card">
        <div className="pu-qstat-top">
          <span className="pu-qstat-label">Độ phủ 6 lĩnh vực</span>
          <div className="pu-qstat-icon-wrap purple" aria-hidden="true">
            <Layers size={14} />
          </div>
        </div>
        <div className="pu-qstat-value">{completedDomains}/6</div>
        <div className="pu-qstat-status-badge slate">
          <span>{domains.length} lĩnh vực yêu cầu</span>
        </div>
        <span className="pu-qstat-sub">{completedDomains} lĩnh vực đạt chuẩn</span>
      </article>
    </section>
  );
}

/* ── 3. Review Queue Section (Phương án A: Hàng đợi chấm điểm) ─────────── */
function ReviewQueueSection({
  overview,
  onSelectCourse,
}: {
  overview: PulseOverview;
  onSelectCourse: (course: PulseCourseSummary) => void;
}) {
  const waiting = overview.courses.filter((c) => c.slotStatus === 'PRE_REVIEW' || c.slotStatus === 'IN_REVIEW');

  if (waiting.length === 0) return null;

  return (
    <section className="pu-review-queue-widget" aria-label="Hàng đợi chờ mentor chấm điểm">
      <div className="pu-review-queue-info">
        <div className="pu-review-queue-icon-wrap" aria-hidden="true">
          <Clock size={18} />
        </div>
        <div className="pu-review-queue-text">
          <div className="pu-review-queue-head">
            <strong>{waiting.length} bài kiểm tra đang chờ mentor chấm điểm</strong>
          </div>
          <p className="pu-review-queue-desc">
            Bấm vào từng môn bên dưới để xem bài đã nộp và tiêu chí đánh giá.
          </p>
        </div>
      </div>

      <div className="pu-review-queue-chips" role="list">
        {waiting.map((c) => (
          <button
            key={c.courseId}
            type="button"
            className="pu-review-chip-btn"
            onClick={() => onSelectCourse(c)}
            title={`Xem bài đã nộp của môn ${c.code} · ${c.title}`}
          >
            <span className="pu-review-chip-code">{c.code}</span>
            <span className="pu-review-chip-title">{toSentenceCase(c.title)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ── 4. Action Center (Việc nên làm tiếp) ──────────────────────────────── */
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
  const fresh = steps.length > 0 && overview.stats.approvedPathCourses === 0 && steps.every((s) => s.slotStatus === 'PRE_ASSESSMENT');

  const [activeSlide, setActiveSlide] = useState(0);
  const [mode, setMode] = useState<'carousel' | 'grid'>('carousel');

  const currentCourse = steps[activeSlide] ?? steps[0];

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % Math.max(1, steps.length));
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + steps.length) % Math.max(1, steps.length));

  return (
    <section className="pu-action-center" data-tour="emp-action-center" aria-labelledby="pu-action-title">
      {/* Action Header */}
      <div className="pu-action-head">
        <div>
          <h2 id="pu-action-title" className="pu-action-title">
            {steps.length === 0 ? 'Không còn việc đang mở' : fresh ? 'Bắt đầu bằng bài đánh giá đầu vào' : 'Việc nên làm tiếp'}
          </h2>
          <p className="pu-action-desc">
            {steps.length === 0
              ? 'Tất cả các khóa hiện tại đã đạt hoặc đang chờ mentor chấm duyệt.'
              : fresh
                ? 'Thực hiện bài đánh giá trước khi học để được miễn học lý thuyết nếu đã đạt năng lực.'
                : 'Các khóa học và bài kiểm tra ưu tiên theo tiến trình của bạn.'}
          </p>
        </div>

        {steps.length > 1 && (
          <div className="pu-action-controls">
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
        <article
          className="pu-action-featured-slide"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('button, a, input, select, textarea')) return;
            onSelectCourse(currentCourse);
          }}
          title="Bấm vào khoảng trống để xem nhanh đề cương"
        >
          <div className="pu-featured-slide-top">
            <div className="pu-featured-kicker-group">
              <span className="pu-featured-priority-badge">
                Ưu tiên #{activeSlide + 1}
              </span>
              <span className="pu-action-kicker">{stepKicker(currentCourse)}</span>
              <span className="pu-action-tier">{levelName(currentCourse.tier)}</span>
            </div>

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
            <article
              key={course.courseId}
              className={`pu-action-card${idx === 0 ? ' priority' : ''}`}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest('button, a, input, select, textarea')) return;
                onSelectCourse(course);
              }}
              title="Bấm vào khoảng trống để xem nhanh đề cương"
            >
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

/* ── 5. Biểu đồ Radar 6 góc & Tiến độ Lĩnh vực ────────────────────────── */
function DomainRadarSection({
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
            Đối chiếu trực quan mức năng lực số tích lũy so với chuẩn vị trí công việc.
          </p>
        </div>
        <PuLink to={PULSE_PATHS.path} kind="outline" small>
          Xem bản đồ lộ trình chi tiết <ArrowRight size={13} style={{ display: 'inline', marginLeft: 4 }} />
        </PuLink>
      </div>

      <div className="pu-domain-radar-split">
        {/* Cột trái: Biểu đồ Radar 6 góc */}
        <div className="pu-radar-panel">
          <div className="pu-radar-card">
            <div className="pu-radar-head">
              <span className="pu-radar-badge">Biểu đồ Radar Năng lực Số</span>
              <span className="pu-radar-sub-note">6 Lĩnh vực</span>
            </div>
            <CompetencyRadarSvg domains={domains} courses={overview.courses} />
            <div className="pu-radar-legend">
              <div className="pu-legend-item">
                <span className="pu-legend-color actual" />
                <span>Năng lực đã đạt</span>
              </div>
              <div className="pu-legend-item">
                <span className="pu-legend-color target" />
                <span>Chuẩn vị trí yêu cầu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Lưới 6 thẻ lĩnh vực thu gọn */}
        <div className="pu-domain-cards-compact-grid">
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
              <article key={domain.categoryId} className="pu-domain-compact-card">
                <div className="pu-domain-compact-head">
                  <div className="pu-domain-compact-info">
                    <span className="pu-domain-compact-code">{cleanDomainCode(domain.code)}</span>
                    <h3 className="pu-domain-compact-title">{domain.name}</h3>
                  </div>
                  <span className={`pu-domain-status-badge ${statusClass}`}>{statusText}</span>
                </div>

                <div className="pu-domain-compact-prog">
                  <div className="pu-domain-compact-meta">
                    <strong>{completedCount}/{totalCourses} khóa đạt</strong>
                    <span>{pct}%</span>
                  </div>
                  <div className="pu-hero-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} style={{ height: 5 }}>
                    <div className="pu-hero-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="pu-domain-compact-chips">
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
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── SVG Radar Chart Component (Crisp, zero-dependency, WCAG AA) ──────── */
const SHORT_DOMAIN_LABELS: Record<string, string> = {
  'TT02_D1': '01. Dữ liệu',
  'TT02_D2': '02. Giao tiếp',
  'TT02_D3': '03. Nội dung',
  'TT02_D4': '04. An toàn',
  'TT02_D5': '05. Kỹ thuật',
  'TT02_D6': '06. AI & Số',
};

function CompetencyRadarSvg({
  domains,
  courses,
}: {
  domains: PulseDomain[];
  courses: PulseCourseSummary[];
}) {
  const cx = 150;
  const cy = 135;
  const maxR = 85;
  const numAxes = 6;
  const maxLevel = 3; // Cấp 1, 2, 3

  // Tính mức đạt được và mức mục tiêu cho từng lĩnh vực (0 to 3)
  const dataPoints = domains.slice(0, 6).map((d) => {
    const domainCourses = courses.filter((c) => c.categoryId === d.categoryId && c.zone === 'PATH');
    const completedTiers = domainCourses.filter((c) => c.slotStatus === 'COMPLETED').map((c) => c.tier);
    const actualTier = completedTiers.length > 0 ? Math.max(...completedTiers) : 0;
    const targetTier = Math.min(maxLevel, d.target || 2);
    const label = SHORT_DOMAIN_LABELS[d.code] || cleanDomainCode(d.code);

    return {
      code: d.code,
      name: d.name,
      label,
      actual: actualTier,
      target: targetTier,
    };
  });

  // Tọa độ các điểm theo góc và bán kính
  const getCoordinates = (index: number, level: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / numAxes;
    const r = (level / maxLevel) * maxR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Vẽ các đa giác lục giác đồng tâm (levels 1, 2, 3)
  const gridLevels = [1, 2, 3];

  const targetPoints = dataPoints
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.target);
      return `${x},${y}`;
    })
    .join(' ');

  const actualPoints = dataPoints
    .map((d, i) => {
      // Đảm bảo có tối thiểu bán kính nhỏ để biểu đồ không bẹp
      const level = Math.max(0.15, d.actual);
      const { x, y } = getCoordinates(i, level);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="pu-radar-svg-wrap">
      <svg viewBox="0 0 300 270" className="pu-radar-svg" role="img" aria-label="Biểu đồ radar 6 lĩnh vực năng lực">
        {/* Lưới các đa giác đồng tâm */}
        {gridLevels.map((lvl) => {
          const points = Array.from({ length: numAxes })
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <polygon
              key={lvl}
              points={points}
              fill={lvl % 2 === 0 ? 'rgba(241, 245, 249, 0.5)' : 'none'}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* Các trục nan hoa từ tâm ra 6 đỉnh */}
        {Array.from({ length: numAxes }).map((_, i) => {
          const { x, y } = getCoordinates(i, maxLevel);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          );
        })}

        {/* Đa giác Chuẩn chức danh yêu cầu (Target) */}
        <polygon
          points={targetPoints}
          fill="rgba(148, 163, 184, 0.08)"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />

        {/* Đa giác Năng lực thực tế đạt được (Actual) */}
        <polygon
          points={actualPoints}
          fill="rgba(30, 64, 175, 0.22)"
          stroke="#1e40af"
          strokeWidth="2.2"
        />

        {/* Các điểm tròn trên đa giác thực tế */}
        {dataPoints.map((d, i) => {
          const level = Math.max(0.15, d.actual);
          const { x, y } = getCoordinates(i, level);
          const hasPassed = d.actual > 0;
          return (
            <circle
              key={d.code}
              cx={x}
              cy={y}
              r={hasPassed ? 4.5 : 3}
              fill={hasPassed ? '#1e40af' : '#94a3b8'}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Nhãn 6 đỉnh */}
        {dataPoints.map((d, i) => {
          const { x, y, angle } = getCoordinates(i, maxLevel);
          // Đẩy nhãn ra ngoài một chút
          const labelDist = 18;
          const lx = x + labelDist * Math.cos(angle);
          const ly = y + labelDist * Math.sin(angle);

          const textAnchor =
            Math.abs(Math.cos(angle)) < 0.2 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';

          return (
            <text
              key={d.code}
              x={lx}
              y={ly + 4}
              textAnchor={textAnchor}
              className="pu-radar-axis-label"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
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
