import { ROLES, primaryRole } from '../roles';
import type { SessionUser } from '../../types/session';
import type { SidebarConfig } from './types';
import { OWNER_SIDEBAR } from './owner';
import { MANAGER_SIDEBAR } from './manager';
import { EMPLOYEE_SIDEBAR } from './employee';
import { PLATFORM_SIDEBAR } from './platform';
import { TRIAL_EMPLOYEE_SIDEBAR, TRIAL_MANAGER_SIDEBAR, TRIAL_OWNER_SIDEBAR } from './trial';

export * from './types';
export * from './owner';
export * from './manager';
export * from './employee';
export * from './platform';
export * from './trial';

/**
 * Returns the task-oriented sidebar configuration tailored to the user's role.
 * Platform Admin has platform management, Owner has full org/competency/training management,
 * Manager has team scope + practical evaluation, Employee focuses on personal development.
 */
export function sidebarFor(user?: SessionUser | null): SidebarConfig {
  if (!user || !user.roles || user.roles.length === 0) {
    return EMPLOYEE_SIDEBAR;
  }

  const role = primaryRole(user);
  const isTrial = (user.enterpriseTrialStatus !== undefined && user.enterpriseTrialStatus !== 'converted')
    || user.subscription?.planCode === 'ENT_TRIAL';

  if (role === ROLES.PLATFORM_ADMIN || user.roles.includes(ROLES.PLATFORM_ADMIN)) {
    return PLATFORM_SIDEBAR;
  }
  if (role === ROLES.OWNER || user.roles.includes(ROLES.OWNER)) {
    return isTrial ? TRIAL_OWNER_SIDEBAR : OWNER_SIDEBAR;
  }
  if (role === ROLES.MANAGER || user.roles.includes(ROLES.MANAGER)) {
    return isTrial ? TRIAL_MANAGER_SIDEBAR : MANAGER_SIDEBAR;
  }

  return isTrial ? TRIAL_EMPLOYEE_SIDEBAR : EMPLOYEE_SIDEBAR;
}

