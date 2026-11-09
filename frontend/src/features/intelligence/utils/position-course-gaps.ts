import type { SkillGapItem } from '@/services/intelligence.service';
import type { CourseListItem } from '@/services/assignment.service';
import { MODULES_PER_DOMAIN } from '@/lib/standard-courses';

/** A course tier is valid only when the snapshot describes the entire domain at one level. */
export function positionCourseDomains(items: SkillGapItem[], courses: CourseListItem[]) {
  const groups = new Map<number, SkillGapItem[]>();
  for (const item of items) {
    const number = Number(item.frameworkCode?.split('.')[0]) || item.categorySortOrder || 0;
    if (number < 1 || number > 6) continue;
    groups.set(number, [...(groups.get(number) ?? []), item]);
  }
  return [...groups.entries()].sort(([a], [b]) => a - b).map(([number, rows]) => {
    const levels = new Set(rows.map((row) => row.requiredLevel));
    const complete = new Set(rows.map((row) => row.frameworkCode)).size === MODULES_PER_DOMAIN[number];
    const level = levels.size === 1 && complete ? rows[0].requiredLevel : null;
    const course = level == null ? undefined : courses.find((candidate) => {
      const code = candidate.code.match(/^[AM]([1-6])-([FIA])$/i);
      return candidate.status === 'PUBLISHED' && code && Number(code[1]) === number && candidate.level === level;
    });
    return { number, name: rows[0].categoryName ?? `Lĩnh vực ${number}`, level, course,
      total: rows.length, met: rows.filter((row) => row.gapSteps === 0).length,
      gaps: rows.filter((row) => row.gapSteps > 0).length,
      unconfirmed: rows.filter((row) => row.currentLevel == null).length,
    };
  });
}
