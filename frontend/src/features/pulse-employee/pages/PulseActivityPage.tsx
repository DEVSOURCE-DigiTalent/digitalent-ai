import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  BellOff,
  CheckCheck,
  Check,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  FileEdit,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/use-platform';
import { formatDateTime } from '@/lib/utils';
import { Empty, LoadError, PageSkeleton } from '../components/ui';
import { pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

type ActivityFilter = 'all' | 'unread' | 'action_needed';

/** Trung tâm hoạt động (§12.6): giao bài, nộp, chấm và phản hồi của chính nhân viên. */
export function PulseActivityPage() {
  const { data, isLoading, error, refetch } = useNotifications();
  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const unreadCount = data?.filter((n) => !n.isRead).length ?? 0;
  const actionCount = data?.filter((n) => {
    const t = (n.title + ' ' + n.message).toLowerCase();
    return t.includes('chỉnh sửa') || t.includes('chưa đạt') || t.includes('cần học') || t.includes('cần cải thiện');
  }).length ?? 0;

  const filteredData = (data ?? []).filter((item) => {
    if (filter === 'unread') return !item.isRead;
    if (filter === 'action_needed') {
      const t = (item.title + ' ' + item.message).toLowerCase();
      return t.includes('chỉnh sửa') || t.includes('chưa đạt') || t.includes('cần học') || t.includes('cần cải thiện');
    }
    return true;
  });

  return (
    <div className="pu-activity-container">
      {/* Header */}
      <div className="pu-activity-header">
        <div>
          <div className="pu-activity-badge">
            <Bell className="w-4 h-4 text-indigo-600" />
            <span>Trung tâm thông báo & Hoạt động</span>
          </div>
          <h1 className="pu-activity-h1">Nhật ký hoạt động học tập</h1>
          <p className="pu-activity-desc">
            Theo dõi tiến độ giao bài, phản hồi của người chấm, kết quả đánh giá và các cập nhật quan trọng trên lộ trình của bạn.
          </p>
        </div>

        <div>
          <button
            type="button"
            className="pu-act-btn-read"
            style={{
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 700,
              background: unreadCount > 0 ? '#0f172a' : '#f8fafc',
              color: unreadCount > 0 ? '#ffffff' : '#94a3b8',
              borderColor: unreadCount > 0 ? '#0f172a' : '#e2e8f0',
              cursor: unreadCount > 0 ? 'pointer' : 'default',
            }}
            disabled={!unreadCount || markAll.isPending}
            onClick={() =>
              markAll.mutate(undefined, {
                onSuccess: () => toast.success('Đã đánh dấu tất cả thông báo là đã đọc.'),
                onError: (err) => toast.error(pulseErrorMessage(err, 'Chưa đánh dấu được.')),
              })
            }
          >
            <CheckCheck className="w-4 h-4" />
            <span>Đánh dấu tất cả đã đọc {unreadCount > 0 ? `(${unreadCount})` : ''}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <PageSkeleton blocks={[80, 80, 80]} />
      ) : error || !data ? (
        <LoadError message={pulseErrorMessage(error, 'Không tải được hoạt động.')} onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <Empty icon={<BellOff size={24} />} title="Chưa có hoạt động nào">
          Thông báo về khóa học, bài nộp và quyết định của quản lý sẽ xuất hiện ở đây.
        </Empty>
      ) : (
        <>
          {/* Filter Bar */}
          <div className="pu-activity-filter-bar">
            <button
              type="button"
              className={`pu-act-filter-btn${filter === 'all' ? ' active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <span>Tất cả</span>
              <span className="pu-act-count-pill">{data.length}</span>
            </button>

            <button
              type="button"
              className={`pu-act-filter-btn${filter === 'unread' ? ' active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              <span>Chưa đọc</span>
              <span className="pu-act-count-pill">{unreadCount}</span>
            </button>

            <button
              type="button"
              className={`pu-act-filter-btn${filter === 'action_needed' ? ' active' : ''}`}
              onClick={() => setFilter('action_needed')}
            >
              <span>Cần xử lý</span>
              <span className="pu-act-count-pill">{actionCount}</span>
            </button>
          </div>

          {/* Feed List */}
          {filteredData.length === 0 ? (
            <div className="pu-surface pu-pad" style={{ textAlign: 'center', color: '#64748b', padding: '40px 20px' }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                Không có thông báo nào trong mục này.
              </p>
            </div>
          ) : (
            <div className="pu-act-feed">
              {filteredData.map((notification) => {
                const textLower = (notification.title + ' ' + notification.message).toLowerCase();
                const isWarning = textLower.includes('chỉnh sửa');
                const isNeedStudy = textLower.includes('chưa đạt') || textLower.includes('cần học') || textLower.includes('cần cải thiện');
                const isSuccess = textLower.includes('đạt') && !isNeedStudy;

                let iconType = 'info';
                let IconComponent = Bell;
                let categoryLabel = 'Cập nhật hệ thống';

                if (isWarning) {
                  iconType = 'warning';
                  IconComponent = AlertCircle;
                  categoryLabel = 'Yêu cầu sửa đổi';
                } else if (isNeedStudy) {
                  iconType = 'info';
                  IconComponent = BookOpen;
                  categoryLabel = 'Lộ trình học tập';
                } else if (isSuccess) {
                  iconType = 'success';
                  IconComponent = CheckCircle2;
                  categoryLabel = 'Đạt chuẩn năng lực';
                }

                return (
                  <div
                    key={notification.id}
                    className={`pu-act-card${notification.isRead ? '' : ' unread'}`}
                  >
                    <div className={`pu-act-icon ${iconType}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="pu-act-content">
                      <div className="pu-act-meta">
                        <span style={{ fontWeight: 700, color: '#334155' }}>{categoryLabel}</span>
                        <span>·</span>
                        <span>{formatDateTime(notification.createdAt)}</span>
                        {!notification.isRead && (
                          <>
                            <span>·</span>
                            <span style={{ color: '#4f46e5', fontWeight: 700 }}>Chưa đọc</span>
                          </>
                        )}
                      </div>

                      <div className="pu-act-title">{notification.title}</div>
                      <div className="pu-act-msg">{notification.message}</div>

                      {/* Action Buttons based on type */}
                      <div className="pu-act-actions">
                        {isWarning && (
                          <Link to={PULSE_PATHS.practice} className="pu-act-btn-action">
                            <FileEdit className="w-3.5 h-3.5" />
                            <span>Xem nhận xét & Chỉnh sửa bài làm →</span>
                          </Link>
                        )}
                        {isNeedStudy && (
                          <Link to={PULSE_PATHS.path} className="pu-act-btn-action">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Vào học chuyên đề này →</span>
                          </Link>
                        )}
                        {isSuccess && (
                          <Link to={PULSE_PATHS.outcomes} className="pu-act-btn-action">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Xem chứng nhận đã cấp →</span>
                          </Link>
                        )}
                      </div>
                    </div>

                    <div>
                      {!notification.isRead ? (
                        <button
                          type="button"
                          className="pu-act-btn-read"
                          onClick={() => markOne.mutate(notification.id)}
                          disabled={markOne.isPending}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã đọc</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
                          Đã xem
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
