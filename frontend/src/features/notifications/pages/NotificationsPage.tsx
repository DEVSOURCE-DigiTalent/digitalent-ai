import { useState } from 'react';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/use-platform';
import { formatDateTime } from '@/lib/utils';
import type { NotificationDto } from '@/services/platform.service';

export function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data: notifications, isLoading, isError, refetch } = useNotifications({
    unreadOnly: unreadOnly ? true : undefined,
  });

  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const handleMarkItem = (id: string, isRead: boolean) => {
    if (!isRead) {
      markRead.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải thông báo hệ thống…</div>;
  }

  if (isError || !notifications) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <p className="font-medium">Không thể tải thông báo.</p>
        <button type="button" onClick={() => refetch()} className="mt-2 text-sm underline font-semibold">
          Thử lại
        </button>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderIcon = (type: NotificationDto['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="size-5 text-amber-500 shrink-0" />;
      case 'alert':
        return <ShieldAlert className="size-5 text-red-600 shrink-0" />;
      default:
        return <Info className="size-5 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Trung tâm thông báo"
          subtitle="Cập nhật tin tức hệ thống, biến động tài khoản và các hoạt động đào tạo quan trọng"
        />

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shrink-0 shadow-sm"
          >
            <CheckCheck className="size-4 text-primary-600" />
            Đánh dấu tất cả là đã đọc
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setUnreadOnly(false)}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium ${
            !unreadOnly ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả thông báo ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setUnreadOnly(true)}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium ${
            unreadOnly ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Chưa đọc ({unreadCount})
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500 bg-white">
          <Bell className="size-8 text-slate-300 mx-auto mb-2" />
          <p className="font-medium text-sm">Không có thông báo nào.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMarkItem(item.id, item.isRead)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                item.isRead
                  ? 'bg-white border-slate-200 hover:border-slate-300'
                  : 'bg-primary-50/40 border-primary-200 hover:border-primary-300'
              }`}
            >
              <div className="mt-0.5">{renderIcon(item.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-sm font-semibold ${item.isRead ? 'text-slate-800' : 'text-slate-900'}`}>
                    {item.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {formatDateTime(item.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
              </div>

              {!item.isRead && (
                <span className="size-2 rounded-full bg-primary-600 shrink-0 mt-2" title="Chưa đọc" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
