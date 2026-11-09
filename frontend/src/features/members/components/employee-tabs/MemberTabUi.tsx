import { translateUi, useUiLanguage } from '@/lib/i18n';
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import './member-tabs.css';
import { OwnerFilterSelect } from '@/features/organization/components/OwnerFilterSelect';

export function MemberTabHeader({ title, count, icon, actions }: { title: string; count?: number; icon: ReactNode; actions?: ReactNode }) {
  useUiLanguage();
  return <div className="member-tab-header"><div className="member-tab-heading"><span className="member-tab-heading-icon">{icon}</span><div><h2>{translateUi(title)}</h2>{count !== undefined && <span>{count} mục</span>}</div></div>{actions}</div>;
}

export function MemberTabPageSize({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  useUiLanguage();
  return <div className="member-tab-page-size"><OwnerFilterSelect label="Số mục mỗi trang" value={String(value)} onChange={(next) => onChange(Number(next))} options={[5, 10, 15, 20].map((size) => ({ value: String(size), label: `${size} / trang` }))} /></div>;
}

export function MemberTabEmpty({ title, description, icon }: { title: string; description: string; icon?: ReactNode }) {
  useUiLanguage();
  return <div className="member-tab-empty"><span className="member-tab-empty-icon">{icon ?? <Inbox size={27} />}</span><h2>{translateUi(title)}</h2><p>{translateUi(description)}</p></div>;
}

export function MemberTabPager({ page, total, pageSize, onPageChange }: { page: number; total: number; pageSize: number; onPageChange: (page: number) => void }) {
  useUiLanguage();
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  return <nav className="member-tab-pager" aria-label="Phân trang"><span>{translateUi("Hiển thị ")}{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} / {total}</span><div><button type="button" aria-label={translateUi("Trang trước")} disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={17} /></button><span>{translateUi("Trang ")}{page}/{pages}</span><button type="button" aria-label={translateUi("Trang sau")} disabled={page >= pages} onClick={() => onPageChange(page + 1)}><ChevronRight size={17} /></button></div></nav>;
}
