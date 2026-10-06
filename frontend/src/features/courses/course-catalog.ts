import type { CourseListItem } from '@/services/assignment.service';
import type { CompetencyCategory } from '@/services/competency.service';

const TT02_DOMAIN_NAMES = [
  'Khai thác dữ liệu và thông tin',
  'Giao tiếp và hợp tác trong môi trường số',
  'Sáng tạo nội dung số',
  'An toàn',
  'Giải quyết vấn đề',
  'Ứng dụng trí tuệ nhân tạo',
];

export function courseCategories(apiCategories: CompetencyCategory[]): CompetencyCategory[] {
  return TT02_DOMAIN_NAMES.map((name, index) => {
    const domain = index + 1;
    return apiCategories.find((category) => categoryDomain(category) === domain)
      ?? { id: `tt02-domain-${domain}`, code: `TT02_D${domain}`, name, sortOrder: domain };
  });
}

/** Course codes in both TT02 datasets (A1-F and M1-F) carry a domain and level. */
export function courseCodeMetadata(code: string): { domain: number; level: number } | null {
  const match = code.match(/^[AM](\d+)-([FIA])$/i);
  if (!match) return null;
  return { domain: Number(match[1]), level: { F: 1, I: 2, A: 3 }[match[2].toUpperCase() as 'F' | 'I' | 'A'] };
}

export function categoryDomain(category: CompetencyCategory): number | null {
  const fromCode = category.code.match(/D(\d+)$/i);
  return fromCode ? Number(fromCode[1]) : category.sortOrder || null;
}

export function filterCourseCatalog(
  courses: CourseListItem[],
  category: CompetencyCategory | undefined,
  level: number | undefined,
): CourseListItem[] {
  return courses.filter((course) => {
    const fromCode = courseCodeMetadata(course.code);
    if (category) {
      const matchesCategory = course.categoryId === category.id || fromCode?.domain === categoryDomain(category);
      if (!matchesCategory) return false;
    }
    return !level || (fromCode?.level ?? course.level) === level;
  });
}
