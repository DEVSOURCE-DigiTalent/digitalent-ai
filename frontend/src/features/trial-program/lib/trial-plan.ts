import type { TrialPlanKind, TrialPlanOption, TrialRoadmap } from '@/services/trial-program.service';

/**
 * Số suất / chi phí của một phạm vi đào tạo (thuần, không React). Một người cần suất khóa cấp k của một lĩnh vực khi mức
 * hiện tại < k ≤ mức tối đa hiệu lực (phòng ban có mức riêng thì dùng mức đó, không thì mức doanh nghiệp). Cơ bản miễn phí.
 */

/** Ba phương án phạm vi đào tạo (planner). */
export const PLAN_KINDS: { kind: TrialPlanKind; label: string }[] = [
  { kind: 'SAVING', label: 'Tiết kiệm' },
  { kind: 'BALANCED', label: 'Đề xuất' },
  { kind: 'FULL', label: 'Đầy đủ' },
];

export const TIERS = [1, 2, 3] as const;
export type Tier = (typeof TIERS)[number];

export interface TrialPlanPerson {
  departmentId: string;
  levels: number[];
}

/** Mức tối đa: doanh nghiệp mỗi lĩnh vực + mức riêng (null = theo doanh nghiệp) của phòng ban. */
export interface PlanLevels {
  organization: number[];
  departments: Record<string, (number | null)[]>;
}

export interface TierTotal {
  courses: number;
  seats: number;
  cost: number;
}

export interface PlanTotals {
  /** Khóa có suất phải mua (Trung cấp, Nâng cao). */
  courses: number;
  seats: number;
  cost: number;
  byTier: Record<Tier, TierTotal>;
  /** Chi phí mỗi lĩnh vực: [Trung cấp, Nâng cao]. */
  costByDomain: [number, number][];
}

export function levelsOf(option: TrialPlanOption): PlanLevels {
  return {
    organization: [...option.organization],
    departments: Object.fromEntries(option.departments.map((d) => [d.departmentId, [...d.levels]])),
  };
}

export function optionOf(roadmap: TrialRoadmap, kind: TrialPlanOption['kind'] = roadmap.suggested): TrialPlanOption | undefined {
  return roadmap.options.find((o) => o.kind === kind);
}

export function effectiveLevel(plan: PlanLevels, departmentId: string, domain: number): number {
  return plan.departments[departmentId]?.[domain] ?? plan.organization[domain] ?? 1;
}

/** Người cần suất khóa (lĩnh vực, cấp) trong phạm vi. */
export function learners(people: TrialPlanPerson[], plan: PlanLevels, domain: number, tier: number): TrialPlanPerson[] {
  return people.filter((p) => p.levels[domain] < tier && tier <= effectiveLevel(plan, p.departmentId, domain));
}

export function planTotals(people: TrialPlanPerson[], plan: PlanLevels, prices: number[]): PlanTotals {
  const byTier = { 1: empty(), 2: empty(), 3: empty() } as Record<Tier, TierTotal>;
  const costByDomain = plan.organization.map<[number, number]>(() => [0, 0]);

  plan.organization.forEach((_, domain) => {
    for (const tier of TIERS) {
      const seats = learners(people, plan, domain, tier).length;
      if (seats === 0) continue;
      const cost = seats * (prices[tier] ?? 0);
      byTier[tier].courses += 1;
      byTier[tier].seats += seats;
      byTier[tier].cost += cost;
      if (tier > 1) costByDomain[domain][tier - 2] = cost;
    }
  });

  return {
    courses: byTier[2].courses + byTier[3].courses,
    seats: byTier[2].seats + byTier[3].seats,
    cost: byTier[2].cost + byTier[3].cost,
    byTier,
    costByDomain,
  };
}

/** Trung bình mức của một nhóm ở một lĩnh vực (0 khi nhóm rỗng). */
export function averageLevel(people: TrialPlanPerson[], domain: number): number {
  return people.length ? people.reduce((sum, p) => sum + p.levels[domain], 0) / people.length : 0;
}

function empty(): TierTotal {
  return { courses: 0, seats: 0, cost: 0 };
}
