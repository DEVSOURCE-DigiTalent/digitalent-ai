import { translateUi, useUiLanguage } from '@/lib/i18n';
import type { ReactNode } from 'react';
import { SectionLoading } from '@/components/shared/LoadingState';
import { REASON_MIN, errorMessage } from './pulse-format';

/**
 * Building blocks of the Platform Admin console. They render the exact markup of the Pulse mock
 * (docs/ui-redesign/14-pulse-product-site: page(), box(), badge()…) so the mock's own CSS (pulse-mock.css) applies.
 */

export function PageHead({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: string; actions?: ReactNode }) {
  useUiLanguage();
  return (
    <div className="page-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{translateUi(title)}</h1>
        {description && <p>{translateUi(description)}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

/** The mock's box(): a padded surface. */
export function Box({ children, className }: { children: ReactNode; className?: string }) {
  useUiLanguage();
  return <section className={`surface pad ${className ?? ''}`}>{children}</section>;
}

export function Kpi({ label, value, hint, small }: { label: string; value: ReactNode; hint?: ReactNode; small?: boolean }) {
  useUiLanguage();
  return (
    <div className="surface kpi">
      <span>{translateUi(label)}</span>
      <strong style={small ? { fontSize: 21 } : undefined}>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  );
}

export type PillTone = 'green' | 'coral' | 'gray' | undefined;

/** The mock's badge(). */
export function Pill({ children, tone }: { children: ReactNode; tone?: PillTone }) {
  useUiLanguage();
  return <span className={`pill ${tone ?? ''}`}>{children}</span>;
}

export function ListItem({ title, detail, aside }: { title: ReactNode; detail?: ReactNode; aside?: ReactNode }) {
  useUiLanguage();
  return (
    <div className="sideflow-list-item">
      <div>
        <strong>{translateUi(title)}</strong>
        {detail && <small>{detail}</small>}
      </div>
      {aside}
    </div>
  );
}

export function Footer() {
  useUiLanguage();
  return <div className="utility-footer">DigiTalent AI · {translateUi("Quản trị nền tảng")}</div>;
}

export function Loading() {
  useUiLanguage();
  return <SectionLoading label="Đang tải nội dung" count={2} />;
}

export function LoadError({ error }: { error: unknown }) {
  useUiLanguage();
  return <div className="notice warning">Không tải được dữ liệu: {errorMessage(error)}</div>;
}

export function Pager({
  pageIndex,
  totalPages,
  totalItems,
  onChange,
}: {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  onChange: (page: number) => void;
}) {
  useUiLanguage();
  if (totalItems === 0) return null;
  return (
    <div className="pa-pager">
      <span>{translateUi("Trang ")}{pageIndex}/{Math.max(totalPages, 1)} · {totalItems} mục
      </span>
      <div className="button-row">
        <button type="button" className="btn btn-outline btn-small" disabled={pageIndex <= 1} onClick={() => onChange(pageIndex - 1)}>{translateUi("Trước")}</button>
        <button type="button" className="btn btn-outline btn-small" disabled={pageIndex >= totalPages} onClick={() => onChange(pageIndex + 1)}>{translateUi("Sau")}</button>
      </div>
    </div>
  );
}

/** "Lý do ghi nhật ký" — required on every sensitive support action, as in the mock. */
export function ReasonField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  useUiLanguage();
  const short = value.trim().length > 0 && value.trim().length < REASON_MIN;
  return (
    <>
      <label className="field">
        Lý do ghi nhật ký
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={translateUi(placeholder ?? 'Giải thích lý do cần thao tác hỗ trợ.')}
          minLength={REASON_MIN}
          maxLength={1000}
          required
        />
      </label>
      <p className={`field-hint ${short ? 'pa-error' : ''}`}>
        {short ? translateUi(`Lý do cần ít nhất ${REASON_MIN} ký tự.`) : translateUi(`Bắt buộc, tối thiểu ${REASON_MIN} ký tự.`)}
      </p>
    </>
  );
}
