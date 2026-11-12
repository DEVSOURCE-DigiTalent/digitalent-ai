import { translateUi, useUiLanguage } from '@/lib/i18n';
import type { CourseDetailDto } from '@/services/assignment.service';
import { useState } from 'react';
import { BookOpen, ChevronDown, PlayCircle } from 'lucide-react';
import { CourseLessonPreview } from './CourseLessonPreview';

interface CourseModulesProps {
  modules: CourseDetailDto['modules'];
  courseCode?: string;
}

export function CourseModules({ modules, courseCode }: CourseModulesProps) {
  useUiLanguage();
  const [selected, setSelected] = useState<{ id: string; module: number; index: number; count: number } | null>(null);
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [lessonPage, setLessonPage] = useState(0);
  const pageSize = 6;
  return (
    <section
      id="course-modules"
      className="course-detail-modules rounded-[22px] border p-6"
      style={{
        borderColor: 'var(--po-line)',
        background: 'var(--po-surface)',
        boxShadow: '0 10px 35px rgba(29,48,102,.025)',
      }}
    >
      {selected && courseCode && <CourseLessonPreview lessonId={selected.id} courseCode={courseCode} moduleIndex={selected.module + 1} index={selected.index} count={selected.count} onClose={() => setSelected(null)} onNavigate={(nextIndex) => {
        const nextLesson = modules[selected.module]?.lessons[nextIndex];
        if (!nextLesson) return;
        setSelected({ ...selected, id: nextLesson.id, index: nextIndex });
        setLessonPage(Math.floor(nextIndex / pageSize));
      }} />}
      <span
        className="text-[10px] font-black uppercase tracking-[0.12em]"
        style={{ color: 'var(--po-accent)' }}
      >{translateUi("Cấu trúc khóa học")}</span>
      <h2
        className="mt-2 text-xl font-semibold"
        style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}
      >{translateUi("Nội dung khóa học")}</h2>

      {modules.length === 0 ? (
        <p className="mt-4 text-sm" style={{ color: 'var(--po-muted)' }}>{translateUi("Chưa có cấu trúc bài giảng cho khóa học này.")}</p>
      ) : (
        <div className="course-module-list mt-4">
          {modules.map((mod, mi) => (
            <div key={mod.id} className="course-module">
              <button type="button" aria-expanded={openModule === mi} onClick={() => { setOpenModule(openModule === mi ? null : mi); setLessonPage(0); }} className="course-module-heading flex w-full items-center gap-3 py-3 text-left">
                <span
                  className="course-module-number grid place-items-center shrink-0 rounded-[12px] text-[11px] font-black"
                  style={{
                    width: 38,
                    height: 38,
                    background: '#e8edff',
                    color: 'var(--po-accent)',
                  }}
                >
                  {String(mi + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 min-w-0">
                  <strong
                    className="block text-[13px]"
                    style={{ color: 'var(--po-ink)' }}
                  >
                    {translateUi(mod.title)}
                  </strong>
                  {mod.description && (
                    <small
                      className="block mt-0.5 text-[10px]"
                      style={{ color: 'var(--po-muted)' }}
                    >
                      {translateUi(mod.description)}
                    </small>
                  )}
                </span>
                <span
                  className="course-module-count text-[10px] font-bold"
                  style={{ color: 'var(--po-muted)' }}
                >
                  <BookOpen size={15} /> {mod.lessons.length}{translateUi(" bài")}</span>
                <ChevronDown className="course-module-chevron" size={18} />
              </button>

              {openModule === mi && mod.lessons.slice(lessonPage * pageSize, (lessonPage + 1) * pageSize).map((lesson, offset) => {
                const li = lessonPage * pageSize + offset;
                return (
                <button type="button" onClick={() => setSelected({ id: lesson.id, module: mi, index: li, count: mod.lessons.length })}
                  key={lesson.id}
                  className="course-lesson-row flex w-full items-center gap-3 py-3 pl-4 text-left"
                  style={{ border: 0, borderBottom: '1px solid var(--po-line)', background: 'transparent', cursor: 'pointer' }}
                >
                  <span
                    className="grid place-items-center shrink-0 rounded-[12px] text-[10px] font-black"
                    style={{
                      width: 32,
                      height: 32,
                      background: 'var(--po-canvas)',
                      color: 'var(--po-muted)',
                    }}
                  >
                    {mi + 1}.{li + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <strong
                      className="block text-xs"
                      style={{ color: 'var(--po-ink)' }}
                    >
                      {translateUi(lesson.title)}
                    </strong>
                    <small
                      className="block mt-0.5 text-[10px]"
                      style={{ color: 'var(--po-muted)' }}
                    >
                      {lesson.lessonType === 'VIDEO'
                        ? 'Video'
                        : lesson.lessonType === 'QUIZ'
                          ? 'Bài kiểm tra'
                          : 'Bài giảng'}
                      {lesson.estimatedMinutes ? translateUi(` · ${lesson.estimatedMinutes} phút`) : ''}
                    </small>
                  </div>
                  <span className="course-lesson-action"><PlayCircle size={16} />{translateUi(" Xem bài")}</span>
                </button>
              ); })}
              {openModule === mi && mod.lessons.length > pageSize && <div className="course-lesson-pagination"><span>{lessonPage * pageSize + 1}–{Math.min((lessonPage + 1) * pageSize, mod.lessons.length)} / {mod.lessons.length}{translateUi(" bài")}</span><div><button type="button" disabled={lessonPage === 0} onClick={() => setLessonPage((value) => value - 1)}>{translateUi("Trước")}</button><button type="button" disabled={(lessonPage + 1) * pageSize >= mod.lessons.length} onClick={() => setLessonPage((value) => value + 1)}>{translateUi("Sau")}</button></div></div>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
