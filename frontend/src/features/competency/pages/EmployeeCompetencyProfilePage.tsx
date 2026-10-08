import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
import { PageHeader, ScoreCard, StatusBadge, Tabs } from '@/components/shared';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useEmployeeCapability } from '@/hooks/use-workforce';
import { PERMISSIONS } from '@/hooks/use-permission';
import { competencyCodeMap } from '@/lib/competency-levels';
import { BLOCKER_LABELS } from '@/services/workforce.service';
import type { SkillGapRunDetail } from '@/services/intelligence.service';
import type { EmployeeCapability } from '@/services/workforce.service';
import { ConfirmLevelDialog } from '@/features/intelligence/components/ConfirmLevelDialog';
import { SECONDARY_BUTTON } from '@/features/onboarding/components/styles';
import {
  CompetencyTab,
  SkillGapTab,
  EvidencesTab,
  LearningTab,
  AssessmentsTab,
  TasksTab,
} from '@/features/members/components/employee-tabs';

function toRun(capability: EmployeeCapability): SkillGapRunDetail | null {
  const { skillGap, employee } = capability;
  if (!skillGap) return null;
  return {
    runId: skillGap.runId,
    employeeId: employee.id,
    employeeCode: employee.employeeCode,
    employeeName: employee.fullName,
    departmentName: employee.departmentName,
    jobPositionName: employee.positionName,
    requirementSetVersionNo: skillGap.requirementSetVersionNo,
    generatedAt: skillGap.generatedAt,
    generatedBy: 'SYSTEM',
    gapCount: skillGap.summary.totalGap,
    highCount: skillGap.summary.highCount,
    coveragePercent: skillGap.summary.coveragePercent,
    requirementSetId: '',
    calculationVersion: '',
    summary: skillGap.summary,
    items: skillGap.items,
  };
}

/**
 * OW-20: Chi tiết hồ sơ năng lực nhân sự (/enterprise/competency-profiles/:employeeId)
 * Gộp toàn diện từ LCA-09: Bảng trình độ năng lực TT02, phân tích skill gap,
 * dòng thời gian minh chứng (EvidencesTab), tiến độ học tập và nhiệm vụ thực tế.
 */
export function EmployeeCompetencyProfilePage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const { data, isLoading, isError, refetch } = useEmployeeCapability(employeeId);
  const canConfirm = useCurrentUser((s) => s.hasPermission)(PERMISSIONS.EVIDENCE_CREATE_MANUAL);
  const [tab, setTab] = useState('competency');
  const [confirming, setConfirming] = useState(false);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Đang tải hồ sơ năng lực nhân sự…</p>;
  }

  if (isError || !data) {
    return (
      <div role="alert" className="grid gap-3">
        <p className="text-sm text-red-600">Không tìm thấy thông tin hồ sơ nhân viên này.</p>
        <Link to="/enterprise/competency-profiles" className="text-sm font-medium text-primary-700 underline">
          Quay lại ma trận hồ sơ năng lực
        </Link>
      </div>
    );
  }

  const run = toRun(data);
  const { employee, summary } = data;

  return (
    <div className="space-y-6">
      <Link
        to="/enterprise/competency-profiles"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Ma trận hồ sơ năng lực
      </Link>

      <PageHeader
        title={employee.fullName}
        subtitle={[
          employee.employeeCode,
          employee.positionName,
          (employee as any).jobGrade ? `Cấp bậc ${(employee as any).jobGrade}` : null,
          employee.departmentName,
        ]
          .filter(Boolean)
          .join(' · ')}
      >
        <StatusBadge
          label={employee.status === 'ACTIVE' ? 'Đang làm việc' : 'Đã nghỉ'}
          variant={employee.status === 'ACTIVE' ? 'success' : 'default'}
        />
        {run && canConfirm && (
          <button type="button" onClick={() => setConfirming(true)} className={SECONDARY_BUTTON}>
            <BadgeCheck className="size-4 text-teal-600" aria-hidden="true" />
            Xác nhận trình độ năng lực
          </button>
        )}
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <ScoreCard
          label="Tỷ lệ đáp ứng năng lực"
          value={summary.coveragePercent === null ? '—' : `${summary.coveragePercent.toFixed(1)}%`}
          variant={
            summary.coveragePercent === null
              ? 'default'
              : summary.coveragePercent >= 80
              ? 'success'
              : summary.coveragePercent >= 50
              ? 'warning'
              : 'danger'
          }
          subtitle={summary.blocker ? BLOCKER_LABELS[summary.blocker] : undefined}
        />
        <ScoreCard
          label="Khoảng trống năng lực"
          value={summary.gapCount ?? '—'}
          variant={summary.highCount ? 'danger' : 'default'}
          subtitle={summary.highCount ? `${summary.highCount} khoảng trống mức cao` : undefined}
        />
        <ScoreCard
          label="Khóa đang học"
          value={summary.activeCourses}
          variant={summary.overdueCourses ? 'warning' : 'default'}
          subtitle={summary.overdueCourses ? `${summary.overdueCourses} quá hạn` : undefined}
        />
        <ScoreCard
          label="Khóa đã hoàn thành"
          value={summary.completedCourses}
          variant="success"
        />
      </div>

      <Tabs
        label="Chi tiết hồ sơ năng lực"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'competency', label: 'Trình độ năng lực' },
          { id: 'gap', label: 'Khoảng trống năng lực' },
          {
            id: 'evidence',
            label: 'Minh chứng & Dòng thời gian',
            badge: (data.evidence?.length ?? 0) + (data.submissions?.length ?? 0),
          },
          { id: 'learning', label: 'Học tập & Đào tạo', badge: data.learning?.length },
          { id: 'assessments', label: 'Bài đánh giá', badge: data.assessments?.length },
          { id: 'tasks', label: 'Nhiệm vụ thực tế', badge: data.tasks?.length },
        ]}
      >
        {tab === 'competency' && (
          <CompetencyTab rows={data.competencies} hasRequirement={Boolean(run)} />
        )}
        {tab === 'gap' && (
          <SkillGapTab run={run} employeeId={employee.id} blocker={summary.blocker} />
        )}
        {tab === 'evidence' && (
          <EvidencesTab evidence={data.evidence ?? []} submissions={data.submissions ?? []} />
        )}
        {tab === 'learning' && (
          <LearningTab assignments={data.learning} />
        )}
        {tab === 'assessments' && (
          <AssessmentsTab attempts={data.assessments} />
        )}
        {tab === 'tasks' && (
          <TasksTab tasks={data.tasks} competencyCodes={competencyCodeMap(data.competencies)} />
        )}
      </Tabs>

      {run && (
        <ConfirmLevelDialog
          run={run}
          open={confirming}
          onClose={() => setConfirming(false)}
          onConfirmed={() => {
            setConfirming(false);
            void refetch();
          }}
        />
      )}
    </div>
  );
}
