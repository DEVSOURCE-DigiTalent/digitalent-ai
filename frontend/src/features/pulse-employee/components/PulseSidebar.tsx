import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Award,
  Bell,
  Bug,
  LayoutDashboard,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Route,
} from 'lucide-react';
import { useNotifications } from '@/hooks/use-platform';
import { PULSE_PATHS, isModulePath } from '../lib/paths';

/**
 * Pulse Employee Sidebar — Thiết kế khung nhỏ dạng Card nổi chuẩn phong cách Personal
 * - Form chuẩn 1:1 theo ảnh mẫu Personal Dashboard: Floating Card bo tròn 16px, padding 8px.
 * - Active Item: Viền vàng Amber thương hiệu DigiTalent (#d97706), nền tint ấm, icon & text vàng hổ phách.
 * - Thu phóng (Collapse / Expand): Nút toggle tinh tế ở góc thẻ, thu gọn thành thanh icon 58px kèm tooltip.
 * - Không nhồi nhét tiêu đề thô hay nút thừa trong card, giữ trọn vẻ đẹp tối giản, thanh lịch.
 */
export interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  screenId: string;
  end?: boolean;
  match: string[];
}

const SIDEBAR_ITEMS: NavItem[] = [
  {
    to: PULSE_PATHS.today,
    label: 'Tổng quan',
    icon: LayoutDashboard,
    screenId: 'EM-01',
    end: true,
    match: [PULSE_PATHS.today],
  },
  {
    to: PULSE_PATHS.path,
    label: 'Lộ trình năng lực',
    icon: Route,
    screenId: 'EM-02',
    match: [PULSE_PATHS.path, '/enterprise/me/courses'],
  },
  {
    to: PULSE_PATHS.outcomes,
    label: 'Chứng nhận số',
    icon: Award,
    screenId: 'EM-08',
    match: [PULSE_PATHS.outcomes],
  },
  {
    to: PULSE_PATHS.activity,
    label: 'Nhật ký hoạt động',
    icon: Bell,
    screenId: 'EM-10',
    match: [PULSE_PATHS.activity],
  },
  // Hồ sơ cá nhân (EM-11) chỉ mở từ menu ảnh đại diện ở thanh trên cùng, không nằm trong menu bên.
  {
    to: PULSE_PATHS.feedbacks,
    label: 'Góp ý',
    icon: MessageSquare,
    screenId: 'EM-13',
    match: [PULSE_PATHS.feedbacks],
  },
  {
    to: PULSE_PATHS.bugReports,
    label: 'Báo lỗi',
    icon: Bug,
    screenId: 'EM-14',
    match: [PULSE_PATHS.bugReports],
  },
];

const MANAGER_TOOLS = new Set<string>([PULSE_PATHS.activity, PULSE_PATHS.feedbacks, PULSE_PATHS.bugReports]);

export function PulseSidebar({ trialLearning = false, manager = false }: { trialLearning?: boolean; manager?: boolean } = {}) {
  useUiLanguage();
  const { pathname } = useLocation();
  const { data: unread } = useNotifications({ unreadOnly: true });
  const hasUnread = Boolean(unread && unread.length > 0);
  const items = SIDEBAR_ITEMS.filter((item) =>
    (!trialLearning || item.to !== PULSE_PATHS.today) && (!manager || !MANAGER_TOOLS.has(item.to)),
  );

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pu_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // A module page already has its own course outline column: the menu starts as the icon rail there,
  // can still be opened, and the saved preference of the other pages is left untouched.
  const onModule = isModulePath(pathname);
  const [moduleExpanded, setModuleExpanded] = useState(false);
  const isCollapsed = onModule ? !moduleExpanded : collapsed;

  const toggleCollapse = () => {
    if (onModule) {
      setModuleExpanded((prev) => !prev);
      return;
    }
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('pu_sidebar_collapsed', String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  // Trang làm bài nằm dưới /enterprise/me/courses nên mục Lộ trình năng lực sáng lên.
  const isItemActive = (item: NavItem) =>
    item.match.some((prefix) =>
      item.end ? pathname === prefix : pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

  return (
    <aside
      className={`pu-side-card${isCollapsed ? ' is-collapsed' : ' is-expanded'}`}
      aria-label={manager ? translateUi('Học tập của tôi') : 'Menu cá nhân nhân viên'}
    >
      {/* ── Top Micro-bar: Nút Thu / Phóng tinh giản không chiếm diện tích ── */}
      <div className="pu-side-card-topbar">
        {!isCollapsed && <span className="pu-side-card-brand">{translateUi(manager ? 'Học tập của tôi' : 'Nhân viên')}</span>}
        <button
          type="button"
          onClick={toggleCollapse}
          className="pu-side-card-toggle"
          aria-label={translateUi(isCollapsed ? 'Mở rộng thanh menu' : 'Thu gọn thanh menu')}
          title={translateUi(isCollapsed ? 'Mở rộng thanh menu' : 'Thu gọn thanh menu')}
        >
          {isCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      {/* ── Navigation: Danh sách chức năng chuẩn form Personal ────────── */}
      <nav className="pu-side-card-nav" aria-label={manager ? translateUi('Điều hướng học tập') : 'Cổng đào tạo nhân viên'}>
        <ul className="pu-side-card-list">
          {items.map((item) => {
            const label = trialLearning && item.to === PULSE_PATHS.path ? 'Học thử' : item.label;
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  data-tour={`side-${item.screenId}`}
                  aria-label={translateUi(label)}
                  aria-current={active ? 'page' : undefined}
                  className={`pu-side-card-item${active ? ' active' : ''}`}
                >
                  <Icon size={18} className="pu-side-card-icon" strokeWidth={active ? 2.2 : 1.8} aria-hidden />
                  {!isCollapsed && <span className="pu-side-card-label truncate">{translateUi(label)}</span>}
                  {!isCollapsed && item.to === PULSE_PATHS.activity && hasUnread && (
                    <span className="pu-side-card-pill">{unread?.length}</span>
                  )}
                  {isCollapsed && item.to === PULSE_PATHS.activity && hasUnread && (
                    <span className="pu-side-card-dot" />
                  )}
                  {isCollapsed && <span className="pu-side-tooltip">{translateUi(label)}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
