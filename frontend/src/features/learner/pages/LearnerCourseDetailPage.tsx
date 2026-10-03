import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Lock } from 'lucide-react';
import { usePersonalCourse } from '@/hooks/use-personal-learning';
import { levelLabelVi } from '@/lib/competency-levels';
import { cn } from '@/lib/utils';
import type { PersonalCourseDetail } from '@/services/personal-learning.service';
import {
  Card, ErrorBlock, LevelPips, LoadingBlock, PT_BUTTON, PT_BUTTON_SECONDARY, PT_EYEBROW, ProgressBar, SectionTitle, Tag
} from '../components/ui';
import { errorMessage } from '../utils/error-message';
import { formatMinutes } from '../utils/format';
import { LESSON_KIND } from '../utils/lesson-kind';

/** IND-09 "/personal/courses/:id": what a course teaches, what it raises, and where the learner is in it. */
export function LearnerCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch } = usePersonalCourse(id);

  return (
    <div data-testid="learner-course-detail" className="grid gap-8">
      <Link to="/personal/path" className="inline-flex w-fit items-center gap-1.5 text-sm text-pt-fg-2 transition-colors hover:text-pt-fg">
        <ArrowLeft className="size-4" aria-hidden="true" /> Lộ trình
      </Link>
      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message={errorMessage(error)} onRetry={() => refetch()} />}
      {data && <CourseBody course={data} />}
    </div>
  );
}

function primaryAction(course: PersonalCourseDetail) {
  if (course.status === 'LOCKED') return null;
  if (course.status === 'COMPLETED') return { label: 'Ôn lại khóa học', to: `/personal/classroom/${course.id}` };
  if (course.status === 'IN_PROGRESS') return { label: 'Học tiếp', to: `/personal/classroom/${course.id}` };
  return { label: 'Bắt đầu học', to: `/personal/classroom/${course.id}` };
}

function CourseBody({ course }: { course: PersonalCourseDetail }) {
  const action = primaryAction(course);

  return (
    <>
      <header className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={PT_EYEBROW}>Mã: {course.code}</span>
            <Tag>{levelLabelVi(course.level)}</Tag>
            <Tag>Miền {course.domainNumber} · {course.domainName}</Tag>
            {course.inPath && <Tag tone="info">Trong lộ trình</Tag>}
            {course.exempt && <Tag tone="ok">Được miễn</Tag>}
            {course.status === 'COMPLETED' && <Tag tone="ok"><Check className="size-3" aria-hidden="true" />Đã hoàn thành</Tag>}
          </div>
          <h1 className="mt-5 text-balance text-[clamp(30px,4.6vw,52px)] font-normal leading-[1.04] tracking-[-0.03em]">{course.title}</h1>
          <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.7] text-pt-fg-2">{course.description}</p>
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          {action ? (
            <Link to={action.to} className={PT_BUTTON}>
              {action.label} <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-pt-line px-4 py-2.5 text-sm text-pt-fg-2">
              <Lock className="size-4" aria-hidden="true" /> Chưa mở
            </span>
          )}
          {course.status !== 'AVAILABLE' && course.status !== 'LOCKED' && (
            <div className="flex w-56 items-center gap-3">
              <ProgressBar value={course.progressPercent} label={`Tiến độ ${course.title}`} />
              <span className="text-xs tabular-nums text-pt-fg-3">{course.progressPercent}%</span>
            </div>
          )}
        </div>
      </header>

      {course.status === 'LOCKED' && course.prerequisite && (
        <Card className="flex flex-col gap-3 border-pt-warn/40 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-pt-fg-2">
            Khóa này cần mức {levelLabelVi(course.entryLevel)} của miền. Hoàn thành <span className="text-pt-fg">{course.prerequisite.title}</span> trước.
          </p>
          <Link to={`/personal/courses/${course.prerequisite.id}`} className={PT_BUTTON_SECONDARY}>Mở khóa tiên quyết</Link>
        </Card>
      )}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid content-start gap-3">
          <Card className="p-6 md:p-8">
            <SectionTitle title="Chuẩn đầu ra khóa học" />
            <ul className="mt-5 grid gap-3">
              {course.outcomes.map((outcome) => (
                <li key={outcome} className="flex gap-3 text-sm leading-relaxed text-pt-fg-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-pt-fg-3" aria-hidden="true" />
                  {outcome}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 md:p-8">
            <SectionTitle title="Nội dung chương trình đào tạo" aside={`${course.modules.length} học phần · ${course.lessonCount} bài`} />
            <ol className="mt-5 grid gap-2">
              {course.modules.map((module, index) => {
                const done = module.lessons.filter((lesson) => lesson.completed).length;
                return (
                  <li key={module.id}>
                    <details className="group rounded-2xl border border-pt-line" open={index === 0}>
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 [&::-webkit-details-marker]:hidden">
                        <span className="min-w-0">
                          <span className="block text-[15px] text-pt-fg">{module.title}</span>
                          <span className="text-xs text-pt-fg-3">{done}/{module.lessons.length} bài đã học</span>
                        </span>
                        <span className="text-xs text-pt-fg-3 transition-transform group-open:rotate-180" aria-hidden="true">▾</span>
                      </summary>
                      <ul className="border-t border-pt-line px-4 py-2">
                        {module.lessons.map((lesson) => {
                          const kind = LESSON_KIND[lesson.kind];
                          return (
                            <li key={lesson.id} className="flex items-center gap-3 py-2.5 text-sm">
                              {lesson.completed
                                ? <Check className="size-4 shrink-0 text-pt-ok" aria-label="Đã học" />
                                : <kind.icon className="size-4 shrink-0 text-pt-fg-3" aria-hidden="true" />}
                              <span className={cn('flex-1', lesson.completed ? 'text-pt-fg-2' : 'text-pt-fg')}>{lesson.title}</span>
                              <span className="text-xs text-pt-fg-3">{kind.label} · {lesson.durationMinutes} phút</span>
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>

        <aside className="grid content-start gap-3">
          <Card className="p-6">
            <dl className="grid grid-cols-2 gap-5">
              <div><dt className="text-xs text-pt-fg-3">Thời lượng</dt><dd className="mt-1 text-sm">{formatMinutes(course.durationMinutes)}</dd></div>
              <div><dt className="text-xs text-pt-fg-3">Số bài</dt><dd className="mt-1 text-sm">{course.lessonCount} bài</dd></div>
              <div><dt className="text-xs text-pt-fg-3">Mức đầu vào</dt><dd className="mt-1 text-sm">{course.entryLevel === 0 ? 'Không yêu cầu' : levelLabelVi(course.entryLevel)}</dd></div>
              <div>
                <dt className="text-xs text-pt-fg-3">Bài đánh giá</dt>
                <dd className="mt-1 text-sm">{course.assessment.questionCount} câu · đạt {course.assessment.passPercent}%</dd>
              </div>
            </dl>
            {course.assessment.attempts > 0 && (
              <p className="mt-5 border-t border-pt-line pt-4 text-xs text-pt-fg-3">
                {course.assessment.attempts} lần làm · cao nhất {course.assessment.bestScore}%
              </p>
            )}
          </Card>

          <Card className="p-6">
            <p className={PT_EYEBROW}>Năng lực được nâng</p>
            <ul className="mt-4 grid gap-3">
              {course.competencies.map((competency) => (
                <li key={competency.code} className="grid gap-1.5">
                  <span className="text-sm leading-snug text-pt-fg"><span className="mr-2 text-xs text-pt-fg-3">{competency.code}</span>{competency.name}</span>
                  <span className="flex items-center gap-3 text-xs text-pt-fg-3">
                    <LevelPips level={competency.currentLevel} required={Math.max(competency.requiredLevel, course.level)} />
                    {competency.requiredLevel > 0 ? `Vị trí cần ${levelLabelVi(competency.requiredLevel)}` : 'Vị trí không yêu cầu'}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {course.task && (
            <Card className="p-6">
              <p className={PT_EYEBROW}>Bài thực hành</p>
              <p className="mt-3 text-[15px] leading-snug text-pt-fg">{course.task.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-pt-fg-3">{course.task.brief}</p>
              <Link to="/personal/tasks" className="mt-4 inline-flex text-sm text-pt-fg underline decoration-pt-fg/30 underline-offset-4 hover:decoration-pt-fg">
                Mở bài thực hành
              </Link>
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}
