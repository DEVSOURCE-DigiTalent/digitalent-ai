import type { CourseListItem } from '@/services/assignment.service';
import type { CompetencyCategory } from '@/services/competency.service';
import { categoryDomain, courseCodeMetadata } from '@/features/courses/course-catalog';
import { translateUi } from '@/lib/i18n';

/**
 * Course tree of the owner catalog (OW-23): TT02 framework → 6 domains → 3 levels (Cơ bản → Trung cấp → Nâng cao).
 * Each level is a slot that normally holds one course; the courses of a domain are chained by prerequisites.
 */

export const LEVELS = [
  { level: 1, code: 'F', name: 'Cơ bản' },
  { level: 2, code: 'I', name: 'Trung cấp' },
  { level: 3, code: 'A', name: 'Nâng cao' },
] as const;

export interface LevelSlot {
  level: number;
  courses: CourseListItem[];
}

export interface DomainBranch {
  domain: number;
  category: CompetencyCategory;
  slots: LevelSlot[];
  assignedCount: number;
}

/** TT02 courses cover a domain at one level; a competency links to that domain and its required level. */
export function findGapCourse(branches: DomainBranch[], frameworkCode: string, level: number): CourseListItem | undefined {
  const domain = Number(frameworkCode.split('.')[0]);
  if (!/^\d+\.\d+$/.test(frameworkCode) || !Number.isInteger(level) || level < 1 || level > 3) return undefined;
  return branches.find((branch) => branch.domain === domain)?.slots
    .find((slot) => slot.level === level)?.courses
    .find((course) => course.status === 'PUBLISHED');
}

export function buildCourseTree(
  categories: CompetencyCategory[],
  courses: CourseListItem[],
): { branches: DomainBranch[]; others: CourseListItem[] } {
  const live = courses.filter((course) => course.status !== 'ARCHIVED');
  const others: CourseListItem[] = [];
  const byDomain = new Map<number, CourseListItem[]>();
  for (const course of live) {
    const meta = courseCodeMetadata(course.code);
    const category = meta ? undefined : categories.find((c) => c.id === course.categoryId);
    const domain = meta?.domain ?? (category ? categoryDomain(category) : null);
    if (!domain) {
      others.push(course);
      continue;
    }
    byDomain.set(domain, [...(byDomain.get(domain) ?? []), course]);
  }

  const branches = categories.map((category) => {
    const domain = categoryDomain(category) ?? category.sortOrder;
    const domainCourses = byDomain.get(domain) ?? [];
    return {
      domain,
      // API names may carry their number ("1. Khai thác…"); the tree shows it in its own badge.
      category: { ...category, name: category.name.replace(/^\s*\d+[.)]\s*/, '') },
      slots: LEVELS.map(({ level }) => ({
        level,
        courses: domainCourses
          .filter((course) => courseLevel(course) === level)
          .sort((a, b) => Number(a.status !== 'PUBLISHED') - Number(b.status !== 'PUBLISHED')),
      })),
      assignedCount: domainCourses.reduce((sum, course) => sum + course.assignedCount, 0),
    };
  });

  return { branches, others };
}

export function courseLevel(course: CourseListItem): number {
  return courseCodeMetadata(course.code)?.level ?? course.level;
}

/** Default course prices (VND) when the catalog has no price yet. A paid course is bought once for the whole organization. */
const DEFAULT_LEVEL_PRICE: Record<number, number> = { 1: 0, 2: 399000, 3: 699000 };

/**
 * Price label of a course level. `price` is the course's own price from the catalog when known (Platform Admin may
 * change it); otherwise the default of the level. Basic courses are always free.
 */
export function levelPricing(level: number, price?: number | null) {
  const amount = level <= 1 ? 0 : price || DEFAULT_LEVEL_PRICE[level] || 0;
  if (amount === 0) return { price: 0, formatted: 'Miễn phí', isFree: true, badge: 'Miễn phí' };
  const money = `${amount.toLocaleString('vi-VN')} ₫`;
  return { price: amount, formatted: `${money} / cả doanh nghiệp`, isFree: false, badge: money };
}

export function levelName(level: number): string {
  return translateUi(LEVELS.find((l) => l.level === level)?.name ?? `Bậc ${level}`);
}

export function matchesSearch(text: string, search: string): boolean {
  const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();
  return normalize(text).includes(normalize(search.trim()));
}

export function formatDuration(minutes?: number | null): string | null {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return translateUi(`${rest} phút`);
  return translateUi(rest ? `${hours} giờ ${rest} phút` : `${hours} giờ`);
}
