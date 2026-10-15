import { ROLES } from '../roles';
import type { ScreenDef } from './types';

const ADMIN = [ROLES.PLATFORM_ADMIN];

/**
 * Platform Admin sitemap — Pulse redesign (docs/ui-redesign/16-pulse-product-flow-detailed.md §12.4, §12.6 and §14),
 * reworked by Platform Admin v2 (docs/specs/2026-10-15-platform-admin-v2.md): frameworks, catalog versions with the
 * version in use as the anchor, and the course builder. Data comes from api/v1/platform (PlatformAdminController,
 * PlatformCatalogController). Aliases keep the previous PLT-* / PA-* identifiers resolvable.
 */
export const PLATFORM_SCREENS: ScreenDef[] = [
  { id: 'PA-01', title: 'Tổng quan quản trị', path: '/platform/dashboard', roles: ADMIN, permission: 'platform.organization.read', priority: 'P0', aliases: ['PLT-01'] },
  { id: 'PA-02', title: 'Khung chuẩn', path: '/platform/frameworks', roles: ADMIN, permission: 'platform.catalog.read', priority: 'P0', aliases: ['PLT-04'] },
  { id: 'PA-03', title: 'Phiên bản khóa học', path: '/platform/versions', roles: ADMIN, permission: 'platform.catalog.read', priority: 'P0', aliases: ['PLT-05', 'PLT-06'] },
  { id: 'PA-12', title: 'Khóa học của phiên bản', path: '/platform/versions/:versionNo', roles: ADMIN, permission: 'platform.catalog.read', priority: 'P0' },
  { id: 'PA-04', title: 'Soạn khóa học', path: '/platform/versions/:versionNo/courses/:courseId', roles: ADMIN, permission: 'platform.catalog.read', priority: 'P0', aliases: ['PLT-06E'] },
  { id: 'PA-05', title: 'Tổ chức', path: '/platform/organizations', roles: ADMIN, permission: 'platform.organization.read', priority: 'P0', aliases: ['PLT-02'] },
  { id: 'PA-06', title: 'Tổ chức 360', path: '/platform/organizations/:id', roles: ADMIN, permission: 'platform.organization.read', priority: 'P0', aliases: ['PLT-03'] },
  { id: 'PA-07', title: 'Người dùng', path: '/platform/users', roles: ADMIN, permission: 'platform.user.read', priority: 'P0', aliases: ['PLT-04-USERS'] },
  { id: 'PA-08', title: 'Chi tiết người dùng', path: '/platform/users/:id', roles: ADMIN, permission: 'platform.user.read', priority: 'P0', aliases: ['PLT-05-USER-DETAIL'] },
  { id: 'PA-09', title: 'Đơn giá', path: '/platform/commerce', roles: ADMIN, permission: 'platform.commerce.read', priority: 'P0', aliases: ['PLT-10', 'PLT-11'] },
  { id: 'PA-10', title: 'Nhật ký kiểm tra', path: '/platform/audit-log', roles: ADMIN, permission: 'audit_log.read_system', priority: 'P0', aliases: ['PLT-12'] },
  { id: 'SHR-01', title: 'Hồ sơ của tôi', path: '/platform/account', roles: ADMIN, priority: 'P1' },
  { id: 'SHR-02', title: 'Bảo mật', path: '/platform/account/security', roles: ADMIN, priority: 'P1' },
  { id: 'SHR-03', title: 'Trung tâm thông báo', path: '/platform/notifications', roles: ADMIN, priority: 'P1' },
];

export function findPlatformScreen(id: string): ScreenDef | undefined {
  return PLATFORM_SCREENS.find((s) => s.id === id || s.aliases?.includes(id));
}
