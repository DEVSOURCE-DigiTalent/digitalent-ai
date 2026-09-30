import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useCurrentUser } from '../../hooks/use-current-user';
import { sidebarGroups, type SidebarGroup, type SidebarItem } from '../../lib/sidebar-config';
import { useState } from 'react';
import { ChevronDown, ChevronLeft } from 'lucide-react';

/**
 * RBAC-aware sidebar navigation.
 * Filters menu items by user roles and route permission, highlights active item,
 * supports collapsible groups and collapsed mode. Below the md breakpoint it is an
 * off-canvas drawer opened from the Topbar.
 */
interface RoleSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function RoleSidebar({ isMobileOpen = false, onMobileClose }: RoleSidebarProps) {
  const location = useLocation();
  const user = useCurrentUser((s) => s.user);
  const hasPermission = useCurrentUser((s) => s.hasPermission);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  if (!user) return null;

  const userRoles = user.roles;

  function filterItems(group: SidebarGroup): SidebarItem[] {
    return group.items.filter((item) => {
      if (item.permission && !hasPermission(item.permission)) return false;
      if (!item.roles) return true;
      if (item.roles.includes('*')) return true;
      return item.roles.some((r) => userRoles.includes(r));
    });
  }

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const visibleGroups = sidebarGroups
    .map((g) => ({ ...g, items: filterItems(g) }))
    .filter((g) => g.items.length > 0);

  // Nested paths (e.g. /competency-framework/position-requirements) match several items: the longest one wins
  const activePath = visibleGroups
    .flatMap((g) => g.items)
    .map((item) => item.path)
    .filter((path) => location.pathname === path || location.pathname.startsWith(`${path}/`))
    .reduce((longest, path) => (path.length > longest.length ? path : longest), '');

  return (
    <aside
      className={cn(
        'flex flex-col bg-slate-900 text-white transition-all duration-200',
        'fixed inset-y-0 left-0 z-40 md:static md:translate-x-0 md:visible',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full invisible',
        collapsed ? 'w-64 md:w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded bg-primary-600 flex items-center justify-center text-xs font-bold shrink-0">
            D
          </div>
          {!collapsed && <span className="font-bold text-sm truncate">DigiTalent AI</span>}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded hover:bg-slate-700 text-slate-400 hidden md:block"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className={cn(
                'flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-300',
                collapsed && 'md:hidden',
              )}
            >
              {group.label}
              <ChevronDown
                className={cn(
                  'w-3 h-3 transition-transform',
                  expandedGroups[group.label] !== false && 'rotate-180',
                )}
              />
            </button>
            <div
              className={cn(
                'space-y-0.5',
                collapsed && 'space-y-1',
                expandedGroups[group.label] === false && !collapsed && 'hidden',
              )}
            >
              {group.items.map((item) => {
                const active = item.path === activePath;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onMobileClose}
                    title={collapsed ? item.label : undefined}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors',
                      active
                        ? 'bg-primary-600/20 text-primary-300 font-medium'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                    )}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" strokeWidth={1.5} />
                    <span className={cn('truncate', collapsed && 'md:hidden')}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User info footer */}
      {!collapsed && (
        <div className="border-t border-slate-700 p-3 shrink-0">
          <p className="text-sm font-medium text-slate-200 truncate">{user.fullName}</p>
          <p className="text-xs text-slate-400 truncate">{user.roles.join(', ')}</p>
        </div>
      )}
    </aside>
  );
}
