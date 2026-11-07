import type { CapabilityCeilings } from '@/services/capability-ceiling.service';
import type { TrialPlanKind, TrialRoadmap } from '@/services/trial-program.service';
import { learners, levelsOf, optionOf } from '@/features/trial-program/lib/trial-plan';

/** Phạm vi đào tạo theo kết quả test dùng thử trên ma trận OW-05 (thuần, không React). */

/** Số suất cần mua cho một khóa (mã khóa → số người cần học) theo phương án đang chọn. */
export type SeatHints = Map<string, number>;

export interface TrialScope {
  seats: SeatHints;
  /** Lý do ✦ mức tối đa đề xuất theo categoryId (chỉ với phương án Đề xuất). */
  reasons: Map<string, string>;
}

export function courseCode(code: string | null, domainSortOrder: number, level: number) {
  return code || `M${domainSortOrder}-${level === 2 ? 'I' : 'A'}`;
}

/** Số suất từng khóa Trung cấp / Nâng cao của phương án <paramref name="kind"/> (người có mức &lt; cấp ≤ mức tối đa). */
export function trialScopeOf(roadmap: TrialRoadmap, matrix: CapabilityCeilings, kind: TrialPlanKind): TrialScope | null {
  const option = optionOf(roadmap, kind);
  if (!option) return null;
  const plan = levelsOf(option);
  const seats: SeatHints = new Map();
  const reasons = new Map<string, string>();
  matrix.domains.forEach((domain, position) => {
    const index = trialDomainIndex(roadmap, domain.categoryId, position);
    for (const course of domain.courses.filter((c) => c.level > 1)) {
      const n = learners(roadmap.people, plan, index, course.level).length;
      if (n > 0) seats.set(courseCode(course.code, domain.sortOrder, course.level), n);
    }
    const reason = roadmap.reasons.find((r) => r.domainNumber === roadmap.domains[index]?.number);
    if (kind === 'BALANCED' && reason) reasons.set(domain.categoryId, reason.text);
  });
  return { seats, reasons };
}

/** Lĩnh vực của lộ trình ứng với một lĩnh vực của ma trận: theo categoryId, không có thì theo thứ tự. */
export function trialDomainIndex(roadmap: TrialRoadmap, categoryId: string, position: number) {
  const index = roadmap.domains.findIndex((d) => d.categoryId === categoryId);
  return index >= 0 ? index : position;
}
