import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Clock,
  Compass,
  FileCheck,
  FileText,
  LogOut,
  Search,
  Sparkles,
  Target,
  UserRound,
  X,
} from 'lucide-react';
import pulseMark from '@/assets/pulse/pulse-mark.svg';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLogout } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-platform';
import { useOnboardingStore } from '@/features/onboarding-tutorial';
import { ROLES, normalizeRoles } from '@/lib/roles';
import { isEnterpriseTrial } from '@/lib/navigation';
import { useMyTrialAssessment } from '@/hooks/use-trial-program';
import { usePulseOverview } from '@/hooks/use-pulse';
import { initials } from '../lib/labels';
import { PULSE_PATHS, isExamPath } from '../lib/paths';
import { trialGateOf, type TrialGateState } from '../lib/trial-gate';

type NavItem = { to: string; label: string; end?: boolean; match: string[]; screenId: string };

/** Mục điều hướng chính của nhân viên. */
const NAV: NavItem[] = [
  { to: PULSE_PATHS.today, label: 'Tổng quan', end: true, match: [PULSE_PATHS.today], screenId: 'EM-01' },
  { to: PULSE_PATHS.path, label: 'Lộ trình', match: [PULSE_PATHS.path, '/enterprise/me/courses'], screenId: 'EM-02' },
  { to: PULSE_PATHS.practice, label: 'Đánh giá', match: [PULSE_PATHS.practice], screenId: 'EM-03' },
];

function getPageTitle(pathname: string): string {
  if (pathname === PULSE_PATHS.today) return 'Tổng quan học tập';
  if (pathname === PULSE_PATHS.path) return 'Lộ trình năng lực';
  if (pathname.startsWith('/enterprise/me/courses')) return 'Chi tiết khóa học';
  if (pathname === PULSE_PATHS.practice) return 'Đánh giá năng lực';
  if (pathname === PULSE_PATHS.trialTest) return 'Báo cáo năng lực đầu vào';
  if (pathname === PULSE_PATHS.outcomes) return 'Chứng nhận và kết quả';
  if (pathname.startsWith('/enterprise/me/outcomes/')) return 'Chi tiết chứng nhận';
  if (pathname === PULSE_PATHS.activity) return 'Hoạt động';
  if (pathname === PULSE_PATHS.profile) return 'Hồ sơ cá nhân';
  if (pathname === PULSE_PATHS.feedbacks) return 'Góp ý của tôi';
  if (pathname === PULSE_PATHS.bugReports) return 'Báo lỗi của tôi';
  return 'Cổng đào tạo DigiTalent AI';
}

const QUICK_SEARCH_ITEMS = [
  { title: 'Tổng quan học tập', category: 'Điều hướng', path: PULSE_PATHS.today, icon: Compass },
  { title: 'Lộ trình năng lực', category: 'Điều hướng', path: PULSE_PATHS.path, icon: BookOpen },
  { title: 'Đánh giá năng lực', category: 'Điều hướng', path: PULSE_PATHS.practice, icon: FileCheck },
  { title: 'Chứng nhận và kết quả', category: 'Hồ sơ', path: PULSE_PATHS.outcomes, icon: Award },
  { title: 'Hồ sơ cá nhân', category: 'Hồ sơ', path: PULSE_PATHS.profile, icon: UserRound },
  { title: 'M1-F Tìm kiếm và lưu trữ thông tin cơ bản', category: 'Khóa học', path: '/enterprise/me/courses/course-a1cd1c6e-1be2-4bf9-8f8b-eb1baacfa3f1', icon: BookOpen },
  { title: 'M5-F Xử lý sự cố và tự học công nghệ', category: 'Khóa học', path: '/enterprise/me/courses/course-e5cd1c6e-5be2-4bf9-8f8b-eb1baacfa3f5', icon: BookOpen },
];

/** Doanh nghiệp dùng thử: trang Học thử (sáu khóa Cơ bản), bài đánh giá tổng hợp ("Kết quả test" khi đã công bố) và bài đã nộp. */
const TRIAL_NAV: NavItem[] = [
  { to: PULSE_PATHS.path, label: 'Học thử', match: [PULSE_PATHS.path, '/enterprise/me/courses'], screenId: 'EM-02' },
  { to: PULSE_PATHS.trialTest, label: 'Bài đánh giá', match: [PULSE_PATHS.trialTest], screenId: 'EM-T1' },
  { to: PULSE_PATHS.practice, label: 'Thực hành', match: [PULSE_PATHS.practice], screenId: 'EM-03' },
];

export interface PulseHeaderProps {
  gate?: TrialGateState | null;
  isGateActive?: boolean;
}

export function PulseHeader({ gate, isGateActive }: PulseHeaderProps = {}) {
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
  const trial = Boolean(user && isEnterpriseTrial(user));
  const { data: myTrial } = useMyTrialAssessment(trial);
  const { data: overview } = usePulseOverview();
  const hasRoadmap = Boolean(overview?.hasPosition && overview.hasTargets && !overview.awaitingFramework);

  const activeGate = gate !== undefined ? gate : trialGateOf(myTrial, undefined, roles.includes(ROLES.OWNER));
  const isGated = isGateActive !== undefined ? isGateActive : Boolean(trial && activeGate);

  // Tài khoản mới vào làm bài đánh giá và chưa có công bố khung năng lực từ doanh nghiệp:
  // Hiển thị thanh dùng thử (Học thử / Bài đánh giá / Thực hành).
  // Khi đã có lộ trình từ doanh nghiệp (đã setup khung năng lực):
  // Hiển thị thanh điều hướng chính thức: Hôm nay / Lộ trình / Thực hành.
  const isPreRoadmapTrial = trial && !hasRoadmap;
  const nav = isPreRoadmapTrial
    ? TRIAL_NAV.map((item) => (item.screenId === 'EM-T1' && myTrial?.status === 'REVIEWED' ? { ...item, label: 'Kết quả khảo sát' } : item))
    : NAV;
  const workspaceHome = roles.includes(ROLES.OWNER)
    ? '/enterprise/dashboard'
    : roles.includes(ROLES.MANAGER) ? '/enterprise/team' : null;
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
          {/* Brand logo - nếu đang bị gate thì chỉ link tới trang bài test */}
          <Link
            to={isGated ? PULSE_PATHS.trialTest : isPreRoadmapTrial ? PULSE_PATHS.path : PULSE_PATHS.today}
            className="pu-brand"
            aria-label="DigiTalent AI — Bàn làm việc"
          >
            <img src={pulseMark} alt="" />
            <span>DigiTalent <em>AI</em></span>
          </Link>

          <span className="pu-header-divider" aria-hidden="true" />

          {/* Tiêu đề trang hoặc Huy hiệu trạng thái Gate */}
          <div className="pu-header-context" aria-label="Không gian làm việc hiện tại">
            {isGated ? (
              <span className={`pu-header-badge-gated ${activeGate === 'waiting' ? 'waiting' : 'todo'}`}>
                {activeGate === 'waiting' ? (
                  <>
                    <Clock size={14} /> <span>Đang xử lý kết quả khảo thí</span>
                  </>
                ) : (
                  <>
                    <Target size={14} /> <span>Đánh giá năng lực đầu vào (Bắt buộc)</span>
                  </>
                )}
              </span>
            ) : (
              <span className="pu-header-title">{pageTitle}</span>
            )}
          </div>
        </div>

        {/* Navigation - Ẩn hoàn toàn khi đang ở Gate mode */}
        {!isGated && (
          <nav className="pu-nav" aria-label="Học tập của tôi">
            {nav.map((item) => (
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
        )}

        <div className="pu-header-actions">
          {/* Nút tìm kiếm nhanh - ẩn khi bị gate */}
          {!isGated && (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="pu-icon-btn pu-header-search-btn"
              aria-label="Tìm kiếm nhanh khóa học và bài đánh giá (Ctrl+K)"
              title="Tìm kiếm nhanh (Ctrl+K)"
            >
              <Search size={18} />
            </button>
          )}

          {/* Nút hướng dẫn - ẩn khi bị gate */}
          {!trial && !isGated && (
            <button
              type="button"
              onClick={() => useOnboardingStore.getState().startTour('EMPLOYEE')}
              className="pu-icon-btn pu-header-tour-btn"
              aria-label="Xem lại hướng dẫn thao tác"
              title="Xem lại hướng dẫn thao tác"
            >
              <Sparkles size={18} />
            </button>
          )}

          {/* Nút thông báo hoạt động - ẩn khi bị gate */}
          {!isGated && (
            <Link
              to={PULSE_PATHS.activity}
              className="pu-icon-btn pu-header-bell-btn"
              aria-label={unread?.length ? `Hoạt động, ${unread.length} chưa đọc` : 'Hoạt động'}
              title="Nhật ký hoạt động"
            >
              <Bell size={18} />
              {Boolean(unread?.length) && <span className="pu-dot" />}
            </Link>
          )}

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
                {isGated ? (
                  <>
                    <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--pu-muted)' }}>
                      {activeGate === 'waiting'
                        ? 'Bài thi đã nộp. Đang chờ doanh nghiệp công bố kết quả.'
                        : 'Vui lòng hoàn thành bài đánh giá năng lực đầu vào.'}
                    </div>
                    <hr />
                    <button role="menuitem" type="button" onClick={signOut} disabled={logout.isPending}>
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link role="menuitem" to={PULSE_PATHS.profile}><UserRound size={16} /> Hồ sơ cá nhân</Link>
                    <Link role="menuitem" to={PULSE_PATHS.outcomes}><Award size={16} /> Chứng chỉ năng lực</Link>
                    {(myTrial?.status !== 'NOT_STARTED' || overview?.placementTest?.hasTaken) && (
                      <Link role="menuitem" to={PULSE_PATHS.trialTest}><FileText size={16} /> Kết quả đánh giá đầu vào</Link>
                    )}
                    <Link role="menuitem" to={PULSE_PATHS.activity}><Bell size={16} /> Nhật ký hoạt động</Link>
                    {workspaceHome && (
                      <Link role="menuitem" to={workspaceHome}><BriefcaseBusiness size={16} /> Về không gian quản lý</Link>
                    )}
                    <hr />
                    <button role="menuitem" type="button" onClick={signOut} disabled={logout.isPending}>
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </>
                )}
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
                placeholder="Tìm khóa học, bài đánh giá, chức danh... (hoặc nhấn Esc để thoát)"
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
