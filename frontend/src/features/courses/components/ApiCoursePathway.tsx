import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock3, Eye, Layers3, Play, ShieldCheck, Lock, X } from 'lucide-react';
import { useCourseLesson, useCourses } from '@/hooks/use-assignments';
import type { CourseDetailDto } from '@/services/assignment.service';
import { LessonMedia, LessonText } from '@/features/learning/components/LessonPresentation';
import { levelPricing } from '@/features/organization/components/course-tree';

interface ApiCoursePathwayProps {
  course: CourseDetailDto;
}

type CourseModule = CourseDetailDto['modules'][number];
type CourseLesson = CourseModule['lessons'][number];

function bySortOrder<T extends { sortOrder?: number }>(items: T[]): T[] {
  // Preserve BE order when older responses omit sortOrder.
  return [...items].sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER));
}

function moduleHeading(module: CourseModule, index: number): string {
  const title = module.title.trim().replace(/^Học phần\s+\d+\s*:\s*/i, '');
  return `Học phần ${index + 1}: ${title}`;
}

function lessonHeading(lesson: CourseLesson, index: number): string {
  const title = lesson.title.trim().replace(/^Bài\s+\d+\s*:\s*/i, '').replace(/^Mûc tiêu/i, 'Mục tiêu');
  return `Bài ${index + 1}: ${title}`;
}

export function ApiCoursePathway({ course }: ApiCoursePathwayProps) {
  const codeMatch = course.code.match(/^([AM])(\d+)-[FIA]$/i);
  const { data: siblingCourses } = useCourses(
    { search: codeMatch ? `${codeMatch[1].toUpperCase()}${codeMatch[2]}-` : undefined, pageIndex: 1, pageSize: 100 },
    Boolean(codeMatch),
  );

  const isPaidCourse = course.code.toUpperCase().endsWith('-I') || course.code.toUpperCase().endsWith('-A');
  const courseLevelNum = course.code.toUpperCase().endsWith('-A') ? 3 : course.code.toUpperCase().endsWith('-I') ? 2 : 1;
  const pricing = levelPricing(courseLevelNum);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const modules = bySortOrder(course.modules ?? []).map((module) => ({ ...module, lessons: bySortOrder(module.lessons ?? []) }));
  const lessonEntries = modules.flatMap((module, moduleIndex) => module.lessons.map((lesson, lessonIndex) => ({ module, moduleIndex, lesson, lessonIndex })));
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const selectedEntry = lessonEntries.find(({ lesson }) => lesson.id === selectedLessonId) ?? lessonEntries[0];
  const { data: lessonContent, isLoading, isError } = useCourseLesson(isPaidCourse ? undefined : selectedEntry?.lesson.id);
  const presentedLesson = selectedEntry ? { ...selectedEntry.lesson, ...lessonContent } : undefined;

  if (lessonEntries.length === 0) {
    return <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-600">Khóa học này chưa có bài học trong dữ liệu BE2.</div>;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded border border-primary-200 bg-primary-50 px-2 py-1 font-mono font-semibold text-primary-700">Mã chuẩn: {course.code}</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 font-medium text-emerald-700"><ShieldCheck className="size-3.5" /> Chương trình chuẩn</span>
          <span className={`rounded px-2 py-1 font-bold ${pricing.isFree ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
            {pricing.badge}
          </span>
        </div>
        <h2 className="mt-3 text-lg font-bold text-slate-900">Luồng triển khai đào tạo: {course.title}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {isPaidCourse
            ? 'Khóa học thương mại: Bạn có thể xem cấu trúc các chương và danh mục bài học. Để mở khóa bài giảng đầy đủ, vui lòng trang bị suất học cho tổ chức.'
            : 'Xem trước nội dung bài học và học liệu mô phỏng từ dữ liệu chuẩn hóa.'}
        </p>
        {codeMatch && <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-xs">
          <span className="mr-1 font-semibold text-slate-600">Cấp độ chuẩn hóa:</span>
          {(['F', 'I', 'A'] as const).map((suffix, index) => {
            const code = `${codeMatch[1].toUpperCase()}${codeMatch[2]}-${suffix}`;
            const sibling = siblingCourses?.items.find((item) => item.code.toUpperCase() === code);
            const current = course.code.toUpperCase() === code;
            const label = ['Mức 1: Cơ bản (Free)', 'Mức 2: Trung cấp (399k)', 'Mức 3: Nâng cao (699k)'][index];
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
                  <span>{moduleHeading(module, moduleIndex)}</span>
                  <span className="shrink-0 font-normal text-slate-500">{module.lessons.length} bài</span>
                </div>
                <div className="space-y-1">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const selected = lesson.id === selectedEntry.lesson.id;
                    return (
                      <button key={lesson.id} type="button" onClick={() => setSelectedLessonId(lesson.id)}
                        aria-current={selected ? 'step' : undefined}
                        className={`flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${selected ? 'bg-primary-50 font-semibold text-primary-800 ring-1 ring-primary-300' : 'text-slate-700 hover:bg-slate-50'}`}>
                        {isPaidCourse ? (
                          <Lock className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                        ) : (
                          <Play className="mt-0.5 size-3.5 shrink-0" />
                        )}
                        <span className="min-w-0 flex-1"><span className="block">{lessonHeading(lesson, lessonIndex)}</span><span className="mt-0.5 block text-xs font-normal text-slate-500">{lesson.estimatedMinutes == null ? 'Chưa cập nhật thời lượng' : `${lesson.estimatedMinutes} phút`}</span></span>
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
            <span className="text-slate-600">Đang chọn: <strong>{lessonHeading(selectedEntry.lesson, selectedEntry.lessonIndex)}</strong></span>
          </div>

          {isPaidCourse ? (
            <section className="space-y-5 rounded-2xl border border-amber-200 bg-white p-6 shadow-sm text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-inner">
                <Lock className="size-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-200">
                  Khóa học bản quyền · {pricing.formatted}
                </span>
                <h3 className="text-xl font-bold text-slate-900">{lessonHeading(selectedEntry.lesson, selectedEntry.lessonIndex)}</h3>
                <p className="text-xs text-slate-500 uppercase font-semibold">{moduleHeading(selectedEntry.module, selectedEntry.moduleIndex)}</p>
                <p className="text-xs text-slate-600 leading-relaxed pt-2">
                  Nội dung bài học bao gồm video bài giảng số, kịch bản tình huống thực tiễn và bài tập thực hành. Tài khoản doanh nghiệp dùng thử được xem cấu trúc chương trình; cần mua suất học để mở toàn bộ bài giảng và cấp quyền học cho nhân viên.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(true)}
                  className="rounded-xl px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-all"
                >
                  Mua suất học ({pricing.formatted})
                </button>
                <Link
                  to="/enterprise/courses"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Khám phá khóa Cơ bản miễn phí
                </Link>
              </div>
            </section>
          ) : (
            <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <span>Giao diện mô phỏng nội dung bài học nhân viên sẽ xem.</span>
                <span>{selectedEntry.lesson.estimatedMinutes == null ? 'Chưa cập nhật thời lượng' : `Thời lượng: ${selectedEntry.lesson.estimatedMinutes} phút`}</span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{moduleHeading(selectedEntry.module, selectedEntry.moduleIndex)}</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">{lessonHeading(selectedEntry.lesson, selectedEntry.lessonIndex)}</h3>
              </div>
              {presentedLesson && <LessonMedia lesson={presentedLesson} />}
              {isLoading ? <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Đang tải nội dung bài học…</p>
                : isError ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">Không tải được nội dung bài học. Vui lòng thử lại.</p>
                  : presentedLesson && <LessonText lesson={presentedLesson} />}
            </section>
          )}
        </div>
      </div>

      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                  🔒 Bản quyền khóa học thương mại
                </span>
                <h2 className="mt-2 text-lg font-bold text-slate-900">{course.title}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{course.code}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPurchaseModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-4 py-4 text-xs text-slate-700">
              <p>
                Đơn giá chuẩn của khóa học: <b>{pricing.formatted}</b>.
              </p>
              <p>
                Doanh nghiệp dùng thử được miễn phí 100% tất cả các khóa Cơ bản. Khóa học này thuộc Bậc {courseLevelNum}, yêu cầu mua suất học theo từng nhân viên để học và làm bài thi cấp chứng chỉ.
              </p>
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 text-amber-900">
                Vui lòng liên hệ Hotline hoặc trao đổi với bộ phận tư vấn DigiTalent để hoàn tất thủ tục trang bị suất đào tạo cho nhân sự.
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPurchaseModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
