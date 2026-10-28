import { BookOpenCheck, FlaskConical } from 'lucide-react';
import { ROLES, normalizeRoles, primaryRole } from '../roles';
import { isEnterpriseTrial } from '../navigation';
import type { SessionUser } from '../../types/session';
import type { SidebarConfig } from './types';
import { OWNER_SIDEBAR } from './owner';
import { MANAGER_SIDEBAR } from './manager';
import { EMPLOYEE_SIDEBAR } from './employee';
import { PLATFORM_SIDEBAR } from './platform';

export * from './types';
export * from './owner';
export * from './manager';
export * from './employee';
export * from './platform';

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
  if (role === ROLES.PLATFORM_ADMIN || user.roles.includes(ROLES.PLATFORM_ADMIN)) {
    return PLATFORM_SIDEBAR;
  }
  if (role === ROLES.OWNER || user.roles.includes(ROLES.OWNER)) {
    // Doanh nghiệp dùng thử: chỉ hai mục — Dùng thử (mời nhân viên, đặt hạn, xem bảng năng lực) và Học thử (6 khóa Cơ bản,
    // cảnh báo làm bài test trước, mua khóa). Chủ chưa tham gia → OW-T2 (tham gia rồi làm bài); đã tham gia (có role Nhân
    // viên) → trang Học thử của cổng nhân viên. Bài test, khóa học và trang mua khóa đều thuộc mục Học thử.
    if (!isEnterpriseTrial(user)) return OWNER_SIDEBAR;
    const participating = normalizeRoles(user.roles).includes(ROLES.EMPLOYEE);
    return [
      { label: 'Dùng thử', icon: FlaskConical, screenId: 'OW-T1' },
      {
        label: 'Học thử',
        icon: BookOpenCheck,
        screenId: participating ? 'EM-02' : 'OW-T2',
        activeFor: ['OW-T2', 'EM-01', 'EM-02', 'EM-03', 'EM-05', 'EM-06', 'EM-07', 'EM-08', 'EM-09', 'EM-10', 'EM-11', 'EM-12', 'EM-T1', 'EM-T2', 'OW-23', 'OW-24'],
      },
    ];
  }
  if (role === ROLES.MANAGER || user.roles.includes(ROLES.MANAGER)) {
    return MANAGER_SIDEBAR;
  }

  return EMPLOYEE_SIDEBAR;
}

