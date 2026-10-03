import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { PortalConfig } from '@/lib/portals';
import type { SidebarConfig } from '@/lib/sidebars/types';
import { sidebarFor } from '@/lib/sidebars';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useSidebarState } from '@/hooks/use-sidebar-state';
import { useDialogFocus } from '@/hooks/use-dialog-focus';
import { ROLES, WORKSPACES } from '@/lib/roles';
import { SidebarOrgBlock } from './SidebarOrgBlock';
import { SidebarNav } from './SidebarNav';
import { SidebarFooter } from './SidebarFooter';
import { PLATFORM_SIDEBAR } from '@/lib/sidebars/platform';

interface RoleSidebarProps {
  portal: PortalConfig;
  sidebarConfig?: SidebarConfig;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function RoleSidebar({
  portal,
  sidebarConfig,
  isMobileOpen = false,
  onMobileClose,
}: RoleSidebarProps) {
  const user = useCurrentUser((s) => s.user);
  const { state, toggleCollapsed } = useSidebarState();
  const isRail = state === 'collapsed';
  const { pathname } = useLocation();
  const drawerRef = useRef<HTMLElement>(null);

  // Trap focus inside mobile drawer and handle Escape key
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  useDialogFocus(Boolean(isMobileOpen && isMobile), drawerRef, onMobileClose ?? (() => {}));

  // Close mobile drawer on navigation
  useEffect(() => {
    if (isMobileOpen) onMobileClose?.();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return null;

  const activeConfig: SidebarConfig =
    sidebarConfig ??
    (portal.workspace === WORKSPACES.ENTERPRISE ? sidebarFor(user) : PLATFORM_SIDEBAR);

  const isOwner = user.roles.includes(ROLES.OWNER);
  const usedSeats = user.subscription?.seatsUsed;
  const totalSeats = user.subscription?.seatLimit;

  return (
    <aside
      ref={drawerRef}
      role={isMobile && isMobileOpen ? 'dialog' : undefined}
      aria-modal={isMobile && isMobileOpen ? 'true' : undefined}
      className={cn(
        // Base: fixed sidebar, always rendered for desktop
        'fixed inset-y-0 left-0 z-40 flex flex-col h-dvh',
        'bg-[var(--ent-sidebar)] transition-[width,transform] duration-200 ease-in-out',
        // Width: rail vs full (mobile drawer is always full 288px)
        isRail ? 'w-16' : 'w-[248px] sm:w-[248px]',
        // Mobile: hidden off-screen unless drawer is open
        'md:translate-x-0',
        isMobileOpen ? 'translate-x-0 w-[288px]' : '-translate-x-full md:translate-x-0',
      )}
      aria-label="Thanh điều hướng"
      aria-hidden={!isMobileOpen && isMobile ? true : undefined}
    >
      <SidebarOrgBlock isRail={isRail && !isMobileOpen} />
      <SidebarNav
        config={activeConfig}
        isRail={isRail && !isMobileOpen}
        onItemClick={onMobileClose}
        workspace={portal.workspace}
      />
      <SidebarFooter
        isRail={isRail && !isMobileOpen}
        isOwner={isOwner}
        usedSeats={usedSeats}
        totalSeats={totalSeats}
        onToggleCollapsed={toggleCollapsed}
      />
    </aside>
  );
}
