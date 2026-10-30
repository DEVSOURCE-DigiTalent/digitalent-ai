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
  return (
    <div className="pu-lesson-sources">
      {body
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line, index) => {
          if (/^https?:\/\/\S+$/i.test(line.trim())) {
            return (
              <a key={index} href={line.trim()} target="_blank" rel="noopener noreferrer">
                Mở nguồn tham khảo <ArrowUpRight size={14} />
                <span className="pu-source-address">{line.trim()}</span>
              </a>
            );
          }
          return <p key={index}>{line}</p>;
        })}
    </div>
  );
}

export function LessonSlide({
  slide,
  courseCode = '',
  moduleIndex = 1,
  index,
  count,
}: {
  slide: PulseSlide;
  courseCode?: string;
  moduleIndex?: number;
  index: number;
  count: number;
}) {
  const headingId = useId();
  const uploaded = slide.media ?? [];
  const pictures = uploaded
    .filter((item) => item.kind === 'IMAGE')
    .map((item) => ({ src: lessonMediaUrl(item.url), alt: item.alt || slide.title }));
  const videos = uploaded.filter((item) => item.kind === 'VIDEO');
  const [expanded, setExpanded] = useState<{ src: string; alt: string } | null>(null);

  const sections = lessonSections(slide.contentBody).map((section) =>
    section.title.trim() === slide.title.trim() ? { ...section, title: '' } : section,
  );
  const reading = sections.filter((section) => !/^(Tự kiểm tra|Nguồn tham khảo)$/i.test(section.title.trim()));
  const checks = sections.filter((section) => /^Tự kiểm tra$/i.test(section.title.trim()));
  const sources = sections.filter((section) => /^Nguồn tham khảo$/i.test(section.title.trim()));

  const normalizedCourseCode = (((slide as any).courseCode || courseCode || '') as string).toUpperCase();
  const courseSpecs = COURSE_MEDIA_SPECS[normalizedCourseCode] || COURSE_MEDIA_SPECS[normalizedCourseCode.replace(/^M/, 'A')];
  const specList = courseSpecs ? Object.values(courseSpecs)[moduleIndex - 1] || Object.values(courseSpecs)[0] : null;
  const mediaSpec = specList ? specList[index] || specList[0] : null;
  const hasVisual = pictures.length > 0 || videos.length > 0 || Boolean(mediaSpec);

  return (
    <article className={`pu-lesson-slide ${hasVisual ? 'has-art' : ''}`} aria-labelledby={headingId}>
      {/* ── Lesson Header ────────────────────────────────────────────── */}
      <header className="pu-lesson-heading">
        <div className="pu-lesson-meta">
          <span className="pu-lesson-type-pill">
            <BookOpen size={14} />
            <span>{LESSON_TYPE_LABELS[slide.lessonType] ?? 'Nội dung bài học'}</span>
          </span>
          <span className="pu-lesson-page-pill">Bài {pad2(index + 1)} / {pad2(count)}</span>
          {slide.estimatedMinutes ? (
            <span className="pu-lesson-time-pill">
              <Clock3 size={14} />
              <span>{slide.estimatedMinutes} phút đọc</span>
            </span>
          ) : null}
        </div>
        <h2 id={headingId}>{slide.title}</h2>
      </header>

      {/* ── Lesson Content Grid ──────────────────────────────────────── */}
      <div className="pu-lesson-grid">
        <div className="pu-lesson-reading">
          {reading.length ? (
            reading.map((section, sectionIndex) => (
              <section
                key={sectionIndex}
                className={sectionIndex === 0 && !section.title ? 'pu-lesson-lead' : 'pu-lesson-section'}
              >
                {section.title && <h3>{section.title}</h3>}
                {section.body.trim() && <RichText body={section.body} />}
              </section>
            ))
          ) : (
            <RichText body={slide.contentBody} />
          )}
        </div>

        {/* ── Visual Takeaways Card (Sạch prompt kỹ thuật, chuẩn Learner) ── */}
        {pictures.length === 0 && videos.length === 0 && mediaSpec && (
          <div className="pu-lesson-visuals">
            <figure className="pu-lesson-visual pu-takeaways-card">
              <div className="pu-takeaways-head">
                <span className="pu-takeaways-badge">
                  <Presentation size={15} className="text-indigo-600" />
                  <span>Tóm tắt trực quan</span>
                </span>
                <span className="pu-takeaways-layout">
                  {mediaSpec.layout === 'process'
                    ? 'Quy trình các bước'
                    : mediaSpec.layout === 'comparison'
                    ? 'So sánh Đúng · Sai'
                    : mediaSpec.layout === 'checklist'
                    ? 'Bảng kiểm tiêu chuẩn'
                    : 'Sơ đồ khái niệm'}
                </span>
              </div>

              <div className="pu-takeaways-body">
                <h4 className="pu-takeaways-title">{mediaSpec.title}</h4>

                <div className="pu-takeaways-points">
                  {mediaSpec.keyPoints.map((pt, pti) => (
                    <div key={pti} className="pu-takeaways-point">
                      <span className="pu-takeaways-num">{pti + 1}</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                {mediaSpec.videoScript && (
                  <details className="pu-voiceover-details">
                    <summary className="pu-voiceover-summary">
                      <Video size={14} />
                      <span>Lời thuyết minh tóm tắt bài giảng</span>
                    </summary>
                    <div className="pu-voiceover-content">
                      <p>{mediaSpec.videoScript}</p>
                    </div>
                  </details>
                )}
              </div>
            </figure>
          </div>
        )}

        {/* ── Uploaded Artwork or Video (nếu có) ───────────────────────── */}
        {(pictures.length > 0 || videos.length > 0) && (
          <div className="pu-lesson-visuals">
            {pictures.map((artwork) => (
              <figure className="pu-lesson-visual" key={artwork.src}>
                <button
                  type="button"
                  className="pu-lesson-image-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setExpanded(artwork);
                  }}
                  aria-label="Phóng to hình minh họa"
                >
                  <img src={artwork.src} alt={artwork.alt} decoding="async" loading="lazy" />
                  <span>
                    <Maximize2 size={14} /> Xem ảnh lớn
                  </span>
                </button>
                <figcaption>
                  <span>Góc nhìn trực quan:</span> {artwork.alt}
                </figcaption>
              </figure>
            ))}
            {videos.map((video) => (
              <figure className="pu-lesson-visual" key={video.url}>
                <video controls preload="metadata" src={lessonMediaUrl(video.url)} style={{ width: '100%' }} />
                <figcaption>{video.alt}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>

      {/* ── Self-check reflection ─────────────────────────────────────── */}
      {checks.map((section, sectionIndex) => (
        <section className="pu-lesson-check" key={sectionIndex}>
          <span className="pu-lesson-check-icon">
            <Lightbulb size={22} />
          </span>
          <div>
            <h3>Dừng một chút, thử nghĩ xem</h3>
            <RichText body={section.body} />
            <small>Tự suy nghĩ và liên hệ thực tế trước khi sang bài tiếp theo.</small>
          </div>
        </section>
      ))}

      {sources.length > 0 && (
        <details className="pu-lesson-source-panel">
          <summary>Nguồn tham khảo · Tìm hiểu sâu hơn</summary>
          {sources.map((section, i) => (
            <Sources key={i} body={section.body} />
          ))}
        </details>
      )}

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
    <dialog
      ref={dialog}
      className="pu-lesson-lightbox"
      aria-label="Hình minh họa bài học"
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button type="button" autoFocus onClick={onClose} aria-label="Đóng hình minh họa">
        <X size={20} />
      </button>
      <img src={artwork.src} alt={artwork.alt} />
      <p>{artwork.alt}</p>
    </dialog>
  );
}
