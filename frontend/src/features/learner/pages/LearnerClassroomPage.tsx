import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Lightbulb } from 'lucide-react';
import { useDemoFastTrackCourse, usePersonalCourse, useSaveCourseNotes, useSetLessonCompleted } from '@/hooks/use-personal-learning';
import { levelLabelVi } from '@/lib/competency-levels';
import { cn } from '@/lib/utils';
import type { PersonalCourseDetail, PersonalLesson } from '@/services/personal-learning.service';
import { CourseAssessment } from '../components/CourseAssessment';
import {
  Card, EmptyState, ErrorBlock, LoadingBlock, PT_BUTTON, PT_BUTTON_SECONDARY, PT_EYEBROW, PT_INPUT, ProgressBar
} from '../components/ui';
import { errorMessage } from '../utils/error-message';
import { LESSON_KIND } from '../utils/lesson-kind';

const STUDY_CLIP = '/videos/individual-study.mp4';

/** IND-10 "/personal/classroom/:id": one lesson at a time, notes, and the end-of-course assessment. */
export function LearnerClassroomPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch } = usePersonalCourse(id);

  return (
    <div data-testid="learner-classroom-page" className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={id ? `/personal/courses/${id}` : '/personal/path'} className="inline-flex items-center gap-1.5 text-sm text-pt-fg-2 transition-colors hover:text-pt-fg">
          <ArrowLeft className="size-4" aria-hidden="true" /> Thông tin khóa học
        </Link>
        <p className={PT_EYEBROW}>Lớp học số: {data?.code ?? id}</p>
      </div>
      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message={errorMessage(error)} onRetry={() => refetch()} />}
      {data && data.status === 'LOCKED' && (
        <EmptyState
          title="Khóa học chưa mở"
          body={`Khóa này cần mức ${levelLabelVi(data.entryLevel)} của miền ${data.domainName}. Hoàn thành khóa tiên quyết trước.`}
          action={data.prerequisite && <Link to={`/personal/classroom/${data.prerequisite.id}`} className={PT_BUTTON}>Học {data.prerequisite.title}</Link>}
        />
      )}
      {data && data.status !== 'LOCKED' && <Classroom course={data} />}
    </div>
  );
}

function Classroom({ course }: { course: PersonalCourseDetail }) {
  const [params, setParams] = useSearchParams();
  const lessons = useMemo(() => course.modules.flatMap((module) => module.lessons), [course.modules]);
  const firstOpen = lessons.find((lesson) => !lesson.completed) ?? lessons[0];
  const requested = lessons.find((lesson) => lesson.id === params.get('lesson'));
  const lesson = requested ?? firstOpen;
  const index = lessons.indexOf(lesson);
  const module = course.modules.find((item) => item.lessons.some((entry) => entry.id === lesson.id))!;
  const [tab, setTab] = useState<'content' | 'notes'>('content');
  const setCompleted = useSetLessonCompleted();
  const fastTrack = useDemoFastTrackCourse();

  const open = (target: PersonalLesson) => {
    setParams({ lesson: target.id }, { replace: true });
    setTab('content');
  };

  const toggle = () =>
    setCompleted.mutate(
      { courseId: course.id, lessonId: lesson.id, completed: !lesson.completed },
      {
        onSuccess: (updated) => {
          const next = updated.modules.flatMap((m) => m.lessons)[index + 1];
          if (!lesson.completed && next) open(next);
        },
      },
    );

  const Kind = LESSON_KIND[lesson.kind];

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside aria-label="Danh sách bài học" className="order-2 lg:order-1 lg:sticky lg:top-28 lg:self-start">
        <Card className="p-5">
          <p className="text-[15px] leading-snug text-pt-fg">{course.title}</p>
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar value={course.progressPercent} label="Tiến độ khóa học" />
            <span className="text-xs tabular-nums text-pt-fg-3">{course.completedLessons}/{course.lessonCount}</span>
          </div>
          {course.completedLessons < course.lessonCount && (
            <button
              type="button"
              disabled={fastTrack.isPending}
              onClick={() => fastTrack.mutate(course.id)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-pt-line bg-pt-raised px-3 py-1.5 text-xs text-pt-fg transition-colors hover:bg-pt-fg/10"
              title="Đánh dấu hoàn thành toàn bộ bài học của khóa này để mở bài đánh giá"
            >
              ⚡ {fastTrack.isPending ? 'Đang hoàn tất…' : 'Hoàn thành bài học (Demo)'}
            </button>
          )}
          <h2 className="mt-5 text-xs uppercase tracking-[0.14em] text-pt-fg-3">Danh sách bài học</h2>

          <ol className="mt-3 grid max-h-[60vh] gap-4 overflow-y-auto pr-1">
            {course.modules.map((item) => (
              <li key={item.id}>
                <p className="mb-1.5 text-xs text-pt-fg-3">{item.title}</p>
                <ul className="grid gap-0.5">
                  {item.lessons.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => open(entry)}
                        aria-current={entry.id === lesson.id ? 'true' : undefined}
                        className={cn(
                          'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] transition-colors',
                          entry.id === lesson.id ? 'bg-pt-fg/10 text-pt-fg' : 'text-pt-fg-2 hover:bg-pt-fg/5 hover:text-pt-fg',
                        )}
                      >
                        <span className={cn('grid size-5 shrink-0 place-items-center rounded-full border', entry.completed ? 'border-pt-ok/50 bg-pt-ok/15 text-pt-ok' : 'border-pt-line')}>
                          {entry.completed && <Check className="size-3" aria-label="Đã học" />}
                        </span>
                        <span className="flex-1 leading-snug">{entry.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Card>
      </aside>

      <div className="order-1 grid content-start gap-4 lg:order-2">
        <Card className="overflow-hidden">
          <LessonMedia lesson={lesson} moduleTitle={module.title} />
          <div className="flex flex-wrap items-center gap-1 border-b border-pt-line px-4" role="tablist" aria-label="Bài học">
            {(['content', 'notes'] as const).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={cn('relative px-3 py-3.5 text-sm transition-colors', tab === key ? 'text-pt-fg' : 'text-pt-fg-3 hover:text-pt-fg')}
              >
                {key === 'content' ? 'Nội dung bài học' : 'Ghi chú của tôi'}
                {tab === key && <span className="absolute inset-x-3 bottom-0 h-px bg-pt-fg" aria-hidden="true" />}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8" role="tabpanel">
            {tab === 'content' ? <LessonContent lesson={lesson} /> : <Notes course={course} />}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-pt-line px-6 py-5 md:px-8">
            <button type="button" onClick={() => open(lessons[index - 1])} disabled={index === 0} className={PT_BUTTON_SECONDARY}>
              <ArrowLeft className="size-4" aria-hidden="true" /> Bài trước
            </button>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={toggle} disabled={setCompleted.isPending} aria-pressed={lesson.completed} className={lesson.completed ? PT_BUTTON_SECONDARY : PT_BUTTON}>
                {lesson.completed ? 'Bỏ đánh dấu hoàn thành' : 'Đánh dấu hoàn thành'}
                {!lesson.completed && <Check className="size-4" aria-hidden="true" />}
              </button>
              {index < lessons.length - 1 && (
                <button type="button" onClick={() => open(lessons[index + 1])} className={PT_BUTTON_SECONDARY}>
                  Bài sau <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          {setCompleted.isError && <p role="alert" className="px-8 pb-5 text-sm text-pt-bad">{errorMessage(setCompleted.error)}</p>}
        </Card>

        <p className="flex items-center gap-2 px-1 text-xs text-pt-fg-3">
          <Kind.icon className="size-3.5" aria-hidden="true" /> {Kind.label} · {lesson.durationMinutes} phút · bài {index + 1}/{lessons.length}
        </p>

        <CourseAssessment course={course} />
      </div>
    </div>
  );
}

function LessonMedia({ lesson, moduleTitle }: { lesson: PersonalLesson; moduleTitle: string }) {
  if (lesson.kind === 'VIDEO') {
    return (
      <figure className="relative bg-black">
        <video key={lesson.id} src={STUDY_CLIP} controls preload="metadata" playsInline className="aspect-video w-full object-cover" aria-label={`Video bài học: ${lesson.title}`} />
        <figcaption className="pointer-events-none absolute left-5 top-4 text-xs uppercase tracking-[0.14em] text-white/70">{moduleTitle}</figcaption>
      </figure>
    );
  }
  return (
    <div className="relative overflow-hidden border-b border-pt-line bg-pt-raised px-6 py-10 md:px-8 md:py-14">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-pt-fg/8 blur-3xl" />
      <p className={PT_EYEBROW}>{moduleTitle}</p>
      <h1 className="relative mt-4 max-w-[30ch] text-balance text-[clamp(24px,3vw,34px)] font-normal leading-[1.12] tracking-[-0.025em]">{lesson.title}</h1>
    </div>
  );
}

function LessonContent({ lesson }: { lesson: PersonalLesson }) {
  return (
    <article className="grid gap-6">
      {lesson.kind === 'VIDEO' && <h1 className="text-[clamp(22px,2.6vw,30px)] font-normal leading-tight tracking-[-0.02em]">{lesson.title}</h1>}
      <p className="text-[17px] leading-relaxed text-pt-fg">{lesson.summary}</p>
      <div className="grid gap-4 text-[15px] leading-[1.75] text-pt-fg-2">
        {lesson.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      <div className="rounded-2xl border border-pt-line p-5">
        <p className={PT_EYEBROW}>Ghi nhớ</p>
        <ul className="mt-3 grid gap-2">
          {lesson.takeaways.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm text-pt-fg-2"><Check className="mt-0.5 size-4 shrink-0 text-pt-fg-3" aria-hidden="true" />{item}</li>
          ))}
        </ul>
      </div>
      {lesson.practice && (
        <div className="flex gap-3 rounded-2xl bg-pt-fg/6 p-5 text-sm leading-relaxed text-pt-fg">
          <Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p><span className="font-medium">Thực hành: </span>{lesson.practice}</p>
        </div>
      )}
    </article>
  );
}

function Notes({ course }: { course: PersonalCourseDetail }) {
  const [notes, setNotes] = useState(course.notes);
  const save = useSaveCourseNotes();
  useEffect(() => setNotes(course.notes), [course.notes]);

  return (
    <div className="grid gap-3">
      <label htmlFor="lesson-notes" className="text-sm text-pt-fg-2">Ghi chép bài học</label>
      <textarea
        id="lesson-notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={8}
        maxLength={2000}
        placeholder="Điều bạn muốn nhớ, cách áp dụng vào công việc của mình…"
        className={PT_INPUT}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-pt-fg-3" role="status">
          {save.isSuccess ? 'Đã lưu ghi chú.' : save.isError ? errorMessage(save.error) : `${notes.length}/2000 ký tự · ghi chú dùng chung cho cả khóa`}
        </span>
        <button type="button" onClick={() => save.mutate({ courseId: course.id, notes })} disabled={save.isPending} className={PT_BUTTON}>
          {save.isPending ? 'Đang lưu…' : 'Lưu ghi chú'}
        </button>
      </div>
    </div>
  );
}
