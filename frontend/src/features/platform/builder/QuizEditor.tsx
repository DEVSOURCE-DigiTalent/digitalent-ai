import { useState } from 'react';
import { toast } from 'sonner';
import { platformCatalogService, type CatalogModule, type CatalogQuestion } from '@/services/platform-catalog.service';
import { QUESTIONS_MIN, QUESTIONS_RECOMMENDED, errorMessage } from '../components/pulse-format';
import { BLOCK_TYPES, type CourseEdit } from './builder-types';

const letter = (index: number) => String.fromCharCode(65 + index);
const MAX_OPTIONS = 5;
const MIN_OPTIONS = 2;

/**
 * Review questions of one module (Pulse rule: each attempt draws 2 of them; a wrong answer sends the learner back to
 * the block the question is linked to). One question is open for editing at a time and saved with "Lưu câu hỏi".
 */
export function QuizEditor({ module, editable, edit }: { module: CatalogModule; editable: boolean; edit: CourseEdit }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState(module.quizTitle);
  const count = module.questions.length;
  const tone = count >= QUESTIONS_RECOMMENDED ? 'green' : count >= QUESTIONS_MIN ? '' : 'coral';

  const addQuestion = () =>
    edit((v, c) => platformCatalogService.addQuestion(v, c, module.moduleId))
      .then((detail) => {
        const added = detail.modules.find((m) => m.moduleId === module.moduleId)?.questions.at(-1);
        if (added) setOpenId(added.questionId);
      })
      .catch((err) => toast.error(errorMessage(err)));

  const saveTitle = () => {
    const title = quizTitle.trim();
    if (!title || title === module.quizTitle) return;
    edit((v, c) => platformCatalogService.updateModule(v, c, module.moduleId, { title: module.title, quizTitle: title })).catch((err) =>
      toast.error(errorMessage(err)),
    );
  };

  return (
    <section className="surface pad pa-quiz" aria-labelledby={`quiz-${module.moduleId}`}>
      <div className="pa-card-head">
        <div>
          <h2 id={`quiz-${module.moduleId}`} className="panel-title">Ngân hàng câu hỏi ôn tập của mô đun</h2>
          <p className="panel-desc">
            Ngân hàng hiện có {count} câu. Mỗi lượt nhân viên làm {Math.min(QUESTIONS_MIN, count)} câu được rút từ ngân hàng;
            sai thì phải xem lại nội dung liên quan. Nên có ít nhất {QUESTIONS_RECOMMENDED} câu để thay đổi bộ câu giữa các lượt.
          </p>
        </div>
        <span className={`pill ${tone}`}>
          {count} câu trong ngân hàng
        </span>
      </div>
      <label className="field">
        Tên bài kiểm tra
        <input
          value={quizTitle}
          readOnly={!editable}
          maxLength={250}
          onChange={(e) => setQuizTitle(e.target.value)}
          onBlur={saveTitle}
        />
      </label>
      <div className="pa-questions">
        {module.questions.map((question) => (
          <QuestionRow
            key={question.questionId}
            question={question}
            module={module}
            open={editable && openId === question.questionId}
            editable={editable}
            onOpen={() => setOpenId(openId === question.questionId ? null : question.questionId)}
            onClose={() => setOpenId(null)}
            edit={edit}
          />
        ))}
        {count === 0 && <p className="pa-empty">Chưa có câu hỏi.</p>}
      </div>
      {editable && (
        <div className="button-row pa-gap-top">
          <button type="button" className="btn btn-light" onClick={addQuestion} disabled={module.blocks.length === 0}>
            + Thêm câu hỏi
          </button>
          {module.blocks.length === 0 && <small className="pa-hint">Thêm nội dung trước để gắn câu hỏi.</small>}
        </div>
      )}
    </section>
  );
}

function QuestionRow({
  question,
  module,
  open,
  editable,
  onOpen,
  onClose,
  edit,
}: {
  question: CatalogQuestion;
  module: CatalogModule;
  open: boolean;
  editable: boolean;
  onOpen: () => void;
  onClose: () => void;
  edit: CourseEdit;
}) {
  const correct = question.options.findIndex((o) => o.isCorrect);
  const block = module.blocks.find((b) => b.blockId === question.blockId);
  const incomplete = !question.text.trim() || question.options.some((o) => !o.text.trim()) || correct < 0;

  return (
    <div className={`pa-question${open ? ' open' : ''}`}>
      <button type="button" className="pa-question-head" onClick={onOpen} disabled={!editable} aria-expanded={editable ? open : undefined}>
        <span className="qn">{question.index + 1}</span>
        <span className="qt">{question.text.trim() || 'Câu hỏi mới — chưa có nội dung'}</span>
        <small>
          {incomplete && <span className="pa-error">Chưa đủ · </span>}
          Đúng: {correct >= 0 ? letter(correct) : '—'} · {block ? `khối ${block.index + 1}` : 'chưa gắn khối'}
        </small>
      </button>
      {open && <QuestionForm question={question} module={module} onClose={onClose} edit={edit} />}
    </div>
  );
}

function QuestionForm({ question, module, onClose, edit }: { question: CatalogQuestion; module: CatalogModule; onClose: () => void; edit: CourseEdit }) {
  const [text, setText] = useState(question.text);
  const [explanation, setExplanation] = useState(question.explanation ?? '');
  const [blockId, setBlockId] = useState(question.blockId ?? '');
  const [options, setOptions] = useState(question.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })));
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const correctCount = options.filter((o) => o.isCorrect).length;
  const valid = options.length >= MIN_OPTIONS && options.length <= MAX_OPTIONS && correctCount === 1;
  const complete = text.trim() && options.every((o) => o.text.trim());

  const setOption = (index: number, patch: Partial<{ text: string; isCorrect: boolean }>) =>
    setOptions((list) => list.map((o, i) => (i === index ? { ...o, ...patch } : patch.isCorrect ? { ...o, isCorrect: false } : o)));
  const removeOption = (index: number) =>
    setOptions((list) => {
      const next = list.filter((_, i) => i !== index);
      if (!next.some((o) => o.isCorrect) && next.length) next[0] = { ...next[0]!, isCorrect: true };
      return next;
    });

  const save = () => {
    setSaving(true);
    edit((v, c) =>
      platformCatalogService.updateQuestion(v, c, question.questionId, {
        text: text.trim(),
        explanation: explanation.trim() || null,
        blockId: blockId || null,
        options: options.map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect })),
      }),
    )
      .then(() => {
        toast.success(`Đã lưu câu hỏi ${question.index + 1}.`);
        onClose();
      })
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setSaving(false));
  };

  const remove = () =>
    edit((v, c) => platformCatalogService.removeQuestion(v, c, question.questionId))
      .then(() => toast.success('Đã xóa câu hỏi.'))
      .catch((err) => toast.error(errorMessage(err)));

  return (
    <div className="pa-question-body">
      <label className="field">
        Nội dung câu hỏi
        <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} autoFocus={!question.text} />
      </label>
      <fieldset className="pa-options">
        <legend className="mini-label">Phương án · chọn đáp án đúng</legend>
        {options.map((option, index) => (
          <div className="pa-option" key={index}>
            <input
              type="radio"
              name={`correct-${question.questionId}`}
              checked={option.isCorrect}
              onChange={() => setOption(index, { isCorrect: true })}
              aria-label={`Phương án ${letter(index)} là đáp án đúng`}
            />
            <input
              className="pa-input"
              value={option.text}
              onChange={(e) => setOption(index, { text: e.target.value })}
              placeholder={`Phương án ${letter(index)}`}
              aria-label={`Phương án ${letter(index)}`}
              maxLength={500}
            />
            <button
              type="button"
              className="btn btn-ghost btn-small pa-danger-text"
              onClick={() => removeOption(index)}
              disabled={options.length <= MIN_OPTIONS}
              aria-label={`Xóa phương án ${letter(index)}`}
            >
              ✕
            </button>
          </div>
        ))}
        <div>
          <button
            type="button"
            className="btn btn-outline btn-small"
            onClick={() => setOptions((list) => [...list, { text: '', isCorrect: false }])}
            disabled={options.length >= MAX_OPTIONS}
          >
            + Phương án
          </button>
        </div>
      </fieldset>
      <div className="inline-fields">
        <label className="field">
          Gắn với khối nội dung
          <select value={blockId} onChange={(e) => setBlockId(e.target.value)}>
            <option value="">Chưa gắn khối</option>
            {module.blocks.map((b) => (
              <option key={b.blockId} value={b.blockId}>
                Khối {b.index + 1} · {BLOCK_TYPES[b.type].label}
              </option>
            ))}
          </select>
          <small className="field-hint">Sai câu này thì nhân viên phải mở lại khối đó.</small>
        </label>
        <label className="field">
          Giải thích (hiện sau khi trả lời)
          <input value={explanation} onChange={(e) => setExplanation(e.target.value)} maxLength={1000} />
        </label>
      </div>
      {!complete && <p className="field-hint">Có thể lưu khi chưa đủ; muốn công bố thì câu hỏi và mọi phương án đều cần nội dung.</p>}
      <div className="pa-row-between">
        {confirmDelete ? (
          <div className="button-row">
            <button type="button" className="btn btn-small pa-danger" onClick={remove}>
              Xóa câu hỏi này
            </button>
            <button type="button" className="btn btn-ghost btn-small" onClick={() => setConfirmDelete(false)}>
              Giữ lại
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-ghost btn-small pa-danger-text" onClick={() => setConfirmDelete(true)}>
            Xóa câu hỏi
          </button>
        )}
        <div className="button-row">
          <button type="button" className="btn btn-ghost btn-small" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn btn-primary btn-small" onClick={save} disabled={!valid || saving}>
            {saving ? 'Đang lưu…' : 'Lưu câu hỏi'}
          </button>
        </div>
      </div>
    </div>
  );
}
