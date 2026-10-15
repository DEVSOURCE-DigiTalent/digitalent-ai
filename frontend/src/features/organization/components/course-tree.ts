import type { CourseListItem } from '@/services/assignment.service';
import type { CompetencyCategory } from '@/services/competency.service';
import { categoryDomain, courseCodeMetadata } from '@/features/courses/course-catalog';

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

export function levelName(level: number): string {
  return LEVELS.find((l) => l.level === level)?.name ?? `Bậc ${level}`;
}

export function matchesSearch(text: string, search: string): boolean {
  const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();
  return normalize(text).includes(normalize(search.trim()));
}

export function formatDuration(minutes?: number | null): string | null {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} phút`;
  return rest ? `${hours} giờ ${rest} phút` : `${hours} giờ`;
}
