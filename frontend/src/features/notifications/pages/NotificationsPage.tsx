import { useState } from 'react';
import { Bell, CheckCheck, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/use-platform';
import { formatDateTime } from '@/lib/utils';
import { PULSE_TOKENS } from '@/features/organization/owner-theme';
import { SectionLoading } from '@/components/shared/LoadingState';
import '@/features/organization/pages/owner-operations.css';

const PAGE_SIZE = 8;

export function NotificationsPage() {
  const { data: notifications = [], isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const visible = notifications.filter((item) => (filter === 'all' || !item.isRead) && `${item.title} ${item.message}`.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi')));
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const page = Math.min(pageIndex, totalPages);
  const currentItems = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return <div className="po-owner owner-operations -m-4 md:-m-6 min-h-screen" style={PULSE_TOKENS}><main className="owner-operations__shell">
    <header className="owner-operations__header"><div><span className="owner-operations__eyebrow">THÔNG BÁO</span><h1>Hoạt động</h1><p>Cập nhật về học tập, đánh giá và thay đổi trong tổ chức.</p></div>{unreadCount > 0 && <button className="owner-operations__secondary" type="button" disabled={markAllRead.isPending} onClick={() => markAllRead.mutate()}><CheckCheck size={18} /> Đánh dấu tất cả đã đọc</button>}</header>
    <section className="owner-operations__panel"><div className="owner-operations__section-head"><div><h2>Thông báo của bạn</h2><p>{unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Bạn đã đọc tất cả thông báo'}</p></div></div>
      <div className="owner-operations__activity-toolbar"><div className="owner-operations__tabs" role="group" aria-label="Lọc thông báo"><button type="button" className={filter === 'all' ? 'is-selected' : ''} onClick={() => { setFilter('all'); setPageIndex(1); }}>Tất cả <span>{notifications.length}</span></button><button type="button" className={filter === 'unread' ? 'is-selected' : ''} onClick={() => { setFilter('unread'); setPageIndex(1); }}>Chưa đọc <span>{unreadCount}</span></button></div><label className="owner-operations__search"><Search size={18} /><input type="search" aria-label="Tìm hoạt động" placeholder="Tìm thông báo" value={search} onChange={(event) => { setSearch(event.target.value); setPageIndex(1); }} /></label></div>
      {isLoading ? <SectionLoading label="Đang tải hoạt động" /> : isError ? <div className="owner-operations__empty"><Bell size={32} /><h3>Không thể tải thông báo</h3><button type="button" onClick={() => refetch()}>Thử lại</button></div> : visible.length === 0 ? <div className="owner-operations__empty"><Bell size={36} /><h3>{notifications.length === 0 ? 'Chưa có hoạt động' : 'Không có thông báo phù hợp'}</h3><p>{notifications.length === 0 ? 'Các cập nhật mới sẽ xuất hiện tại đây.' : 'Thử đổi bộ lọc hoặc từ khóa tìm kiếm.'}</p></div> : <div className="owner-operations__activity-list">{currentItems.map((item) => { const expanded = expandedId === item.id; return <div className={`owner-operations__activity ${item.isRead ? '' : 'is-unread'}`} key={item.id}><button type="button" className="owner-operations__activity-main" aria-expanded={expanded} onClick={() => { setExpandedId(expanded ? null : item.id); if (!item.isRead) markRead.mutate(item.id); }}><span className="owner-operations__activity-icon"><Bell size={18} /></span><span className="owner-operations__activity-text"><strong>{item.title}</strong><small>{formatDateTime(item.createdAt)}</small></span>{!item.isRead && <span className="owner-operations__activity-new">Mới</span>}{expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</button>{expanded && <div className="owner-operations__activity-detail">{item.message}</div>}</div>; })}</div>}
      {totalPages > 1 && <div className="owner-operations__pagination"><span>Trang {page} / {totalPages}</span><button type="button" disabled={page <= 1} onClick={() => setPageIndex(page - 1)}>Trước</button><button type="button" disabled={page >= totalPages} onClick={() => setPageIndex(page + 1)}>Sau</button></div>}
    </section>
  </main></div>;
}
