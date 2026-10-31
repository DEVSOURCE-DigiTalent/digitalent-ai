import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Check, Clock, FileText, Lock, ShieldCheck, Target, Zap } from 'lucide-react';
import type { PulseCourseSummary, PulseDomain, PulseOverview } from '@/services/pulse.service';
import { courseLabel, courseStatusText, courseTone, showsProgress } from '../lib/course-state';
import { capNote, levelName } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';
import { Bar, PuLink } from './ui';

export function toSentenceCase(str: string): string {
  if (!str) return '';
  const s = str.trim();
  if (s === s.toUpperCase() && s.length > 3) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
  return s;
}

/** Ba chấm cấp độ: ●○○ Cơ bản, ●●○ Trung cấp, ●●● Nâng cao. */
export function LevelDots({ level }: { level: number }) {
  return (
    <span className="pu-level-dots" aria-hidden>
      {[1, 2, 3].map((n) => <i key={n} className={n <= level ? 'on' : undefined} />)}
    </span>
  );
}

const shortCode = (domain: PulseDomain, courses: PulseCourseSummary[]) =>
  courses.find((c) => c.categoryId === domain.categoryId)?.code.split('-')[0] ?? domain.code;

/**
 * Lộ trình doanh nghiệp đặt cho vị trí: mỗi lĩnh vực một hàng, mỗi cấp độ một cột, mỗi ô là tên khóa trong lộ trình
 * (Cơ bản → min(mục tiêu vị trí, trần phòng ban)). Chỉ khóa bắt buộc: khóa tùy chọn nằm ở danh sách khóa bên dưới, khóa vượt
 * trần không hiện. Chỉ là kế hoạch — không có tiến độ hay đạt / chưa đạt.
 */
export function RoadmapPlan({
  overview,
  variant = 'regular',
  caption,
  onSelectCourse,
}: {
  overview: PulseOverview;
  variant?: 'regular' | 'compact';
  caption: string;
  onSelectCourse?: (course: PulseCourseSummary) => void;
}) {
  const domains = overview.domains.filter((d) => d.pathTop > 0);

  return (
    <div className="pu-matrix-wrapper">
      <div className="pu-plan-scroll">
        <table className={`pu-matrix-table${variant === 'compact' ? ' compact' : ''}`}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col" className="pu-matrix-col-domain">
                <div className="pu-matrix-th-content">
                  <span className="pu-matrix-th-title">Lĩnh vực Năng lực</span>
                  <span className="pu-matrix-th-sub">Khung 6 lĩnh vực chuẩn hóa</span>
                </div>
              </th>
              {[1, 2, 3].map((level) => {
                const subDescriptions = [
                  'Nền tảng ứng dụng',
                  'Độc lập tác nghiệp',
                  'Tối ưu & Chuyên sâu',
                ];
                return (
                  <th scope="col" key={level} className={`pu-matrix-col-tier lv${level}`}>
                    <div className="pu-matrix-th-content">
                      <div className="pu-matrix-th-badge">
                        <span>{levelName(level)}</span>
                        <LevelDots level={level} />
                      </div>
                      <span className="pu-matrix-th-sub">{subDescriptions[level - 1]}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {domains.map((domain) => {
              const domainCourses = overview.courses.filter(
                (c) => c.categoryId === domain.categoryId && c.zone === 'PATH'
              );
              const approvedCourses = domainCourses.filter((c) => c.approved);
              const isDomainMet = approvedCourses.length === domainCourses.length && domainCourses.length > 0;
              const remainingCourses = domainCourses.length - approvedCourses.length;
              const code = shortCode(domain, overview.courses);

              const row = [1, 2, 3].map((tier) =>
                overview.courses.find(
                  (c) => c.categoryId === domain.categoryId && c.tier === tier && c.zone === 'PATH'
                )
              );

              return (
                <tr key={domain.categoryId} className="pu-matrix-row">
                  {/* Cột 1: Thông tin Lĩnh vực Năng lực & Đối sánh (Phương án 1: 2 dòng thông thoáng) */}
                  <th scope="row" className="pu-matrix-domain-th">
                    <div className="pu-matrix-domain-card">
                      <div className="pu-matrix-domain-head">
                        <span className="pu-matrix-domain-tag">{code}</span>
                        {isDomainMet ? (
                          <span className="pu-matrix-domain-status met">
                            <Check size={11} strokeWidth={3} /> Đạt chuẩn
                          </span>
                        ) : (
                          <span className="pu-matrix-domain-status gap">
                            Còn {remainingCourses} khóa
                          </span>
                        )}
                      </div>

                      <h3 className="pu-matrix-domain-name">
                        {toSentenceCase(domain.name)}
                      </h3>

                      {/* Dải đối sánh 2 dòng riêng biệt: không rớt chữ, rõ ràng */}
                      <div className="pu-matrix-domain-meta">
                        <div className="pu-matrix-meta-row">
                          <span className="pu-matrix-meta-label">
                            <Target size={11} className="pu-meta-icon text-amber-600" />
                            <span>Mục tiêu vị trí:</span>
                          </span>
                          <strong className="pu-matrix-meta-val target">
                            Cấp {domain.target} · {levelName(domain.target)}
                          </strong>
                        </div>

                        <div className="pu-matrix-meta-row">
                          <span className="pu-matrix-meta-label">
                            {isDomainMet ? (
                              <Check size={11} strokeWidth={3} className="pu-meta-icon text-emerald-600" />
                            ) : (
                              <span className="pu-meta-dot" />
                            )}
                            <span>Mức hiện tại:</span>
                          </span>
                          <strong
                            className={`pu-matrix-meta-val ${
                              isDomainMet
                                ? 'met'
                                : domain.verified > 0
                                  ? 'current'
                                  : 'unmet'
                            }`}
                          >
                            {isDomainMet
                              ? `Đạt chuẩn (${levelName(domain.verified)})`
                              : domain.verified > 0
                                ? `Cấp ${domain.verified} · ${levelName(domain.verified)}`
                                : 'Chưa đạt'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </th>

                  {/* 3 Cột Cấp độ: Cấp 1, Cấp 2, Cấp 3 */}
                  {row.map((course, index) => {
                    const tier = index + 1;
                    return (
                      <td key={index} className="pu-matrix-cell-td">
                        {course ? (
                          <PlanCell
                            course={course}
                            domain={domain}
                            joined={Boolean(row[index + 1])}
                            onSelectCourse={onSelectCourse}
                          />
                        ) : (
                          <div className="pu-matrix-empty-cell" aria-label="Không có khóa trong lộ trình">
                            <span className="pu-matrix-empty-dash">—</span>
                            <span className="pu-matrix-empty-hint">
                              {tier > domain.target
                                ? 'Vượt mục tiêu vị trí'
                                : 'Không yêu cầu học'}
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlanCell({
  course,
  domain,
  joined,
  onSelectCourse,
}: {
  course: PulseCourseSummary;
  domain: PulseDomain;
  joined: boolean;
  onSelectCourse?: (course: PulseCourseSummary) => void;
}) {
  const isCapped = domain.pathTop < domain.target && course.tier === domain.pathTop;
  const isTarget = course.tier === domain.pathTop && !isCapped;
  const isDone = course.approved || course.slotStatus === 'COMPLETED';
  const isInProgress = course.slotStatus === 'IN_PROGRESS';
  const isPreTest = course.slotStatus === 'PRE_ASSESSMENT' || course.canStartPreAssessment;
  const isWaiting = course.slotStatus === 'PRE_REVIEW' || course.slotStatus === 'IN_REVIEW';
  const isLocked = course.slotStatus === 'AFTER_PRIOR_LEVEL' || course.zone === 'ABOVE_CEILING';

  const statusClass = isDone
    ? 'is-completed'
    : isInProgress
      ? 'is-in-progress'
      : isPreTest
        ? 'is-pretest'
        : isWaiting
          ? 'is-waiting'
          : isLocked
            ? 'is-locked'
            : 'is-standard';

  return (
    <div className={`pu-matrix-card lv${course.tier} ${statusClass}${joined ? ' joined' : ''}`}>
      {/* Đầu thẻ: Mã khóa, Cấp độ & Badge trạng thái */}
      <div className="pu-mcard-top">
        <span className="pu-mcard-code">{course.code}</span>
        <span className="pu-mcard-tier">{levelName(course.tier)}</span>

        <div className="pu-mcard-badges">
          {isDone && (
            <span className="pu-mcard-badge done" title="Đã được thẩm định công nhận">
              <Check size={10} strokeWidth={3} /> Đạt
            </span>
          )}
          {isInProgress && (
            <span className="pu-mcard-badge learning" title={`Đã học ${course.progressPercent}%`}>
              {course.progressPercent}%
            </span>
          )}
          {isPreTest && !isDone && (
            <span className="pu-mcard-badge pretest" title="Có bài kiểm tra vượt cấp để miễn học">
              <Zap size={10} /> Test
            </span>
          )}
          {isWaiting && (
            <span className="pu-mcard-badge waiting" title="Chờ chấm bài kiểm tra">
              <Clock size={10} /> Chờ
            </span>
          )}
          {isTarget && (
            <span className="pu-mcard-badge target" title="Mục tiêu năng lực của chức danh">
              <Target size={10} /> Mục tiêu
            </span>
          )}
          {isCapped && (
            <span className="pu-mcard-badge capped" title="Giới hạn theo trần năng lực của phòng ban">
              <Lock size={9} /> Trần
            </span>
          )}
        </div>
      </div>

      {/* Tên khóa học - Click để xem Đề cương */}
      <button
        type="button"
        className="pu-mcard-title-btn"
        onClick={onSelectCourse ? () => onSelectCourse(course) : undefined}
        title="Bấm để xem nhanh đề cương & điều kiện miễn học"
      >
        {toSentenceCase(course.title)}
      </button>

      {/* Thời lượng & Mô đun */}
      <div className="pu-mcard-meta">
        <span>{course.moduleCount || 3} mô đun</span>
        <span>·</span>
        <span>Ước tính ~06 giờ</span>
      </div>

      {/* Progress track nếu đang học */}
      {isInProgress && showsProgress(course) && (
        <div className="pu-mcard-prog-track">
          <div
            className="pu-mcard-prog-fill"
            style={{ width: `${course.progressPercent}%` }}
          />
        </div>
      )}

      {/* Các nút hành động nhanh */}
      <div className="pu-mcard-actions">
        {isDone ? (
          <span className="pu-mcard-done-label">
            <Check size={11} strokeWidth={3} /> Đã đạt
          </span>
        ) : isPreTest ? (
          <Link
            to={PULSE_PATHS.preAssessment(course.courseId)}
            className="pu-mcard-cta-btn primary"
          >
            <Zap size={11} />
            <span>Làm test →</span>
          </Link>
        ) : isInProgress ? (
          <Link
            to={PULSE_PATHS.course(course.courseId)}
            className="pu-mcard-cta-btn primary"
          >
            <span>Học tiếp →</span>
          </Link>
        ) : isWaiting ? (
          <Link
            to={PULSE_PATHS.preAssessment(course.courseId)}
            className="pu-mcard-cta-btn secondary"
          >
            <span>Xem bài thi</span>
          </Link>
        ) : isLocked ? (
          <span className="pu-mcard-locked-label">
            <Lock size={10} /> Cấp {course.tier - 1} trước
          </span>
        ) : (
          <Link
            to={PULSE_PATHS.course(course.courseId)}
            className="pu-mcard-cta-btn primary"
          >
            <span>Vào học →</span>
          </Link>
        )}

        {onSelectCourse && (
          <button
            type="button"
            className="pu-mcard-syllabus-btn"
            onClick={() => onSelectCourse(course)}
            title="Xem nhanh đề cương khóa học"
          >
            <FileText size={11} />
            <span>Đề cương</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function StatePill({ course }: { course: PulseCourseSummary }) {
  return <span className={`pu-state ${courseTone(course)}`}>{courseLabel(course)}</span>;
}

/** Nút hành động chính của một khóa, theo trạng thái. */
export function CourseAction({ course, tone = 'page' }: { course: PulseCourseSummary; tone?: 'page' | 'dark' }) {
  const primary = tone === 'dark' ? 'lime' : 'primary';
  const secondary = tone === 'dark' ? 'on-dark' : 'outline';
  const arrow = <ArrowRight size={15} aria-hidden />;
  switch (course.slotStatus) {
    case 'PRE_ASSESSMENT':
      return <PuLink to={PULSE_PATHS.preAssessment(course.courseId)} kind={primary} small={tone === 'dark'}>Đánh giá trước khi học {arrow}</PuLink>;
    case 'PRE_REVIEW':
      return <PuLink to={PULSE_PATHS.preAssessment(course.courseId)} kind={secondary} small>Xem bài đã nộp</PuLink>;
    case 'TO_LEARN':
      return <PuLink to={PULSE_PATHS.course(course.courseId)} kind={tone === 'dark' ? 'on-dark' : 'primary'} small={tone === 'dark'}>Bắt đầu học {arrow}</PuLink>;
    case 'IN_PROGRESS':
      return <PuLink to={PULSE_PATHS.course(course.courseId)} kind={tone === 'dark' ? 'on-dark' : 'primary'} small={tone === 'dark'}>Học tiếp {arrow}</PuLink>;
    case 'FINAL_READY':
      return <PuLink to={PULSE_PATHS.final(course.courseId)} kind={primary} small={tone === 'dark'}>Làm bài cuối khóa {arrow}</PuLink>;
    case 'IN_REVIEW':
      return <PuLink to={PULSE_PATHS.final(course.courseId)} kind={secondary} small>Xem bài đã nộp</PuLink>;
    case 'RETRY_WAIT':
      return <PuLink to={PULSE_PATHS.final(course.courseId)} kind={secondary} small>Xem nhận xét</PuLink>;
    case 'NEEDS_SUPPORT':
      return <PuLink to={PULSE_PATHS.final(course.courseId)} kind={secondary} small>Xem hướng hỗ trợ</PuLink>;
    case 'SEAT_NEEDED':
      return <PuLink to={PULSE_PATHS.course(course.courseId)} kind={secondary} small>Xem đề cương</PuLink>;
    case 'COMPLETED':
      return <PuLink to={PULSE_PATHS.course(course.courseId)} kind="ghost" small>Xem khóa học</PuLink>;
    default:
      return null;
  }
}

/** Nhắc nhân viên mới: khóa cần bài đánh giá năng lực trước khi học. */
export function AssessFirstNote() {
  return (
    <span className="pu-assess-note">
      <ShieldCheck size={15} aria-hidden />
      Bạn cần làm bài đánh giá năng lực trước khi học khóa này.
    </span>
  );
}

/** Một khóa trong danh sách lĩnh vực: cấp độ, tên, trạng thái, % đã học và nút hành động. */
export function CourseRow({
  course,
  overview,
  onSelectCourse,
}: {
  course: PulseCourseSummary;
  overview: PulseOverview;
  onSelectCourse?: (course: PulseCourseSummary) => void;
}) {
  return (
    <div className={`pu-course-row${course.zone === 'OPTIONAL' ? ' optional' : ''}`}>
      <span className="pu-course-level">
        <b>{levelName(course.tier)}</b>
        <LevelDots level={course.tier} />
      </span>
      <div className="pu-course-main">
        <div className="pu-course-name">
          <span>{course.code}</span>
          {onSelectCourse ? (
            <button
              type="button"
              className="pu-plan-course-btn"
              onClick={() => onSelectCourse(course)}
              title="Bấm để xem nhanh đề cương"
            >
              {toSentenceCase(course.title)}
            </button>
          ) : (
            <Link to={PULSE_PATHS.course(course.courseId)}>{toSentenceCase(course.title)}</Link>
          )}
          <StatePill course={course} />
        </div>
        {course.slotStatus === 'PRE_ASSESSMENT' && <AssessFirstNote />}
        <span className="pu-course-sub">
          {courseStatusText(course, overview.courses, overview.reviewer?.name, overview.person.departmentName)}
        </span>
        {showsProgress(course) && (
          <span className="pu-course-progress">
            <Bar value={course.progressPercent} label={`Tiến độ học ${course.code}`} />
            <span>{course.progressPercent}% đã học</span>
          </span>
        )}
      </div>
      <div className="pu-course-cta"><CourseAction course={course} /></div>
    </div>
  );
}

export function CapNote({ domain, overview }: { domain: PulseDomain; overview: PulseOverview }) {
  const note = capNote(domain, overview.person.positionName, overview.person.departmentName);
  if (!note) return null;
  return (
    <div className="pu-cap-alert" role="status">
      <div className="pu-cap-alert-icon" aria-hidden="true">
        <AlertTriangle size={18} />
      </div>
      <div className="pu-cap-alert-content">
        <strong className="pu-cap-alert-title">Giới hạn trần năng lực của phòng ban</strong>
        <p className="pu-cap-alert-desc">{note}</p>
      </div>
    </div>
  );
}

/** Ba ô trạng thái nhỏ (Cơ bản / Trung cấp / Nâng cao) của một lĩnh vực. */
export function DomainTrack({ courses, vertical }: { courses: PulseCourseSummary[]; vertical?: boolean }) {
  const ordered = [...courses].sort((a, b) => (vertical ? b.tier - a.tier : a.tier - b.tier));
  return (
    <span className={vertical ? 'pu-comp-tower' : 'pu-domain-track'} aria-hidden>
      {ordered.map((course) => <i key={course.courseId} className={`pu-tile-state ${courseTone(course)}`} />)}
    </span>
  );
}
