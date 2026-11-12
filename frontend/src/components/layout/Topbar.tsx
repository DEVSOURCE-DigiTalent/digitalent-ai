import { useState, useEffect } from 'react';
import { Search, Menu, Plus, HelpCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useOnboardingStore } from '@/features/onboarding-tutorial';
import { PERMISSIONS } from '@/hooks/use-permission';
import type { PortalConfig } from '@/lib/portals';
import { buildBreadcrumbs } from '@/lib/breadcrumbs';
import { NotificationPopover } from './NotificationPopover';
import { UserAvatarMenu } from './UserAvatarMenu';
import { CommandPalette } from './CommandPalette';
import { cn } from '@/lib/utils';
import { WORKSPACES } from '@/lib/roles';
import { PLATFORM_SCREENS } from '@/lib/screens/platform';
import { PLATFORM_SIDEBAR } from '@/lib/sidebars/platform';

interface TopbarProps {
  portal: PortalConfig;
  onOpenMobileNav?: () => void;
  isMobileNavOpen?: boolean;
}

function useScrollState() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      const winHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (winHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (y / winHeight) * 100)));
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return { scrolled, scrollProgress };
}

function QuickCreateMenu() {
  const hasPermission = useCurrentUser((s) => s.hasPermission);
  const [open, setOpen] = useState(false);

  const actions = [
    { label: 'Mời thành viên', perm: PERMISSIONS.USER_CREATE, href: '/enterprise/members?invite=1' },
    { label: 'Tạo đợt đào tạo', perm: PERMISSIONS.COURSE_ASSIGNMENT_CREATE, href: '/enterprise/training-batches/new' },
    { label: 'Giao nhiệm vụ', perm: PERMISSIONS.TASK_ASSIGN, href: '/enterprise/tasks/new' },
  ].filter((a) => hasPermission(a.perm));

  if (actions.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Tạo nhanh"
        className="flex items-center justify-center size-8 rounded-xl bg-white/80 hover:bg-teal-50 text-slate-600 hover:text-[#137b84] border border-slate-200/80 hover:border-teal-200 transition-all hover:scale-105 active:scale-95 shadow-2xs"
        title="Tạo nhanh"
      >
        <Plus className="w-4 h-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150"
          onBlur={() => setOpen(false)}
        >
          {actions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-[#137b84] transition-colors"
              onClick={() => setOpen(false)}
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Topbar({ portal, onOpenMobileNav, isMobileNavOpen = false }: TopbarProps) {
  const { pathname } = useLocation();
  const hasPermission = useCurrentUser((s) => s.hasPermission);
  const canManageSettings = !portal.settingsPermission || hasPermission(portal.settingsPermission);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { scrolled, scrollProgress } = useScrollState();

  const isPlatform = portal.workspace === WORKSPACES.PLATFORM;
  const screens = isPlatform ? PLATFORM_SCREENS : undefined;
  const sidebarConfig = isPlatform ? PLATFORM_SIDEBAR : undefined;
  const breadcrumbs = buildBreadcrumbs(pathname, screens, sidebarConfig);

  // Global Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* Outer Wrapper: Tự động co giãn mượt mà khi cuộn trang */}
      <div
        className={cn(
          'w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-30',
          scrolled ? 'px-3 sm:px-4 lg:px-6 pt-2 pb-1' : 'px-0 pt-0 pb-0',
        )}
      >
        <header
          className={cn(
            'flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative',
            scrolled
              ? 'h-12 px-4 lg:px-6 rounded-2xl border border-white/90 shadow-[0_12px_36px_rgba(15,23,42,0.08),_0_2px_8px_rgba(19,123,132,0.06)] backdrop-blur-xl'
              : 'h-14 px-4 lg:px-8 border-b border-slate-200/70 backdrop-blur-md shadow-[0_1px_6px_rgba(15,23,42,0.02)]',
          )}
          style={{
            background: scrolled
              ? `linear-gradient(90deg,
                  rgba(224, 247, 244, 0.88) 0%,
                  rgba(235, 245, 255, 0.82) 28%,
                  rgba(248, 250, 252, 0.84) 60%,
                  rgba(255, 255, 255, 0.92) 100%
                )`
              : `linear-gradient(90deg,
                  rgba(224, 247, 244, 0.94) 0%,
                  rgba(235, 245, 255, 0.88) 28%,
                  rgba(245, 247, 250, 0.9) 60%,
                  rgba(255, 255, 255, 0.96) 100%
                )`,
          }}
        >
          {/* Left: menu button + breadcrumb với hiệu ứng pastel mờ dần */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onOpenMobileNav}
              className="md:hidden p-1.5 -ml-1 rounded-xl text-slate-600 hover:bg-white/80 hover:text-slate-900 transition-colors"
              aria-label="Mở điều hướng"
              aria-expanded={isMobileNavOpen}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb: Tinh tế, font đậm sắc nét */}
            {breadcrumbs.length > 0 && (
              <nav aria-label="Đường dẫn" className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {i > 0 && <span className="text-slate-300 font-light">/</span>}
                    {crumb.href && i < breadcrumbs.length - 1 ? (
                      <Link
                        to={crumb.href}
                        className="text-slate-500 hover:text-[#137b84] font-medium transition-colors truncate max-w-[180px]"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-[#17243f] font-bold tracking-tight truncate max-w-[220px] flex items-center gap-2">
                        <span className="size-2 rounded-full bg-[#137b84] inline-block shadow-2xs" />
                        {crumb.label}
                      </span>
                    )}
                  </span>
                ))}
              </nav>
            )}
          </div>

          {/* Right actions: Hiệu ứng tươi sáng, linh động */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Search Pill (Ctrl+K) */}
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-slate-200/80 hover:border-slate-300 text-slate-500 hover:text-[#17243f] transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
              aria-label="Tìm kiếm"
              title="Tìm kiếm (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#137b84] transition-colors" />
              <span className="hidden md:inline text-xs font-medium text-slate-500 group-hover:text-slate-700">Tìm nhanh</span>
              <kbd className="hidden lg:inline text-[10px] font-bold bg-slate-100/80 px-1.5 py-0.5 rounded border border-slate-200/80 text-slate-400 group-hover:text-slate-600 shadow-2xs">Ctrl K</kbd>
            </button>

            {/* Hướng dẫn Button: Pill gradient sang xịn */}
            <button
              type="button"
              onClick={() => {
                const store = useOnboardingStore.getState();
                store.startTour(store.currentRole || 'OWNER');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50/90 to-purple-50/90 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200/70 hover:border-indigo-300 text-indigo-700 hover:text-indigo-800 text-xs font-bold transition-all shadow-2xs hover:shadow-xs hover:-translate-y-0.2 cursor-pointer"
              title="Xem lại hướng dẫn sử dụng"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Hướng dẫn</span>
            </button>

            {/* Quick create menu (+) */}
            <QuickCreateMenu />

            {/* Notifications */}
            <NotificationPopover notificationsPath={portal.notificationsPath} />

            {/* User Avatar */}
            <UserAvatarMenu
              accountPath={portal.accountPath}
              settingsPath={portal.settingsPath}
              canManageSettings={canManageSettings}
            />
          </div>

          {/* Hairline Scroll Progress Indicator at bottom of navbar */}
          <div
            className={cn(
              'absolute bottom-0 left-3 right-3 h-[1.5px] rounded-full overflow-hidden bg-slate-200/30 transition-opacity duration-300 pointer-events-none',
              scrolled ? 'opacity-100' : 'opacity-0',
            )}
          >
            <div
              className="h-full bg-gradient-to-r from-[#137b84] via-[#0284c7] to-[#10b981] rounded-full transition-all duration-150"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </header>

        {/* Soft Dissolving Mask below floating navbar: nội dung khi cuộn lên sẽ mờ tan êm ái */}
        <div
          className={cn(
            'pointer-events-none absolute -bottom-3 left-0 right-0 h-4 bg-gradient-to-b from-white/30 to-transparent transition-opacity duration-300',
            scrolled ? 'opacity-100' : 'opacity-0',
          )}
        />
      </div>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
