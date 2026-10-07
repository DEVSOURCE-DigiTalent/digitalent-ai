import { Link } from 'react-router-dom';
import { CheckCircle2, BookOpen, Sparkles, AlertTriangle, Info, ArrowRight, AlertCircle } from 'lucide-react';
import { PageHeader, EmptyState, StatusBadge } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useMySkillGapDetail } from '@/hooks/use-me';
import type { MySkillGapLine } from '@/services/me.service';
import { skillGapReasonMessage } from '@/lib/competency-levels';
import { SEVERITY_LABELS, enrollmentStatus, formatMinutes } from '@/lib/me-labels';
import { formatDateTime } from '@/lib/utils';
import { MyCompetencyTabs } from '../components/MyCompetencyTabs';

/** Cơ sở của yêu cầu: ghi chú của bộ tiêu chuẩn + cờ bắt buộc / trọng số / cần minh chứng thực tế. */
function rationaleOf(line: MySkillGapLine): string[] {
  const reasons: string[] = [];
  if (line.note) reasons.push(line.note);
  reasons.push(
    line.mandatory
      ? 'Năng lực bắt buộc của vị trí — được ưu tiên cao khi tính khoảng trống.'
      : 'Năng lực theo chuẩn vị trí (không bắt buộc).',
  );
  reasons.push(`Chiếm ${line.weightPercent}% trọng số chuẩn năng lực của vị trí.`);
  if (line.requiresPracticalEvidence) {
    reasons.push('Cần minh chứng từ nhiệm vụ thực tế được quản lý duyệt để xác nhận mức này.');
  }
  return reasons;
}

/**
 * EM-03: Khoảng trống năng lực của tôi — so sánh mức đã xác nhận với chuẩn vị trí (tính trực tiếp),
 * cơ sở của từng yêu cầu và khóa học bù khoảng trống.
 */
export function MySkillGapPage() {
  const { data: gap, isLoading, isError, refetch } = useMySkillGapDetail();

  const lines = gap?.items ?? [];
  const gapLines = lines.filter((line) => line.gapSteps > 0);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Khoảng trống năng lực của tôi (Skill Gap)"
          subtitle="So sánh năng lực đã xác nhận với tiêu chuẩn vị trí việc làm và cơ sở của từng yêu cầu."
        />
        <Link
          to="/enterprise/me/learning-path"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm transition shrink-0"
        >
          <BookOpen className="size-4" />
          <span>Xem lộ trình bồi dưỡng</span>
        </Link>
      </div>

      <MyCompetencyTabs />

      {isLoading ? (
        <div className="space-y-4" aria-label="Đang tải khoảng trống năng lực">
          <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      ) : isError || !gap ? (
        <EmptyState
          icon={<AlertCircle className="size-12 text-slate-300 mx-auto" />}
          title="Không tải được khoảng trống năng lực"
          description="Có lỗi khi tải dữ liệu. Vui lòng thử lại."
          action={
            <button type="button" onClick={() => refetch()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Thử lại
            </button>
          }
        />
      ) : gap.skipReason ? (
        <EmptyState
          icon={<Info className="size-12 text-slate-300 mx-auto" />}
          title="Chưa tính được khoảng trống năng lực"
          description={`${skillGapReasonMessage(gap.skipReason)} Vui lòng liên hệ HR hoặc quản lý trực tiếp.`}
        />
      ) : (
        <>
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 rounded-2xl border border-indigo-100 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="size-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Tổng quan khoảng trống năng lực vị trí: {gap.jobPositionName}
                {gap.requirementSetVersionNo ? ` (bộ yêu cầu v${gap.requirementSetVersionNo})` : ''}
              </h3>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Số liệu tính theo hồ sơ năng lực đã xác nhận mới nhất của bạn (cập nhật {formatDateTime(gap.calculatedAt)}).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Năng lực đã đạt chuẩn</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">{gap.summary?.totalMet ?? 0} / {gap.summary?.totalRequired ?? 0}</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Khoảng trống cần bổ sung</span>
                <p className="text-2xl font-black text-amber-500 mt-1">{gapLines.length} năng lực</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Khoảng trống mức độ Cao</span>
                <p className="text-2xl font-black text-rose-600 mt-1">{gap.summary?.highCount ?? 0}</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Mức đáp ứng chuẩn vị trí</span>
                <p className="text-2xl font-black text-indigo-600 mt-1">{gap.summary?.coveragePercent ?? 0}%</p>
              </div>
            </div>
          </div>

          {/* Gap cards */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500" />
              Các năng lực cần ưu tiên bồi dưỡng và cơ sở yêu cầu
            </h3>

            {gapLines.length === 0 ? (
              <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center p-8 space-y-3">
                <CheckCircle2 className="size-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900 text-lg">Đã đáp ứng 100% tiêu chuẩn năng lực!</h4>
                <p className="text-sm text-slate-500 max-w-md mx-auto">Bạn đã đạt chuẩn toàn bộ các năng lực yêu cầu cho vị trí công việc hiện tại.</p>
              </div>
            ) : (
              gapLines.map((line) => {
                const severity = SEVERITY_LABELS[line.severity ?? 'LOW'];
                return (
                  <div key={line.competencyId} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">{line.competencyCode}</span>
                          <h4 className="font-bold text-slate-900 text-base">{line.competencyName}</h4>
                          <StatusBadge variant={severity.variant} label={severity.label} />
                        </div>
                        <p className="text-xs text-slate-500">Miền: {line.categoryName || '—'}</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs shrink-0 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block">Hiện tại:</span>
                          <LevelBadge level={line.currentLevel} />
                        </div>
                        <span className="text-slate-300">→</span>
                        <div>
                          <span className="text-slate-400 block">Yêu cầu:</span>
                          <LevelBadge level={line.requiredLevel} />
                        </div>
                        <span className="text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded">Thiếu {line.gapSteps} mức</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex items-start gap-3">
                      <Info className="size-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <p className="font-semibold text-slate-800">Cơ sở yêu cầu:</p>
                        <ul className="list-disc list-inside text-slate-600 leading-relaxed space-y-0.5">
                          {rationaleOf(line).map((reason) => <li key={reason}>{reason}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-700">Khóa học bù khoảng trống:</p>
                      {line.suggestedCourses.length === 0 ? (
                        <p className="text-xs text-slate-500">Chưa có khóa học nào dạy năng lực này lên mức cao hơn — hãy trao đổi với quản lý về nhiệm vụ thực tế phù hợp.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {line.suggestedCourses.map((course) => {
                            const status = course.enrollmentStatus ? enrollmentStatus(course.enrollmentStatus) : null;
                            return (
                              <Link
                                key={course.courseId}
                                to={`/enterprise/me/courses/${course.courseId}`}
                                className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 transition text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono font-bold text-blue-700">{course.code}</span>
                                  <LevelBadge level={course.targetLevel} />
                                </div>
                                <p className="font-semibold text-slate-800 line-clamp-2">{course.title}</p>
                                <div className="flex items-center justify-between gap-2 text-slate-500">
                                  <span>{formatMinutes(course.estimatedDurationMinutes)}</span>
                                  {status ? <StatusBadge variant={status.variant} label={status.label} /> : (
                                    <span className="inline-flex items-center gap-1 font-semibold text-blue-600">Xem khóa <ArrowRight className="size-3" /></span>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
