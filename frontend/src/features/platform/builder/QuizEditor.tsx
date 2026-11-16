import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { toast } from 'sonner';
import { platformCatalogService, type CatalogModule, type CatalogQuestion } from '@/services/platform-catalog.service';
import { QUESTIONS_MIN, QUESTIONS_RECOMMENDED, errorMessage } from '../components/pulse-format';
import { BLOCK_TYPES, type CourseEdit } from './builder-types';
import { HelpCircle, Plus } from 'lucide-react';

const letter = (index: number) => String.fromCharCode(65 + index);
const MAX_OPTIONS = 5;
const MIN_OPTIONS = 2;

/**
 * Review questions of one module (Pulse rule: each attempt draws 2 of them; a wrong answer sends the learner back to
 * the block the question is linked to). One question is open for editing at a time and saved with "Lưu câu hỏi".
 */
export function QuizEditor({ module, editable, edit }: { module: CatalogModule; editable: boolean; edit: CourseEdit }) {
  useUiLanguage();
  const [openId, setOpenId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState(module.quizTitle);
  const count = module.questions.length;

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
    <div className="pa-cb-panel" aria-labelledby={`quiz-${module.moduleId}`}>
      <div className="pa-cb-panel-head">
        <div>
          <div className="pa-cb-panel-title">
            <HelpCircle size={18} style={{ color: 'var(--pa-accent, #b85c24)' }} aria-hidden="true" />
            <h2 id={`quiz-${module.moduleId}`} style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
              {translateUi('Ngân hàng câu hỏi ôn tập')}
            </h2>
          </div>
          <div className="pa-cb-panel-desc">
            {translateUi(
              `Ngân hàng hiện có ${count} câu hỏi. Mỗi lượt ôn tập rút ${Math.min(QUESTIONS_MIN, count)} câu; học viên trả lời sai cần ôn lại khối học liệu tương ứng.`,
            )}
          </div>
        </div>
        <span
          style={{
            fontSize: 12.5,
            padding: '4px 10px',
            borderRadius: 6,
            fontWeight: 600,
            background: count >= QUESTIONS_RECOMMENDED ? '#f0fdf4' : count >= QUESTIONS_MIN ? '#f8fafc' : '#fff7ed',
            color: count >= QUESTIONS_RECOMMENDED ? '#16a34a' : count >= QUESTIONS_MIN ? '#475569' : '#c2410c',
            border: `1px solid ${count >= QUESTIONS_RECOMMENDED ? '#bbf7d0' : count >= QUESTIONS_MIN ? '#e2e8f0' : '#fed7aa'}`,
          }}
        >
          {translateUi(`${count} câu trong ngân hàng`)}
        </span>
      </div>

      <div className="pa-cb-panel-body">
        <div style={{ marginBottom: 14 }}>
          <label className="pa-cb-field-label" htmlFor={`quiz-title-${module.moduleId}`}>
            <span>{translateUi('Tên bài kiểm tra ôn tập')}</span>
          </label>
          <input
            id={`quiz-title-${module.moduleId}`}
            className="pa-cb-input"
            value={quizTitle}
            readOnly={!editable}
            maxLength={250}
            onChange={(e) => setQuizTitle(e.target.value)}
            onBlur={saveTitle}
            style={{ fontWeight: 600, fontSize: 14 }}
            placeholder={translateUi('Nhập tên bài kiểm tra ôn tập...')}
          />
        </div>

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
          {count === 0 && (
            <p style={{ margin: 0, padding: '16px 0', fontSize: 13, color: '#64748b', textAlign: 'center' }}>
              {translateUi('Chưa có câu hỏi ôn tập nào trong ngân hàng.')}
            </p>
          )}
        </div>

        {editable && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className="btn btn-outline btn-small inline-flex items-center gap-1.5"
              onClick={addQuestion}
              disabled={module.blocks.length === 0}
            >
              <Plus size={14} />
              <span>{translateUi('Thêm câu hỏi')}</span>
            </button>
            {module.blocks.length === 0 && (
              <span style={{ fontSize: 12.5, color: '#64748b' }}>
                {translateUi('Cần thêm khối học liệu trước để gắn câu hỏi liên kết.')}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
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
  useUiLanguage();
  const correct = question.options.findIndex((o) => o.isCorrect);
  const block = module.blocks.find((b) => b.blockId === question.blockId);
  const incomplete = !question.text.trim() || question.options.some((o) => !o.text.trim()) || correct < 0;

  return (
    <div className={`pa-question${open ? ' open' : ''}`}>
      <button type="button" className="pa-question-head" onClick={onOpen} disabled={!editable} aria-expanded={editable ? open : undefined}>
        <span className="qn">{question.index + 1}</span>
        <span className="qt">{question.text.trim() || translateUi('Câu hỏi mới: chưa có nội dung')}</span>
        <small>
          {incomplete && <span className="pa-error">{translateUi('Chưa đủ')} · </span>}
          {translateUi('Đúng:')} {correct >= 0 ? letter(correct) : translateUi('Chưa chọn')} · {block ? translateUi(`khối ${block.index + 1}`) : translateUi('chưa gắn khối')}
        </small>
      </button>
      {open && <QuestionForm question={question} module={module} onClose={onClose} edit={edit} />}
    </div>
  );
}

function QuestionForm({ question, module, onClose, edit }: { question: CatalogQuestion; module: CatalogModule; onClose: () => void; edit: CourseEdit }) {
  useUiLanguage();
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
      <div>
        <label className="pa-cb-field-label" htmlFor={`question-text-${question.questionId}`}>
          <span>{translateUi('Nội dung câu hỏi')} <span style={{ color: '#ef4444' }}>*</span></span>
        </label>
        <textarea
          id={`question-text-${question.questionId}`}
          className="pa-cb-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          autoFocus={!question.text}
          rows={3}
          placeholder={translateUi('Nhập nội dung câu hỏi trắc nghiệm...')}
        />
      </div>

      <fieldset className="pa-options" style={{ border: 'none', padding: 0, margin: '8px 0' }}>
        <legend className="pa-cb-field-label" style={{ marginBottom: 6 }}>
          <span>{translateUi('Phương án trả lời (chọn 1 đáp án đúng)')}</span>
        </legend>
        {options.map((option, index) => (
          <div className="pa-option" key={index} style={{ marginBottom: 8 }}>
            <input
              type="radio"
              name={`correct-${question.questionId}`}
              checked={option.isCorrect}
              onChange={() => setOption(index, { isCorrect: true })}
              aria-label={translateUi(`Phương án ${letter(index)} là đáp án đúng`)}
            />
            <input
              className="pa-cb-input"
              value={option.text}
              onChange={(e) => setOption(index, { text: e.target.value })}
              placeholder={translateUi(`Phương án ${letter(index)}`)}
              aria-label={translateUi(`Phương án ${letter(index)}`)}
              maxLength={500}
              style={{ fontSize: 13.5 }}
            />
            <button
              type="button"
              className="btn btn-ghost btn-small pa-danger-text"
              onClick={() => removeOption(index)}
              disabled={options.length <= MIN_OPTIONS}
              aria-label={translateUi(`Xóa phương án ${letter(index)}`)}
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
            + {translateUi('Phương án')}
          </button>
        </div>
      </fieldset>

      <div className="inline-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="pa-cb-field-label" htmlFor={`link-block-${question.questionId}`}>
            <span>{translateUi('Gắn với khối học liệu')}</span>
          </label>
          <select
            id={`link-block-${question.questionId}`}
            className="pa-cb-select"
            value={blockId}
            onChange={(e) => setBlockId(e.target.value)}
          >
            <option value="">{translateUi('Chưa gắn khối')}</option>
            {module.blocks.map((b) => {
              const bType = ((b.type || 'TEXT').toUpperCase() as keyof typeof BLOCK_TYPES);
              const label = BLOCK_TYPES[bType]?.label ?? 'Chữ';
              return (
                <option key={b.blockId} value={b.blockId}>
                  {translateUi(`Khối ${b.index + 1}`)} · {translateUi(label)}
                </option>
              );
            })}
          </select>
          <small style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'block' }}>
            {translateUi('Học viên trả lời sai câu này sẽ được điều hướng ôn lại khối học liệu.')}
          </small>
        </div>

        <div>
          <label className="pa-cb-field-label" htmlFor={`explanation-${question.questionId}`}>
            <span>{translateUi('Giải thích (hiện sau khi trả lời)')}</span>
          </label>
          <input
            id={`explanation-${question.questionId}`}
            className="pa-cb-input"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            maxLength={1000}
            style={{ fontSize: 13.5 }}
            placeholder={translateUi('Giải thích lý do phương án đúng...')}
          />
        </div>
      </div>

      {!complete && (
        <p style={{ margin: '6px 0 0', fontSize: 12.5, color: '#d97706' }}>
          {translateUi('Có thể lưu nháp; khi công bố chính thức, câu hỏi và mọi phương án đều cần nội dung.')}
        </p>
      )}

      <div className="pa-row-between" style={{ marginTop: 12 }}>
        {confirmDelete ? (
          <div className="button-row">
            <button type="button" className="btn btn-small pa-danger" onClick={remove}>
              {translateUi('Xóa câu hỏi này')}
            </button>
            <button type="button" className="btn btn-ghost btn-small" onClick={() => setConfirmDelete(false)}>
              {translateUi('Giữ lại')}
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-ghost btn-small pa-danger-text" onClick={() => setConfirmDelete(true)}>
            {translateUi('Xóa câu hỏi')}
          </button>
        )}
        <div className="button-row" style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-ghost btn-small" onClick={onClose}>
            {translateUi('Hủy')}
          </button>
          <button type="button" className="btn btn-primary btn-small" onClick={save} disabled={!valid || saving}>
            {saving ? translateUi('Đang lưu…') : translateUi('Lưu câu hỏi')}
          </button>
        </div>
      </div>
    </div>
  );
}
