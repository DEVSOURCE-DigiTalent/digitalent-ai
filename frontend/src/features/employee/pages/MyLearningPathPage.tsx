import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, PlayCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useMyLearning } from '@/hooks/use-my-learning';
import { MyLearningTabs } from '../components/MyLearningTabs';

const statusOrder = (status: string) => ({ IN_PROGRESS: 0, NOT_STARTED: 1, READY_FOR_ASSESSMENT: 2, COMPLETED: 3 } as Record<string, number>)[status] ?? 4;

export function MyLearningPathPage() {
  const { data, isLoading, isError } = useMyLearning();
  const courses = [...(data?.items ?? [])].sort((a, b) => statusOrder(a.status) - statusOrder(b.status));
  const totalMinutes = courses.reduce((sum, course) => sum + (course.estimatedDurationMinutes ?? 0), 0);

  return (
    <div className="space-y-6 pb-16">
      <PageHeader title="Lộ trình học tập của tôi" subtitle="Các khóa học đã ghi danh, sắp theo trạng thái học tập của bạn." />
      <MyLearningTabs />
      {isLoading ? <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" /> : isError ? (
        <div role="alert" className="rounded-2xl border border-red-200 p-6 text-red-700">Không tải được dữ liệu học tập. Vui lòng thử lại.</div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 p-10 text-center space-y-3">
          <BookOpen className="size-10 mx-auto text-slate-400" />
          <p className="font-semibold">Bạn chưa được ghi danh khóa học nào.</p>
          <p className="text-sm text-slate-500">Lộ trình sẽ hiển thị khi có khóa học được giao hoặc đã ghi danh.</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl bg-blue-600 p-6 text-white flex flex-wrap justify-between gap-4">
            <div><p className="text-sm text-blue-100">Lộ trình từ dữ liệu ghi danh</p><h2 className="text-xl font-bold">{data?.total ?? courses.length} khóa học của tôi</h2></div>
            <div className="flex gap-8 text-sm">
              <div><strong className="block text-2xl">{data?.completed ?? 0}/{data?.total ?? courses.length}</strong>Đã hoàn thành</div>
              <div><strong className="block text-2xl">{Math.round(totalMinutes / 60)}h</strong>Tổng thời lượng dự kiến</div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold">Khóa học theo trạng thái</h3>
            <ol className="space-y-4">
              {courses.map((course, index) => {
                const completed = course.status === 'COMPLETED';
                const active = course.status === 'IN_PROGRESS';
                return (
                  <li key={course.enrollmentId} className="rounded-xl border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-4 items-start">
                      <span className="size-8 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-bold">{completed ? <CheckCircle2 className="size-5" /> : index + 1}</span>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2"><span className="font-mono text-xs">{course.courseCode}</span>{course.level > 0 && <LevelBadge level={course.level} />}</div>
                        <h4 className="font-semibold">{course.courseTitle}</h4>
                        <p className="text-xs text-slate-500">{course.completedLessons}/{course.totalLessons} bài học · {Math.round(course.progressPercent)}% · {course.estimatedDurationMinutes ?? 0} phút</p>
                        {course.assignedByName && <p className="text-xs text-slate-500">Giao bởi: {course.assignedByName}</p>}
                      </div>
                    </div>
                    <Link to={`/enterprise/me/courses/${course.courseId}`} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
                      {completed ? 'Xem lại' : active ? 'Tiếp tục học' : 'Vào khóa học'}
                      {active ? <PlayCircle className="size-4" /> : <ArrowRight className="size-4" />}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
