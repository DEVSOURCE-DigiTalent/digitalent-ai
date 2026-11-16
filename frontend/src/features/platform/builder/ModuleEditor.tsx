import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { platformCatalogService, type BlockType, type CatalogCourseDetail, type CatalogModule } from '@/services/platform-catalog.service';
import { errorMessage } from '../components/pulse-format';
import { BlockCard } from './BlockCard';
import { BLOCK_TYPES, type CourseEdit } from './builder-types';
import { QuizEditor } from './QuizEditor';
import { Layers, BookOpen, Trash2, ArrowRight, ArrowLeft, Plus, X, AlertTriangle } from 'lucide-react';

const two = (n: number) => String(n).padStart(2, '0');

/**
 * One module of the course builder: its title, its content blocks (a "+" between blocks opens the four block types)
 * and its review questions.
 */
export function ModuleEditor({
  course,
  module,
  editable,
  edit,
  onNavigate,
}: {
  course: CatalogCourseDetail;
  module: CatalogModule;
  editable: boolean;
  edit: CourseEdit;
  /** 'info', 'final' or a module index. */
  onNavigate: (target: 'info' | 'final' | number) => void;
}) {
  useUiLanguage();
  const [title, setTitle] = useState(module.title);
  const [addAt, setAddAt] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const total = course.modules.length;
  const last = module.index === total - 1;

  const saveTitle = () => {
    const value = title.trim();
    if (value === module.title) return;
    if (value.length < 2) {
      toast.error('Tên mô đun cần ít nhất 2 ký tự.');
      setTitle(module.title);
      return;
    }
    edit((v, c) => platformCatalogService.updateModule(v, c, module.moduleId, { title: value, quizTitle: module.quizTitle })).catch((err) =>
      toast.error(errorMessage(err)),
    );
  };

  const insert = (type: BlockType, position: number) => {
    setAddAt(null);
    edit((v, c) => platformCatalogService.addBlock(v, c, module.moduleId, type, position))
      .then((detail) => {
        const added = detail.modules.find((m) => m.moduleId === module.moduleId)?.blocks[position];
        if (added) setEditingId(added.blockId);
      })
      .catch((err) => toast.error(errorMessage(err)));
  };

  const remove = () => {
    setIsDeleting(true);
    edit((v, c) => platformCatalogService.removeModule(v, c, module.moduleId))
      .then(() => {
        toast.success(`Đã xóa mô đun ${module.index + 1}.`);
        setConfirmDelete(false);
        onNavigate(module.index > 0 ? module.index - 1 : total > 1 ? 0 : 'info');
      })
      .catch((err) => {
        toast.error(errorMessage(err));
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  const addBar = (position: number) => {
    if (!editable) return null;
    if (addAt === position) return <TypeMenu onPick={(type) => insert(type, position)} onClose={() => setAddAt(null)} />;
    return (
      <div className="pa-add-bar">
        <button
          type="button"
          onClick={() => setAddAt(position)}
          aria-label={translateUi(`Thêm khối ở vị trí ${position + 1}`)}
          title={translateUi('Thêm khối vào đây')}
        >
          +
        </button>
      </div>
    );
  };

  return (
    <div className="stack" aria-labelledby="module-editor-title">
      {/* ✦ BẢNG KHUNG 1: Thông tin mô đun */}
      <div className="pa-cb-panel">
        <div className="pa-cb-panel-head">
          <div>
            <div className="pa-cb-panel-title">
              <Layers size={18} style={{ color: 'var(--pa-accent, #b85c24)' }} aria-hidden="true" />
              <h2 id="module-editor-title" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                {translateUi('Thông tin mô đun')}
              </h2>
            </div>
            <div className="pa-cb-panel-desc">
              {translateUi('Hiển thị trong cấu trúc khóa học.')}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12.5,
                color: 'var(--pa-accent-solid, #7c2d12)',
                background: 'var(--pa-accent-soft, #fef3e7)',
                border: '1px solid var(--pa-accent-border, #efc69b)',
                padding: '4px 10px',
                borderRadius: 6,
                fontWeight: 700,
              }}
            >
              {translateUi(`Mô đun ${two(module.index + 1)} / ${two(total)}`)}
            </span>
            {editable && (
              <button
                type="button"
                className="btn btn-ghost btn-small pa-danger-text inline-flex items-center gap-1.5"
                onClick={() => setConfirmDelete(true)}
                title={translateUi('Xóa mô đun này khỏi khóa học')}
              >
                <Trash2 size={14} />
                <span>{translateUi('Xóa mô đun')}</span>
              </button>
            )}
          </div>
        </div>

        <div className="pa-cb-panel-body">
          <div>
            <label className="pa-cb-field-label" htmlFor="field-module-title">
              <span>{translateUi('Tên mô đun')} {editable && <span style={{ color: '#ef4444' }}>*</span>}</span>
            </label>
            <input
              id="field-module-title"
              className="pa-cb-input"
              value={title}
              readOnly={!editable}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              maxLength={220}
              placeholder={translateUi('Nhập tên mô đun...')}
              style={{ fontWeight: 600, fontSize: 14.5 }}
              autoFocus={title.startsWith('Mô đun ')}
            />
          </div>
        </div>
      </div>

      {/* ✦ BẢNG KHUNG 2: Khối học liệu mô đun */}
      <div className="pa-cb-panel">
        <div className="pa-cb-panel-head">
          <div>
            <div className="pa-cb-panel-title">
              <BookOpen size={18} style={{ color: 'var(--pa-accent, #b85c24)' }} aria-hidden="true" />
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                {translateUi('Các khối nội dung')}
              </h2>
            </div>
            <div className="pa-cb-panel-desc">
              {translateUi('Nhân viên học lần lượt từng khối từ trên xuống. Bấm vào khối để sửa.')}
            </div>
          </div>
          <span
            style={{
              fontSize: 12.5,
              color: '#475569',
              background: '#f1f5f9',
              padding: '4px 10px',
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            {translateUi(`${module.blocks.length} khối`)}
          </span>
        </div>

        <div className="pa-cb-panel-body">
          {module.blocks.length === 0 ? (
            addAt === 0 ? (
              <TypeMenu onPick={(type) => insert(type, 0)} onClose={() => setAddAt(null)} />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '36px 16px',
                  border: '2px dashed #e2e8f0',
                  borderRadius: 12,
                  textAlign: 'center',
                  background: '#fafafa',
                }}
              >
                {editable ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary btn-small inline-flex items-center gap-1.5"
                      onClick={() => setAddAt(0)}
                    >
                      <Plus size={15} />
                      <span>{translateUi('Thêm khối đầu tiên')}</span>
                    </button>
                    <span style={{ fontSize: 13, color: '#475569', marginTop: 10 }}>
                      {translateUi('Có thể thêm văn bản, slide, hình ảnh, video hoặc PDF.')}
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: 13, color: '#64748b' }}>
                    {translateUi('Mô đun chưa có khối nào.')}
                  </span>
                )}
              </div>
            )
          ) : (
            <div className="pa-blocks">
              {module.blocks.map((block) => (
                <div key={block.blockId} className="pa-block-slot">
                  {addBar(block.index)}
                  <BlockCard
                    courseCode={course.code}
                    moduleIndex={module.index}
                    block={block}
                    count={module.blocks.length}
                    linkedQuestions={module.questions.filter((q) => q.blockId === block.blockId).length}
                    editable={editable}
                    editing={editingId === block.blockId}
                    onToggle={() => setEditingId(editingId === block.blockId ? null : block.blockId)}
                    edit={edit}
                  />
                </div>
              ))}
              {addBar(module.blocks.length)}
            </div>
          )}
        </div>
      </div>

      {/* ✦ BẢNG KHUNG 3: Ngân hàng câu hỏi trắc nghiệm ôn tập */}
      <QuizEditor key={module.moduleId} module={module} editable={editable} edit={edit} />

      {/* ✦ THANH ĐIỀU HƯỚNG CHÂN TRANG */}
      <div className="pa-cb-action-footer">
        <button
          type="button"
          className="btn btn-outline btn-small inline-flex items-center gap-1.5"
          onClick={() => onNavigate(module.index === 0 ? 'info' : module.index - 1)}
        >
          <ArrowLeft size={14} />
          <span>{module.index === 0 ? translateUi('Thông tin khóa học') : translateUi('Mô đun trước')}</span>
        </button>
        <button
          type="button"
          className="btn btn-primary btn-small inline-flex items-center gap-1.5"
          onClick={() => onNavigate(last ? 'final' : module.index + 1)}
        >
          <span>{last ? translateUi('Tới bài cuối khóa') : translateUi('Mô đun tiếp theo')}</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* ✦ POPUP XÁC NHẬN XÓA MÔ ĐUN (LINEAR / STRIPE MODERN STYLE) */}
      {confirmDelete && typeof document !== 'undefined' && createPortal(
        <div
          className="pa-global-modal-overlay"
          onClick={() => !isDeleting && setConfirmDelete(false)}
        >
          <div
            className="pa-global-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 500 }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '20px 24px 16px',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    color: '#dc2626',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.08)',
                  }}
                >
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 id="confirm-delete-title" style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                    {translateUi('Xác nhận xóa mô đun')}
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: 13, color: '#64748b' }}>
                    {translateUi('Mô đun sẽ bị xóa hoàn toàn khỏi khóa học.')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-small"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
                style={{ padding: 6, borderRadius: 8, color: '#64748b' }}
                aria-label={translateUi('Đóng')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px', display: 'grid', gap: 16 }}>
              {/* Thẻ tóm tắt thông tin mô đun bị xóa (Target Inset Card) */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'grid',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: 'var(--pa-accent-soft, #fef3e7)',
                      color: 'var(--pa-accent-solid, #7c2d12)',
                      border: '1px solid var(--pa-accent-border, #efc69b)',
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {two(module.index + 1)}
                  </span>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {title || translateUi(`Mô đun ${two(module.index + 1)}`)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 12,
                      color: '#475569',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontWeight: 500,
                    }}
                  >
                    {module.blocks.length} {translateUi('khối')}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: '#475569',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontWeight: 500,
                    }}
                  >
                    {module.questions.length} {translateUi('câu hỏi ôn tập')}
                  </span>
                </div>
              </div>

              {/* Hộp cảnh báo tác động */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                }}
              >
                <AlertTriangle size={17} style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.5 }}>
                  {translateUi(
                    'Toàn bộ tài liệu, slide, video và câu hỏi ôn tập của mô đun này sẽ bị xóa vĩnh viễn và không thể phục hồi.',
                  )}
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 10,
                padding: '16px 24px',
                background: '#f8fafc',
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
                style={{
                  minHeight: 38,
                  padding: '0 16px',
                  fontSize: 13.5,
                  fontWeight: 600,
                  borderRadius: 8,
                }}
              >
                {translateUi('Hủy')}
              </button>
              <button
                type="button"
                className="btn inline-flex items-center gap-1.5"
                onClick={remove}
                disabled={isDeleting}
                style={{
                  minHeight: 38,
                  padding: '0 18px',
                  fontSize: 13.5,
                  fontWeight: 600,
                  borderRadius: 8,
                  background: '#dc2626',
                  borderColor: '#dc2626',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
                }}
              >
                <Trash2 size={15} />
                <span>{isDeleting ? translateUi('Đang xóa…') : translateUi('Xác nhận xóa')}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function TypeMenu({ onPick, onClose }: { onPick: (type: BlockType) => void; onClose: () => void }) {
  useUiLanguage();
  return (
    <div className="pa-type-menu-wrap">
      <div className="pa-type-menu" role="group" aria-label={translateUi('Chọn loại khối')}>
        {(Object.keys(BLOCK_TYPES) as BlockType[]).map((type, i) => (
          <button key={type} type="button" onClick={() => onPick(type)} autoFocus={i === 0}>
            <span className={`pa-type pa-type-${type.toLowerCase()}`} aria-hidden="true">
              {BLOCK_TYPES[type].glyph}
            </span>
            <strong>{translateUi(BLOCK_TYPES[type].label)}</strong>
            <small>{BLOCK_TYPES[type].hint}</small>
          </button>
        ))}
      </div>
      <div className="pa-center" style={{ marginTop: 8 }}>
        <button type="button" className="btn btn-ghost btn-small" onClick={onClose}>
          {translateUi('Đóng')}
        </button>
      </div>
    </div>
  );
}
