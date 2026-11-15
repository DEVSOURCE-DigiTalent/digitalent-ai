import { PERMISSIONS } from '../../../hooks/use-permission';
import { ROLES } from '../../roles';
import type { ScreenDef } from '../types';

const P = PERMISSIONS;
const MANAGER_ONLY = [ROLES.MANAGER];

/** Practical task and evidence evaluation screens for managers. */
export const WORK_SCREENS: ScreenDef[] = [
  {
    id: 'MG-08',
    title: 'Nhiệm vụ thực tế',
    path: '/enterprise/tasks',
    roles: MANAGER_ONLY,
    permission: P.TASK_READ,
    priority: 'P0',
  },
  {
    id: 'MG-09',
    title: 'Giao nhiệm vụ thực tế',
    path: '/enterprise/tasks/new',
    roles: MANAGER_ONLY,
    permission: P.TASK_CREATE,
    priority: 'P0',
  },
  {
    id: 'MG-10',
    title: 'Chi tiết nhiệm vụ thực tế',
    path: '/enterprise/tasks/:id',
    roles: MANAGER_ONLY,
    permission: P.TASK_READ,
    priority: 'P0',
  },
  {
    id: 'MG-11',
    title: 'Hàng đợi đánh giá',
    path: '/enterprise/reviews',
    roles: MANAGER_ONLY,
    permission: P.TASK_READ,
    priority: 'P0',
  },
  {
    id: 'MG-12',
    title: 'Đánh giá minh chứng',
    path: '/enterprise/reviews/:submissionId',
    roles: MANAGER_ONLY,
    permission: P.TASK_READ,
    priority: 'P0',
  },
];
