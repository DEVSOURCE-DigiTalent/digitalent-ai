import { PulseFinalReviewsPage } from '@/features/pulse-manager/pages/PulseFinalReviewsPage';

/**
 * MT-03 · Bài cuối khóa học thử: nhân viên doanh nghiệp dùng thử học khóa Cơ bản xong thì nộp bài cuối khóa; chỉ mentor được
 * phân công chấm (chủ doanh nghiệp và quản lý không chấm trong doanh nghiệp dùng thử).
 */
export function MentorCourseReviewsPage() {
  return <PulseFinalReviewsPage audience="mentor" />;
}
