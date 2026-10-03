import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Clock, Lightbulb,
  FileCheck2, Play, Sparkles, FileText, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { useLesson, useCompleteLesson } from '@/hooks/use-learning';
import { coursePathwayService } from '@/services/course-pathway.service';

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

  const pathwayConfig = coursePathwayService.getPathwayConfig(courseId || '', courseCode, 1);
  const customConfig = pathwayConfig.customizedLessons[lessonId || ''];

  // Resolve official video for course A1-A (Marketing Advanced Data track) or custom enterprise videos
  const resolveVideoSource = (): { url: string; type: 'video' | 'embed' } | null => {
    if (customConfig?.customVideoUrl) {
      const customUrl = customConfig.customVideoUrl.trim();
      if (customUrl.endsWith('.mp4') || customUrl.startsWith('/videos/')) {
        return { url: customUrl, type: 'video' };
      }
      const formatted = coursePathwayService.getEmbedUrl(customUrl);
      return formatted ? { url: formatted, type: 'embed' } : null;
    }
    if (courseCode === 'A1-A' || courseId?.includes('A1-A')) {
      if (lessonId?.includes('-1-')) return { url: '/videos/a1-a-v01.mp4', type: 'video' };
      if (lessonId?.includes('-2-')) return { url: '/videos/a1-a-v02.mp4', type: 'video' };
      if (lessonId?.includes('-3-')) return { url: '/videos/a1-a-v03.mp4', type: 'video' };
      return { url: '/videos/a1-a-v01.mp4', type: 'video' };
    }
    return null;
  };
  const activeVideo = resolveVideoSource();

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
            <Clock className="size-3.5" /> {customConfig?.customVideoDuration || lesson.durationMinutes} phút
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

      {/* Media Video Mockup, Native Video Player or Custom Embed */}
      {activeVideo?.type === 'video' ? (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <Sparkles className="size-4 text-emerald-600" />
            <span>Video bài giảng chính thức: Chuẩn Thông tư 02/2025/TT-BGDĐT</span>
          </div>
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-lg">
            <video
              key={activeVideo.url}
              src={activeVideo.url}
              controls
              preload="metadata"
              playsInline
              className="w-full h-full object-contain"
              aria-label={`Video bài giảng: ${lesson.title}`}
            />
          </div>
        </div>
      ) : activeVideo?.type === 'embed' ? (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg">
            <Sparkles className="size-4 text-indigo-600" />
            <span>Video bài giảng chuyên biệt do Doanh nghiệp chỉ định</span>
          </div>
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-lg">
            <iframe
              src={activeVideo.url}
              title="Enterprise Custom Video"
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
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
      )}

      {/* Enterprise Directives / Internal Notes if present */}
      {customConfig?.enterpriseNotes && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-2">
          <h2 className="text-sm font-bold text-amber-900 flex items-center gap-2">
            <Sparkles className="size-4 text-amber-600" />
            <span>Chỉ đạo & Lưu ý nội bộ từ Doanh nghiệp</span>
          </h2>
          <p className="text-sm text-amber-950 leading-relaxed whitespace-pre-line">
            {customConfig.enterpriseNotes}
          </p>
        </div>
      )}

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

        {/* Practice Exercises (Custom & Standard) */}
        <div className="space-y-4 pt-2">
          {customConfig?.customPracticeTask && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 space-y-2">
              <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                <FileCheck2 className="size-4 text-indigo-700" />
                <span>Nhiệm vụ thực hành nội bộ (Doanh nghiệp giao)</span>
              </h3>
              <p className="text-sm text-indigo-950 leading-relaxed">{customConfig.customPracticeTask}</p>
            </div>
          )}

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

        {/* Attachments if any */}
        {customConfig?.attachments && customConfig.attachments.length > 0 && (
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="size-4 text-primary-600" />
              <span>Tài liệu & Quy chế nội bộ đính kèm</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {customConfig.attachments.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs text-slate-800 transition shadow-sm"
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileText className="size-4 text-primary-600 shrink-0" />
                    <span className="truncate font-medium">{doc.title}</span>
                  </span>
                  <ExternalLink className="size-3.5 text-slate-400 shrink-0 ml-1" />
                </a>
              ))}
            </div>
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
