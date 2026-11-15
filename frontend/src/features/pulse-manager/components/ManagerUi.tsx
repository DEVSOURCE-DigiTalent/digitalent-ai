import { translateUi, useUiLanguage } from '@/lib/i18n';
import type { ReactNode } from 'react';
import { Activity, Building2, Users } from 'lucide-react';
import '@/features/pulse-employee/pulse.css';
import '@/features/pulse-employee/pulse-exam.css';
import '../manager.css';
import './manager-owner-design.css';
import { Empty } from '@/features/pulse-employee/components/ui';

export function ManagerPage({ children, testId, ownerDesign = true }: { children: ReactNode; testId?: string; ownerDesign?: boolean }) {
  useUiLanguage();
  return (
    <div className={ownerDesign ? 'pu pu-manager manager-owner-page -m-4 md:-m-6' : 'pu pu-manager'}
      data-testid={testId}>
      {ownerDesign ? <div className="manager-owner-page__body">{children}</div> : children}
    </div>
  );
}

export interface KpiItem {
  value: ReactNode;
  label: string;
  icon?: ReactNode;
  status?: ReactNode;
  /** Không có số liệu (chưa tải được / không có quyền): hiển thị mờ, không giả số 0. */
  muted?: boolean;
}

export function KpiRow({ items, label }: { items: KpiItem[]; label: string }) {
  useUiLanguage();
  return (
    <section className="pm-kpis" aria-label={translateUi(label)}>
      {items.map((item) => (
        <div key={item.label} className={`pm-kpi${item.muted ? ' muted' : ''}`}>
          <div className="pm-kpi-heading">
            <span>{translateUi(item.label)}</span>
            <span className="pm-kpi-icon" aria-hidden="true">
              {item.icon ?? <Activity size={16} />}
            </span>
          </div>
          <strong>{item.value}</strong>
          {item.status && <div className="pm-kpi-status">{item.status}</div>}
        </div>
      ))}
    </section>
  );
}

export function ManagerPageHeader({ title, subtitle, scope, actions, featured }: {
  title: string; subtitle?: string; scope?: string; actions?: ReactNode; featured?: boolean;
}) {
  useUiLanguage();
  return (
    <header className="manager-page-heading" data-featured={featured || undefined}>
      <div>
        {scope && <span className="manager-page-heading__scope"><Building2 size={14} aria-hidden="true" />{scope}</span>}
        <h1>{translateUi(title)}</h1>
        {subtitle && <p>{translateUi(subtitle)}</p>}
      </div>
      {actions && <div className="pu-row manager-page-heading__actions">{actions}</div>}
    </header>
  );
}

export function Initials({ name }: { name?: string | null }) {
  useUiLanguage();
  const letters = (name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('');
  // Tên tiếng Việt: họ đứng đầu, tên đứng cuối → lấy chữ đầu và chữ cuối.
  const short = letters.length > 2 ? `${letters[0]}${letters[letters.length - 1]}` : letters;
  return <span className="pm-initials" aria-hidden>{short.toUpperCase() || 'NV'}</span>;
}

/** Quản lý chưa được gán làm trưởng phòng ban nào: mọi màn quản lý đều trống theo phạm vi. */
export function NoDepartment() {
  useUiLanguage();
  return (
    <Empty icon={<Users size={24} />} title="Bạn chưa phụ trách phòng ban nào.">
      Tài khoản quản lý chỉ xem dữ liệu của phòng ban mình phụ trách. Liên hệ chủ doanh nghiệp để được gán làm quản lý một
      phòng ban.
    </Empty>
  );
}
