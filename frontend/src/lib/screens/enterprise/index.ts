import { ROLES } from '../../roles';
import type { ScreenDef } from '../types';
import { EMPLOYEE_SCREENS } from './employee';
import { MANAGER_SCREENS } from './manager';
import { OWNER_SCREENS } from './owner';
import { WORK_SCREENS } from './work';

export * from './owner';
export * from './work';
export * from './manager';
export * from './employee';

const SHARED_ROLES = [ROLES.OWNER, ROLES.MANAGER, ROLES.EMPLOYEE];

/** Topbar and Account screens available to all enterprise users (spec v2.1 §3.6, §9). */
export const ENTERPRISE_SHARED_SCREENS: ScreenDef[] = [
  {
    id: 'SHR-01',
    title: 'Hồ sơ của tôi',
    path: '/enterprise/account',
    roles: SHARED_ROLES,
    allowUnpaid: true,
    priority: 'P1',
  },
  {
    id: 'SHR-02',
    title: 'Bảo mật tài khoản',
    path: '/enterprise/account/security',
    roles: SHARED_ROLES,
    allowUnpaid: true,
    priority: 'P1',
  },
  {
    id: 'SHR-03',
    title: 'Thông báo',
    path: '/enterprise/notifications',
    roles: SHARED_ROLES,
    allowUnpaid: true,
    priority: 'P1',
  },
];

/** Combined enterprise screens driving router and page resolution */
export const ENTERPRISE_SCREENS: ScreenDef[] = [
  ...OWNER_SCREENS,
  ...WORK_SCREENS,
  ...MANAGER_SCREENS,
  ...EMPLOYEE_SCREENS,
  ...ENTERPRISE_SHARED_SCREENS,
];

import { PLATFORM_SCREENS } from '../platform';

export function findEnterpriseScreen(id: string): ScreenDef | undefined {
  return (
    ENTERPRISE_SCREENS.find((s) => s.id === id || s.aliases?.includes(id)) ??
    PLATFORM_SCREENS.find((s) => s.id === id || s.aliases?.includes(id))
  );
}
