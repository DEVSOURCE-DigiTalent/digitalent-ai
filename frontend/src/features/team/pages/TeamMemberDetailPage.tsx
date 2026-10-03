import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ClipboardList, AlertCircle } from 'lucide-react';
import { PageHeader, StatusBadge, Tabs } from '@/components/shared';
import { useEmployee } from '@/hooks/use-employees';
import { useEmployeeCapability } from '@/hooks/use-workforce';
import type { SkillGapRunDetail } from '@/services/intelligence.service';
import type { EmployeeCapability } from '@/services/workforce.service';
import type { MemberDetail } from '@/services/member.service';
import {
  OverviewTab,
  CompetencyTab,
  SkillGapTab,
  LearningTab,
  AssessmentsTab,
  TasksTab,
  EvidencesTab,
  AchievementsTab,
} from '@/features/members/components/employee-tabs';
import { MEMBER_STATUS_LABELS, MEMBER_STATUS_VARIANTS } from '@/features/members/member-labels';

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
 * MG-03: Team Member Detail Page (Manager Scope)
 * Trang chi tiết nhân sự nhóm dành riêng cho Quản lý (Manager):
 * - Sử dụng các tab employee-tabs của Agent 1 ở chế độ CHỈ ĐỌC (readOnly={true}).
 * - Các tab: Tổng quan, Năng lực, Gap, Học tập, Nhiệm vụ, Minh chứng, Đánh giá, Thành tựu.
 * - Cho phép Quản lý giao bài thực hành mới (/enterprise/tasks/new).
 * - Tuyệt đối không có nút giao khóa học hay thay đổi phân quyền tổ chức.
 */
export function TeamMemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState('overview');

  const { data: employee, isLoading: empLoading, isError: empError } = useEmployee(id || '');
  const { data: capData, isLoading: capLoading, isError: capError } = useEmployeeCapability(id || '');

  const isLoading = (empLoading || capLoading) && !employee && !capData;
  const isError = !isLoading && !employee && !capData && (empError || capError);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-6">
        <div className="h-6 w-32 bg-slate-100 animate-pulse rounded" />
        <div className="h-44 bg-slate-100 animate-pulse rounded-2xl" />
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (isError || (!employee && !capData)) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="size-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Không tìm thấy thành viên</h2>
        <p className="text-sm text-slate-500">
          Thành viên này không tồn tại hoặc không thuộc quyền quản lý của bạn.
        </p>
        <Link
          to="/enterprise/team/members"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Quay lại danh sách nhóm
        </Link>
      </div>
    );
  }

  const empRecord = capData?.employee || employee!;
  const run = capData ? toRun(capData) : null;

  // Build MemberDetail object for OverviewTab
  const memberDetail: MemberDetail = {
    id: empRecord.id,
    kind: 'member',
    fullName: undefined as unknown as string,
    email: empRecord.workEmail || '',
    roles: ['EMPLOYEE'],
    status: (empRecord.status as any) || 'ACTIVE',
    employeeCode: empRecord.employeeCode,
    departmentName: empRecord.departmentName,
    positionName: (empRecord as any).jobPositionName || (empRecord as any).positionName,
    jobGrade: (empRecord as any).jobGrade,
    jobGradeName: (empRecord as any).jobGradeName ?? (empRecord as any).jobGrade,
    directManagerName: (empRecord as any).directManagerName,
    joinedAt: empRecord.joinedAt,
    history: [],
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      <Link
        to="/enterprise/team/members"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="size-4" />
        <span>Quay lại danh sách thành viên</span>
      </Link>

      {/* Header */}
      <PageHeader
        title={empRecord.fullName}
        subtitle={[empRecord.employeeCode, empRecord.positionName, empRecord.departmentName, empRecord.workEmail]
          .filter(Boolean)
          .join(' · ')}
      >
        <StatusBadge
          label={MEMBER_STATUS_LABELS[memberDetail.status] ?? memberDetail.status}
          variant={MEMBER_STATUS_VARIANTS[memberDetail.status] ?? 'neutral'}
        />
        <Link
          to="/enterprise/tasks/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <ClipboardList className="size-3.5" />
          <span>Giao bài thực hành</span>
        </Link>
      </PageHeader>

      {/* Tabs */}
      <Tabs
        label="Hồ sơ nhân sự nhóm"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'overview', label: 'Tổng quan' },
          { id: 'competency', label: 'Năng lực' },
          { id: 'skill-gap', label: 'Khoảng trống' },
          { id: 'learning', label: 'Học tập', badge: capData?.learning?.length },
          { id: 'tasks', label: 'Nhiệm vụ', badge: capData?.tasks?.length },
          { id: 'evidence', label: 'Minh chứng', badge: (capData?.evidence?.length ?? 0) + (capData?.submissions?.length ?? 0) },
          { id: 'assessments', label: 'Đánh giá', badge: capData?.assessments?.length },
          { id: 'achievements', label: 'Thành tựu', badge: capData?.certificates?.length },
        ]}
      >
        {tab === 'overview' && <OverviewTab member={memberDetail} readOnly={true} />}
        {tab === 'competency' && capData && (
          <CompetencyTab rows={capData.competencies} hasRequirement={Boolean(run)} readOnly={true} />
        )}
        {tab === 'skill-gap' && (
          <SkillGapTab
            run={run}
            employeeId={empRecord.id}
            blocker={capData?.summary?.blocker}
            readOnly={true}
          />
        )}
        {tab === 'learning' && capData && (
          <LearningTab assignments={capData.learning} readOnly={true} />
        )}
        {tab === 'tasks' && (
          <TasksTab tasks={capData?.tasks} readOnly={true} />
        )}
        {tab === 'evidence' && (
          <EvidencesTab
            evidence={capData?.evidence ?? []}
            submissions={capData?.submissions ?? []}
            readOnly={true}
          />
        )}
        {tab === 'assessments' && (
          <AssessmentsTab attempts={capData?.assessments} readOnly={true} />
        )}
        {tab === 'achievements' && (
          <AchievementsTab certificates={capData?.certificates} readOnly={true} />
        )}
      </Tabs>
    </div>
  );
}
