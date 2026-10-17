import { useEffect, useRef } from 'react';
import type { CatalogCourseDetail } from '@/services/platform-catalog.service';
import { QUESTIONS_MIN } from '../components/pulse-format';
import { BlockPreview } from './BlockCard';
import { CatalogLessonContent } from './CatalogLessonContent';
import { catalogPages } from './catalog-pages';

/** "Xem như nhân viên": one module rendered the way the learner reads it (slides scroll, videos play). */
export function LearnerPreview({ course, moduleIndex, onClose }: { course: CatalogCourseDetail; moduleIndex: number; onClose: () => void }) {
  const module = course.modules[moduleIndex] ?? course.modules[0];
  const pages = catalogPages(module?.blocks ?? []);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="pa-overlay" onClick={onClose}>
      <div className="pa-dialog" role="dialog" aria-modal="true" aria-labelledby="preview-title" onClick={(e) => e.stopPropagation()}>
        <div className="pa-dialog-head">
          <h2 id="preview-title">Nhân viên sẽ thấy · {course.title}</h2>
          <button ref={closeButton} type="button" className="btn btn-ghost btn-small" onClick={onClose}>
            Đóng
          </button>
        </div>
        <div className="pa-dialog-body pa-learner">
          {!module ? (
            <p className="pa-empty">Khóa chưa có mô đun.</p>
          ) : (
            <>
              <span className="mini-label">Mô đun {module.index + 1}</span>
              <h2>{module.title}</h2>
              {pages.map((parts, index) => {
                const block = parts.find(part => part.type === 'TEXT') ?? parts[0]!;
                return block.type === 'TEXT'
                  ? <CatalogLessonContent key={block.blockId} block={block} pageBlocks={parts} courseCode={course.code} moduleIndex={module.index} count={pages.length} pageIndex={index} />
                  : <BlockPreview key={block.blockId} block={block} learner />;
              })}
              <div className="notice">
                Sau phần nội dung:{' '}
                {module.questions.length
                  ? `${QUESTIONS_MIN} câu hỏi ôn tập rút từ ${module.questions.length} câu.`
                  : 'chưa có câu hỏi ôn tập.'}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
