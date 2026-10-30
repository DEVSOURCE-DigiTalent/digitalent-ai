import { Link } from 'react-router-dom';
import { Check, Clock, Compass, FileText, Zap } from 'lucide-react';
import type { PulseCourseSummary, PulseOverview } from '@/services/pulse.service';
import { PULSE_PATHS } from '../lib/paths';

export interface JobPathfinderSectionProps {
  overview: PulseOverview;
  onSelectCourse?: (course: PulseCourseSummary) => void;
}

export function JobPathfinderSection({
  overview,
  onSelectCourse,
}: JobPathfinderSectionProps) {
  const { stats, person } = overview;
  const position = person.positionName ?? 'của bạn';
  const total = stats.pathCourses;
  const approved = stats.approvedPathCourses;
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0;

  // Arc length for r=76 is pi * 76 ≈ 238.76
  const arcLength = 238.76;
  const strokeDashoffset = Math.max(0, arcLength - (arcLength * pct) / 100);

  const domains = overview.domains.filter((d) => d.target > 0);

  return (
    <section className="pu-pathfinder-card" aria-labelledby="pu-pathfinder-title">
      <header className="pu-pathfinder-header">
        <div>
          <div className="pu-pathfinder-kicker">
            <Compass size={14} className="text-blue-700" />
            <span>MỨC ĐỘ ĐÁP ỨNG CHỨC DANH · JOB PATHFINDER</span>
          </div>
          <h2 id="pu-pathfinder-title" className="pu-pathfinder-title">
            Chỉ số sẵn sàng năng lực số: {position}
          </h2>
          <p className="pu-pathfinder-sub">
            Khung đối chiếu chuẩn hóa mức độ sẵn sàng của nhân viên theo 6 lĩnh vực năng lực số vị trí công việc.
          </p>
        </div>
        <span className="pu-pathfinder-chip">
          {approved}/{total} khóa chuẩn chức danh đã hoàn thành
        </span>
      </header>

      <div className="pu-pathfinder-body">
        {/* Left Column: Visual Semi-Circle Gauge */}
        <aside className="pu-pathfinder-gauge-col">
          <div className="pu-gauge-wrapper">
            <svg
              className="pu-gauge-svg"
              viewBox="0 0 200 120"
              role="img"
              aria-label={`Tiến độ chức danh: ${pct}%`}
            >
              {/* Background Arc */}
              <path
                d="M 24 105 A 76 76 0 0 1 176 105"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Progress Arc */}
              <path
                d="M 24 105 A 76 76 0 0 1 176 105"
                fill="none"
                stroke={pct > 0 ? '#1e40af' : 'transparent'}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
              {/* Percentage Text */}
              <text
                x="100"
                y="86"
                textAnchor="middle"
                className="pu-gauge-text-val"
              >
                {pct}%
              </text>
              <text
                x="100"
                y="106"
                textAnchor="middle"
                className="pu-gauge-text-sub"
              >
                MỨC ĐỘ SẴN SÀNG
              </text>
            </svg>
          </div>

          <div className="pu-gauge-meta">
            <div className="pu-gauge-status-row">
              <span className={`pu-gauge-dot ${pct === 100 ? 'done' : pct > 0 ? 'learning' : 'pending'}`} />
              <strong>{pct === 100 ? 'Đã đạt chuẩn chức danh' : pct > 0 ? 'Đang phát triển năng lực' : 'Chưa bắt đầu lộ trình'}</strong>
            </div>
            <p className="pu-gauge-note">
              {pct === 100
                ? 'Tất cả các khóa yêu cầu cho vị trí đã được duyệt chính thức.'
                : `Còn thiếu ${total - approved} khóa học/bài thi để đạt 100% chuẩn chức danh.`}
            </p>
            
          </div>
        </aside>

        {/* Right Column: 6 Domain Status Cards Grid */}
        <div className="pu-pathfinder-domains-grid">
          {domains.map((domain) => {
            const domainCourses = overview.courses.filter(
              (c) => c.categoryId === domain.categoryId && c.zone === 'PATH'
            );
            const approvedCount = domainCourses.filter((c) => c.approved).length;
            const domainTotal = domainCourses.length;
            const domainPct = domainTotal > 0 ? Math.round((approvedCount / domainTotal) * 100) : 0;
            const code = domainCourses[0]?.code.split('-')[0] ?? domain.code;

            // Determine active/priority course
            const activeCourse =
              domainCourses.find((c) => !c.approved && c.slotStatus !== 'AFTER_PRIOR_LEVEL' && c.slotStatus !== 'ABOVE_CEILING') ??
              domainCourses[0];

            const isAllDone = domainPct === 100 && domainTotal > 0;
            const isWaiting = domainCourses.some((c) => c.slotStatus === 'PRE_REVIEW' || c.slotStatus === 'IN_REVIEW');
            const isPreTest = domainCourses.some((c) => c.slotStatus === 'PRE_ASSESSMENT');
            const isInProgress = domainCourses.some((c) => c.slotStatus === 'IN_PROGRESS');

            return (
              <article key={domain.categoryId} className={`pu-domain-card ${isAllDone ? 'met' : 'gap'}`}>
                <div className="pu-domain-card-head">
                  <div className="pu-domain-code-badge">
                    <span>{code}</span>
                  </div>
                  <div className="pu-domain-status-pill">
                    {isAllDone ? (
                      <span className="pu-pill met">
                        <Check size={11} strokeWidth={3} /> Đạt chuẩn
                      </span>
                    ) : isWaiting ? (
                      <span className="pu-pill waiting">
                        <Clock size={11} /> Chờ chấm
                      </span>
                    ) : isPreTest ? (
                      <span className="pu-pill pretest">
                        <Zap size={11} /> Đánh giá
                      </span>
                    ) : isInProgress ? (
                      <span className="pu-pill learning">
                        Đang học
                      </span>
                    ) : (
                      <span className="pu-pill standard">
                        Cần bồi dưỡng
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="pu-domain-card-title">{domain.name}</h3>

                {/* Progress bar */}
                <div className="pu-domain-progress">
                  <div className="pu-domain-progress-track">
                    <div
                      className={`pu-domain-progress-fill ${isAllDone ? 'met' : ''}`}
                      style={{ width: `${domainPct}%` }}
                    />
                  </div>
                  <div className="pu-domain-progress-labels">
                    <small>{approvedCount}/{domainTotal} khóa đạt</small>
                    <small>{domainPct}%</small>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pu-domain-card-footer">
                  {activeCourse ? (
                    <button
                      type="button"
                      className="pu-domain-detail-btn"
                      onClick={() => onSelectCourse?.(activeCourse)}
                      title={`Xem nhanh đề cương ${activeCourse.code}: ${activeCourse.title}`}
                    >
                      <FileText size={13} />
                      <span>{activeCourse.code} · Chi tiết</span>
                    </button>
                  ) : null}

                  {isPreTest && activeCourse ? (
                    <Link
                      to={PULSE_PATHS.preAssessment(activeCourse.courseId)}
                      className="pu-domain-action-link pretest"
                    >
                      Làm test →
                    </Link>
                  ) : isInProgress && activeCourse ? (
                    <Link
                      to={PULSE_PATHS.course(activeCourse.courseId)}
                      className="pu-domain-action-link study"
                    >
                      Học tiếp →
                    </Link>
                  ) : isWaiting && activeCourse ? (
                    <Link
                      to={PULSE_PATHS.preAssessment(activeCourse.courseId)}
                      className="pu-domain-action-link muted"
                    >
                      Xem bài nộp
                    </Link>
                  ) : activeCourse ? (
                    <Link
                      to={PULSE_PATHS.course(activeCourse.courseId)}
                      className="pu-domain-action-link default"
                    >
                      Bắt đầu →
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
