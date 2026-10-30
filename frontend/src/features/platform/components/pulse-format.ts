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

export const LEVEL_NAMES: Record<number, string> = { 1: 'Cơ bản', 2: 'Trung cấp', 3: 'Nâng cao' };

/** Organization subscription (table subscriptions). */
export const PLAN_STATUS: Record<string, string> = {
  ACTIVE: 'Đang hiệu lực',
  EXPIRED: 'Hết hạn',
  PAYMENT_REQUIRED: 'Chờ thanh toán',
  CANCELLED: 'Đã hủy',
};
export const PLAN_CYCLE: Record<string, string> = { month: 'Theo tháng', year: 'Theo năm', MONTH: 'Theo tháng', YEAR: 'Theo năm' };

/** Personal plans (user_subscriptions). */
export const PERSONAL_PLANS: Record<string, string> = { IND_PLUS: 'Cá nhân Plus', IND_PRO: 'Cá nhân Pro', IND_FREE: 'Miễn phí' };

/** Whole days left until a date (0 once it passed). */
export const daysUntil = (value: string | null | undefined) =>
  value ? Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000)) : 0;

/** How a course of a draft catalog version differs from the version it was copied from. */
export const CHANGE_KIND: Record<string, { label: string; tone: PillTone }> = {
  NEW: { label: 'Khóa mới', tone: 'green' },
  EDITED: { label: 'Đã sửa', tone: undefined },
  UNCHANGED: { label: 'Giữ nguyên', tone: 'gray' },
};

/** Review questions per module: below the minimum blocks publishing, below the recommended count is a warning. */
export const QUESTIONS_MIN = 2;
export const QUESTIONS_RECOMMENDED = 6;

export const ORDER_KIND: Record<string, { label: string; tone: PillTone }> = {
  PURCHASE: { label: 'Doanh nghiệp mua', tone: undefined },
  ADMIN_GRANT: { label: 'Quản trị cấp', tone: 'gray' },
};

export const AUDIT_ACTIONS: Record<string, string> = {
  PLATFORM_FRAMEWORK_CREATED: 'Thêm khung chuẩn',
  PLATFORM_FRAMEWORK_DOMAIN_ADDED: 'Thêm lĩnh vực',
  PLATFORM_FRAMEWORK_DOMAIN_UPDATED: 'Sửa lĩnh vực',
  PLATFORM_FRAMEWORK_DOMAIN_ARCHIVED: 'Xóa lĩnh vực',
  PLATFORM_FRAMEWORK_UPDATED: 'Sửa khung chuẩn',
  PLATFORM_FRAMEWORK_ARCHIVED: 'Xóa khung chuẩn',
  PLATFORM_FRAMEWORK_DRAFT_SAVED: 'Lưu nháp khung chuẩn',
  PLATFORM_FRAMEWORK_PUBLISHED: 'Công bố khung chuẩn',
  PLATFORM_CATALOG_DRAFT_CREATED: 'Tạo bản nháp phiên bản khóa học',
  PLATFORM_CATALOG_COURSE_ADDED: 'Thêm khóa học vào bản nháp',
  PLATFORM_CATALOG_COURSE_REMOVED: 'Bỏ khóa học khỏi bản nháp',
  PLATFORM_CATALOG_PUBLISHED: 'Công bố phiên bản khóa học',
  PLATFORM_COURSE_DRAFT_SAVED: 'Lưu nháp khóa học',
  PLATFORM_COURSE_PUBLISHED: 'Phát hành khóa học',
  PLATFORM_COURSE_QUESTION_ADDED: 'Thêm câu hỏi nháp',
  PLATFORM_SEATS_GRANTED: 'Cấp suất khóa có phí',
  PLATFORM_ORGANIZATION_SUSPENDED: 'Tạm ngưng tổ chức',
  PLATFORM_ORGANIZATION_RESTORED: 'Khôi phục tổ chức',
  PLATFORM_USER_LOCKED: 'Khóa tài khoản',
  PLATFORM_USER_UNLOCKED: 'Mở khóa tài khoản',
  TRIAL_MENTOR_ASSIGNED: 'Gán người hướng dẫn dùng thử',
  MENTOR_CREATED: 'Tạo tài khoản chuyên gia hướng dẫn',
  PLATFORM_REFERENCE_POSITIONS_UPDATED: 'Cập nhật chuẩn mẫu vị trí việc làm',
  ORGANIZATION_CREATED: 'Tạo mới tổ chức',
  ORGANIZATION_STATUS_CHANGED: 'Đổi trạng thái tổ chức',
  USER_CREATED: 'Tạo tài khoản mới',
  USER_PASSWORD_RESET_ASSISTED: 'Hỗ trợ cấp lại mật khẩu',
};

export const auditActionLabel = (action: string) => {
  if (!action) return 'Thao tác hệ thống';
  const normalizedKey = action.trim().replace(/\s+/g, '_').toUpperCase();
  return AUDIT_ACTIONS[normalizedKey] ?? AUDIT_ACTIONS[action] ?? action.replace(/_/g, ' ');
};


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
    FRAMEWORK_ARCHIVED: 'Khung đã bị xóa.',
  };
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string; errors?: { message?: string }[] } | undefined;
    const code = data?.errors?.[0]?.message;
    if (code && codes[code]) return codes[code];
    // Conflicts raised by use cases explain themselves in Vietnamese; the middleware's generic ones are English.
    if (error.response?.status === 409) {
      return data?.message && !/^(The|A) record/.test(data.message) ? data.message : 'Trạng thái đã thay đổi, hãy tải lại trang.';
    }
    if (error.response?.status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
    // An untranslated machine code (e.g. PUBLISH_BLOCKED) comes with a readable message.
    if (code && /^[A-Z][A-Z0-9_]+$/.test(code) && data?.message) return data.message;
    return code || data?.message || error.message;
  }
  return error instanceof Error ? error.message : 'Đã có lỗi xảy ra.';
}

export const PASTEL_PALETTES = [
  { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' }, // blue
  { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' }, // purple
  { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' }, // emerald
  { bg: '#fffbeb', text: '#b45309', border: '#fde68a' }, // amber
  { bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' }, // teal
  { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' }, // pink
  { bg: '#f8fafc', text: '#334155', border: '#cbd5e1' }, // slate
];

export function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PASTEL_PALETTES.length;
  return PASTEL_PALETTES[index];
}

