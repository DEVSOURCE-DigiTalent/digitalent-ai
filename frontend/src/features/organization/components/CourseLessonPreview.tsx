import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCourseLesson } from '@/hooks/use-assignments';
import { LessonSlide } from '@/features/pulse-employee/components/LessonSlide';
import { RichText } from '@/features/pulse-employee/components/RichText';
import '@/features/pulse-employee/pulse.css';
import '@/features/pulse-employee/pulse-lesson.css';
import './course-lesson-preview.css';

export function CourseLessonPreview({ lessonId, courseCode, moduleIndex, index, count, onClose, onNavigate }: { lessonId: string; courseCode: string; moduleIndex: number; index: number; count: number; onClose: () => void; onNavigate?: (index: number) => void }) {
  useUiLanguage();
  const { data, isLoading, error } = useCourseLesson(lessonId);
  const dialog = useRef<HTMLDialogElement>(null);
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  useEffect(() => { if (body.current) body.current.scrollTop = 0; }, [lessonId]);
  // StrictMode replays the effect. close() in its cleanup queues a native close event;
  // that event must not dismiss the freshly reopened dialog.
  return <dialog ref={dialog} className="pu owner-lesson-preview" aria-label={translateUi("Xem nội dung bài học")} onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="owner-lesson-preview-header">
      <div><span>{translateUi("Xem trước bài học")}</span><small>{translateUi("Chương ")}{moduleIndex}{translateUi(" · Bài ")}{index + 1} / {count}</small></div>
      <div className="owner-lesson-preview-controls">
        {onNavigate && <><button type="button" disabled={index === 0} onClick={() => onNavigate(index - 1)} aria-label={translateUi("Bài trước")}><ChevronLeft size={18} /></button><button type="button" disabled={index >= count - 1} onClick={() => onNavigate(index + 1)} aria-label={translateUi("Bài sau")}><ChevronRight size={18} /></button></>}
        <button type="button" autoFocus onClick={onClose} aria-label={translateUi("Đóng nội dung bài học")}><X size={20} /></button>
      </div>
    </div>
    <div className="owner-lesson-preview-progress" role="progressbar" aria-label={translateUi("Tiến độ chương")} aria-valuemin={0} aria-valuemax={count} aria-valuenow={index + 1}><span style={{ width: `${((index + 1) / Math.max(count, 1)) * 100}%` }} /></div>
    <div className="owner-lesson-preview-body" ref={body}>
      {isLoading ? <p>{translateUi("Đang tải nội dung…")}</p> : error ? <p role="alert">{translateUi("Không tải được bài học. Hãy đóng và thử lại.")}</p> : data ? (
        data.contentLocked ? <RichText body={data.contentBody} /> : <LessonSlide courseCode={data.courseCode || courseCode} moduleIndex={data.moduleIndex ?? moduleIndex} index={index} count={count}
          slide={{ lessonId: data.id, title: data.title, lessonType: data.lessonType, contentBody: data.contentBody, estimatedMinutes: data.estimatedMinutes, media: data.media }} />
      ) : null}
    </div>
  </dialog>;
}
