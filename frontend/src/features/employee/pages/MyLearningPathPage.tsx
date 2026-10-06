import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, PlayCircle, ArrowRight, Sparkles, AlertCircle, Plus, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState, PageHeader, StatusBadge } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useEnrollInCourse, useMyLearningPath } from '@/hooks/use-me';
import type { MyLearningPathStep } from '@/services/me.service';
import { skillGapReasonMessage } from '@/lib/competency-levels';
import { enrollmentStatus, formatMinutes } from '@/lib/me-labels';
import { apiErrorMessage, formatDate } from '@/lib/utils';
import { MyLearningTabs } from '../components/MyLearningTabs';

/** EM-05: Lộ trình học tập — khóa được giao / tự ghi danh và khóa gợi ý theo khoảng trống năng lực. */
export function MyLearningPathPage() {
  const navigate = useNavigate();
  const { data: path, isLoading, isError, refetch } = useMyLearningPath();
  const enroll = useEnrollInCourse();

  const handleEnroll = async (step: MyLearningPathStep) => {
    try {
      await enroll.mutateAsync(step.courseId);
      toast.success(`Đã ghi danh khóa ${step.courseCode}.`);
      navigate(`/enterprise/me/courses/${step.courseId}`);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Không ghi danh được khóa học.'));
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Lộ trình học tập của tôi"
        subtitle="Các khóa học theo thứ tự ưu tiên và điều kiện tiên quyết, nhằm bù khoảng trống năng lực của vị trí."
      />

      <MyLearningTabs />

      {isLoading ? (
        <div className="space-y-4" aria-label="Đang tải lộ trình">
          <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      ) : isError || !path ? (
        <EmptyState
          icon={<AlertCircle className="size-12 text-slate-300 mx-auto" />}
          title="Không tải được lộ trình học tập"
          description="Có lỗi khi tải dữ liệu. Vui lòng thử lại."
          action={
            <button type="button" onClick={() => refetch()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Thử lại
            </button>
          }
        />
      ) : (
        <>
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="size-3.5" /> Lộ trình theo vị trí: {path.jobPositionName || 'chưa gán vị trí'}
              </span>
              <h2 className="text-xl font-bold">{path.summary.totalSteps} chặng bồi dưỡng kỹ năng số</h2>
              <p className="text-sm text-blue-100">
                {path.skipReason
                  ? skillGapReasonMessage(path.skipReason) + ' Lộ trình chỉ gồm các khóa đã được giao.'
                  : `Còn ${path.openGapCount} năng lực chưa đạt chuẩn (đáp ứng ${path.coveragePercent ?? 0}%). Hoàn thành tuần tự các khóa tiên quyết trước.`}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/20 shrink-0">
              <div className="text-center px-2">
                <span className="block text-2xl font-black">{path.summary.completedSteps}/{path.summary.totalSteps}</span>
                <span className="text-[11px] text-blue-100">Đã hoàn thành</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center px-2">
                <span className="block text-2xl font-black">{formatMinutes(path.summary.remainingMinutes)}</span>
                <span className="text-[11px] text-blue-100">Thời lượng còn lại</span>
              </div>
            </div>
          </div>

          {path.steps.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="size-12 text-emerald-400 mx-auto" />}
              title="Chưa có khóa học nào trong lộ trình"
              description="Bạn đã đạt chuẩn năng lực hoặc chưa có khóa phù hợp. Quản lý có thể giao thêm khóa học cho bạn."
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
              <h3 className="font-bold text-slate-900 text-base">Thứ tự các học phần trong lộ trình</h3>

              <ol className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {path.steps.map((step) => {
                  const isCompleted = step.status === 'COMPLETED';
                  const isActive = step.status === 'IN_PROGRESS' || step.status === 'READY_FOR_ASSESSMENT';
                  const isRecommended = step.source === 'RECOMMENDED';
                  const status = enrollmentStatus(step.status);
                  const blockingPrerequisites = step.prerequisites.filter((p) => !p.completed);

                  return (
                    <li key={step.courseId} className="relative group">
                      <div
                        className={`absolute -left-6 sm:-left-8 top-1 size-7 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white ${
                          isCompleted ? 'bg-emerald-600 text-white' : isActive ? 'bg-blue-600 text-white' : isRecommended ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-slate-100 text-slate-400 border border-slate-300'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="size-4" /> : step.order}
                      </div>

                      <div className={`p-6 rounded-2xl border transition ${
                        isActive ? 'border-blue-300 bg-blue-50/20' : isCompleted ? 'border-slate-200 bg-slate-50/40' : isRecommended ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200 bg-white'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{step.courseCode}</span>
                              <LevelBadge level={step.level} />
                              <StatusBadge variant={status.variant} label={isActive && step.status === 'IN_PROGRESS' ? `${status.label} · ${step.progressPercent}%` : status.label} />
                              {step.isOverdue && <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Quá hạn</span>}
                            </div>
                            <Link to={`/enterprise/me/courses/${step.courseId}`} className="font-bold text-slate-900 text-base hover:text-blue-600 transition block">
                              {step.courseTitle}
                            </Link>
                            <p className="text-xs text-slate-500">
                              {formatMinutes(step.estimatedDurationMinutes)}
                              {step.dueDate ? ` · Hạn: ${formatDate(step.dueDate)}` : ''}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {isCompleted ? (
                              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                                <CheckCircle2 className="size-4" /> Đã hoàn thành
                              </span>
                            ) : isRecommended ? (
                              <button
                                type="button"
                                onClick={() => handleEnroll(step)}
                                disabled={!step.canEnroll || enroll.isPending}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-xl shadow-xs transition disabled:opacity-50"
                              >
                                <Plus className="size-4" />
                                <span>Ghi danh & bắt đầu học</span>
                              </button>
                            ) : step.status === 'READY_FOR_ASSESSMENT' ? (
                              <Link
                                to={`/enterprise/me/courses/${step.courseId}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-xs transition"
                              >
                                <FileCheck className="size-4" />
                                <span>Làm bài đánh giá</span>
                              </Link>
                            ) : (
                              <Link
                                to={`/enterprise/me/courses/${step.courseId}`}
                                className={`inline-flex items-center gap-2 px-4 py-2 font-medium text-xs rounded-xl transition ${
                                  isActive ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs' : 'border border-slate-300 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                {isActive ? <PlayCircle className="size-4" /> : <ArrowRight className="size-4" />}
                                <span>{isActive ? `Tiếp tục học (${step.progressPercent}%)` : 'Bắt đầu học'}</span>
                              </Link>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                          <div className="space-y-1.5">
                            <span className="font-semibold text-slate-700 block">Lý do có trong lộ trình:</span>
                            <p className="text-slate-500 leading-relaxed">{step.rationale}</p>
                            {step.targetCompetencies.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {step.targetCompetencies.map((c) => (
                                  <span key={c.code} className={`text-[11px] px-2 py-0.5 rounded font-medium ${c.closesGap ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`} title={c.name}>
                                    <span className="font-mono font-bold">{c.code}</span> → mức {c.targetLevel}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <span className="font-semibold text-slate-700 block">Điều kiện tiên quyết:</span>
                            {step.prerequisites.length === 0 ? (
                              <p className="text-slate-500">Không có điều kiện tiên quyết.</p>
                            ) : (
                              <ul className="space-y-0.5">
                                {step.prerequisites.map((p) => (
                                  <li key={p.courseId} className={p.completed ? 'text-emerald-700' : 'text-slate-500'}>
                                    {p.completed ? '✓' : '○'} <strong>{p.code}</strong> — {p.title}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {isRecommended && blockingPrerequisites.length > 0 && step.canEnroll && (
                              <p className="text-[11px] text-slate-400">Bạn đủ điều kiện nhờ mức năng lực đã xác nhận.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </>
      )}
    </div>
  );
}
