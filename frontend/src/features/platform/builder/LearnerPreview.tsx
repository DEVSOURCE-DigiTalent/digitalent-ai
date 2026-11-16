import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { CatalogCourseDetail } from '@/services/platform-catalog.service';
import { QUESTIONS_MIN } from '../components/pulse-format';
import { BlockPreview } from './BlockCard';
import { CatalogLessonContent } from './CatalogLessonContent';
import { catalogPages } from './catalog-pages';
import {
  X,
  Eye,
  HelpCircle,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

const two = (n: number) => String(n).padStart(2, '0');
const letter = (idx: number) => String.fromCharCode(65 + idx);

/**
 * "Xem như nhân viên" (Learner Preview):
 * Immersive full-screen learner preview with module switcher tabs,
 * clean lesson slide reader, and review quiz preview.
 */
export function LearnerPreview({
  course,
  moduleIndex,
  onClose,
}: {
  course: CatalogCourseDetail;
  moduleIndex: number;
  onClose: () => void;
}) {
  useUiLanguage();
  const [activeSection, setActiveSection] = useState<number | 'final'>(
    moduleIndex < course.modules.length ? moduleIndex : 0,
  );
  const closeButton = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const currModule =
    typeof activeSection === 'number'
      ? (course.modules[activeSection] ?? course.modules[0])
      : null;
  const pages = currModule ? catalogPages(currModule.blocks ?? []) : [];
  const totalModules = course.modules.length;

  return typeof document !== 'undefined' ? (
    createPortal(
      <div
        className="pa-modal-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100dvh',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 20px',
          background: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
        }}
      >
        <div
          className="pa-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-title"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 1140,
            height: '92dvh',
            maxHeight: 920,
            borderRadius: 18,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'paModalPopIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* ✦ THANH ĐIỀU HƯỚNG XEM TRƯỚC (PREVIEW TOPBAR) */}
          <header
            style={{
              flexShrink: 0,
              height: 62,
              background: '#ffffff',
              borderBottom: '1px solid #e2e8f0',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              zIndex: 10,
            }}
          >
            {/* Cột trái: Huy hiệu xem trước + Tên khóa học */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <Eye size={13} aria-hidden="true" />
                <span>{translateUi('Xem thử như nhân viên')}</span>
              </span>

              <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <strong style={{ fontSize: 14.5, color: '#0f172a', fontFamily: 'monospace' }}>
                  {course.code}
                </strong>
                <span style={{ margin: '0 6px', color: '#cbd5e1' }}>|</span>
                <span id="preview-title" style={{ fontSize: 14, color: '#334155', fontWeight: 600 }}>
                  {translateUi(course.title)}
                </span>
              </div>
            </div>

            {/* Cột giữa: Bộ chuyển đổi mô đun 1 chạm (Module Switcher Pills) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#f1f5f9',
                padding: 4,
                borderRadius: 10,
                overflowX: 'auto',
                maxWidth: '50%',
              }}
              role="tablist"
              aria-label={translateUi('Chọn mô đun xem trước')}
            >
              {course.modules.map((m, idx) => {
                const isActive = activeSection === idx;
                return (
                  <button
                    key={m.moduleId}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      setActiveSection(idx);
                      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 7,
                      fontSize: 12.5,
                      fontWeight: isActive ? 700 : 500,
                      border: 'none',
                      background: isActive ? '#ffffff' : 'transparent',
                      color: isActive ? 'var(--pa-accent, #b85c24)' : '#64748b',
                      boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {translateUi(`Mô đun ${two(idx + 1)}`)}
                  </button>
                );
              })}

              <button
                type="button"
                role="tab"
                aria-selected={activeSection === 'final'}
                onClick={() => {
                  setActiveSection('final');
                  contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 7,
                  fontSize: 12.5,
                  fontWeight: activeSection === 'final' ? 700 : 500,
                  border: 'none',
                  background: activeSection === 'final' ? '#ffffff' : 'transparent',
                  color: activeSection === 'final' ? 'var(--pa-accent, #b85c24)' : '#64748b',
                  boxShadow: activeSection === 'final' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <GraduationCap size={14} />
                <span>{translateUi('Bài cuối khóa')}</span>
              </button>
            </div>

            {/* Cột phải: Nút Thoát xem trước */}
            <button
              ref={closeButton}
              type="button"
              className="btn btn-outline btn-small inline-flex items-center gap-1.5"
              onClick={onClose}
              style={{
                minHeight: 34,
                padding: '0 14px',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 8,
                background: '#ffffff',
                borderColor: '#cbd5e1',
                color: '#334155',
                flexShrink: 0,
              }}
            >
              <X size={15} />
              <span>{translateUi('Thoát xem trước')}</span>
            </button>
          </header>

          {/* ✦ VÙNG NỘI DUNG HỌC TẬP (SCROLLABLE LEARNER CANVAS) */}
          <div
            ref={contentRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px 32px',
            }}
          >
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
              {/* TRƯỜNG HỢP 1: XEM MÔ ĐUN BÀI HỌC */}
              {currModule && (
                <div style={{ display: 'grid', gap: 20 }}>
                  {/* Thẻ Header mô đun */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: 14,
                      border: '1px solid #e2e8f0',
                      padding: '20px 24px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <BookOpen size={14} style={{ color: 'var(--pa-accent, #b85c24)', flexShrink: 0 }} />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--pa-accent, #b85c24)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {translateUi(`Mô đun ${two(currModule.index + 1)} / ${two(totalModules)}`)}
                      </span>
                      <span style={{ color: '#cbd5e1' }}>•</span>
                      <span style={{ fontSize: 12.5, color: '#64748b' }}>
                        {currModule.blocks.length} {translateUi('khối')}
                      </span>
                      <span style={{ color: '#cbd5e1' }}>•</span>
                      <span style={{ fontSize: 12.5, color: '#64748b' }}>
                        {currModule.questions.length} {translateUi('câu hỏi ôn tập')}
                      </span>
                    </div>

                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
                      {translateUi(currModule.title)}
                    </h2>
                  </div>

                  {/* Danh sách các khối học liệu / trang bài đọc */}
                  {pages.length === 0 ? (
                    <div
                      style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        background: '#ffffff',
                        borderRadius: 14,
                        border: '1px dashed #cbd5e1',
                        color: '#64748b',
                      }}
                    >
                      {translateUi('Mô đun chưa có nội dung bài học.')}
                    </div>
                  ) : (
                    pages.map((parts, index) => {
                      const block = parts.find((part) => part.type === 'TEXT') ?? parts[0]!;
                      return block.type === 'TEXT' ? (
                        <CatalogLessonContent
                          key={block.blockId}
                          block={block}
                          pageBlocks={parts}
                          courseCode={course.code}
                          moduleIndex={currModule.index}
                          count={pages.length}
                          pageIndex={index}
                        />
                      ) : (
                        <BlockPreview key={block.blockId} block={block} learner />
                      );
                    })
                  )}

                  {/* Khu vực Trắc nghiệm ôn tập của mô đun */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: 14,
                      border: '1px solid #e2e8f0',
                      padding: '22px 26px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      display: 'grid',
                      gap: 16,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: 'var(--pa-accent-soft, #fef3e7)',
                            color: 'var(--pa-accent, #b85c24)',
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          <HelpCircle size={20} />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                            {translateUi(currModule.quizTitle || 'Trắc nghiệm ôn tập mô đun')}
                          </h3>
                          <small style={{ fontSize: 12.5, color: '#64748b' }}>
                            {translateUi(
                              `Mỗi lượt làm bài hệ thống sẽ rút ngẫu nhiên ${Math.min(QUESTIONS_MIN, currModule.questions.length)} câu hỏi để học viên ôn luyện.`,
                            )}
                          </small>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: 6,
                          background: currModule.questions.length >= QUESTIONS_MIN ? '#f0fdf4' : '#fff7ed',
                          color: currModule.questions.length >= QUESTIONS_MIN ? '#16a34a' : '#c2410c',
                          border: `1px solid ${currModule.questions.length >= QUESTIONS_MIN ? '#bbf7d0' : '#fed7aa'}`,
                        }}
                      >
                        {currModule.questions.length} {translateUi('câu trong ngân hàng')}
                      </span>
                    </div>

                    {/* Mẫu câu hỏi hiển thị cho học viên */}
                    {currModule.questions.length > 0 ? (
                      <div style={{ display: 'grid', gap: 12 }}>
                        {currModule.questions.slice(0, 2).map((q, qIdx) => (
                          <div
                            key={q.questionId}
                            style={{
                              padding: '14px 16px',
                              borderRadius: 10,
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                              <span
                                style={{
                                  display: 'inline-grid',
                                  placeItems: 'center',
                                  width: 22,
                                  height: 22,
                                  borderRadius: 6,
                                  background: 'var(--pa-accent-soft, #fef3e7)',
                                  color: 'var(--pa-accent-solid, #7c2d12)',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  flexShrink: 0,
                                }}
                              >
                                {qIdx + 1}
                              </span>
                              <strong style={{ fontSize: 13.5, color: '#0f172a' }}>
                                {q.text || translateUi('Câu hỏi ôn tập')}
                              </strong>
                            </div>

                            <div style={{ display: 'grid', gap: 6, paddingLeft: 32 }}>
                              {q.options.map((opt, optIdx) => (
                                <div
                                  key={optIdx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    fontSize: 13,
                                    color: opt.isCorrect ? '#16a34a' : '#475569',
                                    fontWeight: opt.isCorrect ? 600 : 400,
                                  }}
                                >
                                  <span
                                    style={{
                                      width: 18,
                                      height: 18,
                                      borderRadius: '50%',
                                      border: opt.isCorrect ? '2px solid #16a34a' : '1px solid #cbd5e1',
                                      background: opt.isCorrect ? '#f0fdf4' : '#ffffff',
                                      display: 'grid',
                                      placeItems: 'center',
                                      fontSize: 10,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {letter(optIdx)}
                                  </span>
                                  <span>{opt.text}</span>
                                  {opt.isCorrect && (
                                    <span style={{ fontSize: 11, color: '#16a34a', marginLeft: 4, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                      <CheckCircle2 size={12} />
                                      <span>({translateUi('Đáp án chuẩn')})</span>
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontStyle: 'italic' }}>
                        {translateUi('Mô đun này chưa có câu hỏi ôn tập.')}
                      </p>
                    )}
                  </div>

                  {/* Thanh điều hướng chân trang (Next / Previous module) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 0',
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-outline btn-small inline-flex items-center gap-1.5"
                      disabled={currModule.index === 0}
                      onClick={() => {
                        setActiveSection(currModule.index - 1);
                        contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <ArrowLeft size={14} />
                      <span>{translateUi('Mô đun trước')}</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary btn-small inline-flex items-center gap-1.5"
                      onClick={() => {
                        const next =
                          currModule.index === totalModules - 1 ? 'final' : currModule.index + 1;
                        setActiveSection(next);
                        contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <span>
                        {currModule.index === totalModules - 1
                          ? translateUi('Tới bài cuối khóa')
                          : translateUi('Mô đun tiếp theo')}
                      </span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* TRƯỜNG HỢP 2: XEM BÀI ĐÁNH GIÁ CUỐI KHÓA */}
              {activeSection === 'final' && (
                <div style={{ display: 'grid', gap: 20 }}>
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: 14,
                      border: '1px solid #e2e8f0',
                      padding: '24px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      display: 'grid',
                      gap: 16,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--pa-accent, #b85c24)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {translateUi('Cuối khóa')}
                      </span>
                      <span style={{ color: '#cbd5e1' }}>•</span>
                      <span style={{ fontSize: 12.5, color: '#64748b' }}>
                        {translateUi('Quản lý phòng ban chấm · Tối đa 2 lần nộp')}
                      </span>
                    </div>

                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
                      {translateUi(course.final.title || 'Bài đánh giá cuối khóa')}
                    </h2>

                    {/* Đề bài */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                      <h4 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                        {translateUi('Đề bài')}
                      </h4>
                      {course.final.promptHtml ? (
                        <div
                          className="pa-rich pa-rich-box"
                          style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: 10 }}
                          dangerouslySetInnerHTML={{ __html: course.final.promptHtml }}
                        />
                      ) : (
                        <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontStyle: 'italic' }}>
                          {translateUi('Chưa có đề bài.')}
                        </p>
                      )}
                    </div>

                    {/* Tiêu chí chấm điểm (Rubric) */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                      <h4 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                        {translateUi('Tiêu chí chấm của quản lý')} ({course.final.criteria.length})
                      </h4>
                      <div style={{ display: 'grid', gap: 8 }}>
                        {course.final.criteria.map((criterion, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '10px 14px',
                              borderRadius: 8,
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-grid',
                                placeItems: 'center',
                                width: 24,
                                height: 24,
                                borderRadius: 6,
                                background: 'var(--pa-accent-soft, #fef3e7)',
                                color: 'var(--pa-accent-solid, #7c2d12)',
                                fontSize: 11.5,
                                fontWeight: 700,
                              }}
                            >
                              {two(idx + 1)}
                            </span>
                            <span style={{ fontSize: 13.5, color: '#0f172a' }}>{criterion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Thanh điều hướng */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      padding: '16px 0',
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-outline btn-small inline-flex items-center gap-1.5"
                      onClick={() => {
                        setActiveSection(totalModules - 1);
                        contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <ArrowLeft size={14} />
                      <span>{translateUi(`Quay lại Mô đun ${two(totalModules)}`)}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>,
      document.body,
    )
  ) : null;
}
