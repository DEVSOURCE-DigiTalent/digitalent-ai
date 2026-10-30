import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Lock, ShieldCheck } from 'lucide-react';
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
    <div className="pu-plan-scroll">
      <table className={`pu-plan${variant === 'compact' ? ' compact' : ''}`}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Lĩnh vực</th>
            {[1, 2, 3].map((level) => (
              <th scope="col" key={level}>{levelName(level)}<LevelDots level={level} /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {domains.map((domain) => {
            const row = [1, 2, 3].map((tier) =>
              overview.courses.find((c) => c.categoryId === domain.categoryId && c.tier === tier && c.zone === 'PATH'));
            return (
              <tr key={domain.categoryId}>
                <th scope="row">
                  <span className="pu-plan-domain">
                    <b>{shortCode(domain, overview.courses)}</b>
                    <span>{toSentenceCase(domain.name)}</span>
                  </span>
                </th>
                {row.map((course, index) => (
                  <td key={index}>
                    {course ? (
                      <PlanCell
                        course={course}
                        domain={domain}
                        joined={Boolean(row[index + 1])}
                        onSelectCourse={onSelectCourse}
                      />
                    ) : (
                      <div className="pu-plan-empty" aria-label="Không có khóa trong lộ trình">
                        <span className="sr-only">Không có khóa trong lộ trình</span>
                        <span className="pu-plan-empty-mark" aria-hidden>—</span>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
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
  const tag = course.tier !== domain.pathTop ? null : domain.pathTop < domain.target ? 'Giới hạn khóa' : 'Mục tiêu';
  return (
    <span
      className={`pu-plan-course lv${course.tier}${joined ? ' joined' : ''}`}
      style={onSelectCourse ? { cursor: 'pointer' } : undefined}
      onClick={onSelectCourse ? () => onSelectCourse(course) : undefined}
      role={onSelectCourse ? 'button' : undefined}
      tabIndex={onSelectCourse ? 0 : undefined}
      title={onSelectCourse ? 'Bấm để xem nhanh đề cương & điều kiện miễn học' : undefined}
      onKeyDown={
        onSelectCourse
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectCourse(course);
              }
            }
          : undefined
      }
    >
      <b>
        <span className="pu-plan-code">{course.code}</span>
        {tag && (
          <span className={`pu-plan-goal ${tag === 'Giới hạn khóa' ? 'capped' : 'target'}`}>
            {tag === 'Giới hạn khóa' && <Lock size={10} style={{ display: 'inline', marginRight: 3, verticalAlign: -1 }} />}
            {tag}
          </span>
        )}
      </b>
      <span>
        {onSelectCourse ? (
          <button
            type="button"
            className="pu-plan-course-btn"
            onClick={(e) => {
              e.stopPropagation();
              onSelectCourse(course);
            }}
          >
            {toSentenceCase(course.title)}
          </button>
        ) : (
          <Link to={PULSE_PATHS.course(course.courseId)}>{toSentenceCase(course.title)}</Link>
        )}
      </span>
    </span>
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
