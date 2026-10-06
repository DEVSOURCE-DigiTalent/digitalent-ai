import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useCourse, useCourseLesson } from '@/hooks/use-assignments';
import { useCompleteMyLesson, useMyLearning } from '@/hooks/use-my-learning';
import { resolveCourseMedia } from '@/features/courses/components/course-media';
import { useCurrentUser } from '@/hooks/use-current-user';

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
  const lessons = course?.modules.flatMap((module) => module.lessons) ?? [];
  const currentIndex = lessons.findIndex((item) => item.id === lessonId);
  const next = lessons[currentIndex + 1];
  const previous = currentIndex > 0 ? lessons[currentIndex - 1] : undefined;
  const enrolled = learningQuery.data?.items.some((item) => item.courseId === course?.id);
  const media = lesson?.lessonType === 'VIDEO' ? resolveCourseMedia(lesson.contentBody) : null;

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

  return <div className="mx-auto max-w-4xl space-y-6 pb-12">
    <Link to={`/enterprise/me/courses/${course.id}`} className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft className="size-4" />{course.title}</Link>
    <div><p className="text-sm text-blue-600">{lesson.moduleTitle}</p><h1 className="text-2xl font-bold">{lesson.title}</h1><p className="mt-2 flex items-center gap-1 text-sm text-slate-500"><Clock className="size-4" />{lesson.estimatedMinutes ?? 0} phút · {lesson.lessonType}</p></div>
    {media?.kind === 'file' ? <video src={media.url} controls preload="metadata" className="aspect-video w-full rounded-xl bg-black" /> : media?.kind === 'embed' ? <iframe src={media.url} title={lesson.title} allowFullScreen className="aspect-video w-full rounded-xl" /> : lesson.lessonType === 'VIDEO' ? <div className="aspect-video rounded-xl bg-gradient-to-br from-slate-900 via-slate-700 to-blue-900 grid place-items-center text-white text-center"><div><Play className="mx-auto mb-3 size-10" /><p>Chưa có đường dẫn video cho bài học này.</p></div></div> : null}
    {lesson.contentBody && !media && <section className="rounded-xl border border-slate-200 p-6 whitespace-pre-wrap leading-7"><h2 className="mb-3 font-semibold">Nội dung bài học</h2>{lesson.contentBody}</section>}
    {!lesson.contentBody && <p className="rounded-xl border border-slate-200 p-6 text-slate-500">Bài học chưa có nội dung trên hệ thống.</p>}
    <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-4">
      {previous ? <Link to={`/enterprise/me/courses/${course.id}/lessons/${previous.id}`} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2"><ArrowLeft className="size-4" />Bài trước</Link> : <span />}
      {enrolled && canComplete ? <button type="button" onClick={completeLesson} disabled={complete.isPending} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">{complete.isPending ? 'Đang lưu…' : 'Hoàn thành bài học'}<ArrowRight className="size-4" /></button> : <p className="text-sm text-slate-500">{!enrolled ? 'Bạn chưa được ghi danh khóa học này.' : 'Tài khoản này chưa có quyền ghi nhận hoàn thành bài học.'}</p>}
    </div>
  </div>;
}
