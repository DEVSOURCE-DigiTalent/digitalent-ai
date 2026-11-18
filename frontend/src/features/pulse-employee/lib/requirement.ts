import type { PulseCourseSummary, PulseDomain, PulseOverview, PulsePerson } from '@/services/pulse.service';

/**
 * Mức tối thiểu doanh nghiệp yêu cầu và khóa học vượt trên lộ trình của nhân viên.
 *
 * - Mức tối thiểu (`domain.pathTop`) = mức chủ doanh nghiệp đặt cho phòng ban; phòng ban chưa đặt thì theo chuẩn vị trí.
 * - Khóa bắt buộc (`zone` PATH) = Cơ bản → mức tối thiểu. Khóa doanh nghiệp đã có (Cơ bản miễn phí, khóa đã mua) ở cấp cao
 *   hơn (`zone` OPTIONAL) là học vượt: định hướng riêng của nhân viên, được khuyến khích. Khóa chưa mua ở trên mức tối
 *   thiểu (`ABOVE_CEILING`) không hiện.
 */

/** Khóa nhân viên thấy trong một lĩnh vực, theo cấp: khóa bắt buộc rồi khóa học vượt. */
export const visibleCourses = (overview: PulseOverview, domain: PulseDomain): PulseCourseSummary[] =>
  overview.courses
    .filter((c) => c.categoryId === domain.categoryId && (c.zone === 'PATH' || c.zone === 'OPTIONAL'))
    .sort((a, b) => a.tier - b.tier);

/** Lĩnh vực hiện trên lộ trình: có ít nhất một khóa bắt buộc hoặc học vượt. */
export const roadmapDomains = (overview: PulseOverview): PulseDomain[] =>
  overview.domains.filter((d) => visibleCourses(overview, d).length > 0);

/** Đã đạt mức tối thiểu doanh nghiệp yêu cầu (mức 0 = lĩnh vực không bắt buộc). */
export const meetsRequirement = (domain: PulseDomain): boolean =>
  domain.pathTop === 0 || domain.verified >= domain.pathTop;

/** Khóa bắt buộc chưa đạt của lĩnh vực. */
export const remainingRequired = (overview: PulseOverview, domain: PulseDomain): PulseCourseSummary[] =>
  visibleCourses(overview, domain).filter((c) => c.zone === 'PATH' && !c.approved);

export const isBeyond = (course: PulseCourseSummary): boolean => course.zone === 'OPTIONAL';

/**
 * Cấp cao nhất nhân viên học được trong lĩnh vực: khóa cao nhất doanh nghiệp đã có (Cơ bản miễn phí, khóa đã mua hoặc
 * đã được giao); khóa bắt buộc chưa mua không tính. 0 = chưa có khóa nào.
 */
export const openLevel = (overview: PulseOverview, domain: PulseDomain): number =>
  visibleCourses(overview, domain)
    .filter((c) => c.slotStatus !== 'PURCHASE_NEEDED')
    .reduce((top, c) => Math.max(top, c.tier), 0);

/** "Phòng Kế toán" từ "Kế toán" hoặc "Phòng Kế toán"; null khi chưa có phòng ban. */
export function departmentTitle(name: string | null | undefined): string | null {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  return trimmed.toLowerCase().startsWith('phòng') ? trimmed : `Phòng ${trimmed}`;
}

/** Ai đặt mức tối thiểu của lĩnh vực: phòng ban (mức chủ doanh nghiệp đặt riêng) hoặc chuẩn vị trí. */
export function requirementSource(domain: PulseDomain, person: PulsePerson): string {
  if (domain.requiredByDepartment) return departmentTitle(person.departmentName) ?? 'Phòng ban của bạn';
  return person.positionName ? `Chuẩn vị trí ${person.positionName}` : 'Chuẩn vị trí của bạn';
}
