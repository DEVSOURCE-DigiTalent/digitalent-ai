import { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RequireWorkspace } from '@/components/guards/RequireWorkspace';
import { WORKSPACES } from '@/lib/roles';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLogout } from '@/hooks/use-auth';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/use-platform';
import type { NotificationDto } from '@/services/platform.service';
import { initials } from '@/features/platform/components/pulse-format';
import { formatDateTime } from '@/lib/utils';
import { MENTOR_NAV } from './mentor-nav';
import pulseMark from '@/features/platform/assets/pulse-mark.svg';
import {
  Search,
  ChevronDown,
  ShieldCheck,
  Bell,
  Settings,
  LogOut,
  CheckCircle2,
  CheckCheck,
  Building2,
  FileCheck2,
  AlertTriangle,
  X,
  ArrowRight,
} from 'lucide-react';
import '@/features/platform/pulse-mock.css';
import '@/features/platform/pulse-admin.css';
import '@/features/platform/pulse-catalog.css';
import '@/features/trial-program/mentor-workspace.css';

interface QuickSearchItem {
  title: string;
  category: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}

const MENTOR_QUICK_SEARCH: QuickSearchItem[] = [
  { title: 'Doanh nghiệp được giao', category: 'Nghiệp vụ', path: '/mentor/enterprises', icon: Building2 },
  { title: 'Tất cả bài nộp cuối cấp', category: 'Nghiệp vụ', path: '/mentor/course-reviews', icon: CheckCircle2 },
  { title: 'Hồ sơ cá nhân', category: 'Tài khoản', path: '/mentor/account', icon: Settings },
  { title: 'Bảo mật & Đổi mật khẩu', category: 'Tài khoản', path: '/mentor/account/security', icon: ShieldCheck },
  { title: 'Trung tâm thông báo', category: 'Tài khoản', path: '/mentor/notifications', icon: Bell },
];

function getMentorPageTitle(pathname: string): string | null {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  if (cleanPath === '/mentor/enterprises' || cleanPath === '/mentor/course-reviews') return null;
  if (cleanPath.includes('/submissions/')) return 'Thẩm định bài nộp';
  if (cleanPath.startsWith('/mentor/enterprises/')) return 'Chấm bài theo doanh nghiệp';
  if (cleanPath.startsWith('/mentor/course-reviews/')) return 'Thẩm định bài nộp';
  if (cleanPath === '/mentor/account/security') return 'Bảo mật & Đổi mật khẩu';
  if (cleanPath === '/mentor/account') return 'Hồ sơ cá nhân';
  if (cleanPath === '/mentor/notifications') return 'Trung tâm thông báo';
  return null;
}

function resolveMentorNotificationTarget(item: NotificationDto): string {
  if (item.relatedEntityType === 'course_final_submissions' && item.relatedEntityId) {
    return `/mentor/course-reviews/${item.relatedEntityId}`;
  }
  if (item.relatedEntityType === 'trial_workspaces' && item.relatedEntityId) {
    return `/mentor/enterprises/${item.relatedEntityId}`;
  }
  if (item.link) {
    return item.link;
  }
  return '/mentor/notifications';
}

function getMentorNotificationVisual(item: NotificationDto) {
  const type = (item.type || '').toUpperCase();
  if (type === 'WARNING' || type === 'ALERT' || type.includes('DEADLINE') || type.includes('FLAGGED')) {
    return { toneClass: 'is-warning', Icon: AlertTriangle };
  }
  if (type === 'SUCCESS' || type.includes('APPROVED')) {
    return { toneClass: 'is-success', Icon: CheckCircle2 };
  }
  if (type === 'TRIAL_MENTOR_ASSIGNED' || type === 'TRIAL_REQUESTED' || item.relatedEntityType === 'trial_workspaces') {
    return { toneClass: 'is-enterprise', Icon: Building2 };
  }
  if (type === 'PULSE_FINAL_SUBMITTED' || item.relatedEntityType === 'course_final_submissions') {
    return { toneClass: 'is-submission', Icon: FileCheck2 };
  }
  return { toneClass: 'is-default', Icon: Bell };
}

function MentorShell() {
  const user = useCurrentUser((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: notifications = [], isLoading: notificationsLoading } = useNotifications();
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastPathname, setLastPathname] = useState(location.pathname);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  if (lastPathname !== location.pathname) {
    setLastPathname(location.pathname);
    setProfileOpen(false);
    setNotifOpen(false);
    setSearchModalOpen(false);
    setSearchQuery('');
  }

  const closeSearchModal = () => {
    setSearchModalOpen(false);
    setSearchQuery('');
  };

  const openSearchModal = () => {
    setNotifOpen(false);
    setProfileOpen(false);
    setSearchQuery('');
    setSearchModalOpen(true);
  };

  const roleLabel = 'Mentor chuyên môn';
  const name = user?.fullName || user?.email || roleLabel;
  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
  const recentNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setNotifOpen(false);
        setProfileOpen(false);
        setSearchQuery('');
        setSearchModalOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setSearchQuery('');
        setProfileOpen(false);
        setNotifOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!searchModalOpen) return;
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [searchModalOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const signOut = () => {
    setProfileOpen(false);
    logout.mutate(undefined, { onSettled: () => navigate('/login', { replace: true }) });
  };

  const filteredSearchItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return MENTOR_QUICK_SEARCH;
    return MENTOR_QUICK_SEARCH.filter(
      (item) => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const pageTitle = getMentorPageTitle(location.pathname);

  return (
    <div className="pulse-ui mentor-ui" data-testid="mentor-layout">
      <header className="app-header pa-header-mentor">
        <div className="mw-header-left">
          <NavLink className="brand" to="/mentor/enterprises" aria-label="DigiTalent AI, trang chủ Mentor">
            <img src={pulseMark} alt="" />
            <span>
              DigiTalent <em>AI</em>
            </span>
          </NavLink>

          {pageTitle && (
            <>
              <span className="mw-header-divider" aria-hidden="true" />
              <span className="mw-header-title">{pageTitle}</span>
            </>
          )}
        </div>

        {!pageTitle && (
          <nav className="pa-mentor-top-nav" aria-label="Điều hướng Mentor">
            {MENTOR_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `pa-mentor-nav-tab${isActive ? ' active' : ''}`}
                  title={item.description}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        )}

        <div className="mw-header-right">
          <button
            type="button"
            className="pa-search-icon-btn"
            onClick={openSearchModal}
            title="Tìm nhanh (Ctrl+K)"
            aria-label="Tìm nhanh (Ctrl+K)"
          >
            <Search size={18} />
          </button>

          <div className="mw-notif-wrap" ref={notifRef}>
            <button
              type="button"
              className={`pa-search-icon-btn mw-notif-trigger${notifOpen ? ' is-open' : ''}`}
              onClick={() => {
                setProfileOpen(false);
                setSearchModalOpen(false);
                setNotifOpen((prev) => !prev);
              }}
              title="Thông báo"
              aria-label={unreadCount > 0 ? `Thông báo (${unreadCount} chưa đọc)` : 'Thông báo'}
              aria-expanded={notifOpen}
              aria-haspopup="dialog"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="mw-notif-badge" aria-hidden="true">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="mw-notif-popover" role="dialog" aria-label="Danh sách thông báo nhanh">
                <div className="mw-notif-pop-head">
                  <div className="mw-notif-pop-title">
                    <span>Thông báo</span>
                    {unreadCount > 0 && <span className="mw-notif-unread-pill">{unreadCount} chưa đọc</span>}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="mw-notif-mark-all-btn"
                      onClick={() => markAllNotificationsRead.mutate()}
                      disabled={markAllNotificationsRead.isPending}
                    >
                      <CheckCheck size={13} aria-hidden="true" />
                      <span>Đọc tất cả</span>
                    </button>
                  )}
                </div>

                <div className="mw-notif-pop-list">
                  {notificationsLoading ? (
                    <div className="mw-notif-pop-empty">Đang tải thông báo...</div>
                  ) : recentNotifications.length === 0 ? (
                    <div className="mw-notif-pop-empty">
                      Chưa có thông báo mới. Cập nhật bài nộp và doanh nghiệp phụ trách sẽ hiển thị tại đây.
                    </div>
                  ) : (
                    recentNotifications.map((item) => {
                      const { toneClass, Icon } = getMentorNotificationVisual(item);
                      const targetHref = resolveMentorNotificationTarget(item);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`mw-notif-pop-item${!item.isRead ? ' is-unread' : ''}`}
                          onClick={() => {
                            if (!item.isRead) {
                              markNotificationRead.mutate(item.id);
                            }
                            setNotifOpen(false);
                            navigate(targetHref);
                          }}
                        >
                          <span className={`mw-notif-pop-icon ${toneClass}`} aria-hidden="true">
                            <Icon size={15} />
                          </span>
                          <div className="mw-notif-pop-copy">
                            <strong>{item.title}</strong>
                            <p>{item.message}</p>
                            <span>{formatDateTime(item.createdAt)}</span>
                          </div>
                          {!item.isRead && <span className="mw-notif-pop-dot" aria-hidden="true" />}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="mw-notif-pop-foot">
                  <button
                    type="button"
                    className="mw-notif-all-btn"
                    onClick={() => {
                      setNotifOpen(false);
                      navigate('/mentor/notifications');
                    }}
                  >
                    <span>Mở trung tâm thông báo</span>
                    <ArrowRight size={13} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pa-profile-container" ref={dropdownRef}>
            <button
              type="button"
              className="mw-profile-chip"
              onClick={() => {
                setNotifOpen(false);
                setSearchModalOpen(false);
                setProfileOpen((prev) => !prev);
              }}
              aria-expanded={profileOpen}
              aria-haspopup="true"
              aria-label={`Menu tài khoản: ${name}`}
            >
              <span className="mw-profile-avatar" aria-hidden="true">{initials(name)}</span>
              <div className="mw-profile-meta">
                <b>{name}</b>
                <small>{roleLabel}</small>
              </div>
              <ChevronDown size={14} style={{ color: '#64748b', flexShrink: 0 }} />
            </button>

            {profileOpen && (
              <div className="pa-dropdown-card" role="menu">
                <div className="pa-dropdown-user-summary">
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{user?.email ?? 'mentor@digitalent.ai'}</div>
                  <span className="pa-mentor-pill-badge">{roleLabel}</span>
                </div>

                <div className="pa-dropdown-heading">Tài khoản Mentor</div>
                <NavLink to="/mentor/account" className="pa-dropdown-menu-item" onClick={() => setProfileOpen(false)}>
                  <Settings size={15} style={{ color: '#64748b' }} />
                  <span>Hồ sơ cá nhân</span>
                </NavLink>

                <NavLink to="/mentor/account/security" className="pa-dropdown-menu-item" onClick={() => setProfileOpen(false)}>
                  <ShieldCheck size={15} style={{ color: '#64748b' }} />
                  <span>Bảo mật & Đổi mật khẩu</span>
                </NavLink>

                <NavLink to="/mentor/notifications" className="pa-dropdown-menu-item" onClick={() => setProfileOpen(false)}>
                  <Bell size={15} style={{ color: '#64748b' }} />
                  <span>Trung tâm thông báo</span>
                </NavLink>

                <div className="pa-dropdown-divider" />

                <button
                  type="button"
                  className="pa-dropdown-menu-item logout"
                  onClick={signOut}
                  disabled={logout.isPending}
                >
                  <LogOut size={15} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="app-shell role-mentor-shell">
        <main className="main-area role-mentor-main">
          <Outlet />
        </main>
      </div>

      {searchModalOpen && (
        <div className="pa-search-modal-backdrop" onClick={closeSearchModal}>
          <div className="pa-search-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="pa-search-modal-header">
              <Search size={18} className="pa-search-modal-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="pa-search-modal-input"
                placeholder="Nhập tên trang cần mở..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="pa-search-modal-close"
                onClick={closeSearchModal}
                title="Đóng (ESC)"
              >
                <X size={16} />
              </button>
            </div>
            <div className="pa-search-modal-body">
              {filteredSearchItems.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                  Không có trang khớp từ khóa. Thử tìm theo tên chức năng như doanh nghiệp, bài nộp hoặc bảo mật.
                </div>
              ) : (
                filteredSearchItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      className="pa-search-modal-item"
                      onClick={() => {
                        navigate(item.path);
                        closeSearchModal();
                      }}
                    >
                      <div className="pa-search-item-left">
                        <div className="pa-search-item-icon">
                          <Icon size={16} />
                        </div>
                        <div className="pa-search-item-meta">
                          <span className="pa-search-item-title">{item.title}</span>
                          <span className="pa-search-item-category">{item.category}</span>
                        </div>
                      </div>
                      <ArrowRight size={14} className="pa-search-item-arrow" />
                    </button>
                  );
                })
              )}
            </div>
            <div className="pa-search-modal-footer">
              <span>Phím tắt: <strong>ESC</strong> để đóng · <strong>Ctrl+K</strong> để mở lại</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MentorLayout() {
  return (
    <AuthGuard>
      <RequireWorkspace workspace={WORKSPACES.MENTOR}>
        <MentorShell />
      </RequireWorkspace>
    </AuthGuard>
  );
}
