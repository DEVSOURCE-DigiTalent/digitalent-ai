import { ROLES, type Role } from './roles';

/**
 * Who may give or take which enterprise role (spec v2.1 §1.4, §9 Q3, OW-13).
 * Enterprise has 3 roles: OWNER, MANAGER, EMPLOYEE.
 * Only an OWNER manages members and roles.
 * An OWNER can grant OWNER to another member (with strong confirmation) and assign/unassign MANAGER.
 * Invariant: owner_count >= 1 (cannot demote/remove the sole owner).
 */

export const ENTERPRISE_ROLES: Role[] = [ROLES.OWNER, ROLES.MANAGER, ROLES.EMPLOYEE];

/** Roles an actor may grant. Only OWNER can grant roles. */
export function assignableRoles(actorRoles: readonly string[]): Role[] {
  if (actorRoles.includes(ROLES.OWNER)) {
    return [ROLES.OWNER, ROLES.MANAGER, ROLES.EMPLOYEE];
  }
  return [];
}

/** Only an OWNER can manage members and their roles. */
export function canManageMember(actorRoles: readonly string[], _targetRoles: readonly string[] = []): boolean {
  return actorRoles.includes(ROLES.OWNER);
}

export interface RoleDescription {
  role: Role;
  name: string;
  summary: string;
  can: string[];
}

/** Plain-language description of what each enterprise role can do (v2.1 glossary & spec §6, §7, §8). */
export const ROLE_DESCRIPTIONS: RoleDescription[] = [
  {
    role: ROLES.OWNER,
    name: 'Chủ doanh nghiệp',
    summary: 'Toàn quyền quản trị doanh nghiệp, tổ chức, năng lực, đào tạo, gói dịch vụ và phân quyền.',
    can: [
      'Quản lý gói dịch vụ, thanh toán, quyền sử dụng và cài đặt tổ chức',
      'Thêm, gán vai trò và quản lý thành viên (có thể cấp quyền Chủ doanh nghiệp khác)',
      'Quản lý phòng ban, vị trí, cấp bậc (G1–G3) và gán Quản lý phòng ban',
      'Thiết lập yêu cầu năng lực theo vị trí (chuẩn TT 02/2025)',
      'Tạo đợt đào tạo, phân công khóa học và theo dõi toàn diện',
      'Giao nhiệm vụ thực tế và đánh giá minh chứng trên toàn tổ chức (khi không có Quản lý)',
    ],
  },
  {
    role: ROLES.MANAGER,
    name: 'Quản lý',
    summary: 'Theo dõi tiến độ, giao nhiệm vụ thực tế và đánh giá minh chứng trong phạm vi phòng ban được phân công.',
    can: [
      'Xem danh sách thành viên, năng lực và khoảng trống năng lực trong phạm vi nhóm phụ trách',
      'Theo dõi tiến độ đào tạo của nhân viên trong nhóm',
      'Giao nhiệm vụ thực tế và đánh giá minh chứng của nhân viên trong nhóm',
      'Sử dụng các tính năng học tập và phát triển cá nhân của Nhân viên',
    ],
  },
  {
    role: ROLES.EMPLOYEE,
    name: 'Nhân viên',
    summary: 'Học tập, làm bài đánh giá, thực hiện nhiệm vụ thực tế và phát triển năng lực bản thân.',
    can: [
      'Xem hồ sơ năng lực cá nhân và khoảng trống năng lực so với yêu cầu vị trí',
      'Tham gia các khóa học được phân công theo lộ trình',
      'Làm các bài đánh giá năng lực',
      'Thực hiện nhiệm vụ thực tế, nộp minh chứng và xem phản hồi đánh giá',
      'Xem thành tựu và chứng nhận đã đạt được',
    ],
  },
];
