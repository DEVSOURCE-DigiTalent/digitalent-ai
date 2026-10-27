import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Award, Bell, BriefcaseBusiness, LogOut, Sparkles, UserRound } from 'lucide-react';
import pulseMark from '@/assets/pulse/pulse-mark.svg';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLogout } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-platform';
import { useOnboardingStore } from '@/features/onboarding-tutorial';
import { ROLES, normalizeRoles } from '@/lib/roles';
import { initials } from '../lib/labels';
import { PULSE_PATHS, isExamPath } from '../lib/paths';

/** Mục điều hướng chính của nhân viên chỉ có Hôm nay / Lộ trình / Thực hành (§3). */
const NAV = [
  { to: PULSE_PATHS.today, label: 'Hôm nay', end: true, match: [PULSE_PATHS.today], screenId: 'EM-01' },
  { to: PULSE_PATHS.path, label: 'Lộ trình', match: [PULSE_PATHS.path, '/enterprise/me/courses'], screenId: 'EM-02' },
  { to: PULSE_PATHS.practice, label: 'Thực hành', match: [PULSE_PATHS.practice], screenId: 'EM-03' },
];

export function PulseHeader() {
  const user = useCurrentUser((s) => s.user);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();
  const { data: unread } = useNotifications({ unreadOnly: true });
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const roles = normalizeRoles(user?.roles ?? []);
  const workspaceHome = roles.includes(ROLES.OWNER) ? '/enterprise/dashboard' : roles.includes(ROLES.MANAGER) ? '/enterprise/team' : null;
  const roleLabel = roles.includes(ROLES.OWNER) ? 'Chủ doanh nghiệp' : roles.includes(ROLES.MANAGER) ? 'Quản lý' : 'Nhân viên';

  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  // Bài đánh giá trước khi học và bài cuối khóa thuộc "Thực hành" dù đường dẫn nằm dưới khóa học.
  const onFinal = isExamPath(pathname);
  const isActive = (match: string[], end?: boolean) =>
    onFinal
      ? match.includes(PULSE_PATHS.practice)
      : match.some((prefix) => (end ? pathname === prefix : pathname === prefix || pathname.startsWith(`${prefix}/`)));

  const signOut = () =>
    logout.mutate(undefined, { onSettled: () => navigate('/login', { replace: true }) });

  return (
    <header className="pu-header">
      <Link to={PULSE_PATHS.today} className="pu-brand" aria-label="DigiTalent Pulse — Hôm nay">
        <img src={pulseMark} alt="" />
        <span>DigiTalent <em>Pulse</em></span>
      </Link>

      <nav className="pu-nav" aria-label="Học tập của tôi">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            data-tour={item.screenId}
            className={isActive(item.match, item.end) ? 'active' : ''}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="pu-header-actions">
        <button
          type="button"
          onClick={() => useOnboardingStore.getState().startTour('EMPLOYEE')}
          className="pu-icon-btn"
          aria-label="Xem lại hướng dẫn tân thủ"
          title="Xem lại hướng dẫn tân thủ"
        >
          <Sparkles size={18} />
        </button>
        <Link to={PULSE_PATHS.activity} className="pu-icon-btn" aria-label={unread?.length ? `Hoạt động, ${unread.length} chưa đọc` : 'Hoạt động'}>
          <Bell size={18} />
          {Boolean(unread?.length) && <span className="pu-dot" />}
        </Link>
        <div className="pu-menu" ref={menuRef}>
          <button
            type="button"
            className={`pu-profile-chip${pathname === PULSE_PATHS.profile ? ' active' : ''}`}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="pu-avatar" aria-hidden>{initials(user?.fullName)}</span>
            <div>
              <b>{user?.fullName ?? 'Nhân viên'}</b>
              <small>{roleLabel}</small>
            </div>
          </button>
          {open && (
            <div className="pu-menu-panel" role="menu">
              <Link role="menuitem" to={PULSE_PATHS.profile}><UserRound size={16} /> Hồ sơ của tôi</Link>
              <Link role="menuitem" to={PULSE_PATHS.outcomes}><Award size={16} /> Kết quả đã xác nhận</Link>
              <Link role="menuitem" to={PULSE_PATHS.activity}><Bell size={16} /> Hoạt động</Link>
              {workspaceHome && (
                <Link role="menuitem" to={workspaceHome}><BriefcaseBusiness size={16} /> Về không gian quản lý</Link>
              )}
              <hr />
              <button role="menuitem" type="button" onClick={signOut} disabled={logout.isPending}>
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
