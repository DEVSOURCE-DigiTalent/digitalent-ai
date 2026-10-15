import { AxiosError } from 'axios';
import type { PillTone } from './pulse-ui';

/** Formatters, labels and small helpers of the Platform Admin console. */

export const REASON_MIN = 10;

export const isReasonValid = (reason: string) => reason.trim().length >= REASON_MIN;

// ---------------------------------------------------------------------------------------------

export const formatMoney = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)} ₫`;
export const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN').format(value);
export const formatDate = (value: string | null | undefined) =>
  value ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value)) : '—';
export const formatDateTime = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
    : '—';

export const ROLE_LABELS: Record<string, string> = {
  PLATFORM_ADMIN: 'Quản trị nền tảng',
  OWNER: 'Chủ doanh nghiệp',
  MANAGER: 'Quản lý phòng ban',
  EMPLOYEE: 'Nhân viên',
  LEARNER: 'Học viên cá nhân',
};

export const USER_STATUS: Record<string, { label: string; tone: PillTone }> = {
  ACTIVE: { label: 'Đang hoạt động', tone: 'green' },
  LOCKED: { label: 'Đã khóa', tone: 'coral' },
  INACTIVE: { label: 'Vô hiệu hóa', tone: 'gray' },
  TRANSFERRED: { label: 'Đã chuyển', tone: 'gray' },
};

export const ORG_STATUS: Record<string, { label: string; tone: PillTone }> = {
  ACTIVE: { label: 'Đang hoạt động', tone: 'green' },
  SUSPENDED: { label: 'Tạm ngưng', tone: 'coral' },
  INACTIVE: { label: 'Ngừng hoạt động', tone: 'gray' },
};

export const STAGE_LABELS: Record<string, { label: string; tone: PillTone }> = {
  TRIAL: { label: 'Đang dùng thử', tone: 'green' },
  PAID: { label: 'Đã mua khóa', tone: undefined },
};

export const SALES_STATUS: Record<string, { label: string; tone: PillTone }> = {
  OPEN: { label: 'Đang mở bán', tone: 'green' },
  PAUSED: { label: 'Tạm ngưng bán', tone: 'coral' },
};

export const ORDER_KIND: Record<string, { label: string; tone: PillTone }> = {
  PURCHASE: { label: 'Doanh nghiệp mua', tone: undefined },
  ADMIN_GRANT: { label: 'Quản trị cấp', tone: 'gray' },
};

export const AUDIT_ACTIONS: Record<string, string> = {
  PLATFORM_FRAMEWORK_DRAFT_SAVED: 'Lưu nháp khung chuẩn',
  PLATFORM_FRAMEWORK_PUBLISHED: 'Phát hành khung chuẩn',
  PLATFORM_COURSE_DRAFT_SAVED: 'Lưu nháp khóa học',
  PLATFORM_COURSE_PUBLISHED: 'Phát hành khóa học',
  PLATFORM_COURSE_QUESTION_ADDED: 'Thêm câu hỏi nháp',
  PLATFORM_SEATS_GRANTED: 'Cấp suất khóa có phí',
  PLATFORM_ORGANIZATION_SUSPENDED: 'Tạm ngưng tổ chức',
  PLATFORM_ORGANIZATION_RESTORED: 'Khôi phục tổ chức',
  PLATFORM_USER_LOCKED: 'Khóa tài khoản',
  PLATFORM_USER_UNLOCKED: 'Mở khóa tài khoản',
};

export const auditActionLabel = (action: string) => AUDIT_ACTIONS[action] ?? action.replace(/_/g, ' ').toLowerCase();

/** Reads `reason` from an audit entry's JSON new_values. */
export function auditReason(newValues: string | null | undefined): string | null {
  if (!newValues) return null;
  try {
    const parsed = JSON.parse(newValues) as { reason?: unknown };
    return typeof parsed.reason === 'string' ? parsed.reason : null;
  } catch {
    return null;
  }
}

export function initials(name: string) {
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/** Turns an API error into a readable sentence (machine codes translated). */
export function errorMessage(error: unknown): string {
  const codes: Record<string, string> = {
    BASIC_COURSE_IS_FREE: 'Khóa Cơ bản luôn miễn phí.',
    NO_DRAFT_CHANGES: 'Chưa có thay đổi nháp nào để phát hành.',
    CANNOT_LOCK_SELF: 'Không thể tự khóa tài khoản của mình.',
    CANNOT_LOCK_PLATFORM_ADMIN: 'Không khóa tài khoản quản trị nền tảng tại đây.',
    USER_INACTIVE: 'Tài khoản đã bị vô hiệu hóa.',
    DOMAIN_NOT_FOUND: 'Không tìm thấy lĩnh vực.',
  };
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string; errors?: { message?: string }[] } | undefined;
    const code = data?.errors?.[0]?.message;
    if (code && codes[code]) return codes[code];
    if (error.response?.status === 409) return 'Trạng thái đã thay đổi, hãy tải lại trang.';
    if (error.response?.status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
    return code || data?.message || error.message;
  }
  return error instanceof Error ? error.message : 'Đã có lỗi xảy ra.';
}
