import { useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Clock, FileCheck2, Sparkles, FileText, ExternalLink, Download, Info, Play,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCompleteMyLesson, useMyLesson, useStartLesson } from '@/hooks/use-me';
import { meService } from '@/services/me.service';
import { coursePathwayService } from '@/services/course-pathway.service';
import { resolveCourseMedia } from '@/features/courses/components/course-media';
import { LESSON_TYPE_LABELS } from '@/lib/me-labels';
import { saveBlob, formatFileSize } from '@/lib/download';
import { apiErrorMessage } from '@/lib/utils';
import { LessonContent } from '../components/LessonContent';

/** EM-08: Nội dung bài học — đọc bài, học liệu, ghi nhận tiến độ và chuyển bài. */
export function LessonViewerPage() {
  const { id: courseId, lessonId } = useParams<{ id: string; lessonId: string }>();
  const navigate = useNavigate();
  const { data: lesson, isLoading, isError, error } = useMyLesson(courseId, lessonId);
  const startLesson = useStartLesson();
  const completeLesson = useCompleteMyLesson();
  const startedFor = useRef<string | null>(null);

  // Ghi nhận mở bài 1 lần / bài (để "học tiếp" đúng chỗ); bài đã xong thì không cần
  useEffect(() => {
    if (!lesson || !courseId || !lessonId || lesson.progressStatus !== 'NOT_STARTED') return;
    if (startedFor.current === lessonId) return;
    startedFor.current = lessonId;
    startLesson.mutate({ courseId, lessonId });
  }, [lesson, courseId, lessonId, startLesson]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-6" aria-label="Đang tải bài học">
        <div className="h-6 w-32 bg-slate-100 animate-pulse rounded" />
        <div className="h-10 w-96 bg-slate-100 animate-pulse rounded" />
        <div className="h-72 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (isError || !lesson) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 max-w-xl mx-auto my-12">
        <p className="text-red-600 font-medium">{apiErrorMessage(error, 'Không tìm thấy bài học.')}</p>
        <Link
          to={`/enterprise/me/courses/${courseId}`}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
        >
          <ArrowLeft className="size-4" /> Quay lại khóa học
        </Link>
      </div>
    );
  }

  // Nội dung tùy biến doanh nghiệp (video / chỉ đạo nội bộ) do Owner cấu hình cho khóa (Course Pathway)
  const pathwayConfig = coursePathwayService.getPathwayConfig(lesson.courseId, lesson.courseCode, 1);
  const customConfig = pathwayConfig.customizedLessons[lesson.id];
  // Bài VIDEO: content_body là đường dẫn video — chỉ nhận YouTube/Vimeo/Loom/tệp video (resolveCourseMedia)
  const isVideoLesson = lesson.lessonType === 'VIDEO';
  const lessonMedia = isVideoLesson ? resolveCourseMedia(lesson.contentBody) : null;
  const resolveVideoSource = (): { url: string; type: 'video' | 'embed' } | null => {
    if (customConfig?.customVideoUrl) {
      const customUrl = customConfig.customVideoUrl.trim();
      if (customUrl.endsWith('.mp4') || customUrl.startsWith('/videos/')) return { url: customUrl, type: 'video' };
      const formatted = coursePathwayService.getEmbedUrl(customUrl);
      return formatted ? { url: formatted, type: 'embed' } : null;
    }
    if (lessonMedia) return { url: lessonMedia.url, type: lessonMedia.kind === 'file' ? 'video' : 'embed' };
    // Video bài giảng chính thức có sẵn cho khóa A1-A (public/videos/a1-a-v01..03.mp4)
    if (lesson.courseCode === 'A1-A') {
      return { url: `/videos/a1-a-v0${Math.min(3, Math.max(1, lesson.lessonIndex))}.mp4`, type: 'video' };
    }
    return null;
  };
  const activeVideo = resolveVideoSource();
  const isCompleted = lesson.progressStatus === 'COMPLETED';

  const goNext = (finalAssessmentId?: string | null, readyForAssessment?: boolean) => {
    if (lesson.nextLessonId) {
      navigate(`/enterprise/me/courses/${lesson.courseId}/lessons/${lesson.nextLessonId}`);
    } else if (readyForAssessment && finalAssessmentId) {
      toast.info('Bạn đã học xong các bài bắt buộc. Hãy làm bài đánh giá cuối khóa!');
      navigate(`/enterprise/me/assessments/${finalAssessmentId}`);
    } else {
      navigate(`/enterprise/me/courses/${lesson.courseId}`);
    }
  };

  const handleComplete = async () => {
    try {
      const result = await completeLesson.mutateAsync({ courseId: lesson.courseId, lessonId: lesson.id });
      toast.success('Đã ghi nhận hoàn thành bài học!');
      goNext(result.finalAssessmentId, result.readyForAssessment);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Có lỗi xảy ra khi lưu tiến độ.'));
    }
  };

  const handleDownload = async (materialId: string, fileName: string) => {
    try {
      saveBlob(await meService.downloadMaterial(lesson.courseId, lesson.id, materialId), fileName);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không tải được học liệu.'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 gap-3">
        <Link to={`/enterprise/me/courses/${lesson.courseId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition">
          <ArrowLeft className="size-4" />
          <span>Quay lại {lesson.courseCode}</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">Bài {lesson.lessonIndex}/{lesson.totalLessons} · Khóa {lesson.courseProgressPercent}%</span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="size-3.5" /> {customConfig?.customVideoDuration || lesson.estimatedMinutes || '—'} phút
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded">{lesson.moduleTitle}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500">{LESSON_TYPE_LABELS[lesson.lessonType] ?? lesson.lessonType}</span>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="size-3.5" /> Đã hoàn thành
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">{lesson.title}</h1>
        <p className="text-slate-600 text-sm">{lesson.courseTitle}</p>
      </div>

      {activeVideo?.type === 'video' && (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-lg">
          <video key={activeVideo.url} src={activeVideo.url} controls preload="metadata" playsInline className="w-full h-full object-contain" aria-label={`Video bài giảng: ${lesson.title}`} />
        </div>
      )}
      {activeVideo?.type === 'embed' && (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-lg">
          <iframe
            src={activeVideo.url}
            title={`Video bài giảng: ${lesson.title}`}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {customConfig?.enterpriseNotes && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-2">
          <h2 className="text-sm font-bold text-amber-900 flex items-center gap-2">
            <Sparkles className="size-4 text-amber-600" /> Chỉ đạo & lưu ý nội bộ từ doanh nghiệp
          </h2>
          <p className="text-sm text-amber-950 leading-relaxed whitespace-pre-line">{customConfig.enterpriseNotes}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        {!isVideoLesson ? (
          <LessonContent body={lesson.contentBody} />
        ) : !activeVideo && (
          <div className="aspect-video rounded-xl bg-gradient-to-br from-slate-900 via-slate-700 to-blue-900 grid place-items-center text-white text-center">
            <div><Play className="mx-auto mb-3 size-10" /><p>Chưa có đường dẫn video cho bài học này.</p></div>
          </div>
        )}

        {customConfig?.customPracticeTask && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
              <FileCheck2 className="size-4 text-indigo-700" /> Nhiệm vụ thực hành nội bộ (doanh nghiệp giao)
            </h3>
            <p className="text-sm text-indigo-950 leading-relaxed">{customConfig.customPracticeTask}</p>
          </div>
        )}

        {(lesson.materials.length > 0 || (customConfig?.attachments?.length ?? 0) > 0) && (
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="size-4 text-blue-600" /> Học liệu đính kèm
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {lesson.materials.map((material) =>
                material.materialType === 'LINK' ? (
                  <a
                    key={material.id}
                    href={material.externalUrl ?? '#'}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs text-slate-800 transition"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <FileText className="size-4 text-blue-600 shrink-0" />
                      <span className="truncate font-medium">{material.title}</span>
                    </span>
                    <ExternalLink className="size-3.5 text-slate-400 shrink-0 ml-1" />
                  </a>
                ) : (
                  <button
                    key={material.id}
                    type="button"
                    onClick={() => handleDownload(material.id, material.fileName ?? material.title)}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs text-slate-800 transition text-left"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <FileText className="size-4 text-blue-600 shrink-0" />
                      <span className="truncate font-medium">{material.title}</span>
                      {material.sizeBytes ? <span className="text-slate-400 shrink-0">({formatFileSize(material.sizeBytes)})</span> : null}
                    </span>
                    <Download className="size-3.5 text-slate-400 shrink-0 ml-1" />
                  </button>
                ),
              )}
              {customConfig?.attachments?.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs text-slate-800 transition"
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileText className="size-4 text-blue-600 shrink-0" />
                    <span className="truncate font-medium">{doc.title}</span>
                  </span>
                  <ExternalLink className="size-3.5 text-slate-400 shrink-0 ml-1" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {!lesson.selfCompletable && !isCompleted && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-900">
          <Info className="size-4 mt-0.5 shrink-0" />
          <p>Bài học này được tính hoàn thành khi bạn đạt bài kiểm tra hoặc nộp bài thực hành tương ứng của khóa.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div>
          {lesson.prevLessonId ? (
            <Link
              to={`/enterprise/me/courses/${lesson.courseId}/lessons/${lesson.prevLessonId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
            >
              <ArrowLeft className="size-4" /> Bài trước
            </Link>
          ) : (
            <div />
          )}
        </div>

        {lesson.selfCompletable && !isCompleted ? (
          <button
            type="button"
            onClick={handleComplete}
            disabled={completeLesson.isPending}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <span>{completeLesson.isPending ? 'Đang lưu…' : lesson.nextLessonId ? 'Hoàn thành & sang bài tiếp theo' : 'Hoàn thành bài học'}</span>
            <ArrowRight className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => goNext()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-lg transition"
          >
            <span>{lesson.nextLessonId ? 'Sang bài tiếp theo' : 'Về trang khóa học'}</span>
            <ArrowRight className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
