import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, ClipboardList, TrendingUp } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMyLearning } from '@/hooks/use-my-learning';
import { useMySkillGap } from '@/hooks/use-skill-gaps';

export function ManagerDevelopmentDashboardPage() {
  const user = useCurrentUser((state) => state.user);
  const learning = useMyLearning();
  const gap = useMySkillGap();
  const active = learning.data?.items.find((item) => item.status === 'IN_PROGRESS')
    ?? learning.data?.items.find((item) => item.status === 'NOT_STARTED');

  return <div className="space-y-6 pb-12">
    <header className="rounded-2xl bg-blue-600 p-6 text-white"><p className="text-sm text-blue-100">Không gian cá nhân · Quản lý</p><h1 className="text-2xl font-bold">Bảng phát triển của tôi</h1><p className="mt-2 text-sm">{user?.fullName}</p></header>
    <section className="grid gap-4 sm:grid-cols-3" aria-label="Tổng quan học tập">
      <div className="rounded-xl border p-5"><BookOpen className="size-5 text-blue-600" /><p className="mt-2 text-sm">Khóa học đã ghi danh</p><strong className="text-2xl">{learning.isLoading ? '…' : learning.data?.total ?? '—'}</strong></div>
      <div className="rounded-xl border p-5"><CheckCircle2 className="size-5 text-green-600" /><p className="mt-2 text-sm">Khóa đã hoàn thành</p><strong className="text-2xl">{learning.isLoading ? '…' : learning.data?.completed ?? '—'}</strong></div>
      <div className="rounded-xl border p-5"><TrendingUp className="size-5 text-violet-600" /><p className="mt-2 text-sm">Độ bao phủ năng lực</p><strong className="text-2xl">{gap.isLoading ? '…' : gap.data ? `${Math.round(gap.data.summary.coveragePercent)}%` : 'Chưa có'}</strong></div>
    </section>
    {(learning.isError || gap.isError) && <p role="alert" className="text-sm text-red-600">Không tải được toàn bộ dữ liệu từ BE2. Hãy kiểm tra kết nối API và thử lại.</p>}
    <section className="rounded-xl border p-6 space-y-4"><div className="flex flex-wrap justify-between gap-3"><h2 className="font-bold">Khóa đào tạo của tôi</h2><Link className="text-sm text-blue-600" to="/enterprise/me/courses">Xem tất cả →</Link></div>
      {active ? <div className="rounded-xl border p-4 flex flex-wrap justify-between gap-3"><div><p className="font-semibold">{active.courseTitle}</p><p className="text-sm text-slate-500">{active.courseCode} · {Math.round(active.progressPercent)}% · {active.completedLessons}/{active.totalLessons} bài</p></div><Link className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" to={`/enterprise/me/courses/${active.courseId}`}>Tiếp tục học</Link></div> : <p className="text-sm text-slate-500">{learning.isLoading ? 'Đang tải…' : 'Chưa có khóa học đang học hoặc được giao.'}</p>}
    </section>
    <section className="grid gap-3 sm:grid-cols-3"><Link className="rounded-xl border p-4 text-sm" to="/enterprise/me/learning-path"><BookOpen className="mb-2 size-5" />Lộ trình và gợi ý khóa học</Link><Link className="rounded-xl border p-4 text-sm" to="/enterprise/me/skill-gap"><TrendingUp className="mb-2 size-5" />Khoảng trống năng lực</Link><Link className="rounded-xl border p-4 text-sm" to="/enterprise/team"><ClipboardList className="mb-2 size-5" />Tổng quan nhóm</Link></section>
  </div>;
}
