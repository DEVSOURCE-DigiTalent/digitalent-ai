import { useState, useEffect } from 'react';
import { Search, Menu, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { PERMISSIONS } from '@/hooks/use-permission';
import type { PortalConfig } from '@/lib/portals';
import { buildBreadcrumbs } from '@/lib/breadcrumbs';
import { NotificationPopover } from './NotificationPopover';
import { UserAvatarMenu } from './UserAvatarMenu';
import { CommandPalette } from './CommandPalette';
import { cn } from '@/lib/utils';

interface TopbarProps {
  portal: PortalConfig;
  onOpenMobileNav?: () => void;
  isMobileNavOpen?: boolean;
}

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 2);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return scrolled;
}

function QuickCreateMenu() {
  const hasPermission = useCurrentUser((s) => s.hasPermission);
  const [open, setOpen] = useState(false);

  const actions = [
    { label: 'Mời thành viên', perm: PERMISSIONS.USER_CREATE, href: '/enterprise/members?invite=1' },
    { label: 'Tạo đợt đào tạo', perm: PERMISSIONS.TRAINING_BATCH_CREATE, href: '/enterprise/batches/new' },
    { label: 'Giao nhiệm vụ', perm: PERMISSIONS.TASK_ASSIGN, href: '/enterprise/tasks/new' },
  ].filter((a) => hasPermission(a.perm));

  if (actions.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Tạo nhanh"
        className="flex items-center justify-center w-8 h-8 rounded-lg text-ent-fg-2 hover:bg-ent-raised hover:text-ent-fg transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-48 bg-ent-card border border-ent-line rounded-lg shadow-lg py-1 z-50"
          onBlur={() => setOpen(false)}
        >
          {actions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className="block px-4 py-2 text-sm text-ent-fg-2 hover:bg-ent-raised hover:text-ent-fg transition-colors"
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
  const scrolled = useScrolled();

  const breadcrumbs = buildBreadcrumbs(pathname);

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
      <header
        className={cn(
          'h-14 flex items-center justify-between px-4 lg:px-6',
          'bg-[var(--ent-topbar)] backdrop-blur-sm',
          'transition-shadow duration-150',
          scrolled ? 'border-b border-ent-line' : 'border-b border-transparent',
        )}
      >
        {/* Left: menu button + breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="md:hidden p-2 -ml-2 rounded-lg text-ent-fg-2 hover:bg-ent-raised hover:text-ent-fg transition-colors"
            aria-label="Mở điều hướng"
            aria-expanded={isMobileNavOpen}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          {breadcrumbs.length > 0 && (
            <nav aria-label="Đường dẫn" className="flex items-center gap-1.5 text-sm">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-ent-fg-3">/</span>}
                  {crumb.href && i < breadcrumbs.length - 1 ? (
                    <Link to={crumb.href} className="text-ent-fg-2 hover:text-ent-fg transition-colors truncate max-w-[200px]">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-ent-fg font-medium truncate max-w-[200px]">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-ent-fg-3 hover:bg-ent-raised hover:text-ent-fg transition-colors text-sm"
            aria-label="Tìm kiếm"
            title="Tìm kiếm (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
            <span className="hidden lg:inline text-xs text-ent-fg-3">Ctrl+K</span>
          </button>

          <QuickCreateMenu />
          <NotificationPopover notificationsPath={portal.notificationsPath} />
          <UserAvatarMenu
            accountPath={portal.accountPath}
            settingsPath={portal.settingsPath}
            canManageSettings={canManageSettings}
          />
        </div>
      </header>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
