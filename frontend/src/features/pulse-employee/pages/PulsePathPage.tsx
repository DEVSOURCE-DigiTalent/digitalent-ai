import { useState } from 'react';
import { translateUi } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  FileText,
  GitBranch,
  LayoutGrid,
  Lock,
  Rocket,
  ShoppingCart,
  Sparkles,
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
  openLevel,
  remainingRequired,
  requirementSource,
  roadmapDomains,
  visibleCourses,
} from '../lib/requirement';
import { PULSE_PATHS } from '../lib/paths';
import { QuickSyllabusDrawer } from '../components/QuickSyllabusDrawer';
import { TrialLearning } from '../components/TrialLearning';

const domainAnchor = (categoryId: string) => `pu-domain-${categoryId}`;

/**
 * Lộ trình Năng lực Chuẩn hóa (EM-02)
 * 1. Khối tiêu đề (chức danh & đơn vị công tác) + thẻ nhiệm vụ ưu tiên tiếp theo
 * 2. Tóm tắt mức tối thiểu doanh nghiệp yêu cầu (vàng khi còn lĩnh vực chưa đạt)
 * 3. Bộ điều khiển góc nhìn: [Bản đồ Hành trình (Mindmap)] và [Bảng Ma trận (Matrix)]
 * 4. Mindmap: mỗi lĩnh vực hiện mọi khóa doanh nghiệp đã có — bắt buộc tới mức tối thiểu, cao hơn là học vượt
 * 5. Quick Syllabus Drawer: xem đề cương & điều kiện miễn học 1-click
 */
export function PulsePathPage() {
  const { data, isLoading, error, refetch } = usePulseOverview();
  const trial = useIsEnterpriseTrial();
  const [selectedCourse, setSelectedCourse] = useState<PulseCourseSummary | null>(null);
  const [viewMode, setViewMode] = useState<'mindmap' | 'matrix'>('mindmap');
  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(new Set());

  if (isLoading) return <PageSkeleton blocks={[100, 240, 400]} />;
  if (error || !data) return <LoadError message={translateUi(pulseErrorMessage(error, 'Không tải được lộ trình của bạn.'))} onRetry={() => refetch()} />;
  if (data.awaitingFramework || (trial && (!data.hasPosition || !data.hasTargets))) return <TrialLearning overview={data} />;
  if (!data.hasPosition || !data.hasTargets) return <NoPath overview={data} />;

  const domains = roadmapDomains(data);

  const toggleCriteria = (categoryId: string) => {
    setExpandedCriteria((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const showDomain = (categoryId: string) => {
    setViewMode('mindmap');
    requestAnimationFrame(() => document.getElementById(domainAnchor(categoryId))?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <div className="pu-path-container">
      {/* 1. Tiêu đề riêng biệt & Thẻ nhiệm vụ ưu tiên tiếp theo */}
      <PathHeaderSection overview={data} domains={domains} onSelectCourse={setSelectedCourse} />

      {/* 2. Mức tối thiểu doanh nghiệp yêu cầu */}
      <RequirementSummary overview={data} domains={domains} onShowDomain={showDomain} />

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
          <span><i className="pu-legend-dot current" />Lĩnh vực ưu tiên</span>
          <span><i className="pu-legend-dot beyond" />Học vượt</span>
        </div>
      </div>

      {/* 4. Nội dung lộ trình theo góc nhìn đã chọn */}
      {viewMode === 'mindmap' ? (
        <MindmapJourney
          overview={data}
          domains={domains}
          expandedCriteria={expandedCriteria}
          onToggleCriteria={toggleCriteria}
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
                Mỗi lĩnh vực: khóa bắt buộc tới mức tối thiểu doanh nghiệp yêu cầu, các khóa doanh nghiệp đã mua ở cấp cao hơn để học vượt.
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

/* ── 1. Page Header: Title Block + Priority Mission ───── */
function PathHeaderSection({
  overview,
  domains,
  onSelectCourse,
}: {
  overview: PulseOverview;
  domains: PulseDomain[];
  onSelectCourse: (course: PulseCourseSummary) => void;
}) {
  const { person, nextSteps } = overview;
  const position = person.positionName ?? 'Vị trí công việc';
  const nextCourse = nextSteps[0];

  const orgSub = [departmentTitle(person.departmentName), person.organizationName].filter(Boolean).join(' · ');

  // Lĩnh vực và cấp độ của khóa học ưu tiên tiếp theo
  const nextStationIdx = nextCourse ? domains.findIndex((d) => d.categoryId === nextCourse.categoryId) : -1;
  const nextDomain = nextStationIdx >= 0 ? domains[nextStationIdx] : null;
  const stationLabel = nextStationIdx >= 0 ? `Lĩnh vực ${pad2(nextStationIdx + 1)}` : null;

  const isPreTest = nextCourse?.slotStatus === 'PRE_ASSESSMENT' || nextCourse?.canStartPreAssessment;
  const isInProgress = nextCourse?.slotStatus === 'IN_PROGRESS';
  const isWaitingReview = nextCourse?.slotStatus === 'PRE_REVIEW' || nextCourse?.slotStatus === 'IN_REVIEW';
  const nextIsBeyond = nextCourse ? isBeyond(nextCourse) : false;

  return (
    <header className="pu-path-header-group">
      {/* Khối 1: Tiêu đề riêng biệt trên cùng (Không bọc khung, hiển thị trực tiếp trên nền) */}
      <div className="pu-path-title-block">
        <div className="pu-path-badge-pill">
          <Award size={13} className="text-blue-700" />
          <span>Lộ trình Chuẩn hóa Năng lực Số Doanh nghiệp</span>
        </div>
        <h1 className="pu-path-main-title">{position}</h1>
        <p className="pu-path-sub-title">{orgSub || 'Công ty Cổ phần Công nghệ DigiTalent Việt Nam'}</p>
      </div>

      {/* Khối 2: Thẻ Nhiệm vụ ưu tiên tiếp theo (Chuẩn bộ màu Xanh thương hiệu) */}
      {nextCourse && (
        <div className={`pu-priority-mission-card${nextIsBeyond ? ' beyond' : ''}`}>
          <div className="pu-pmission-indicator">
            {nextIsBeyond ? <Rocket size={18} className="pu-beyond-icon" /> : <Sparkles size={18} className="text-blue-700" />}
          </div>

          <div className="pu-pmission-main">
            <div className="pu-pmission-header-line">
              <span className="pu-pmission-kicker">{nextIsBeyond ? 'Gợi ý học vượt' : 'Nhiệm vụ ưu tiên tiếp theo'}</span>
              {stationLabel && nextDomain && (
                <span className="pu-pmission-station-chip">
                  {stationLabel}: {nextDomain.name} · {levelName(nextCourse.tier)}
                </span>
              )}
            </div>

            <h2
              className="pu-pmission-course-title"
              onClick={() => onSelectCourse(nextCourse)}
              title="Bấm để xem nhanh đề cương khóa học"
            >
              {toSentenceCase(nextCourse.title)}
            </h2>

            <p className="pu-pmission-explanation">
              {isPreTest
                ? 'Làm bài kiểm tra đánh giá năng lực đầu vào (~20 phút). Đạt kết quả sẽ được xét miễn học ngay toàn bộ khóa học này.'
                : isInProgress
                  ? `Khóa học đang học dở dang (đã hoàn thành ${nextCourse.progressPercent}%). Hãy tiếp tục bài học tiếp theo để hoàn thành khóa học.`
                  : isWaitingReview
                    ? 'Bài kiểm tra của bạn đã nộp thành công và đang chờ xác nhận kết quả.'
                    : nextIsBeyond
                      ? 'Bạn đã đạt mọi mức tối thiểu doanh nghiệp yêu cầu. Khóa này doanh nghiệp đã mua: học vượt để phát triển thêm, việc này được khuyến khích.'
                      : 'Khóa bắt buộc tiếp theo để đạt mức tối thiểu doanh nghiệp yêu cầu.'}
            </p>
          </div>

          <div className="pu-pmission-action-group">
            {isPreTest ? (
              <Link
                to={PULSE_PATHS.preAssessment(nextCourse.courseId)}
                className="pu-pmission-cta-btn primary pretest"
              >
                <Zap size={14} />
                <span>Đánh giá đầu vào ngay</span>
                <ChevronRight size={14} className="pu-arrow-icon" />
              </Link>
            ) : isInProgress ? (
              <Link
                to={PULSE_PATHS.course(nextCourse.courseId)}
                className="pu-pmission-cta-btn primary study"
              >
                <BookOpen size={14} />
                <span>Tiếp tục học ngay</span>
                <ChevronRight size={14} className="pu-arrow-icon" />
              </Link>
            ) : (
              <Link
                to={PULSE_PATHS.course(nextCourse.courseId)}
                className="pu-pmission-cta-btn primary default"
              >
                <span>Bắt đầu học ngay</span>
                <ChevronRight size={14} className="pu-arrow-icon" />
              </Link>
            )}

            <button
              type="button"
              className="pu-pmission-cta-btn secondary"
              onClick={() => onSelectCourse(nextCourse)}
              title="Xem đề cương khóa học"
            >
              <FileText size={13} />
              <span>Xem đề cương</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ── 2. Mức tối thiểu doanh nghiệp yêu cầu ─────────────────────────────── */
function RequirementSummary({
  overview,
  domains,
  onShowDomain,
}: {
  overview: PulseOverview;
  domains: PulseDomain[];
  onShowDomain: (categoryId: string) => void;
}) {
  const required = domains.filter((d) => d.pathTop > 0);
  if (required.length === 0) return null;

  const unmet = required.filter((d) => !meetsRequirement(d));
  const beyondOpen = overview.courses.filter((c) => isBeyond(c) && !c.approved).length;
  const department = departmentTitle(overview.person.departmentName);
  const byDepartment = required.some((d) => d.requiredByDepartment);
  const who = byDepartment && department ? `doanh nghiệp yêu cầu cho ${department}` : 'doanh nghiệp yêu cầu';
  const beyondNote = beyondOpen > 0
    ? `${beyondOpen} khóa doanh nghiệp đã mua ở cấp cao hơn luôn mở để bạn học vượt. Học vượt là định hướng riêng của bạn và được khuyến khích.`
    : 'Khi doanh nghiệp mua thêm khóa ở cấp cao hơn, khóa sẽ mở ngay để bạn học vượt.';

  if (unmet.length === 0) {
    return (
      <section className="pu-req-summary met" aria-label="Mức tối thiểu doanh nghiệp yêu cầu">
        <span className="pu-req-summary-icon" aria-hidden="true"><Check size={18} strokeWidth={3} /></span>
        <div className="pu-req-summary-body">
          <strong className="pu-req-summary-title">Bạn đã đạt mọi mức tối thiểu {who}.</strong>
          <p className="pu-req-summary-note">{beyondNote}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pu-req-summary gap" role="status" aria-label="Lĩnh vực chưa đạt mức tối thiểu">
      <span className="pu-req-summary-icon" aria-hidden="true"><AlertTriangle size={18} /></span>
      <div className="pu-req-summary-body">
        <strong className="pu-req-summary-title">
          Còn {unmet.length}/{required.length} lĩnh vực chưa đạt mức tối thiểu {who}
        </strong>
        <ul className="pu-req-summary-chips" aria-label="Lĩnh vực cần đạt">
          {unmet.map((d) => (
            <li key={d.categoryId}>
              <button type="button" className="pu-req-chip" onClick={() => onShowDomain(d.categoryId)}>
                <span className="pu-req-chip-num">{pad2(domains.indexOf(d) + 1)}</span>
                <span className="pu-req-chip-name">{d.name}</span>
                <span className="pu-req-chip-level">Cần {levelName(d.pathTop)}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="pu-req-summary-note">{beyondNote}</p>
      </div>
    </section>
  );
}

/** Dải yêu cầu của một lĩnh vực: ai đặt, mức tối thiểu, đã đạt hay còn khóa bắt buộc nào. */
function RequirementBar({ overview, domain }: { overview: PulseOverview; domain: PulseDomain }) {
  const openTop = openLevel(overview, domain);
  const openChip = openTop > domain.pathTop ? (
    <span className="pu-req-open" title="Khóa doanh nghiệp đã mua ở cấp cao hơn mức tối thiểu: bạn tự chọn học vượt, việc này được khuyến khích">
      <Rocket size={12} aria-hidden="true" /> Doanh nghiệp mở tới <strong>{levelName(openTop)}</strong> · học vượt được
    </span>
  ) : null;

  if (domain.pathTop === 0) {
    return (
      <div className="pu-req-bar neutral">
        <Rocket size={14} aria-hidden="true" />
        <span className="pu-req-text">
          {departmentTitle(overview.person.departmentName) ?? 'Phòng ban của bạn'} không đặt mức bắt buộc cho lĩnh vực này. Các khóa dưới đây là học vượt.
        </span>
        {openChip}
      </div>
    );
  }

  const met = meetsRequirement(domain);
  const remaining = remainingRequired(overview, domain);
  return (
    <div className={`pu-req-bar ${met ? 'met' : 'gap'}`}>
      {met ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : <AlertTriangle size={14} aria-hidden="true" />}
      <span className="pu-req-text">
        {requirementSource(domain, overview.person)} yêu cầu tối thiểu <strong>{levelName(domain.pathTop)}</strong>
      </span>
      <LevelDots level={domain.pathTop} />
      {openChip}
      <span className="pu-req-status">
        {met
          ? 'Đã đạt'
          : remaining.length > 0
            ? `Chưa đạt · còn ${remaining.length} khóa bắt buộc: ${remaining.map((c) => toSentenceCase(c.title)).join(', ')}`
            : 'Chưa đạt'}
      </span>
    </div>
  );
}

/* ── 3. Mindmap Sequential Learning Journey ────────────────────────────── */
function MindmapJourney({
  overview,
  domains,
  expandedCriteria,
  onToggleCriteria,
  onSelectCourse,
}: {
  overview: PulseOverview;
  domains: PulseDomain[];
  expandedCriteria: Set<string>;
  onToggleCriteria: (categoryId: string) => void;
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
                  ) : isCurrentStation ? (
                    <span className="pu-station-pill current">
                      <Sparkles size={11} /> Lĩnh vực ưu tiên
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

              {/* Mức tối thiểu doanh nghiệp yêu cầu cho lĩnh vực */}
              <RequirementBar overview={overview} domain={domain} />

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

              {/* Danh mục Tiêu chí Chuẩn hóa Lĩnh vực (Thu gọn tinh tế) */}
              {domain.competencies.length > 0 && (
                <div className="pu-station-criteria-area">
                  <button
                    type="button"
                    className="pu-criteria-toggle-btn"
                    onClick={() => onToggleCriteria(domain.categoryId)}
                    aria-expanded={expandedCriteria.has(domain.categoryId)}
                  >
                    <FileText size={12} />
                    <span>
                      Tiêu chuẩn năng lực chi tiết ({domain.competencies.length} tiêu chí)
                    </span>
                    <ChevronDown
                      size={14}
                      className={`pu-criteria-chevron ${
                        expandedCriteria.has(domain.categoryId) ? 'open' : ''
                      }`}
                    />
                  </button>

                  {expandedCriteria.has(domain.categoryId) && (
                    <div className="pu-criteria-tags-flow">
                      {domain.competencies.map((comp) => {
                        const isMet = domain.verified >= comp.requiredLevel;
                        return (
                          <div
                            key={comp.code}
                            className={`pu-crit-pill ${isMet ? 'met' : 'gap'}`}
                            title={`${comp.name} · Mức yêu cầu: ${levelName(comp.requiredLevel)}`}
                          >
                            <span className="pu-crit-name">{comp.name}</span>
                            <span className="pu-crit-level">
                              ({levelName(comp.requiredLevel)})
                            </span>
                            {isMet ? (
                              <span className="pu-crit-status met">
                                <Check size={9} strokeWidth={3} /> Đạt
                              </span>
                            ) : (
                              <span className="pu-crit-status gap">Cần học</span>
                            )}
                            {comp.core && (
                              <span className="pu-crit-core">Cốt lõi</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
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
        {beyond ? (
          <span className="pu-scard-zone beyond" title="Cao hơn mức tối thiểu doanh nghiệp yêu cầu, doanh nghiệp đã mua: được khuyến khích">
            <Rocket size={10} /> Học vượt
          </span>
        ) : requirementGap ? (
          <span className="pu-scard-zone required" title="Cần đạt để đủ mức tối thiểu doanh nghiệp yêu cầu">
            Bắt buộc
          </span>
        ) : null}
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

        <button
          type="button"
          className="pu-scard-syllabus-btn"
          onClick={() => onSelectCourse(course)}
          title="Xem nhanh đề cương khóa học"
        >
          <FileText size={12} />
          <span>Đề cương</span>
        </button>
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
