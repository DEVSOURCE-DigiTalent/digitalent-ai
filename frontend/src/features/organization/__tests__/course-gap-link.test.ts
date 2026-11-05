import { describe, expect, it } from 'vitest';
import { findGapCourse, type DomainBranch } from '../components/course-tree';
import type { CourseListItem } from '@/services/assignment.service';

const course = (id: string, status: CourseListItem['status']): CourseListItem => ({
  id, code: `M1-A`, title: id, level: 3, modules: 1, assignedCount: 0, status,
});

describe('findGapCourse', () => {
  const branches = [{
    domain: 1,
    slots: [{ level: 3, courses: [course('draft', 'DRAFT'), course('published', 'PUBLISHED')] }],
  }] as DomainBranch[];

  it('finds the published course at the competency domain and required level', () => {
    expect(findGapCourse(branches, '1.7', 3)?.id).toBe('published');
  });

  it('does not point to an unrelated course', () => {
    expect(findGapCourse(branches, '2.1', 3)).toBeUndefined();
    expect(findGapCourse(branches, '1.7', 2)).toBeUndefined();
  });
});
