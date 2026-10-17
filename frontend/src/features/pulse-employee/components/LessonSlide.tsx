import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, Clock3, Lightbulb, Maximize2, X } from 'lucide-react';
import type { PulseSlide } from '@/services/pulse.service';
import { lessonSections } from '../lib/lesson-sections';
import { LESSON_TYPE_LABELS, pad2 } from '../lib/labels';
import { RichText } from './RichText';
import { lessonMediaUrl } from '@/types/learning-content';

function Sources({ body }: { body: string }) {
  // Plain URLs become links only in the source panel; unsupported markup stays sanitized by RichText.
  if (/<[a-z][^>]*>/i.test(body)) return <RichText body={body} />;
  return <div className="pu-lesson-sources">{body.trim().split('\n').filter(Boolean).map((line, index) => {
    if (/^https?:\/\/\S+$/i.test(line.trim())) {
      return <a key={index} href={line.trim()} target="_blank" rel="noopener noreferrer">Mở nguồn tham khảo <ArrowUpRight size={14} /><span className="pu-source-address">{line.trim()}</span></a>;
    }
    return <p key={index}>{line}</p>;
  })}</div>;
}

export function LessonSlide({ slide, index, count }: { slide: PulseSlide; courseCode: string; moduleIndex: number; index: number; count: number }) {
  const headingId = useId();
  const uploaded = slide.media ?? [];
  const pictures = uploaded.filter(item => item.kind === 'IMAGE').map(item => ({ src: lessonMediaUrl(item.url), alt: item.alt || slide.title }));
  const videos = uploaded.filter(item => item.kind === 'VIDEO');
  const [expanded, setExpanded] = useState<{ src: string; alt: string } | null>(null);
  const sections = lessonSections(slide.contentBody).map(section =>
    section.title.trim() === slide.title.trim() ? { ...section, title: '' } : section,
  );
  const reading = sections.filter(section => !/^(Tự kiểm tra|Nguồn tham khảo)$/i.test(section.title.trim()));
  const checks = sections.filter(section => /^Tự kiểm tra$/i.test(section.title.trim()));
  const sources = sections.filter(section => /^Nguồn tham khảo$/i.test(section.title.trim()));

  return (
    <article className={`pu-lesson-slide ${pictures.length || videos.length ? 'has-art' : ''}`} aria-labelledby={headingId}>
      <header className="pu-lesson-heading">
        <div className="pu-lesson-meta">
          <span><BookOpen size={14} /> {LESSON_TYPE_LABELS[slide.lessonType] ?? 'Nội dung'}</span>
          <span>Bài {pad2(index + 1)} / {pad2(count)}</span>
          {slide.estimatedMinutes ? <span><Clock3 size={14} /> {slide.estimatedMinutes} phút đọc</span> : null}
        </div>
        <h2 id={headingId}>{slide.title}</h2>
      </header>
      <div className="pu-lesson-grid">
        <div className="pu-lesson-reading">
          {reading.length ? reading.map((section, sectionIndex) => (
            <section key={sectionIndex} className={sectionIndex === 0 && !section.title ? 'pu-lesson-lead' : 'pu-lesson-section'}>
              {section.title && <h3>{section.title}</h3>}
              {section.body.trim() && <RichText body={section.body} />}
            </section>
          )) : <RichText body={slide.contentBody} />}
        </div>
        {(pictures.length > 0 || videos.length > 0) && <div className="pu-lesson-visuals">{pictures.map(artwork => (
          <figure className="pu-lesson-visual" key={artwork.src}>
            <button type="button" className="pu-lesson-image-button" onClick={event => { event.stopPropagation(); setExpanded(artwork); }} aria-label="Phóng to hình minh họa">
              <img src={artwork.src} alt={artwork.alt} decoding="async" loading="lazy" />
              <span><Maximize2 size={14} /> Xem ảnh</span>
            </button>
            <figcaption><span>Góc nhìn trực quan</span>{artwork.alt}</figcaption>
          </figure>
        ))}{videos.map(video => <figure className="pu-lesson-visual" key={video.url}><video controls preload="metadata" src={lessonMediaUrl(video.url)} style={{ width: '100%' }} /><figcaption>{video.alt}</figcaption></figure>)}</div>}
      </div>
      {checks.map((section, sectionIndex) => (
        <section className="pu-lesson-check" key={sectionIndex}>
          <span className="pu-lesson-check-icon"><Lightbulb size={21} /></span>
          <div><h3>Dừng một chút, thử nghĩ xem</h3><RichText body={section.body} /><small>Tự suy nghĩ trước khi sang bài tiếp theo.</small></div>
        </section>
      ))}
      {sources.length > 0 && <details className="pu-lesson-source-panel"><summary>Nguồn tham khảo · tìm hiểu sâu hơn</summary>{sources.map((section, i) => <Sources key={i} body={section.body} />)}</details>}
      {expanded && <ImageLightbox artwork={expanded} onClose={() => setExpanded(null)} />}
    </article>
  );
}

function ImageLightbox({ artwork, onClose }: { artwork: { src: string; alt: string }; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog ref={dialog} className="pu-lesson-lightbox" aria-label="Hình minh họa bài học" onCancel={event => { event.preventDefault(); event.stopPropagation(); onClose(); }} onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
      <button type="button" autoFocus onClick={onClose} aria-label="Đóng hình minh họa"><X size={20} /></button>
      <img src={artwork.src} alt={artwork.alt} />
      <p>{artwork.alt}</p>
    </dialog>
  );
}
