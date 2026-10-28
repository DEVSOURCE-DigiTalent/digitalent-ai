/** Đường dẫn cổng nhân viên Pulse (khớp lib/screens/enterprise/employee.ts). */
export const PULSE_PATHS = {
  today: '/enterprise/me',
  path: '/enterprise/me/path',
  practice: '/enterprise/me/practice',
  outcomes: '/enterprise/me/outcomes',
  activity: '/enterprise/me/activity',
  profile: '/enterprise/me/profile',
  course: (courseId: string) => `/enterprise/me/courses/${courseId}`,
  module: (courseId: string, moduleId: string) => `/enterprise/me/courses/${courseId}/modules/${moduleId}`,
  /** Bài đánh giá trước khi học (trang làm bài có giám sát). */
  preAssessment: (courseId: string) => `/enterprise/me/courses/${courseId}/pre-assessment`,
  /** Bài cuối khóa (trang làm bài có giám sát). */
  final: (courseId: string) => `/enterprise/me/courses/${courseId}/final`,
  outcome: (outcomeId: string) => `/enterprise/me/outcomes/${encodeURIComponent(outcomeId)}`,
  /** Bài đánh giá tổng hợp của doanh nghiệp dùng thử: trang giới thiệu / kết quả và phòng thi. */
  trialTest: '/enterprise/me/trial-test',
  trialExam: '/enterprise/me/trial-test/exam',
} as const;

/** Trang làm bài có giám sát: dùng khung riêng, không có thanh điều hướng chính. */
export const isExamPath = (pathname: string) =>
  /^\/enterprise\/me\/courses\/[^/]+\/(pre-assessment|final)\/?$/.test(pathname) || /^\/enterprise\/me\/trial-test\/exam\/?$/.test(pathname);
