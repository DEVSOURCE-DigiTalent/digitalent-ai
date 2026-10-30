import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RequireWorkspace } from '@/components/guards/RequireWorkspace';
import { WORKSPACES } from '@/lib/roles';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLogout } from '@/hooks/use-auth';
import { initials } from './components/pulse-format';
import { PLATFORM_NAV } from './platform-nav';
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
} from 'lucide-react';
import './pulse-mock.css';
import './pulse-admin.css';
import './pulse-catalog.css';

/** Header + navy sidebar of the Pulse mock's Platform Admin workspace (`app-shell role-admin`). */
function PulseAdminShell() {
  const user = useCurrentUser((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const name = user?.fullName || user?.email || 'Quản trị nền tảng';

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  const signOut = () => {
    setProfileOpen(false);
    logout.mutate(undefined, { onSettled: () => navigate('/login', { replace: true }) });
  };

  return (
    <div className="pulse-ui" data-testid="platform-layout">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <NavLink className="brand" to="/platform/dashboard" aria-label="DigiTalent Pulse, trang tổng quan">
            <img src={pulseMark} alt="" />
            <span>
              DigiTalent <em>Pulse</em>
            </span>
          </NavLink>
          <span className="pa-brand-badge">Console Nền tảng</span>
        </div>

        {/* Quick Search trigger */}
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

        {/* Right header actions: Status + Role Switcher & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="pa-system-status" title="Catalog phiên bản neo đang phục vụ">
            <span className="pa-status-dot" aria-hidden="true" />
            <span>Catalog ⚓ v1 · Ổn định</span>
          </div>

          <div className="pa-profile-container" ref={dropdownRef}>
            <button
              type="button"
              className="pa-profile-trigger"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-expanded={profileOpen}
              aria-haspopup="true"
              aria-label={`Menu người dùng: ${name}`}
            >
              <div className="pa-avatar-circle">{initials(name)}</div>
              <div className="pa-profile-info">
                <span className="pa-profile-name">{name}</span>
                <span className="pa-profile-role">Quản trị nền tảng</span>
              </div>
              <ChevronDown size={15} style={{ color: '#64748b', marginLeft: 2 }} />
            </button>

            {profileOpen && (
              <div className="pa-dropdown-card" role="menu">
                <div className="pa-dropdown-user-summary">
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{user?.email ?? 'admin@digitalent.vn'}</div>
                </div>

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

                <div className="pa-dropdown-heading">Cài đặt tài khoản</div>
                <NavLink to="/platform/account" className="pa-dropdown-menu-item" onClick={() => setProfileOpen(false)}>
                  <Settings size={15} style={{ color: '#64748b' }} />
                  <span>Hồ sơ quản trị viên</span>
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

      <div className="app-shell role-admin">
        <aside className="sidebar" aria-label="Điều hướng quản trị nền tảng">
          <div className="pa-side-nav-group">
            <span className="pa-side-nav-title">Vận hành nền tảng</span>
            {PLATFORM_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/platform/dashboard'}
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
              <span style={{ color: '#d97706', fontSize: 14 }}>⚓</span>
              <span>DigiTalent Platform</span>
            </div>
            <span className="pa-sidebar-footer-sub">
              Chuẩn TT 02/2025/TT-BGDĐT
              <br />
              Catalog neo v1 · Ổn định
            </span>
          </div>
        </aside>

        <main className="main-area">
          <Outlet />
        </main>
      </div>
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

