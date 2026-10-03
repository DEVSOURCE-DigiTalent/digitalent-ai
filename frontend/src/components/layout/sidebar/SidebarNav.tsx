import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { SidebarConfig } from '@/lib/sidebars/types';
import type { LucideIcon } from 'lucide-react';
import { findEnterpriseScreen } from '@/lib/screens/enterprise';
import { useCurrentUser } from '@/hooks/use-current-user';
import { SidebarItem } from './SidebarItem';

interface SidebarNavProps {
  config: SidebarConfig;
  isRail: boolean;
  onItemClick?: () => void;
}

export function SidebarNav({ config, isRail, onItemClick }: SidebarNavProps) {
  const { pathname } = useLocation();
  const hasEntitlement = useCurrentUser((s) => s.hasEntitlement);
  const hasPermission = useCurrentUser((s) => s.hasPermission);
  const user = useCurrentUser((s) => s.user);

  const isVisible = (screenId?: string) => {
    if (!screenId) return true;
    const screen = findEnterpriseScreen(screenId);
    if (!screen) return true;
    if (screen.permission && !hasPermission(screen.permission)) return false;
    if (screen.roles.includes('*')) return true;
    return screen.roles.some((r) => user?.roles.includes(r));
  };

  // Determine which group contains the active page
  const getActiveGroupLabel = () => {
    for (const section of config) {
      if (section.items) {
        for (const item of section.items) {
          const screen = findEnterpriseScreen(item.screenId);
          if (!screen) continue;
          const allFor = [item.screenId, ...(item.activeFor ?? [])];
          const isActive = allFor.some((id) => {
            const s = findEnterpriseScreen(id);
            return s?.path && (pathname === s.path || pathname.startsWith(`${s.path}/`));
          });
          if (isActive) return section.label;
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
    <nav aria-label="Điều hướng chính" className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
      {config.map((section) => {
        // Single top-level link (e.g. Tổng quan, Báo cáo)
        if (section.screenId && !section.items?.length) {
          if (!isVisible(section.screenId)) return null;
          const screen = findEnterpriseScreen(section.screenId);
          const path = screen?.path ?? '#';
          const locked = !!screen?.entitlement && !hasEntitlement(screen.entitlement);
          const Icon = section.icon as LucideIcon | undefined;
          const allFor = [section.screenId, ...(section.activeFor ?? [])];
          const isActive = allFor.some((id) => {
            const s = findEnterpriseScreen(id);
            return s?.path && (pathname === s.path || pathname.startsWith(`${s.path}/`));
          });
          return (
            <div key={section.label} className="py-0.5">
              <SidebarItem
                href={path}
                label={section.label}
                icon={Icon ? <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} /> : undefined}
                isActive={isActive}
                isLocked={locked}
                isRail={isRail}
                onClick={onItemClick}
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
                  const screen = findEnterpriseScreen(item.screenId);
                  const path = screen?.path ?? '#';
                  const locked = !!screen?.entitlement && !hasEntitlement(screen.entitlement);
                  const Icon = item.icon as LucideIcon | undefined;
                  const allFor = [item.screenId, ...(item.activeFor ?? [])];
                  const isActive = allFor.some((id) => {
                    const s = findEnterpriseScreen(id);
                    return s?.path && (pathname === s.path || pathname.startsWith(`${s.path}/`));
                  });
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
