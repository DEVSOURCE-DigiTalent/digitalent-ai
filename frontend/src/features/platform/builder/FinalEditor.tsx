import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { toast } from 'sonner';
import { platformCatalogService, type CatalogCourseDetail } from '@/services/platform-catalog.service';
import { errorMessage } from '../components/pulse-format';
import type { CourseEdit } from './builder-types';
import { RichTextEditor } from './RichTextEditor';
import { GraduationCap, FileText, CheckSquare, Plus, CheckCircle2, X } from 'lucide-react';

const MAX_CRITERIA = 10;

/** The course-final assignment: title, brief (rich text) and the criteria the department manager grades. */
export function FinalEditor({ course, editable, edit }: { course: CatalogCourseDetail; editable: boolean; edit: CourseEdit }) {
  useUiLanguage();
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
    <div className="stack" aria-labelledby="final-title">
      {/* ✦ BẢNG KHUNG 1: Cấu hình bài đánh giá */}
      <div className="pa-cb-panel">
        <div className="pa-cb-panel-head">
          <div>
            <div className="pa-cb-panel-title">
              <GraduationCap size={18} style={{ color: 'var(--pa-accent, #b85c24)' }} aria-hidden="true" />
              <h2 id="final-title" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                {translateUi('Bài cuối khóa')}
              </h2>
            </div>
            <div className="pa-cb-panel-desc">
              {translateUi('Bài thực hành nhân viên nộp sau khi học hết các mô đun.')}
            </div>
          </div>
          <span
            style={{
              fontSize: 12.5,
              padding: '4px 10px',
              borderRadius: 6,
              fontWeight: 600,
              background: 'var(--pa-accent-soft, #fef3e7)',
              color: 'var(--pa-accent-solid, #7c2d12)',
              border: '1px solid var(--pa-accent-border, #efc69b)',
            }}
          >
            {translateUi('Quản lý phòng ban chấm · Tối đa 2 lần nộp')}
          </span>
        </div>

        <div className="pa-cb-panel-body">
          <div>
            <label className="pa-cb-field-label" htmlFor="field-final-title">
              <span>{translateUi('Tên bài')} {editable && <span style={{ color: '#dc2626' }}>*</span>}</span>
            </label>
            <input
              id="field-final-title"
              className="pa-cb-input"
              value={form.title}
              readOnly={!editable}
              maxLength={250}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ fontWeight: 600, fontSize: 14.5 }}
              placeholder={translateUi('Nhập tên bài cuối khóa...')}
            />
          </div>
        </div>
      </div>

      {/* ✦ BẢNG KHUNG 2: Đề bài & Hướng dẫn thực hành */}
      <div className="pa-cb-panel">
        <div className="pa-cb-panel-head">
          <div>
            <div className="pa-cb-panel-title">
              <FileText size={18} style={{ color: 'var(--pa-accent, #b85c24)' }} aria-hidden="true" />
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                {translateUi('Đề bài')}
              </h2>
            </div>
            <div className="pa-cb-panel-desc">
              {translateUi('Tình huống và yêu cầu để nhân viên làm và nộp bài.')}
            </div>
          </div>
        </div>

        <div className="pa-cb-panel-body">
          {editable ? (
            <RichTextEditor
              label={translateUi('Đề bài cuối khóa')}
              value={form.promptHtml}
              onChange={(html) => setForm((f) => ({ ...f, promptHtml: html }))}
            />
          ) : form.promptHtml ? (
            <div className="pa-rich pa-rich-box" dangerouslySetInnerHTML={{ __html: form.promptHtml }} />
          ) : (
            <p style={{ margin: 0, padding: '16px 0', fontSize: 13, color: '#64748b' }}>
              {translateUi('Chưa có đề bài.')}
            </p>
          )}
        </div>
      </div>

      {/* ✦ BẢNG KHUNG 3: Tiêu chí chấm điểm (Rubric) */}
      <div className="pa-cb-panel">
        <div className="pa-cb-panel-head">
          <div>
            <div className="pa-cb-panel-title">
              <CheckSquare size={18} style={{ color: 'var(--pa-accent, #b85c24)' }} aria-hidden="true" />
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                {translateUi('Tiêu chí chấm')}
              </h2>
            </div>
            <div className="pa-cb-panel-desc">
              {translateUi('Quản lý phòng ban đánh giá từng tiêu chí đạt hoặc chưa đạt khi chấm bài của nhân viên.')}
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
            {translateUi(`${form.criteria.length} / ${MAX_CRITERIA} tiêu chí`)}
          </span>
        </div>

        <div className="pa-cb-panel-body">
          <div className="pa-criteria">
            {form.criteria.map((criterion, index) => (
              <div className="pa-cb-criterion-row" key={index}>
                <span className="pa-cb-criterion-badge">{String(index + 1).padStart(2, '0')}</span>
                <input
                  className="pa-cb-criterion-input"
                  value={criterion}
                  readOnly={!editable}
                  maxLength={250}
                  onChange={(e) => setCriterion(index, e.target.value)}
                  placeholder={translateUi(`Nhập tiêu chí chấm điểm ${index + 1}...`)}
                  aria-label={translateUi(`Tiêu chí ${index + 1}`)}
                />
                {editable && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-small pa-danger-text"
                    aria-label={translateUi(`Xóa tiêu chí ${index + 1}`)}
                    disabled={form.criteria.length <= 1}
                    onClick={() => setForm((f) => ({ ...f, criteria: f.criteria.filter((_, i) => i !== index) }))}
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {editable && (
            <div style={{ marginTop: 10 }}>
              <button
                type="button"
                className="btn btn-outline btn-small inline-flex items-center gap-1.5"
                disabled={form.criteria.length >= MAX_CRITERIA}
                onClick={() => setForm((f) => ({ ...f, criteria: [...f.criteria, ''] }))}
              >
                <Plus size={14} />
                <span>{translateUi('Thêm tiêu chí')}</span>
              </button>
            </div>
          )}

          <div className="pa-cb-notice-box">
            {translateUi(
              'Nhân viên nộp bài sau khi hoàn thành mọi mô đun của khóa học. Lần 1 chưa đạt thì chỉnh sửa và nộp lại; lần 2 chưa đạt sẽ chuyển trạng thái yêu cầu giảng viên hoặc quản lý hỗ trợ.',
            )}
          </div>
        </div>
      </div>

      {/* ✦ THANH TÁC VỤ CHÂN TRANG */}
      {editable && (
        <div className="pa-cb-action-footer">
          <span style={{ fontSize: 13, color: dirty ? '#d97706' : '#64748b', fontWeight: dirty ? 600 : 400 }}>
            {dirty ? translateUi('Có thay đổi chưa lưu.') : translateUi('Đã lưu mọi thay đổi.')}
          </span>
          <button
            type="button"
            className="btn btn-primary btn-small inline-flex items-center gap-1.5"
            onClick={save}
            disabled={!dirty || !valid || saving}
          >
            <CheckCircle2 size={14} />
            <span>{saving ? translateUi('Đang lưu…') : translateUi('Lưu bài cuối khóa')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
