import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, RefreshCw, AlertCircle, BookOpen } from 'lucide-react';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { useSkillGapRun, useSkillGapRuns, useCalculateSkillGap } from '@/hooks/use-skill-gaps';
import { skillGapErrorMessage } from '@/lib/competency-levels';
import { toast } from 'sonner';
import { ConfirmLevelDialog } from '../components/ConfirmLevelDialog';
import { CourseRecommendations } from '../components/CourseRecommendations';
import { SkillGapDetailSkeleton } from '../components/SkillGapDetailView';
import { SkillGapDetailDashboard } from '../components/SkillGapDetailDashboard';
import { formatDateTime } from '@/lib/utils';
import './skill-gap-detail.css';

/**
 * OW-22: Skill Gap Detail Page (/enterprise/skill-gap/:employeeId)
 * Trang chi tiết khoảng trống năng lực cá nhân:
 * - So sánh chi tiết năng lực đạt / thiếu theo chuẩn Thông tư 02
 * - Đề xuất khóa học phù hợp để bù đắp khoảng trống
 * - Hỗ trợ tính toán lại và xác nhận mức năng lực có minh chứng
 */
export function SkillGapDetailPage() {
  const { employeeId } = useParams();
  // The route carries the employee: find their latest snapshot, then load its competency lines.
  const latest = useSkillGapRuns({ employeeId, latestOnly: true, pageIndex: 1, pageSize: 1 }, !!employeeId);
  const runQuery = useSkillGapRun(latest.data?.items[0]?.runId);
  const run = runQuery.data;
  const isLoading = latest.isLoading || runQuery.isLoading;
  const isError = latest.isError || runQuery.isError;
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
    } catch (error) {
      toast.error(skillGapErrorMessage(error, 'Không tính lại được khoảng trống năng lực'));
    }
  };

  const handleLevelConfirmed = () => {
    setIsConfirmOpen(false);
    toast.success('Đã xác nhận mức năng lực mới. Khoảng trống năng lực đã được cập nhật.');
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
    <div className="personal-gap-page">
      <div className="personal-gap-container">
      <header className="personal-gap-header">
        <div>
          <Link to="/enterprise/skill-gap" className="personal-gap-back"><ArrowLeft size={16} /> Khoảng trống năng lực</Link>
          <h1>{run.employeeName}</h1>
          <div className="personal-gap-meta"><span>{run.employeeCode}</span>{run.jobPositionName && <span>{run.jobPositionName}</span>}{run.departmentName && <span>{run.departmentName}</span>}<span>Cập nhật {formatDateTime(run.generatedAt)}</span></div>
        </div>
        <div className="personal-gap-actions">
          {canConfirmLevels && <button type="button" onClick={() => setIsConfirmOpen(true)}><BadgeCheck size={17} /> Xác nhận năng lực</button>}
          {canCalculate && <button type="button" onClick={handleRecalculate} disabled={calculateMutation.isPending}><RefreshCw className={calculateMutation.isPending ? 'size-4 animate-spin' : 'size-4'} /> Tính lại</button>}
        </div>
      </header>

      <SkillGapDetailDashboard run={run} />

      {canReadRecommendations && <section aria-labelledby="course-rec-title" className="personal-gap-courses"><div className="personal-gap-section-heading"><h2 id="course-rec-title" className="flex items-center gap-2"><BookOpen size={19} /> Khóa học phù hợp</h2></div><CourseRecommendations employeeId={run.employeeId} compact /></section>}

      <ConfirmLevelDialog
        run={run}
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirmed={handleLevelConfirmed}
      />
      </div>
    </div>
  );
}
