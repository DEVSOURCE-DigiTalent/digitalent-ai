import { useMemo, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { SidebarConfig } from '@/lib/sidebars/types';
import type { LucideIcon } from 'lucide-react';
import { findScreen } from '@/lib/screens';
import { matchPath } from '@/lib/breadcrumbs';
import { WORKSPACES, type Workspace } from '@/lib/roles';
import { useCurrentUser } from '@/hooks/use-current-user';
import { SidebarItem, type SidebarVariant } from './SidebarItem';

interface SidebarNavProps {
  config: SidebarConfig;
  isRail: boolean;
  onItemClick?: () => void;
  workspace?: Workspace;
  variant?: SidebarVariant;
}

export function SidebarNav({ config, isRail, onItemClick, workspace, variant = 'default' }: SidebarNavProps) {
  const pulseManager = variant === 'pulse-manager';
  const { pathname } = useLocation();
  const hasEntitlement = useCurrentUser((s) => s.hasEntitlement);
  const hasPermission = useCurrentUser((s) => s.hasPermission);
  const user = useCurrentUser((s) => s.user);

  const currentWorkspace = workspace ?? (pathname.startsWith('/platform') ? WORKSPACES.PLATFORM : WORKSPACES.ENTERPRISE);

  const isVisible = (screenId?: string) => {
    if (!screenId) return true;
    const screen = findScreen(screenId, currentWorkspace);
    if (!screen) return true;
    if (screen.permission && !hasPermission(screen.permission)) return false;
    if (screen.roles.includes('*')) return true;
    return screen.roles.some((r) => user?.roles.includes(r));
  };

  // The most specific matching screen of this sidebar wins: /enterprise/team/final-reviews highlights its own item,
  // not also the /enterprise/team overview whose path is a prefix of it.
  const activeScreenId = useMemo(() => {
    let best: { id: string; length: number } | null = null;
    for (const section of config) {
      for (const entry of [section, ...(section.items ?? [])]) {
        if (!entry.screenId) continue;
        for (const id of [entry.screenId, ...(entry.activeFor ?? [])]) {
          const s = findScreen(id, currentWorkspace);
          if (s?.path && matchPath(s.path, pathname) && (!best || s.path.length > best.length)) best = { id, length: s.path.length };
        }
      }
    }
    return best?.id ?? null;
  }, [config, pathname, currentWorkspace]);

  const isScreenActive = (screenId: string, activeFor?: string[]) =>
    activeScreenId != null && [screenId, ...(activeFor ?? [])].includes(activeScreenId);

  // Determine which group contains the active page
  const getActiveGroupLabel = () => {
    for (const section of config) {
      if (section.items) {
        for (const item of section.items) {
          if (isScreenActive(item.screenId, item.activeFor)) return section.label;
        }
      }
    }
    return null;
  };

  const activeGroupLabel = getActiveGroupLabel();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    if (activeGroupLabel) init[activeGroupLabel] = true;
    return init;
  });

  // Auto-expand group containing active page on navigation
  useEffect(() => {
    if (activeGroupLabel) {
      setExpanded((prev) => ({ ...prev, [activeGroupLabel]: true }));
    }
  }, [activeGroupLabel]);

  return (
    <nav aria-label="Điều hướng chính" className={cn('flex-1 overflow-y-auto', !pulseManager && 'py-2 px-2 space-y-0.5')}>
      {config.map((section) => {
        // Label-only group header (Pulse flat sidebar)
        if (!section.screenId && (!section.items || section.items.length === 0)) {
          if (isRail) return null;
          if (pulseManager) {
            return <span key={`label-${section.label}`} className="pm-side-label">{section.label}</span>;
          }
          return (
            <div key={`label-${section.label}`} className="mt-5 first:mt-0 px-3 pb-1.5">
              <span className="text-[10px] font-black tracking-[0.14em] uppercase text-ent-sidebar-muted">
                {section.label}
              </span>
            </div>
          );
        }

        // Single top-level link (e.g. Tổng quan, Báo cáo)
        if (section.screenId && !section.items?.length) {
          if (!isVisible(section.screenId)) return null;
          const screen = findScreen(section.screenId, currentWorkspace);
          const path = screen?.path ?? '#';
          const locked = !!screen?.entitlement && !hasEntitlement(screen.entitlement);
          const Icon = section.icon as LucideIcon | undefined;
          const isActive = isScreenActive(section.screenId, section.activeFor);
          return (
            <div key={section.label} className={pulseManager ? undefined : 'py-0.5'}>
              <SidebarItem
                href={path}
                label={section.label}
                icon={Icon ? <Icon className={pulseManager ? undefined : 'w-4 h-4 shrink-0'} strokeWidth={pulseManager ? 1.8 : 1.5} /> : undefined}
                isActive={isActive}
                isLocked={locked}
                isRail={isRail}
                onClick={onItemClick}
                variant={variant}
                dataTour={section.screenId}
              />
            </div>
          );
        }

        // Group with children
        if (section.items && section.items.length > 0) {
          const visibleItems = section.items.filter((item) => isVisible(item.screenId));
          if (visibleItems.length === 0) return null;
          const isExpanded = expanded[section.label] ?? false;

          return (
            <div key={section.label}>
              {isRail ? (
                <div className="my-1 mx-2 border-t border-[var(--ent-line)] opacity-30" />
              ) : (
                <button
                  type="button"
                  onClick={() => setExpanded((p) => ({ ...p, [section.label]: !p[section.label] }))}
                  className="flex items-center justify-between w-full px-2 py-1.5 text-xs text-ent-sidebar-muted hover:text-ent-sidebar-fg transition-colors"
                >
                  <span>{section.label}</span>
                  <ChevronDown
                    className={cn('w-3 h-3 transition-transform duration-150', !isExpanded && '-rotate-90')}
                  />
                </button>
              )}
              <div className={cn('space-y-0.5', !isExpanded && !isRail && 'hidden')}>
                {visibleItems.map((item) => {
                  const screen = findScreen(item.screenId, currentWorkspace);
                  const path = screen?.path ?? '#';
                  const locked = !!screen?.entitlement && !hasEntitlement(screen.entitlement);
                  const Icon = item.icon as LucideIcon | undefined;
                  const isActive = isScreenActive(item.screenId, item.activeFor);
                  return (
                    <SidebarItem
                      key={item.screenId}
                      href={path}
                      label={item.label}
                      icon={Icon ? <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} /> : undefined}
                      isActive={isActive}
                      isLocked={locked}
                      isRail={isRail}
                      onClick={onItemClick}
                      dataTour={item.screenId}
                    />
                  );
                })}
              </div>
            </div>
          );
        }

        return null;
      })}
    </nav>
  );
}

