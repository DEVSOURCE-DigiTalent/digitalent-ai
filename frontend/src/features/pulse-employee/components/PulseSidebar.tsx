import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Award,
  Bell,
  ClipboardCheck,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Route,
  UserRound,
} from 'lucide-react';
import { useNotifications } from '@/hooks/use-platform';
import { PULSE_PATHS, isExamPath } from '../lib/paths';

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
    to: PULSE_PATHS.practice,
    label: 'Bàn thực hành',
    icon: ClipboardCheck,
    screenId: 'EM-03',
    match: [PULSE_PATHS.practice],
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
  {
    to: PULSE_PATHS.profile,
    label: 'Hồ sơ của tôi',
    icon: UserRound,
    screenId: 'EM-11',
    match: [PULSE_PATHS.profile],
  },
];

export function PulseSidebar() {
  const { pathname } = useLocation();
  const { data: unread } = useNotifications({ unreadOnly: true });
  const hasUnread = Boolean(unread && unread.length > 0);

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pu_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
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

  const onExam = isExamPath(pathname);
  const isItemActive = (item: NavItem) => {
    if (onExam) {
      return item.to === PULSE_PATHS.practice;
    }
    return item.match.some((prefix) =>
      item.end ? pathname === prefix : pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
  };

  return (
    <aside
      className={`pu-side-card${collapsed ? ' is-collapsed' : ' is-expanded'}`}
      aria-label="Menu cá nhân nhân viên"
    >
      {/* ── Top Micro-bar: Nút Thu / Phóng tinh giản không chiếm diện tích ── */}
      <div className="pu-side-card-topbar">
        {!collapsed && <span className="pu-side-card-brand">Nhân viên</span>}
        <button
          type="button"
          onClick={toggleCollapse}
          className="pu-side-card-toggle"
          aria-label={collapsed ? 'Mở rộng thanh menu' : 'Thu gọn thanh menu'}
          title={collapsed ? 'Mở rộng thanh menu' : 'Thu gọn thanh menu'}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      {/* ── Navigation: Danh sách chức năng chuẩn form Personal ────────── */}
      <nav className="pu-side-card-nav" aria-label="Khu học tập nhân viên">
        <ul className="pu-side-card-list">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  data-tour={`side-${item.screenId}`}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={`pu-side-card-item${active ? ' active' : ''}`}
                >
                  <Icon size={18} className="pu-side-card-icon" strokeWidth={active ? 2.2 : 1.8} aria-hidden />
                  {!collapsed && <span className="pu-side-card-label truncate">{item.label}</span>}
                  {!collapsed && item.to === PULSE_PATHS.activity && hasUnread && (
                    <span className="pu-side-card-pill">{unread?.length}</span>
                  )}
                  {collapsed && item.to === PULSE_PATHS.activity && hasUnread && (
                    <span className="pu-side-card-dot" />
                  )}
                  {collapsed && <span className="pu-side-tooltip">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
