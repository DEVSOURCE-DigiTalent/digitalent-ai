import { Link } from 'react-router-dom';
import { BookOpen, CircleAlert } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { useMyLearning } from '@/hooks/use-my-learning';
import { useCourseRecommendations } from '@/hooks/use-recommendations';
import { MyLearningTabs } from '@/features/employee/components/MyLearningTabs';

const REASONS: Record<string, string> = {
  NO_EMPLOYEE_PROFILE: 'Tài khoản chưa liên kết hồ sơ nhân viên.',
  NO_SKILL_GAP_RUN: 'Chưa có lần phân tích khoảng trống năng lực trên BE2.',
  NO_GAP: 'Không có khoảng trống năng lực cần bù đắp.',
  NO_MATCHING_COURSE: 'BE2 chưa tìm thấy khóa học phù hợp với khoảng trống năng lực.',
};

export function ManagerLearningPathPage() {
  const learning = useMyLearning();
  const recommendations = useCourseRecommendations();
  const enrolled = learning.data?.items ?? [];
  const suggested = recommendations.data?.items.filter((item) => !enrolled.some((course) => course.courseId === item.courseId)) ?? [];

  return <div className="space-y-6 pb-12"><PageHeader title="Học tập của tôi" subtitle="Tiến độ ghi danh và khóa học BE2 gợi ý từ lần phân tích năng lực mới nhất." /><MyLearningTabs />
    {(learning.isError || recommendations.isError) && <p role="alert" className="rounded-xl border border-red-200 p-4 text-red-700">Không tải được dữ liệu học tập hoặc gợi ý từ BE2.</p>}
    <section className="rounded-xl border p-6 space-y-4"><div className="flex flex-wrap justify-between gap-3"><h2 className="font-bold">Khóa học đã ghi danh ({learning.data?.total ?? 0})</h2><Link className="text-sm text-blue-600" to="/enterprise/me/courses">Xem danh sách</Link></div>
      {learning.isLoading ? <p>Đang tải…</p> : enrolled.length === 0 ? <p className="text-sm text-slate-500">Chưa có khóa học nào được ghi danh. Hoàn thành bài test cục bộ không tự tạo ghi danh trên BE2.</p> : <div className="space-y-3">{enrolled.map((course) => <article key={course.enrollmentId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><p className="font-semibold">{course.courseTitle}</p><p className="text-sm text-slate-500">{course.courseCode} · {Math.round(course.progressPercent)}% · {course.completedLessons}/{course.totalLessons} bài</p></div><Link className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" to={`/enterprise/me/courses/${course.courseId}`}>{course.status === 'COMPLETED' ? 'Xem lại' : 'Tiếp tục học'}</Link></article>)}</div>}
    </section>
    <section className="rounded-xl border p-6 space-y-4"><h2 className="font-bold">Gợi ý từ khoảng trống năng lực</h2>
      {recommendations.isLoading ? <p>Đang tải…</p> : suggested.length === 0 ? <div className="flex items-start gap-3 text-sm text-slate-500"><CircleAlert className="size-5 shrink-0" /><div><p>{REASONS[recommendations.data?.reason ?? ''] ?? 'Hiện chưa có khóa học mới được BE2 đề xuất.'}</p><Link className="mt-2 inline-block text-blue-600" to="/enterprise/me/skill-gap">Xem phân tích năng lực</Link></div></div> : <div className="space-y-3">{suggested.map((course) => <article key={course.courseId} className="flex flex-wrap justify-between gap-3 rounded-xl border p-4"><div><p className="font-semibold">{course.title}</p><p className="text-sm text-slate-500">{course.courseCode} · {course.explanation}</p></div><Link className="inline-flex items-center gap-2 text-sm text-blue-600" to={`/enterprise/me/courses/${course.courseId}`}><BookOpen className="size-4" />Xem khóa học</Link></article>)}</div>}
      <p className="text-xs text-slate-500">Gợi ý chưa phải khóa học được giao. BE2 chỉ hiển thị tiến độ sau khi có ghi danh.</p>
    </section>
  </div>;
}
