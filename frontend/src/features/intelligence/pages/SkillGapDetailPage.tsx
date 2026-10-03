import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, RefreshCw, AlertCircle, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { useSkillGapRun, useCalculateSkillGap } from '@/hooks/use-skill-gaps';
import { skillGapErrorMessage } from '@/lib/competency-levels';
import { toast } from 'sonner';
import { ConfirmLevelDialog } from '../components/ConfirmLevelDialog';
import { CourseRecommendations } from '../components/CourseRecommendations';
import { SkillGapDetailSkeleton, SkillGapDetailView } from '../components/SkillGapDetailView';

/**
 * OW-22: Skill Gap Detail Page (/enterprise/skill-gap/:employeeId)
 * Trang chi tiết khoảng trống năng lực cá nhân:
 * - So sánh chi tiết năng lực đạt / thiếu theo chuẩn Thông tư 02
 * - Đề xuất khóa học phù hợp để bù đắp khoảng trống
 * - Hỗ trợ tính toán lại và xác nhận mức năng lực có minh chứng
 */
export function SkillGapDetailPage() {
  const { employeeId } = useParams();
  const { data: run, isLoading, isError, refetch } = useSkillGapRun(employeeId);
  const { can } = usePermission();
  const canReadRecommendations = can(PERMISSIONS.LEARNING_RECOMMENDATION_READ);
  const canConfirmLevels = can(PERMISSIONS.EVIDENCE_CREATE_MANUAL);
  const canCalculate = can(PERMISSIONS.SKILL_GAP_CALCULATE);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const calculateMutation = useCalculateSkillGap();

  const handleRecalculate = async () => {
    if (!run) return;
    try {
      await calculateMutation.mutateAsync({ employeeId: run.employeeId });
      toast.success(`Đã tính lại khoảng trống năng lực cho ${run.employeeName}`);
      void refetch();
    } catch (error) {
      toast.error(skillGapErrorMessage(error, 'Không tính lại được khoảng trống năng lực'));
    }
  };

  const handleLevelConfirmed = () => {
    setIsConfirmOpen(false);
    toast.success('Đã xác nhận mức năng lực mới. Khoảng trống năng lực đã được cập nhật.');
    void refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link
          to="/enterprise/skill-gap"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Khoảng trống năng lực
        </Link>
        <SkillGapDetailSkeleton />
      </div>
    );
  }

  if (isError || !run) {
    return (
      <div className="space-y-4">
        <Link
          to="/enterprise/skill-gap"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Khoảng trống năng lực
        </Link>
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="size-5 text-red-600" />
            Không tìm thấy thông tin khoảng trống năng lực
          </div>
          <p className="mt-1 text-sm text-red-700">
            Nhân viên này có thể chưa được phân công vị trí hoặc vị trí chưa có bộ yêu cầu năng lực đang áp dụng.
          </p>
          <div className="mt-4">
            <Link
              to="/enterprise/skill-gap"
              className="rounded-lg bg-red-100 px-3.5 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-200"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/enterprise/skill-gap"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Khoảng trống năng lực
        </Link>
        <PageHeader
          title={run.employeeName}
          subtitle={`${run.employeeCode} · ${run.jobPositionName} · ${run.departmentName} · Phiên bản yêu cầu v${run.requirementSetVersionNo}`}
        >
          <div className="flex items-center gap-2">
            {canConfirmLevels && (
              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
              >
                <BadgeCheck className="size-4" />
                Xác nhận mức năng lực
              </button>
            )}
            {canCalculate && (
              <button
                type="button"
                onClick={handleRecalculate}
                disabled={calculateMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw className={calculateMutation.isPending ? 'size-4 animate-spin' : 'size-4'} />
                Tính lại khoảng trống
              </button>
            )}
          </div>
        </PageHeader>
      </div>

      {/* Main Detail View */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <SkillGapDetailView run={run} />
      </div>

      {/* Recommended Courses Section */}
      {canReadRecommendations && (
        <section aria-labelledby="course-rec-title" className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary-600" />
            <h2 id="course-rec-title" className="text-base font-semibold text-slate-900">
              Khóa học đề xuất bù đắp khoảng trống
            </h2>
          </div>
          <CourseRecommendations employeeId={run.employeeId} />
        </section>
      )}

      {/* Confirm Level Dialog */}
      <ConfirmLevelDialog
        run={run}
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirmed={handleLevelConfirmed}
      />
    </div>
  );
}
