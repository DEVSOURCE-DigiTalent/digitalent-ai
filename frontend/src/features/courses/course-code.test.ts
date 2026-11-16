import { expect, it } from 'vitest';
import { canonicalCourseCode, distinctCourseCodes } from './course-code';

it('merges legacy and canonical codes into a single checkout line per course', () => {
  expect(distinctCourseCodes('A5-I, m5-i, M5-I, A2-A,,m2-a')).toEqual(['M5-I', 'M2-A']);
});

it('preserves codes outside the standard course format', () => {
  expect(canonicalCourseCode('a5-onboarding')).toBe('a5-onboarding');
});
