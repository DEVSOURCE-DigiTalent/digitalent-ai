import { Bell, CheckCheck } from 'lucide-react';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/use-platform';
import { formatDateTime } from '@/lib/utils';
import { Empty, LoadError, PageHead, PageSkeleton } from '@/features/pulse-employee/components/ui';
import { btn } from '@/features/pulse-employee/lib/button';
import { ManagerPage } from '../components/ManagerUi';

/**
 * Hoạt động của quản lý (SHR-03, mock `#/notifications`): cùng dữ liệu và thao tác với trang thông báo chung
 * (bấm một mục chưa đọc để đánh dấu đã đọc, đánh dấu tất cả), trình bày theo Pulse.
 */
export function ManagerActivityPage() {
  const { data: notifications = [], isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <ManagerPage testId="manager-activity">
      <PageHead
        eyebrow="Trung tâm hoạt động"
        title="Luôn thấy bước tiếp theo."
        description="Bài được giao, đánh giá, phê duyệt và thay đổi tổ chức đều có thể theo dõi tại đây."
        actions={
          unreadCount > 0 ? (
            <button type="button" className={btn('outline')} onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
              <CheckCheck size={16} /> Đánh dấu tất cả đã đọc
            </button>
          ) : undefined
        }
      />

      {isLoading ? (
        <PageSkeleton blocks={[64, 64, 64, 64]} />
      ) : isError ? (
        <LoadError message="Không thể tải thông báo." onRetry={() => refetch()} />
      ) : notifications.length === 0 ? (
        <Empty icon={<Bell size={24} />} title="Chưa có hoạt động.">
          Hoạt động sẽ hiển thị khi phòng ban của bạn bắt đầu học, nộp bài và nhận quyết định.
        </Empty>
      ) : (
        <section className="pm-panel" aria-label={`Hoạt động, ${unreadCount} chưa đọc`}>
          <ul className="pm-activity">
            {notifications.map((item) => {
              const body = (
                <>
                  <span className="pm-activity-dot" aria-hidden />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.message}</p>
                  </div>
                  <time dateTime={item.createdAt}>{formatDateTime(item.createdAt)}</time>
                </>
              );
              return (
                <li key={item.id}>
                  {item.isRead ? (
                    <div className="pm-activity-item">{body}</div>
                  ) : (
                    <button
                      type="button"
                      className="pm-activity-item unread"
                      onClick={() => markRead.mutate(item.id)}
                      aria-label={`${item.title} — chưa đọc, bấm để đánh dấu đã đọc`}
                    >
                      {body}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="pu-footer-note" style={{ marginTop: 14 }}>
            {unreadCount > 0
              ? `${unreadCount} hoạt động mới chưa được đánh dấu đã đọc.`
              : `Đã đọc đến ${formatDateTime(notifications[0]?.createdAt)}.`}
          </p>
        </section>
      )}
    </ManagerPage>
  );
}
