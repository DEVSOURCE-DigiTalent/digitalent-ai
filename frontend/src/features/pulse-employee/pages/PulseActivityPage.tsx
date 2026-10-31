import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  BellOff,
  CheckCheck,
  Check,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Search,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/use-platform';
import { formatDateTime } from '@/lib/utils';
import { Empty, LoadError, PageSkeleton } from '../components/ui';
import { pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

type ActivityFilter = 'all' | 'unread' | 'action_needed' | 'success';

interface ParsedNotification {
  id: string;
  category: 'warning' | 'study' | 'success' | 'system';
  categoryLabel: string;
  courseName?: string;
  displayTitle: string;
  explanation: string;
  reviewerNote?: string;
  actionText?: string;
  actionLink?: string;
  actionType?: 'warning' | 'primary' | 'success';
  createdAt: string;
  isRead: boolean;
  IconComponent: typeof Bell;
}

function normalizeCourseName(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  }
  return trimmed;
}

function parseNotificationItem(notification: {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}): ParsedNotification {
  const { id, title, message, createdAt, isRead } = notification;
  const rawText = (title + ' ' + message).toLowerCase();

  // Tách tên khóa học và lời nhận xét nếu chuỗi có định dạng "TÊN KHÓA HỌC: nhận xét"
  let courseName: string | undefined;
  let reviewerNote: string | undefined;

  const colonIdx = message.indexOf(':');
  if (colonIdx > 0 && colonIdx < 80) {
    const candidateCourse = message.slice(0, colonIdx).trim();
    const candidateNote = message.slice(colonIdx + 1).trim();
    if (candidateCourse.length >= 3) {
      courseName = normalizeCourseName(candidateCourse);
      reviewerNote = candidateNote;
    }
  }

  const isPreNotYet =
    rawText.includes('trước khi học chưa đạt') ||
    (rawText.includes('đánh giá') && rawText.includes('chưa đạt'));
  const isPrePassed =
    rawText.includes('trước khi học đạt') ||
    (rawText.includes('đánh giá') && rawText.includes('đạt') && !rawText.includes('chưa đạt'));
  const isFinalRetry = rawText.includes('cần chỉnh sửa') || rawText.includes('cần sửa');
  const isFinalSupport = rawText.includes('hỗ trợ thêm');
  const isFinalApproved = rawText.includes('đã được duyệt') || rawText.includes('được duyệt');

  // 1. Khảo sát đầu vào chưa đạt -> Cần học khóa
  if (isPreNotYet) {
    return {
      id,
      category: 'study',
      categoryLabel: 'Lộ trình học tập',
      courseName,
      displayTitle: courseName ? `Chưa đạt khảo sát: ${courseName}` : title,
      explanation: courseName
        ? `Khảo sát đầu vào chưa đạt điểm miễn học. Môn này đã được mở trong lộ trình để bạn bắt đầu học.`
        : `Bài đánh giá đầu vào chưa đạt. Khóa học đã được đưa vào lộ trình để bạn hoàn thiện.`,
      reviewerNote: reviewerNote || undefined,
      actionText: 'Vào học khóa này',
      actionLink: PULSE_PATHS.path,
      actionType: 'primary',
      createdAt,
      isRead,
      IconComponent: BookOpen,
    };
  }

  // 2. Khảo sát đầu vào đạt -> Miễn học lý thuyết
  if (isPrePassed) {
    return {
      id,
      category: 'success',
      categoryLabel: 'Đạt chuẩn năng lực',
      courseName,
      displayTitle: courseName ? `Đã công nhận: ${courseName}` : title,
      explanation: courseName
        ? `Bạn đã đạt bài đánh giá đầu vào môn ${courseName} và được miễn học toàn bộ lý thuyết.`
        : `Bài đánh giá trước khi học đã đạt chuẩn. Khóa học đã được công nhận hoàn thành.`,
      reviewerNote: reviewerNote || undefined,
      actionText: 'Xem chứng nhận',
      actionLink: PULSE_PATHS.outcomes,
      actionType: 'success',
      createdAt,
      isRead,
      IconComponent: CheckCircle2,
    };
  }

  // 3. Bài cuối khóa cần chỉnh sửa
  if (isFinalRetry) {
    return {
      id,
      category: 'warning',
      categoryLabel: 'Yêu cầu sửa đổi',
      courseName,
      displayTitle: courseName ? `Cần nộp lại: ${courseName}` : title,
      explanation: courseName
        ? `Bài thực hành cuối khóa môn ${courseName} cần được bổ sung hoặc chỉnh sửa lại.`
        : `Bài thực hành cuối khóa cần được chỉnh sửa theo nhận xét của người chấm.`,
      reviewerNote: reviewerNote || undefined,
      actionText: 'Xem nhận xét & Sửa bài',
      actionLink: PULSE_PATHS.practice,
      actionType: 'warning',
      createdAt,
      isRead,
      IconComponent: AlertCircle,
    };
  }

  // 4. Bài cuối khóa cần hỗ trợ thêm
  if (isFinalSupport) {
    return {
      id,
      category: 'warning',
      categoryLabel: 'Hỗ trợ đào tạo',
      courseName,
      displayTitle: courseName ? `Cần hỗ trợ: ${courseName}` : title,
      explanation: courseName
        ? `Bài cuối khóa môn ${courseName} chưa đạt sau các lần nộp. Cần người quản lý/giảng viên hỗ trợ trực tiếp.`
        : `Bài làm cuối khóa cần thêm sự hướng dẫn từ giảng viên/quản lý.`,
      reviewerNote: reviewerNote || undefined,
      actionText: 'Xem chi tiết bài làm',
      actionLink: PULSE_PATHS.practice,
      actionType: 'warning',
      createdAt,
      isRead,
      IconComponent: AlertCircle,
    };
  }

  // 5. Bài cuối khóa đã được duyệt
  if (isFinalApproved) {
    return {
      id,
      category: 'success',
      categoryLabel: 'Đạt chuẩn năng lực',
      courseName,
      displayTitle: courseName ? `Duyệt đạt chuẩn: ${courseName}` : title,
      explanation: courseName
        ? `Bài thực hành cuối khóa môn ${courseName} đã được hội đồng duyệt đạt chuẩn năng lực.`
        : `Bài làm cuối khóa của bạn đã được duyệt đạt chuẩn năng lực.`,
      reviewerNote: reviewerNote || undefined,
      actionText: 'Xem chứng nhận',
      actionLink: PULSE_PATHS.outcomes,
      actionType: 'success',
      createdAt,
      isRead,
      IconComponent: CheckCircle2,
    };
  }

  // 6. Thông báo hệ thống mặc định
  return {
    id,
    category: 'system',
    categoryLabel: 'Cập nhật hệ thống',
    courseName,
    displayTitle: title,
    explanation: message,
    reviewerNote: undefined,
    createdAt,
    isRead,
    IconComponent: Bell,
  };
}

/** Trung tâm hoạt động (§12.6): giao bài, nộp, chấm và phản hồi của chính nhân viên. */
export function PulseActivityPage() {
  const { data, isLoading, error, refetch } = useNotifications();
  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = data ?? [];

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const actionCount = useMemo(() => {
    return notifications.filter((n) => {
      const t = (n.title + ' ' + n.message).toLowerCase();
      return t.includes('chỉnh sửa') || t.includes('chưa đạt') || t.includes('cần học') || t.includes('cần cải thiện');
    }).length;
  }, [notifications]);

  const successCount = useMemo(() => {
    return notifications.filter((n) => {
      const t = (n.title + ' ' + n.message).toLowerCase();
      const isNeedStudy = t.includes('chưa đạt') || t.includes('cần học') || t.includes('cần cải thiện');
      return (t.includes('đạt') || t.includes('duyệt')) && !isNeedStudy;
    }).length;
  }, [notifications]);

  const parsedItems = useMemo(() => {
    return notifications.map(parseNotificationItem);
  }, [notifications]);

  const filteredData = useMemo(() => {
    return parsedItems.filter((item) => {
      // Filter by tab
      if (filter === 'unread' && item.isRead) return false;
      if (filter === 'action_needed' && !(item.category === 'warning' || item.category === 'study')) return false;
      if (filter === 'success' && item.category !== 'success') return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = item.displayTitle.toLowerCase().includes(q);
        const matchExpl = item.explanation.toLowerCase().includes(q);
        const matchCourse = item.courseName?.toLowerCase().includes(q);
        const matchNote = item.reviewerNote?.toLowerCase().includes(q);
        if (!matchTitle && !matchExpl && !matchCourse && !matchNote) return false;
      }

      return true;
    });
  }, [parsedItems, filter, searchQuery]);

  return (
    <div className="pu-activity-container">
      {/* ── 1. Page Header Đồng Bộ Chuẩn Pulse (pu-workbench-header) ──────── */}
      <header className="pu-workbench-header">
        <div className="pu-path-title-block">
          <div className="pu-path-badge-pill">
            <Bell size={13} className="text-blue-800" />
            <span>Trung tâm Thông báo & Hoạt động</span>
          </div>
          <h1 className="pu-path-main-title">Nhật ký Hoạt động Học tập</h1>
          <p className="pu-path-sub-title">
            Theo dõi tiến độ giao bài, phản hồi đánh giá và các cập nhật năng lực quan trọng trên lộ trình của bạn.
          </p>
        </div>

        <button
          type="button"
          className="pu-act-btn-mark-all"
          disabled={!unreadCount || markAll.isPending}
          onClick={() =>
            markAll.mutate(undefined, {
              onSuccess: () => toast.success('Đã đánh dấu tất cả thông báo là đã đọc.'),
              onError: (err) => toast.error(pulseErrorMessage(err, 'Chưa đánh dấu được.')),
            })
          }
          title={unreadCount > 0 ? 'Đánh dấu tất cả thông báo là đã đọc' : 'Không có thông báo chưa đọc'}
        >
          <CheckCheck size={16} />
          <span>Đánh dấu tất cả đã đọc {unreadCount > 0 ? `(${unreadCount})` : ''}</span>
        </button>
      </header>

      {/* ── 2. Quick Overview Stats Bar ──────────────────────────────────────── */}
      <div className="pu-act-stats-grid">
        <div className="pu-act-stat-card">
          <div className="pu-act-stat-icon-wrap unread">
            <Bell size={18} />
            {unreadCount > 0 && <span className="pu-act-stat-pulse-dot" />}
          </div>
          <div className="pu-act-stat-info">
            <span className="pu-act-stat-num">{unreadCount}</span>
            <span className="pu-act-stat-label">Thông báo chưa đọc</span>
          </div>
        </div>

        <div className="pu-act-stat-card">
          <div className="pu-act-stat-icon-wrap action">
            <AlertCircle size={18} />
          </div>
          <div className="pu-act-stat-info">
            <span className="pu-act-stat-num">{actionCount}</span>
            <span className="pu-act-stat-label">Việc cần xử lý ngay</span>
          </div>
        </div>

        <div className="pu-act-stat-card">
          <div className="pu-act-stat-icon-wrap success">
            <CheckCircle2 size={18} />
          </div>
          <div className="pu-act-stat-info">
            <span className="pu-act-stat-num">{successCount}</span>
            <span className="pu-act-stat-label">Môn học đạt chuẩn</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <PageSkeleton blocks={[80, 80, 80]} />
      ) : error || !data ? (
        <LoadError message={pulseErrorMessage(error, 'Không tải được hoạt động.')} onRetry={() => refetch()} />
      ) : notifications.length === 0 ? (
        <Empty icon={<BellOff size={28} className="text-blue-700" />} title="Chưa có hoạt động nào">
          Thông báo về khóa học, bài nộp và quyết định của quản lý sẽ xuất hiện ở đây.
        </Empty>
      ) : (
        <>
          {/* ── 3. Toolbar: Tabs Lọc & Ô Tìm Kiếm ──────────────────────────────── */}
          <div className="pu-act-toolbar">
            <div className="pu-act-tabs" role="tablist" aria-label="Bộ lọc thông báo">
              <button
                type="button"
                className={`pu-act-tab-btn${filter === 'all' ? ' active' : ''}`}
                onClick={() => setFilter('all')}
              >
                <span>Tất cả</span>
                <span className="pu-act-tab-badge">{notifications.length}</span>
              </button>

              <button
                type="button"
                className={`pu-act-tab-btn${filter === 'unread' ? ' active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                <Bell size={13} />
                <span>Chưa đọc</span>
                {unreadCount > 0 && <span className="pu-act-tab-badge unread">{unreadCount}</span>}
              </button>

              <button
                type="button"
                className={`pu-act-tab-btn${filter === 'action_needed' ? ' active' : ''}`}
                onClick={() => setFilter('action_needed')}
              >
                <AlertCircle size={13} />
                <span>Cần xử lý</span>
                {actionCount > 0 && <span className="pu-act-tab-badge action">{actionCount}</span>}
              </button>

              <button
                type="button"
                className={`pu-act-tab-btn${filter === 'success' ? ' active' : ''}`}
                onClick={() => setFilter('success')}
              >
                <CheckCircle2 size={13} />
                <span>Đạt chuẩn</span>
                <span className="pu-act-tab-badge">{successCount}</span>
              </button>
            </div>

            <div className="pu-act-search-box">
              <Search size={14} className="pu-act-search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo môn học, nhận xét..."
                className="pu-act-search-input"
                aria-label="Tìm kiếm thông báo"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="pu-act-search-clear"
                  title="Xóa tìm kiếm"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* ── 4. Feed Danh sách Thẻ Thông Báo (Gọn Gàng & Rõ Nghĩa) ───────── */}
          {filteredData.length === 0 ? (
            <div className="pu-surface pu-pad" style={{ textAlign: 'center', color: '#64748b', padding: '40px 20px' }}>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>
                Không tìm thấy thông báo nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm.
              </p>
            </div>
          ) : (
            <div className="pu-act-feed">
              {filteredData.map((item) => {
                return (
                  <article
                    key={item.id}
                    className={`pu-act-card ${item.category}${item.isRead ? '' : ' unread'}`}
                  >
                    <div className={`pu-act-icon ${item.category}`}>
                      <item.IconComponent size={17} />
                    </div>

                    <div className="pu-act-content">
                      <div className="pu-act-meta">
                        <span className={`pu-act-category-pill ${item.category}`}>
                          {item.categoryLabel}
                        </span>
                        <span className="pu-act-meta-dot">·</span>
                        <span className="pu-act-meta-time">
                          <Clock size={11} className="inline mr-1 text-slate-400" />
                          {formatDateTime(item.createdAt)}
                        </span>
                        {!item.isRead && (
                          <span className="pu-act-unread-pill">
                            <span className="pu-act-unread-dot" />
                            Chưa đọc
                          </span>
                        )}
                      </div>

                      <h3 className="pu-act-title">{item.displayTitle}</h3>

                      <p className="pu-act-desc">{item.explanation}</p>

                      {item.reviewerNote && (
                        <div className="pu-act-reviewer-note" title="Lời nhắn từ người chấm bài">
                          <MessageSquare size={12} className="text-amber-700 flex-shrink-0" />
                          <span>
                            Nhận xét: <em>"{item.reviewerNote}"</em>
                          </span>
                        </div>
                      )}

                      {item.actionText && item.actionLink && (
                        <div className="pu-act-actions">
                          <Link
                            to={item.actionLink}
                            className={`pu-act-btn-action ${item.actionType || 'primary'}`}
                          >
                            <span>{item.actionText}</span>
                            <ArrowRight size={11} className="pu-act-btn-arrow" />
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="pu-act-side-action">
                      {!item.isRead ? (
                        <button
                          type="button"
                          className="pu-act-btn-mark-read"
                          onClick={() => markOne.mutate(item.id)}
                          disabled={markOne.isPending}
                          title="Đánh dấu thông báo này là đã đọc"
                        >
                          <Check size={13} />
                          <span>Đã đọc</span>
                        </button>
                      ) : (
                        <span className="pu-act-read-badge">
                          <CheckCheck size={13} className="text-slate-400" />
                          <span>Đã xem</span>
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
