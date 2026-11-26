import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState, useEffect, useRef } from 'react';
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
import { MANAGER_SIDEBAR } from '@/lib/sidebars/manager';
import type { SidebarConfig } from '@/lib/sidebars/types';
import { findEnterpriseScreen } from '@/lib/screens/enterprise';
import { useDirectionalHeader, useScrollState } from './use-directional-header';
import './owner-header.css';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useTrialLock } from '@/hooks/use-trial-lock';

interface TopbarProps {
  portal: PortalConfig;
  sidebarConfig?: SidebarConfig;
  onOpenMobileNav?: () => void;
  isMobileNavOpen?: boolean;
  autoHide?: boolean;
}

function QuickCreateMenu() {
  useUiLanguage();
  const hasPermission = useCurrentUser((s) => s.hasPermission);
  const [open, setOpen] = useState(false);

  const { isLocked } = useTrialLock();
  const actions = [
    { label: 'Mời thành viên', perm: PERMISSIONS.USER_CREATE, href: '/enterprise/members?invite=1' },
  ].filter((a) => hasPermission(a.perm) && !isLocked(a.href));

  if (actions.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={translateUi("Tạo nhanh")}
        className="flex items-center justify-center size-8 rounded-xl bg-white/80 hover:bg-teal-50 text-slate-600 hover:text-[#137b84] border border-slate-200/80 hover:border-teal-200 transition-all hover:scale-105 active:scale-95 shadow-2xs"
        title={translateUi("Tạo nhanh")}
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
              {translateUi(action.label)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Topbar({ portal, sidebarConfig, onOpenMobileNav, isMobileNavOpen = false, autoHide = false }: TopbarProps) {
  useUiLanguage();
  const { pathname } = useLocation();
  const hasPermission = useCurrentUser((s) => s.hasPermission);
  const canManageSettings = !portal.settingsPermission || hasPermission(portal.settingsPermission);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { scrolled, scrollProgress } = useScrollState();
  const headerRef = useRef<HTMLDivElement>(null);
  const { hidden, reveal } = useDirectionalHeader(headerRef, autoHide, pathname, paletteOpen || isMobileNavOpen);

  const isPlatform = portal.workspace === WORKSPACES.PLATFORM;
  const isManager = sidebarConfig === MANAGER_SIDEBAR;
  const screens = isPlatform ? PLATFORM_SCREENS : undefined;
  const { isLocked: isTrialLocked } = useTrialLock();
  const breadcrumbs = buildBreadcrumbs(pathname, screens, isPlatform ? PLATFORM_SIDEBAR : isManager ? MANAGER_SIDEBAR : undefined);

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
        ref={headerRef}
        data-hidden={hidden}
        onFocusCapture={reveal}
        className={cn(
          'owner-adaptive-header w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-30',
          scrolled ? 'px-3 sm:px-4 lg:px-6 pt-2 pb-1' : 'px-0 pt-0 pb-0',
        )}
      >
        <header
          className={cn(
            // Dropdowns must extend beyond the header; only the progress track clips its contents.
            'flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative overflow-visible',
            scrolled
              ? 'h-12 px-4 lg:px-6 rounded-2xl border border-white/90 shadow-[0_12px_36px_rgba(15,23,42,0.08),_0_2px_8px_rgba(19,123,132,0.06)] backdrop-blur-xl'
              : 'h-14 px-4 lg:px-8 border-b border-slate-200/70 backdrop-blur-md shadow-[0_1px_6px_rgba(15,23,42,0.02)]',
          )}
          style={{
            background: isManager ? 'var(--manager-header)' : scrolled
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
              aria-label={translateUi("Mở điều hướng")}
              aria-expanded={isMobileNavOpen}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb: Tinh tế, font đậm sắc nét */}
            {breadcrumbs.length > 0 && (
              <nav aria-label={translateUi("Đường dẫn")} className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {i > 0 && <span className="text-slate-300 font-light">/</span>}
                    {crumb.href && i < breadcrumbs.length - 1 && !isTrialLocked(crumb.href) ? (
                      <Link
                        to={crumb.href}
                        className="text-slate-500 hover:text-[#137b84] font-medium transition-colors truncate max-w-[180px]"
                      >
                        {translateUi(crumb.label)}
                      </Link>
                    ) : (
                      <span className="text-[#17243f] font-bold tracking-tight truncate max-w-[220px] flex items-center gap-2">
                        <span className={cn("size-2 rounded-full inline-block shadow-2xs", isManager ? "bg-ent-accent" : "bg-[#137b84]")} />
                        {translateUi(crumb.label)}
                      </span>
                    )}
                  </span>
                ))}
              </nav>
            )}
          </div>

          {/* Right actions: Hiệu ứng tươi sáng, linh động */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {!isManager && <div className="hidden sm:flex"><LanguageSwitcher /></div>}
            {/* Quick Search Pill (Ctrl+K) */}
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className={cn("flex items-center justify-center gap-2 rounded-xl bg-white/80 hover:bg-white border border-slate-200/80 hover:border-slate-300 text-slate-500 hover:text-[#17243f] transition-all shadow-2xs hover:shadow-xs group cursor-pointer", isManager ? 'size-8 shrink-0' : 'px-3 py-1.5')}
              aria-label={translateUi("Tìm kiếm")}
              title={translateUi("Tìm kiếm (Ctrl+K)")}
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#137b84] transition-colors" />
              {!isManager && <span className="hidden md:inline text-xs font-medium text-slate-500 group-hover:text-slate-700">{translateUi("Tìm nhanh")}</span>}
              {!isManager && <kbd className="hidden lg:inline text-[10px] font-bold bg-slate-100/80 px-1.5 py-0.5 rounded border border-slate-200/80 text-slate-400 group-hover:text-slate-600 shadow-2xs">Ctrl K</kbd>}
            </button>

            {/* Opens the guide again (its last step points here: data-tour="help"). */}
            {!isManager && <button
              type="button"
              data-tour="help"
              onClick={() => {
                const store = useOnboardingStore.getState();
                store.startTour(isManager ? 'MANAGER' : store.currentRole || 'OWNER');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 hover:border-teal-300 text-teal-800 text-xs font-bold transition-colors cursor-pointer"
              title={translateUi("Xem lại hướng dẫn sử dụng")}
            >
              <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">{translateUi("Hướng dẫn")}</span>
            </button>}

            {/* Quick create menu (+) */}
            {!isManager && <QuickCreateMenu />}

            {/* Notifications */}
            <NotificationPopover notificationsPath={portal.notificationsPath} />

            {/* User Avatar */}
            <UserAvatarMenu
              showLanguageSwitcher={isManager}
              hideFeedbackLinks={isManager}
              onStartTour={isManager ? () => useOnboardingStore.getState().startTour('MANAGER') : undefined}
              accountPath={portal.accountPath}
              learningPath={isManager ? findEnterpriseScreen('EM-01')?.path : undefined}
              settingsPath={isManager ? undefined : portal.settingsPath}
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
              style={{ width: `${scrollProgress}%`, background: isManager ? 'var(--manager-gradient)' : undefined }}
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
