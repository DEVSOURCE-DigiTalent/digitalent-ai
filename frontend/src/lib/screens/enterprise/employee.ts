import { PERMISSIONS } from '../../../hooks/use-permission';
import { ROLES } from '../../roles';
import type { ScreenDef } from '../types';

const P = PERMISSIONS;
const EMPLOYEE_ROLES = [ROLES.EMPLOYEE, ROLES.MANAGER];

/**
 * EMPLOYEE screens according to UI/UX spec v2.1 (§8, §3.4).
 * Accessible by EMPLOYEE and MANAGER (for personal learning and growth).
 */
export const EMPLOYEE_SCREENS: ScreenDef[] = [
  // ── Tổng quan ──
  {
    id: 'EM-01',
    title: 'Bảng phát triển của tôi',
    path: '/enterprise/me',
    roles: EMPLOYEE_ROLES,
    priority: 'P0',
  },

  // ── Năng lực của tôi ──
  {
    id: 'EM-02',
    title: 'Hồ sơ năng lực của tôi',
    path: '/enterprise/me/competency',
    roles: EMPLOYEE_ROLES,
    permission: P.EMPLOYEE_COMPETENCY_PROFILE_READ,
    priority: 'P0',
  },
  {
    id: 'EM-03',
    title: 'Khoảng trống năng lực của tôi',
    path: '/enterprise/me/skill-gap',
    roles: EMPLOYEE_ROLES,
    permission: P.SKILL_GAP_READ,
    priority: 'P0',
  },
  {
    id: 'EM-04',
    title: 'Dòng thời gian minh chứng',
    path: '/enterprise/me/evidence',
    roles: EMPLOYEE_ROLES,
    permission: P.EVIDENCE_READ,
    priority: 'P0',
  },

  // ── Học tập ──
  {
    id: 'EM-05',
    title: 'Lộ trình học tập của tôi',
    path: '/enterprise/me/learning-path',
    roles: EMPLOYEE_ROLES,
    priority: 'P0',
  },
  {
    id: 'EM-06',
    title: 'Khóa học của tôi',
    path: '/enterprise/me/courses',
    roles: EMPLOYEE_ROLES,
    permission: P.COURSE_READ_CATALOG,
    priority: 'P0',
  },
  {
    id: 'EM-07',
    title: 'Chi tiết khóa học',
    path: '/enterprise/me/courses/:id',
    roles: EMPLOYEE_ROLES,
    permission: P.COURSE_READ_CATALOG,
    priority: 'P0',
  },
  {
    id: 'EM-08',
    title: 'Nội dung bài học',
    path: '/enterprise/me/courses/:id/lessons/:lessonId',
    roles: EMPLOYEE_ROLES,
    permission: P.COURSE_READ_CATALOG,
    priority: 'P0',
  },

  // ── Đánh giá ──
  {
    id: 'EM-09',
    title: 'Danh sách bài đánh giá',
    path: '/enterprise/me/assessments',
    roles: EMPLOYEE_ROLES,
    permission: P.ASSESSMENT_READ,
    priority: 'P0',
  },
  {
    id: 'EM-10',
    title: 'Giới thiệu bài đánh giá',
    path: '/enterprise/me/assessments/:id',
    roles: EMPLOYEE_ROLES,
    permission: P.ASSESSMENT_READ,
    priority: 'P0',
  },
  {
    id: 'EM-11',
    title: 'Làm bài đánh giá',
    path: '/enterprise/me/assessments/:id/attempt',
    roles: EMPLOYEE_ROLES,
    permission: P.ATTEMPT_START,
    priority: 'P0',
  },
  {
    id: 'EM-12',
    title: 'Kết quả đánh giá',
    path: '/enterprise/me/assessments/:id/result',
    roles: EMPLOYEE_ROLES,
    permission: P.ATTEMPT_READ_RESULT,
    priority: 'P0',
  },
  {
    id: 'EM-13',
    title: 'Lịch sử đánh giá',
    path: '/enterprise/me/assessments/history',
    roles: EMPLOYEE_ROLES,
    permission: P.ATTEMPT_READ_RESULT,
    priority: 'P0',
  },

  // ── Nhiệm vụ thực tế ──
  {
    id: 'EM-14',
    title: 'Nhiệm vụ của tôi',
    path: '/enterprise/me/tasks',
    roles: EMPLOYEE_ROLES,
    permission: P.TASK_READ,
    priority: 'P0',
  },
  {
    id: 'EM-15',
    title: 'Chi tiết nhiệm vụ',
    path: '/enterprise/me/tasks/:id',
    roles: EMPLOYEE_ROLES,
    permission: P.TASK_READ,
    priority: 'P0',
  },
  {
    id: 'EM-16',
    title: 'Nộp minh chứng nhiệm vụ',
    path: '/enterprise/me/tasks/:id/submit',
    roles: EMPLOYEE_ROLES,
    permission: P.TASK_SUBMIT,
    priority: 'P0',
  },
  {
    id: 'EM-17',
    title: 'Phản hồi & Chỉnh sửa',
    path: '/enterprise/me/tasks/:id/feedback',
    roles: EMPLOYEE_ROLES,
    permission: P.TASK_READ,
    priority: 'P0',
  },

  // ── Thành tựu ──
  {
    id: 'EM-18',
    title: 'Thành tựu & Chứng nhận',
    path: '/enterprise/me/achievements',
    roles: EMPLOYEE_ROLES,
    permission: P.CERTIFICATE_READ,
    priority: 'P0',
  },
];
