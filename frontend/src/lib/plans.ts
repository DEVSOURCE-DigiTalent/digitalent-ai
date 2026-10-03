import { ENTITLEMENTS, type Entitlement } from './entitlements';

export type PlanAudience = 'enterprise' | 'individual';
export type BillingCycle = 'month' | 'year';

/** User capacity and add-on policy for a plan. */
export interface PlanUserCapacity {
  /** Baseline included users in the plan bundle */
  included: number;
  /** Maximum users allowed in this tier before recommending the next tier */
  max: number;
  /** Whether additional users can be purchased */
  addonAllowed: boolean;
  /** Add-on price per user per month (VND) */
  monthlyAddonPrice?: number;
  /** Add-on price per user per year (VND) */
  annualAddonPrice?: number;
}

/** Canonical business billing configuration. */
export interface PlanBillingConfig {
  /** Monthly bundle price (null = contact sales) */
  monthlyPrice: number | null;
  /** Annual bundle price (null = contact sales) */
  annualPrice: number | null;
}

export interface Plan {
  code: string;
  audience: PlanAudience;
  name: string;
  tagline: string;
  billing: PlanBillingConfig;
  users?: PlanUserCapacity;
  /** Backwards compatibility accessor */
  monthlyPrice: number | null;
  /** Backwards compatibility seat range */
  seatRange?: { min: number; max: number };
  entitlements: Entitlement[];
  /** Bullet points shown on the card, in order. */
  highlights: string[];
  recommended?: boolean;
}

/** Share of the monthly price kept when paying a year up front (20% off). */
export const YEARLY_PRICE_FACTOR = 0.8;

/**
 * Canonical plan catalog and business configuration.
 * All prices and capacities are declarative: modify here without touching UI or checkout logic.
 */
export const PLANS: Plan[] = [
  {
    code: 'ENT_STARTER',
    audience: 'enterprise',
    name: 'Starter',
    tagline: 'Cho đội ngũ nhỏ bắt đầu chuẩn hóa năng lực số theo khung chuẩn.',
    billing: {
      monthlyPrice: 790_000,
      annualPrice: 7_590_000,
    },
    users: {
      included: 20,
      max: 30,
      addonAllowed: true,
      monthlyAddonPrice: 40_000,
      annualAddonPrice: 384_000,
    },
    monthlyPrice: 790_000,
    seatRange: { min: 20, max: 30 },
    entitlements: [ENTITLEMENTS.PRACTICAL_TASKS],
    highlights: [
      'Bao gồm 20 người dùng (mở rộng tối đa 30)',
      'Khung năng lực TT 02/2025 đầy đủ 6 miền',
      'Yêu cầu năng lực theo vị trí',
      'Phân tích skill gap và đề xuất học tập',
      'Nhiệm vụ thực hành và bằng chứng (evidence)',
    ],
  },
  {
    code: 'ENT_PRO',
    audience: 'enterprise',
    name: 'Pro',
    tagline: 'Cho doanh nghiệp đang mở rộng, cần theo dõi toàn bộ vòng năng lực.',
    billing: {
      monthlyPrice: 1_990_000,
      annualPrice: 19_090_000,
    },
    users: {
      included: 50,
      max: 200,
      addonAllowed: true,
      monthlyAddonPrice: 35_000,
      annualAddonPrice: 336_000,
    },
    monthlyPrice: 1_990_000,
    seatRange: { min: 50, max: 200 },
    entitlements: [
      ENTITLEMENTS.PRACTICAL_TASKS,
      ENTITLEMENTS.INTERNAL_LEARNING,
      ENTITLEMENTS.ADVANCED_ANALYTICS,
      ENTITLEMENTS.BULK_IMPORT,
    ],
    highlights: [
      'Bao gồm 50 người dùng (mở rộng tối đa 200)',
      'Mọi tính năng của Starter',
      'Khóa học nội bộ: văn hóa, onboarding, quy định',
      'Phân tích năng lực nâng cao theo phòng ban',
      'Nhập nhân viên hàng loạt từ file',
    ],
    recommended: true,
  },
  {
    code: 'ENT_CORP',
    audience: 'enterprise',
    name: 'Enterprise',
    tagline: 'Từ 200 người dùng hoặc cần tích hợp SSO/API và triển khai riêng.',
    billing: {
      monthlyPrice: null,
      annualPrice: null,
    },
    users: {
      included: 200,
      max: 10_000,
      addonAllowed: true,
    },
    monthlyPrice: null,
    seatRange: { min: 200, max: 10_000 },
    entitlements: [
      ENTITLEMENTS.PRACTICAL_TASKS,
      ENTITLEMENTS.INTERNAL_LEARNING,
      ENTITLEMENTS.ADVANCED_ANALYTICS,
      ENTITLEMENTS.BULK_IMPORT,
    ],
    highlights: [
      'Từ 200 người dùng hoặc không giới hạn',
      'Tích hợp SSO, API và LMS nội bộ',
      'Hỗ trợ triển khai và điều khoản tùy chỉnh',
      'Cam kết mức dịch vụ (SLA) & DPA riêng',
    ],
  },
  {
    code: 'IND_PLUS',
    audience: 'individual',
    name: 'Plus',
    tagline: 'Lộ trình học theo khoảng trống kỹ năng của bạn.',
    billing: {
      monthlyPrice: 149_000,
      annualPrice: 1_190_000,
    },
    users: {
      included: 1,
      max: 1,
      addonAllowed: false,
    },
    monthlyPrice: 149_000,
    seatRange: { min: 1, max: 1 },
    entitlements: [ENTITLEMENTS.PERSONAL_LEARNING_PATH],
    highlights: [
      '1 tài khoản cá nhân',
      'Chọn vị trí mục tiêu và làm bài đánh giá đầu vào',
      'Lộ trình học theo thứ tự tiên quyết',
      'Toàn bộ 6 bộ giáo trình',
      'Bài đánh giá sau mỗi khóa',
      'Hồ sơ năng lực cá nhân',
    ],
    recommended: true,
  },
  {
    code: 'IND_PRO',
    audience: 'individual',
    name: 'Pro',
    tagline: 'Dành cho người muốn chuyển vị trí hoặc thăng tiến.',
    billing: {
      monthlyPrice: 299_000,
      annualPrice: 2_390_000,
    },
    users: {
      included: 1,
      max: 1,
      addonAllowed: false,
    },
    monthlyPrice: 299_000,
    seatRange: { min: 1, max: 1 },
    entitlements: [ENTITLEMENTS.PERSONAL_LEARNING_PATH, ENTITLEMENTS.ADVANCED_ANALYTICS],
    highlights: ['Mọi tính năng của Plus', 'So sánh với nhiều vị trí mục tiêu', 'Phân tích tiến bộ chi tiết'],
  },
];

export function getPlan(code: string | null | undefined): Plan | undefined {
  return PLANS.find((plan) => plan.code === code);
}

export function plansFor(audience: PlanAudience): Plan[] {
  return PLANS.filter((plan) => plan.audience === audience);
}

/** Suggest an appropriate plan based on estimated user count without forcing input. */
export function suggestPlanForUsers(users: number, audience: PlanAudience): Plan | undefined {
  if (audience !== 'enterprise' || !Number.isFinite(users) || users <= 0) return undefined;
  if (users <= 30) return getPlan('ENT_STARTER');
  if (users <= 200) return getPlan('ENT_PRO');
  return getPlan('ENT_CORP');
}

/** Clamps a requested user count to what the plan allows; individual plans return 1. */
export function clampSeats(plan: Plan, seats: number): number {
  if (!plan.users) return 1;
  const whole = Number.isFinite(seats) ? Math.round(seats) : plan.users.included;
  return Math.min(plan.users.max, Math.max(plan.users.included, whole));
}

export const clampUsers = clampSeats;

/**
 * Calculates plan price according to the bundle model with smooth add-on expansion.
 * - If requested users <= included: base package price.
 * - If requested users > included: base package price + add-on price per extra user.
 */
export function calculatePlanPrice(plan: Plan, users: number, cycle: BillingCycle): number | null {
  if (plan.billing.monthlyPrice === null) return null;
  const capacity = plan.users?.included ?? 1;
  const clampedUsers = clampSeats(plan, users);
  const extraUsers = Math.max(0, clampedUsers - capacity);

  if (cycle === 'year') {
    const base = plan.billing.annualPrice ?? 0;
    const addon = extraUsers * (plan.users?.annualAddonPrice ?? 0);
    return base + addon;
  }
  const base = plan.billing.monthlyPrice ?? 0;
  const addon = extraUsers * (plan.users?.monthlyAddonPrice ?? 0);
  return base + addon;
}

/** Amount to pay for one billing period, in VND. `null` for plans that are not bought online. */
export function priceFor(plan: Plan, seats: number, cycle: BillingCycle): number | null {
  return calculatePlanPrice(plan, seats, cycle);
}

export function formatVnd(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(amount)} ₫`;
}

export function isPurchasableOnline(plan: Plan): boolean {
  return plan.billing.monthlyPrice !== null;
}

/** Entitlements as the session carries them. */
export function entitlementKeys(plan: Plan): string[] {
  return [...plan.entitlements];
}

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  month: 'tháng',
  year: 'năm',
};
