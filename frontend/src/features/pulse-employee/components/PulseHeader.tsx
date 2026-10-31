import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Compass,
  FileCheck,
  LogOut,
  Search,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import pulseMark from '@/assets/pulse/pulse-mark.svg';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLogout } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-platform';
import { useOnboardingStore } from '@/features/onboarding-tutorial';
import { ROLES, normalizeRoles } from '@/lib/roles';
import { initials } from '../lib/labels';
import { PULSE_PATHS, isExamPath } from '../lib/paths';

/** Mục điều hướng chính của nhân viên chỉ có Tổng quan / Lộ trình / Thực hành. */
const NAV = [
  { to: PULSE_PATHS.today, label: 'Tổng quan', end: true, match: [PULSE_PATHS.today], screenId: 'EM-01' },
  { to: PULSE_PATHS.path, label: 'Lộ trình', match: [PULSE_PATHS.path, '/enterprise/me/courses'], screenId: 'EM-02' },
  { to: PULSE_PATHS.practice, label: 'Khảo thí', match: [PULSE_PATHS.practice], screenId: 'EM-03' },
];

function getPageTitle(pathname: string): string {
  if (pathname === PULSE_PATHS.today) return 'Tổng quan Bàn làm việc';
  if (pathname === PULSE_PATHS.path) return 'Lộ trình Năng lực chức danh';
  if (pathname.startsWith('/enterprise/me/courses')) return 'Chi tiết Khóa học & Đề cương';
  if (pathname === PULSE_PATHS.practice) return 'Khảo thí & Đánh giá Năng lực';
  if (pathname === PULSE_PATHS.outcomes) return 'Bảng Chứng nhận số & Kết quả';
  if (pathname.startsWith('/enterprise/me/outcomes/')) return 'Chi tiết Chứng nhận năng lực';
  if (pathname === PULSE_PATHS.activity) return 'Nhật ký Hoạt động';
  if (pathname === PULSE_PATHS.profile) return 'Hồ sơ cá nhân';
  return 'Cổng học tập DigiTalent AI';
}

const QUICK_SEARCH_ITEMS = [
  { title: 'Tổng quan Bàn làm việc', category: 'Điều hướng', path: PULSE_PATHS.today, icon: Compass },
  { title: 'Lộ trình Năng lực chức danh', category: 'Điều hướng', path: PULSE_PATHS.path, icon: BookOpen },
  { title: 'Khảo thí & Đánh giá Năng lực', category: 'Điều hướng', path: PULSE_PATHS.practice, icon: FileCheck },
  { title: 'Chứng chỉ năng lực số', category: 'Hồ sơ', path: PULSE_PATHS.outcomes, icon: Award },
  { title: 'Hồ sơ năng lực cá nhân', category: 'Hồ sơ', path: PULSE_PATHS.profile, icon: UserRound },
  { title: 'M1-F Tìm kiếm và lưu trữ thông tin cơ bản', category: 'Khóa học', path: '/enterprise/me/courses/course-a1cd1c6e-1be2-4bf9-8f8b-eb1baacfa3f1', icon: BookOpen },
  { title: 'M5-F Xử lý sự cố và tự học công nghệ', category: 'Khóa học', path: '/enterprise/me/courses/course-e5cd1c6e-5be2-4bf9-8f8b-eb1baacfa3f5', icon: BookOpen },
];

export function PulseHeader() {
  const user = useCurrentUser((s) => s.user);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();
  const { data: unread } = useNotifications({ unreadOnly: true });
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const roles = normalizeRoles(user?.roles ?? []);
  const workspaceHome = roles.includes(ROLES.OWNER) ? '/enterprise/dashboard' : roles.includes(ROLES.MANAGER) ? '/enterprise/team' : null;
  const roleLabel = roles.includes(ROLES.OWNER) ? 'Chủ doanh nghiệp' : roles.includes(ROLES.MANAGER) ? 'Quản lý' : 'Nhân viên';

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Phím tắt Ctrl+K mở tìm kiếm
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [searchOpen]);

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

  const onFinal = isExamPath(pathname);
  const isActive = (match: string[], end?: boolean) =>
    onFinal
      ? match.includes(PULSE_PATHS.practice)
      : match.some((prefix) => (end ? pathname === prefix : pathname === prefix || pathname.startsWith(`${prefix}/`)));

  const signOut = () =>
    logout.mutate(undefined, { onSettled: () => navigate('/login', { replace: true }) });

  const pageTitle = getPageTitle(pathname);

  const filteredSearch = searchQuery.trim()
    ? QUICK_SEARCH_ITEMS.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : QUICK_SEARCH_ITEMS;

  return (
    <>
      <header className="pu-header">
        <div className="pu-header-left">
          {/* Brand logo đổi thành DigiTalent AI */}
          <Link to={PULSE_PATHS.today} className="pu-brand" aria-label="DigiTalent AI — Bàn làm việc">
            <img src={pulseMark} alt="" />
            <span>DigiTalent <em>AI</em></span>
          </Link>

          <span className="pu-header-divider" aria-hidden="true" />

          {/* Tiêu đề trang (Đã bỏ thẻ Doanh nghiệp rườm rà) */}
          <div className="pu-header-context" aria-label="Không gian làm việc hiện tại">
            <span className="pu-header-title">{pageTitle}</span>
          </div>
        </div>

        {/* Navigation cho tablet/mobile */}
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
          {/* Nút tìm kiếm nhanh */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="pu-icon-btn pu-header-search-btn"
            aria-label="Tìm kiếm nhanh khóa học và bài thi (Ctrl+K)"
            title="Tìm kiếm nhanh (Ctrl+K)"
          >
            <Search size={18} />
          </button>

          {/* Nút hướng dẫn */}
          <button
            type="button"
            onClick={() => useOnboardingStore.getState().startTour('EMPLOYEE')}
            className="pu-icon-btn pu-header-tour-btn"
            aria-label="Xem lại hướng dẫn thao tác"
            title="Xem lại hướng dẫn thao tác"
          >
            <Sparkles size={18} />
          </button>

          {/* Nút thông báo hoạt động */}
          <Link
            to={PULSE_PATHS.activity}
            className="pu-icon-btn pu-header-bell-btn"
            aria-label={unread?.length ? `Hoạt động, ${unread.length} chưa đọc` : 'Hoạt động'}
            title="Nhật ký hoạt động"
          >
            <Bell size={18} />
            {Boolean(unread?.length) && <span className="pu-dot" />}
          </Link>

          {/* Menu tài khoản người dùng */}
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
                <Link role="menuitem" to={PULSE_PATHS.profile}><UserRound size={16} /> Hồ sơ cá nhân</Link>
                <Link role="menuitem" to={PULSE_PATHS.outcomes}><Award size={16} /> Chứng chỉ năng lực</Link>
                <Link role="menuitem" to={PULSE_PATHS.activity}><Bell size={16} /> Nhật ký hoạt động</Link>
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

      {/* Hộp thoại tra cứu nhanh (Quick Search Modal) */}
      {searchOpen && (
        <div className="pu-search-modal-backdrop" onClick={() => setSearchOpen(false)}>
          <div className="pu-search-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Tìm kiếm nhanh">
            <div className="pu-search-input-wrap">
              <Search size={18} className="pu-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="pu-search-input"
                placeholder="Tìm khóa học, bài thi, chức danh... (hoặc nhấn Esc để thoát)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="pu-search-close-btn"
                onClick={() => setSearchOpen(false)}
                aria-label="Đóng tìm kiếm"
              >
                <X size={16} />
              </button>
            </div>

            <div className="pu-search-results">
              {filteredSearch.length === 0 ? (
                <div className="pu-search-empty">Không tìm thấy kết quả phù hợp với từ khóa.</div>
              ) : (
                filteredSearch.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      className="pu-search-item"
                      onClick={() => {
                        navigate(item.path);
                        setSearchOpen(false);
                      }}
                    >
                      <span className="pu-search-item-icon">
                        <Icon size={16} />
                      </span>
                      <div className="pu-search-item-info">
                        <strong>{item.title}</strong>
                        <small>{item.category}</small>
                      </div>
                      <span className="pu-search-item-arrow">
                        <ArrowRight size={14} />
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="pu-search-footer">
              <span>Mẹo: Nhấn <code>Ctrl+K</code> để mở nhanh tìm kiếm bất kỳ lúc nào</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
