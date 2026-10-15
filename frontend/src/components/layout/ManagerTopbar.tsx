import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import pulseMark from '@/assets/pulse/pulse-mark.svg';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { PortalConfig } from '@/lib/portals';
import { matchPath } from '@/lib/breadcrumbs';
import { findScreen } from '@/lib/screens';
import { USE_MOCK } from '@/services/mock/mock-config';
import { NotificationPopover } from './NotificationPopover';
import { UserAvatarMenu } from './UserAvatarMenu';
import { CommandPalette } from './CommandPalette';

/** Điều hướng trung tâm của bản Pulse (Tổng quan / Năng lực / Khóa học / Báo cáo), trỏ vào màn hình trong sitemap. */
const TOP_NAV: { label: string; screenId: string; matchFor: string[] }[] = [
  { label: 'Tổng quan', screenId: 'MG-01', matchFor: [] },
  { label: 'Năng lực', screenId: 'MG-05', matchFor: ['MG-02', 'MG-03', 'MG-04', 'MG-15'] },
  { label: 'Khóa học', screenId: 'MG-06', matchFor: ['MG-07', 'MG-13'] },
  { label: 'Báo cáo', screenId: 'MG-14', matchFor: [] },
];

interface ManagerTopbarProps {
  portal: PortalConfig;
  onOpenMobileNav?: () => void;
  isMobileNavOpen?: boolean;
}

/**
 * Thanh đầu trang của không gian Quản lý (mock `.app-header`): logo bên trái, bốn mục chính ở giữa, thông báo,
 * tìm kiếm (Ctrl+K) và menu tài khoản bên phải. Nhãn "Bản xem trước tương tác" chỉ hiện khi chạy dữ liệu mẫu.
 */
export function ManagerTopbar({ portal, onOpenMobileNav, isMobileNavOpen = false }: ManagerTopbarProps) {
  const { pathname } = useLocation();
  const user = useCurrentUser((s) => s.user);
  const hasPermission = useCurrentUser((s) => s.hasPermission);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const items = TOP_NAV.flatMap((item) => {
    const screen = findScreen(item.screenId);
    if (!screen) return [];
    if (screen.permission && !hasPermission(screen.permission)) return [];
    if (!screen.roles.includes('*') && !screen.roles.some((role) => user?.roles.includes(role))) return [];
    return [{ ...item, path: screen.path }];
  });

  // Mục có đường dẫn khớp dài nhất thắng: /enterprise/team/reports thuộc "Báo cáo", không thuộc "Tổng quan".
  let activeId: string | null = null;
  let best = -1;
  for (const item of items) {
    for (const id of [item.screenId, ...item.matchFor]) {
      const path = findScreen(id)?.path;
      if (path && matchPath(path, pathname) && path.length > best) {
        best = path.length;
        activeId = item.screenId;
      }
    }
  }

  return (
    <>
      <header className="pm-topbar">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="pm-icon-btn pm-menu-btn -ml-2"
            aria-label="Mở điều hướng"
            aria-expanded={isMobileNavOpen}
          >
            <Menu className="size-5" />
          </button>
          <Link to={items[0]?.path ?? '/enterprise'} className="pm-brand" aria-label="DigiTalent Pulse — Tổng quan">
            <img src={pulseMark} alt="" />
            <span>DigiTalent <em>Pulse</em></span>
          </Link>
        </div>

        <nav className="pm-topnav" aria-label="Không gian quản lý">
          {items.map((item) => (
            <Link key={item.screenId} to={item.path} aria-current={activeId === item.screenId ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="pm-top-actions">
          {USE_MOCK && <span className="pm-preview-chip">Bản xem trước tương tác</span>}
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="pm-icon-btn"
            aria-label="Tìm kiếm"
            title="Tìm kiếm (Ctrl+K)"
          >
            <Search className="size-4" />
          </button>
          <NotificationPopover notificationsPath={portal.notificationsPath} />
          {/* Quản lý vẫn tự học trên lộ trình của mình (cổng nhân viên Pulse, EM-01). */}
          <UserAvatarMenu accountPath={portal.accountPath} learningPath={findScreen('EM-01')?.path} />
        </div>
      </header>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
