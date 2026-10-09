import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Lock, Play } from 'lucide-react';
import { useMarkSeen, usePersonalAccess, usePersonalPath } from '@/hooks/use-personal-learning';
import { levelLabelVi } from '@/lib/competency-levels';
import { cn } from '@/lib/utils';
import type { PathCourse, PathCourseStatus, PersonalAccess, PersonalPath } from '@/services/personal-learning.service';
import {
  Card, EmptyState, ErrorBlock, LoadingBlock, PT_BUTTON, PT_BUTTON_SECONDARY, PT_EYEBROW, PersonalPageHeader, ProgressBar, Stat,
  Tag
} from '../components/ui';
import { InlineTip } from '../components/InlineTip';
import { UpgradeLink } from '../components/UpgradeLink';
import { errorMessage } from '../utils/error-message';
import { formatHours, formatMinutes } from '../utils/format';

const STATUS_LABEL: Record<PathCourseStatus, string> = {
  COMPLETED: 'Đã hoàn thành',
  IN_PROGRESS: 'Đang học',
  AVAILABLE: 'Có thể bắt đầu',
  LOCKED: 'Chờ khóa tiên quyết',
};

/** IND-08 "/personal/path": the courses between the learner and the target, in prerequisite order. */
export function LearnerPathPage() {
  const { data, isLoading, isError, error, refetch } = usePersonalPath();

  return (
    <div data-testid="learner-path-page" className="grid gap-6">
      <PersonalPageHeader
        label="Lộ trình học tập"
        title="Lộ trình học"
        lead={data?.target ? `Mục tiêu: ${data.target.name}. Các khóa học được sắp theo điều kiện tiên quyết.` : 'Chọn mục tiêu nghề nghiệp để xây dựng lộ trình học.'}
        actions={data?.target && <Link to="/personal/target" className={PT_BUTTON_SECONDARY}>Đổi mục tiêu</Link>}
      />

      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message={errorMessage(error)} onRetry={() => refetch()} />}
      {data && !data.target && (
        <EmptyState
          title="Chưa có vị trí mục tiêu"
          body="Lộ trình được dựng từ khoảng cách giữa mức hiện tại của bạn và yêu cầu của một vị trí. Hãy chọn vị trí trước."
          action={<Link to="/personal/target" className={PT_BUTTON}>Chọn vị trí mục tiêu</Link>}
        />
      )}
      {data?.target && <PathBody path={data} />}
    </div>
  );
}

function PathBody({ path }: { path: PersonalPath }) {
  const { data: access } = usePersonalAccess();
  const { mutate: markSeen } = useMarkSeen();
  const seenPath = access?.seen.path;
  const markedPath = useRef(false);
  const limited = access !== undefined && access.mode !== 'full';
  // Looking at the path after the entry assessment is step 2 of the trial checklist.
  useEffect(() => {
    if (!limited || !path.assessed || seenPath || markedPath.current) return;
    markedPath.current = true;
    markSeen('path');
  }, [limited, path.assessed, seenPath, markSeen]);

  const next = path.nextCourse;
  return (
    <>
      {access && <PlanStrip access={access} />}
      {next && (
        <section aria-label="Khóa học tiếp theo" className="grid gap-3">
          <h2 className="text-lg font-semibold">{next.status === 'IN_PROGRESS' ? 'Khóa đang học' : 'Khóa học tiếp theo'}</h2>
          <ul><CourseRow course={next} isNext /></ul>
          <InlineTip tipKey="tip-first-course" when={path.assessed && next.status !== 'LOCKED'}>
            Khóa này đứng đầu vì bù khoảng thiếu lớn nhất và không cần khóa tiên quyết.
          </InlineTip>
        </section>
      )}
      <Card className="grid gap-6 p-6 md:grid-cols-[1.4fr_repeat(3,1fr)] md:items-end md:p-8">
        <div className="grid gap-3">
          <p className={PT_EYEBROW}>Tiến độ lộ trình</p>
          <p className="text-2xl font-semibold leading-none tracking-[-0.04em] tabular-nums">
            {path.progressPercent}<span className="text-xl text-pt-fg-3">%</span>
          </p>
          <ProgressBar value={path.progressPercent} label="Tiến độ lộ trình" />
        </div>
        <Stat label="Khóa học" value={`${path.completedCourses}/${path.totalCourses}`} hint="đã hoàn thành" />
        <Stat label="Còn lại" value={formatHours(path.minutesLeft)} hint="thời lượng ước tính" />
        <Stat label="Được miễn" value={path.exempt.length} hint="khóa nhờ đánh giá đầu vào" />
      </Card>


      {!path.assessed && (
        <Card className="flex flex-col gap-4 border-pt-warn/40 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-pt-fg-2">
            <span className="text-pt-fg">Lộ trình đang tính từ mức 0.</span> Làm bài đánh giá đầu vào để bỏ qua những khóa bạn đã nắm.
          </p>
          <Link to="/personal/diagnostic" className={PT_BUTTON}>Làm đánh giá</Link>
        </Card>
      )}

      {path.totalCourses === 0 ? (
        <EmptyState
          title="Bạn đã đáp ứng mọi yêu cầu của vị trí"
          body="Không còn khóa nào cần học cho mục tiêu này. Bạn có thể chọn một vị trí khác để tiếp tục phát triển."
          action={<Link to="/personal/target" className={PT_BUTTON}>Chọn mục tiêu mới</Link>}
        />
      ) : (
        <ol className="grid gap-6">
          {path.stages.map((stage) => (
            <li key={stage.level} className="grid gap-3">
              <div className="border-b border-pt-line pb-3">
                <h2 className="mt-3 text-[20px] font-normal tracking-[-0.015em]">{stage.title.replace(/^Chặng \d+ · /, '')}</h2>
                <p className="mt-1 text-xs text-pt-fg-3">
                  Mức {levelLabelVi(stage.level)} · {stage.courses.filter((c) => c.status === 'COMPLETED').length}/{stage.courses.length} khóa
                </p>
              </div>
              <ul className="grid gap-3">
                {stage.courses.map((course) => (
                  <CourseRow key={course.id} course={course} isNext={course.id === path.nextCourse?.id} />
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}

      {path.exempt.length > 0 && (
        <Card as="details" className="p-6">
          <summary className="cursor-pointer text-base font-semibold">Các khóa được miễn</summary>
          <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-pt-fg-2">
            Bài đánh giá đầu vào cho thấy bạn đã đạt các mức này, nên những khóa sau không có trong lộ trình. Bạn vẫn có thể mở để ôn lại.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {path.exempt.map((course) => (
              <li key={course.id}>
                <Link
                  to={`/personal/courses/${course.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-pt-line px-3.5 py-1.5 text-xs text-pt-fg-2 transition-colors hover:border-pt-fg/40 hover:text-pt-fg"
                >
                  <span className="tabular-nums text-pt-fg-3">{course.code}</span>
                  {course.title}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}

/** Trial: the three course slots as dots. Free: what the plan opens. Nothing for a paying plan. */
function PlanStrip({ access }: { access: PersonalAccess }) {
  if (access.mode === 'trial' && access.courseLimit !== null) {
    const used = access.trialCourseIds.length;
    return (
      <Card className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
        <p className="flex items-center gap-3 text-sm text-pt-fg-2">
          <span>Lượt học thử: đã dùng {used}/{access.courseLimit}</span>
          <span className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: access.courseLimit }, (_, slot) => (
              <i key={slot} className={cn('block size-2.5 rounded-full', slot < used ? 'bg-[#E5A93C]' : 'bg-pt-fg/15')} />
            ))}
          </span>
        </p>
        <p className="text-xs text-pt-fg-3">Một khóa tính lượt khi bạn hoàn thành bài đầu tiên.</p>
      </Card>
    );
  }
  if (access.mode === 'free') {
    return (
      <Card className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
        <p className="text-sm text-pt-fg-2">Gói Miễn phí: xem lộ trình và hồ sơ. Nâng cấp để học các khóa còn lại.</p>
        <UpgradeLink placement="path" variant="text">Nâng cấp</UpgradeLink>
      </Card>
    );
  }
  return null;
}

function StatusMark({ status }: { status: PathCourseStatus }) {
  const base = 'grid size-10 shrink-0 place-items-center rounded-full border';
  if (status === 'COMPLETED') return <span className={cn(base, 'border-pt-ok/40 bg-pt-ok/15 text-pt-ok')}><Check className="size-4" aria-hidden="true" /></span>;
  if (status === 'LOCKED') return <span className={cn(base, 'border-pt-line text-pt-fg-3')}><Lock className="size-4" aria-hidden="true" /></span>;
  if (status === 'IN_PROGRESS') return <span className={cn(base, 'border-pt-accent bg-pt-accent text-pt-on-accent')}><Play className="size-4" aria-hidden="true" /></span>;
  return <span className={cn(base, 'border-pt-accent/50 text-pt-accent')}><ArrowRight className="size-4" aria-hidden="true" /></span>;
}

function CourseRow({ course, isNext }: { course: PathCourse; isNext: boolean }) {
  const locked = course.status === 'LOCKED';
  return (
    <Card
      as="li"
      className={cn(
        'grid gap-4 p-5 transition-colors sm:grid-cols-[auto_1fr_auto] sm:items-center',
        isNext && 'border-pt-accent/50',
        locked && 'bg-pt-card/60',
      )}
    >
      <StatusMark status={course.status} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs tabular-nums text-pt-fg-3">{course.code}</span>
          {(course.status === 'COMPLETED' || course.status === 'LOCKED') && <Tag tone={course.status === 'COMPLETED' ? 'ok' : 'neutral'}>{STATUS_LABEL[course.status]}</Tag>}
          {isNext && course.status !== 'IN_PROGRESS' && <Tag tone="solid">Tiếp theo</Tag>}
          {course.trialSlot && <Tag tone="ok">Đang học thử</Tag>}
          {course.planLocked && <Tag><Lock className="size-3" aria-hidden="true" />Mở khi nâng cấp</Tag>}
        </div>
        <Link to={`/personal/courses/${course.id}`} className={cn('mt-1.5 block text-[17px] leading-snug tracking-[-0.01em] hover:underline hover:underline-offset-4', locked ? 'text-pt-fg-2' : 'text-pt-fg')}>
          {course.title}
        </Link>
        <p className="mt-1 text-xs text-pt-fg-3">
          {course.domainName} · {formatMinutes(course.durationMinutes)}
          {course.closes.length > 0 && <> · nâng {course.closes.join(', ')}</>}
        </p>
        {locked && course.prerequisiteTitle && <p className="mt-1 text-xs text-pt-fg-3">Cần hoàn thành khóa {course.prerequisiteTitle} trước</p>}
        {course.status === 'IN_PROGRESS' && (
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar value={course.progressPercent} label={`Tiến độ ${course.title}`} className="max-w-[240px]" />
            <span className="text-xs tabular-nums text-pt-fg-3">{course.completedLessons}/{course.lessonCount} bài</span>
          </div>
        )}
      </div>
      <div className="flex gap-2 sm:justify-end">
        {course.planLocked && course.status !== 'COMPLETED' && <Link to={`/personal/courses/${course.id}`} className={PT_BUTTON_SECONDARY}>Xem</Link>}
        {!course.planLocked && course.status === 'IN_PROGRESS' && <Link to={`/personal/classroom/${course.id}`} className={PT_BUTTON}>Học tiếp</Link>}
        {!course.planLocked && course.status === 'AVAILABLE' && <Link to={`/personal/classroom/${course.id}`} className={isNext ? PT_BUTTON : PT_BUTTON_SECONDARY}>Bắt đầu</Link>}
        {course.status === 'COMPLETED' && <Link to={`/personal/courses/${course.id}`} className={PT_BUTTON_SECONDARY}>Ôn lại</Link>}
        {locked && !course.planLocked && <Link to={`/personal/courses/${course.id}`} className={PT_BUTTON_SECONDARY}>Xem</Link>}
      </div>
    </Card>
  );
}
