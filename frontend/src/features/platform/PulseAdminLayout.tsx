import { translateUi, useUiLanguage } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RequireWorkspace } from '@/components/guards/RequireWorkspace';
import { WORKSPACES } from '@/lib/roles';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLogout } from '@/hooks/use-auth';
import { usePlatformTrials } from '@/hooks/use-trial-program';
import { initials } from './components/pulse-format';
import { PLATFORM_NAV_GROUPS } from './platform-nav';
import pulseMark from './assets/pulse-mark.svg';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Building2,
  Users2,
  User,
  ShieldCheck,
  Bell,
  Settings,
  LogOut,
  Check,
  Sparkles,
  CheckCircle2,
  LayoutDashboard,
  FlaskConical,
  ScrollText,
  X,
  ArrowRight,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import './pulse-mock.css';
import './pulse-admin.css';
import './pulse-catalog.css';

interface QuickSearchItem {
  title: string;
  category: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}

const PLATFORM_QUICK_SEARCH: QuickSearchItem[] = [
  { title: 'Tổng quan nền tảng', category: 'Quản trị', path: '/platform/dashboard', icon: LayoutDashboard },
  { title: 'Đánh giá dùng thử doanh nghiệp', category: 'Quản trị', path: '/platform/trials', icon: FlaskConical },
  { title: 'Tổ chức doanh nghiệp', category: 'Quản trị', path: '/platform/organizations', icon: Building2 },
  { title: 'Tài khoản người dùng', category: 'Quản trị', path: '/platform/users', icon: User },
  { title: 'Khung chuẩn năng lực', category: 'Chuẩn hóa', path: '/platform/frameworks', icon: Sparkles },
  { title: 'Phiên bản khóa học', category: 'Nội dung', path: '/platform/versions', icon: Sparkles },
  { title: 'Đơn giá & Suất học', category: 'Thương mại', path: '/platform/commerce', icon: ScrollText },
  { title: 'Nhật ký kiểm toán', category: 'Hệ thống', path: '/platform/audit-log', icon: ScrollText },
  { title: 'Hồ sơ cá nhân', category: 'Tài khoản', path: '/platform/account', icon: Settings },
  { title: 'Bảo mật & Xác thực 2 bước', category: 'Tài khoản', path: '/platform/account/security', icon: ShieldCheck },
  { title: 'Trung tâm thông báo', category: 'Tài khoản', path: '/platform/notifications', icon: Bell },
];

function getPlatformBreadcrumb(pathname: string): { root: string; current: string } {
  if (pathname.startsWith('/platform/trials')) return { root: 'Vận hành', current: 'Đánh giá dùng thử' };
  if (pathname.startsWith('/platform/organizations')) return { root: 'Vận hành', current: 'Tổ chức doanh nghiệp' };
  if (pathname.startsWith('/platform/users')) return { root: 'Vận hành', current: 'Tài khoản người dùng' };
  if (pathname.startsWith('/platform/frameworks')) return { root: 'Chuẩn hóa', current: 'Khung chuẩn năng lực' };
  if (pathname.startsWith('/platform/reference-positions')) return { root: 'Chuẩn hóa', current: 'Mẫu vị trí chuẩn' };
  if (pathname.startsWith('/platform/versions')) return { root: 'Nội dung', current: 'Phiên bản khóa học' };
  if (pathname.startsWith('/platform/commerce')) return { root: 'Thương mại', current: 'Đơn giá & Suất học' };
  if (pathname.startsWith('/platform/audit-log')) return { root: 'Hệ thống', current: 'Nhật ký kiểm toán' };
  if (pathname.startsWith('/platform/feedbacks')) return { root: 'Hỗ trợ', current: 'Ý kiến phản hồi' };
  if (pathname.startsWith('/platform/bug-reports')) return { root: 'Hỗ trợ', current: 'Báo lỗi kỹ thuật' };
  if (pathname.startsWith('/platform/account/security')) return { root: 'Tài khoản', current: 'Bảo mật & Xác thực' };
  if (pathname.startsWith('/platform/account')) return { root: 'Tài khoản', current: 'Hồ sơ cá nhân' };
  if (pathname.startsWith('/platform/notifications')) return { root: 'Tài khoản', current: 'Trung tâm thông báo' };
  return { root: 'Vận hành', current: 'Tổng quan nền tảng' };
}

function PlatformQuickCreateMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="pa-quick-action-container" ref={ref}>
      <button
        type="button"
        className="pa-quick-create-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        title="Thao tác tạo nhanh"
      >
        <Plus size={14} />
        <span>Tạo mới</span>
        <ChevronDown size={12} style={{ opacity: 0.7 }} />
      </button>

      {open && (
        <div className="pa-dropdown-card" style={{ right: 0, width: 230, top: 'calc(100% + 6px)' }}>
          <div className="pa-dropdown-heading">Thao tác tạo nhanh</div>
          <button
            type="button"
            className="pa-dropdown-menu-item"
            onClick={() => {
              navigate('/platform/organizations');
              setOpen(false);
            }}
          >
            <Building2 size={15} style={{ color: '#0284c7' }} />
            <span>Thêm tổ chức mới</span>
          </button>
          <button
            type="button"
            className="pa-dropdown-menu-item"
            onClick={() => {
              navigate('/platform/trials');
              setOpen(false);
            }}
          >
            <FlaskConical size={15} style={{ color: '#d97706' }} />
            <span>Phân công Mentor</span>
          </button>
          <button
            type="button"
            className="pa-dropdown-menu-item"
            onClick={() => {
              navigate('/platform/versions');
              setOpen(false);
            }}
          >
            <Sparkles size={15} style={{ color: '#10b981' }} />
            <span>Soạn phiên bản mới</span>
          </button>
        </div>
      )}
    </div>
  );
}

/** Header + Enterprise Left Sidebar of the Platform Admin console. */
function PulseAdminShell() {
  useUiLanguage();
  const user = useCurrentUser((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pa_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const roleLabel = 'Quản trị nền tảng';
  const home = '/platform/dashboard';
  const name = user?.fullName || user?.email || roleLabel;

  const trials = usePlatformTrials();
  const pendingTrialsCount = useMemo(() => {
    return (trials.data ?? []).filter((t) => t.stage === 'REQUESTED').length;
  }, [trials.data]);

  const breadcrumb = useMemo(() => getPlatformBreadcrumb(location.pathname), [location.pathname]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('pa_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Keyboard shortcut Ctrl+K to toggle search, Ctrl+B to toggle sidebar collapse
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapse();
      }
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setProfileOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [searchModalOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setSearchModalOpen(false);
  }, [location.pathname]);

  const signOut = () => {
    setProfileOpen(false);
    logout.mutate(undefined, { onSettled: () => navigate('/login', { replace: true }) });
  };

  const filteredSearchItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return PLATFORM_QUICK_SEARCH;
    return PLATFORM_QUICK_SEARCH.filter(
      (item) => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  return (
    <div className="pulse-ui" data-testid="platform-layout">
      {/* Enterprise Topbar */}
      <header className="app-header">
        {/* Left: Brand + Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <NavLink className="brand" to={home} aria-label="DigiTalent AI, trang chủ">
            <img src={pulseMark} alt="" />
            <span>
              DigiTalent <em>AI</em>
            </span>
          </NavLink>
          <span className="pa-brand-badge">{translateUi("Console")}</span>

          {/* Dynamic Breadcrumbs */}
          <nav aria-label={translateUi("Đường dẫn phân cấp")} className="pa-header-breadcrumb">
            <span className="pa-breadcrumb-root">{translateUi(breadcrumb.root)}</span>
            <ChevronRight size={13} className="pa-breadcrumb-sep" />
            <span className="pa-breadcrumb-current">{translateUi(breadcrumb.current)}</span>
          </nav>
        </div>

        {/* Center: Command Search */}
        <div className="pa-header-search" onClick={() => setSearchModalOpen(true)}>
          <Search size={16} className="pa-header-search-icon" />
          <input
            type="search"
            className="pa-header-search-input"
            placeholder="Tìm tổ chức, chức năng, khung chuẩn..."
            aria-label="Tìm kiếm toàn hệ thống"
            readOnly
          />
          <kbd className="pa-header-search-kbd">Ctrl K</kbd>
        </div>

        {/* Right: Quick Actions, System Status & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LanguageSwitcher />
          {/* Quick Create Action */}
          <PlatformQuickCreateMenu />

          {/* System Status Pill */}
          <div className="pa-system-status" title="Catalog phiên bản neo đang phục vụ">
            <span className="pa-status-dot" aria-hidden="true" />
            <span>Catalog neo v1</span>
          </div>

          {/* User Profile & Role Switcher */}
          <div className="pa-profile-container" ref={dropdownRef}>
            <button
              type="button"
              className="pa-profile-trigger"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-expanded={profileOpen}
              aria-haspopup="true"
              aria-label={translateUi(`Menu người dùng: ${name}`)}
            >
              <div className="pa-avatar-circle">{initials(name)}</div>
              <div className="pa-profile-info">
                <span className="pa-profile-name">{name}</span>
                <span className="pa-profile-role">{translateUi(roleLabel)}</span>
              </div>
              <ChevronDown size={14} style={{ color: '#64748b', marginLeft: 2 }} />
            </button>

            {profileOpen && (
              <div className="pa-dropdown-card" role="menu">
                <div className="pa-dropdown-user-summary">
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{user?.email ?? 'platform@digitalent.ai'}</div>
                </div>

                <div className="pa-dropdown-heading">Chuyển đổi góc nhìn vai trò</div>
                <button
                  type="button"
                  className="pa-role-switch-item active"
                  onClick={() => {
                    navigate('/platform/dashboard');
                    setProfileOpen(false);
                  }}
                >
                  <div className="pa-role-left">
                    <Sparkles size={16} style={{ color: '#d97706' }} />
                    <span>Quản trị Nền tảng (Hiện tại)</span>
                  </div>
                  <Check size={14} style={{ color: '#d97706' }} />
                </button>

                <button
                  type="button"
                  className="pa-role-switch-item"
                  onClick={() => {
                    navigate('/enterprise');
                    setProfileOpen(false);
                  }}
                >
                  <div className="pa-role-left">
                    <Building2 size={16} style={{ color: '#64748b' }} />
                    <span>{translateUi("Chủ doanh nghiệp (Owner)")}</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="pa-role-switch-item"
                  onClick={() => {
                    navigate('/enterprise/manager');
                    setProfileOpen(false);
                  }}
                >
                  <div className="pa-role-left">
                    <Users2 size={16} style={{ color: '#64748b' }} />
                    <span>{translateUi("Quản lý phòng ban (Manager)")}</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="pa-role-switch-item"
                  onClick={() => {
                    navigate('/enterprise/me');
                    setProfileOpen(false);
                  }}
                >
                  <div className="pa-role-left">
                    <User size={16} style={{ color: '#64748b' }} />
                    <span>Nhân viên Pulse (Employee)</span>
                  </div>
                </button>

                <div className="pa-dropdown-divider" />

                <div className="pa-dropdown-heading">{translateUi("Cài đặt tài khoản")}</div>
                <NavLink to="/platform/account" className="pa-dropdown-menu-item" onClick={() => setProfileOpen(false)}>
                  <Settings size={15} style={{ color: '#64748b' }} />
                  <span>Hồ sơ cá nhân</span>
                </NavLink>

                <NavLink to="/platform/account/security" className="pa-dropdown-menu-item" onClick={() => setProfileOpen(false)}>
                  <ShieldCheck size={15} style={{ color: '#64748b' }} />
                  <span>Bảo mật & Xác thực 2 bước</span>
                </NavLink>

                <NavLink to="/platform/notifications" className="pa-dropdown-menu-item" onClick={() => setProfileOpen(false)}>
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
                  <span>Đăng xuất hệ thống</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Enterprise App Shell: Grouped Sidebar + Main Area */}
      <div className={`app-shell role-admin${isCollapsed ? ' collapsed' : ''}`}>
        <aside className="sidebar" aria-label="Điều hướng quản trị nền tảng">
          <div>
            {PLATFORM_NAV_GROUPS.map((group) => (
              <div key={group.groupTitle} className="pa-side-nav-group">
                <span className="pa-side-nav-group-title">{translateUi(group.groupTitle)}</span>
                <div className="pa-side-nav-group-divider" />

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isTrials = item.badgeKey === 'pendingTrials';
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/platform/dashboard'}
                      className={({ isActive }) => `pa-side-nav-link${isActive ? ' active' : ''}`}
                      title={translateUi(item.description)}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span>{translateUi(item.label)}</span>

                      {/* Pending Trials Badge */}
                      {isTrials && pendingTrialsCount > 0 && (
                        <span
                          className="pa-nav-badge"
                          style={{
                            marginLeft: 'auto',
                            fontSize: 11,
                            fontWeight: 700,
                            background: '#d97706',
                            color: '#ffffff',
                            borderRadius: 9999,
                            padding: '1px 6px',
                            lineHeight: '16px',
                          }}
                          title={`${pendingTrialsCount} yêu cầu chờ phân công`}
                        >
                          {pendingTrialsCount}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>

          <div>
            {/* Catalog Anchor Status Card */}
            <div className="pa-sidebar-footer-card">
              <div className="pa-sidebar-footer-title">
                <CheckCircle2 size={15} style={{ color: '#d97706', flexShrink: 0 }} />
                <span>DigiTalent Platform</span>
              </div>
              <span className="pa-sidebar-footer-sub">
                Khung chuẩn năng lực số
                <br />
                Catalog neo v1 · Ổn định
              </span>
            </div>

            {/* Sidebar Collapse Toggle */}
            <button
              type="button"
              className="pa-sidebar-collapse-btn"
              onClick={toggleCollapse}
              title={isCollapsed ? 'Mở rộng menu bên (Ctrl+B)' : 'Thu gọn menu bên (Ctrl+B)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {isCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
                <span>Thu gọn menu</span>
              </div>
              <span>Ctrl B</span>
            </button>
          </div>
        </aside>

        <main className="main-area">
          <Outlet />
        </main>
      </div>

      {/* Global Quick Search Modal (Ctrl + K) */}
      {searchModalOpen && (
        <div className="pa-search-modal-backdrop" onClick={() => setSearchModalOpen(false)}>
          <div className="pa-search-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="pa-search-modal-header">
              <Search size={18} className="pa-search-modal-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="pa-search-modal-input"
                placeholder="Tìm trang hoặc chức năng nhanh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="pa-search-modal-close"
                onClick={() => setSearchModalOpen(false)}
                title="Đóng (ESC)"
              >
                <X size={16} />
              </button>
            </div>
            <div className="pa-search-modal-body">
              {filteredSearchItems.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                  Không tìm thấy mục nào phù hợp với từ khóa.
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
                        setSearchModalOpen(false);
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

export function PulseAdminLayout() {
  useUiLanguage();
  return (
    <AuthGuard>
      <RequireWorkspace workspace={WORKSPACES.PLATFORM}>
        <PulseAdminShell />
      </RequireWorkspace>
    </AuthGuard>
  );
}
