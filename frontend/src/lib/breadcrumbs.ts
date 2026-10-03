import type { ScreenDef } from './screens/types';
import { ENTERPRISE_SCREENS } from './screens/enterprise';
import { OWNER_SIDEBAR } from './sidebars/owner';
import type { SidebarConfig } from './sidebars/types';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Find the sidebar group label for a screenId (returns null for top-level items). */
function findGroupLabel(screenId: string, config: SidebarConfig): string | null {
  for (const section of config) {
    if (section.items) {
      const found = section.items.find((item) => item.screenId === screenId);
      if (found) return section.label;
    }
  }
  return null;
}

/** Match a pathname against a screen path pattern that may contain :param segments. */
export function matchPath(screenPath: string, pathname: string): boolean {
  if (screenPath === pathname) return true;
  if (!screenPath.includes(':')) {
    return pathname.startsWith(`${screenPath}/`);
  }
  const pattern = screenPath.replace(/:[\w]+/g, '[^/]+');
  return new RegExp(`^${pattern}(/.*)?$`).test(pathname);
}

/**
 * Build breadcrumbs from the current pathname using the enterprise sitemap.
 * Pure function — no React, safe to unit-test.
 *
 * @param pathname - current location.pathname
 * @param screens - screen definitions (defaults to ENTERPRISE_SCREENS)
 * @param sidebarConfig - for group label lookup (defaults to OWNER_SIDEBAR)
 */
export function buildBreadcrumbs(
  pathname: string,
  screens: ScreenDef[] = ENTERPRISE_SCREENS,
  sidebarConfig: SidebarConfig = OWNER_SIDEBAR,
): BreadcrumbItem[] {
  // Find the most-specific matching screen
  const matched = screens
    .filter((s) => matchPath(s.path, pathname))
    .sort((a, b) => b.path.length - a.path.length)[0];

  if (!matched) return [];

  const crumbs: BreadcrumbItem[] = [];
  const groupLabel = findGroupLabel(matched.id, sidebarConfig);
  if (groupLabel) crumbs.push({ label: groupLabel });
  crumbs.push({ label: matched.title, href: matched.path });

  return crumbs;
}
