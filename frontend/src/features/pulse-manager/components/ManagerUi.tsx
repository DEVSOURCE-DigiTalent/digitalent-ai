import type { ReactNode } from 'react';
import { Users } from 'lucide-react';
import '@/features/pulse-employee/pulse.css';
import '@/features/pulse-employee/pulse-exam.css';
import '../manager.css';
import { Empty } from '@/features/pulse-employee/components/ui';

/** Khung chung của mọi trang quản lý: bộ .pu của Pulse với bảng màu quản lý. */
export function ManagerPage({ children, testId }: { children: ReactNode; testId?: string }) {
  return (
    <div className="pu pu-manager" data-testid={testId}>
      {children}
    </div>
  );
}

export interface KpiItem {
  value: ReactNode;
  label: string;
  /** Không có số liệu (chưa tải được / không có quyền): hiển thị mờ, không giả số 0. */
  muted?: boolean;
}

export function KpiRow({ items, label }: { items: KpiItem[]; label: string }) {
  return (
    <section className="pm-kpis" aria-label={label}>
      {items.map((item) => (
        <div key={item.label} className={`pm-kpi${item.muted ? ' muted' : ''}`}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </section>
  );
}

export function Initials({ name }: { name?: string | null }) {
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
  return (
    <Empty icon={<Users size={24} />} title="Bạn chưa phụ trách phòng ban nào.">
      Tài khoản quản lý chỉ xem dữ liệu của phòng ban mình phụ trách. Liên hệ chủ doanh nghiệp để được gán làm quản lý một
      phòng ban.
    </Empty>
  );
}
