import { describe, expect, it } from 'vitest';
import { categoryDomain, courseCategories, courseCodeMetadata, filterCourseCatalog } from '../course-catalog';

describe('TT02 course metadata fallback', () => {
  const category = { id: 'domain-1', code: 'TT02_D1', name: 'Khai thác dữ liệu', sortOrder: 1 };
  const courses = [
    { id: '1', code: 'M1-F', title: 'Cơ bản', level: 0, modules: 3, status: 'PUBLISHED', assignedCount: 0 },
    { id: '2', code: 'M1-I', title: 'Trung cấp', level: 0, modules: 3, status: 'PUBLISHED', assignedCount: 0 },
    { id: '3', code: 'M2-F', title: 'Miền khác', level: 0, modules: 3, status: 'PUBLISHED', assignedCount: 0 },
  ] as const;

  it('reads domain and level from A/M course codes', () => {
    expect(courseCodeMetadata('M1-F')).toEqual({ domain: 1, level: 1 });
    expect(courseCodeMetadata('A2-A')).toEqual({ domain: 2, level: 3 });
    expect(categoryDomain(category)).toBe(1);
    expect(courseCategories([])).toHaveLength(6);
  });

  it('filters courses without course-competency links using their code', () => {
    expect(filterCourseCatalog([...courses], category, 2).map((course) => course.id)).toEqual(['2']);
  });
});
