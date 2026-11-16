/** Standard course codes are displayed with M. Existing A links remain valid. */
export function canonicalCourseCode(code?: string | null): string {
  const value = code?.trim() ?? '';
  return /^[AM][1-6]-[FIA]$/i.test(value) ? `M${value.slice(1).toUpperCase()}` : value;
}

export function courseCodeKey(code?: string | null): string {
  return canonicalCourseCode(code).toUpperCase();
}

export function distinctCourseCodes(codes: string): string[] {
  return [...new Set(codes.split(',').map(courseCodeKey).filter(Boolean))];
}
