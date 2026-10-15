import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/use-platform';
import { formatDateTime } from '@/lib/utils';

const PULSE_TOKENS = {
  '--po-canvas': '#f7f9fd',
  '--po-surface': '#fff',
  '--po-ink': '#172442',
  '--po-muted': '#62718d',
  '--po-accent': '#304bdf',
  '--po-accent-strong': '#203bbf',
  '--po-coral': '#ef735c',
  '--po-line': '#dfe6f3',
  '--po-soft': '#eef2ff',
  '--po-tint': '#edf1ff',
} as React.CSSProperties;

export function NotificationsPage() {
  const { data: notifications = [], isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkItem = (id: string, isRead: boolean) => {
    if (!isRead) markRead.mutate(id);
  };

  return (
    <div
      className="-m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'var(--po-canvas)',
        backgroundImage:
          'radial-gradient(ellipse 80% 55% at 50% 0%, #dce5ff 0%, transparent 65%)',
      }}
    >
      {/* ── Page header ── */}
      <section
        className="px-4 md:px-6 pt-8 pb-2 mx-auto"
        style={{ maxWidth: 1220 }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.12em]"
          style={{ color: 'var(--po-muted)' }}
        >
          Hoạt động
          <span
            className="ml-[7px] inline-block size-1.5 rounded-full align-middle"
            style={{ background: 'var(--po-coral)' }}
          />
        </p>
        <h1
          className="mt-[11px] text-[clamp(26px,3.4vw,42px)] font-bold leading-[1.08]"
          style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}
        >
          Trung tâm hoạt động.
        </h1>
        <p
          className="mt-2 text-sm leading-relaxed max-w-[58ch]"
          style={{ color: 'var(--po-muted)' }}
        >
          Bài được giao, đánh giá, phê duyệt và thay đổi tổ chức đều có thể theo
          dõi tại đây.
        </p>

        {unreadCount > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="inline-flex items-center gap-2 rounded-[11px] border px-4 py-2.5 text-xs font-extrabold transition-transform hover:-translate-y-0.5"
              style={{
                borderColor: 'var(--po-line)',
                color: 'var(--po-ink)',
                background: 'var(--po-surface)',
              }}
            >
              <CheckCheck className="size-4" style={{ color: 'var(--po-accent)' }} />
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        )}
      </section>

      {/* ── Activity list ── */}
      <div className="px-4 md:px-6 py-5 mx-auto" style={{ maxWidth: 1220 }}>
        <section
          className="rounded-[22px] border p-6"
          style={{
            borderColor: 'var(--po-line)',
            background: 'var(--po-surface)',
            boxShadow: '0 10px 35px rgba(29,48,102,.025)',
          }}
        >
          {isLoading ? (
            <p className="text-xs py-8 text-center" style={{ color: 'var(--po-muted)' }}>
              Đang tải hoạt động…
            </p>
          ) : isError ? (
            <div className="py-8 text-center">
              <p className="text-xs font-medium" style={{ color: 'var(--po-coral)' }}>
                Không thể tải thông báo.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-2 text-xs underline font-semibold"
                style={{ color: 'var(--po-accent)' }}
              >
                Thử lại
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell
                className="size-8 mx-auto mb-2"
                style={{ color: 'var(--po-line)' }}
              />
              <p className="text-xs" style={{ color: 'var(--po-muted)' }}>
                Hoạt động sẽ hiển thị khi tổ chức vận hành hệ thống.
              </p>
            </div>
          ) : (
            <div className="grid">
              {notifications.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkItem(item.id, item.isRead)}
                  className="flex items-center gap-[15px] py-[15px] cursor-pointer"
                  style={{
                    borderBottom:
                      idx < notifications.length - 1
                        ? '1px solid var(--po-line)'
                        : 'none',
                  }}
                >
                  <span
                    className="shrink-0 size-[9px] rounded-full"
                    style={{
                      background: item.isRead
                        ? 'var(--po-line)'
                        : 'var(--po-accent)',
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <strong
                      className="block text-xs"
                      style={{
                        color: 'var(--po-ink)',
                        opacity: item.isRead ? 0.6 : 1,
                      }}
                    >
                      {item.title}
                    </strong>
                    <small
                      className="block mt-1 text-[10px] leading-[1.45]"
                      style={{ color: 'var(--po-muted)' }}
                    >
                      {item.message} · {formatDateTime(item.createdAt)}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && notifications.length > 0 && (
            <p className="mt-4 text-[11px]" style={{ color: '#789' }}>
              {unreadCount > 0
                ? 'Có hoạt động mới chưa được đánh dấu đã đọc.'
                : `Đã đọc đến ${formatDateTime(notifications[0]?.createdAt)}.`}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
