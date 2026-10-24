import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, Clock3, Lightbulb, Maximize2, Presentation, Video, X } from 'lucide-react';
import { COURSE_MEDIA_SPECS } from '@/features/learning/data/course-media-specs';
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

  const normalizedCourseCode = (slide.courseCode || courseCode || '').toUpperCase();
  const courseSpecs = COURSE_MEDIA_SPECS[normalizedCourseCode] || COURSE_MEDIA_SPECS[normalizedCourseCode.replace(/^M/, 'A')];
  const specList = courseSpecs ? Object.values(courseSpecs)[moduleIndex - 1] || Object.values(courseSpecs)[0] : null;
  const mediaSpec = specList ? (specList[index] || specList[0]) : null;
  const hasVisual = pictures.length > 0 || videos.length > 0 || Boolean(mediaSpec);

  return (
    <article className={`pu-lesson-slide ${hasVisual ? 'has-art' : ''}`} aria-labelledby={headingId}>
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
                {pictures.length === 0 && videos.length === 0 && mediaSpec && (
          <div className="pu-lesson-visuals">
            <figure className="pu-lesson-visual" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #eef2f6', background: '#f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#334155' }}>
                    <Presentation size={14} style={{ color: '#2563eb' }} /> Slide trực quan (Kịch bản video)
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: '#e2e8f0', color: '#475569' }}>
                    {mediaSpec.slideCode}
                  </span>
                </div>
                <h4 style={{ margin: '8px 0 0', fontSize: 14, fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>
                  {mediaSpec.title}
                </h4>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 600, color: '#64748b' }}>
                  Bố cục minh họa: {mediaSpec.layout === 'process' ? 'Quy trình các bước' : mediaSpec.layout === 'comparison' ? 'So sánh Đúng - Sai' : mediaSpec.layout === 'checklist' ? 'Bảng kiểm tiêu chuẩn' : 'Sơ đồ khái niệm'}
                </p>
                <div style={{ display: 'grid', gap: 8 }}>
                  {mediaSpec.keyPoints.map((pt, pti) => (
                    <div key={pti} style={{ display: 'flex', gap: 10, padding: '8px 12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                      <span style={{ display: 'grid', placeItems: 'center', width: 18, height: 18, borderRadius: 9, background: '#eff6ff', color: '#2563eb', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
                        {pti + 1}
                      </span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, padding: '10px 12px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 8 }}>
                  <small style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Mô tả tạo slide (Canva / Figma):
                  </small>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
                    {mediaSpec.visualPrompt}
                  </p>
                </div>
                <details style={{ marginTop: 12 }}>
                  <summary style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Video size={13} /> Xem kịch bản thuyết minh video (Voiceover Script)
                  </summary>
                  <div style={{ marginTop: 8, padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 12, color: '#166534', lineHeight: 1.6 }}>
                    <p style={{ margin: 0 }}>{mediaSpec.videoScript}</p>
                    <small style={{ display: 'block', marginTop: 6, color: '#15803d', fontSize: 10 }}>
                      Thời lượng ước tính: 60 - 90 giây khi thu âm.
                    </small>
                  </div>
                </details>
              </div>
              <figcaption style={{ padding: '10px 20px', borderTop: '1px solid #eef2f6', background: '#fafafa', fontSize: 11, color: '#64748b' }}>
                Khi tải video lên, hệ thống sẽ tự động thay thế khung này bằng video bài giảng.
              </figcaption>
            </figure>
          </div>
        )}
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
