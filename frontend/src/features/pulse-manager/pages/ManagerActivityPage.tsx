import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, ClipboardList, GraduationCap, Search, Timer } from 'lucide-react';
import { SectionLoading } from '@/components/shared/LoadingState';
import { translateUi, uiLocale, useUiLanguage } from '@/lib/i18n';
import { useCurrentUser } from '@/hooks/use-current-user';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { useMarkAllNotificationsRead, useMarkNotificationRead } from '@/hooks/use-platform';
import { formatDate, formatDateTime } from '@/lib/utils';
import { platformService, type NotificationDto } from '@/services/platform.service';
import { Empty, LoadError } from '@/features/pulse-employee/components/ui';
import { btn } from '@/features/pulse-employee/lib/button';
import { ManagerPage, ManagerPageHeader } from '../components/ManagerUi';
import './manager-activity.css';

const PAGE_SIZE = 10;
const API_PAGE_SIZE = 100;

function displayTitle(item: NotificationDto) {
  switch (item.title) {
    case 'Có bài cuối khóa cần chấm': return 'Nhân viên đã nộp bài cuối khóa';
    case 'Có bài đánh giá trước khi học cần chấm': return 'Nhân viên đã nộp bài đánh giá trước khi học';
    default: return item.title;
  }
}

function appearance(type: string) {
  if (type === 'DEADLINE' || type === 'warning' || type === 'alert') return { Icon: Timer, tone: 'amber' };
  if (type === 'COURSE') return { Icon: GraduationCap, tone: 'blue' };
  if (type === 'ASSESSMENT' || type === 'PULSE_FINAL_SUBMITTED' || type === 'PULSE_PRE_ASSESSMENT_SUBMITTED') {
    return { Icon: ClipboardList, tone: 'violet' };
  }
  if (type === 'success') return { Icon: Check, tone: 'green' };
  return { Icon: Bell, tone: 'teal' };
}

const normalize = (value: string) => value.toLocaleLowerCase('vi').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd');

export function ManagerActivityPage() {
  useUiLanguage();
  const userId = useCurrentUser((state) => state.user?.id);
  const { can } = usePermission();
  const canMarkRead = can(PERMISSIONS.NOTIFICATION_MARK_READ);
  const { data: notifications = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications', 'manager-activity', userId],
    enabled: Boolean(userId),
    queryFn: async ({ signal }) => {
      const getPage = async (pageIndex: number) => (await platformService.getNotifications({ pageIndex, pageSize: API_PAGE_SIZE })).data.data;
      const first = await getPage(1);
      if (!first || Array.isArray(first)) return first ?? [];
      const items = [...first.items];
      for (let page = 2; page <= Math.ceil(first.total / first.pageSize); page += 1) {
        signal.throwIfAborted();
        const batch = await getPage(page);
        if (batch && !Array.isArray(batch)) items.push(...batch.items);
      }
      return Array.from(new Map(items.map((item) => [item.id, item])).values());
    },
  });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [feedback, setFeedback] = useState('');
  const busy = markRead.isPending || markAllRead.isPending;
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const query = normalize(search.trim());
  const results = notifications.filter((item) =>
    (!unreadOnly || !item.isRead) &&
    normalize(`${translateUi(displayTitle(item))} ${translateUi(item.message)}`).includes(query),
  ).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const lastPage = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);
  const start = (currentPage - 1) * PAGE_SIZE;
  const clock = new Intl.DateTimeFormat(uiLocale(), { hour: '2-digit', minute: '2-digit', hour12: false });
  const groups = results.slice(start, start + PAGE_SIZE).reduce((days, item) => {
    const date = formatDate(item.createdAt);
    const group = days.get(date) ?? [];
    group.push(item);
    days.set(date, group);
    return days;
  }, new Map<string, NotificationDto[]>());

  return (
    <ManagerPage testId="manager-activity">
      <ManagerPageHeader title="Hoạt động" actions={canMarkRead && unreadCount > 0 && (
        <button type="button" className={btn('outline')} disabled={busy} onClick={() => {
          setFeedback('');
          markRead.reset();
          markAllRead.mutate(undefined, { onSuccess: () => setFeedback('Đã đánh dấu tất cả là đã đọc.') });
        }}>
          <CheckCheck size={16} aria-hidden="true" />{translateUi('Đánh dấu tất cả đã đọc')}
        </button>
      )} />
      <div role="status" className="sr-only">{translateUi(feedback)}</div>
      {isLoading ? (
        <SectionLoading label="Đang tải hoạt động" count={4} />
      ) : isError ? (
        <LoadError message={translateUi('Không thể tải thông báo.')} onRetry={refetch} />
      ) : notifications.length === 0 ? (
        <Empty icon={<Bell size={24} />} title={translateUi('Chưa có thông báo.')} />
      ) : (
        <section className="manager-activity" aria-label={translateUi('Thông báo của bạn')}>
          <div className="manager-activity__toolbar">
            <div role="group" aria-label={translateUi('Lọc hoạt động')}>
              <button type="button" aria-pressed={!unreadOnly} onClick={() => { setUnreadOnly(false); setPage(1); }}>{translateUi('Tất cả')}</button>
              <button type="button" aria-pressed={unreadOnly} onClick={() => { setUnreadOnly(true); setPage(1); }}>
                {translateUi('Chưa đọc')} <span>{unreadCount}</span>
              </button>
            </div>
            <label>
              <Search size={16} aria-hidden="true" />
              <input type="search" aria-label={translateUi('Tìm thông báo')} placeholder={translateUi('Tìm thông báo')}
                value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
            </label>
          </div>
          {(markRead.isError || markAllRead.isError) && (
            <p className="manager-activity__error" role="alert">{translateUi('Chưa cập nhật được trạng thái đã đọc. Vui lòng thử lại.')}</p>
          )}
          {results.length === 0 ? (
            <div className="manager-activity__empty">
              <p role="status">{translateUi(unreadOnly && unreadCount === 0 ? 'Bạn đã đọc tất cả thông báo.' : 'Không tìm thấy thông báo phù hợp.')}</p>
              {search && <button type="button" onClick={() => { setSearch(''); setPage(1); }}>{translateUi('Xóa tìm kiếm')}</button>}
            </div>
          ) : (
            <>
              {Array.from(groups, ([date, items]) => (
                <div key={date}>
                  <h2 className="manager-activity__date">{date === '—' ? translateUi('Không rõ ngày') : date}</h2>
                  <ul>
                    {items.map((item) => {
                      const title = translateUi(displayTitle(item));
                      const { Icon, tone } = appearance(item.type);
                      return (
                        <li key={item.id} data-unread={!item.isRead}>
                          <span className={'manager-activity__icon ' + tone}><Icon size={17} aria-hidden="true" /></span>
                          <div className="manager-activity__body">
                            <h3>{title}</h3>
                            <p>{translateUi(item.message)}</p>
                          </div>
                          <div className="manager-activity__meta">
                            <time dateTime={item.createdAt} title={formatDateTime(item.createdAt)}>
                              {date === '—' ? '—' : clock.format(new Date(item.createdAt))}
                            </time>
                            {!item.isRead && (canMarkRead ? (
                              <button type="button" disabled={busy} aria-label={`${title} — ${translateUi('chưa đọc, đánh dấu là đã đọc')}`}
                                onClick={() => {
                                  setFeedback('');
                                  markAllRead.reset();
                                  markRead.mutate(item.id, { onSuccess: () => setFeedback('Đã đánh dấu thông báo là đã đọc.') });
                                }}>
                                <Check size={14} aria-hidden="true" />{translateUi('Đánh dấu đã đọc')}
                              </button>
                            ) : <span>{translateUi('Chưa đọc')}</span>)}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              <footer>
                <span role="status">{start + 1}–{Math.min(start + PAGE_SIZE, results.length)} / {results.length} {translateUi('thông báo')}</span>
                {lastPage > 1 && <nav aria-label={translateUi('Phân trang thông báo')}>
                  <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>{translateUi('Trang trước')}</button>
                  <span>{currentPage} / {lastPage}</span>
                  <button type="button" disabled={currentPage === lastPage} onClick={() => setPage(currentPage + 1)}>{translateUi('Trang sau')}</button>
                </nav>}
              </footer>
            </>
          )}
        </section>
      )}
    </ManagerPage>
  );
}
