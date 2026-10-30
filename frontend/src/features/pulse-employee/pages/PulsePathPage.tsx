import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Compass, UserX, Target, FileText } from 'lucide-react';
import { usePulseOverview } from '@/hooks/use-pulse';
import type { PulseCourseSummary, PulseDomain, PulseOverview } from '@/services/pulse.service';
import {
  CourseAction,
  DomainTrack,
  RoadmapPlan,
  StatePill,
  toSentenceCase,
} from '../components/roadmap';
import { showsProgress, withinCeiling } from '../lib/course-state';
import { Empty, LoadError, PageSkeleton } from '../components/ui';
import { levelName, pad2, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';
import { QuickSyllabusDrawer } from '../components/QuickSyllabusDrawer';
import { JobPathfinderSection } from '../components/JobPathfinderSection';

/**
 * Lộ trình Năng lực (EM-02) - Enterprise Curriculum & Competency Spec
 * - Full-width Header: Thông tin chức danh, mục tiêu lộ trình, dải chỉ số inline gọn gàng.
 * - Job Fit Pathfinder: Chỉ số sẵn sàng năng lực số & tóm tắt 6 lĩnh vực.
 * - Full-width Blueprint: Bản vẽ lộ trình năng lực 100% chiều rộng.
 * - Modern Domain Accordion: Hiển thị thẻ khóa học trực quan, danh sách tiêu chí năng lực cô đọng.
 * - Quick Syllabus Slide-over Drawer: Bấm vào bất kỳ khóa nào để xem nhanh đề cương.
 */
export function PulsePathPage() {
  const { data, isLoading, error, refetch } = usePulseOverview();
  const [open, setOpen] = useState<string | null | undefined>(undefined);
  const [selectedCourse, setSelectedCourse] = useState<PulseCourseSummary | null>(null);

  if (isLoading) return <PageSkeleton blocks={[240, 420, 500]} />;
  if (error || !data) return <LoadError message={pulseErrorMessage(error, 'Không tải được lộ trình của bạn.')} onRetry={() => refetch()} />;
  if (!data.hasPosition || !data.hasTargets) return <NoPath overview={data} />;

  const domains = data.domains.filter((d) => d.target > 0);
  const firstActive = data.nextSteps[0]?.categoryId ?? domains[0]?.categoryId ?? null;
  const openId = open === undefined ? firstActive : open;

  return (
    <div className="pu-path-container">
      {/* 1. Full-width Header (Thông tin vị trí & Chỉ số) */}
      <PathHeader overview={data} />

      {/* 2. Job Fit Pathfinder: Semi-Circle Gauge & 6 Domain Breakdown */}
      <JobPathfinderSection overview={data} onSelectCourse={setSelectedCourse} />

      {/* 3. Full-width Blueprint (Bản vẽ lộ trình 100% chiều rộng) */}
      <BlueprintSection overview={data} onSelectCourse={setSelectedCourse} />

      {/* 4. Chi tiết 6 lĩnh vực & các khóa học yêu cầu */}
      <section aria-labelledby="pu-comp-title" className="pu-comp-section">
        <header className="pu-comp-section-head">
          <h2 id="pu-comp-title" className="pu-comp-section-title">
            Chi tiết 6 lĩnh vực và khóa học yêu cầu
          </h2>
          <p className="pu-comp-section-desc">
            Danh sách khóa học và tiêu chí năng lực chuẩn hóa theo từng lĩnh vực chuyên môn.
          </p>
        </header>

        <div className="pu-comp-list">
          {domains.map((domain) => (
            <CompetencyItem
              key={domain.categoryId}
              domain={domain}
              overview={data}
              open={openId === domain.categoryId}
              onToggle={() => setOpen(openId === domain.categoryId ? null : domain.categoryId)}
              onSelectCourse={setSelectedCourse}
            />
          ))}
        </div>
      </section>

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

/* ── 1. Full-width Header Component ────────────────────────────────────── */
function PathHeader({ overview }: { overview: PulseOverview }) {
  const { person, stats } = overview;
  const position = person.positionName ?? 'Vị trí của bạn';
  const domainCount = overview.domains.filter((d) => d.pathTop > 0).length;
  const next = overview.nextSteps[0];

  const deptRaw = person.departmentName?.trim();
  const dept = deptRaw
    ? deptRaw.toLowerCase().startsWith('phòng')
      ? deptRaw
      : `Phòng ${deptRaw}`
    : null;
  const orgSub = [dept, person.organizationName].filter(Boolean).join(' · ');

  return (
    <header className="pu-path-header">
      <div className="pu-path-header-main">
        <div className="pu-path-header-badge">
          <span>Lộ trình năng lực chức danh · Chuẩn doanh nghiệp</span>
        </div>
        <h1 className="pu-path-title">{position}</h1>
        <p className="pu-path-org">{orgSub || 'Doanh nghiệp'}</p>
        <p className="pu-path-desc">
          Doanh nghiệp yêu cầu vị trí này hoàn thành <strong>{domainCount} lĩnh vực</strong> với <strong>{stats.pathCourses} khóa học</strong> tương ứng <strong>{stats.requiredCompetencies} tiêu chí năng lực</strong> từ mức Cơ bản đến mức mục tiêu.
        </p>
      </div>

      <div className="pu-path-header-side">
        {/* Goal Card replacing Reviewer */}
        <div className="pu-path-goal-box">
          <div className="pu-path-goal-icon">
            <Target size={18} />
          </div>
          <div className="pu-path-goal-info">
            <small>MỤC TIÊU LỘ TRÌNH</small>
            <strong>Chuẩn hóa 6 lĩnh vực năng lực</strong>
            <span>Đạt chứng nhận hoàn thành chức danh</span>
          </div>
        </div>

        {/* Inline Stats */}
        <div className="pu-path-inline-stats">
          <div className="pu-stat-chip">
            <strong>{stats.pathCourses}</strong>
            <span>Khóa học</span>
          </div>
          <div className="pu-stat-chip">
            <strong>{stats.requiredCompetencies}</strong>
            <span>Tiêu chí năng lực</span>
          </div>
          <div className="pu-stat-chip">
            <strong>{domainCount}</strong>
            <span>Lĩnh vực</span>
          </div>
          {stats.optionalCourses > 0 && (
            <div className="pu-stat-chip">
              <strong>{stats.optionalCourses}</strong>
              <span>Tùy chọn</span>
            </div>
          )}
        </div>

        {/* Primary CTA */}
        {next && (
          <div className="pu-path-header-cta">
            <CourseAction course={next} />
          </div>
        )}
      </div>
    </header>
  );
}

/* ── 2. Full-width Blueprint Section ───────────────────────────────────── */
function BlueprintSection({
  overview,
  onSelectCourse,
}: {
  overview: PulseOverview;
  onSelectCourse?: (course: PulseCourseSummary) => void;
}) {
  const position = overview.person.positionName ?? 'của bạn';
  const { stats, person } = overview;
  return (
    <section className="pu-blueprint-section" aria-labelledby="pu-blueprint-heading">
      <div className="pu-blueprint-head">
        <div>
          <h2 id="pu-blueprint-heading" className="pu-blueprint-title">
            Bản vẽ lộ trình năng lực số · {position}
          </h2>
          <p className="pu-blueprint-sub">
            Khóa học phân bổ theo 3 cấp độ (Cơ bản → Trung cấp → Nâng cao) phục vụ chuẩn hóa chức danh.
          </p>
        </div>
        <div className="pu-titleblock" aria-hidden>
          <span>Khung: Tiêu chuẩn vị trí</span>
          <span>Vị trí: {position}</span>
          <span>Quy mô: {stats.pathCourses} khóa</span>
          <span>Trần: {person.departmentName ? (person.departmentName.trim().toLowerCase().startsWith('phòng') ? person.departmentName.trim() : `Phòng ${person.departmentName.trim()}`) : 'Phòng ban'}</span>
        </div>
      </div>

      <RoadmapPlan
        overview={overview}
        variant="regular"
        caption={`Bản vẽ lộ trình ${position}: tên khóa theo lĩnh vực và cấp độ`}
        onSelectCourse={onSelectCourse}
      />
    </section>
  );
}

/* ── 3. Redesigned Competency Accordion Item (Visual & Concise) ────────── */
function CompetencyItem({
  domain,
  overview,
  open,
  onToggle,
  onSelectCourse,
}: {
  domain: PulseDomain;
  overview: PulseOverview;
  open: boolean;
  onToggle: () => void;
  onSelectCourse?: (course: PulseCourseSummary) => void;
}) {
  const courses = withinCeiling(overview.courses).filter((c) => c.categoryId === domain.categoryId).sort((a, b) => a.tier - b.tier);
  const path = courses.filter((c) => c.zone === 'PATH');
  const code = courses[0]?.code.split('-')[0] ?? domain.code;
  const bodyId = `pu-comp-${domain.categoryId}`;

  const ceilingLimited = domain.ceiling < domain.target;

  return (
    <article className="pu-comp-card" data-open={open}>
      <button
        type="button"
        className="pu-comp-header-btn"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={onToggle}
      >
        <span className="pu-comp-num-badge">{pad2(domain.number)}</span>
        <div className="pu-comp-title-block">
          <div className="pu-comp-title-row">
            <span className="pu-comp-code-tag">{code}</span>
            <strong className="pu-comp-name">{domain.name}</strong>
          </div>
          <span className="pu-comp-meta">
            Mục tiêu vị trí: <strong>{levelName(domain.target)}</strong> · Phòng ban mở đến: <strong>{levelName(domain.ceiling)}</strong> · {path.length} khóa trong lộ trình
          </span>
        </div>

        <div className="pu-comp-right-stats">
          <DomainTrack courses={courses} />
          <div className="pu-comp-progress-num">
            <strong>{path.filter((c) => c.approved).length}/{path.length}</strong>
            <small>khóa đã đạt</small>
          </div>
          <span className="pu-comp-chevron" aria-hidden>
            <ChevronDown size={18} />
          </span>
        </div>
      </button>

      {/* Accordion Body: Concise Tags & Clean Course Cards */}
      {open && (
        <div className="pu-comp-body-clean" id={bodyId}>
          {/* Competency Tags Row */}
          <div className="pu-comp-tags-section">
            <div className="pu-comp-tags-head">
              <span className="pu-comp-tags-label">Tiêu chí năng lực cần đạt ({domain.competencies.length}):</span>
              {ceilingLimited && (
                <span className="pu-ceiling-tag">
                  Giới hạn phòng ban: mở đến {levelName(domain.ceiling)}
                </span>
              )}
            </div>
            <div className="pu-comp-tags-wrap">
              {domain.competencies.map((comp) => (
                <div key={comp.code} className="pu-comp-tag-item" title={comp.name}>
                  <strong>{comp.code}</strong>
                  <span>{comp.name}</span>
                  <small className="pu-comp-tag-level">({levelName(comp.requiredLevel)})</small>
                </div>
              ))}
            </div>
          </div>

          {/* Courses List as Clean Visual Cards */}
          <div className="pu-comp-courses-section">
            <h3 className="pu-comp-courses-heading">
              Các khóa học trong lĩnh vực ({courses.length})
            </h3>
            <div className="pu-comp-cards-grid">
              {courses.map((course) => (
                <CourseVisualCard
                  key={course.courseId}
                  course={course}
                  onSelectCourse={onSelectCourse}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function CourseVisualCard({
  course,
  onSelectCourse,
}: {
  course: PulseCourseSummary;
  onSelectCourse?: (course: PulseCourseSummary) => void;
}) {
  const isDone = course.slotStatus === 'COMPLETED';
  const isLearning = course.slotStatus === 'IN_PROGRESS';
  const isWaiting = course.slotStatus === 'PRE_REVIEW' || course.slotStatus === 'IN_REVIEW';
  const progress = showsProgress(course);

  return (
    <div className={`pu-path-course-card ${isDone ? 'is-done' : isLearning ? 'is-learning' : isWaiting ? 'is-waiting' : ''}`}>
      <div className="pu-path-course-top">
        <div className="pu-path-course-badges">
          <span className="pu-path-course-code">{course.code}</span>
          <span className="pu-station-tier-tag">{levelName(course.tier)}</span>
        </div>
        <StatePill course={course} />
      </div>

      <h4 className="pu-path-course-title">
        {onSelectCourse ? (
          <button
            type="button"
            className="pu-path-course-title-btn"
            onClick={() => onSelectCourse(course)}
            title="Bấm để xem nhanh đề cương"
          >
            {toSentenceCase(course.title)}
          </button>
        ) : (
          <Link to={PULSE_PATHS.course(course.courseId)}>
            {toSentenceCase(course.title)}
          </Link>
        )}
      </h4>

      <div className="pu-path-course-meta">
        <span>{course.moduleCount || 3} mô đun kiến thức</span>
        <span>·</span>
        <span>Ước tính 06 giờ</span>
      </div>

      {progress && (
        <div className="pu-path-course-prog">
          <div className="pu-hero-bar" role="progressbar" aria-valuenow={course.progressPercent} aria-valuemin={0} aria-valuemax={100} style={{ height: 5 }}>
            <div className="pu-hero-bar-fill" style={{ width: `${course.progressPercent}%` }} />
          </div>
          <small>{course.progressPercent}% đã học</small>
        </div>
      )}

      <div className="pu-path-course-actions">
        <CourseAction course={course} />
        {onSelectCourse && (
          <button
            type="button"
            className="pu-path-syllabus-btn"
            onClick={() => onSelectCourse(course)}
          >
            <FileText size={13} />
            <span>Đề cương</span>
          </button>
        )}
      </div>
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
