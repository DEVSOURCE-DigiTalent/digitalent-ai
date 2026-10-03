import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Play } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePersonalOverview } from '@/hooks/use-personal-learning';
import { levelLabelVi } from '@/lib/competency-levels';
import type { PersonalOverview } from '@/services/personal-learning.service';
import { ActivityList } from '../components/ActivityList';
import { DomainRadar, RadarLegend } from '../components/DomainRadar';
import {
  Card, ErrorBlock, LevelPips, LoadingBlock, PT_BUTTON, PT_BUTTON_SECONDARY, PT_EYEBROW, PageIntro, ProgressBar,
  SectionTitle, Stat, Tag
} from '../components/ui';
import { errorMessage } from '../utils/error-message';
import { DOMAIN_SHORT_NAMES, formatHours, formatMinutes } from '../utils/format';

/** IND-04 "/personal": where the learner stands and the one thing to do next. */
export function LearnerDashboardPage() {
  const user = useCurrentUser((state) => state.user);
  const { data, isLoading, isError, error, refetch } = usePersonalOverview();
  const firstName = (data?.fullName ?? user?.fullName ?? '').trim().split(/\s+/).pop() ?? '';

  return (
    <div data-testid="learner-dashboard" className="grid gap-10">
      <PageIntro
        label="Tổng quan"
        title={`Chào ${firstName},`}
        accent={data?.target ? 'đây là chặng đường của bạn.' : 'bắt đầu từ một đích đến.'}
        lead={
          data?.target
            ? `Mục tiêu: ${data.target.name}. Bạn đã đáp ứng ${data.coveragePercent}% yêu cầu năng lực của vị trí.`
            : 'Chọn vị trí bạn muốn đạt tới, làm bài đánh giá đầu vào và nhận lộ trình học riêng cho bạn.'
        }
      />

      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message={errorMessage(error)} onRetry={() => refetch()} />}
      {data && !data.target && <GettingStarted />}
      {data?.target && <Overview data={data} />}
    </div>
  );
}

const STEPS = [
  { title: 'Chọn vị trí mục tiêu', text: 'Xem yêu cầu năng lực của vị trí bạn muốn hướng tới.', to: '/personal/target', cta: 'Chọn vị trí' },
  { title: 'Làm đánh giá đầu vào', text: '18 câu tình huống, khoảng 10 phút, để biết mức hiện tại của bạn.', to: '/personal/diagnostic', cta: 'Làm bài' },
  { title: 'Học theo lộ trình', text: 'Chỉ học phần còn thiếu, theo đúng thứ tự tiên quyết.', to: '/personal/path', cta: 'Xem lộ trình' },
];

function GettingStarted() {
  return (
    <ol className="grid gap-3 md:grid-cols-3">
      {STEPS.map((step, index) => (
        <Card as="li" key={step.title} className="pt-rise flex flex-col justify-between gap-10 p-6" style={{ animationDelay: `${index * 90}ms` }}>
          <span className="font-landing-serif text-5xl italic leading-none text-pt-fg-3">{index + 1}</span>
          <div>
            <h2 className="text-[20px] font-normal tracking-[-0.015em]">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-pt-fg-2">{step.text}</p>
            <Link to={step.to} className={`${index === 0 ? PT_BUTTON : PT_BUTTON_SECONDARY} mt-6`}>
              {step.cta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </Card>
      ))}
    </ol>
  );
}

function Overview({ data }: { data: PersonalOverview }) {
  return (
    <>
      {!data.assessed && (
        <Card className="flex flex-col gap-4 border-pt-warn/40 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-pt-fg-2">
            <span className="text-pt-fg">Bạn chưa làm bài đánh giá đầu vào.</span> Lộ trình đang tính từ mức 0 — làm bài để được miễn phần đã biết.
          </p>
          <Link to="/personal/diagnostic" className={PT_BUTTON}>Làm đánh giá</Link>
        </Card>
      )}

      <div className="grid gap-3 lg:grid-cols-12">
        <ContinueCard data={data} />
        <TargetCard data={data} />
      </div>

      <Card className="grid grid-cols-2 gap-6 p-6 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Lộ trình" value={`${data.path.completedCourses}/${data.path.totalCourses}`} hint="khóa đã xong" />
        <Stat label="Còn lại" value={formatHours(data.path.minutesLeft)} hint="thời lượng ước tính" />
        <Stat label="Đã học" value={formatHours(data.learnedMinutes)} hint="tổng thời gian" />
        <Stat label="Chứng nhận" value={data.certificateCount} hint={<Link to="/personal/certificates" className="hover:text-pt-fg">xem tất cả</Link>} />
        <Stat label="Bài thực hành" value={data.openTaskCount} hint={<Link to="/personal/tasks" className="hover:text-pt-fg">đang chờ bạn</Link>} />
      </Card>

      <div className="grid gap-3 lg:grid-cols-12">
        <Card className="p-6 lg:col-span-7">
          <SectionTitle title="Theo từng miền năng lực" aside={<Link to="/personal/progress" className="hover:text-pt-fg">Hồ sơ năng lực →</Link>} />
          <ul className="mt-6 grid gap-1">
            {data.domains.map((domain) => (
              <li key={domain.number} className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-pt-fg/4">
                <span className="text-xs text-pt-fg-3 tabular-nums">{domain.number}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm text-pt-fg">{domain.name}</span>
                  <span className="text-xs text-pt-fg-3">
                    {domain.required === 0
                      ? 'Vị trí không yêu cầu'
                      : domain.gapCount === 0
                        ? `Đạt yêu cầu ${levelLabelVi(domain.required)}`
                        : `${domain.gapCount} năng lực còn thiếu · cần ${levelLabelVi(domain.required)}`}
                  </span>
                </span>
                <LevelPips level={domain.current} required={domain.required} />
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6 lg:col-span-5">
          <SectionTitle title="Hoạt động gần đây" />
          <div className="mt-6">
            <ActivityList items={data.activity} />
          </div>
        </Card>
      </div>
    </>
  );
}

function ContinueCard({ data }: { data: PersonalOverview }) {
  const lesson = data.continueLesson;
  const next = data.nextCourse;

  return (
    <Card className="relative flex min-h-[300px] flex-col justify-between overflow-hidden p-7 lg:col-span-7">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-pt-fg/6 blur-3xl" />
      <div className="relative flex items-center justify-between gap-3">
        <p className={PT_EYEBROW}>{lesson ? 'Học tiếp' : next ? 'Khóa tiếp theo' : 'Lộ trình'}</p>
        {next && <Tag>{next.code} · {levelLabelVi(next.level)}</Tag>}
      </div>

      {lesson ? (
        <div className="relative">
          <h2 className="text-balance text-[clamp(24px,3vw,34px)] font-normal leading-[1.1] tracking-[-0.025em]">{lesson.courseTitle}</h2>
          <p className="mt-3 text-sm text-pt-fg-2">Bài tiếp theo: {lesson.lessonTitle}</p>
          <div className="mt-6 flex items-center gap-4">
            <ProgressBar value={lesson.progressPercent} label={`Tiến độ khóa ${lesson.courseTitle}`} />
            <span className="text-sm tabular-nums text-pt-fg-2">{lesson.progressPercent}%</span>
          </div>
          <Link to={`/personal/classroom/${lesson.courseId}?lesson=${lesson.lessonId}`} className={`${PT_BUTTON} mt-7`}>
            <Play className="size-4" aria-hidden="true" /> Học tiếp
          </Link>
        </div>
      ) : next ? (
        <div className="relative">
          <h2 className="text-balance text-[clamp(24px,3vw,34px)] font-normal leading-[1.1] tracking-[-0.025em]">{next.title}</h2>
          <p className="mt-3 text-sm text-pt-fg-2">
            {next.domainName} · {formatMinutes(next.durationMinutes)} · nâng {next.closes.length} năng lực
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to={`/personal/classroom/${next.id}`} className={PT_BUTTON}>
              Bắt đầu khóa <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link to={`/personal/courses/${next.id}`} className={PT_BUTTON_SECONDARY}>Xem khóa học</Link>
          </div>
        </div>
      ) : (
        <div className="relative">
          <h2 className="text-[clamp(24px,3vw,34px)] font-normal leading-[1.1] tracking-[-0.025em]">
            Bạn đã đi hết lộ trình. <span className="font-landing-serif italic text-pt-fg-2">Tuyệt vời.</span>
          </h2>
          <Link to="/personal/certificates" className={`${PT_BUTTON} mt-7`}>Xem chứng nhận</Link>
        </div>
      )}
    </Card>
  );
}

function TargetCard({ data }: { data: PersonalOverview }) {
  const target = data.target!;
  const required = data.domains.map((domain) => domain.required);
  const current = data.domains.map((domain) => domain.current);

  return (
    <Card className="flex flex-col gap-4 p-7 lg:col-span-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={PT_EYEBROW}>Vị trí mục tiêu</p>
          <h2 className="mt-2 text-[22px] font-normal tracking-[-0.02em]">{target.name}</h2>
        </div>
        <Link to="/personal/target" aria-label="Đổi vị trí mục tiêu" className="grid size-9 place-items-center rounded-full border border-pt-line text-pt-fg-2 transition-colors hover:border-pt-fg/40 hover:text-pt-fg">
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid grid-cols-[auto_1fr] items-center gap-4">
        <div>
          <span className="text-[56px] font-light leading-none tracking-[-0.05em] tabular-nums">{data.coveragePercent}</span>
          <span className="text-xl text-pt-fg-3">%</span>
          <p className="mt-1 max-w-[9rem] text-xs leading-snug text-pt-fg-3">yêu cầu năng lực đã đáp ứng · còn {data.gapCount} năng lực</p>
        </div>
        <DomainRadar required={required} current={current} compact className="max-w-[190px] justify-self-end" />
      </div>
      <RadarLegend />
      <p className="text-xs text-pt-fg-3">
        Trục: {data.domains.map((domain) => `${domain.number} ${DOMAIN_SHORT_NAMES[domain.number]}`).join(' · ')}
      </p>
    </Card>
  );
}
