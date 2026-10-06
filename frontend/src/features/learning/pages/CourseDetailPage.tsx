import { useParams, Link } from 'react-router-dom';
import {
  BookOpen, Clock, Award, PlayCircle, CheckCircle2, ArrowLeft, FileCheck, ChevronRight, Lock, Plus, Target, CircleDot,
} from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useEnrollInCourse, useMyCourse } from '@/hooks/use-me';
import { ASSESSMENT_TYPE_LABELS, LESSON_TYPE_LABELS, assessmentStatus, enrollmentStatus, formatMinutes } from '@/lib/me-labels';
import { apiErrorMessage, formatDate } from '@/lib/utils';

/** EM-07: Chi tiết khóa học — đề cương, tiến độ từng bài, bài đánh giá của khóa và ghi danh. */
export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading, isError } = useMyCourse(id);
  const enroll = useEnrollInCourse();

  if (isLoading) {
    return (
      <div className="space-y-6" aria-label="Đang tải khóa học">
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
        <p className="text-sm text-slate-500 mt-1">Khóa học không tồn tại hoặc chưa mở cho bạn.</p>
        <Link to="/enterprise/me/courses" className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">
          <ArrowLeft className="size-4" /> Quay lại khóa học của tôi
        </Link>
      </div>
    );
  }

  const enrollment = course.enrollment;
  const isEnrolled = Boolean(enrollment);
  const progressPercent = enrollment?.progressPercent ?? 0;
  const status = enrollment ? enrollmentStatus(enrollment.status) : null;
  const finalAssessment = course.assessments.find((a) => a.isFinal);

  const handleEnroll = async () => {
    try {
      await enroll.mutateAsync(course.id);
      toast.success('Đã ghi danh khóa học. Bắt đầu học thôi!');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Không ghi danh được khóa học.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/enterprise/me/courses" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="size-4" />
          <span>Khóa học của tôi</span>
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-700 font-semibold">{course.code}</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-mono text-xs font-bold">{course.code}</span>
              <LevelBadge level={course.level} />
              {course.categoryName && <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">{course.categoryName}</span>}
              {status && <StatusBadge variant={status.variant} label={status.label} />}
            </div>

            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{course.title}</h1>
            {(course.description || course.purpose) && (
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{course.description || course.purpose}</p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1.5"><Clock className="size-4 text-blue-600" /> {formatMinutes(course.estimatedDurationMinutes)}</span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="size-4 text-blue-600" /> {course.modules.length} học phần · {course.totalLessons} bài bắt buộc
              </span>
              {course.certificateEnabled && (
                <span className="flex items-center gap-1.5">
                  <Award className="size-4 text-emerald-600" />
                  Cấp chứng chỉ khi đạt bài cuối khóa{course.certificateValidityDays ? ` (hiệu lực ${course.certificateValidityDays} ngày)` : ''}
                </span>
              )}
            </div>
            {enrollment && (
              <p className="text-xs text-slate-500">
                {enrollment.source === 'ASSIGNED' ? `Được giao bởi ${enrollment.assignedByName ?? 'quản lý'}` : 'Bạn tự ghi danh'}
                {enrollment.dueDate && (
                  <span className={enrollment.isOverdue ? 'text-rose-600 font-semibold' : ''}> · Hạn hoàn thành {formatDate(enrollment.dueDate)}</span>
                )}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 shrink-0 w-full lg:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {isEnrolled ? (
              <>
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                    <span>Tiến độ ({course.completedLessons}/{course.totalLessons} bài)</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                {course.nextLessonId && enrollment?.status !== 'COMPLETED' && (
                  <Link
                    to={`/enterprise/me/courses/${course.id}/lessons/${course.nextLessonId}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition shadow-sm"
                  >
                    <PlayCircle className="size-4" />
                    <span>{enrollment?.status === 'NOT_STARTED' ? 'Bắt đầu học' : 'Tiếp tục bài học'}</span>
                  </Link>
                )}

                {finalAssessment && (
                  finalAssessment.status === 'LOCKED' ? (
                    <p className="text-xs text-slate-500 flex items-start gap-1.5">
                      <Lock className="size-3.5 mt-0.5 shrink-0" /> {finalAssessment.lockedReason}
                    </p>
                  ) : (
                    <Link
                      to={finalAssessment.status === 'PASSED' && finalAssessment.latestAttemptId
                        ? `/enterprise/me/assessments/${finalAssessment.id}/result?attempt=${finalAssessment.latestAttemptId}`
                        : `/enterprise/me/assessments/${finalAssessment.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition"
                    >
                      <FileCheck className="size-4" />
                      <span>{finalAssessment.status === 'PASSED' ? 'Xem kết quả bài cuối khóa' : 'Làm bài đánh giá cuối khóa'}</span>
                    </Link>
                  )
                )}

                {course.certificate && (
                  <Link to="/enterprise/me/achievements" className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 hover:underline">
                    <Award className="size-4" /> Chứng chỉ {course.certificate.code}
                  </Link>
                )}
              </>
            ) : course.canEnroll ? (
              <>
                <p className="text-xs text-slate-600">Bạn chưa ghi danh khóa học này.</p>
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={enroll.isPending}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition shadow-sm disabled:opacity-50"
                >
                  <Plus className="size-4" />
                  <span>{enroll.isPending ? 'Đang ghi danh…' : 'Ghi danh khóa học'}</span>
                </button>
              </>
            ) : (
              <p className="text-xs text-slate-600 flex items-start gap-1.5">
                <Lock className="size-3.5 mt-0.5 shrink-0" /> {course.enrollBlockedReason ?? 'Khóa học chưa mở để ghi danh.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {(course.competencies.length > 0 || course.prerequisites.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {course.competencies.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Target className="size-4 text-blue-600" /> Năng lực khóa học phát triển</h2>
              <ul className="space-y-1.5 text-xs">
                {course.competencies.map((c) => (
                  <li key={c.competencyId} className="flex items-center justify-between gap-2">
                    <span className="text-slate-700"><span className="font-mono font-bold text-blue-700">{c.code}</span> {c.name}</span>
                    <LevelBadge level={c.targetLevel} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {course.prerequisites.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
              <h2 className="text-sm font-bold text-slate-900">Khóa học tiên quyết</h2>
              <ul className="space-y-1.5 text-xs">
                {course.prerequisites.map((p) => (
                  <li key={p.courseId} className={p.completed ? 'text-emerald-700' : 'text-slate-600'}>
                    {p.completed ? '✓' : '○'} <Link to={`/enterprise/me/courses/${p.courseId}`} className="hover:underline"><strong>{p.code}</strong> — {p.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {course.outcomes.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <h2 className="text-sm font-bold text-slate-900">Chuẩn đầu ra của khóa học</h2>
          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
            {course.outcomes.map((o) => <li key={o.code}>{o.statement}</li>)}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Nội dung chương trình đào tạo</h2>
        {course.modules.length === 0 ? (
          <p className="text-sm text-slate-500 bg-white rounded-xl border border-slate-200 p-5">Khóa học chưa có nội dung bài học.</p>
        ) : (
          <div className="space-y-4">
            {course.modules.map((mod) => (
              <div key={mod.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">{mod.title}</h3>
                    {mod.description && <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>}
                  </div>
                  <span className="text-xs text-slate-500 font-medium shrink-0">{mod.lessons.length} bài học</span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {mod.lessons.map((lesson) => {
                    const done = lesson.progressStatus === 'COMPLETED';
                    const started = lesson.progressStatus === 'IN_PROGRESS';
                    const row = (
                      <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition group">
                        <div className="flex items-center gap-3">
                          {done ? (
                            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" aria-label="Đã hoàn thành" />
                          ) : started ? (
                            <CircleDot className="size-5 text-blue-600 shrink-0" aria-label="Đang học" />
                          ) : (
                            <div className="size-5 rounded-full border-2 border-slate-300 shrink-0" aria-label="Chưa học" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition">{lesson.title}</p>
                            <p className="text-xs text-slate-500">
                              {LESSON_TYPE_LABELS[lesson.lessonType] ?? lesson.lessonType}
                              {!lesson.selfCompletable ? ' · hoàn thành qua bài kiểm tra / nộp bài' : ''}
                              {!lesson.isRequired ? ' · tự chọn' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="size-3.5" /> {lesson.estimatedMinutes ?? '—'} phút
                          </span>
                          {isEnrolled ? <ChevronRight className="size-4 text-slate-400 group-hover:text-blue-600 transition" /> : <Lock className="size-4 text-slate-300" />}
                        </div>
                      </div>
                    );
                    return (
                      <li key={lesson.id}>
                        {isEnrolled ? <Link to={`/enterprise/me/courses/${course.id}/lessons/${lesson.id}`}>{row}</Link> : row}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {course.assessments.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Bài đánh giá của khóa học</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course.assessments.map((a) => {
              const aStatus = assessmentStatus(a.status);
              return (
                <Link key={a.id} to={`/enterprise/me/assessments/${a.id}`} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-400 transition space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500">{ASSESSMENT_TYPE_LABELS[a.assessmentType] ?? a.assessmentType}</span>
                    <StatusBadge variant={aStatus.variant} label={aStatus.label} />
                  </div>
                  <p className="font-semibold text-sm text-slate-900">{a.title}</p>
                  <p className="text-xs text-slate-500">
                    {a.questionCount} câu · đạt từ {a.passingScore}%
                    {a.timeLimitMinutes ? ` · ${a.timeLimitMinutes} phút` : ''}
                    {a.bestScore != null ? ` · điểm cao nhất ${a.bestScore}%` : ''}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
