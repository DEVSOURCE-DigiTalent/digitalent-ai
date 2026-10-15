/** Đường dẫn cổng nhân viên Pulse (khớp lib/screens/enterprise/employee.ts). */
export const PULSE_PATHS = {
  today: '/enterprise/me',
  path: '/enterprise/me/path',
  practice: '/enterprise/me/practice',
  baseline: '/enterprise/me/baseline',
  outcomes: '/enterprise/me/outcomes',
  activity: '/enterprise/me/activity',
  profile: '/enterprise/me/profile',
  course: (courseId: string) => `/enterprise/me/courses/${courseId}`,
  module: (courseId: string, moduleId: string) => `/enterprise/me/courses/${courseId}/modules/${moduleId}`,
  final: (courseId: string) => `/enterprise/me/courses/${courseId}/final`,
  outcome: (outcomeId: string) => `/enterprise/me/outcomes/${encodeURIComponent(outcomeId)}`,
} as const;
