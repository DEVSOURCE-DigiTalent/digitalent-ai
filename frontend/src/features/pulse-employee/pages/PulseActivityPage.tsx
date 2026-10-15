import { BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/use-platform';
import { formatDateTime } from '@/lib/utils';
import { Empty, LoadError, PageHead, PageSkeleton } from '../components/ui';
import { btn } from '../lib/button';
import { pulseErrorMessage } from '../lib/labels';

/** Trung tâm hoạt động (§12.6): giao bài, nộp, chấm và phản hồi của chính nhân viên. */
export function PulseActivityPage() {
  const { data, isLoading, error, refetch } = useNotifications();
  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();
  const unread = data?.filter((n) => !n.isRead).length ?? 0;

  return (
    <>
      <PageHead
        eyebrow="Trung tâm hoạt động"
        title="Luôn thấy bước tiếp theo."
        description="Bài được giao, bài đã nộp, quyết định của quản lý và phản hồi — tất cả ở một nơi."
        actions={
          <button
            type="button"
            className={btn('outline')}
            disabled={!unread || markAll.isPending}
            onClick={() => markAll.mutate(undefined, { onError: (err) => toast.error(pulseErrorMessage(err, 'Chưa đánh dấu được.')) })}
          >
            Đánh dấu tất cả đã đọc
          </button>
        }
      />
      {isLoading ? (
        <PageSkeleton blocks={[300]} />
      ) : error || !data ? (
        <LoadError message={pulseErrorMessage(error, 'Không tải được hoạt động.')} onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <Empty icon={<BellOff size={24} />} title="Chưa có hoạt động nào">
          Thông báo về khóa học, bài nộp và quyết định của quản lý sẽ xuất hiện ở đây.
        </Empty>
      ) : (
        <section className="pu-surface pu-pad">
          <div className="pu-list">
            {data.map((notification) => (
              <div key={notification.id} className={`pu-list-item${notification.isRead ? '' : ' unread'}`}>
                <span className="pu-event-dot" aria-hidden />
                <div>
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                  <small>{formatDateTime(notification.createdAt)}{notification.isRead ? '' : ' · chưa đọc'}</small>
                </div>
                {!notification.isRead && (
                  <button type="button" className={btn('ghost', true)} onClick={() => markOne.mutate(notification.id)} disabled={markOne.isPending}>
                    Đã đọc
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
