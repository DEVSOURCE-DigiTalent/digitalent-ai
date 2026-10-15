import type { CourseDetailDto } from '@/services/assignment.service';

interface CourseModulesProps {
  modules: CourseDetailDto['modules'];
}

export function CourseModules({ modules }: CourseModulesProps) {
  return (
    <section
      className="rounded-[22px] border p-6"
      style={{
        borderColor: 'var(--po-line)',
        background: 'var(--po-surface)',
        boxShadow: '0 10px 35px rgba(29,48,102,.025)',
      }}
    >
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
                  {mod.lessons.length} bài
                </span>
              </div>

              {mod.lessons.map((lesson, li) => (
                <div
                  key={lesson.id}
                  className="flex items-center gap-3 py-3 pl-4"
                  style={{ borderBottom: '1px solid var(--po-line)' }}
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
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
