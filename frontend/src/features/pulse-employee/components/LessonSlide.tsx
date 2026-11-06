import { useId, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Lightbulb,
  Maximize2,
  Target,
  Video,
  Workflow,
  X,
} from 'lucide-react';
import type { PulseSlide } from '@/services/pulse.service';
import { lessonSections, type LessonSection } from '../lib/lesson-sections';
import { LESSON_TYPE_LABELS, pad2 } from '../lib/labels';
import { RichText } from './RichText';
import { lessonMediaUrl } from '@/types/learning-content';
import {
  detectSectionKind,
  parseGlossary,
  parseObjectives,
  parsePitfalls,
  parseStepper,
} from '../lib/semantic-content-parser';

function Sources({ body }: { body: string }) {
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

/* ── 1. Thẻ Mục tiêu năng lực cốt lõi ───────────────────────────────── */
function TargetCard({ section }: { section: LessonSection }) {
  const items = parseObjectives(section.body);
  return (
    <section className="pu-lesson-section pu-semantic-card pu-card-target">
      <div className="pu-sc-header">
        <div className="pu-sc-badge">
          <Target size={15} className="text-blue-700" />
          <span>Mục tiêu năng lực cốt lõi</span>
        </div>
        <span className="pu-sc-tag">Chuẩn Thông tư 02</span>
      </div>
      {items.length > 0 ? (
        <div className="pu-target-grid">
          {items.map((item, idx) => (
            <div key={idx} className="pu-target-item">
              <span className="pu-target-num">{pad2(idx + 1)}</span>
              <span className="pu-target-text">{item}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="pu-sc-body">
          <RichText body={section.body} />
        </div>
      )}
    </section>
  );
}

/* ── 2. Thẻ Từ điển quy chuẩn & Định nghĩa số ───────────────────────── */
function GlossaryCard({ section }: { section: LessonSection }) {
  const terms = parseGlossary(section.body);
  return (
    <section className="pu-lesson-section pu-semantic-card pu-card-glossary">
      <div className="pu-sc-header">
        <div className="pu-sc-badge">
          <BookOpen size={15} className="text-indigo-700" />
          <span>Định nghĩa quy chuẩn & Thuật ngữ số</span>
        </div>
        <span className="pu-sc-tag">Pháp lý số</span>
      </div>
      {terms.length > 0 ? (
        <div className="pu-glossary-grid">
          {terms.map((t, idx) => (
            <div key={idx} className="pu-glossary-card">
              <div className="pu-glossary-card-top">
                <strong className="pu-glossary-name">{t.name}</strong>
                {t.law && <span className="pu-glossary-law">{t.law}</span>}
              </div>
              <p className="pu-glossary-def">{t.definition}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="pu-sc-body">
          <RichText body={section.body} />
        </div>
      )}
    </section>
  );
}

/* ── 3. Thẻ Tình huống thực tế nơi làm việc ─────────────────────────── */
function CaseCard({ section }: { section: LessonSection }) {
  return (
    <section className="pu-lesson-section pu-semantic-card pu-card-case">
      <div className="pu-sc-header">
        <div className="pu-sc-badge">
          <Briefcase size={15} className="text-indigo-700" />
          <span>Tình huống thực tế nơi làm việc (Workplace Case)</span>
        </div>
        <span className="pu-sc-tag">Bối cảnh doanh nghiệp</span>
      </div>
      <div className="pu-sc-body pu-case-body">
        <RichText body={section.body} />
      </div>
    </section>
  );
}

/* ── 4. Thẻ Quy trình tác nghiệp dạng Stepper SOP ───────────────────── */
function StepperCard({ section }: { section: LessonSection }) {
  const steps = parseStepper(section.body);
  return (
    <section className="pu-lesson-section pu-semantic-card pu-card-stepper">
      <div className="pu-sc-header">
        <div className="pu-sc-badge">
          <Workflow size={15} className="text-blue-800" />
          <span>Lưu đồ quy trình tác nghiệp chuẩn (SOP)</span>
        </div>
        <span className="pu-sc-tag">Thao tác tại đơn vị</span>
      </div>
      {steps.length > 0 ? (
        <div className="pu-stepper-timeline">
          {steps.map((st, idx) => (
            <div key={idx} className="pu-stepper-step">
              <div className="pu-stepper-indicator">
                <span className="pu-stepper-circle">{pad2(st.step)}</span>
                {idx < steps.length - 1 && <span className="pu-stepper-line" />}
              </div>
              <div className="pu-stepper-details">
                <h4 className="pu-stepper-step-title">{st.title}</h4>
                <p className="pu-stepper-step-desc">{st.text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="pu-sc-body">
          <RichText body={section.body} />
        </div>
      )}
    </section>
  );
}

/* ── 5. Thẻ Cảnh báo bẫy dữ liệu & Sai lầm thường gặp ────────────────── */
function PitfallsCard({ section }: { section: LessonSection }) {
  const items = parsePitfalls(section.body);
  return (
    <section className="pu-lesson-section pu-semantic-card pu-card-pitfalls">
      <div className="pu-sc-header">
        <div className="pu-sc-badge">
          <AlertTriangle size={15} className="text-amber-600" />
          <span>Cảnh báo bẫy dữ liệu & Sai lầm thường gặp</span>
        </div>
        <span className="pu-sc-tag">Rủi ro cần tránh</span>
      </div>
      {items.length > 0 ? (
        <div className="pu-pitfalls-grid">
          {items.map((err, idx) => (
            <div key={idx} className="pu-pitfall-item">
              <span className="pu-pitfall-badge">✕ Cần tránh</span>
              <p className="pu-pitfall-text">{err}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="pu-sc-body">
          <RichText body={section.body} />
        </div>
      )}
    </section>
  );
}

/* ── 6. Thẻ Thực hành tình huống & Nghiệm thu bàn giao ───────────────── */
function PracticeCard({ section }: { section: LessonSection }) {
  return (
    <section className="pu-lesson-section pu-semantic-card pu-card-practice">
      <div className="pu-sc-header">
        <div className="pu-sc-badge">
          <ClipboardCheck size={15} className="text-emerald-700" />
          <span>Thực hành tình huống & Tiêu chuẩn bàn giao</span>
        </div>
        <span className="pu-sc-tag">Hướng dẫn tác nghiệp</span>
      </div>
      <div className="pu-sc-body pu-practice-body">
        <RichText body={section.body} />
        
        {/* Hướng dẫn học tập: Làm rõ đây là tài liệu tham chiếu rèn luyện, không phải nộp tại đây */}
        <div className="pu-practice-guidance-notice">
          <div className="pu-pgn-badge">
            <Lightbulb size={14} className="text-blue-700" />
            <span>Mục đích học tập: Rèn luyện kỹ năng thực tế</span>
          </div>
          <p>
            Đây là tình huống mẫu và tiêu chuẩn bàn giao để bạn đối chiếu và áp dụng vào công việc hàng ngày. 
            Bạn không cần nộp tệp bài làm trên trang này. Kỹ năng thực hành và sản phẩm công việc thực tế sẽ được kiểm tra và đánh giá toàn diện tại{' '}
            <strong>Bài đánh giá năng lực cuối khóa (Proctored Final Assessment)</strong>.
          </p>
        </div>

        <div className="pu-practice-rubric-box">
          <div className="pu-rubric-head">
            <CheckCircle2 size={14} className="text-emerald-700" />
            <span>3 Tiêu chuẩn nghiệm thu cốt lõi của sản phẩm đầu ra:</span>
          </div>
          <div className="pu-rubric-items">
            <span className="pu-rubric-chip">01. Nguồn có thể truy vết</span>
            <span className="pu-rubric-chip">02. Hành động có thể kiểm tra</span>
            <span className="pu-rubric-chip">03. Kết luận có căn cứ</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Component chính: LessonSlide ────────────────────────────────────── */
export function LessonSlide({
  slide,
  hideMedia = false,
  partNumber,
  partTitle,
}: {
  slide: PulseSlide;
  courseCode?: string;
  moduleIndex?: number;
  index?: number;
  count?: number;
  hideMedia?: boolean;
  partNumber?: number;
  partTitle?: string;
}) {
  const headingId = useId();
  const uploaded = slide.media ?? [];
  const pictures = uploaded
    .filter((item) => item.kind === 'IMAGE')
    .map((item) => ({ src: lessonMediaUrl(item.url), alt: item.alt || slide.title }));
  const videos = uploaded.filter((item) => item.kind === 'VIDEO');
  const documents = uploaded.filter((item) => item.kind === 'PDF');
  const [expanded, setExpanded] = useState<{ src: string; alt: string } | null>(null);

  // Phân tích các section từ Markdown/HTML
  const sections = lessonSections(slide.contentBody).map((section) =>
    section.title.trim() === slide.title.trim() ? { ...section, title: '' } : section,
  );
  const reading = sections.filter(
    (section) => !/^(Tự kiểm tra|Nguồn tham khảo)$/i.test(section.title.trim()) && section.body.trim().length > 0,
  );
  const checks = sections.filter((section) => /^Tự kiểm tra$/i.test(section.title.trim()));
  const sources = sections.filter((section) => /^Nguồn tham khảo$/i.test(section.title.trim()));

  // Xác định video bài giảng đã tải lên (nếu có)
  const uploadedVideo = videos[0]?.url ? lessonMediaUrl(videos[0].url) : null;
  const activeVideoUrl = uploadedVideo;

  return (
    <article className="pu-lesson-slide has-art" aria-labelledby={headingId}>
      {/* ── 1. Lesson Header ────────────────────────────────────────── */}
      <header className="pu-lesson-heading">
        <div className="pu-lesson-meta">
          <span className="pu-lesson-type-pill">
            <BookOpen size={13} className="text-blue-700" />
            <span>
              {partTitle || (partNumber ? `Phần ${pad2(partNumber)} · ${LESSON_TYPE_LABELS[slide.lessonType] ?? 'Bài học'}` : (LESSON_TYPE_LABELS[slide.lessonType] ?? 'Nội dung bài học'))}
            </span>
          </span>
          {slide.estimatedMinutes ? (
            <span className="pu-lesson-time-pill">
              <Clock3 size={13} className="text-slate-500" />
              <span>~{slide.estimatedMinutes} phút học</span>
            </span>
          ) : null}
        </div>
        <h2 id={headingId}>{slide.title}</h2>
      </header>

      {/* ── 2. Khu vực Media Hero hiển thị 1 chuẩn duy nhất (Không chia tab) ── */}
      {!hideMedia && (
        activeVideoUrl ? (
          <section className="pu-single-media-hero" aria-label="Video bài giảng">
            <div className="pu-video-player-container">
              <video
                controls
                preload="metadata"
                src={activeVideoUrl}
                className="pu-active-video-element"
              />
            </div>
          </section>
        ) : pictures.length > 0 ? (
          <section className="pu-single-media-hero" aria-label="Slide minh họa">
            <div className="pu-slide-picture-container">
              <img
                src={pictures[0]?.src}
                alt={pictures[0]?.alt || slide.title}
                className="pu-slide-picture-img"
                onClick={() => setExpanded(pictures[0] ?? null)}
              />
              <button
                type="button"
                className="pu-slide-expand-btn"
                onClick={() => setExpanded(pictures[0] ?? null)}
                aria-label="Phóng to hình ảnh"
              >
                <Maximize2 size={13} />
                <span>Xem toàn màn hình</span>
              </button>
            </div>
          </section>
        ) : (
          <div className="pu-media-notice-banner" role="status">
            <div className="pu-mnb-left">
              <div className="pu-mnb-icon-wrap">
                <Video size={18} className="text-blue-700" />
              </div>
              <div>
                <p className="pu-mnb-title">Khu vực Video bài giảng & Slide số hóa (Đang hoàn thiện biên tập)</p>
                <p className="pu-mnb-sub">
                  Video bài giảng thực tế và slide tóm tắt 16:9 đang được sản xuất và sẽ cập nhật sau. Hiện tại, nhân viên nghiên cứu đầy đủ giáo trình chuẩn hóa và cẩm nang tác nghiệp chi tiết bên dưới.
                </p>
              </div>
            </div>
            <span className="pu-mnb-pill">Giáo trình chuẩn số</span>
          </div>
        )
      )}

      {/* ── 3. Khu vực Nội dung Lý thuyết (Phân tầng Semantic Cards) ──── */}
      <div className="pu-lesson-reading-flow">
        {reading.map((section, sidx) => {
          const kind = detectSectionKind(section.title);
          switch (kind) {
            case 'TARGET':
              return <TargetCard key={sidx} section={section} />;
            case 'GLOSSARY':
              return <GlossaryCard key={sidx} section={section} />;
            case 'CASE':
              return <CaseCard key={sidx} section={section} />;
            case 'STEPPER':
              return <StepperCard key={sidx} section={section} />;
            case 'PITFALLS':
              return <PitfallsCard key={sidx} section={section} />;
            case 'PRACTICE':
              return <PracticeCard key={sidx} section={section} />;
            default:
              return (
                <section
                  key={sidx}
                  className={sidx === 0 && !section.title ? 'pu-lesson-lead' : 'pu-lesson-section'}
                >
                  {section.title && <h3>{section.title}</h3>}
                  {section.body.trim() && <RichText body={section.body} />}
                </section>
              );
          }
        })}
      </div>

      {/* ── Uploaded PDF (slides exported from PowerPoint) ───────────── */}
      {documents.map((file) => (
        <figure className="pu-lesson-document" key={file.url}>
          <iframe src={lessonMediaUrl(file.url)} title={file.alt || slide.title} />
          <figcaption>
            <span>{file.alt || slide.title}</span>
            <a
              href={lessonMediaUrl(file.url)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
            >
              Mở PDF trong tab mới <ArrowUpRight size={14} />
            </a>
          </figcaption>
        </figure>
      ))}

      {/* ── 4. Tự kiểm tra (Self-check Reflection) ───────────────────── */}
      {checks.map((section, sectionIndex) => (
        <section className="pu-lesson-check" key={sectionIndex}>
          <span className="pu-lesson-check-icon">
            <Lightbulb size={20} className="text-amber-600" />
          </span>
          <div>
            <h3>Dừng một chút, thử nghĩ xem</h3>
            <RichText body={section.body} />
            <small>Tự suy nghĩ và liên hệ thực tế trước khi sang trang tiếp theo.</small>
          </div>
        </section>
      ))}

      {/* ── 5. Nguồn tham khảo & Tra cứu ─────────────────────────────── */}
      {sources.map((section, sectionIndex) => (
        <section className="pu-lesson-sources-box" key={sectionIndex}>
          <h3>Nguồn tham khảo</h3>
          <Sources body={section.body} />
        </section>
      ))}

      {/* ── Lightbox phóng to ảnh/slide ──────────────────────────────── */}
      {expanded && (
        <div
          className="pu-lightbox-backdrop"
          onClick={() => setExpanded(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh lớn"
        >
          <div className="pu-lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pu-lightbox-header">
              <span>{expanded.alt}</span>
              <button
                type="button"
                className="pu-lightbox-close-btn"
                onClick={() => setExpanded(null)}
                aria-label="Đóng ảnh"
              >
                <X size={16} />
              </button>
            </div>
            <div className="pu-lightbox-content">
              <img src={expanded.src} alt={expanded.alt} />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
