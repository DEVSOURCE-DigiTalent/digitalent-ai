import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useCourseLesson } from '@/hooks/use-assignments';
import { LessonSlide } from '@/features/pulse-employee/components/LessonSlide';
import { RichText } from '@/features/pulse-employee/components/RichText';
import '@/features/pulse-employee/pulse.css';
import '@/features/pulse-employee/pulse-lesson.css';

export function CourseLessonPreview({ lessonId, courseCode, moduleIndex, index, count, onClose }: { lessonId: string; courseCode: string; moduleIndex: number; index: number; count: number; onClose: () => void }) {
  const { data, isLoading, error } = useCourseLesson(lessonId);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  // StrictMode replays the effect. close() in its cleanup queues a native close event;
  // that event must not dismiss the freshly reopened dialog.
  return <dialog ref={dialog} className="pu pu-lesson-lightbox" style={{ minHeight: 0 }} aria-label="Xem nội dung bài học" onCancel={event => { event.preventDefault(); onClose(); }}>
    <button type="button" autoFocus onClick={onClose} aria-label="Đóng nội dung bài học"><X size={20} /></button>
    {isLoading ? <p>Đang tải nội dung…</p> : error ? <p role="alert">Không tải được bài học. Hãy đóng và thử lại.</p> : data ? (
      data.contentLocked ? <RichText body={data.contentBody} /> : <LessonSlide courseCode={data.courseCode || courseCode} moduleIndex={data.moduleIndex ?? moduleIndex} index={index} count={count}
        slide={{ lessonId: data.id, title: data.title, lessonType: data.lessonType, contentBody: data.contentBody, estimatedMinutes: data.estimatedMinutes, media: data.media }} />
    ) : null}
  </dialog>;
}
