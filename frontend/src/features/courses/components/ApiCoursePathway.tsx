import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock3, Eye, Layers3, Play, ShieldCheck, Video } from 'lucide-react';
import { useCourseLesson, useCourses } from '@/hooks/use-assignments';
import type { CourseDetailDto } from '@/services/assignment.service';
import { resolveCourseMedia } from './course-media';

interface ApiCoursePathwayProps {
  course: CourseDetailDto;
}

export function ApiCoursePathway({ course }: ApiCoursePathwayProps) {
  const codeMatch = course.code.match(/^([AM])(\d+)-[FIA]$/i);
  const { data: siblingCourses } = useCourses(
    { search: codeMatch ? `${codeMatch[1].toUpperCase()}${codeMatch[2]}-` : undefined, pageIndex: 1, pageSize: 100 },
    Boolean(codeMatch),
  );
  const modules = course.modules ?? [];
  const lessonEntries = modules.flatMap((module) => module.lessons.map((lesson) => ({ module, lesson })));
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const selectedEntry = lessonEntries.find(({ lesson }) => lesson.id === selectedLessonId) ?? lessonEntries[0];
  const { data: lessonContent, isLoading, isError } = useCourseLesson(selectedEntry?.lesson.id);
  const videoSource = lessonContent?.videoUrl ?? (lessonContent?.lessonType === 'VIDEO' ? lessonContent.contentBody : null);
  const media = resolveCourseMedia(videoSource);

  if (lessonEntries.length === 0) {
    return <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-600">Khóa học này chưa có bài học trong dữ liệu BE2.</div>;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded border border-primary-200 bg-primary-50 px-2 py-1 font-mono font-semibold text-primary-700">Mã chuẩn: {course.code}</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 font-medium text-emerald-700"><ShieldCheck className="size-3.5" /> Chương trình chuẩn</span>
        </div>
        <h2 className="mt-3 text-lg font-bold text-slate-900">Luồng triển khai đào tạo: {course.title}</h2>
        <p className="mt-1 text-sm text-slate-600">Xem trước bài học từ dữ liệu khóa học hiện có trên BE2.</p>
        {codeMatch && <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-xs">
          <span className="mr-1 font-semibold text-slate-600">Cấp độ chuẩn hóa:</span>
          {(['F', 'I', 'A'] as const).map((suffix, index) => {
            const code = `${codeMatch[1].toUpperCase()}${codeMatch[2]}-${suffix}`;
            const sibling = siblingCourses?.items.find((item) => item.code.toUpperCase() === code);
            const current = course.code.toUpperCase() === code;
            const label = ['Mức 1: Cơ bản', 'Mức 2: Trung cấp', 'Mức 3: Nâng cao'][index];
            const className = `rounded-lg border px-3 py-2 font-semibold ${current ? 'border-primary-300 bg-primary-50 text-primary-700' : sibling ? 'border-slate-300 text-slate-700 hover:bg-slate-50' : 'border-slate-200 text-slate-400'}`;
            return sibling && !current ? <Link key={code} to={`/enterprise/courses/${sibling.id}?tab=pathway`} className={className}>{label} ({code})</Link>
              : <span key={code} className={className}>{label} ({code})</span>;
          })}
        </div>}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5"><Layers3 className="size-4" /> {modules.length} chương học</span>
          <span className="inline-flex items-center gap-1.5"><Play className="size-4" /> {lessonEntries.length} bài học</span>
          {course.estimatedDurationMinutes != null && <span className="inline-flex items-center gap-1.5"><Clock3 className="size-4" /> {course.estimatedDurationMinutes} phút</span>}
        </div>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-12">
        <aside className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-4 lg:col-span-4" aria-label="Lộ trình bài học">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Lộ trình bài học</h3>
            <span className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">{lessonEntries.length} bài</span>
          </div>
          <div className="max-h-[720px] overflow-y-auto p-2">
            {modules.map((module, moduleIndex) => (
              <div key={module.id} className="mb-3">
                <div className="mb-1 flex items-center justify-between gap-2 rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                  <span>Học phần {moduleIndex + 1}: {module.title}</span>
                  <span className="shrink-0 font-normal text-slate-500">{module.lessons.length} bài</span>
                </div>
                <div className="space-y-1">
                  {module.lessons.map((lesson) => {
                    const selected = lesson.id === selectedEntry.lesson.id;
                    return (
                      <button key={lesson.id} type="button" onClick={() => setSelectedLessonId(lesson.id)}
                        aria-current={selected ? 'step' : undefined}
                        className={`flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${selected ? 'bg-primary-50 font-semibold text-primary-800 ring-1 ring-primary-300' : 'text-slate-700 hover:bg-slate-50'}`}>
                        <Play className="mt-0.5 size-3.5 shrink-0" />
                        <span className="min-w-0 flex-1"><span className="block">{lesson.title}</span><span className="mt-0.5 block text-xs font-normal text-slate-500">{lesson.estimatedMinutes == null ? lesson.lessonType : `${lesson.estimatedMinutes} phút · ${lesson.lessonType}`}</span></span>
                        <ChevronRight className="mt-0.5 size-4 shrink-0 opacity-50" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="space-y-4 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <span className="inline-flex items-center gap-2 font-semibold text-primary-700"><Eye className="size-4" /> Xem trước như học viên</span>
            <span className="text-slate-600">Đang xem: <strong>{selectedEntry.lesson.title}</strong></span>
          </div>
          <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span>Giao diện mô phỏng nội dung bài học nhân viên sẽ xem.</span>
              <span>{selectedEntry.lesson.estimatedMinutes == null ? 'Chưa cập nhật thời lượng' : `Thời lượng: ${selectedEntry.lesson.estimatedMinutes} phút`}</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{selectedEntry.module.title}</p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">{selectedEntry.lesson.title}</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs"><span className="inline-flex items-center gap-1.5 font-semibold text-slate-800"><Video className="size-4 text-primary-600" /> Video bài giảng</span><span className="text-slate-500">{media ? 'Video từ nội dung bài học' : 'Chưa có liên kết video'}</span></div>
              {media?.kind === 'embed' ? (
                <div className="aspect-video overflow-hidden rounded-xl border border-slate-300 bg-slate-950">
                  <iframe title={`Video bài học: ${selectedEntry.lesson.title}`} src={media.url} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full border-0" />
                </div>
              ) : media?.kind === 'file' ? (
                <video key={media.url} controls preload="metadata" className="aspect-video w-full rounded-xl bg-slate-950" src={media.url}>Trình duyệt không hỗ trợ phát video này.</video>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-xl border border-[#555c65] bg-gradient-to-br from-[#293443] via-[#56616a] to-[#202b3b] px-6 text-center text-[#f7f5eb]">
                  <div><span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#9bb5ee] text-[#182238] shadow-lg"><Play className="ml-1 size-7 fill-current" /></span><p className="mt-4 font-semibold">Khung xem trước video bài giảng</p><p className="mt-1 max-w-md text-sm text-[#e5e8ed]">BE2 chưa cung cấp URL video cho bài học này. Khi có liên kết video, trình phát sẽ hiển thị tại đây.</p></div>
                </div>
              )}
            </div>
            <div className="border-t border-slate-200 pt-5">
              <h4 className="text-sm font-semibold text-slate-900">Nội dung bài học</h4>
              {isLoading ? <p className="mt-2 text-sm text-slate-500">Đang tải nội dung…</p>
                : isError ? <p className="mt-2 text-sm text-rose-700">Không tải được nội dung bài học từ BE2.</p>
                : lessonContent?.contentBody && !media ? <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{lessonContent.contentBody}</p>
                : <p className="mt-2 text-sm text-slate-500">Bài học này chưa có nội dung văn bản.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
