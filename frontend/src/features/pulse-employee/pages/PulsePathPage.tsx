import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
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
  Sparkles,
  Target,
  UserX,
  Zap,
} from 'lucide-react';
import { usePulseOverview } from '@/hooks/use-pulse';
import { useIsEnterpriseTrial } from '@/hooks/use-trial-program';
import type { PulseCourseSummary, PulseOverview } from '@/services/pulse.service';
import { RoadmapPlan, toSentenceCase } from '../components/roadmap';
import { showsProgress } from '../lib/course-state';
import { Empty, LoadError, PageSkeleton } from '../components/ui';
import { levelName, pad2, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';
import { QuickSyllabusDrawer } from '../components/QuickSyllabusDrawer';
import { TrialLearning } from '../components/TrialLearning';

/**
 * Lộ trình Năng lực Chuẩn hóa (EM-02)
 * Thiết kế tinh gọn, chuẩn Enterprise SaaS:
 * 1. Khối Tiêu đề riêng biệt trên cùng (Chức danh & Đơn vị công tác)
 * 2. Cụm 3 Card Thống kê nhanh (Tiến độ %, Số lĩnh vực, Số tiêu chuẩn năng lực)
 * 3. Thẻ Nhiệm vụ ưu tiên tiếp theo (Đầy đủ ngữ cảnh, lợi ích & 2 nút CTA)
 * 4. Bộ điều khiển góc nhìn: [Bản đồ Hành trình (Mindmap)] và [Bảng Ma trận (Matrix)]
 * 5. Mindmap Lộ trình Tuần tự: Trạm 01 -> Trạm 06 với các hiệu ứng hover mượt mà
 * 6. Quick Syllabus Drawer: Xem đề cương & điều kiện miễn học 1-click
 */
export function PulsePathPage() {
  const { data, isLoading, error, refetch } = usePulseOverview();
  const trial = useIsEnterpriseTrial();
  const [selectedCourse, setSelectedCourse] = useState<PulseCourseSummary | null>(null);
  const [viewMode, setViewMode] = useState<'mindmap' | 'matrix'>('mindmap');
  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(new Set());

  if (isLoading) return <PageSkeleton blocks={[100, 240, 400]} />;
  if (error || !data) return <LoadError message={pulseErrorMessage(error, 'Không tải được lộ trình của bạn.')} onRetry={() => refetch()} />;
  if (trial && !data.hasTargets) return <TrialLearning overview={data} />;
  if (!data.hasPosition || !data.hasTargets) return <NoPath overview={data} />;

  const toggleCriteria = (categoryId: string) => {
    setExpandedCriteria((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  return (
    <div className="pu-path-container">
      {/* 1. Tiêu đề riêng biệt, 3 Card thống kê & Thẻ nhiệm vụ ưu tiên tiếp theo */}
      <PathHeaderSection overview={data} onSelectCourse={setSelectedCourse} />

      {/* 2. Thanh điều hướng góc nhìn & Chú giải */}
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
          <span><i className="pu-legend-dot done" />Đã đạt chuẩn</span>
          <span><i className="pu-legend-dot current" />Trạm ưu tiên</span>
          <span><i className="pu-legend-dot learning" />Đang học</span>
          <span><i className="pu-legend-dot pending" />Chưa học</span>
        </div>
      </div>

      {/* 3. Nội dung lộ trình theo góc nhìn đã chọn */}
      {viewMode === 'mindmap' ? (
        <MindmapJourney
          overview={data}
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
                Đối chiếu 6 lĩnh vực năng lực theo 3 cấp độ chuẩn hóa chức danh chuyên môn.
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

      {/* 4. Slide-over Drawer xem nhanh đề cương */}
      <QuickSyllabusDrawer
        course={selectedCourse}
        overview={data}
        open={Boolean(selectedCourse)}
        onClose={() => setSelectedCourse(null)}
      />
    </div>
  );
}

/* ── 1. Page Header: Title Block + Quick Stats Cards + Priority Mission ───── */
function PathHeaderSection({
  overview,
  onSelectCourse,
}: {
  overview: PulseOverview;
  onSelectCourse: (course: PulseCourseSummary) => void;
}) {
  const { person, stats, nextSteps } = overview;
  const position = person.positionName ?? 'Vị trí công việc';
  const total = stats.pathCourses;
  const approved = stats.approvedPathCourses;
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
  const domains = overview.domains.filter((d) => d.target > 0);
  const metDomainCount = domains.filter((d) => {
    const domainCourses = overview.courses.filter((c) => c.categoryId === d.categoryId && c.zone === 'PATH');
    return domainCourses.length > 0 && domainCourses.every((c) => c.approved);
  }).length;
  const nextCourse = nextSteps[0];

  const deptRaw = person.departmentName?.trim();
  const dept = deptRaw
    ? deptRaw.toLowerCase().startsWith('phòng')
      ? deptRaw
      : `Phòng ${deptRaw}`
    : null;
  const orgSub = [dept, person.organizationName].filter(Boolean).join(' · ');

  // Thông tin trạm và phân loại của khóa học ưu tiên tiếp theo
  const nextDomain = nextCourse
    ? domains.find((d) => d.categoryId === nextCourse.categoryId)
    : null;
  const nextStationIdx = nextDomain
    ? domains.findIndex((d) => d.categoryId === nextDomain.categoryId)
    : -1;
  const stationLabel = nextStationIdx >= 0 ? `Trạm 0${nextStationIdx + 1}` : null;

  const isPreTest = nextCourse?.slotStatus === 'PRE_ASSESSMENT' || nextCourse?.canStartPreAssessment;
  const isInProgress = nextCourse?.slotStatus === 'IN_PROGRESS';
  const isWaitingReview = nextCourse?.slotStatus === 'PRE_REVIEW' || nextCourse?.slotStatus === 'IN_REVIEW';

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

      {/* Khối 2: 3 Card Thống kê Nhanh */}
      <div className="pu-path-stats-row">
        {/* Card 1: Tiến độ chuẩn hóa */}
        <div className="pu-path-stat-card">
          <div className="pu-stat-card-header">
            <span className="pu-stat-card-title">Tiến độ chuẩn hóa</span>
            <span className={`pu-stat-badge ${pct >= 80 ? 'high' : 'med'}`}>
              {pct}%
            </span>
          </div>
          <div className="pu-stat-card-body">
            <div className="pu-stat-number-row">
              <span className="pu-stat-big-number">{approved}</span>
              <span className="pu-stat-total">/ {total} khóa học</span>
            </div>
            <div className="pu-stat-prog-track">
              <div
                className="pu-stat-prog-fill"
                style={{
                  width: `${pct}%`,
                  backgroundColor: pct >= 80 ? '#059669' : '#1e40af',
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Lĩnh vực hoàn thành */}
        <div className="pu-path-stat-card">
          <div className="pu-stat-card-header">
            <span className="pu-stat-card-title">Lĩnh vực hoàn thành</span>
            <span className="pu-stat-badge highlight">
              {metDomainCount}/{domains.length}
            </span>
          </div>
          <div className="pu-stat-card-body">
            <div className="pu-stat-number-row">
              <span className="pu-stat-big-number">{metDomainCount}</span>
              <span className="pu-stat-total">/ {domains.length} lĩnh vực</span>
            </div>
            <p className="pu-stat-desc-note">
              {metDomainCount === domains.length
                ? 'Đã đạt toàn bộ lĩnh vực chuẩn hóa'
                : `Còn ${domains.length - metDomainCount} lĩnh vực cần hoàn thiện`}
            </p>
          </div>
        </div>

        {/* Card 3: Tiêu chuẩn năng lực */}
        <div className="pu-path-stat-card">
          <div className="pu-stat-card-header">
            <span className="pu-stat-card-title">Tiêu chuẩn năng lực</span>
            <span className="pu-stat-badge neutral">Yêu cầu</span>
          </div>
          <div className="pu-stat-card-body">
            <div className="pu-stat-number-row">
              <span className="pu-stat-big-number">{stats.requiredCompetencies}</span>
              <span className="pu-stat-total">tiêu chí năng lực</span>
            </div>
            <p className="pu-stat-desc-note">
              Chuẩn hóa theo khung năng lực vị trí chuyên môn
            </p>
          </div>
        </div>
      </div>

      {/* Khối 3: Thẻ Nhiệm vụ ưu tiên tiếp theo (Chuẩn bộ màu Xanh thương hiệu) */}
      {nextCourse && (
        <div className="pu-priority-mission-card">
          <div className="pu-pmission-indicator">
            <Sparkles size={18} className="text-blue-700" />
          </div>

          <div className="pu-pmission-main">
            <div className="pu-pmission-header-line">
              <span className="pu-pmission-kicker">Nhiệm vụ ưu tiên tiếp theo</span>
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
                  ? `Khóa học đang học dở dang (đã hoàn thành ${nextCourse.progressPercent}%). Hãy tiếp tục bài học tiếp theo để hoàn thành trạm.`
                  : isWaitingReview
                    ? 'Bài kiểm tra của bạn đã nộp thành công và đang chờ xác nhận kết quả.'
                    : 'Khóa học nền tảng bắt buộc tiếp theo. Bắt đầu ngay để xây dựng năng lực chuẩn.'}
            </p>
          </div>

          <div className="pu-pmission-action-group">
            {isPreTest ? (
              <Link
                to={PULSE_PATHS.preAssessment(nextCourse.courseId)}
                className="pu-pmission-cta-btn primary pretest"
              >
                <Zap size={14} />
                <span>Làm test vượt cấp ngay</span>
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

/* ── 2. Mindmap Sequential Learning Journey ────────────────────────────── */
function MindmapJourney({
  overview,
  expandedCriteria,
  onToggleCriteria,
  onSelectCourse,
}: {
  overview: PulseOverview;
  expandedCriteria: Set<string>;
  onToggleCriteria: (categoryId: string) => void;
  onSelectCourse: (course: PulseCourseSummary) => void;
}) {
  const domains = overview.domains.filter((d) => d.target > 0);

  return (
    <div className="pu-mindmap-timeline" role="feed" aria-label="Dòng chảy lộ trình năng lực tuần tự">
      {domains.map((domain, stationIdx) => {
        const domainCourses = overview.courses
          .filter((c) => c.categoryId === domain.categoryId && c.zone === 'PATH')
          .sort((a, b) => a.tier - b.tier);

        const approvedCourses = domainCourses.filter((c) => c.approved);
        const isStationDone = approvedCourses.length === domainCourses.length && domainCourses.length > 0;
        const hasActivePreTest = domainCourses.some(
          (c) => c.slotStatus === 'PRE_ASSESSMENT' || c.canStartPreAssessment
        );
        const hasInProgress = domainCourses.some((c) => c.slotStatus === 'IN_PROGRESS');
        const hasWaiting = domainCourses.some(
          (c) => c.slotStatus === 'PRE_REVIEW' || c.slotStatus === 'IN_REVIEW'
        );
        const isCurrentStation = overview.nextSteps.some((ns) => ns.categoryId === domain.categoryId);
        const code = domainCourses[0]?.code.split('-')[0] ?? domain.code;
        const stationNumber = pad2(stationIdx + 1);

        const stationStatusClass = isStationDone
          ? 'done'
          : isCurrentStation || hasActivePreTest
            ? 'current'
            : hasInProgress
              ? 'learning'
              : hasWaiting
                ? 'waiting'
                : 'upcoming';

        return (
          <article
            key={domain.categoryId}
            className="pu-mindmap-station"
            aria-label={`Trạm ${stationNumber}: ${domain.name}`}
          >
            {/* Cột mốc Timeline (Mindmap Node Marker) */}
            <div className={`pu-station-indicator ${stationStatusClass}`}>
              {isStationDone ? (
                <Check size={18} strokeWidth={3} />
              ) : isCurrentStation ? (
                <Target size={18} />
              ) : hasInProgress ? (
                <BookOpen size={17} />
              ) : hasWaiting ? (
                <Clock size={17} />
              ) : (
                <span>{stationNumber}</span>
              )}
            </div>

            {/* Nội dung Trạm Lĩnh vực */}
            <div className={`pu-station-card is-${stationStatusClass}`}>
              {/* Đầu trạm: Tên lĩnh vực, mục tiêu & trạng thái */}
              <div className="pu-station-head">
                <div className="pu-station-title-group">
                  <span className="pu-station-tag">{code}</span>
                  <h2 className="pu-station-name">
                    Trạm {stationNumber}: {domain.name}
                  </h2>
                </div>

                <div className="pu-station-status-side">
                  <span className="pu-station-meta">
                    Mục tiêu: <strong>{levelName(domain.target)}</strong> · Hiện tại: <strong>{domain.verified > 0 ? levelName(domain.verified) : 'Chưa đạt'}</strong>
                  </span>
                  {isStationDone ? (
                    <span className="pu-station-pill done">
                      <Check size={11} strokeWidth={3} /> Đã đạt chuẩn
                    </span>
                  ) : isCurrentStation ? (
                    <span className="pu-station-pill current">
                      <Sparkles size={11} /> Trạm ưu tiên
                    </span>
                  ) : hasInProgress ? (
                    <span className="pu-station-pill learning">
                      Đang học ({approvedCourses.length}/{domainCourses.length})
                    </span>
                  ) : hasWaiting ? (
                    <span className="pu-station-pill waiting">
                      <Clock size={11} /> Chờ chấm bài
                    </span>
                  ) : (
                    <span className="pu-station-pill upcoming">
                      Chưa học ({domainCourses.length} khóa)
                    </span>
                  )}
                </div>
              </div>

              {/* Dòng chảy các khóa học trong trạm (L1 -> L2 -> L3) */}
              <div className="pu-station-courses-flow">
                {domainCourses.map((course, idx) => {
                  const isDone = course.approved || course.slotStatus === 'COMPLETED';
                  const isInProgress = course.slotStatus === 'IN_PROGRESS';
                  const isPreTest = course.slotStatus === 'PRE_ASSESSMENT' || course.canStartPreAssessment;
                  const isWaiting = course.slotStatus === 'PRE_REVIEW' || course.slotStatus === 'IN_REVIEW';
                  const isLocked = course.slotStatus === 'AFTER_PRIOR_LEVEL' || course.zone === 'ABOVE_CEILING';

                  return (
                    <div key={course.courseId} className="pu-station-step-wrapper">
                      {idx > 0 && (
                        <div className="pu-station-step-arrow" aria-hidden="true">
                          <ChevronRight size={18} />
                        </div>
                      )}
                      <div
                        className={`pu-station-course-card ${
                          isDone
                            ? 'done'
                            : isInProgress
                              ? 'learning'
                              : isPreTest
                                ? 'pretest'
                                : isWaiting
                                  ? 'waiting'
                                  : isLocked
                                    ? 'locked'
                                    : ''
                        }`}
                      >
                        <div className="pu-scard-top">
                          <span className="pu-scard-code">{course.code}</span>
                          <span className="pu-scard-tier">{levelName(course.tier)}</span>
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
                              <Zap size={10} /> Test vượt cấp
                            </span>
                          )}
                          {isWaiting && (
                            <span className="pu-scard-badge waiting">
                              Chờ chấm
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
                              <Check size={11} strokeWidth={3} /> Đã hoàn thành
                            </span>
                          ) : isPreTest ? (
                            <Link
                              to={PULSE_PATHS.preAssessment(course.courseId)}
                              className="pu-scard-cta pretest"
                            >
                              <Zap size={12} /> Làm test vượt cấp →
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
                          ) : isLocked ? (
                            <span className="pu-scard-locked-hint">
                              Học sau khi đạt Cấp {course.tier - 1}
                            </span>
                          ) : (
                            <Link
                              to={PULSE_PATHS.course(course.courseId)}
                              className="pu-scard-cta default"
                            >
                              Bắt đầu học →
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
                    </div>
                  );
                })}
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
                            <span className="pu-crit-code">{comp.code}</span>
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

/* ── 3. Empty State ────────────────────────────────────────────────────── */
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
