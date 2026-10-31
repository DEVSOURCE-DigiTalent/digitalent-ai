import { PERMISSIONS } from '../../../hooks/use-permission';
import { ENTITLEMENTS } from '../../entitlements';
import { ROLES } from '../../roles';
import type { ScreenDef } from '../types';

const P = PERMISSIONS;
const OWNER_ROLES = [ROLES.OWNER];

/**
 * OWNER screens according to UI/UX spec v2.1 (§6, §3.2).
 */
export const OWNER_SCREENS: ScreenDef[] = [
  // ── Tổng quan ──
  {
    id: 'OW-01',
    title: 'Tổng quan tổ chức',
    path: '/enterprise/dashboard',
    roles: OWNER_ROLES,
    priority: 'P0',
  },

  // ── Dùng thử (docs/specs/2026-10-27-enterprise-trial-assessment.md) ──
  {
    id: 'OW-T1',
    title: 'Dùng thử',
    path: '/enterprise/trial',
    roles: OWNER_ROLES,
    permission: P.TRIAL_MANAGE,
    allowUnpaid: true,
    priority: 'P0',
  },
  {
    // Chủ doanh nghiệp chưa tham gia làm bài: 6 khóa Cơ bản đang khóa, cảnh báo làm bài test trước, mua khóa.
    id: 'OW-T2',
    title: 'Học thử',
    path: '/enterprise/trial/learning',
    roles: OWNER_ROLES,
    permission: P.TRIAL_MANAGE,
    allowUnpaid: true,
    priority: 'P0',
  },

  // ── Thiết lập ──
  {
    id: 'OW-05',
    title: 'Thiết lập kiến trúc năng lực',
    path: '/enterprise/setup',
    roles: OWNER_ROLES,
    permission: P.POSITION_REQUIREMENT_READ,
    priority: 'P1',
  },

  // ── Tổ chức ──
  {
    id: 'OW-02',
    title: 'Thành viên',
    path: '/enterprise/members',
    roles: OWNER_ROLES,
    permission: P.USER_READ,
    priority: 'P0',
  },
  {
    id: 'OW-03',
    title: 'Chi tiết thành viên',
    path: '/enterprise/members/:id',
    roles: OWNER_ROLES,
    permission: P.USER_READ,
    priority: 'P0',
  },
  {
    id: 'OW-06',
    title: 'Phòng ban',
    path: '/enterprise/departments',
    roles: OWNER_ROLES,
    permission: P.DEPARTMENT_READ,
    priority: 'P0',
  },
  {
    id: 'OW-07',
    title: 'Chi tiết phòng ban',
    path: '/enterprise/departments/:id',
    roles: OWNER_ROLES,
    permission: P.DEPARTMENT_READ,
    priority: 'P0',
  },
  {
    id: 'OW-09',
    title: 'Vị trí công việc',
    path: '/enterprise/positions',
    roles: OWNER_ROLES,
    permission: P.JOB_POSITION_READ,
    priority: 'P0',
  },
  {
    id: 'OW-10',
    title: 'Chi tiết vị trí',
    path: '/enterprise/positions/:id',
    roles: OWNER_ROLES,
    permission: P.JOB_POSITION_READ,
    priority: 'P0',
  },
  {
    id: 'OW-12',
    title: 'Cấu hình cấp bậc (Đã bỏ)',
    path: '/enterprise/positions/grades',
    roles: OWNER_ROLES,
    permission: P.JOB_GRADE_READ,
    priority: 'P2',
    status: 'RETIRED',
  },
  {
    id: 'OW-13',
    title: 'Phân quyền',
    path: '/enterprise/access',
    roles: OWNER_ROLES,
    permission: P.ROLE_READ,
    priority: 'P0',
  },

  // ── Năng lực ──
  {
    id: 'OW-14',
    title: 'Khung chuẩn năng lực số',
    path: '/enterprise/framework',
    roles: OWNER_ROLES,
    permission: P.COMPETENCY_READ,
    priority: 'P0',
  },
  {
    id: 'OW-15',
    title: 'Chi tiết năng lực',
    path: '/enterprise/framework/:id',
    roles: OWNER_ROLES,
    permission: P.COMPETENCY_READ,
    priority: 'P0',
  },
  {
    id: 'OW-16',
    title: 'Yêu cầu theo vị trí',
    path: '/enterprise/requirements',
    roles: OWNER_ROLES,
    permission: P.POSITION_REQUIREMENT_READ,
    priority: 'P0',
  },
  {
    id: 'OW-17',
    title: 'Thiết lập yêu cầu năng lực',
    path: '/enterprise/requirements/builder',
    roles: OWNER_ROLES,
    permission: P.POSITION_REQUIREMENT_MANAGE,
    priority: 'P0',
  },
  {
    id: 'OW-18',
    title: 'Lịch sử phiên bản yêu cầu',
    path: '/enterprise/requirements/history',
    roles: OWNER_ROLES,
    permission: P.POSITION_REQUIREMENT_READ,
    priority: 'P0',
  },
  {
    id: 'OW-19',
    title: 'Hồ sơ năng lực',
    path: '/enterprise/competency-profiles',
    roles: OWNER_ROLES,
    permission: P.EMPLOYEE_COMPETENCY_PROFILE_READ,
    priority: 'P0',
  },
  {
    id: 'OW-20',
    title: 'Chi tiết hồ sơ năng lực',
    path: '/enterprise/competency-profiles/:employeeId',
    roles: OWNER_ROLES,
    permission: P.EMPLOYEE_COMPETENCY_PROFILE_READ,
    priority: 'P0',
  },
  {
    id: 'OW-21',
    title: 'Khoảng trống năng lực',
    path: '/enterprise/skill-gap',
    roles: OWNER_ROLES,
    permission: P.SKILL_GAP_READ,
    priority: 'P0',
  },
  {
    id: 'OW-22',
    title: 'Chi tiết khoảng trống năng lực',
    path: '/enterprise/skill-gap/:employeeId',
    roles: OWNER_ROLES,
    permission: P.SKILL_GAP_READ,
    priority: 'P0',
  },

  // ── Đào tạo ──
  {
    id: 'OW-23',
    title: 'Chương trình chuẩn',
    path: '/enterprise/courses',
    roles: OWNER_ROLES,
    permission: P.COURSE_READ_CATALOG,
    priority: 'P0',
  },
  {
    id: 'OW-24',
    title: 'Chi tiết khóa học chuẩn',
    path: '/enterprise/courses/:id',
    roles: OWNER_ROLES,
    permission: P.COURSE_READ_CATALOG,
    priority: 'P0',
  },
  {
    id: 'OW-CHECKOUT',
    title: 'Thanh toán & Hợp đồng đào tạo',
    path: '/enterprise/courses/checkout',
    roles: OWNER_ROLES,
    permission: P.COURSE_READ_CATALOG,
    priority: 'P0',
  },
  {
    id: 'OW-25',
    title: 'Đợt đào tạo',
    path: '/enterprise/training-batches',
    roles: OWNER_ROLES,
    permission: P.COURSE_ASSIGNMENT_READ,
    priority: 'P0',
  },
  {
    id: 'OW-26',
    title: 'Tạo đợt đào tạo',
    path: '/enterprise/training-batches/new',
    roles: OWNER_ROLES,
    permission: P.COURSE_ASSIGNMENT_CREATE,
    priority: 'P0',
  },
  {
    id: 'OW-27',
    title: 'Chi tiết đợt đào tạo',
    path: '/enterprise/training-batches/:id',
    roles: OWNER_ROLES,
    permission: P.COURSE_ASSIGNMENT_READ,
    priority: 'P0',
  },
  {
    id: 'OW-28',
    title: 'Phân công đào tạo',
    path: '/enterprise/assignments',
    roles: OWNER_ROLES,
    permission: P.COURSE_ASSIGNMENT_READ,
    priority: 'P0',
  },
  {
    id: 'OW-29',
    title: 'Đề xuất học tập',
    path: '/enterprise/assignments/recommendations',
    roles: OWNER_ROLES,
    permission: P.LEARNING_RECOMMENDATION_READ,
    priority: 'P0',
  },
  {
    id: 'OW-30',
    title: 'Theo dõi tiến độ',
    path: '/enterprise/training-monitor',
    roles: [ROLES.OWNER, ROLES.MANAGER],
    permission: P.LEARNING_PROGRESS_READ,
    priority: 'P1',
  },
  {
    id: 'OW-31',
    title: 'Khóa học nội bộ',
    path: '/enterprise/internal-courses',
    roles: OWNER_ROLES,
    entitlement: ENTITLEMENTS.INTERNAL_LEARNING,
    priority: 'P1',
  },
  {
    id: 'OW-32',
    title: 'Soạn khóa học nội bộ',
    path: '/enterprise/internal-courses/:id/edit',
    roles: OWNER_ROLES,
    entitlement: ENTITLEMENTS.INTERNAL_LEARNING,
    priority: 'P1',
  },
  {
    id: 'OW-33',
    title: 'Chi tiết khóa nội bộ',
    path: '/enterprise/internal-courses/:id',
    roles: OWNER_ROLES,
    entitlement: ENTITLEMENTS.INTERNAL_LEARNING,
    priority: 'P1',
  },

  // ── Đánh giá ──
  {
    id: 'OW-34',
    title: 'Kết quả đánh giá',
    path: '/enterprise/assessment-results',
    roles: OWNER_ROLES,
    permission: P.ATTEMPT_READ_RESULT,
    priority: 'P1',
  },

  // ── Chứng nhận ──
  {
    id: 'OW-46',
    title: 'Chứng nhận',
    path: '/enterprise/certificates',
    roles: OWNER_ROLES,
    permission: P.CERTIFICATE_READ,
    priority: 'P1',
  },
  {
    id: 'OW-47',
    title: 'Chi tiết chứng nhận',
    path: '/enterprise/certificates/:id',
    roles: OWNER_ROLES,
    permission: P.CERTIFICATE_READ,
    priority: 'P1',
  },

  // ── Báo cáo ──
  {
    id: 'OW-40',
    title: 'Báo cáo & Phân tích',
    path: '/enterprise/reports',
    roles: OWNER_ROLES,
    permission: P.DASHBOARD_HR_COMPANY_READ,
    priority: 'P1',
  },

  // ── Gói dịch vụ ──
  {
    id: 'OW-41',
    title: 'Gói dịch vụ',
    path: '/enterprise/subscription',
    roles: OWNER_ROLES,
    allowUnpaid: true,
    priority: 'P0',
  },
  {
    id: 'OW-42',
    title: 'Quyền sử dụng & Hạn mức',
    path: '/enterprise/subscription/usage',
    roles: OWNER_ROLES,
    allowUnpaid: true,
    priority: 'P0',
  },
  {
    id: 'OW-43',
    title: 'Lịch sử thanh toán & Hóa đơn',
    path: '/enterprise/subscription/billing',
    roles: OWNER_ROLES,
    allowUnpaid: true,
    priority: 'P1',
  },

  // ── Cài đặt ──
  {
    id: 'OW-44',
    title: 'Cài đặt tổ chức',
    path: '/enterprise/settings',
    roles: OWNER_ROLES,
    permission: P.BUSINESS_CONFIG_MANAGE,
    allowUnpaid: true,
    priority: 'P1',
  },
  {
    id: 'OW-45',
    title: 'Nhật ký tổ chức',
    path: '/enterprise/settings/audit-log',
    roles: OWNER_ROLES,
    permission: P.AUDIT_LOG_READ_DEPARTMENT,
    allowUnpaid: true,
    priority: 'P1',
  },
];
