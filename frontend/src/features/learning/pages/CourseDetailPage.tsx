import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, ChevronRight, Clock3, Layers3, Play, PlayCircle } from 'lucide-react';
import { useCourse, useCourseLesson } from '@/hooks/use-assignments';
import { useMyLearning } from '@/hooks/use-my-learning';
import { LevelBadge } from '@/components/shared/LevelBadge';
import type { CourseDetailDto } from '@/services/assignment.service';
import { LessonMedia, LessonText } from '../components/LessonPresentation';

type Module = CourseDetailDto['modules'][number];
type Lesson = Module['lessons'][number];

function byOrder<T extends { sortOrder?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER));
}

function moduleLabel(module: Module, index: number): string {
  return `Học phần ${index + 1}: ${module.title.trim().replace(/^Học phần\s+\d+\s*:\s*/i, '')}`;
}

function lessonLabel(lesson: Lesson, index: number): string {
  const title = lesson.title.trim().replace(/^Bài\s+\d+\s*:\s*/i, '').replace(/^Mûc tiêu/i, 'Mục tiêu');
  return `Bài ${index + 1}: ${title}`;
}

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const courseQuery = useCourse(id);
  const learningQuery = useMyLearning();
  const course = courseQuery.data;
  const modules = byOrder(course?.modules ?? []).map((module) => ({ ...module, lessons: byOrder(module.lessons ?? []) }));
  const entries = modules.flatMap((module, moduleIndex) => module.lessons.map((lesson, lessonIndex) => ({ module, moduleIndex, lesson, lessonIndex })));
  const selected = entries.find((entry) => entry.lesson.id === selectedLessonId) ?? entries[0];
  const lessonQuery = useCourseLesson(selected?.lesson.id);

  if (courseQuery.isLoading) return <div className="h-60 animate-pulse rounded-2xl bg-slate-100" />;
  if (courseQuery.isError || !course) return <div role="alert" className="rounded-xl border border-red-200 bg-white p-8 text-center"><p className="font-semibold text-red-600">Không thể tải thông tin khóa học.</p><p className="mt-1 text-sm text-slate-600">{courseQuery.error instanceof Error ? courseQuery.error.message : 'Vui lòng thử lại.'}</p><Link to="/enterprise/me/learning-path" className="mt-4 inline-block text-blue-600">Quay lại lộ trình</Link></div>;

  const enrollment = learningQuery.data?.items.find((item) => item.courseId === course.id);
  const progress = Math.min(100, Math.max(0, enrollment?.progressPercent ?? 0));
  const currentIndex = selected ? entries.findIndex((entry) => entry.lesson.id === selected.lesson.id) : -1;
  const previous = currentIndex > 0 ? entries[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 ? entries[currentIndex + 1] : undefined;
  const presentedLesson = selected ? { ...selected.lesson, ...lessonQuery.data } : undefined;

  return <div className="space-y-6 pb-12">
    <Link to="/enterprise/me/learning-path" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"><ArrowLeft className="size-4" />Lộ trình học tập của tôi</Link>
    <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-slate-50 via-white to-blue-50/70 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2"><span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-blue-700">{course.code}</span>{course.level > 0 && <LevelBadge level={course.level} />}{enrollment && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{enrollment.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đang học'}</span>}</div>
        <h1 className="mt-4 max-w-4xl text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{course.title}</h1>
        {(course.purpose || course.description) && <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{course.purpose || course.description}</p>}
        {enrollment ? <div className="mt-6 max-w-xl"><div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-slate-700">Tiến độ của bạn</span><span className="font-bold text-blue-700">Tiến độ: {Math.round(progress)}% · {enrollment.completedLessons}/{enrollment.totalLessons} bài</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-600 transition-[width]" style={{ width: `${progress}%` }} /></div></div>
          : learningQuery.isError ? <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Chưa tải được trạng thái ghi danh của bạn.</p>
            : <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Bạn có thể xem trước nội dung khóa học. Tiến độ chỉ được ghi nhận sau khi bạn được ghi danh.</p>}
      </div>
      <div className="grid grid-cols-2 gap-4 border-t border-slate-100 px-6 py-4 text-sm text-slate-700 sm:grid-cols-3 sm:px-8">
        <span className="flex items-center gap-2"><Clock3 className="size-4 text-blue-600" />{course.estimatedDurationMinutes == null ? 'Chưa cập nhật thời lượng' : `${course.estimatedDurationMinutes} phút`}</span>
        <span className="flex items-center gap-2"><Layers3 className="size-4 text-blue-600" />{modules.length} học phần</span>
        <span className="col-span-2 flex items-center gap-2 sm:col-span-1"><BookOpen className="size-4 text-blue-600" />{entries.length} bài học</span>
      </div>
    </header>
    {entries.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-600">Khóa học này chưa có bài học trên BE2.</div>
      : <div className="grid items-start gap-5 lg:grid-cols-12">
        <aside aria-label="Lộ trình bài học" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-4 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3"><h2 className="text-xs font-bold uppercase tracking-wide text-slate-700">Lộ trình bài học</h2><span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">{entries.length} bài</span></div>
          <div className="max-h-[720px] overflow-y-auto p-2">{modules.map((module, moduleIndex) => <div key={module.id} className="mb-3">
            <div className="mb-1 flex items-center justify-between gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"><span>{moduleLabel(module, moduleIndex)}</span><span className="shrink-0 font-normal text-slate-500">{module.lessons.length} bài</span></div>
            <div className="space-y-1">{module.lessons.map((lesson, lessonIndex) => {
              const active = lesson.id === selected?.lesson.id;
              return <button key={lesson.id} type="button" onClick={() => setSelectedLessonId(lesson.id)} aria-current={active ? 'step' : undefined} className={`flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${active ? 'bg-blue-50 font-semibold text-blue-900 ring-1 ring-blue-300' : 'text-slate-700 hover:bg-slate-50'}`}>
                <Play className="mt-0.5 size-3.5 shrink-0" /><span className="min-w-0 flex-1"><span className="block">{lessonLabel(lesson, lessonIndex)}</span><span className="mt-0.5 block text-xs font-normal text-slate-500">{lesson.estimatedMinutes == null ? 'Chưa cập nhật thời lượng' : `${lesson.estimatedMinutes} phút`}</span></span><ChevronRight className="mt-0.5 size-4 shrink-0 opacity-50" />
              </button>;
            })}</div>
          </div>)}</div>
        </aside>
        <div className="space-y-4 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"><span className="flex items-center gap-2 font-semibold text-blue-700"><PlayCircle className="size-4" />Không gian học tập</span><span className="text-slate-500">Bài {currentIndex + 1}/{entries.length}</span></div>
          <article className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">{moduleLabel(selected.module, selected.moduleIndex)}</p><h2 className="mt-2 text-xl font-bold leading-snug text-slate-950 sm:text-2xl">{lessonLabel(selected.lesson, selected.lessonIndex)}</h2><p className="mt-2 text-sm text-slate-500">{selected.lesson.estimatedMinutes == null ? 'Thời lượng chưa cập nhật' : `Thời lượng dự kiến: ${selected.lesson.estimatedMinutes} phút`}</p></div>
            {presentedLesson && <LessonMedia lesson={presentedLesson} />}
            {lessonQuery.isLoading ? <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Đang tải nội dung bài học…</p> : lessonQuery.isError ? <p role="alert" className="rounded-xl border border-red-200 p-5 text-sm text-red-700">Không tải được nội dung bài học. Vui lòng thử lại.</p> : presentedLesson && <LessonText lesson={presentedLesson} />}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
              <button type="button" onClick={() => previous && setSelectedLessonId(previous.lesson.id)} disabled={!previous} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"><ArrowLeft className="size-4" />Bài trước</button>
              <div className="flex flex-wrap items-center gap-2"><Link to={`/enterprise/me/courses/${course.id}/lessons/${selected.lesson.id}`} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><PlayCircle className="size-4" />Mở bài học</Link><button type="button" onClick={() => next && setSelectedLessonId(next.lesson.id)} disabled={!next} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-40">Bài tiếp<ArrowRight className="size-4" /></button></div>
            </div>
          </article>
        </div>
      </div>}
  </div>;
}
