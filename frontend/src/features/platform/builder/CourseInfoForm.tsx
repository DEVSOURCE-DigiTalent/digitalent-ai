import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { useFramework, useFrameworks } from '@/hooks/use-platform-catalog';
import { platformCatalogService, type CatalogCourseDetail, type CatalogSalesStatus } from '@/services/platform-catalog.service';
import { LEVEL_NAMES, errorMessage } from '../components/pulse-format';
import type { CourseEdit } from './builder-types';

const CODE_PATTERN = /^[A-Z0-9][A-Z0-9-]{1,29}$/;

/** Course details of the builder: code (until first published), framework, domain, level, title, outcome, price, sales. */
export function CourseInfoForm({
  course,
  editable,
  edit,
  onNext,
  onAddModule,
}: {
  course: CatalogCourseDetail;
  editable: boolean;
  edit: CourseEdit;
  onNext: () => void;
  onAddModule: () => void;
}) {
  const initial = {
    code: course.code,
    frameworkId: course.frameworkId,
    domainId: course.domainId,
    level: course.level,
    title: course.title,
    outcome: course.outcome,
    pricePerSeat: course.pricePerSeat,
    salesStatus: course.salesStatus,
  };
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const frameworks = useFrameworks();
  const framework = useFramework(form.frameworkId);
  const domains = framework.data?.domains ?? [];
  const free = form.level === 1;

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const codeValid = !course.codeEditable || CODE_PATTERN.test(form.code.trim().toUpperCase());
  const valid = codeValid && form.title.trim().length >= 3 && Boolean(form.domainId) && form.pricePerSeat >= 0;

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    edit((v, c) =>
      platformCatalogService.updateCourse(v, c, {
        code: course.codeEditable ? form.code.trim().toUpperCase() : undefined,
        title: form.title.trim(),
        outcome: form.outcome.trim(),
        domainId: form.domainId,
        level: form.level,
        pricePerSeat: free ? 0 : form.pricePerSeat,
        salesStatus: form.salesStatus,
      }),
    )
      .then(() => toast.success('Đã lưu thông tin khóa học.'))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setSaving(false));
  };

  return (
    <form className="surface pad" onSubmit={onSubmit} aria-labelledby="course-info-title">
      <div className="pa-card-head">
        <h2 id="course-info-title" className="panel-title">
          Thông tin khóa học
        </h2>
        {!course.codeEditable && <small className="pa-hint">Mã {course.code} giữ nguyên giữa các phiên bản</small>}
      </div>
      <fieldset disabled={!editable} className="pa-fieldset">
        <div className="pa-fields-3">
          <label className="field">
            Khung chuẩn
            <select
              value={form.frameworkId}
              onChange={(e) => setForm((f) => ({ ...f, frameworkId: e.target.value, domainId: '' }))}
            >
              {(frameworks.data?.items ?? [{ id: course.frameworkId, name: course.frameworkName }]).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Lĩnh vực
            <select value={form.domainId} onChange={(e) => set('domainId', e.target.value)} required>
              <option value="" disabled>
                {framework.isLoading ? 'Đang tải…' : 'Chọn lĩnh vực'}
              </option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Cấp độ
            <select value={form.level} onChange={(e) => set('level', Number(e.target.value))}>
              {[1, 2, 3].map((l) => (
                <option key={l} value={l}>
                  {LEVEL_NAMES[l]}
                </option>
              ))}
            </select>
          </label>
        </div>
        {course.codeEditable && (
          <label className="field">
            Mã khóa học
            <input value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} maxLength={30} required />
            <small className={`field-hint ${codeValid ? '' : 'pa-error'}`}>
              Chữ in hoa, chữ số, dấu gạch ngang (VD: AI1-F). Khóa lại khi khóa học được công bố lần đầu.
            </small>
          </label>
        )}
        <label className="field">
          Tên khóa học
          <input value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={250} required minLength={3} />
        </label>
        <label className="field">
          Kết quả học
          <textarea value={form.outcome} onChange={(e) => set('outcome', e.target.value)} maxLength={4000} />
          <small className="field-hint">Hiện trên trang khóa học cho doanh nghiệp và nhân viên. Cần ít nhất 10 ký tự trước khi công bố.</small>
        </label>
        <div className="inline-fields">
          <label className="field">
            Giá mỗi suất (VND)
            <input
              type="number"
              min={0}
              step={1000}
              value={free ? 0 : form.pricePerSeat}
              onChange={(e) => set('pricePerSeat', Number(e.target.value))}
              disabled={free}
            />
            <small className="field-hint">{free ? 'Khóa Cơ bản luôn miễn phí.' : 'Áp dụng khi phiên bản này được công bố.'}</small>
          </label>
          <label className="field">
            Trạng thái bán
            <select value={form.salesStatus} onChange={(e) => set('salesStatus', e.target.value as CatalogSalesStatus)}>
              <option value="OPEN">Đang mở bán</option>
              <option value="PAUSED">Tạm ngưng bán</option>
            </select>
          </label>
        </div>
      </fieldset>
      {editable && (
        <div className="pa-row-between">
          <button type="submit" className="btn btn-primary" disabled={!dirty || !valid || saving}>
            {saving ? 'Đang lưu…' : 'Lưu thông tin'}
          </button>
          {course.modules.length > 0 ? (
            <button type="button" className="btn btn-light" onClick={onNext} disabled={dirty}>
              Tiếp: soạn mô đun →
            </button>
          ) : (
            <button type="button" className="btn btn-light" onClick={onAddModule} disabled={dirty}>
              + Thêm mô đun đầu tiên
            </button>
          )}
        </div>
      )}
    </form>
  );
}
