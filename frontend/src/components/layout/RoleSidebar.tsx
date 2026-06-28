import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/use-current-user';
import { sidebarGroups, type SidebarGroup, type SidebarItem } from '@/lib/sidebar-config';
import { useState } from 'react';
import { ChevronDown, ChevronLeft } from 'lucide-react';

/**
 * RBAC-aware sidebar navigation.
 * Filters menu items by user roles, highlights active item,
 * supports collapsible groups and collapsed mode.
 */
export function RoleSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useCurrentUser((s) => s.user);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  if (!user) return null;

  const userRoles = user.roles;

  function filterItems(group: SidebarGroup): SidebarItem[] {
    return group.items.filter((item) => {
      if (!item.roles) return true;
      if (item.roles.includes('*')) return true;
      return item.roles.some((r) => userRoles.includes(r));
    });
  }

  function isActive(item: SidebarItem): boolean {
    if (location.pathname === item.path) return true;
    if (item.children) return item.children.some((child) => location.pathname.startsWith(child.path));
    return location.pathname.startsWith(item.path) && item.path !== '/';
  }

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const visibleGroups = sidebarGroups
    .map((g) => ({ ...g, items: filterItems(g) }))
    .filter((g) => g.items.length > 0);

  return (
    <aside
      className={cn(
        'flex flex-col bg-slate-900 text-white transition-all duration-200',
        collapsed ? 'w-16' : 'w-64',
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
          className="ml-auto p-1 rounded hover:bg-slate-700 text-slate-400"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-300"
              >
                {group.label}
                <ChevronDown
                  className={cn(
                    'w-3 h-3 transition-transform',
                    expandedGroups[group.label] !== false && 'rotate-180',
                  )}
                />
              </button>
            )}
            <div
              className={cn(
                'space-y-0.5',
                collapsed && 'space-y-1',
                expandedGroups[group.label] === false && !collapsed && 'hidden',
              )}
            >
              {group.items.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors',
                      active
                        ? 'bg-primary-600/20 text-primary-300 font-medium'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                    )}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" strokeWidth={1.5} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
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
