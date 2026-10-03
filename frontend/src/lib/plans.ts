import { ENTITLEMENTS, type Entitlement } from './entitlements';

export type PlanAudience = 'enterprise' | 'individual';
export type BillingCycle = 'month' | 'year';

export interface Plan {
  code: string;
  audience: PlanAudience;
  name: string;
  tagline: string;
  /** VND per seat per month (enterprise) or per month (individual). `null` = contact sales. */
  monthlyPrice: number | null;
  /** Enterprise only: seats that can be bought. */
  seatRange?: { min: number; max: number };
  entitlements: Entitlement[];
  /** Bullet points shown on the card, in order. */
  highlights: string[];
  recommended?: boolean;
}

/** Share of the monthly price kept when paying a year up front (20% off). */
export const YEARLY_PRICE_FACTOR = 0.8;

export const PLANS: Plan[] = [
  {
    code: 'ENT_STARTER',
    audience: 'enterprise',
    name: 'Starter',
    tagline: 'Cho đội ngũ nhỏ bắt đầu đo năng lực số.',
    monthlyPrice: 49_000,
    seatRange: { min: 5, max: 20 },
    entitlements: [ENTITLEMENTS.PRACTICAL_TASKS],
    highlights: [
      'Khung năng lực TT 02/2025 đầy đủ 6 miền',
      'Yêu cầu năng lực theo vị trí',
      'Phân tích skill gap và đề xuất học tập',
      'Nhiệm vụ thực hành và bằng chứng',
    ],
  },
  {
    code: 'ENT_PRO',
    audience: 'enterprise',
    name: 'Pro',
    tagline: 'Cho doanh nghiệp cần theo dõi toàn bộ vòng năng lực.',
    monthlyPrice: 79_000,
    seatRange: { min: 10, max: 200 },
    entitlements: [
      ENTITLEMENTS.PRACTICAL_TASKS,
      ENTITLEMENTS.INTERNAL_LEARNING,
      ENTITLEMENTS.ADVANCED_ANALYTICS,
      ENTITLEMENTS.BULK_IMPORT,
    ],
    highlights: [
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
    tagline: 'Quy mô lớn, cần tích hợp và hỗ trợ riêng.',
    monthlyPrice: null,
    entitlements: [
      ENTITLEMENTS.PRACTICAL_TASKS,
      ENTITLEMENTS.INTERNAL_LEARNING,
      ENTITLEMENTS.ADVANCED_ANALYTICS,
      ENTITLEMENTS.BULK_IMPORT,
    ],
    highlights: ['Số ghế theo thỏa thuận', 'Hỗ trợ triển khai riêng', 'Cam kết mức dịch vụ (SLA)'],
  },
  {
    code: 'IND_PLUS',
    audience: 'individual',
    name: 'Plus',
    tagline: 'Lộ trình học theo khoảng trống kỹ năng của bạn.',
    monthlyPrice: 149_000,
    entitlements: [ENTITLEMENTS.PERSONAL_LEARNING_PATH],
    highlights: [
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
    monthlyPrice: 299_000,
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

/** Clamps a requested seat count to what the plan sells; plans without seats return 1. */
export function clampSeats(plan: Plan, seats: number): number {
  if (!plan.seatRange) return 1;
  const whole = Number.isFinite(seats) ? Math.round(seats) : plan.seatRange.min;
  return Math.min(plan.seatRange.max, Math.max(plan.seatRange.min, whole));
}

/** Amount to pay for one billing period, in VND. `null` for plans that are not bought online. */
export function priceFor(plan: Plan, seats: number, cycle: BillingCycle): number | null {
  if (plan.monthlyPrice === null) return null;
  const monthly = plan.monthlyPrice * clampSeats(plan, seats);
  return cycle === 'year' ? Math.round(monthly * 12 * YEARLY_PRICE_FACTOR) : monthly;
}

export function formatVnd(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(amount)} ₫`;
}

export function isPurchasableOnline(plan: Plan): boolean {
  return plan.monthlyPrice !== null;
}

/** Entitlements as the session carries them. */
export function entitlementKeys(plan: Plan): string[] {
  return [...plan.entitlements];
}

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  month: 'tháng',
  year: 'năm',
};
