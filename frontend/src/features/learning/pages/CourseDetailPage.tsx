import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, PlayCircle } from 'lucide-react';
import { useCourse } from '@/hooks/use-assignments';
import { useMyLearning } from '@/hooks/use-my-learning';
import { LevelBadge } from '@/components/shared/LevelBadge';

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading, isError, error } = useCourse(id);
  const { data: learning } = useMyLearning();
  const enrollment = learning?.items.find((item) => item.courseId === course?.id);

  if (isLoading) return <div className="h-60 rounded-xl bg-slate-100 animate-pulse" />;
  if (isError || !course) return <div role="alert" className="rounded-xl border border-red-200 p-8 text-center"><p className="font-semibold text-red-600">Không thể tải thông tin khóa học.</p><p className="text-sm">{error instanceof Error ? error.message : 'Vui lòng thử lại.'}</p><Link to="/enterprise/me/learning-path" className="mt-4 inline-block text-blue-600">Quay lại lộ trình</Link></div>;

  const lessons = course.modules.flatMap((module) => module.lessons);
  return <div className="space-y-6 pb-12">
    <Link to="/enterprise/me/learning-path" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft className="size-4" />Lộ trình của tôi</Link>
    <div className="rounded-2xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-3"><span className="font-mono text-xs text-blue-600">{course.code}</span>{course.level > 0 && <LevelBadge level={course.level} />}</div>
      <h1 className="text-2xl font-bold">{course.title}</h1>
      {course.description && <p className="text-sm text-slate-600">{course.description}</p>}
      <div className="flex flex-wrap gap-5 text-sm text-slate-500"><span className="flex items-center gap-1"><Clock className="size-4" />{course.estimatedDurationMinutes ?? 0} phút</span><span className="flex items-center gap-1"><BookOpen className="size-4" />{course.modules.length} học phần · {lessons.length} bài học</span></div>
      {enrollment && <div className="space-y-1"><p className="text-sm">Tiến độ: {Math.round(enrollment.progressPercent)}% · {enrollment.completedLessons}/{enrollment.totalLessons} bài hoàn thành</p><div className="h-2 max-w-sm rounded bg-slate-200"><div className="h-full rounded bg-blue-600" style={{ width: `${Math.min(100, Math.max(0, enrollment.progressPercent))}%` }} /></div></div>}
      {lessons[0] && enrollment && <Link to={`/enterprise/me/courses/${course.id}/lessons/${lessons[0].id}`} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white text-sm"><PlayCircle className="size-4" />{enrollment.progressPercent ? 'Xem bài học' : 'Bắt đầu học'}</Link>}
      {!enrollment && <p className="text-sm text-slate-500">Khóa học này chưa có trong danh sách ghi danh của bạn.</p>}
    </div>
    <section className="space-y-4"><h2 className="text-lg font-bold">Nội dung chương trình</h2>{course.modules.map((module) => <div key={module.id} className="rounded-xl border border-slate-200 overflow-hidden"><h3 className="border-b border-slate-200 bg-slate-50 p-4 font-semibold">{module.title} · {module.lessons.length} bài</h3><ul className="divide-y divide-slate-100">{module.lessons.map((lesson) => <li key={lesson.id}><Link className="flex justify-between gap-4 p-4 hover:bg-slate-50" to={`/enterprise/me/courses/${course.id}/lessons/${lesson.id}`}><span>{lesson.title}</span><span className="text-xs text-slate-500">{lesson.estimatedMinutes ?? 0} phút</span></Link></li>)}</ul></div>)}</section>
  </div>;
}
