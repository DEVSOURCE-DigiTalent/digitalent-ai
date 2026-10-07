import { ROLE_LABELS, type Role } from '@/lib/roles';
import type { MemberStatus } from '@/services/member.service';

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  PENDING: 'Chờ kích hoạt',
  INACTIVE: 'Đã vô hiệu hóa',
};

export const MEMBER_STATUS_VARIANTS = {
  ACTIVE: 'success',
  PENDING: 'warning',
  INACTIVE: 'danger',
} as const;

export const roleLabel = (role: string): string => ROLE_LABELS[role as Role] ?? role;

export const rolesLabel = (roles: string[]): string => roles.map(roleLabel).join(', ') || '—';

/** Actor shown for audit entries the system made (the backend sends actorName: null). */
export const SYSTEM_ACTOR = 'Hệ thống';

/** Audit actions as the log shows them. */
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  MEMBER_INVITED: 'Mời thành viên',
  INVITATION_RESENT: 'Gửi lại lời mời',
  INVITATION_REVOKED: 'Thu hồi lời mời',
  INVITATION_ACCEPTED: 'Kích hoạt lời mời',
  MEMBER_DEACTIVATED: 'Vô hiệu hóa thành viên',
  MEMBER_REACTIVATED: 'Kích hoạt lại thành viên',
  MEMBER_PLACEMENT_CHANGED: 'Đổi phòng ban / vị trí',
  ROLE_CHANGED: 'Đổi vai trò',
  ORGANIZATION_UPDATED: 'Cập nhật tổ chức',
  SUBSCRIPTION_PURCHASED: 'Mua gói dịch vụ',
  SUBSCRIPTION_CHANGED: 'Đổi gói dịch vụ',
  SUBSCRIPTION_CANCEL_SCHEDULED: 'Hủy gia hạn gói',
  SUBSCRIPTION_RESUMED: 'Bật lại gia hạn gói',
  DEPARTMENT_CREATED: 'Tạo phòng ban',
  DEPARTMENT_UPDATED: 'Sửa phòng ban',
  DEPARTMENT_ARCHIVED: 'Lưu trữ phòng ban',
  POSITION_CREATED: 'Tạo vị trí',
  POSITION_UPDATED: 'Sửa vị trí',
  POSITION_ARCHIVED: 'Lưu trữ vị trí',
  JOB_GRADE_UPDATED: 'Cập nhật cấp bậc',
  EMPLOYEE_CREATED: 'Tạo hồ sơ nhân viên',
  EMPLOYEE_UPDATED: 'Sửa hồ sơ nhân viên',
  EMPLOYEE_ARCHIVED: 'Lưu trữ nhân viên',
  EMPLOYEE_TRANSFERRED: 'Điều chuyển nhân viên',
  REQUIREMENT_DRAFT_CREATED: 'Tạo bản nháp yêu cầu năng lực',
  REQUIREMENT_DRAFT_UPDATED: 'Sửa bản nháp yêu cầu năng lực',
  REQUIREMENT_ACTIVATED: 'Kích hoạt yêu cầu năng lực',
  COMPETENCY_CONFIRMED: 'Xác nhận năng lực',
  COURSE_ASSIGNED: 'Giao khóa học',
  ASSIGNMENT_CANCELLED: 'Hủy giao khóa học',
  RECOMMENDATION_ACCEPTED: 'Nhận đề xuất học tập',
  RECOMMENDATION_DISMISSED: 'Bỏ qua đề xuất học tập',
};

export const auditActionLabel = (action: string): string => AUDIT_ACTION_LABELS[action] ?? action;
