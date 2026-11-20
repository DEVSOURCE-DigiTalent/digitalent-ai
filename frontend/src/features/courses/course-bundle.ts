import { courseCodeKey } from './course-code';

/**
 * An Advanced course is bought with the Intermediate course of its domain (M1-A comes with M1-I) when the company does
 * not have that one yet — the same rule as the backend `PurchaseCourseUseCase` / `CourseOwnership.BoughtWith`.
 */
const STANDARD = /^M[1-6]-[FIA]$/;
const LEVEL_RANK: Record<string, number> = { F: 1, I: 2, A: 3 };

/** The lower paid course an Advanced course is bought with (M1-A → M1-I); null for any other course. */
export function boughtWithCode(code?: string | null): string | null {
  const key = courseCodeKey(code);
  return /^M[1-6]-A$/.test(key) ? `${key.slice(0, 3)}I` : null;
}

/** Domain, then lower level first, so an Intermediate course is bought before the Advanced one; other codes last. */
export function byPurchaseOrder(a: string, b: string): number {
  const ka = courseCodeKey(a);
  const kb = courseCodeKey(b);
  const sa = STANDARD.test(ka);
  const sb = STANDARD.test(kb);
  if (sa && sb) return ka[1].localeCompare(kb[1]) || LEVEL_RANK[ka[3]] - LEVEL_RANK[kb[3]];
  return Number(sb) - Number(sa);
}

/**
 * The courses to buy for a pick: each Advanced course brings the Intermediate course of its domain when that one is
 * neither owned nor picked. Returns the whole list (lower level first) and the courses added to it.
 */
export function withBoughtWith<T extends { code: string }>(
  picked: readonly T[],
  catalog: readonly T[],
  isOwned: (course: T) => boolean,
): { courses: T[]; added: T[] } {
  const keys = new Set(picked.map((course) => courseCodeKey(course.code)));
  const added: T[] = [];
  for (const course of picked) {
    const lower = boughtWithCode(course.code);
    if (!lower || keys.has(lower)) continue;
    const lowerCourse = catalog.find((item) => courseCodeKey(item.code) === lower);
    if (!lowerCourse || isOwned(lowerCourse)) continue;
    keys.add(lower);
    added.push(lowerCourse);
  }
  return { courses: [...picked, ...added].sort((a, b) => byPurchaseOrder(a.code, b.code)), added };
}

/** Codes leaving the cart with a course: the course itself and every Advanced course in the cart bought with it. */
export function leavingWith(code: string, cartCodes: Iterable<string>): string[] {
  const key = courseCodeKey(code);
  return [...cartCodes].filter((item) => courseCodeKey(item) === key || boughtWithCode(item) === key);
}
