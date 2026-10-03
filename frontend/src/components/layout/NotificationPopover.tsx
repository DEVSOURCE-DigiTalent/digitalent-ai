import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle2, ShieldAlert, ExternalLink } from 'lucide-react';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/use-platform';
import { formatDateTime } from '@/lib/utils';
import type { NotificationDto } from '@/services/platform.service';

interface NotificationPopoverProps {
  notificationsPath: string;
}

export function NotificationPopover({ notificationsPath }: NotificationPopoverProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const recentNotifications = notifications.slice(0, 5);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const renderIcon = (type: NotificationDto['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="size-4 text-amber-500 shrink-0" />;
      case 'alert':
        return <ShieldAlert className="size-4 text-red-600 shrink-0" />;
      default:
        return <Info className="size-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        title="Thông báo"
        aria-label={`Thông báo (${unreadCount} chưa đọc)`}
        aria-expanded={isOpen}
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-600 rounded-full border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900">Thông báo</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-medium text-primary-700 bg-primary-50 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
              >
                <CheckCheck className="size-3.5" />
                Đọc tất cả
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                Bạn chưa có thông báo nào
              </div>
            ) : (
              recentNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) markRead.mutate(n.id);
                    if (n.link) navigate(n.link);
                    setIsOpen(false);
                  }}
                  className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 items-start ${
                    !n.isRead ? 'bg-primary-50/30' : ''
                  }`}
                >
                  <div className="mt-0.5">{renderIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug truncate ${!n.isRead ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {formatDateTime(n.createdAt)}
                    </span>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
            <button
              type="button"
              onClick={() => {
                navigate(notificationsPath);
                setIsOpen(false);
              }}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1.5 py-1"
            >
              Xem tất cả thông báo
              <ExternalLink className="size-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
