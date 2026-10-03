import { ROLES } from '../roles';
import type { ScreenDef } from './types';

const ADMIN = [ROLES.PLATFORM_ADMIN];

/**
 * Platform (DigiTalent staff) sitemap, UI/UX spec section 10 & alignment plan §3.5.
 * All screens re-indexed to PA-01..21. Nav property removed in favor of lib/sidebars/platform.ts.
 */
export const PLATFORM_SCREENS: ScreenDef[] = [
  { id: 'PA-01', title: 'Bảng điều khiển nền tảng', path: '/platform/dashboard', roles: ADMIN, priority: 'P1', aliases: ['PLT-01'] },
  { id: 'PA-02', title: 'Danh sách tổ chức', path: '/platform/organizations', roles: ADMIN, priority: 'P0', aliases: ['PLT-02'] },
  { id: 'PA-03', title: 'Chi tiết và hỗ trợ tổ chức', path: '/platform/organizations/:id', roles: ADMIN, priority: 'P0', aliases: ['PLT-03'] },
  { id: 'PA-04', title: 'Danh sách người dùng', path: '/platform/users', roles: ADMIN, priority: 'P0', aliases: ['PLT-04-USERS'] },
  { id: 'PA-05', title: 'Chi tiết người dùng', path: '/platform/users/:id', roles: ADMIN, priority: 'P0', aliases: ['PLT-05-USER-DETAIL'] },
  { id: 'PA-06', title: 'Quản lý khung TT 02/2025', path: '/platform/framework', roles: ADMIN, priority: 'P0', aliases: ['PLT-04'] },
  { id: 'PA-07', title: 'Chi tiết năng lực chuẩn', path: '/platform/framework/:id', roles: ADMIN, priority: 'P0', aliases: ['PLT-07-COMPETENCY'] },
  { id: 'PA-08', title: 'Chương trình đào tạo chuẩn', path: '/platform/curriculum', roles: ADMIN, priority: 'P0', aliases: ['PLT-05', 'PLT-06'] },
  { id: 'PA-09', title: 'Chi tiết khóa học chuẩn', path: '/platform/courses/:id', roles: ADMIN, priority: 'P0', aliases: ['PLT-09-COURSE'] },
  { id: 'PA-10', title: 'Soạn khóa học chuẩn', path: '/platform/courses/:id/edit', roles: ADMIN, priority: 'P0', aliases: ['PLT-06E'] },
  { id: 'PA-11', title: 'Ngân hàng đề chuẩn', path: '/platform/questions', roles: ADMIN, priority: 'P0', aliases: ['PLT-07'] },
  { id: 'PA-12', title: 'Soạn câu hỏi chuẩn', path: '/platform/questions/:id', roles: ADMIN, priority: 'P0', aliases: ['PLT-12-QUESTION'] },
  { id: 'PA-13', title: 'Mẫu đề đánh giá chuẩn', path: '/platform/assessment-templates', roles: ADMIN, priority: 'P0', aliases: ['PLT-13-TEMPLATE'] },
  { id: 'PA-14', title: 'Vị trí tham chiếu', path: '/platform/positions', roles: ADMIN, priority: 'P1', aliases: ['PLT-08'] },
  { id: 'PA-15', title: 'Yêu cầu vị trí tham chiếu', path: '/platform/positions/:id/requirements', roles: ADMIN, priority: 'P1', aliases: ['PLT-09'] },
  { id: 'PA-16', title: 'Gói và quyền tính năng', path: '/platform/plans', roles: ADMIN, priority: 'P0', aliases: ['PLT-10'] },
  { id: 'PA-17', title: 'Chi tiết gói dịch vụ', path: '/platform/plans/:code', roles: ADMIN, priority: 'P0', aliases: ['PLT-17-PLAN'] },
  { id: 'PA-18', title: 'Giám sát gói đăng ký', path: '/platform/subscriptions', roles: ADMIN, priority: 'P1', aliases: ['PLT-11'] },
  { id: 'PA-19', title: 'Chi tiết gói đăng ký', path: '/platform/subscriptions/:id', roles: ADMIN, priority: 'P1', aliases: ['PLT-19-SUB'] },
  { id: 'PA-20', title: 'Nhật ký nền tảng', path: '/platform/audit-log', roles: ADMIN, priority: 'P1', aliases: ['PLT-12'] },
  { id: 'PA-21', title: 'Cấu hình hệ thống', path: '/platform/settings', roles: ADMIN, priority: 'P1', aliases: ['PLT-13'] },
  { id: 'SHR-01', title: 'Thông tin tài khoản', path: '/platform/account', roles: ADMIN, priority: 'P1' },
  { id: 'SHR-02', title: 'Bảo mật', path: '/platform/account/security', roles: ADMIN, priority: 'P1' },
  { id: 'SHR-03', title: 'Trung tâm thông báo', path: '/platform/notifications', roles: ADMIN, priority: 'P1' },
];
