import type { LucideIcon } from 'lucide-react';

// ---------------------------------------------------------------------------
// Legacy sidebar types — kept for portals.ts compatibility.
// New code should use lib/sidebars/* (role-based SidebarConfig / SidebarSection).
// ---------------------------------------------------------------------------

export interface SidebarItem {
  label: string;
  path: string;
  icon: LucideIcon;
  /** `['*']` = every signed-in user of the portal. */
  roles: string[];
  /** Permission the target route is guarded with; the item is hidden without it. */
  permission?: string;
  /** Plan feature the target route needs; the item stays visible but locked without it. */
  entitlement?: string;
}

export interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

/** Returns an empty group list — nav field was removed from ScreenDef in Phase J.
 *  Sidebar is now driven by lib/sidebars/{owner,manager,employee,platform}.ts.
 * @deprecated
 */
export function buildSidebarGroups(_screens: unknown[]): SidebarGroup[] {
  return [];
}

export const enterpriseSidebarGroups: SidebarGroup[] = [];
export const platformSidebarGroups: SidebarGroup[] = [];
