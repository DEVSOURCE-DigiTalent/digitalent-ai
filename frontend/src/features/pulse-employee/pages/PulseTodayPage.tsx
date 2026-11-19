import { Link, Navigate } from 'react-router-dom';
import {
  Clock,
  Compass,
  UserX,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import heroBgArt from '@/assets/pulse/enterprise-hero-bg.jpg';
import { usePulseOverview } from '@/hooks/use-pulse';
import { useIsEnterpriseTrial } from '@/hooks/use-trial-program';
import type { PulseCourseSummary, PulseDomain, PulseOverview } from '@/services/pulse.service';
import { Empty, LoadError, PageSkeleton, PuLink } from '../components/ui';
import { pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

/**
 * Hôm nay (EM-01) - Actionable Enterprise Dashboard
 * - Hero Banner: Ảnh nền trừu tượng công nghệ, thông điệp ngắn gọn, trực quan.
 * - Không hiển thị mã khóa học (M1-F…) cho nhân viên: chỉ tên khóa và cấp độ.
 * - Bài đang chờ chấm: mỗi tên khóa mở thẳng trang bài đã nộp (bài cuối khóa / bài đánh giá đầu vào).
 * - Competency Radar Chart + 6 Lĩnh vực: Biểu đồ Radar 6 góc đối chiếu trực quan năng lực vị trí.
 */
export function PulseTodayPage() {
  const { data, isLoading, error, refetch } = usePulseOverview();
  const trial = useIsEnterpriseTrial();

  if (isLoading) return <PageSkeleton blocks={[200, 240, 500]} />;
  if (error || !data) return <LoadError message={pulseErrorMessage(error, 'Không tải được không gian học của bạn.')} onRetry={() => refetch()} />;
  // Doanh nghiệp dùng thử chưa có khung năng lực: một trang Học thử duy nhất (Lộ trình).
  if (data.awaitingFramework || (trial && (!data.hasPosition || !data.hasTargets))) return <Navigate to={PULSE_PATHS.path} replace />;
  if (!data.hasPosition || !data.hasTargets) return <NoPath overview={data} />;

  return (
    <div className="pu-home">
      {/* 1. Hero Banner tối giản với ảnh nền trừu tượng cao cấp */}
      <EnterpriseHeroBanner overview={data} />

      {/* 2. Bài đang chờ chấm: link thẳng tới bài đã nộp */}
      <ReviewQueueSection overview={data} />

      {/* 3. Phân mục Tiến độ: Biểu đồ Radar 6 góc & Lưới 6 lĩnh vực */}
      <DomainRadarSection overview={data} />
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
          <span className="pu-hero-growth-badge" title="Lộ trình phát triển năng lực số" aria-hidden="true">
            <TrendingUp size={16} strokeWidth={2.4} />
          </span>
        </h1>

        <p className="pu-hero-main-subtitle">
          Lộ trình phát triển năng lực số cho vị trí <strong>{position}</strong>
        </p>
      </div>
    </header>
  );
}

/* ── 2. Bài đang chờ chấm ──────────────────────────────────────────────── */
/** Trang bài đã nộp: bài cuối khóa (IN_REVIEW) hoặc bài đánh giá đầu vào cũ (PRE_REVIEW). */
const submittedExamPath = (course: PulseCourseSummary) =>
  course.slotStatus === 'PRE_REVIEW' ? PULSE_PATHS.preAssessment(course.courseId) : PULSE_PATHS.final(course.courseId);

function ReviewQueueSection({ overview }: { overview: PulseOverview }) {
  const waiting = overview.courses.filter((c) => c.slotStatus === 'PRE_REVIEW' || c.slotStatus === 'IN_REVIEW');

  if (waiting.length === 0) return null;

  return (
    <section className="pu-review-queue-widget" aria-label="Bài đang chờ chấm">
      <div className="pu-review-queue-info">
        <div className="pu-review-queue-icon-wrap" aria-hidden="true">
          <Clock size={18} />
        </div>
        <div className="pu-review-queue-text">
          <div className="pu-review-queue-head">
            <strong>{waiting.length} bài thi đang chờ chấm</strong>
          </div>
          <p className="pu-review-queue-desc">
            Bấm vào tên khóa để xem bài đã nộp và tiêu chí chấm.
          </p>
        </div>
      </div>

      <div className="pu-review-queue-chips">
        {waiting.map((c) => (
          <Link
            key={c.courseId}
            to={submittedExamPath(c)}
            className="pu-review-chip-btn"
            title={`Xem bài đã nộp: ${c.title}`}
          >
            <span className="pu-review-chip-title">{toSentenceCase(c.title)}</span>
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── 3. Biểu đồ Radar 6 góc & Tiến độ Lĩnh vực ────────────────────────── */
function DomainRadarSection({ overview }: { overview: PulseOverview }) {
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
              <span className="pu-radar-badge">Năng lực số của bạn</span>
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
              ? 'Chờ duyệt'
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
      <svg viewBox="0 0 300 270" className="pu-radar-svg" role="img" aria-label="Biểu đồ năng lực số theo từng lĩnh vực">
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
