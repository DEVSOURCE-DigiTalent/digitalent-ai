import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Clock, Lightbulb,
  FileCheck2, Play, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLesson, useCompleteLesson } from '@/hooks/use-learning';

export function LessonViewerPage() {
  const { id: courseId, lessonId } = useParams<{ id: string; lessonId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useLesson(courseId, lessonId);
  const completeMutation = useCompleteLesson();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-6">
        <div className="h-6 w-32 bg-slate-100 animate-pulse rounded" />
        <div className="h-10 w-96 bg-slate-100 animate-pulse rounded" />
        <div className="h-72 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 max-w-xl mx-auto my-12">
        <p className="text-red-600 font-medium">Không tìm thấy bài học.</p>
        <Link
          to={`/enterprise/me/courses/${courseId}`}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
        >
          <ArrowLeft className="size-4" /> Quay lại khóa học
        </Link>
      </div>
    );
  }

  const { lesson, courseCode, courseTitle, prevLessonId, nextLessonId } = data;

  const handleCompleteAndNext = async () => {
    try {
      await completeMutation.mutateAsync({ courseId: courseId!, lessonId: lessonId! });
      toast.success('Đã ghi nhận hoàn thành bài học!');
      if (nextLessonId) {
        navigate(`/enterprise/me/courses/${courseId}/lessons/${nextLessonId}`);
      } else {
        toast.info('Chúc mừng bạn đã hoàn thành tất cả bài học! Hãy làm bài đánh giá năng lực.');
        navigate(`/enterprise/me/assessments/${courseId}`);
      }
    } catch {
      toast.error('Có lỗi xảy ra khi lưu tiến độ.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <Link
          to={`/enterprise/me/courses/${courseId}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="size-4" />
          <span>Quay lại {courseCode}</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="size-3.5" /> {lesson.durationMinutes} phút
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
            {lesson.moduleTitle}
          </span>
        </div>
      </div>

      {/* Lesson Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
          {lesson.title}
        </h1>
        <p className="text-slate-600 text-sm">{courseTitle}</p>
      </div>

      {/* Media Video Mockup */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg group">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        <div className="relative text-center p-6 space-y-3">
          <div className="size-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30 group-hover:scale-110 transition cursor-pointer">
            <Play className="size-8 fill-white ml-1" />
          </div>
          <p className="text-white font-medium text-sm">Video bài giảng tương tác: {lesson.title}</p>
          <p className="text-xs text-slate-400">Thời lượng mô phỏng: {lesson.durationMinutes} phút · Chuẩn HD</p>
        </div>
      </div>

      {/* Objective Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3.5">
        <Sparkles className="size-5 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-bold text-blue-900">Mục tiêu học tập</h2>
          <p className="text-sm text-blue-800 mt-1 leading-relaxed">{lesson.objective}</p>
        </div>
      </div>

      {/* Content Blocks */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="prose max-w-none text-slate-800 space-y-4 text-sm sm:text-base leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            Nội dung bài giảng và tình huống thực tế
          </h2>
          {(lesson.content ?? []).map((paragraph, index) => (
            <p key={index} className="text-slate-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Key Takeaways */}
        <div className="border-t border-slate-100 pt-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lightbulb className="size-4 text-amber-500" />
            <span>Điểm cốt lõi cần ghi nhớ</span>
          </h3>
          <ul className="space-y-2">
            {(lesson.keyTakeaways ?? []).map((item, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Practice Exercise */}
        {lesson.practiceTask && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <FileCheck2 className="size-4 text-amber-700" />
              <span>Bài tập thực hành tại chỗ</span>
            </h3>
            <p className="text-sm text-amber-800 leading-relaxed">{lesson.practiceTask}</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div>
          {prevLessonId ? (
            <Link
              to={`/enterprise/me/courses/${courseId}/lessons/${prevLessonId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
            >
              <ArrowLeft className="size-4" /> Bài trước
            </Link>
          ) : (
            <div />
          )}
        </div>

        <button
          type="button"
          onClick={handleCompleteAndNext}
          disabled={completeMutation.isPending}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
        >
          <span>{completeMutation.isPending ? 'Đang lưu…' : nextLessonId ? 'Hoàn thành & Sang bài tiếp theo' : 'Hoàn thành khóa học'}</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
