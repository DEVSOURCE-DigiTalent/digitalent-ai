import { useState } from 'react';
import { toast } from 'sonner';
import { platformCatalogService, type BlockType, type CatalogCourseDetail, type CatalogModule } from '@/services/platform-catalog.service';
import { errorMessage } from '../components/pulse-format';
import { BlockCard } from './BlockCard';
import { BLOCK_TYPES, type CourseEdit } from './builder-types';
import { QuizEditor } from './QuizEditor';

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
  const [title, setTitle] = useState(module.title);
  const [addAt, setAddAt] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
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

  const move = (delta: number) =>
    edit((v, c) => platformCatalogService.moveModule(v, c, module.moduleId, module.index + delta))
      .then(() => onNavigate(module.index + delta))
      .catch((err) => toast.error(errorMessage(err)));

  const remove = () =>
    edit((v, c) => platformCatalogService.removeModule(v, c, module.moduleId))
      .then(() => {
        toast.success(`Đã xóa mô đun ${module.index + 1}.`);
        onNavigate(module.index > 0 ? module.index - 1 : total > 1 ? 0 : 'info');
      })
      .catch((err) => toast.error(errorMessage(err)));

  const addBar = (position: number) => {
    if (!editable) return null;
    if (addAt === position) return <TypeMenu onPick={(type) => insert(type, position)} onClose={() => setAddAt(null)} />;
    return (
      <div className="pa-add-bar">
        <button type="button" onClick={() => setAddAt(position)} aria-label={`Thêm khối ở vị trí ${position + 1}`}>
          +
        </button>
      </div>
    );
  };

  return (
    <div className="stack">
      <div className="surface pa-module-head">
        <span className="mini-label">
          Mô đun {two(module.index + 1)} / {two(total)}
        </span>
        <input
          className="pa-module-title"
          value={title}
          readOnly={!editable}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          maxLength={220}
          placeholder="Tên mô đun"
          aria-label="Tên mô đun"
        />
        {editable && (
          <div className="button-row pa-end">
            <button type="button" className="btn btn-ghost btn-small" disabled={module.index === 0} onClick={() => move(-1)}>
              ↑ Lên
            </button>
            <button type="button" className="btn btn-ghost btn-small" disabled={last} onClick={() => move(1)}>
              ↓ Xuống
            </button>
            {confirmDelete ? (
              <>
                <button type="button" className="btn btn-small pa-danger" onClick={remove}>
                  Xóa mô đun và {module.blocks.length} khối, {module.questions.length} câu hỏi
                </button>
                <button type="button" className="btn btn-ghost btn-small" onClick={() => setConfirmDelete(false)}>
                  Giữ lại
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-ghost btn-small pa-danger-text" onClick={() => setConfirmDelete(true)}>
                Xóa mô đun
              </button>
            )}
          </div>
        )}
      </div>

      <div className="pa-section-title">
        <h3>Nội dung</h3>
        <small>Nhân viên xem lần lượt từ trên xuống.{editable ? ' Bấm vào một khối để sửa.' : ''}</small>
      </div>

      {module.blocks.length === 0 ? (
        addAt === 0 ? (
          <TypeMenu onPick={(type) => insert(type, 0)} onClose={() => setAddAt(null)} />
        ) : (
          <div className="pa-blank">
            {editable ? (
              <>
                <button type="button" className="pa-plus" onClick={() => setAddAt(0)} aria-label="Thêm nội dung đầu tiên">
                  +
                </button>
                <strong>Thêm nội dung cho mô đun</strong>
                <small>Chọn chữ, slide, ảnh hoặc video. Thêm bao nhiêu khối tùy ý.</small>
              </>
            ) : (
              <small>Mô đun chưa có nội dung.</small>
            )}
          </div>
        )
      ) : (
        <div className="pa-blocks">
          {module.blocks.map((block) => (
            <div key={block.blockId} className="pa-block-slot">
              {addBar(block.index)}
              <BlockCard
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

      <QuizEditor key={module.moduleId} module={module} editable={editable} edit={edit} />

      <div className="pa-row-between">
        <button type="button" className="btn btn-outline" onClick={() => onNavigate(module.index === 0 ? 'info' : module.index - 1)}>
          ← {module.index === 0 ? 'Thông tin khóa học' : 'Mô đun trước'}
        </button>
        <button type="button" className="btn btn-light" onClick={() => onNavigate(last ? 'final' : module.index + 1)}>
          {last ? 'Tới bài cuối khóa →' : 'Mô đun tiếp theo →'}
        </button>
      </div>
    </div>
  );
}

function TypeMenu({ onPick, onClose }: { onPick: (type: BlockType) => void; onClose: () => void }) {
  return (
    <div className="pa-type-menu-wrap">
      <div className="pa-type-menu" role="group" aria-label="Chọn loại khối">
        {(Object.keys(BLOCK_TYPES) as BlockType[]).map((type, i) => (
          <button key={type} type="button" onClick={() => onPick(type)} autoFocus={i === 0}>
            <span className={`pa-type pa-type-${type.toLowerCase()}`} aria-hidden="true">
              {BLOCK_TYPES[type].glyph}
            </span>
            <strong>{BLOCK_TYPES[type].label}</strong>
            <small>{BLOCK_TYPES[type].hint}</small>
          </button>
        ))}
      </div>
      <div className="pa-center">
        <button type="button" className="btn btn-ghost btn-small" onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
}
