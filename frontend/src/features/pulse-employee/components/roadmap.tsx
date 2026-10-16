import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import type { PulseCourseSummary, PulseDomain, PulseOverview } from '@/services/pulse.service';
import { courseLabel, courseStatusText, courseTone, showsProgress } from '../lib/course-state';
import { capNote, levelName } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';
import { Bar, PuLink } from './ui';

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
 * (Cơ bản → min(mục tiêu vị trí, trần phòng ban)). Khóa tùy chọn (trên mục tiêu, trong trần) hiện nhạt, khóa vượt trần viền
 * đứt. Chỉ là kế hoạch — không có tiến độ hay đạt / chưa đạt.
 */
export function RoadmapPlan({ overview, variant = 'light', caption }: { overview: PulseOverview; variant?: 'light' | 'blueprint'; caption: string }) {
  const domains = overview.domains.filter((d) => d.pathTop > 0);
  return (
    <div className="pu-plan-scroll">
      <table className={`pu-plan${variant === 'blueprint' ? ' blueprint' : ''}`}>
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
              overview.courses.find((c) => c.categoryId === domain.categoryId && c.tier === tier && c.zone !== 'OUTSIDE_PATH'));
            return (
              <tr key={domain.categoryId}>
                <th scope="row">
                  <span className="pu-plan-domain">
                    <b>{shortCode(domain, overview.courses)}</b>
                    <span>{domain.name}</span>
                  </span>
                </th>
                {row.map((course, index) => (
                  <td key={index}>
                    {course ? <PlanCell course={course} domain={domain} joined={course.zone === 'PATH' && row[index + 1]?.zone === 'PATH'} /> : (
                      <span className="pu-plan-empty">Không có khóa</span>
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

function PlanCell({ course, domain, joined }: { course: PulseCourseSummary; domain: PulseDomain; joined: boolean }) {
  const zone = course.zone === 'OPTIONAL' ? ' optional' : course.zone === 'ABOVE_CEILING' ? ' beyond' : '';
  const tag = course.zone === 'OPTIONAL' ? 'Tùy chọn'
    : course.zone === 'ABOVE_CEILING' ? 'Ngoài trần'
    : course.tier === domain.pathTop ? (domain.pathTop < domain.target ? 'Trần phòng ban' : 'Mục tiêu')
    : null;
  return (
    <span className={`pu-plan-course lv${course.tier}${zone}${joined ? ' joined' : ''}`}>
      <b>
        {course.code}
        {tag && <span className="pu-plan-goal">{tag}</span>}
      </b>
      <span><Link to={PULSE_PATHS.course(course.courseId)}>{course.title}</Link></span>
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
export function CourseRow({ course, overview }: { course: PulseCourseSummary; overview: PulseOverview }) {
  const zoneClass = course.zone === 'OPTIONAL' ? ' optional' : course.zone === 'ABOVE_CEILING' ? ' beyond' : '';
  return (
    <div className={`pu-course-row${zoneClass}`}>
      <span className="pu-course-level">
        <b>{levelName(course.tier)}</b>
        <LevelDots level={course.tier} />
      </span>
      <div className="pu-course-main">
        <div className="pu-course-name">
          <span>{course.code}</span>
          <Link to={PULSE_PATHS.course(course.courseId)}>{course.title}</Link>
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
    <p className="pu-cap-note">
      <AlertTriangle size={16} aria-hidden />
      <span>{note}</span>
    </p>
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
