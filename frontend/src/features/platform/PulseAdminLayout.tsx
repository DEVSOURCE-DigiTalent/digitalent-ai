import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RequireWorkspace } from '@/components/guards/RequireWorkspace';
import { WORKSPACES } from '@/lib/roles';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLogout } from '@/hooks/use-auth';
import { initials } from './components/pulse-format';
import { PLATFORM_NAV, PLATFORM_TOP_LINKS } from './platform-nav';
import pulseMark from './assets/pulse-mark.svg';
import './pulse-mock.css';
import './pulse-admin.css';
import './pulse-catalog.css';

/** Header + navy sidebar of the Pulse mock's Platform Admin workspace (`app-shell role-admin`). */
function PulseAdminShell() {
  const user = useCurrentUser((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const name = user?.fullName || user?.email || 'Quản trị nền tảng';

  const signOut = () => logout.mutate(undefined, { onSettled: () => navigate('/login', { replace: true }) });

  return (
    <div className="pulse-ui" data-testid="platform-layout">
      <header className="app-header">
        <NavLink className="brand" to="/platform/dashboard" aria-label="DigiTalent Pulse, trang tổng quan">
          <img src={pulseMark} alt="" />
          <span>
            DigiTalent <em>Pulse</em>
          </span>
        </NavLink>
        <nav className="top-links" aria-label="Nền tảng">
          {PLATFORM_TOP_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/platform/dashboard'}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <NavLink className="profile-header-link profile-header-admin" to="/platform/account" aria-label={`Hồ sơ của tôi: ${name}`}>
            <span className="profile-header-avatar" aria-hidden="true">
              {initials(name)}
            </span>
            <span className="profile-header-text">
              <b>{name}</b>
              <small>Quản trị nền tảng</small>
            </span>
          </NavLink>
          <button type="button" className="btn btn-outline btn-small pa-logout" onClick={signOut} disabled={logout.isPending}>
            Đăng xuất
          </button>
        </div>
      </header>
      <div className="app-shell role-admin">
        <aside className="sidebar" aria-label="Điều hướng quản trị nền tảng">
          <div className="side-group">
            <span className="side-label">Quản trị nền tảng</span>
            {PLATFORM_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/platform/dashboard'}
                className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}
              >
                <b aria-hidden="true">{item.glyph}</b>
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="side-foot">
            <b>Không gian quản trị nền tảng</b>Chuẩn chung · hỗ trợ khách hàng
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
