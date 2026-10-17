import type { CourseDetailDto } from '@/services/assignment.service';
import { useState } from 'react';
import { CourseLessonPreview } from './CourseLessonPreview';

interface CourseModulesProps {
  modules: CourseDetailDto['modules'];
  courseCode?: string;
}

export function CourseModules({ modules, courseCode }: CourseModulesProps) {
  const [selected, setSelected] = useState<{ id: string; module: number; index: number; count: number } | null>(null);
  return (
    <section
      className="rounded-[22px] border p-6"
      style={{
        borderColor: 'var(--po-line)',
        background: 'var(--po-surface)',
        boxShadow: '0 10px 35px rgba(29,48,102,.025)',
      }}
    >
      {selected && courseCode && <CourseLessonPreview lessonId={selected.id} courseCode={courseCode} moduleIndex={selected.module} index={selected.index} count={selected.count} onClose={() => setSelected(null)} />}
      <span
        className="text-[10px] font-black uppercase tracking-[0.12em]"
        style={{ color: 'var(--po-accent)' }}
      >
        Cấu trúc khóa học
      </span>
      <h2
        className="mt-2 text-xl font-semibold"
        style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}
      >
        {modules.length} chương học. Kết quả thực tế.
      </h2>

      {modules.length === 0 ? (
        <p className="mt-4 text-sm" style={{ color: 'var(--po-muted)' }}>
          Chưa có cấu trúc bài giảng cho khóa học này.
        </p>
      ) : (
        <div className="mt-4">
          {modules.map((mod, mi) => (
            <div key={mod.id}>
              <div
                className="flex items-center gap-3 py-3"
                style={{ borderBottom: '1px solid var(--po-line)' }}
              >
                <span
                  className="grid place-items-center shrink-0 rounded-[12px] text-[11px] font-black"
                  style={{
                    width: 38,
                    height: 38,
                    background: '#e8edff',
                    color: 'var(--po-accent)',
                  }}
                >
                  {String(mi + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <strong
                    className="block text-[13px]"
                    style={{ color: 'var(--po-ink)' }}
                  >
                    {mod.title}
                  </strong>
                  {mod.description && (
                    <small
                      className="block mt-0.5 text-[10px]"
                      style={{ color: 'var(--po-muted)' }}
                    >
                      {mod.description}
                    </small>
                  )}
                </div>
                <span
                  className="text-[10px] font-bold"
                  style={{ color: 'var(--po-muted)' }}
                >
                  {mod.lessons.length} bài{mod.quizQuestionCount ? ` · Ngân hàng ${mod.quizQuestionCount} câu` : ''}
                </span>
              </div>

              {mod.lessons.map((lesson, li) => (
                <button type="button" onClick={() => setSelected({ id: lesson.id, module: mi, index: li, count: mod.lessons.length })}
                  key={lesson.id}
                  className="flex w-full items-center gap-3 py-3 pl-4 text-left"
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
                      {lesson.title}
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
                      {lesson.estimatedMinutes ? ` · ${lesson.estimatedMinutes} phút` : ''}
                    </small>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--po-accent)' }}>Xem bài →</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
