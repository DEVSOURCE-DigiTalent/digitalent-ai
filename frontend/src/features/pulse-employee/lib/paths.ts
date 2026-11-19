/** Đường dẫn cổng nhân viên Pulse (khớp lib/screens/enterprise/employee.ts). */
export const PULSE_PATHS = {
  today: '/enterprise/me',
  path: '/enterprise/me/path',
  outcomes: '/enterprise/me/outcomes',
  activity: '/enterprise/me/activity',
  profile: '/enterprise/me/profile',
  feedbacks: '/enterprise/me/feedbacks',
  bugReports: '/enterprise/me/bug-reports',
  course: (courseId: string) => `/enterprise/me/courses/${courseId}`,
  module: (courseId: string, moduleId: string) => `/enterprise/me/courses/${courseId}/modules/${moduleId}`,
  /** Bài đánh giá trước khi học (trang làm bài có giám sát). */
  preAssessment: (courseId: string) => `/enterprise/me/courses/${courseId}/pre-assessment`,
  /** Bài kiểm tra vượt học: 20 câu trắc nghiệm, đạt 80% thì mở bài cuối khóa. */
  skipTest: (courseId: string) => `/enterprise/me/courses/${courseId}/skip-test`,
  /** Bài cuối khóa (trang làm bài có giám sát). */
  final: (courseId: string) => `/enterprise/me/courses/${courseId}/final`,
  outcome: (outcomeId: string) => `/enterprise/me/outcomes/${encodeURIComponent(outcomeId)}`,
  /** Bài đánh giá tổng hợp của doanh nghiệp dùng thử: trang giới thiệu / kết quả và phòng thi. */
  trialTest: '/enterprise/me/trial-test',
  trialExam: '/enterprise/me/trial-test/exam',
} as const;

/** Trang học một mô-đun (có cột đề cương riêng): menu nhân viên thu gọn mặc định để nhường chỗ cho bài học. */
export const isModulePath = (pathname: string) => /^\/enterprise\/me\/courses\/[^/]+\/modules\/[^/]+\/?$/.test(pathname);

/** Trang làm bài (có giám sát, hoặc kiểm tra vượt học tính giờ): dùng khung riêng, không có thanh điều hướng chính. */
export const isExamPath = (pathname: string) =>
  /^\/enterprise\/me\/courses\/[^/]+\/(pre-assessment|final|skip-test)\/?$/.test(pathname) || /^\/enterprise\/me\/trial-test\/exam\/?$/.test(pathname);
