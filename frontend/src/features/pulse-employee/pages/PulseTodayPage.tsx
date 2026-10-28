import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BriefcaseBusiness, ChevronDown, Clock, Compass, Flag, UserX } from 'lucide-react';
import { usePulseOverview } from '@/hooks/use-pulse';
import { useIsEnterpriseTrial } from '@/hooks/use-trial-program';
import type { PulseCourseSummary, PulseDomain, PulseOverview } from '@/services/pulse.service';
import { formatDate } from '@/lib/utils';
import { CapNote, CourseAction, CourseRow, DomainTrack, RoadmapPlan } from '../components/roadmap';
import { withinCeiling } from '../lib/course-state';
import { Bar, Empty, Eyebrow, LoadError, Mini, PageSkeleton, PuLink } from '../components/ui';
import { domainSummary, initials, levelName, pad2, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

/**
 * Hôm nay (EM-01): vị trí và người đánh giá, lộ trình doanh nghiệp đặt (chỉ tên khóa và cấp độ), việc nên làm tiếp,
 * rồi các lĩnh vực cần học — mở một lĩnh vực ra các khóa với trạng thái, % đã học và bài đánh giá trước khi học.
 */
export function PulseTodayPage() {
  const { data, isLoading, error, refetch } = usePulseOverview();
  const [open, setOpen] = useState<string | null | undefined>(undefined);
  const trial = useIsEnterpriseTrial();
  // Doanh nghiệp dùng thử: một trang Học thử duy nhất (Lộ trình).
  if (trial) return <Navigate to={PULSE_PATHS.path} replace />;
  if (isLoading) return <PageSkeleton blocks={[240, 420, 520]} />;
  if (error || !data) return <LoadError message={pulseErrorMessage(error, 'Không tải được không gian học của bạn.')} onRetry={() => refetch()} />;
  if (!data.hasPosition || !data.hasTargets) return <NoPath overview={data} />;

  const domains = data.domains.filter((d) => d.target > 0);
  const firstActive = data.nextSteps[0]?.categoryId ?? domains[0]?.categoryId ?? null;
  const openId = open === undefined ? firstActive : open;

  return (
    <div className="pu-home">
      <section className="pu-home-top">
        <Greeting overview={data} />
        <RoleCard overview={data} />
      </section>

      <section className="pu-home-plan">
        <article className="pu-plan-card" aria-labelledby="pu-plan-title">
          <header>
            <div>
              <Mini>Lộ trình doanh nghiệp đặt</Mini>
              <h2 id="pu-plan-title">{data.stats.pathCourses} khóa cho vị trí {data.person.positionName ?? 'của bạn'}</h2>
              <p>Mỗi hàng là một lĩnh vực, mỗi cột là một cấp độ. Tiến độ và kết quả của bạn ở danh sách lĩnh vực bên dưới.</p>
            </div>
            <PuLink to={PULSE_PATHS.path} kind="outline" small>Xem chi tiết lộ trình →</PuLink>
          </header>
          <RoadmapPlan overview={data} caption={`Lộ trình doanh nghiệp đặt cho vị trí ${data.person.positionName ?? ''}: tên khóa theo lĩnh vực và cấp độ`} />
          <PlanFoot overview={data} />
        </article>
        <NextSteps overview={data} />
      </section>

      <section aria-labelledby="pu-domains-title" className="pu-stack" style={{ gap: 14 }}>
        <div className="pu-section-head">
          <div>
            <Eyebrow>Lĩnh vực cần học</Eyebrow>
            <h2 id="pu-domains-title">{domains.length} lĩnh vực, {data.stats.pathCourses} khóa trong lộ trình</h2>
            <p>Mở một lĩnh vực để xem các khóa, trạng thái và phần đã học của bạn.</p>
          </div>
          <span className="pu-count">{data.stats.approvedPathCourses}/{data.stats.pathCourses} khóa đã đạt</span>
        </div>
        <div className="pu-domains">
          {domains.map((domain) => (
            <DomainItem
              key={domain.categoryId}
              domain={domain}
              overview={data}
              open={openId === domain.categoryId}
              onToggle={() => setOpen(openId === domain.categoryId ? null : domain.categoryId)}
            />
          ))}
        </div>
      </section>

      <nav className="pu-more-links" aria-label="Thêm cho hành trình của bạn">
        <span>Thêm cho hành trình của bạn</span>
        <PuLink to={PULSE_PATHS.practice} kind="outline" small>Bài đã nộp</PuLink>
        <PuLink to={PULSE_PATHS.outcomes} kind="outline" small>Kết quả đã xác nhận</PuLink>
        <PuLink to={PULSE_PATHS.profile} kind="outline" small>Hồ sơ của tôi</PuLink>
      </nav>
    </div>
  );
}

const firstName = (fullName: string) => fullName.trim().split(/\s+/).pop() || fullName;

const today = () => new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' }).format(new Date());

function Greeting({ overview }: { overview: PulseOverview }) {
  const { person, stats } = overview;
  const started = stats.approvedPathCourses > 0 || overview.courses.some((c) => c.enrollmentId || c.preAssessment);
  const position = person.positionName ?? 'của bạn';
  return (
    <div className="pu-greeting">
      <Eyebrow>Hôm nay · {today()}</Eyebrow>
      {started ? (
        <>
          <h1>Chào {firstName(person.fullName)}, lộ trình <em>{position}</em> của bạn đã đạt {stats.approvedPathCourses}/{stats.pathCourses} khóa.</h1>
          <p>Mỗi khóa bắt đầu bằng bài đánh giá trước khi học: đạt thì khóa được công nhận ngay, chưa đạt thì bạn học khóa đó rồi làm bài cuối khóa.</p>
        </>
      ) : (
        <>
          <h1>Chào {firstName(person.fullName)}, lộ trình <em>{position}</em> của bạn đã sẵn sàng.</h1>
          <p>
            Doanh nghiệp đặt {stats.pathCourses} khóa cho vị trí của bạn. Mỗi khóa có một bài đánh giá trước khi học: đạt thì khóa được
            công nhận, không cần học; chưa đạt thì bạn học khóa đó.
          </p>
        </>
      )}
    </div>
  );
}

function RoleCard({ overview }: { overview: PulseOverview }) {
  const { person, reviewer, stats } = overview;
  return (
    <aside className="pu-role-card" aria-label="Vị trí và người đánh giá">
      <div className="pu-role-row">
        <span className="pu-role-icon" aria-hidden><BriefcaseBusiness size={20} /></span>
        <div>
          <Mini>Vị trí của bạn</Mini>
          <strong>{person.positionName ?? 'Chưa gán vị trí'}</strong>
          <span>{[person.departmentName && `Phòng ${person.departmentName}`, person.organizationName].filter(Boolean).join(' · ')}</span>
        </div>
      </div>
      <div className="pu-role-row">
        <span className="pu-role-icon reviewer" aria-hidden>{initials(reviewer?.name)}</span>
        <div>
          <Mini>Người đánh giá quá trình của bạn</Mini>
          <strong>{reviewer?.name ?? 'Chưa có người chấm'}</strong>
          <span>
            {reviewer
              ? `${reviewer.role}. Chấm bài đánh giá trước khi học và bài cuối khóa của bạn.`
              : 'Phòng ban của bạn chưa có quản lý. Hãy liên hệ chủ doanh nghiệp.'}
          </span>
        </div>
      </div>
      <div className="pu-role-row">
        <span className="pu-role-icon plan" aria-hidden><Flag size={20} /></span>
        <div>
          <Mini>Lộ trình doanh nghiệp đặt</Mini>
          <span>
            {stats.requiredCompetencies} năng lực của Khung năng lực số TT02/2025, thành {stats.pathCourses} khóa trong lộ trình
            {stats.optionalCourses ? ` và ${stats.optionalCourses} khóa tùy chọn` : ''}.
          </span>
        </div>
      </div>
    </aside>
  );
}

function PlanFoot({ overview }: { overview: PulseOverview }) {
  const { stats } = overview;
  return (
    <footer className="pu-plan-foot">
      <span>{stats.requiredCompetencies} năng lực · Khung năng lực số TT02/2025</span>
      {stats.optionalCourses > 0 && <span>+{stats.optionalCourses} khóa tùy chọn trong phạm vi được mở, ở danh sách bên dưới</span>}
    </footer>
  );
}

const stepKicker = (course: PulseCourseSummary) =>
  course.slotStatus === 'FINAL_READY' ? 'Bài cuối khóa · đã học 100%'
    : course.slotStatus === 'IN_PROGRESS' ? `Đang học · ${course.progressPercent}%`
    : course.slotStatus === 'PRE_ASSESSMENT' ? `Đánh giá trước khi học · ${levelName(course.tier)}`
    : `Cần học · ${levelName(course.tier)}`;

function NextSteps({ overview }: { overview: PulseOverview }) {
  const steps = overview.nextSteps;
  const waiting = overview.courses.filter((c) => c.slotStatus === 'PRE_REVIEW' || c.slotStatus === 'IN_REVIEW');
  const fresh = steps.length > 0 && overview.stats.approvedPathCourses === 0 && steps.every((s) => s.slotStatus === 'PRE_ASSESSMENT');
  const reviewer = overview.reviewer?.name;
  return (
    <aside className="pu-next" aria-labelledby="pu-next-title">
      <Mini>Việc tiếp theo</Mini>
      <h2 id="pu-next-title">
        {steps.length === 0 ? 'Không còn việc đang mở' : fresh ? 'Bắt đầu bằng bài đánh giá' : 'Việc nên làm tiếp'}
      </h2>
      {fresh && (
        <p>
          {overview.stats.preAssessmentsOpen} bài đánh giá Cơ bản đang mở. Làm theo thứ tự bạn muốn; bài làm được ghi hình rồi
          {reviewer ? ` ${reviewer}` : ' người chấm'} chấm.
        </p>
      )}
      {steps.length === 0 && (
        <p>{waiting.length ? 'Các bài đã nộp đang chờ chấm. Kết quả sẽ hiện ở đây.' : 'Mọi khóa trong lộ trình đã đạt hoặc đang chờ mở.'}</p>
      )}
      {steps.map((course) => (
        <div className="pu-next-item" key={course.courseId}>
          <small>{stepKicker(course)}</small>
          <strong>{course.code} · {course.title}</strong>
          {course.slotStatus === 'IN_PROGRESS' && <Bar value={course.progressPercent} label={`Tiến độ học ${course.code}`} />}
          <CourseAction course={course} tone="dark" />
        </div>
      ))}
      {waiting.length > 0 && (
        <p className="pu-next-wait">
          <Clock size={15} aria-hidden style={{ flex: 'none', marginTop: 2 }} />
          <span>
            Đang chờ {reviewer ?? 'người chấm'} chấm:{' '}
            {waiting.map((c) => `${c.code} ${c.title}`).join('; ')}
            {waiting.length === 1 && waiting[0]!.preAssessment ? `, nộp ${formatDate(waiting[0]!.preAssessment.submittedAt)}` : ''}.
          </span>
        </p>
      )}
    </aside>
  );
}

function DomainItem({ domain, overview, open, onToggle }: { domain: PulseDomain; overview: PulseOverview; open: boolean; onToggle: () => void }) {
  const courses = withinCeiling(overview.courses).filter((c) => c.categoryId === domain.categoryId).sort((a, b) => a.tier - b.tier);
  const bodyId = `pu-domain-${domain.categoryId}`;
  const code = courses[0]?.code.split('-')[0] ?? domain.code;
  return (
    <article className="pu-domain" data-open={open}>
      <button type="button" className="pu-domain-head" aria-expanded={open} aria-controls={bodyId} onClick={onToggle}>
        <span className="pu-domain-num">{pad2(domain.number)}</span>
        <span className="pu-domain-title">
          <strong>{code} · {domain.name}</strong>
          <small>{domainSummary(domain, overview.courses)}</small>
        </span>
        <DomainTrack courses={courses} />
        <span className="pu-domain-chevron" aria-hidden><ChevronDown size={16} /></span>
      </button>
      {open && (
        <div className="pu-domain-body" id={bodyId}>
          <CapNote domain={domain} overview={overview} />
          {courses.map((course) => <CourseRow key={course.courseId} course={course} overview={overview} />)}
        </div>
      )}
    </article>
  );
}

function NoPath({ overview }: { overview: PulseOverview }) {
  return (
    <Empty
      icon={overview.hasPosition ? <Compass size={24} /> : <UserX size={24} />}
      title={overview.hasPosition ? 'Vị trí của bạn chưa có lộ trình' : 'Bạn chưa được gán vị trí công việc'}
    >
      {overview.hasPosition
        ? `Chủ doanh nghiệp chưa công bố yêu cầu năng lực cho vị trí ${overview.person.positionName ?? ''}, hoặc chưa mở lĩnh vực nào cho phòng ban của bạn. Lộ trình sẽ hiện khi được thiết lập.`
        : 'Lộ trình học đi theo phòng ban và vị trí của bạn. Hãy liên hệ chủ doanh nghiệp để được xếp vào đúng vị trí.'}
    </Empty>
  );
}
