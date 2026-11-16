import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { useFramework, useFrameworks } from '@/hooks/use-platform-catalog';
import { platformCatalogService, type CatalogCourseDetail } from '@/services/platform-catalog.service';
import { LEVEL_NAMES, errorMessage, formatMoney } from '../components/pulse-format';
import type { CourseEdit } from './builder-types';
import {
  Layers,
  BookOpen,
  DollarSign,
  ArrowRight,
  Lock,
  CheckCircle2,
  Plus,
  Check,
} from 'lucide-react';

const CODE_PATTERN = /^[A-Z0-9][A-Z0-9-]{1,29}$/;

const LEVEL_STYLES: Record<number, { bg: string; color: string; border: string }> = {
  1: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  2: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  3: { bg: '#fefce8', color: '#ca8a04', border: '#fef08a' },
};

const cleanFrameworkName = (name?: string) => {
  if (!name) return 'Khung chuẩn năng lực số doanh nghiệp';
  if (/thông tư|tt02/i.test(name)) return 'Khung chuẩn năng lực số doanh nghiệp';
  return name;
};

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
  useUiLanguage();
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

  const handleSelectLevel = (newLevel: number) => {
    setForm((f) => ({
      ...f,
      level: newLevel,
      pricePerSeat: newLevel === 1 ? 0 : f.pricePerSeat,
    }));
  };

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

  const levelStyle = LEVEL_STYLES[course.level] ?? { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };

  // ─────────────── CHẾ ĐỘ XEM CHUẨN HÓA (READ ONLY DATA SHEET) ───────────────
  if (!editable) {
    return (
      <div aria-labelledby="course-info-title">
        {/* Bảng khung 1: Chuẩn hóa & Phân loại */}
        <div className="pa-cb-panel">
          <div className="pa-cb-panel-head">
            <div>
              <div className="pa-cb-panel-title">
                <Layers size={18} style={{ color: 'var(--pa-accent, #b85c24)' }} aria-hidden="true" />
                <span>{translateUi('Chuẩn hóa & Phân loại')}</span>
              </div>
              <div className="pa-cb-panel-desc">
                {translateUi('Vị trí và cấp độ học phần trong khung chuẩn năng lực số.')}
              </div>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12.5,
                color: '#475569',
                background: '#f1f5f9',
                padding: '4px 10px',
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              <Lock size={13} aria-hidden="true" />
              <span>{translateUi(`Bản chuẩn hóa v${course.versionNo}`)}</span>
            </span>
          </div>

          <div className="pa-cb-panel-body">
            <div className="pa-cb-grid-4">
              <div className="pa-cb-meta-cell">
                <span className="pa-cb-meta-label">{translateUi('Khung chuẩn')}</span>
                <span className="pa-cb-meta-value">{cleanFrameworkName(course.frameworkName)}</span>
              </div>
              <div className="pa-cb-meta-cell">
                <span className="pa-cb-meta-label">{translateUi('Lĩnh vực năng lực')}</span>
                <span className="pa-cb-meta-value">{translateUi(course.domainName)}</span>
              </div>
              <div className="pa-cb-meta-cell">
                <span className="pa-cb-meta-label">{translateUi('Cấp độ đào tạo')}</span>
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      background: levelStyle.bg,
                      color: levelStyle.color,
                      border: `1px solid ${levelStyle.border}`,
                    }}
                  >
                    {translateUi(LEVEL_NAMES[course.level]) ?? course.levelName}
                  </span>
                </div>
              </div>
              <div className="pa-cb-meta-cell">
                <span className="pa-cb-meta-label">{translateUi('Mã học phần')}</span>
                <div>
                  <span className="pa-rp-version-badge" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    {course.code}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bảng khung 2: Nội dung & Chuẩn đầu ra */}
        <div className="pa-cb-panel">
          <div className="pa-cb-panel-head">
            <div>
              <div className="pa-cb-panel-title">
                <BookOpen size={18} style={{ color: 'var(--pa-accent, #b85c24)' }} aria-hidden="true" />
                <span>{translateUi('Nội dung & Chuẩn đầu ra')}</span>
              </div>
              <div className="pa-cb-panel-desc">
                {translateUi('Tên khóa học và kỹ năng đầu ra sau khi học viên hoàn thành.')}
              </div>
            </div>
          </div>

          <div className="pa-cb-panel-body">
            <div>
              <div className="pa-cb-meta-label" style={{ marginBottom: 4 }}>
                {translateUi('Tên khóa học')}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                {translateUi(course.title)}
              </div>
            </div>
            <div>
              <div className="pa-cb-meta-label" style={{ marginBottom: 6 }}>
                {translateUi('Chuẩn đầu ra sau khi hoàn thành')}
              </div>
              <div className="pa-cb-outcome-box">
                {course.outcome ? (
                  <span>{course.outcome}</span>
                ) : (
                  <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                    {translateUi('Chưa cập nhật kết quả đầu ra.')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bảng khung 3: Chính sách đào tạo & Phát hành */}
        <div className="pa-cb-panel">
          <div className="pa-cb-panel-head">
            <div>
              <div className="pa-cb-panel-title">
                <DollarSign size={18} style={{ color: 'var(--pa-accent, #b85c24)' }} aria-hidden="true" />
                <span>{translateUi('Chính sách đào tạo & Mở bán')}</span>
              </div>
              <div className="pa-cb-panel-desc">
                {translateUi('Học phí đào tạo mỗi suất và trạng thái tiếp nhận đăng ký.')}
              </div>
            </div>
          </div>

          <div className="pa-cb-panel-body">
            <div className="pa-cb-grid-2">
              <div className="pa-cb-meta-cell">
                <span className="pa-cb-meta-label">{translateUi('Học phí mỗi suất học')}</span>
                <span className="pa-cb-meta-value">
                  {course.level === 1 ? (
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>
                      {translateUi('Miễn phí')}
                    </span>
                  ) : (
                    <span>{formatMoney(course.pricePerSeat)}</span>
                  )}
                </span>
              </div>
              <div className="pa-cb-meta-cell">
                <span className="pa-cb-meta-label">{translateUi('Trạng thái mở bán')}</span>
                <div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '3px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: course.salesStatus === 'OPEN' ? '#f0fdf4' : '#fff7ed',
                      color: course.salesStatus === 'OPEN' ? '#16a34a' : '#c2410c',
                      border: `1px solid ${course.salesStatus === 'OPEN' ? '#bbf7d0' : '#fed7aa'}`,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: course.salesStatus === 'OPEN' ? '#16a34a' : '#ea580c',
                      }}
                    />
                    {course.salesStatus === 'OPEN' ? translateUi('Đang mở bán') : translateUi('Tạm ngưng bán')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pa-cb-action-footer">
          <span style={{ fontSize: 13, color: '#475569' }}>
            {course.modules.length > 0
              ? translateUi(`Học phần gồm ${course.modules.length} mô đun đào tạo chuẩn hóa.`)
              : translateUi('Học phần chưa có mô đun nào.')}
          </span>
          {course.modules.length > 0 && (
            <button
              type="button"
              className="btn btn-primary btn-small inline-flex items-center gap-1.5"
              onClick={onNext}
            >
              <span>{translateUi('Xem mô đun 01')}</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─────────────── CHẾ ĐỘ BIÊN SOẠN BẢN NHÁP (EDIT FORM 3 MODULAR PANELS) ───────────────
  return (
    <form onSubmit={onSubmit} aria-labelledby="course-info-title">
      {/* ✦ BẢNG KHUNG 1: Chuẩn hóa & Phân loại học phần */}
      <div className="pa-cb-panel">
        <div className="pa-cb-panel-head">
          <div>
            <div className="pa-cb-panel-title">
              <Layers size={18} style={{ color: 'var(--pa-accent, #b85c24)' }} aria-hidden="true" />
              <h2 id="course-info-title" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                {translateUi('Chuẩn hóa & Phân loại')}
              </h2>
            </div>
            <div className="pa-cb-panel-desc">
              {translateUi('Xác định vị trí và phân cấp học phần trong khung chuẩn năng lực số.')}
            </div>
          </div>
          {!course.codeEditable && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12.5,
                color: '#475569',
                background: '#f1f5f9',
                padding: '4px 10px',
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              <Lock size={13} className="text-slate-400" aria-hidden="true" />
              <span>{translateUi('Mã')} <strong style={{ fontFamily: 'monospace' }}>{course.code}</strong> {translateUi('(cố định)')}</span>
            </span>
          )}
        </div>

        <div className="pa-cb-panel-body">
          {/* Hàng 1: Khung chuẩn & Lĩnh vực */}
          <div className="pa-cb-grid-2">
            <div>
              <label className="pa-cb-field-label" htmlFor="field-framework">
                <span>{translateUi('Khung chuẩn năng lực')}</span>
              </label>
              <select
                id="field-framework"
                className="pa-cb-select"
                value={form.frameworkId}
                onChange={(e) => setForm((f) => ({ ...f, frameworkId: e.target.value, domainId: '' }))}
              >
                {(frameworks.data?.items ?? [{ id: course.frameworkId, name: course.frameworkName }]).map((f) => (
                  <option key={f.id} value={f.id}>
                    {cleanFrameworkName(f.name)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="pa-cb-field-label" htmlFor="field-domain">
                <span>{translateUi('Lĩnh vực năng lực')} <span style={{ color: '#ef4444' }}>*</span></span>
              </label>
              <select
                id="field-domain"
                className="pa-cb-select"
                value={form.domainId}
                onChange={(e) => set('domainId', e.target.value)}
                required
              >
                <option value="" disabled>
                  {framework.isLoading ? translateUi('Đang tải…') : translateUi('Chọn lĩnh vực')}
                </option>
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {translateUi(d.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hàng 2: Bộ 3 nút chọn Cấp độ 1 chạm */}
          <div>
            <div className="pa-cb-field-label">
              <span>{translateUi('Cấp độ đào tạo (Chọn 1 chạm)')}</span>
              <span style={{ fontSize: 12.5, color: '#475569' }}>
                {form.level === 1 ? translateUi('Khóa Cơ bản luôn miễn phí') : translateUi('Được thiết lập mức học phí')}
              </span>
            </div>
            <div className="pa-cb-level-seg" role="radiogroup" aria-label={translateUi('Cấp độ đào tạo')}>
              {[1, 2, 3].map((lvl) => {
                const isSelected = form.level === lvl;
                const lvlName = translateUi(LEVEL_NAMES[lvl]) ?? `Cấp độ ${lvl}`;
                return (
                  <button
                    key={lvl}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`pa-cb-level-btn is-level-${lvl} ${isSelected ? 'is-active' : ''}`}
                    onClick={() => handleSelectLevel(lvl)}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: lvl === 1 ? '#16a34a' : lvl === 2 ? '#2563eb' : '#d97706',
                      }}
                      aria-hidden="true"
                    />
                    <span>{lvlName}</span>
                    {isSelected && <Check size={14} style={{ marginLeft: 'auto' }} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hàng 3 (nếu cho sửa mã học phần ở bản tạo mới) */}
          {course.codeEditable && (
            <div>
              <label className="pa-cb-field-label" htmlFor="field-code">
                <span>{translateUi('Mã học phần')} <span style={{ color: '#ef4444' }}>*</span></span>
                <span style={{ fontSize: 12.5, color: '#475569' }}>{translateUi('Khóa lại khi công bố lần đầu')}</span>
              </label>
              <input
                id="field-code"
                className="pa-cb-input"
                value={form.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
                maxLength={30}
                required
                style={{ fontFamily: 'monospace' }}
              />
              <small className={`field-hint ${codeValid ? '' : 'pa-error'}`} style={{ marginTop: 4, display: 'block', fontSize: 12.5 }}>
                {translateUi('Chữ in hoa, chữ số, dấu gạch nối (VD: M1-F).')}
              </small>
            </div>
          )}
        </div>
      </div>

      {/* ✦ BẢNG KHUNG 2: Nội dung & Chuẩn đầu ra */}
      <div className="pa-cb-panel">
        <div className="pa-cb-panel-head">
          <div>
            <div className="pa-cb-panel-title">
              <BookOpen size={18} style={{ color: 'var(--pa-accent, #b85c24)' }} aria-hidden="true" />
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                {translateUi('Nội dung & Mục tiêu đào tạo')}
              </h2>
            </div>
            <div className="pa-cb-panel-desc">
              {translateUi('Tên khóa học và kết quả đạt được hiển thị cho học viên và doanh nghiệp.')}
            </div>
          </div>
        </div>

        <div className="pa-cb-panel-body">
          <div>
            <label className="pa-cb-field-label" htmlFor="field-title">
              <span>{translateUi('Tên khóa học')} <span style={{ color: '#ef4444' }}>*</span></span>
              <span style={{ fontSize: 12.5, color: '#475569' }}>{form.title.length}/250</span>
            </label>
            <input
              id="field-title"
              className="pa-cb-input"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              maxLength={250}
              required
              minLength={3}
              style={{ fontWeight: 600, fontSize: 14.5 }}
              placeholder={translateUi('Nhập tên khóa học chuẩn hóa...')}
            />
          </div>

          <div>
            <label className="pa-cb-field-label" htmlFor="field-outcome">
              <span>{translateUi('Chuẩn đầu ra sau khi hoàn thành')}</span>
              <span style={{ fontSize: 12.5, color: form.outcome.length < 10 ? '#c2410c' : '#475569' }}>
                {form.outcome.length}/4000 {form.outcome.length < 10 ? translateUi('(tối thiểu 10 ký tự)') : ''}
              </span>
            </label>
            <textarea
              id="field-outcome"
              className="pa-cb-textarea"
              value={form.outcome}
              onChange={(e) => set('outcome', e.target.value)}
              maxLength={4000}
              rows={4}
              placeholder={translateUi('VD: Học viên nắm vững cách tìm kiếm dữ liệu chính xác, phân biệt nguồn tin cậy và lưu trữ có hệ thống...')}
            />
            <span style={{ fontSize: 13, color: '#475569', marginTop: 5, display: 'block' }}>
              {translateUi('Hiển thị trên trang giới thiệu khóa học cho doanh nghiệp và nhân viên trước khi bắt đầu học.')}
            </span>
          </div>
        </div>
      </div>

      {/* ✦ BẢNG KHUNG 3: Chính sách đào tạo & Phát hành */}
      <div className="pa-cb-panel">
        <div className="pa-cb-panel-head">
          <div>
            <div className="pa-cb-panel-title">
              <DollarSign size={18} style={{ color: 'var(--pa-accent, #b85c24)' }} aria-hidden="true" />
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                {translateUi('Chính sách đào tạo & Mở bán')}
              </h2>
            </div>
            <div className="pa-cb-panel-desc">
              {translateUi('Thiết lập mức học phí mỗi suất và trạng thái kinh doanh của học phần.')}
            </div>
          </div>
        </div>

        <div className="pa-cb-panel-body">
          <div className="pa-cb-grid-2">
            {/* Cột 1: Học phí */}
            <div>
              <label className="pa-cb-field-label" htmlFor="field-price">
                <span>{translateUi('Học phí mỗi suất (VND)')}</span>
                {free && (
                  <span style={{ fontSize: 12.5, color: '#16a34a', fontWeight: 600 }}>
                    {translateUi('Miễn phí theo chuẩn')}
                  </span>
                )}
              </label>
              <div className="pa-cb-price-input-wrap">
                <input
                  id="field-price"
                  type="number"
                  min={0}
                  step={1000}
                  className="pa-cb-input"
                  value={free ? 0 : form.pricePerSeat}
                  onChange={(e) => set('pricePerSeat', Number(e.target.value))}
                  disabled={free}
                  style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}
                />
                <span className="pa-cb-price-suffix">₫</span>
              </div>
              <small style={{ fontSize: 13, color: '#475569', marginTop: 5, display: 'block' }}>
                {free
                  ? translateUi('Cấp độ Cơ bản luôn miễn phí đào tạo toàn hệ thống.')
                  : translateUi('Mức giá áp dụng khi phiên bản này được công bố chính thức.')}
              </small>
            </div>

            {/* Cột 2: Thẻ chọn trạng thái trực quan */}
            <div>
              <div className="pa-cb-field-label">
                <span>{translateUi('Trạng thái mở bán')}</span>
              </div>
              <div className="pa-cb-status-cards" role="radiogroup" aria-label={translateUi('Trạng thái mở bán')}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={form.salesStatus === 'OPEN'}
                  className={`pa-cb-status-card ${form.salesStatus === 'OPEN' ? 'is-active is-open' : ''}`}
                  onClick={() => set('salesStatus', 'OPEN')}
                >
                  <span className="pa-cb-status-card-dot is-open" aria-hidden="true" />
                  <div>
                    <div className="pa-cb-status-card-title">{translateUi('Đang mở bán')}</div>
                    <div className="pa-cb-status-card-desc">{translateUi('Mở đăng ký đào tạo')}</div>
                  </div>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={form.salesStatus === 'PAUSED'}
                  className={`pa-cb-status-card ${form.salesStatus === 'PAUSED' ? 'is-active is-paused' : ''}`}
                  onClick={() => set('salesStatus', 'PAUSED')}
                >
                  <span className="pa-cb-status-card-dot is-paused" aria-hidden="true" />
                  <div>
                    <div className="pa-cb-status-card-title">{translateUi('Tạm ngưng bán')}</div>
                    <div className="pa-cb-status-card-desc">{translateUi('Tạm dừng tiếp nhận')}</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✦ THANH TÁC VỤ CHÂN TRANG (ACTION FOOTER) */}
      <div className="pa-cb-action-footer">
        <button
          type="submit"
          className="btn btn-primary btn-small inline-flex items-center gap-1.5"
          disabled={!dirty || !valid || saving}
        >
          <CheckCircle2 size={14} />
          <span>{saving ? translateUi('Đang lưu…') : translateUi('Lưu thay đổi')}</span>
        </button>

        {course.modules.length > 0 ? (
          <button
            type="button"
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            onClick={onNext}
            disabled={dirty}
          >
            <span>{translateUi('Tiếp: soạn mô đun 01')}</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            onClick={onAddModule}
            disabled={dirty}
          >
            <Plus size={14} />
            <span>{translateUi('Thêm mô đun đầu tiên')}</span>
          </button>
        )}
      </div>
    </form>
  );
}
