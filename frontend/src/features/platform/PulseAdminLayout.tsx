import { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RequireWorkspace } from '@/components/guards/RequireWorkspace';
import { ROLES, WORKSPACES } from '@/lib/roles';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLogout } from '@/hooks/use-auth';
import { initials } from './components/pulse-format';
import { MENTOR_NAV, PLATFORM_NAV } from './platform-nav';
import pulseMark from './assets/pulse-mark.svg';
import {
  Search,
  ChevronDown,
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
  X,
  ArrowRight,
} from 'lucide-react';
import './pulse-mock.css';
import './pulse-admin.css';
import './pulse-catalog.css';
import '@/features/trial-program/mentor-workspace.css';

interface QuickSearchItem {
  title: string;
  category: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}

const MENTOR_QUICK_SEARCH: QuickSearchItem[] = [
  { title: 'Thẩm định năng lực đầu ra', category: 'Nghiệp vụ', path: '/platform/course-reviews', icon: CheckCircle2 },
  { title: 'Hồ sơ cá nhân', category: 'Cài đặt', path: '/platform/account', icon: Settings },
  { title: 'Bảo mật & Xác thực 2 bước', category: 'Cài đặt', path: '/platform/account/security', icon: ShieldCheck },
  { title: 'Trung tâm thông báo', category: 'Cài đặt', path: '/platform/notifications', icon: Bell },
];

/** Header + navy sidebar of the Platform Admin workspace / Full-width executive workbench for Mentor. */
function PulseAdminShell() {
  const user = useCurrentUser((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Mentor (chuyên gia thẩm định năng lực) dùng giao diện tinh gọn, không hiển thị sidebar rườm rà.
  const mentor = Boolean(user?.roles.includes(ROLES.MENTOR) && !user.roles.includes(ROLES.PLATFORM_ADMIN));
  const roleLabel = mentor ? 'Mentor Chuyên môn' : 'Quản trị nền tảng';
  const home = mentor ? '/platform/course-reviews' : '/platform/dashboard';
  const nav = mentor ? MENTOR_NAV : PLATFORM_NAV;
  const name = user?.fullName || user?.email || roleLabel;

  // Keyboard shortcut Ctrl+K / Cmd+K to toggle quick search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setProfileOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [searchModalOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown and modal on route change
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
    if (!q) return MENTOR_QUICK_SEARCH;
    return MENTOR_QUICK_SEARCH.filter(
      (item) => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="pulse-ui" data-testid="platform-layout">
      <header className={`app-header ${mentor ? 'pa-header-mentor' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <NavLink className="brand" to={home} aria-label="DigiTalent AI, trang chủ">
            <img src={pulseMark} alt="" />
            <span>
              DigiTalent <em>AI</em>
            </span>
          </NavLink>

          {/* Top navigation for Mentor */}
          {mentor ? (
            <nav className="pa-mentor-top-nav" aria-label="Điều hướng chính">
              <NavLink
                to="/platform/course-reviews"
                className={({ isActive }) => `pa-mentor-nav-tab${isActive ? ' active' : ''}`}
              >
                <CheckCircle2 size={16} />
                <span>Thẩm định năng lực</span>
              </NavLink>
            </nav>
          ) : (
            <span className="pa-brand-badge">Console Nền tảng</span>
          )}
        </div>

        {/* Search trigger: icon button for mentor, search bar for platform admin */}
        {mentor ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', marginRight: 4 }}>
            <button
              type="button"
              className="pa-search-icon-btn"
              onClick={() => setSearchModalOpen(true)}
              title="Tìm kiếm nhanh (Ctrl+K)"
              aria-label="Tìm kiếm nhanh (Ctrl+K)"
            >
              <Search size={18} />
            </button>
          </div>
        ) : (
          <div className="pa-header-search">
            <Search size={16} className="pa-header-search-icon" />
            <input
              type="search"
              className="pa-header-search-input"
              placeholder="Tìm tổ chức, khóa học, khung chuẩn..."
              aria-label="Tìm kiếm toàn hệ thống"
            />
            <kbd className="pa-header-search-kbd">Ctrl K</kbd>
          </div>
        )}

        {/* Right header actions: Status (Admin only) + Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {!mentor && (
            <div className="pa-system-status" title="Catalog phiên bản neo đang phục vụ">
              <span className="pa-status-dot" aria-hidden="true" />
              <span>Catalog neo v1 · Ổn định</span>
            </div>
          )}

          <div className="pa-profile-container" ref={dropdownRef}>
            <button
              type="button"
              className={`pa-profile-trigger ${mentor ? 'mentor-trigger' : ''}`}
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-expanded={profileOpen}
              aria-haspopup="true"
              aria-label={`Menu người dùng: ${name}`}
            >
              <div className={`pa-avatar-circle ${mentor ? 'indigo' : ''}`}>{initials(name)}</div>
              <div className="pa-profile-info">
                <span className="pa-profile-name">{name}</span>
                <span className={`pa-profile-role ${mentor ? 'indigo' : ''}`}>{roleLabel}</span>
              </div>
              <ChevronDown size={15} style={{ color: '#64748b', marginLeft: 2 }} />
            </button>

            {profileOpen && (
              <div className="pa-dropdown-card" role="menu">
                <div className="pa-dropdown-user-summary">
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{user?.email ?? 'mentor@digitalent.ai'}</div>
                  {mentor && (
                    <span className="pa-mentor-pill-badge">
                      Mentor Chuyên môn
                    </span>
                  )}
                </div>

                {/* Role Switcher only shown for Platform Admin, HIDDEN for Mentor */}
                {!mentor && (
                  <>
                    <div className="pa-dropdown-heading">Chuyển đổi góc nhìn (Role Switcher)</div>
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
                        <span>Chủ doanh nghiệp (Owner)</span>
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
                        <span>Quản lý phòng ban (Manager)</span>
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
                  </>
                )}

                <div className="pa-dropdown-heading">Cài đặt tài khoản</div>
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

      {/* Main Shell: Full-width for Mentor (no sidebar), standard sidebar layout for Platform Admin */}
      <div className={`app-shell ${mentor ? 'role-mentor-shell' : 'role-admin'}`}>
        {!mentor && (
          <aside className="sidebar" aria-label="Điều hướng quản trị nền tảng">
            <div className="pa-side-nav-group">
              <span className="pa-side-nav-title">{roleLabel}</span>
              {nav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/platform/dashboard' || item.to === '/platform/course-reviews'}
                    className={({ isActive }) => `pa-side-nav-link${isActive ? ' active' : ''}`}
                    title={item.description}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>

            <div className="pa-sidebar-footer-card">
              <div className="pa-sidebar-footer-title">
                <CheckCircle2 size={15} style={{ color: '#d97706' }} />
                <span>DigiTalent Platform</span>
              </div>
              <span className="pa-sidebar-footer-sub">
                Khung chuẩn năng lực số
                <br />
                Catalog neo v1 · Ổn định
              </span>
            </div>
          </aside>
        )}

        <main className={`main-area ${mentor ? 'role-mentor-main' : ''}`}>
          <Outlet />
        </main>
      </div>

      {/* Quick Search Modal Dialog */}
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
  return (
    <AuthGuard>
      <RequireWorkspace workspace={WORKSPACES.PLATFORM}>
        <PulseAdminShell />
      </RequireWorkspace>
    </AuthGuard>
  );
}
