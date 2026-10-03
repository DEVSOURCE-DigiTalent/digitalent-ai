import { useParams, Link } from 'react-router-dom';
import {
  BookOpen, Clock, Award, PlayCircle, CheckCircle2, ArrowLeft,
  FileCheck, ChevronRight,
} from 'lucide-react';
import { StatusBadge } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useCourseDetail } from '@/hooks/use-learning';

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading, isError, error } = useCourseDetail(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-100 animate-pulse rounded" />
        <div className="h-44 bg-slate-100 animate-pulse rounded-2xl" />
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-red-600 font-medium">Không thể tải thông tin khóa học.</p>
        <p className="text-sm text-slate-500 mt-1">{error instanceof Error ? error.message : 'Vui lòng thử lại sau.'}</p>
        <Link
          to="/enterprise/me/learning"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
        >
          <ArrowLeft className="size-4" /> Quay lại danh sách học tập
        </Link>
      </div>
    );
  }

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;
  const firstLessonId = allLessons[0]?.id;
  const progressPercent = course.assignment?.progressPercent ?? 0;
  const isCompleted = course.assignment?.status === 'COMPLETED';
  const isReadyForAssessment = course.assignment?.status === 'READY_FOR_ASSESSMENT' || progressPercent >= 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to="/enterprise/me/learning"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="size-4" />
          <span>Học tập của tôi</span>
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-700 font-semibold">{course.code}</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-mono text-xs font-bold">
                {course.code}
              </span>
              <LevelBadge level={course.level} />
              {course.categoryName && (
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                  {course.categoryName}
                </span>
              )}
              {course.assignment && (
                <StatusBadge
                  variant={
                    course.assignment.status === 'COMPLETED'
                      ? 'success'
                      : course.assignment.status === 'READY_FOR_ASSESSMENT'
                      ? 'info'
                      : 'warning'
                  }
                  label={
                    course.assignment.status === 'COMPLETED'
                      ? 'Đã hoàn thành'
                      : course.assignment.status === 'READY_FOR_ASSESSMENT'
                      ? 'Sẵn sàng đánh giá'
                      : 'Đang học'
                  }
                />
              )}
            </div>

            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{course.title}</h1>

            <p className="text-slate-600 text-sm leading-relaxed">
              Khóa đào tạo chuẩn hóa thuộc Khung năng lực số Thông tư 02/2025/TT-BGDĐT. Giúp nhân sự làm chủ công nghệ,
              quy trình xử lý dữ liệu và tiêu chuẩn bảo vệ an toàn số nơi công sở.
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 pt-2">
              <div className="flex items-center gap-1.5">
                <Clock className="size-4 text-blue-600" />
                <span>{course.estimatedDurationMinutes} phút</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="size-4 text-blue-600" />
                <span>{course.modules.length} học phần ({totalLessons} bài học)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="size-4 text-emerald-600" />
                <span>Chứng nhận hoàn thành tự động</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 shrink-0 w-full lg:w-64 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Tiến độ hoàn thành</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {firstLessonId && (
              <Link
                to={`/enterprise/me/courses/${course.id}/lessons/${firstLessonId}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition shadow-sm"
              >
                <PlayCircle className="size-4" />
                <span>{progressPercent > 0 ? 'Tiếp tục bài học' : 'Bắt đầu học'}</span>
              </Link>
            )}

            {(isReadyForAssessment || isCompleted) && (
              <Link
                to={`/enterprise/me/assessments/${course.id}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition"
              >
                <FileCheck className="size-4" />
                <span>{isCompleted ? 'Xem lại bài đánh giá' : 'Làm bài kiểm tra năng lực'}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Nội dung chương trình đào tạo</h2>
        <div className="space-y-4">
          {course.modules.map((mod, modIdx) => (
            <div key={mod.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-slate-900">{mod.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>
                </div>
                <span className="text-xs text-slate-500 font-medium">{mod.lessons.length} bài học</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {mod.lessons.map((les, lesIdx) => {
                  const isDone = progressPercent >= ((modIdx * 2 + lesIdx + 1) / totalLessons) * 100;
                  return (
                    <li key={les.id}>
                      <Link
                        to={`/enterprise/me/courses/${course.id}/lessons/${les.id}`}
                        className="flex items-center justify-between p-4 hover:bg-slate-50 transition group"
                      >
                        <div className="flex items-center gap-3">
                          {isDone ? (
                            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                          ) : (
                            <div className="size-5 rounded-full border-2 border-slate-300 shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition">
                              {les.title}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-1">{les.objective}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="size-3.5" /> {les.durationMinutes} phút
                          </span>
                          <ChevronRight className="size-4 text-slate-400 group-hover:text-blue-600 transition" />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
