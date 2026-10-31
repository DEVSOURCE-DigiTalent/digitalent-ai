import { useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useNotificationHub } from '@/hooks/use-notification-hub';
import type { PortalConfig } from '@/lib/portals';
import { USE_MOCK } from '@/services/mock/mock-config';
import type { SidebarConfig } from '@/lib/sidebars/types';
import { RoleSidebar } from './sidebar';
import { Topbar } from './Topbar';
import { ManagerTopbar } from './ManagerTopbar';
import { MANAGER_SIDEBAR } from '@/lib/sidebars/manager';
import { useSidebarState } from '@/hooks/use-sidebar-state';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';

interface MainLayoutProps {
  portal: PortalConfig;
  sidebarConfig?: SidebarConfig;
  isUnpaid?: boolean;
  /** Nội dung đặt trong khung (mặc định: trang của route con). */
  children?: React.ReactNode;
}

function RealtimeNotifications() {
  useNotificationHub();
  return null;
}

export function MainLayout({ portal, sidebarConfig, isUnpaid = false, children }: MainLayoutProps) {
  const { isMobileOpen, setMobileOpen, toggleCollapsed, state } = useSidebarState();
  const { pathname } = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileOpen) setMobileOpen(false);
      if (event.ctrlKey && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileOpen, setMobileOpen, toggleCollapsed]);

  const user = useCurrentUser((s) => s.user);
  const isOwner = Boolean(user?.roles?.includes(ROLES.OWNER));
  // Không gian Quản lý theo Pulse: thanh đầu trang toàn chiều ngang, menu bên nằm dưới nó, nền sáng.
  const isPulseManager = sidebarConfig === MANAGER_SIDEBAR;
  const sidebarWidth = state === 'collapsed' ? '64px' : isOwner || isPulseManager ? '230px' : '248px';

  const unpaidBanner = isUnpaid && (
    <div
      role="status"
      className="bg-[var(--ent-warn-soft)] border-b border-[var(--ent-warn)] text-ent-warn text-xs font-medium py-1.5 px-4 flex items-center justify-center gap-2 h-[36px]"
    >
      <AlertTriangle className="size-4 shrink-0 text-ent-warn" />
      <span>Gói dịch vụ đã hết hạn. Vui lòng thanh toán hoặc liên hệ Chủ sở hữu để tiếp tục sử dụng.</span>
      {isOwner && (
        <Link
          to="/enterprise/billing"
          className="ml-2 px-2.5 py-0.5 rounded bg-ent-warn text-ent-on-primary text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          Thanh toán ngay
        </Link>
      )}
    </div>
  );

  if (isPulseManager) {
    return (
      <div className="enterprise-shell pm-shell" style={{ '--sidebar-w': sidebarWidth, '--pm-banner-h': isUnpaid ? '36px' : '0px' } as React.CSSProperties}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-2 focus:bg-white focus:text-[#17243f] focus:border focus:rounded-md">
          Bỏ qua đến nội dung
        </a>

        {!USE_MOCK && <RealtimeNotifications />}

        <div className="sticky top-0 z-30">
          <ManagerTopbar portal={portal} isMobileNavOpen={isMobileOpen} onOpenMobileNav={() => setMobileOpen(true)} />
          {unpaidBanner}
        </div>

        {isMobileOpen && (
          <div
            data-testid="sidebar-backdrop"
            aria-hidden="true"
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <RoleSidebar portal={portal} sidebarConfig={sidebarConfig} isMobileOpen={isMobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <main id="main-content" className="pm-main min-w-0 min-h-[calc(100dvh-var(--pm-topbar-h))] md:pl-[var(--sidebar-w)]">
          <div className="pm-main-inner">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="enterprise-shell"
      style={{ 
        '--sidebar-w': sidebarWidth, 
        '--topbar-h': '56px',
        '--banner-h': isUnpaid ? '36px' : '0px',
        '--shell-top': 'calc(var(--topbar-h) + var(--banner-h))'
      } as React.CSSProperties}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-2 focus:bg-ent-card focus:text-ent-fg focus:border focus:border-ent-line focus:rounded-md">
        Bỏ qua đến nội dung
      </a>
      
      {!USE_MOCK && <RealtimeNotifications />}
      
      {isMobileOpen && (
        <div
          data-testid="sidebar-backdrop"
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      <RoleSidebar portal={portal} sidebarConfig={sidebarConfig} isMobileOpen={isMobileOpen} onMobileClose={() => setMobileOpen(false)} />
      
      <div className="flex flex-col min-w-0 min-h-screen md:pl-[var(--sidebar-w)]">
        <div className="sticky top-0 z-30">
          <Topbar portal={portal} isMobileNavOpen={isMobileOpen} onOpenMobileNav={() => setMobileOpen(true)} />
          {unpaidBanner}
        </div>
        <main id="main-content" className="flex-1 bg-ent-bg text-ent-fg">
          <div className="p-4 md:p-6">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
