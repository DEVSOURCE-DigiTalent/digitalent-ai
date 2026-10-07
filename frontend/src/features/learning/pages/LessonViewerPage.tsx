import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useCourse, useCourseLesson } from '@/hooks/use-assignments';
import { useCompleteMyLesson, useMyLearning } from '@/hooks/use-my-learning';
import { useCurrentUser } from '@/hooks/use-current-user';
import { LessonMedia, LessonText } from '../components/LessonPresentation';

export function LessonViewerPage() {
  const { id: courseId, lessonId } = useParams<{ id: string; lessonId: string }>();
  const navigate = useNavigate();
  const courseQuery = useCourse(courseId);
  const lessonQuery = useCourseLesson(lessonId);
  const learningQuery = useMyLearning();
  const complete = useCompleteMyLesson();
  const canComplete = useCurrentUser((state) => state.hasPermission('lesson.complete'));
  const course = courseQuery.data;
  const lesson = lessonQuery.data;
  const modules = [...(course?.modules ?? [])].sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER));
  const lessons = modules.flatMap((module) => [...module.lessons].sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER)));
  const currentIndex = lessons.findIndex((item) => item.id === lessonId);
  const currentModule = modules.find((module) => module.lessons.some((item) => item.id === lessonId));
  const lessonNumber = currentModule
    ? [...currentModule.lessons]
      .sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER))
      .findIndex((item) => item.id === lessonId)
    : -1;
  const displayTitle = lessonNumber >= 0 && lesson
    ? `Bài ${lessonNumber + 1}: ${lesson.title.trim().replace(/^Bài\s+\d+\s*:\s*/i, '').replace(/^Mûc tiêu/i, 'Mục tiêu')}`
    : lesson?.title;
  const next = lessons[currentIndex + 1];
  const previous = currentIndex > 0 ? lessons[currentIndex - 1] : undefined;
  const enrolled = learningQuery.data?.items.some((item) => item.courseId === course?.id);

  if (courseQuery.isLoading || lessonQuery.isLoading || learningQuery.isLoading) return <div className="h-72 rounded-xl bg-slate-100 animate-pulse" />;
  if (courseQuery.isError || lessonQuery.isError || !course || !lesson || currentIndex < 0) return <div role="alert" className="rounded-xl border border-red-200 p-8 text-center">Không thể tải bài học. <Link className="text-blue-600" to={`/enterprise/me/courses/${courseId}`}>Quay lại khóa học</Link></div>;

  async function completeLesson() {
    if (!enrolled || !canComplete || !lessonId || !course) return;
    try {
      await complete.mutateAsync(lessonId);
      toast.success('Đã lưu tiến độ bài học.');
      if (next) navigate(`/enterprise/me/courses/${course.id}/lessons/${next.id}`);
      else navigate(`/enterprise/me/courses/${course.id}`);
    } catch { toast.error('Không thể lưu tiến độ. Vui lòng thử lại.'); }
  }

  return <div className="mx-auto max-w-5xl space-y-6 pb-12">
    <Link to={`/enterprise/me/courses/${course.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"><ArrowLeft className="size-4" />{course.title}</Link>
    <article className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">{lesson.moduleTitle}</p><h1 className="mt-2 text-2xl font-bold text-slate-950">{displayTitle}</h1><p className="mt-2 flex items-center gap-1 text-sm text-slate-500"><Clock className="size-4" />{lesson.estimatedMinutes == null ? 'Thời lượng chưa cập nhật' : `${lesson.estimatedMinutes} phút`}</p></div>
      <LessonMedia lesson={lesson} />
      <LessonText lesson={lesson} />
    </article>
    <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-4">
      {previous ? <Link to={`/enterprise/me/courses/${course.id}/lessons/${previous.id}`} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2"><ArrowLeft className="size-4" />Bài trước</Link> : <span />}
      {enrolled && canComplete ? <button type="button" onClick={completeLesson} disabled={complete.isPending} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">{complete.isPending ? 'Đang lưu…' : 'Hoàn thành bài học'}<ArrowRight className="size-4" /></button> : <p className="text-sm text-slate-500">{!enrolled ? 'Bạn chưa được ghi danh khóa học này.' : 'Tài khoản này chưa có quyền ghi nhận hoàn thành bài học.'}</p>}
    </div>
  </div>;
}
