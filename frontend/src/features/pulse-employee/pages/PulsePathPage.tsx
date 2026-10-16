import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown } from 'lucide-react';
import { usePulseOverview } from '@/hooks/use-pulse';
import type { PulseCourseSummary, PulseDomain, PulseOverview } from '@/services/pulse.service';
import {
  AssessFirstNote,
  CapNote,
  CourseAction,
  DomainTrack,
  RoadmapPlan,
  StatePill,
} from '../components/roadmap';
import { courseStatusText, courseTone, showsProgress, withinCeiling } from '../lib/course-state';
import { Bar, Eyebrow, LoadError, Mini, PageSkeleton, PuLink } from '../components/ui';
import { initials, levelName, pad2, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';
import { PulseTodayPage } from './PulseTodayPage';

/**
 * Lộ trình (EM-02): giới thiệu vị trí và bản vẽ lộ trình doanh nghiệp đặt (tên khóa theo lĩnh vực × cấp độ), cách mỗi khóa
 * được công nhận, rồi các năng lực cần đạt — mở một năng lực ra các chặng khóa với bài đánh giá trước khi học và tiến độ.
 */
export function PulsePathPage() {
  const { data, isLoading, error, refetch } = usePulseOverview();
  const [open, setOpen] = useState<string | null | undefined>(undefined);
  if (isLoading) return <PageSkeleton blocks={[520, 220, 640]} />;
  if (error || !data) return <LoadError message={pulseErrorMessage(error, 'Không tải được lộ trình của bạn.')} onRetry={() => refetch()} />;
  if (!data.hasPosition || !data.hasTargets) return <PulseTodayPage />;

  const domains = data.domains.filter((d) => d.target > 0);
  const firstActive = data.nextSteps[0]?.categoryId ?? domains[0]?.categoryId ?? null;
  const openId = open === undefined ? firstActive : open;

  return (
    <div className="pu-path">
      <Hero overview={data} />
      <HowItWorks reviewerName={data.reviewer?.name} />

      <section aria-labelledby="pu-comp-title" className="pu-stack" style={{ gap: 14 }}>
        <div className="pu-section-head">
          <div>
            <Eyebrow>Năng lực cần đạt</Eyebrow>
            <h2 id="pu-comp-title">{data.stats.requiredCompetencies} năng lực trong {domains.length} lĩnh vực</h2>
            <p>Mở một lĩnh vực để xem các khóa theo thứ tự Cơ bản, Trung cấp, Nâng cao, bài đánh giá trước khi học và phần đã học của bạn.</p>
          </div>
        </div>
        <div className="pu-comp-list">
          {domains.map((domain) => (
            <CompetencyItem
              key={domain.categoryId}
              domain={domain}
              overview={data}
              open={openId === domain.categoryId}
              onToggle={() => setOpen(openId === domain.categoryId ? null : domain.categoryId)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function Hero({ overview }: { overview: PulseOverview }) {
  const { person, reviewer, stats } = overview;
  const position = person.positionName ?? 'Vị trí của bạn';
  const domainCount = overview.domains.filter((d) => d.pathTop > 0).length;
  const next = overview.nextSteps[0];
  return (
    <section className="pu-path-hero" aria-labelledby="pu-path-title">
      <div className="pu-path-intro">
        <Eyebrow>Lộ trình vị trí · doanh nghiệp thiết lập</Eyebrow>
        <div>
          <h1 id="pu-path-title">{position}</h1>
          <span>{[person.departmentName && `Phòng ${person.departmentName}`, person.organizationName].filter(Boolean).join(' · ')}</span>
        </div>
        <p>
          Doanh nghiệp yêu cầu vị trí này đạt {stats.requiredCompetencies} năng lực của Khung năng lực số TT02/2025. Lộ trình gom chúng thành{' '}
          {domainCount} lĩnh vực và {stats.pathCourses} khóa, đi từ Cơ bản tới mức mục tiêu, trong trần doanh nghiệp đặt cho
          {person.departmentName ? ` phòng ${person.departmentName}` : ' phòng ban của bạn'}.
        </p>
        <dl className="pu-path-facts">
          <div><dt>Khóa trong lộ trình</dt><dd>{stats.pathCourses}</dd></div>
          <div><dt>Năng lực yêu cầu</dt><dd>{stats.requiredCompetencies}</dd></div>
          <div><dt>Lĩnh vực</dt><dd>{domainCount}</dd></div>
          {stats.optionalCourses > 0 && <div><dt>Khóa tùy chọn</dt><dd>{stats.optionalCourses}</dd></div>}
        </dl>
        <div className="pu-path-reviewer">
          <span className="pu-role-icon reviewer" aria-hidden>{initials(reviewer?.name)}</span>
          <span>
            <small>Người đánh giá quá trình của bạn</small>
            <strong>{reviewer ? `${reviewer.name} · ${reviewer.role}` : 'Chưa có người chấm'}</strong>
          </span>
        </div>
        <div className="pu-row">
          {next && <CourseAction course={next} />}
          <PuLink to={PULSE_PATHS.today} kind="ghost">Quay lại Hôm nay</PuLink>
        </div>
      </div>

      <div className="pu-blueprint">
        <div className="pu-blueprint-head">
          <b>Bản vẽ lộ trình · {position}</b>
          <span>Mỗi ô là một khóa · {stats.pathCourses} khóa</span>
        </div>
        <RoadmapPlan
          overview={overview}
          variant="compact"
          caption={`Bản vẽ lộ trình ${position}: tên khóa theo lĩnh vực và cấp độ`}
        />
        <div className="pu-titleblock" aria-hidden>
          <span>Bản vẽ lộ trình</span>
          <span>Khung TT02/2025</span>
          <span>Vị trí: {position}</span>
          <span>Trần: {person.departmentName ? `phòng ${person.departmentName}` : 'phòng ban'}</span>
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ reviewerName }: { reviewerName?: string | null }) {
  return (
    <section className="pu-howto" aria-labelledby="pu-howto-title">
      <div>
        <Mini>Cách mỗi khóa được công nhận</Mini>
        <h2 id="pu-howto-title">Đánh giá trước, chỉ học khi cần</h2>
      </div>
      <ol>
        <li>
          <span className="pu-howto-num">1</span>
          <strong>Làm bài đánh giá trước khi học</strong>
          <span>Đề giống bài cuối khóa. Bạn chia sẻ toàn bộ màn hình, bật camera và micro; cả ba được ghi lại.</span>
        </li>
        <li>
          <span className="pu-howto-num">2</span>
          <strong>{reviewerName ?? 'Người chấm'} chấm cùng bản ghi</strong>
          <span>Ba tiêu chí: nguồn có thể truy vết, hành động có thể kiểm tra, kết luận có căn cứ.</span>
        </li>
        <li className="ok">
          <span className="pu-howto-tag"><Check size={13} strokeWidth={3} aria-hidden />Đạt</span>
          <strong>Khóa được công nhận</strong>
          <span>Không cần học khóa đó. Khóa tiếp theo của lĩnh vực mở ngay.</span>
        </li>
        <li className="no">
          <span className="pu-howto-tag">Chưa đạt</span>
          <strong>Học rồi làm bài cuối khóa</strong>
          <span>Học hết các mô-đun, làm bài cuối khóa cũng có ghi hình, tối đa 2 lần nộp.</span>
        </li>
      </ol>
    </section>
  );
}

function CompetencyItem({ domain, overview, open, onToggle }: { domain: PulseDomain; overview: PulseOverview; open: boolean; onToggle: () => void }) {
  const courses = withinCeiling(overview.courses).filter((c) => c.categoryId === domain.categoryId).sort((a, b) => a.tier - b.tier);
  const path = courses.filter((c) => c.zone === 'PATH');
  const optional = courses.filter((c) => c.zone === 'OPTIONAL').length;
  const code = courses[0]?.code.split('-')[0] ?? domain.code;
  const bodyId = `pu-comp-${domain.categoryId}`;
  const summary = [
    `Mục tiêu ${levelName(domain.target)}`,
    `trần phòng ban ${levelName(domain.ceiling)}`,
    `${path.length} khóa trong lộ trình`,
    optional ? `${optional} khóa tùy chọn` : null,
  ].filter(Boolean).join(' · ');
  return (
    <article className="pu-comp" data-open={open}>
      <button type="button" className="pu-comp-head" aria-expanded={open} aria-controls={bodyId} onClick={onToggle}>
        <span className="pu-comp-num" aria-hidden>{pad2(domain.number)}</span>
        <span className="pu-comp-main">
          <span>
            <strong>{code} · {domain.name}</strong>
            <small>{summary}</small>
          </span>
        </span>
        <span className="pu-comp-side">
          <DomainTrack courses={courses} vertical />
          <span>
            <strong>{path.filter((c) => c.approved).length}/{path.length}</strong>
            <small>khóa đã đạt</small>
          </span>
          <span className="pu-domain-chevron" aria-hidden><ChevronDown size={16} /></span>
        </span>
      </button>
      <CompetencyChips domain={domain} />
      {open && (
        <div className="pu-comp-body" id={bodyId}>
          <CapNote domain={domain} overview={overview} />
          <div className="pu-stations">
            {courses.map((course, index) => (
              <Station key={course.courseId} course={course} overview={overview} last={index === courses.length - 1} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function CompetencyChips({ domain }: { domain: PulseDomain }) {
  return (
    <div className="pu-comp-chips-row">
      <ul className="pu-comp-chips" aria-label={`Năng lực vị trí yêu cầu trong lĩnh vực ${domain.name}`}>
        {domain.competencies.map((competency) => (
          <li className="pu-comp-chip" key={competency.code}>
            <b>{competency.code}</b>
            <span>{competency.name}</span>
            <span className="pu-level-bars" aria-hidden>
              {[1, 2, 3].map((n) => <i key={n} className={n <= competency.requiredLevel ? 'on' : undefined} />)}
            </span>
            <em>{levelName(competency.requiredLevel)}</em>
            {competency.core && <span className="pu-core-tag">Cốt lõi</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Station({ course, overview, last }: { course: PulseCourseSummary; overview: PulseOverview; last: boolean }) {
  const tone = courseTone(course);
  const progress = showsProgress(course);
  const card = course.zone === 'OPTIONAL' ? 'optional'
    : ['PRE_ASSESSMENT', 'TO_LEARN', 'IN_PROGRESS', 'FINAL_READY'].includes(course.slotStatus) ? 'active'
    : '';
  return (
    <div className="pu-station">
      <div className="pu-station-rail" aria-hidden>
        <span className={`pu-station-node ${tone}`}>{course.code.split('-')[1] ?? course.tier}</span>
        <i className={last ? 'last' : course.approved ? 'done' : undefined} />
      </div>
      <article className={`pu-station-card ${card}`} aria-label={`${course.code} ${course.title}`}>
        <header>
          <Mini>{levelName(course.tier)}</Mini>
          <StatePill course={course} />
        </header>
        <div className="pu-station-title">
          <span>{course.code}</span>
          <Link to={PULSE_PATHS.course(course.courseId)}>{course.title}</Link>
        </div>
        {course.modules.length > 0 && (
          <ul className="pu-station-mods" aria-label="Mô-đun của khóa">
            {course.modules.map((module) => (
              <li key={module.title} className={progress && module.passed ? 'done' : undefined}>
                {module.title}
                {progress && module.passed && <span className="sr-only"> (đã qua)</span>}
              </li>
            ))}
          </ul>
        )}
        <div className="pu-station-foot">
          {course.slotStatus === 'PRE_ASSESSMENT' && <AssessFirstNote />}
          <span className="pu-course-sub">
            {courseStatusText(course, overview.courses, overview.reviewer?.name, overview.person.departmentName)}
          </span>
          {progress && (
            <span className="pu-course-progress">
              <Bar value={course.progressPercent} label={`Tiến độ học ${course.code}`} />
              <span>{course.progressPercent}% đã học</span>
            </span>
          )}
          <CourseAction course={course} />
        </div>
      </article>
    </div>
  );
}
