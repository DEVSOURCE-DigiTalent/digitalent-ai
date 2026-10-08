import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
import { PageHeader, StatusBadge, Tabs } from '@/components/shared';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMember } from '@/hooks/use-members';
import { useEmployeeCapability } from '@/hooks/use-workforce';
import { PERMISSIONS } from '@/hooks/use-permission';
import { competencyCodeMap } from '@/lib/competency-levels';
import { assignableRoles, canManageMember } from '@/lib/role-policy';
import { SECONDARY_BUTTON } from '@/features/onboarding/components/styles';
import { ConfirmLevelDialog } from '@/features/intelligence/components/ConfirmLevelDialog';
import type { SkillGapRunDetail } from '@/services/intelligence.service';
import type { EmployeeCapability } from '@/services/workforce.service';
import {
  ChangeRoleModal,
  DeactivateMemberDialog,
  InvitationActions,
  PlacementModal,
  ReactivateMemberDialog,
} from '../components/MemberDialogs';
import {
  OverviewTab,
  CompetencyTab,
  SkillGapTab,
  LearningTab,
  AssessmentsTab,
  TasksTab,
  EvidencesTab,
  AchievementsTab,
} from '../components/employee-tabs';
import { MEMBER_STATUS_LABELS, MEMBER_STATUS_VARIANTS } from '../member-labels';

type Dialog = 'role' | 'placement' | 'deactivate' | 'reactivate' | null;

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
 * OW-03: Employee Detail (UI/UX spec v2.1 §3.2, §10).
 * Merges ADM-03 MemberDetailPage with LCA-09 EmployeeCapabilityPage:
 * - 8 Tabs: Overview · Competency · Skill gap · Learning · Assessments · Tasks · Evidence · Achievements
 * - Owner actions: Change role, placement, manual competency confirmation, deactivation/reactivation.
 */
export function MemberDetailPage() {
  const { id } = useParams();
  const user = useCurrentUser((s) => s.user)!;
  const can = useCurrentUser((s) => s.hasPermission);

  const { data: member, isLoading: memberLoading, isError: memberError } = useMember(id);
  // Invitations and accounts without an employee profile have no capability data to load.
  const employeeId = member?.employeeId ?? undefined;
  const { data: capData, isLoading: capLoading, refetch: refetchCap } = useEmployeeCapability(employeeId);

  const [tab, setTab] = useState('overview');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [confirming, setConfirming] = useState(false);

  if (memberLoading || capLoading) {
    return <p className="text-sm text-slate-500">Đang tải thông tin thành viên…</p>;
  }

  if (memberError || !member) {
    return (
      <div role="alert" className="grid gap-3">
        <p className="text-sm text-red-600">Không tìm thấy thành viên này.</p>
        <Link to="/enterprise/members" className="text-sm font-medium text-primary-700 underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const manageable = canManageMember(user.roles, member.roles);
  const isSelf = member.id === user.id;
  const canChangeRole =
    can(PERMISSIONS.ROLE_ASSIGN_BUSINESS) &&
    manageable &&
    member.kind === 'member' &&
    member.status !== 'INACTIVE' &&
    assignableRoles(user.roles).length > 0;
  const canEdit =
    can(PERMISSIONS.USER_UPDATE) &&
    manageable &&
    member.kind === 'member' &&
    member.status !== 'INACTIVE';
  const canToggle = can(PERMISSIONS.USER_LOCK_UNLOCK) && manageable && member.kind === 'member' && !isSelf;
  const canConfirm = can(PERMISSIONS.EVIDENCE_CREATE_MANUAL);

  const run = capData ? toRun(capData) : null;

  return (
    <div className="space-y-6">
      <Link
        to="/enterprise/members"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Thành viên
      </Link>

      <PageHeader
        title={member.fullName}
        subtitle={[member.employeeCode, member.positionName, member.departmentName, member.email]
          .filter(Boolean)
          .join(' · ')}
      >
        <StatusBadge
          label={MEMBER_STATUS_LABELS[member.status]}
          variant={MEMBER_STATUS_VARIANTS[member.status]}
        />
        {run && canConfirm && (
          <button type="button" onClick={() => setConfirming(true)} className={SECONDARY_BUTTON}>
            <BadgeCheck className="size-4 text-teal-600" aria-hidden="true" />
            Xác nhận mức năng lực
          </button>
        )}
        {canChangeRole && (
          <button type="button" onClick={() => setDialog('role')} className={SECONDARY_BUTTON}>
            Đổi vai trò
          </button>
        )}
        {canEdit && (
          <button type="button" onClick={() => setDialog('placement')} className={SECONDARY_BUTTON}>
            Phòng ban & vị trí
          </button>
        )}
        {canToggle && member.status === 'ACTIVE' && (
          <button type="button" onClick={() => setDialog('deactivate')} className={SECONDARY_BUTTON}>
            Vô hiệu hóa
          </button>
        )}
        {canToggle && member.status === 'INACTIVE' && (
          <button type="button" onClick={() => setDialog('reactivate')} className={SECONDARY_BUTTON}>
            Kích hoạt lại
          </button>
        )}
        {member.kind === 'invitation' && can(PERMISSIONS.USER_CREATE) && (
          <InvitationActions member={member} />
        )}
      </PageHeader>

      {member.kind === 'member' && !employeeId && (
        <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Thành viên này chưa có hồ sơ nhân viên nên chưa có dữ liệu năng lực và học tập.
          {canEdit && ' Chọn "Phòng ban & vị trí" để tạo hồ sơ.'}
        </p>
      )}

      {member.status === 'INACTIVE' && (
        <p
          role="status"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          Thành viên này đã bị vô hiệu hóa{member.deactivatedReason ? `: ${member.deactivatedReason}` : ''}.
          Hồ sơ năng lực và lịch sử hoạt động vẫn được lưu trữ nguyên vẹn.
        </p>
      )}

      <Tabs
        label="Hồ sơ nhân sự toàn diện"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'overview', label: 'Tổng quan' },
          ...(employeeId
            ? [
                { id: 'competency', label: 'Năng lực' },
                { id: 'skill-gap', label: 'Khoảng trống' },
                { id: 'learning', label: 'Học tập', badge: capData?.learning?.length },
                { id: 'assessments', label: 'Đánh giá', badge: capData?.assessments?.length },
                { id: 'tasks', label: 'Nhiệm vụ', badge: capData?.tasks?.length },
                { id: 'evidence', label: 'Minh chứng', badge: (capData?.evidence?.length ?? 0) + (capData?.submissions?.length ?? 0) },
                { id: 'achievements', label: 'Thành tựu', badge: capData?.certificates?.length },
              ]
            : []),
        ]}
      >
        {tab === 'overview' && <OverviewTab member={member} />}
        {tab === 'competency' && capData && (
          <CompetencyTab rows={capData.competencies} hasRequirement={Boolean(run)} />
        )}
        {tab === 'skill-gap' && employeeId && (
          <SkillGapTab
            run={run}
            employeeId={employeeId}
            blocker={capData?.summary?.blocker}
          />
        )}
        {tab === 'learning' && capData && (
          <LearningTab assignments={capData.learning} />
        )}
        {tab === 'assessments' && (
          <AssessmentsTab attempts={capData?.assessments} />
        )}
        {tab === 'tasks' && (
          <TasksTab tasks={capData?.tasks} competencyCodes={competencyCodeMap(capData?.competencies)} />
        )}
        {tab === 'evidence' && (
          <EvidencesTab
            evidence={capData?.evidence ?? []}
            submissions={capData?.submissions ?? []}
          />
        )}
        {tab === 'achievements' && (
          <AchievementsTab certificates={capData?.certificates} />
        )}
      </Tabs>

      {dialog === 'role' && <ChangeRoleModal member={member} open onClose={() => setDialog(null)} />}
      {dialog === 'placement' && <PlacementModal member={member} open onClose={() => setDialog(null)} />}
      {dialog === 'deactivate' && <DeactivateMemberDialog member={member} open onClose={() => setDialog(null)} />}
      {dialog === 'reactivate' && <ReactivateMemberDialog member={member} open onClose={() => setDialog(null)} />}

      {run && (
        <ConfirmLevelDialog
          run={run}
          open={confirming}
          onClose={() => setConfirming(false)}
          onConfirmed={() => {
            setConfirming(false);
            void refetchCap();
          }}
        />
      )}
    </div>
  );
}

