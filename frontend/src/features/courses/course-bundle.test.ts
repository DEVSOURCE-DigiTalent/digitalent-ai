import { describe, expect, it } from 'vitest';
import { boughtWithCode, byPurchaseOrder, leavingWith, withBoughtWith } from './course-bundle';

type Course = { code: string; owned?: boolean };
const catalog: Course[] = [
  { code: 'A1-F', owned: true }, { code: 'A1-I' }, { code: 'A1-A' },
  { code: 'M2-F', owned: true }, { code: 'M2-I', owned: true }, { code: 'M2-A' },
];
const byCode = (code: string) => catalog.find((course) => course.code === code)!;
const isOwned = (course: Course) => Boolean(course.owned);

describe('An Advanced course is bought with the Intermediate course of its domain', () => {
  it('names the Intermediate course of an Advanced one, under either prefix', () => {
    expect(boughtWithCode('M1-A')).toBe('M1-I');
    expect(boughtWithCode('a3-a')).toBe('M3-I');
    expect(boughtWithCode('M1-I')).toBeNull();
    expect(boughtWithCode('M1-F')).toBeNull();
    expect(boughtWithCode('DRAFT-1')).toBeNull();
  });

  it('adds the Intermediate course when it is neither owned nor picked, lower level first', () => {
    const { courses, added } = withBoughtWith([byCode('A1-A')], catalog, isOwned);
    expect(courses.map((course) => course.code)).toEqual(['A1-I', 'A1-A']);
    expect(added.map((course) => course.code)).toEqual(['A1-I']);
  });

  it('adds nothing when the Intermediate course is owned or already picked', () => {
    expect(withBoughtWith([byCode('M2-A')], catalog, isOwned).added).toEqual([]);
    const picked = withBoughtWith([byCode('A1-A'), byCode('A1-I')], catalog, isOwned);
    expect(picked.added).toEqual([]);
    expect(picked.courses.map((course) => course.code)).toEqual(['A1-I', 'A1-A']);
  });

  it('removes the Advanced course with the Intermediate one it is bought with', () => {
    expect(leavingWith('M1-I', ['M1-A', 'M1-I', 'M3-A'])).toEqual(['M1-A', 'M1-I']);
    expect(leavingWith('M1-A', ['M1-A', 'M1-I'])).toEqual(['M1-A']);
  });

  it('orders a purchase by domain, then level', () => {
    expect(['M2-A', 'M1-A', 'M2-I', 'DRAFT-1', 'M1-I'].sort(byPurchaseOrder)).toEqual(['M1-I', 'M1-A', 'M2-I', 'M2-A', 'DRAFT-1']);
  });
});
