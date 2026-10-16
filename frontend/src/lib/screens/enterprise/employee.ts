import { PERMISSIONS } from '../../../hooks/use-permission';
import { ROLES } from '../../roles';
import type { ScreenDef } from '../types';

const P = PERMISSIONS;
const EMPLOYEE_ROLES = [ROLES.EMPLOYEE, ROLES.MANAGER];

/**
 * Cổng nhân viên Pulse (docs/ui-redesign/16-pulse-product-flow-detailed.md §3, §14): điều hướng chính chỉ có
 * Hôm nay / Lộ trình / Thực hành; chi tiết khóa, trang học mô đun, bài đánh giá trước khi học và bài cuối khóa (hai
 * trang làm bài có giám sát, docs/specs/2026-10-16-pulse-employee-roadmap-proctoring.md) mở theo ngữ cảnh.
 * Các màn này dùng khung PulseEmployeeLayout (không có menu bên). Quản lý vẫn vào được để tự học.
 */
export const EMPLOYEE_SCREENS: ScreenDef[] = [
  {
    id: 'EM-01',
    title: 'Hôm nay',
    path: '/enterprise/me',
    roles: EMPLOYEE_ROLES,
    permission: P.EMPLOYEE_COMPETENCY_PROFILE_READ,
    priority: 'P0',
  },
  {
    id: 'EM-02',
    title: 'Lộ trình của tôi',
    path: '/enterprise/me/path',
    roles: EMPLOYEE_ROLES,
    permission: P.EMPLOYEE_COMPETENCY_PROFILE_READ,
    priority: 'P0',
  },
  {
    id: 'EM-03',
    title: 'Thực hành',
    path: '/enterprise/me/practice',
    roles: EMPLOYEE_ROLES,
    permission: P.LEARNING_PROGRESS_READ,
    priority: 'P0',
  },
  {
    id: 'EM-05',
    title: 'Chi tiết khóa học',
    path: '/enterprise/me/courses/:courseId',
    roles: EMPLOYEE_ROLES,
    permission: P.COURSE_READ_CATALOG,
    priority: 'P0',
  },
  {
    id: 'EM-06',
    title: 'Học mô đun',
    path: '/enterprise/me/courses/:courseId/modules/:moduleId',
    roles: EMPLOYEE_ROLES,
    permission: P.COURSE_READ_CATALOG,
    priority: 'P0',
  },
  {
    id: 'EM-07',
    title: 'Bài cuối khóa',
    path: '/enterprise/me/courses/:courseId/final',
    roles: EMPLOYEE_ROLES,
    permission: P.ASSESSMENT_READ,
    priority: 'P0',
  },
  {
    id: 'EM-12',
    title: 'Đánh giá trước khi học',
    path: '/enterprise/me/courses/:courseId/pre-assessment',
    roles: EMPLOYEE_ROLES,
    permission: P.ASSESSMENT_READ,
    priority: 'P0',
  },
  {
    id: 'EM-08',
    title: 'Kết quả đã xác nhận',
    path: '/enterprise/me/outcomes',
    roles: EMPLOYEE_ROLES,
    permission: P.CERTIFICATE_READ,
    priority: 'P0',
  },
  {
    id: 'EM-09',
    title: 'Chi tiết kết quả',
    path: '/enterprise/me/outcomes/:outcomeId',
    roles: EMPLOYEE_ROLES,
    permission: P.CERTIFICATE_READ,
    priority: 'P1',
  },
  {
    id: 'EM-10',
    title: 'Hoạt động',
    path: '/enterprise/me/activity',
    roles: EMPLOYEE_ROLES,
    allowUnpaid: true,
    priority: 'P1',
  },
  {
    id: 'EM-11',
    title: 'Hồ sơ của tôi',
    path: '/enterprise/me/profile',
    roles: EMPLOYEE_ROLES,
    allowUnpaid: true,
    priority: 'P1',
  },
];
