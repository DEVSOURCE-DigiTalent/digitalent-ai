import { Link } from 'react-router-dom';
import { ArrowRight, Check, Lock, Play } from 'lucide-react';
import { usePersonalPath } from '@/hooks/use-personal-learning';
import { levelLabelVi } from '@/lib/competency-levels';
import { cn } from '@/lib/utils';
import type { PathCourse, PathCourseStatus, PersonalPath } from '@/services/personal-learning.service';
import {
  Card, EmptyState, ErrorBlock, LoadingBlock, PT_BUTTON, PT_BUTTON_SECONDARY, PT_EYEBROW, PageIntro, ProgressBar, Stat,
  Tag
} from '../components/ui';
import { errorMessage } from '../utils/error-message';
import { formatHours, formatMinutes } from '../utils/format';

const STATUS_LABEL: Record<PathCourseStatus, string> = {
  COMPLETED: 'Đã hoàn thành',
  IN_PROGRESS: 'Đang học',
  AVAILABLE: 'Sẵn sàng',
  LOCKED: 'Chờ khóa tiên quyết',
};

/** IND-08 "/personal/path": the courses between the learner and the target, in prerequisite order. */
export function LearnerPathPage() {
  const { data, isLoading, isError, error, refetch } = usePersonalPath();

  return (
    <div data-testid="learner-path-page" className="grid gap-10">
      <PageIntro
        label="Lộ trình học tập"
        title={data?.target ? 'Lộ trình đến' : 'Lộ trình học tập'}
        accent={data?.target ? data.target.name : 'của riêng bạn.'}
        lead="Mỗi miền đi từ mức bạn đang có lên mức vị trí yêu cầu, từng khóa một. Khóa ở chặng sau chỉ mở khi khóa tiên quyết của nó đã xong."
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
  return (
    <>
      <Card className="grid gap-6 p-6 md:grid-cols-[1.4fr_repeat(3,1fr)] md:items-end md:p-8">
        <div className="grid gap-3">
          <p className={PT_EYEBROW}>Tiến độ lộ trình</p>
          <p className="text-[44px] font-light leading-none tracking-[-0.04em] tabular-nums">
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
        <ol className="grid gap-12">
          {path.stages.map((stage) => (
            <li key={stage.level} className="grid gap-5 md:grid-cols-[200px_1fr] md:gap-8">
              <div className="md:sticky md:top-28 md:self-start">
                <p className="font-landing-serif text-[44px] italic leading-none text-pt-fg-3">{stage.level}</p>
                <h2 className="mt-3 text-[20px] font-normal tracking-[-0.015em]">{stage.title}</h2>
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
        <Card className="p-6 md:p-8">
          <p className={PT_EYEBROW}>Được miễn</p>
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

function StatusMark({ status }: { status: PathCourseStatus }) {
  const base = 'grid size-10 shrink-0 place-items-center rounded-full border';
  if (status === 'COMPLETED') return <span className={cn(base, 'border-pt-ok/40 bg-pt-ok/15 text-pt-ok')}><Check className="size-4" aria-hidden="true" /></span>;
  if (status === 'LOCKED') return <span className={cn(base, 'border-pt-line text-pt-fg-3')}><Lock className="size-4" aria-hidden="true" /></span>;
  if (status === 'IN_PROGRESS') return <span className={cn(base, 'border-pt-fg bg-pt-fg text-pt-bg')}><Play className="size-4" aria-hidden="true" /></span>;
  return <span className={cn(base, 'border-pt-fg/50 text-pt-fg')}><ArrowRight className="size-4" aria-hidden="true" /></span>;
}

function CourseRow({ course, isNext }: { course: PathCourse; isNext: boolean }) {
  const locked = course.status === 'LOCKED';
  return (
    <Card
      as="li"
      className={cn(
        'grid gap-4 p-5 transition-colors sm:grid-cols-[auto_1fr_auto] sm:items-center',
        isNext && 'border-pt-fg/60',
        locked && 'bg-pt-card/60',
      )}
    >
      <StatusMark status={course.status} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs tabular-nums text-pt-fg-3">{course.code}</span>
          <Tag tone={course.status === 'COMPLETED' ? 'ok' : 'neutral'}>{STATUS_LABEL[course.status]}</Tag>
          {isNext && <Tag tone="solid">Tiếp theo</Tag>}
        </div>
        <Link to={`/personal/courses/${course.id}`} className={cn('mt-1.5 block text-[17px] leading-snug tracking-[-0.01em] hover:underline hover:underline-offset-4', locked ? 'text-pt-fg-2' : 'text-pt-fg')}>
          {course.title}
        </Link>
        <p className="mt-1 text-xs text-pt-fg-3">
          {course.domainName} · {formatMinutes(course.durationMinutes)}
          {course.closes.length > 0 && <> · nâng {course.closes.join(', ')}</>}
        </p>
        {locked && course.prerequisiteTitle && <p className="mt-1 text-xs text-pt-fg-3">Cần xong: {course.prerequisiteTitle}</p>}
        {course.status === 'IN_PROGRESS' && (
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar value={course.progressPercent} label={`Tiến độ ${course.title}`} className="max-w-[240px]" />
            <span className="text-xs tabular-nums text-pt-fg-3">{course.completedLessons}/{course.lessonCount} bài</span>
          </div>
        )}
      </div>
      <div className="flex gap-2 sm:justify-end">
        {course.status === 'IN_PROGRESS' && <Link to={`/personal/classroom/${course.id}`} className={PT_BUTTON}>Học tiếp</Link>}
        {course.status === 'AVAILABLE' && <Link to={`/personal/classroom/${course.id}`} className={isNext ? PT_BUTTON : PT_BUTTON_SECONDARY}>Bắt đầu</Link>}
        {course.status === 'COMPLETED' && <Link to={`/personal/courses/${course.id}`} className={PT_BUTTON_SECONDARY}>Ôn lại</Link>}
        {locked && <Link to={`/personal/courses/${course.id}`} className={PT_BUTTON_SECONDARY}>Xem</Link>}
      </div>
    </Card>
  );
}
