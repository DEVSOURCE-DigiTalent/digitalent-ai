import { describe, expect, it } from 'vitest';
import type { SkillGapItem } from '@/services/intelligence.service';
import type { CourseListItem } from '@/services/assignment.service';
import { positionCourseDomains } from './position-course-gaps';

const items: SkillGapItem[] = [1, 2, 3].map((n) => ({ competencyId: `c-${n}`, competencyCode: `1.${n}`, frameworkCode: `1.${n}`, competencyName: `Năng lực ${n}`, categoryName: 'Dữ liệu', categorySortOrder: 1, requiredLevel: 2, currentLevel: null, gapSteps: 2, weightPercent: 33.33, mandatory: false, mandatoryMultiplier: 1, priorityScore: 10, severity: 'HIGH' }));
const course: CourseListItem = { id: 'course-i', code: 'A1-I', title: 'Khóa trung cấp', level: 2, modules: 3, status: 'PUBLISHED', assignedCount: 0, hasLicense: false };

describe('position course gap mapping', () => {
  it('maps the whole domain to its exact target course without depending on purchase or current level', () => {
    const [domain] = positionCourseDomains(items, [{ ...course, id: 'basic', code: 'A1-F', level: 1 }, course]);
    expect(domain.level).toBe(2);
    expect(domain.course?.id).toBe('course-i');
    expect(domain.unconfirmed).toBe(3);
    expect(domain.met).toBe(0);
  });
  it('does not invent a course tier for a mixed or partial legacy standard', () => {
    expect(positionCourseDomains([{ ...items[0], requiredLevel: 3 }, ...items.slice(1)], [course])[0].level).toBeNull();
    expect(positionCourseDomains(items.slice(1), [course])[0].course).toBeUndefined();
  });
  it('accepts the canonical M-code catalog and never maps another domain or tier', () => {
    expect(positionCourseDomains(items, [{ ...course, code: 'M1-I' }])[0].course?.id).toBe('course-i');
    expect(positionCourseDomains(items, [{ ...course, code: 'A2-I' }])[0].course).toBeUndefined();
  });
});
