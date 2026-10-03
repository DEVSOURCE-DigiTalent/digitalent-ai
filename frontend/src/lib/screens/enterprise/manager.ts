import { PERMISSIONS } from '../../../hooks/use-permission';
import { ROLES } from '../../roles';
import type { ScreenDef } from '../types';

const P = PERMISSIONS;
const MANAGER_ROLES = [ROLES.MANAGER];

/**
 * MANAGER screens according to UI/UX spec v2.1 (§7, §3.3).
 * Shared task and evaluation screens (MG-08..12) live in work.ts.
 */
export const MANAGER_SCREENS: ScreenDef[] = [
  // ── Tổng quan ──
  {
    id: 'MG-01',
    title: 'Tổng quan nhóm',
    path: '/enterprise/team',
    roles: MANAGER_ROLES,
    permission: P.DASHBOARD_DEPARTMENT_READ,
    priority: 'P0',
  },

  // ── Nhóm của tôi ──
  {
    id: 'MG-02',
    title: 'Thành viên nhóm',
    path: '/enterprise/team/members',
    roles: MANAGER_ROLES,
    permission: P.EMPLOYEE_READ,
    priority: 'P0',
  },
  {
    id: 'MG-03',
    title: 'Chi tiết thành viên nhóm',
    path: '/enterprise/team/members/:id',
    roles: MANAGER_ROLES,
    permission: P.EMPLOYEE_READ,
    priority: 'P0',
  },
  {
    id: 'MG-04',
    title: 'Ma trận năng lực nhóm',
    path: '/enterprise/team/competency',
    roles: MANAGER_ROLES,
    permission: P.EMPLOYEE_COMPETENCY_PROFILE_READ,
    priority: 'P0',
  },
  {
    id: 'MG-05',
    title: 'Khoảng trống năng lực nhóm',
    path: '/enterprise/team/skill-gap',
    roles: MANAGER_ROLES,
    permission: P.SKILL_GAP_READ,
    priority: 'P0',
  },
  {
    id: 'MG-06',
    title: 'Tiến độ đào tạo nhóm',
    path: '/enterprise/team/training',
    roles: MANAGER_ROLES,
    permission: P.LEARNING_PROGRESS_READ,
    priority: 'P0',
  },
  {
    id: 'MG-07',
    title: 'Chi tiết phân công đào tạo',
    path: '/enterprise/team/training/:assignmentId',
    roles: MANAGER_ROLES,
    permission: P.LEARNING_PROGRESS_READ,
    priority: 'P1',
  },
];
