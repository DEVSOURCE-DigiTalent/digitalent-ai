import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import './member-tabs.css';

export function MemberTabHeader({ title, count, icon }: { title: string; count?: number; icon: ReactNode }) {
  return <div className="member-tab-header"><div className="member-tab-heading"><span className="member-tab-heading-icon">{icon}</span><div><h2>{title}</h2>{count !== undefined && <span>{count} mục</span>}</div></div></div>;
}

export function MemberTabEmpty({ title, description, icon }: { title: string; description: string; icon?: ReactNode }) {
  return <div className="member-tab-empty"><span className="member-tab-empty-icon">{icon ?? <Inbox size={27} />}</span><h2>{title}</h2><p>{description}</p></div>;
}

export function MemberTabPager({ page, total, pageSize, onPageChange }: { page: number; total: number; pageSize: number; onPageChange: (page: number) => void }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  return <nav className="member-tab-pager" aria-label="Phân trang"><span>Hiển thị {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} / {total}</span><div><button type="button" aria-label="Trang trước" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={17} /></button><span>Trang {page}/{pages}</span><button type="button" aria-label="Trang sau" disabled={page >= pages} onClick={() => onPageChange(page + 1)}><ChevronRight size={17} /></button></div></nav>;
}
