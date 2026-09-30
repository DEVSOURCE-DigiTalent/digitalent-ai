import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useNotificationHub } from '@/hooks/use-notification-hub';
import { RoleSidebar } from './RoleSidebar';
import { Topbar } from './Topbar';

/**
 * Enterprise layout shell: RoleSidebar + Topbar + Content area.
 * Maps to IA Document section 4.1: Application Shell.
 * Below the md breakpoint the sidebar is a drawer opened from the Topbar.
 */
export function MainLayout() {
  // Thông báo realtime (SignalR) cho mọi trang enterprise
  useNotificationHub();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const closeMobileNav = () => setIsMobileNavOpen(false);
  const { pathname } = useLocation();

  // Close the drawer on any navigation (links, back/forward) and on Escape
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileNavOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileNavOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileNavOpen]);

  return (
    <div className="min-h-screen flex">
      {isMobileNavOpen && (
        <div
          data-testid="sidebar-backdrop"
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={closeMobileNav}
        />
      )}
      <RoleSidebar isMobileOpen={isMobileNavOpen} onMobileClose={closeMobileNav} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar isMobileNavOpen={isMobileNavOpen} onOpenMobileNav={() => setIsMobileNavOpen(true)} />
        <main className="flex-1 bg-surface overflow-auto">
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
