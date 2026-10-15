import { useState } from 'react';
import { toast } from 'sonner';
import { platformCatalogService, type CatalogCourseDetail } from '@/services/platform-catalog.service';
import { errorMessage } from '../components/pulse-format';
import type { CourseEdit } from './builder-types';
import { RichTextEditor } from './RichTextEditor';

const MAX_CRITERIA = 10;

/** The course-final assignment: title, brief (rich text) and the criteria the department manager grades. */
export function FinalEditor({ course, editable, edit }: { course: CatalogCourseDetail; editable: boolean; edit: CourseEdit }) {
  const initial = { title: course.final.title, promptHtml: course.final.promptHtml, criteria: course.final.criteria };
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const valid = form.title.trim().length > 0;

  const setCriterion = (index: number, value: string) =>
    setForm((f) => ({ ...f, criteria: f.criteria.map((c, i) => (i === index ? value : c)) }));

  const save = () => {
    setSaving(true);
    edit((v, c) =>
      platformCatalogService.updateFinal(v, c, {
        title: form.title.trim(),
        promptHtml: form.promptHtml,
        criteria: form.criteria.map((c) => c.trim()).filter(Boolean),
      }),
    )
      .then(() => toast.success('Đã lưu bài cuối khóa.'))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setSaving(false));
  };

  return (
    <section className="surface pad" aria-labelledby="final-title">
      <div className="pa-card-head">
        <h2 id="final-title" className="panel-title">
          Bài cuối khóa
        </h2>
        <span className="pill pa-pill-gold">Quản lý phòng ban chấm · tối đa 2 lần nộp</span>
      </div>
      <label className="field">
        Tên bài
        <input value={form.title} readOnly={!editable} maxLength={250} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </label>
      <div className="field">
        <span>Đề bài</span>
        {editable ? (
          <RichTextEditor label="Đề bài cuối khóa" value={form.promptHtml} onChange={(html) => setForm((f) => ({ ...f, promptHtml: html }))} />
        ) : form.promptHtml ? (
          <div className="pa-rich pa-rich-box" dangerouslySetInnerHTML={{ __html: form.promptHtml }} />
        ) : (
          <p className="pa-empty">Chưa có đề bài.</p>
        )}
      </div>
      <span className="mini-label">Tiêu chí chấm (quản lý đánh giá từng tiêu chí)</span>
      <div className="pa-criteria">
        {form.criteria.map((criterion, index) => (
          <div className="pa-criterion" key={index}>
            <b>{String(index + 1).padStart(2, '0')}</b>
            <input
              className="pa-input"
              value={criterion}
              readOnly={!editable}
              maxLength={250}
              onChange={(e) => setCriterion(index, e.target.value)}
              aria-label={`Tiêu chí ${index + 1}`}
            />
            {editable && (
              <button
                type="button"
                className="btn btn-ghost btn-small pa-danger-text"
                aria-label={`Xóa tiêu chí ${index + 1}`}
                disabled={form.criteria.length <= 1}
                onClick={() => setForm((f) => ({ ...f, criteria: f.criteria.filter((_, i) => i !== index) }))}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      {editable && (
        <div className="button-row pa-gap-top">
          <button
            type="button"
            className="btn btn-outline btn-small"
            disabled={form.criteria.length >= MAX_CRITERIA}
            onClick={() => setForm((f) => ({ ...f, criteria: [...f.criteria, ''] }))}
          >
            + Tiêu chí
          </button>
        </div>
      )}
      <div className="notice pa-gap-top">
        Nhân viên nộp bài sau khi đạt câu hỏi ôn tập của mọi mô đun. Lần 1 chưa đạt thì sửa rồi nộp lại; lần 2 chưa đạt thì bật cờ hỗ trợ.
      </div>
      {editable && (
        <div className="button-row pa-gap-top">
          <button type="button" className="btn btn-primary" onClick={save} disabled={!dirty || !valid || saving}>
            {saving ? 'Đang lưu…' : 'Lưu bài cuối khóa'}
          </button>
          {dirty && <small className="pa-hint">Có thay đổi chưa lưu.</small>}
        </div>
      )}
    </section>
  );
}
