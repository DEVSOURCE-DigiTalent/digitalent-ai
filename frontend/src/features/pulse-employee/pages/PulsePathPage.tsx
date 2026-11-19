import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import { useState } from 'react';
import { translateUi } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Compass,
  GitBranch,
  LayoutGrid,
  Lock,
  ShoppingCart,
  Target,
  UserX,
  Zap,
} from 'lucide-react';
import { usePulseOverview } from '@/hooks/use-pulse';
import { useIsEnterpriseTrial } from '@/hooks/use-trial-program';
import type { PulseCourseSummary, PulseDomain, PulseOverview } from '@/services/pulse.service';
import { LevelDots, RoadmapPlan, toSentenceCase } from '../components/roadmap';
import { doneLabel, showsProgress } from '../lib/course-state';
import { Empty, LoadError, PageSkeleton } from '../components/ui';
import { levelName, pad2, pulseErrorMessage } from '../lib/labels';
import {
  departmentTitle,
  isBeyond,
  meetsRequirement,
  roadmapDomains,
  visibleCourses,
} from '../lib/requirement';
import { PULSE_PATHS } from '../lib/paths';
import { QuickSyllabusDrawer } from '../components/QuickSyllabusDrawer';
import { TrialLearning } from '../components/TrialLearning';
import heroBgArt from '@/assets/pulse/enterprise-hero-bg.jpg';
import '../path-hero.css';

const domainAnchor = (categoryId: string) => `pu-domain-${categoryId}`;

/**
 * Lộ trình Năng lực Chuẩn hóa (EM-02)
 * 1. Banner chức danh, đơn vị công tác và tiến độ lộ trình.
 * 3. Bộ điều khiển góc nhìn: [Bản đồ Hành trình (Mindmap)] và [Bảng Ma trận (Matrix)]
 * 4. Mindmap: mỗi lĩnh vực hiện mọi khóa doanh nghiệp đã có — bắt buộc tới mức tối thiểu, cao hơn là học vượt
 * 5. Quick Syllabus Drawer: xem đề cương & điều kiện miễn học 1-click
 */
export function PulsePathPage() {
  const { data, isLoading, error, refetch } = usePulseOverview();
  const trial = useIsEnterpriseTrial();
  const [selectedCourse, setSelectedCourse] = useState<PulseCourseSummary | null>(null);
  const [viewMode, setViewMode] = useState<'mindmap' | 'matrix'>('mindmap');

  if (isLoading) return <PageSkeleton blocks={[100, 240, 400]} />;
  if (error || !data) return <LoadError message={translateUi(pulseErrorMessage(error, 'Không tải được lộ trình của bạn.'))} onRetry={() => refetch()} />;
  if (data.awaitingFramework || (trial && (!data.hasPosition || !data.hasTargets))) return <TrialLearning overview={data} />;
  if (!data.hasPosition || !data.hasTargets) return <NoPath overview={data} />;

  const domains = roadmapDomains(data);

  return (
    <div className="pu-path-container">
      {/* 1. Tiêu đề: chức danh & đơn vị công tác */}
      <PathHeaderSection overview={data} />

      {/* 3. Thanh điều hướng góc nhìn & Chú giải */}
      <div className="pu-path-controls-bar">
        <div className="pu-view-switcher" role="tablist" aria-label="Chế độ hiển thị lộ trình">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'mindmap'}
            className={`pu-view-tab ${viewMode === 'mindmap' ? 'active' : ''}`}
            onClick={() => setViewMode('mindmap')}
          >
            <GitBranch size={14} />
            <span>Bản đồ Hành trình (Mindmap)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'matrix'}
            className={`pu-view-tab ${viewMode === 'matrix' ? 'active' : ''}`}
            onClick={() => setViewMode('matrix')}
          >
            <LayoutGrid size={14} />
            <span>Bảng Ma trận Cấp độ</span>
          </button>
        </div>

        <div className="pu-view-legend" aria-hidden="true">
          <span><i className="pu-legend-dot done" />Đạt mức yêu cầu</span>
          <span><i className="pu-legend-dot attention" />Chưa đạt mức tối thiểu</span>
        </div>
      </div>

      {/* 4. Nội dung lộ trình theo góc nhìn đã chọn */}
      {viewMode === 'mindmap' ? (
        <MindmapJourney
          overview={data}
          domains={domains}
          onSelectCourse={setSelectedCourse}
        />
      ) : (
        <section className="pu-matrix-section" aria-labelledby="pu-matrix-heading">
          <header className="pu-matrix-head">
            <div>
              <h2 id="pu-matrix-heading" className="pu-matrix-title">
                Bảng ma trận lộ trình năng lực số · {data.person.positionName ?? 'Vị trí'}
              </h2>
              <p className="pu-matrix-sub">
                Mỗi lĩnh vực: khóa bắt buộc tới mức tối thiểu doanh nghiệp yêu cầu.
              </p>
            </div>
          </header>
          <RoadmapPlan
            overview={data}
            variant="regular"
            caption={`Bản vẽ lộ trình ${data.person.positionName}: tên khóa theo lĩnh vực và cấp độ`}
            onSelectCourse={setSelectedCourse}
          />
        </section>
      )}

      {/* 5. Slide-over Drawer xem nhanh đề cương */}
      <QuickSyllabusDrawer
        course={selectedCourse}
        overview={data}
        open={Boolean(selectedCourse)}
        onClose={() => setSelectedCourse(null)}
      />
    </div>
  );
}

/* ── 1. Page Header: Title Block ───── */
function PathHeaderSection({ overview }: { overview: PulseOverview }) {
  const manager = useCurrentUser((state) => Boolean(state.user?.roles.includes(ROLES.MANAGER)));
  const { person } = overview;
  const position = person.positionName ?? 'Vị trí công việc';
  const orgSub = [departmentTitle(person.departmentName), person.organizationName].filter(Boolean).join(' · ');
  if (!manager) {
    return (
      <header className="pu-path-header-group">
        {/* Tiêu đề hiển thị trực tiếp trên nền (không bọc khung) */}
        <div className="pu-path-title-block">
          <div className="pu-path-badge-pill">
            <Award size={13} className="text-blue-700" />
            <span>Lộ trình Chuẩn hóa Năng lực Số Doanh nghiệp</span>
          </div>
          <h1 className="pu-path-main-title">{position}</h1>
          <p className="pu-path-sub-title">{orgSub || 'Công ty Cổ phần Công nghệ DigiTalent Việt Nam'}</p>
        </div>
      </header>
    );
  }

  const total = overview.stats.pathCourses;
  const completed = overview.stats.approvedPathCourses;
  const percent = total > 0 ? Math.min(100, Math.round(completed / total * 100)) : 0;
  const requiredDomains = overview.domains.filter((domain) => domain.pathTop > 0);
  const metDomains = requiredDomains.filter(meetsRequirement).length;

  return (
    <header className="pu-path-header-group pu-path-hero">
      <div className="pu-path-hero__backdrop" style={{ backgroundImage: `url(${heroBgArt})` }} aria-hidden="true" />
      <div className="pu-path-title-block">
        <div className="pu-path-badge-pill">
          <Award size={13} />
          <span>Lộ trình Chuẩn hóa Năng lực Số Doanh nghiệp</span>
        </div>
        <h1 className="pu-path-main-title">{position}</h1>
        <p className="pu-path-sub-title">{orgSub || 'Công ty Cổ phần Công nghệ DigiTalent Việt Nam'}</p>
      </div>
      <div className="pu-path-hero__progress">
        <div
          className="pu-path-hero__ring"
          role="progressbar"
          aria-label="Tiến độ hoàn thành khóa học trong lộ trình"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ background: `conic-gradient(#a6d6ff ${percent}%, #ffffff26 0)` }}
        >
          <span>{percent}<small>%</small></span>
        </div>
        <div className="pu-path-hero__summary">
          <p>Tiến độ lộ trình</p>
          <strong>{completed}<span> / {total} khóa hoàn thành</span></strong>
          <div><Target size={14} aria-hidden="true" />{metDomains}/{requiredDomains.length} lĩnh vực đạt mức yêu cầu</div>
        </div>
      </div>
    </header>
  );
}

/* ── 3. Mindmap Sequential Learning Journey ────────────────────────────── */
function MindmapJourney({
  overview,
  domains,
  onSelectCourse,
}: {
  overview: PulseOverview;
  domains: PulseDomain[];
  onSelectCourse: (course: PulseCourseSummary) => void;
}) {
  return (
    <div className="pu-mindmap-timeline" role="feed" aria-label="Dòng chảy lộ trình năng lực tuần tự">
      {domains.map((domain, stationIdx) => {
        const domainCourses = visibleCourses(overview, domain);
        const requiredCourses = domainCourses.filter((c) => c.zone === 'PATH');
        const approvedRequired = requiredCourses.filter((c) => c.approved);
        const required = domain.pathTop > 0;
        const met = meetsRequirement(domain);
        const needsAttention = required && !met;
        const hasInProgress = domainCourses.some((c) => c.slotStatus === 'IN_PROGRESS');
        const hasWaiting = domainCourses.some((c) => c.slotStatus === 'PRE_REVIEW' || c.slotStatus === 'IN_REVIEW');
        const hasActivePreTest = requiredCourses.some((c) => c.slotStatus === 'PRE_ASSESSMENT' || c.canStartPreAssessment);
        const isCurrentStation = overview.nextSteps.some((ns) => ns.categoryId === domain.categoryId);
        const stationNumber = pad2(stationIdx + 1);

        const stationStatusClass = required && met
          ? 'done'
          : isCurrentStation || hasActivePreTest
            ? 'current'
            : hasInProgress
              ? 'learning'
              : hasWaiting
                ? 'waiting'
                : needsAttention
                  ? 'attention'
                  : 'upcoming';

        return (
          <article
            key={domain.categoryId}
            id={domainAnchor(domain.categoryId)}
            className="pu-mindmap-station"
            aria-label={`Lĩnh vực ${stationNumber}: ${domain.name}`}
          >
            {/* Cột mốc Timeline (Mindmap Node Marker) */}
            <div className={`pu-station-indicator ${stationStatusClass}`}>
              {stationStatusClass === 'done' ? (
                <Check size={18} strokeWidth={3} />
              ) : stationStatusClass === 'current' ? (
                <Target size={18} />
              ) : stationStatusClass === 'learning' ? (
                <BookOpen size={17} />
              ) : stationStatusClass === 'waiting' ? (
                <Clock size={17} />
              ) : (
                <span>{stationNumber}</span>
              )}
            </div>

            {/* Nội dung lĩnh vực */}
            <div className={`pu-station-card is-${stationStatusClass}${needsAttention ? ' needs-attention' : ''}`}>
              {/* Đầu thẻ: Tên lĩnh vực & trạng thái */}
              <div className="pu-station-head">
                <div className="pu-station-title-group">
                  <h2 className="pu-station-name">
                    Lĩnh vực {stationNumber}: {domain.name}
                  </h2>
                </div>

                <div className="pu-station-status-side">
                  {required && met ? (
                    <span className="pu-station-pill done">
                      <Check size={11} strokeWidth={3} /> Đạt mức yêu cầu
                    </span>
                  ) : hasInProgress ? (
                    <span className="pu-station-pill learning">
                      Đang học ({approvedRequired.length}/{requiredCourses.length})
                    </span>
                  ) : hasWaiting ? (
                    <span className="pu-station-pill waiting">
                      <Clock size={11} /> Chờ đánh giá
                    </span>
                  ) : required ? (
                    <span className="pu-station-pill attention">
                      Chưa học ({requiredCourses.length} khóa bắt buộc)
                    </span>
                  ) : (
                    <span className="pu-station-pill upcoming">Không bắt buộc</span>
                  )}
                </div>
              </div>

              {/* Dòng chảy các khóa học trong lĩnh vực (L1 -> L2 -> L3) */}
              <div className="pu-station-courses-flow">
                {domainCourses.map((course, idx) => (
                  <div key={course.courseId} className="pu-station-step-wrapper">
                    {idx > 0 && (
                      <div className={`pu-station-step-arrow${isBeyond(course) ? ' beyond' : ''}`} aria-hidden="true">
                        <ChevronRight size={18} />
                      </div>
                    )}
                    <StationCourseCard
                      course={course}
                      requirementGap={needsAttention && course.zone === 'PATH' && !course.approved}
                      onSelectCourse={onSelectCourse}
                    />
                  </div>
                ))}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/** Một khóa trong lĩnh vực: bắt buộc (vàng khi lĩnh vực chưa đạt mức tối thiểu) hoặc học vượt. */
function StationCourseCard({
  course,
  requirementGap,
  onSelectCourse,
}: {
  course: PulseCourseSummary;
  requirementGap: boolean;
  onSelectCourse: (course: PulseCourseSummary) => void;
}) {
  const isDone = course.approved || course.slotStatus === 'COMPLETED';
  const isInProgress = course.slotStatus === 'IN_PROGRESS';
  const isPreTest = course.slotStatus === 'PRE_ASSESSMENT' || course.canStartPreAssessment;
  const isWaiting = course.slotStatus === 'PRE_REVIEW' || course.slotStatus === 'IN_REVIEW';
  const isPurchaseNeeded = course.slotStatus === 'PURCHASE_NEEDED';
  const isLocked = course.slotStatus === 'AFTER_PRIOR_LEVEL' || course.zone === 'ABOVE_CEILING';
  const beyond = isBeyond(course);

  const stateClass = isDone
    ? 'done'
    : isInProgress
      ? 'learning'
      : isPreTest
        ? 'pretest'
        : isWaiting
          ? 'waiting'
          : isLocked || isPurchaseNeeded
            ? 'locked'
            : '';

  return (
    <div
      className={[
        'pu-station-course-card',
        stateClass,
        beyond ? 'beyond' : '',
        requirementGap ? 'required-gap' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="pu-scard-top">
        <span className="pu-scard-level">
          Khóa {levelName(course.tier)} <LevelDots level={course.tier} />
        </span>
        {requirementGap && !beyond && (
          <span className="pu-scard-zone required" title="Cần đạt để đủ mức tối thiểu doanh nghiệp yêu cầu">
            Bắt buộc
          </span>
        )}
        {isDone && (
          <span className="pu-scard-badge done">
            <Check size={10} strokeWidth={3} /> Đã đạt
          </span>
        )}
        {isInProgress && (
          <span className="pu-scard-badge learning">
            {course.progressPercent}%
          </span>
        )}
        {isPreTest && !isDone && (
          <span className="pu-scard-badge pretest">
            <Zap size={10} /> Đánh giá đầu vào
          </span>
        )}
        {isWaiting && (
          <span className="pu-scard-badge waiting">
            Chờ duyệt
          </span>
        )}
        {isPurchaseNeeded && (
          <span className="pu-scard-badge locked">
            <ShoppingCart size={10} /> Chưa mua
          </span>
        )}
        {isLocked && (
          <span className="pu-scard-badge locked">
            <Lock size={10} /> Chưa mở
          </span>
        )}
      </div>

      <button
        type="button"
        className="pu-scard-title"
        onClick={() => onSelectCourse(course)}
        title="Bấm để xem nhanh đề cương"
      >
        {toSentenceCase(course.title)}
      </button>

      <div className="pu-scard-meta">
        <span>{course.moduleCount || 3} mô đun</span>
        <span>·</span>
        <span>Ước tính ~06 giờ</span>
      </div>

      {isInProgress && showsProgress(course) && (
        <div className="pu-scard-prog-track">
          <div
            className="pu-scard-prog-fill"
            style={{ width: `${course.progressPercent}%` }}
          />
        </div>
      )}

      <div className="pu-scard-actions">
        {isDone ? (
          <span className="pu-scard-done-tag">
            <Check size={11} strokeWidth={3} /> {doneLabel(course)}
          </span>
        ) : isPreTest ? (
          <Link
            to={PULSE_PATHS.preAssessment(course.courseId)}
            className="pu-scard-cta pretest"
          >
            <Zap size={12} /> Làm bài đánh giá đầu vào →
          </Link>
        ) : isInProgress ? (
          <Link
            to={PULSE_PATHS.course(course.courseId)}
            className="pu-scard-cta study"
          >
            Học tiếp →
          </Link>
        ) : isWaiting ? (
          <Link
            to={PULSE_PATHS.preAssessment(course.courseId)}
            className="pu-scard-cta review"
          >
            Xem bài nộp
          </Link>
        ) : isPurchaseNeeded ? (
          <span className="pu-scard-locked-hint">Chờ doanh nghiệp mua khóa</span>
        ) : isLocked ? (
          <span className="pu-scard-locked-hint">
            Mở khi đạt {levelName(course.tier - 1)}
          </span>
        ) : (
          <Link
            to={PULSE_PATHS.course(course.courseId)}
            className={`pu-scard-cta default${beyond ? ' beyond' : ''}`}
          >
            {beyond ? 'Học vượt →' : 'Bắt đầu học →'}
          </Link>
        )}
      </div>
    </div>
  );
}

/* ── 4. Empty State ────────────────────────────────────────────────────── */
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
