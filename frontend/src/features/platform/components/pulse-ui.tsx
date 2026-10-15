import type { ReactNode } from 'react';
import { REASON_MIN, errorMessage } from './pulse-format';

/**
 * Building blocks of the Platform Admin console. They render the exact markup of the Pulse mock
 * (docs/ui-redesign/14-pulse-product-site: page(), box(), badge()…) so the mock's own CSS (pulse-mock.css) applies.
 */

export function PageHead({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

/** The mock's box(): a padded surface. */
export function Box({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={`surface pad ${className ?? ''}`}>{children}</section>;
}

export function Kpi({ label, value, hint, small }: { label: string; value: ReactNode; hint?: ReactNode; small?: boolean }) {
  return (
    <div className="surface kpi">
      <span>{label}</span>
      <strong style={small ? { fontSize: 21 } : undefined}>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  );
}

export type PillTone = 'green' | 'coral' | 'gray' | undefined;

/** The mock's badge(). */
export function Pill({ children, tone }: { children: ReactNode; tone?: PillTone }) {
  return <span className={`pill ${tone ?? ''}`}>{children}</span>;
}

export function ListItem({ title, detail, aside }: { title: ReactNode; detail?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="sideflow-list-item">
      <div>
        <strong>{title}</strong>
        {detail && <small>{detail}</small>}
      </div>
      {aside}
    </div>
  );
}

export function Footer() {
  return <div className="utility-footer">DigiTalent Pulse · Quản trị nền tảng</div>;
}

export function Loading() {
  return (
    <div className="stack" aria-busy="true" aria-label="Đang tải">
      <div className="pa-skeleton" />
      <div className="pa-skeleton" />
    </div>
  );
}

export function LoadError({ error }: { error: unknown }) {
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
  if (totalItems === 0) return null;
  return (
    <div className="pa-pager">
      <span>
        Trang {pageIndex}/{Math.max(totalPages, 1)} · {totalItems} mục
      </span>
      <div className="button-row">
        <button type="button" className="btn btn-outline btn-small" disabled={pageIndex <= 1} onClick={() => onChange(pageIndex - 1)}>
          Trước
        </button>
        <button type="button" className="btn btn-outline btn-small" disabled={pageIndex >= totalPages} onClick={() => onChange(pageIndex + 1)}>
          Sau
        </button>
      </div>
    </div>
  );
}

/** "Lý do ghi nhật ký" — required on every sensitive support action, as in the mock. */
export function ReasonField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const short = value.trim().length > 0 && value.trim().length < REASON_MIN;
  return (
    <>
      <label className="field">
        Lý do ghi nhật ký
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'Giải thích lý do cần thao tác hỗ trợ.'}
          minLength={REASON_MIN}
          maxLength={1000}
          required
        />
      </label>
      <p className={`field-hint ${short ? 'pa-error' : ''}`}>
        {short ? `Lý do cần ít nhất ${REASON_MIN} ký tự.` : `Bắt buộc, tối thiểu ${REASON_MIN} ký tự.`}
      </p>
    </>
  );
}
