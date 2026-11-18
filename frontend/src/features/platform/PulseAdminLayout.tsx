import { translateUi, uiLocale, useUiLanguage } from '@/lib/i18n';
import { useState, useRef, useEffect, useMemo, useCallback, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RequireWorkspace } from '@/components/guards/RequireWorkspace';
import { WORKSPACES } from '@/lib/roles';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLogout } from '@/hooks/use-auth';
import { usePlatformTrials } from '@/hooks/use-trial-program';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/use-platform';
import { platformAdminService } from '@/services/platform-admin.service';
import { usePlatformOpenTicketCount } from '@/hooks/use-platform-admin';
import type { NotificationDto } from '@/services/platform.service';
import pulseMark from '@/assets/pulse/pulse-mark.svg';
import { initials } from './components/pulse-format';
import { PLATFORM_NAV_GROUPS } from './platform-nav';
import {
  Anchor,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Bug,
  CheckCheck,
  ChevronRight,
  FlaskConical,
  GraduationCap,
  Gem,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  ScrollText,
  Search,
  ShieldCheck,
  User as UserIcon,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import './pulse-mock.css';
import './pulse-admin.css';
import { trialNeedsMentor } from '@/features/trial-program/lib/trial-mentor';
import './pulse-catalog.css';
import './pulse-admin-shell.css';
import './pulse-admin-polish.css';

const SIDEBAR_STORAGE_KEY = 'dt-pa-sidebar-collapsed';

interface QuickSearchRouteItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  path: string;
  icon: LucideIcon;
}

const PLATFORM_ROUTE_ITEMS: readonly QuickSearchRouteItem[] = [
  { id: 'r-dash', title: 'Tổng quan', subtitle: 'Số liệu chính và việc cần xử lý', category: 'Khách hàng', path: '/platform/dashboard', icon: LayoutDashboard },
  { id: 'r-trials', title: 'Đánh giá dùng thử', subtitle: 'Tiến độ bài khảo sát của tổ chức dùng thử', category: 'Khách hàng', path: '/platform/trials', icon: FlaskConical },
  { id: 'r-mentors', title: 'Mentor', subtitle: 'Phân công mentor chấm bài cuối cấp', category: 'Khách hàng', path: '/platform/mentors', icon: GraduationCap },
  { id: 'r-orgs', title: 'Tổ chức', subtitle: 'Trạng thái, khóa đã mua và nhân viên của từng tổ chức', category: 'Khách hàng', path: '/platform/organizations', icon: Building2 },
  { id: 'r-users', title: 'Người dùng', subtitle: 'Tra cứu, khóa và mở khóa tài khoản', category: 'Khách hàng', path: '/platform/users', icon: Users },
  { id: 'r-fw', title: 'Khung năng lực số', subtitle: '6 lĩnh vực năng lực số và các khóa học', category: 'Nội dung', path: '/platform/frameworks', icon: Gem },
  { id: 'r-pos', title: 'Vị trí tham chiếu', subtitle: 'Mức năng lực yêu cầu của 5 vị trí mẫu', category: 'Nội dung', path: '/platform/reference-positions', icon: BriefcaseBusiness },
  { id: 'r-ver', title: 'Phiên bản khóa học', subtitle: 'Sửa khóa học trong bản nháp và công bố', category: 'Nội dung', path: '/platform/versions', icon: Anchor },
  { id: 'r-com', title: 'Giá và đơn hàng', subtitle: 'Giá khóa học và lịch sử mua khóa', category: 'Doanh thu', path: '/platform/commerce', icon: ReceiptText },
  { id: 'r-aud', title: 'Nhật ký hoạt động', subtitle: 'Ai đã làm gì, lúc nào và vì sao', category: 'Hệ thống', path: '/platform/audit-log', icon: ScrollText },
  { id: 'r-fb', title: 'Góp ý', subtitle: 'Góp ý và điểm hài lòng từ người dùng', category: 'Hệ thống', path: '/platform/feedbacks', icon: MessageSquare },
  { id: 'r-bug', title: 'Báo lỗi', subtitle: 'Lỗi người dùng báo từ trong ứng dụng', category: 'Hệ thống', path: '/platform/bug-reports', icon: Bug },
  { id: 'r-notif', title: 'Thông báo', subtitle: 'Việc mới cần admin xử lý', category: 'Tài khoản', path: '/platform/notifications', icon: Bell },
  { id: 'r-prof', title: 'Hồ sơ của tôi', subtitle: 'Thông tin tài khoản quản trị của bạn', category: 'Tài khoản', path: '/platform/account', icon: UserIcon },
  { id: 'r-sec', title: 'Bảo mật', subtitle: 'Đổi mật khẩu và xem các lần đăng nhập gần đây', category: 'Tài khoản', path: '/platform/account/security', icon: ShieldCheck },
];

interface BreadcrumbInfo {
  groupLabel: string;
  groupPath: string;
  current: string;
}

function getPlatformBreadcrumb(pathname: string): BreadcrumbInfo {
  if (pathname.startsWith('/platform/trials')) {
    return { groupLabel: 'Khách hàng', groupPath: '/platform/dashboard', current: 'Đánh giá dùng thử' };
  }
  if (pathname.startsWith('/platform/mentors')) {
    return { groupLabel: 'Khách hàng', groupPath: '/platform/dashboard', current: 'Mentor' };
  }
  if (pathname.startsWith('/platform/organizations/')) {
    return { groupLabel: 'Khách hàng', groupPath: '/platform/organizations', current: 'Hồ sơ tổ chức' };
  }
  if (pathname.startsWith('/platform/organizations')) {
    return { groupLabel: 'Khách hàng', groupPath: '/platform/dashboard', current: 'Tổ chức' };
  }
  if (pathname.startsWith('/platform/users/')) {
    return { groupLabel: 'Khách hàng', groupPath: '/platform/users', current: 'Hồ sơ người dùng' };
  }
  if (pathname.startsWith('/platform/users')) {
    return { groupLabel: 'Khách hàng', groupPath: '/platform/dashboard', current: 'Người dùng' };
  }
  if (pathname.startsWith('/platform/frameworks')) {
    return { groupLabel: 'Nội dung', groupPath: '/platform/frameworks', current: 'Khung năng lực số' };
  }
  if (pathname.startsWith('/platform/reference-positions')) {
    return { groupLabel: 'Nội dung', groupPath: '/platform/frameworks', current: 'Vị trí tham chiếu' };
  }
  if (/^\/platform\/versions\/[^/]+\/courses\//.test(pathname)) {
    return { groupLabel: 'Nội dung', groupPath: '/platform/versions', current: 'Sửa khóa học' };
  }
  if (/^\/platform\/versions\/[^/]+/.test(pathname)) {
    return { groupLabel: 'Nội dung', groupPath: '/platform/versions', current: 'Phiên bản khóa học' };
  }
  if (pathname.startsWith('/platform/versions')) {
    return { groupLabel: 'Nội dung', groupPath: '/platform/frameworks', current: 'Phiên bản khóa học' };
  }
  if (pathname.startsWith('/platform/commerce')) {
    return { groupLabel: 'Doanh thu', groupPath: '/platform/commerce', current: 'Giá và đơn hàng' };
  }
  if (pathname.startsWith('/platform/audit-log')) {
    return { groupLabel: 'Hệ thống', groupPath: '/platform/audit-log', current: 'Nhật ký hoạt động' };
  }
  if (pathname.startsWith('/platform/feedbacks')) {
    return { groupLabel: 'Hệ thống', groupPath: '/platform/audit-log', current: 'Góp ý' };
  }
  if (pathname.startsWith('/platform/bug-reports')) {
    return { groupLabel: 'Hệ thống', groupPath: '/platform/audit-log', current: 'Báo lỗi' };
  }
  if (pathname.startsWith('/platform/account/security')) {
    return { groupLabel: 'Tài khoản', groupPath: '/platform/account', current: 'Bảo mật' };
  }
  if (pathname.startsWith('/platform/account')) {
    return { groupLabel: 'Tài khoản', groupPath: '/platform/dashboard', current: 'Hồ sơ của tôi' };
  }
  if (pathname.startsWith('/platform/notifications')) {
    return { groupLabel: 'Tài khoản', groupPath: '/platform/dashboard', current: 'Thông báo' };
  }
  return { groupLabel: 'Khách hàng', groupPath: '/platform/dashboard', current: 'Tổng quan' };
}

function readStoredSidebarState(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function persistSidebarState(collapsed: boolean) {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? '1' : '0');
  } catch {
    // Ignore storage quota / privacy mode failures
  }
}

function formatNotifTimestamp(iso: string, language: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (diffMin < 1) return language === 'en' ? 'Just now' : 'Vừa xong';
  if (diffMin < 60) return language === 'en' ? `${diffMin}m ago` : `${diffMin} phút trước`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return language === 'en' ? `${diffHours}h ago` : `${diffHours} giờ trước`;
  return date.toLocaleDateString(uiLocale(), { day: '2-digit', month: '2-digit' });
}

interface NotificationMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

function PlatformNotificationMenu({ isOpen, onToggle, onClose }: NotificationMenuProps) {
  const language = useUiLanguage();
  const navigate = useNavigate();
  const anchorRef = useRef<HTMLDivElement>(null);
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);
  const recentItems = useMemo(() => notifications.slice(0, 6), [notifications]);

  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [isOpen, onClose]);

  const handleOpenNotification = (item: NotificationDto) => {
    if (!item.isRead) {
      markRead.mutate(item.id);
    }
    onClose();
    if (item.link && item.link.startsWith('/platform')) {
      navigate(item.link);
      return;
    }
    navigate('/platform/notifications');
  };

  return (
    <div className="pa-popover-anchor" ref={anchorRef}>
      <button
        type="button"
        className="pa-icon-btn"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="pa-notif-menu"
        aria-label={
          unreadCount > 0
            ? `${translateUi('Thông báo')} (${unreadCount})`
            : translateUi('Thông báo')
        }
        title={translateUi('Thông báo')}
      >
        <Bell size={16} strokeWidth={1.85} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="pa-bell-badge" aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id="pa-notif-menu"
          role="menu"
          aria-label={translateUi('Trung tâm thông báo')}
          className="pa-menu-panel is-wide"
        >
          <div className="pa-notif-head">
            <span className="pa-notif-title-wrap">
              <span>{translateUi('Thông báo')}</span>
              {unreadCount > 0 && <span className="pa-notif-count-pill">{unreadCount}</span>}
            </span>
            <button
              type="button"
              className="pa-notif-markall"
              disabled={unreadCount === 0 || markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} aria-hidden="true" />
              {translateUi('Đánh dấu tất cả đã đọc')}
            </button>
          </div>

          <div className="pa-notif-list">
            {isLoading ? (
              <div className="pa-notif-empty">{translateUi('Đang tải...')}</div>
            ) : recentItems.length === 0 ? (
              <div className="pa-notif-empty">
                {translateUi('Không có thông báo mới.')}
                <span className="pa-notif-empty-sub">
                  {translateUi('Hệ thống sẽ hiển thị thông báo mới ngay khi có hoạt động liên quan.')}
                </span>
              </div>
            ) : (
              recentItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  className={`pa-notif-row${item.isRead ? '' : ' is-unread'}`}
                  onClick={() => handleOpenNotification(item)}
                >
                  <span className="pa-notif-dot" aria-hidden="true" />
                  <span className="pa-notif-copy">
                    <span className="pa-notif-row-title">{item.title}</span>
                    <span className="pa-notif-row-msg">{item.message}</span>
                    <span className="pa-notif-row-time">{formatNotifTimestamp(item.createdAt, language)}</span>
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="pa-notif-foot">
            <button
              type="button"
              className="pa-notif-all-btn"
              onClick={() => {
                onClose();
                navigate('/platform/notifications');
              }}
            >
              {translateUi('Tất cả thông báo')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface CommandDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function PlatformCommandDialog({ isOpen, onClose }: CommandDialogProps) {
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 150);
    return () => window.clearTimeout(timer);
  }, [query]);

  const resetAndClose = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setSelectedIdx(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (typeof dialog.showModal === 'function') {
        if (!dialog.open) {
          dialog.showModal();
        }
      } else {
        dialog.setAttribute('open', '');
      }
      window.requestAnimationFrame(() => inputRef.current?.focus());
    } else if (dialog.open) {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }
  }, [isOpen]);

  const { data: orgsData } = useQuery({
    queryKey: ['platform', 'cmd-search', 'orgs', debouncedQuery],
    enabled: isOpen,
    retry: false,
    staleTime: 30_000,
    queryFn: async () => {
      try {
        if (typeof platformAdminService.getOrganizations !== 'function') return [];
        const res = await platformAdminService.getOrganizations({ search: debouncedQuery || undefined, pageSize: 4 });
        return res?.items ?? [];
      } catch {
        return [];
      }
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ['platform', 'cmd-search', 'users', debouncedQuery],
    enabled: isOpen,
    retry: false,
    staleTime: 30_000,
    queryFn: async () => {
      try {
        if (typeof platformAdminService.getUsers !== 'function') return [];
        const res = await platformAdminService.getUsers({ search: debouncedQuery || undefined, pageSize: 4 });
        return res?.items ?? [];
      } catch {
        return [];
      }
    },
  });

  const { data: coursesData } = useQuery({
    queryKey: ['platform', 'cmd-search', 'courses'],
    enabled: isOpen && debouncedQuery.length > 0,
    retry: false,
    staleTime: 60_000,
    queryFn: async () => {
      try {
        if (typeof platformAdminService.getCourses !== 'function') return [];
        return (await platformAdminService.getCourses()) ?? [];
      } catch {
        return [];
      }
    },
  });

  const allItems = useMemo<QuickSearchRouteItem[]>(() => {
    const q = query.trim().toLocaleLowerCase('vi');

    const routeMatches = PLATFORM_ROUTE_ITEMS.filter((item) => {
      if (!q) return true;
      const localizedTitle = translateUi(item.title).toLocaleLowerCase('vi');
      const localizedCat = translateUi(item.category).toLocaleLowerCase('vi');
      return (
        item.title.toLocaleLowerCase('vi').includes(q) ||
        localizedTitle.includes(q) ||
        item.category.toLocaleLowerCase('vi').includes(q) ||
        localizedCat.includes(q) ||
        (item.subtitle?.toLocaleLowerCase('vi').includes(q) ?? false)
      );
    }).slice(0, q ? 8 : 6);

    const orgMatches: QuickSearchRouteItem[] = (orgsData ?? [])
      .slice(0, q ? 4 : 3)
      .map((org) => ({
        id: `org-${org.id}`,
        title: org.name,
        subtitle: `${org.code} · ${org.userCount} tài khoản`,
        category: 'Tổ chức',
        path: `/platform/organizations/${org.id}`,
        icon: Building2,
      }));

    const userMatches: QuickSearchRouteItem[] = (usersData ?? [])
      .slice(0, q ? 4 : 0)
      .map((u) => ({
        id: `usr-${u.id}`,
        title: u.displayName || u.email,
        subtitle: `${u.email}${u.organizationName ? ` · ${u.organizationName}` : ''}`,
        category: 'Tài khoản',
        path: `/platform/users/${u.id}`,
        icon: Users,
      }));

    const courseMatches: QuickSearchRouteItem[] = q
      ? (coursesData ?? [])
        .filter(
          (c) =>
            c.code.toLocaleLowerCase('vi').includes(q) ||
            c.title.toLocaleLowerCase('vi').includes(q) ||
            c.domainName.toLocaleLowerCase('vi').includes(q),
        )
        .slice(0, 4)
        .map((c) => ({
          id: `crs-${c.id}`,
          title: `${c.code} · ${c.title}`,
          subtitle: `${c.domainName} · ${c.levelName}`,
          category: 'Khóa học',
          path: `/platform/versions/${c.versionNo}`,
          icon: BookOpen,
        }))
      : [];

    return [...routeMatches, ...orgMatches, ...userMatches, ...courseMatches];
  }, [query, orgsData, usersData, coursesData]);

  const safeIndex = allItems.length === 0 ? -1 : Math.min(selectedIdx, allItems.length - 1);

  const activateItem = useCallback(
    (item: QuickSearchRouteItem) => {
      resetAndClose();
      navigate(item.path);
    },
    [navigate, resetAndClose],
  );

  const handleInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (allItems.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev + 1) % allItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev - 1 + allItems.length) % allItems.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSelectedIdx(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSelectedIdx(allItems.length - 1);
    } else if (e.key === 'Enter' && safeIndex >= 0 && allItems[safeIndex]) {
      e.preventDefault();
      activateItem(allItems[safeIndex]!);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="pa-cmd-dialog"
      closedby="any"
      aria-label={translateUi('Tìm nhanh')}
      onClose={resetAndClose}
      onClick={(e) => {
        if (!('closedBy' in HTMLDialogElement.prototype) && e.target === dialogRef.current) {
          resetAndClose();
        }
      }}
    >
      <div className="pa-cmd-header">
        <Search size={17} className="pa-cmd-search-icon" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          className="pa-cmd-input"
          placeholder={translateUi('Tìm kiếm trang quản trị, tổ chức, người dùng hoặc khóa học...')}
          aria-label={translateUi('Tìm kiếm')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIdx(0);
          }}
          onKeyDown={handleInputKeyDown}
        />
        <button type="button" className="pa-cmd-close-btn" onClick={resetAndClose}>
          Esc
        </button>
      </div>

      <div className="pa-cmd-results" role="listbox" aria-label={translateUi('Tìm nhanh')}>
        {allItems.length === 0 ? (
          <div className="pa-cmd-empty">
            <div>{translateUi('Không tìm thấy kết quả phù hợp.')}</div>
            <div className="pa-cmd-empty-sub">
              {translateUi('Thử từ khóa ngắn hơn hoặc tìm theo mã khóa học, email, tên công ty.')}
            </div>
          </div>
        ) : (
          allItems.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = idx === safeIndex;
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`pa-cmd-row${isSelected ? ' is-selected' : ''}`}
                onMouseEnter={() => setSelectedIdx(idx)}
                onClick={() => activateItem(item)}
              >
                <span className="pa-cmd-row-icon">
                  <Icon size={15} strokeWidth={1.85} aria-hidden="true" />
                </span>
                <span className="pa-cmd-row-main">
                  <span className="pa-cmd-row-title">{translateUi(item.title)}</span>
                  {item.subtitle && <span className="pa-cmd-row-sub">{item.subtitle}</span>}
                </span>
                <span className="pa-cmd-row-cat">{translateUi(item.category)}</span>
              </button>
            );
          })
        )}
      </div>

      <div className="pa-cmd-footer">
        <span className="pa-cmd-hints">
          <span>
            <kbd className="pa-kbd">↑↓</kbd> {translateUi('Di chuyển')}
          </span>
          <span>
            <kbd className="pa-kbd">Enter</kbd> {translateUi('Mở')}
          </span>
        </span>
        <span>{allItems.length} {translateUi('Kết quả')}</span>
      </div>
    </dialog>
  );
}

function PulseAdminShell() {
  useUiLanguage();
  const user = useCurrentUser((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(readStoredSidebarState);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(location.pathname);

  const profileRef = useRef<HTMLDivElement>(null);

  if (lastPathname !== location.pathname) {
    setLastPathname(location.pathname);
    setProfileOpen(false);
    setNotifOpen(false);
    setMobileNavOpen(false);
    setSearchModalOpen(false);
  }

  // Real pending queue badges
  const { data: trials } = usePlatformTrials();
  const pendingTrialsCount = useMemo(
    () => (trials ?? []).filter(trialNeedsMentor).length,
    [trials],
  );

  const { data: pendingFeedbacksCount = 0 } = usePlatformOpenTicketCount('FEEDBACK');
  const { data: pendingBugsCount = 0 } = usePlatformOpenTicketCount('BUG');

  const badgeCounts = useMemo(
    () => ({
      pendingTrials: pendingTrialsCount,
      pendingFeedbacks: pendingFeedbacksCount,
      pendingBugs: pendingBugsCount,
    }),
    [pendingTrialsCount, pendingFeedbacksCount, pendingBugsCount],
  );

  const displayName = user?.fullName || user?.email || translateUi('Quản trị viên nền tảng');
  const displayEmail = user?.email || 'platform@digitalent.vn';
  const breadcrumb = useMemo(() => getPlatformBreadcrumb(location.pathname), [location.pathname]);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      persistSidebarState(next);
      return next;
    });
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isEditable =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        Boolean(target?.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setProfileOpen(false);
        setNotifOpen(false);
        setSearchModalOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b' && !isEditable) {
        e.preventDefault();
        toggleSidebarCollapsed();
      } else if (e.key === 'Escape') {
        setProfileOpen(false);
        setNotifOpen(false);
        setMobileNavOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebarCollapsed]);

  useEffect(() => {
    if (!profileOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [profileOpen]);

  const handleLogout = () => {
    logout.mutate(undefined, { onSettled: () => navigate('/login', { replace: true }) });
  };

  return (
    <div
      className={[
        'pulse-ui',
        'pa-console',
        sidebarCollapsed ? 'is-collapsed' : '',
        mobileNavOpen ? 'is-mobile-nav-open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Mobile Drawer Backdrop */}
      <button
        type="button"
        className="pa-mobile-backdrop"
        aria-label={translateUi('Đóng menu điều hướng')}
        onClick={() => setMobileNavOpen(false)}
      />

      {/* Full-Height White Sidebar + Main Column (60px White Topbar + Content Sheet) */}
      <div className="app-shell role-admin">
        <aside
          id="pa-admin-sidebar"
          className="sidebar pa-sidebar"
          aria-label={translateUi('Điều hướng quản trị nền tảng')}
        >
          <div className="pa-sidebar-head">
            <button
              type="button"
              className="pa-brand-link"
              aria-label="DigiTalent AI Admin"
              onClick={() => {
                setMobileNavOpen(false);
                navigate('/platform/dashboard');
              }}
            >
              <img src={pulseMark} alt="" className="pa-brand-img" />
              <span className="pa-brand-wordmark">
                <span className="pa-brand-title">
                  DigiTalent <em>AI</em>
                </span>
                <span className="pa-brand-role-pill">Admin</span>
              </span>
            </button>

            <button
              type="button"
              className="pa-sidebar-mobile-close"
              aria-label={translateUi('Đóng menu điều hướng')}
              onClick={() => setMobileNavOpen(false)}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="pa-sidebar-scroll">
            <nav aria-label={translateUi('Điều hướng chính')}>
              {PLATFORM_NAV_GROUPS.map((group) => (
                <div key={group.groupTitle} className="pa-nav-group">
                  <div className="pa-nav-group-divider" aria-hidden="true" />
                  <div className="pa-nav-group-label">{translateUi(group.groupTitle)}</div>
                  <ul className="pa-nav-list">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const badgeValue = item.badgeKey ? badgeCounts[item.badgeKey] : 0;
                      const isNeutralBadge = item.badgeKey === 'pendingFeedbacks';

                      return (
                        <li key={item.to}>
                          <NavLink
                            to={item.to}
                            title={sidebarCollapsed ? translateUi(item.label) : undefined}
                            className={({ isActive }) => `pa-nav-link${isActive ? ' active' : ''}`}
                            onClick={() => setMobileNavOpen(false)}
                          >
                            <span className="pa-nav-icon-box" aria-hidden="true">
                              <Icon size={18} strokeWidth={2} className="pa-nav-icon" />
                            </span>
                            <span className="pa-nav-label">{translateUi(item.label)}</span>
                            {badgeValue > 0 && (
                              <span
                                className={`pa-nav-badge ${isNeutralBadge ? 'is-neutral' : 'is-attention'}`}
                              >
                                {badgeValue > 99 ? '99+' : badgeValue}
                              </span>
                            )}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="pa-sidebar-footer">
            <div className="pa-sidebar-user-card">
              <span className="pa-avatar is-lg" aria-hidden="true">
                {initials(displayName)}
              </span>
              <div className="pa-sidebar-user-meta">
                <span className="pa-sidebar-user-name" title={displayName}>
                  {displayName}
                </span>
                <span className="pa-sidebar-user-email" title={displayEmail}>
                  {displayEmail}
                </span>
              </div>
              <button
                type="button"
                className="pa-sidebar-logout-btn"
                onClick={handleLogout}
                aria-label={translateUi('Đăng xuất hệ thống')}
                title={translateUi('Đăng xuất hệ thống')}
              >
                <LogOut size={18} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>
        </aside>

        <div className="pa-workspace-sheet">
          <header className="app-header pa-topbar">
            <div className="pa-topbar-left">
              <button
                type="button"
                className="pa-sidebar-trigger"
                onClick={toggleSidebarCollapsed}
                aria-expanded={!sidebarCollapsed}
                aria-label={translateUi(sidebarCollapsed ? 'Mở rộng thanh bên (Ctrl+B)' : 'Thu gọn thanh bên (Ctrl+B)')}
                title={translateUi(sidebarCollapsed ? 'Mở rộng thanh bên (Ctrl+B)' : 'Thu gọn thanh bên (Ctrl+B)')}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen size={18} strokeWidth={2} aria-hidden="true" />
                ) : (
                  <PanelLeftClose size={18} strokeWidth={2} aria-hidden="true" />
                )}
              </button>
              <span className="pa-topbar-sep" aria-hidden="true" />

              <div className="pa-topbar-mobile-brand">
                <button
                  type="button"
                  className="pa-mobile-nav-btn"
                  aria-label={translateUi('Mở menu điều hướng')}
                  aria-expanded={mobileNavOpen}
                  aria-controls="pa-admin-sidebar"
                  onClick={() => setMobileNavOpen((prev) => !prev)}
                >
                  <Menu size={20} strokeWidth={2} aria-hidden="true" />
                </button>

                <Link
                  to="/platform/dashboard"
                  className="pa-brand-link"
                  aria-label="DigiTalent AI Admin"
                >
                  <img src={pulseMark} alt="" className="pa-brand-img" />
                  <span className="pa-brand-wordmark">
                    <span className="pa-brand-title">
                      DigiTalent <em>AI</em>
                    </span>
                    <span className="pa-brand-role-pill">Admin</span>
                  </span>
                </Link>
              </div>

              <nav className="pa-breadcrumb" aria-label={translateUi('Đường dẫn')}>
                <Link to={breadcrumb.groupPath} className="pa-breadcrumb-root">
                  {translateUi(breadcrumb.groupLabel)}
                </Link>
                <ChevronRight size={15} className="pa-breadcrumb-sep" aria-hidden="true" />
                <span className="pa-breadcrumb-current" aria-current="page">
                  {translateUi(breadcrumb.current)}
                </span>
              </nav>
            </div>

            <div className="pa-topbar-center">
              <button
                type="button"
                className="pa-cmd-trigger"
                onClick={() => {
                  setProfileOpen(false);
                  setNotifOpen(false);
                  setSearchModalOpen(true);
                }}
                aria-label={translateUi('Tìm kiếm (Ctrl+K)')}
              >
                <span className="pa-cmd-trigger-left">
                  <Search size={16} strokeWidth={2} aria-hidden="true" />
                  <span className="pa-cmd-trigger-label">
                    {translateUi('Tìm trang, tổ chức, người dùng...')}
                  </span>
                </span>
                <kbd className="pa-kbd">Ctrl K</kbd>
              </button>
            </div>

            <div className="pa-topbar-actions">
              <PlatformNotificationMenu
                isOpen={notifOpen}
                onToggle={() => {
                  setProfileOpen(false);
                  setNotifOpen((prev) => !prev);
                }}
                onClose={() => setNotifOpen(false)}
              />

              <div className="pa-popover-anchor" ref={profileRef}>
                <button
                  type="button"
                  className="pa-user-btn is-avatar-only"
                  onClick={() => {
                    setNotifOpen(false);
                    setProfileOpen((prev) => !prev);
                  }}
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  aria-controls="pa-account-menu"
                  aria-label={`${translateUi('Menu người dùng')}: ${displayName}`}
                  title={displayName}
                >
                  <span className="pa-avatar is-topbar" aria-hidden="true">
                    {initials(displayName)}
                  </span>
                </button>

                {profileOpen && (
                  <div
                    id="pa-account-menu"
                    aria-label={translateUi('Menu tài khoản')}
                    className="pa-menu-panel"
                  >
                    <div className="pa-menu-user-meta">
                      <div className="pa-menu-user-name">{displayName}</div>
                      <div className="pa-menu-user-email">{displayEmail}</div>
                      <span className="pa-menu-user-tag">{translateUi('Quản trị viên nền tảng')}</span>
                    </div>

                    <Link
                      to="/platform/account"
                      className="pa-menu-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <UserIcon size={16} className="pa-menu-item-icon" aria-hidden="true" />
                      <span>{translateUi('Hồ sơ quản trị viên')}</span>
                    </Link>

                    <Link
                      to="/platform/account/security"
                      className="pa-menu-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <ShieldCheck size={16} className="pa-menu-item-icon" aria-hidden="true" />
                      <span>{translateUi('Bảo mật tài khoản')}</span>
                    </Link>

                    <Link
                      to="/platform/notifications"
                      className="pa-menu-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Bell size={16} className="pa-menu-item-icon" aria-hidden="true" />
                      <span>{translateUi('Trung tâm thông báo')}</span>
                    </Link>

                    <div className="pa-menu-divider" role="separator" />

                    <button
                      type="button"
                      className="pa-menu-item is-danger"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} className="pa-menu-item-icon" aria-hidden="true" />
                      <span>{translateUi('Đăng xuất hệ thống')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="main-area">
            <div key={location.pathname} className="pa-route-stage">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <PlatformCommandDialog
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
}

/** Platform Admin console layout */
export function PulseAdminLayout() {
  return (
    <AuthGuard>
      <RequireWorkspace workspace={WORKSPACES.PLATFORM}>
        <PulseAdminShell />
      </RequireWorkspace>
    </AuthGuard>
  );
}
