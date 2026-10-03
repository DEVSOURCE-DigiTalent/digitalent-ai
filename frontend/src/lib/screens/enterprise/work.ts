import { PERMISSIONS } from '../../../hooks/use-permission';
import { ROLES } from '../../roles';
import type { ScreenDef } from '../types';

const P = PERMISSIONS;
const WORK_ROLES = [ROLES.OWNER, ROLES.MANAGER];

/**
 * Shared Practical Task and Evidence Evaluation screens between Owner and Manager
 * (spec v2.1 §1.6, OW-35..39 with aliases MG-08..12).
 */
export const WORK_SCREENS: ScreenDef[] = [
  {
    id: 'OW-35',
    aliases: ['MG-08'],
    title: 'Nhiệm vụ thực tế',
    path: '/enterprise/tasks',
    roles: WORK_ROLES,
    permission: P.TASK_READ,
    priority: 'P0',
  },
  {
    id: 'OW-36',
    aliases: ['MG-09'],
    title: 'Giao nhiệm vụ thực tế',
    path: '/enterprise/tasks/new',
    roles: WORK_ROLES,
    permission: P.TASK_CREATE,
    priority: 'P0',
  },
  {
    id: 'OW-37',
    aliases: ['MG-10'],
    title: 'Chi tiết nhiệm vụ thực tế',
    path: '/enterprise/tasks/:id',
    roles: WORK_ROLES,
    permission: P.TASK_READ,
    priority: 'P0',
  },
  {
    id: 'OW-38',
    aliases: ['MG-11'],
    title: 'Hàng đợi đánh giá',
    path: '/enterprise/reviews',
    roles: WORK_ROLES,
    permission: P.TASK_EVALUATE,
    priority: 'P0',
  },
  {
    id: 'OW-39',
    aliases: ['MG-12'],
    title: 'Đánh giá minh chứng',
    path: '/enterprise/reviews/:submissionId',
    roles: WORK_ROLES,
    permission: P.TASK_EVALUATE,
    priority: 'P0',
  },
];
