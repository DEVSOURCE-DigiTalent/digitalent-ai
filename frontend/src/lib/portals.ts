import { PERMISSIONS } from '../hooks/use-permission';
import { enterpriseSidebarGroups, platformSidebarGroups, type SidebarGroup } from './sidebar-config';
import { WORKSPACES, type Workspace } from './roles';

/** Everything a portal shell (sidebar + topbar) needs that differs between portals. */
export interface PortalConfig {
  workspace: Workspace;
  /** Small label next to the logo. */
  badge: string;
  sidebarGroups: SidebarGroup[];
  notificationsPath: string;
  accountPath: string;
  settingsPath: string;
  settingsPermission?: string;
}

export const ENTERPRISE_PORTAL: PortalConfig = {
  workspace: WORKSPACES.ENTERPRISE,
  badge: 'Doanh nghiệp',
  sidebarGroups: enterpriseSidebarGroups,
  notificationsPath: '/enterprise/notifications',
  accountPath: '/enterprise/account',
  settingsPath: '/enterprise/settings',
  settingsPermission: PERMISSIONS.BUSINESS_CONFIG_MANAGE,
};

export const PLATFORM_PORTAL: PortalConfig = {
  workspace: WORKSPACES.PLATFORM,
  badge: 'Nền tảng',
  sidebarGroups: platformSidebarGroups,
  notificationsPath: '/platform/notifications',
  accountPath: '/platform/account',
  settingsPath: '/platform/settings',
};
