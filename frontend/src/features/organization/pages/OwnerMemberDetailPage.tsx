import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, ChevronRight, CircleAlert, Mail, ShieldCheck, UserRoundCog } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMember } from '@/hooks/use-members';
import { useEmployeeCapability } from '@/hooks/use-workforce';
import { PERMISSIONS } from '@/hooks/use-permission';
import { competencyCodeMap } from '@/lib/competency-levels';
import { assignableRoles, canManageMember } from '@/lib/role-policy';
import { ConfirmLevelDialog } from '@/features/intelligence/components/ConfirmLevelDialog';
import type { SkillGapRunDetail } from '@/services/intelligence.service';
import type { EmployeeCapability } from '@/services/workforce.service';
import {
  ChangeRoleModal,
  DeactivateMemberDialog,
  InvitationActions,
  PlacementModal,
  ReactivateMemberDialog,
} from '@/features/members/components/MemberDialogs';
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
import {
  MEMBER_STATUS_LABELS,
  rolesLabel,
} from '@/features/members/member-labels';
import { PULSE_TOKENS } from '../owner-theme';
import { PageLoading } from '@/components/shared/LoadingState';
import './owner-member-detail.css';

type Dialog = 'role' | 'placement' | 'deactivate' | 'reactivate' | null;

const TABS = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'competency', label: 'Năng lực' },
  { id: 'skill-gap', label: 'Khoảng trống' },
  { id: 'learning', label: 'Học tập' },
  { id: 'assessments', label: 'Đánh giá' },
  { id: 'tasks', label: 'Nhiệm vụ' },
  { id: 'evidence', label: 'Minh chứng' },
  { id: 'achievements', label: 'Thành tựu' },
] as const;

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

export function OwnerMemberDetailPage() {
  const { id } = useParams();
  const user = useCurrentUser((s) => s.user)!;
  const can = useCurrentUser((s) => s.hasPermission);

  const {
    data: member,
    isLoading: memberLoading,
    isError: memberError,
  } = useMember(id);
  const employeeId = member?.employeeId ?? undefined;
  const {
    data: capData,
    isLoading: capLoading,
    refetch: refetchCap,
  } = useEmployeeCapability(employeeId);

  const [tab, setTab] = useState<string>('overview');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [confirming, setConfirming] = useState(false);

  if (memberLoading || capLoading) {
    return <div className="po-owner -m-4 md:-m-6 min-h-screen" style={PULSE_TOKENS}><PageLoading label="Đang tải thông tin thành viên" variant="detail" /></div>;
  }

  if (memberError || !member) {
    return (
      <div
        className="po-owner -m-4 md:-m-6 min-h-screen px-4 md:px-6 py-20"
        style={{ ...PULSE_TOKENS, background: 'var(--po-canvas)' }}
      >
        <div className="mx-auto text-center" style={{ maxWidth: 500 }}>
          <div
            className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl text-2xl"
            style={{ background: 'var(--po-soft)', color: 'var(--po-accent)' }}
          >
            ✕
          </div>
          <h2
            className="text-xl font-semibold"
            style={{ color: 'var(--po-ink)' }}
          >
            Không tìm thấy thành viên
          </h2>
          <Link
            to="/enterprise/members"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold"
            style={{ color: 'var(--po-accent)' }}
          >
            <ArrowLeft className="size-3.5" /> Quay lại danh sách
          </Link>
        </div>
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
  const canToggle =
    can(PERMISSIONS.USER_LOCK_UNLOCK) &&
    manageable &&
    member.kind === 'member' &&
    !isSelf;
  const canConfirm = can(PERMISSIONS.EVIDENCE_CREATE_MANUAL);
  const run = capData ? toRun(capData) : null;

  const initials = member.fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const statusColor =
    member.status === 'ACTIVE'
      ? { bg: '#ecfdf5', fg: '#16a34a', border: '#bbf7d0' }
      : member.status === 'PENDING'
        ? { bg: '#fef3c7', fg: '#d97706', border: '#fdddb6' }
        : { bg: '#fee2e2', fg: '#dc2626', border: '#fecaca' };

  const availableTabs = employeeId ? TABS : [TABS[0]];

  return (
    <div
      className="po-owner member-detail-page -m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'var(--po-canvas)',
        backgroundImage:
          'radial-gradient(ellipse 80% 55% at 50% 0%, var(--po-glow) 0%, transparent 65%)',
      }}
    >
      {/* ── Header ── */}
      <section className="member-detail-container pt-7 pb-5">
        <Link to="/enterprise/members" className="member-detail-back"><ArrowLeft size={16} /> Nhân sự</Link>
        <div className="member-detail-hero">
          <div className="member-detail-identity">
            <span className="member-detail-avatar" aria-hidden="true">{initials}</span>
            <div className="min-w-0">
              <p className="member-detail-eyebrow">HỒ SƠ THÀNH VIÊN</p>
              <h1>{member.fullName}</h1>
              <div className="member-detail-meta">
                <span className="member-detail-role"><ShieldCheck size={15} />{rolesLabel(member.roles)}</span>
                {member.employeeCode && <span>{member.employeeCode}</span>}
                <span className="member-detail-status" style={{ background: statusColor.bg, color: statusColor.fg, borderColor: statusColor.border }}>{MEMBER_STATUS_LABELS[member.status]}</span>
              </div>
              <p className="member-detail-email"><Mail size={15} />{member.email}</p>
            </div>
          </div>
          <div className="member-detail-actions">
            {run && canConfirm && <button type="button" className="member-detail-button" onClick={() => setConfirming(true)}><BadgeCheck size={17} /> Xác nhận mức</button>}
            {canChangeRole && <button type="button" className="member-detail-button" onClick={() => setDialog('role')}><UserRoundCog size={17} /> Đổi vai trò</button>}
            {canEdit && <button type="button" className="member-detail-button member-detail-button--primary" onClick={() => setDialog('placement')}><BriefcaseBusiness size={17} /> Phòng ban & vị trí</button>}
            {canToggle && member.status === 'ACTIVE' && <button type="button" className="member-detail-button member-detail-button--danger" onClick={() => setDialog('deactivate')}>Vô hiệu hóa</button>}
            {canToggle && member.status === 'INACTIVE' && <button type="button" className="member-detail-button member-detail-button--primary" onClick={() => setDialog('reactivate')}>Kích hoạt lại</button>}
            {member.kind === 'invitation' && can(PERMISSIONS.USER_CREATE) && <InvitationActions member={member} />}
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="member-detail-container pb-10">
        {/* Alerts */}
        {member.kind === 'member' && !employeeId && (
          <div className="member-detail-notice" role="status">
            <span className="member-detail-notice-icon"><CircleAlert size={20} /></span>
            <div><strong>Chưa có hồ sơ nhân viên</strong><p>Gán phòng ban để bắt đầu theo dõi năng lực và học tập.</p></div>
            {canEdit && <button type="button" onClick={() => setDialog('placement')}>Thiết lập hồ sơ <ChevronRight size={16} /></button>}
          </div>
        )}
        {member.status === 'INACTIVE' && (
          <div className="member-detail-notice member-detail-notice--inactive" role="status"><span className="member-detail-notice-icon"><CircleAlert size={20} /></span><div><strong>Tài khoản đã vô hiệu hóa</strong><p>{member.deactivatedReason || 'Hồ sơ và lịch sử vẫn được lưu trữ.'}</p></div></div>
        )}

        {/* Tab bar */}
        {availableTabs.length > 1 && <div className="member-detail-tabs" role="tablist" aria-label="Nội dung hồ sơ">
          {availableTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={tab === t.id ? 'is-active' : ''}
            >
              {t.label}
            </button>
          ))}
        </div>}

        {/* Tab content */}
        <section className="member-detail-content">
          {tab === 'overview' && <OverviewTab member={member} />}
          {tab === 'competency' && capData && (
            <CompetencyTab
              rows={capData.competencies}
              hasRequirement={Boolean(run)}
            />
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
            <TasksTab
              tasks={capData?.tasks}
              competencyCodes={competencyCodeMap(capData?.competencies)}
            />
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
        </section>
      </div>

      {/* Dialogs */}
      {dialog === 'role' && (
        <ChangeRoleModal member={member} open onClose={() => setDialog(null)} />
      )}
      {dialog === 'placement' && (
        <PlacementModal member={member} open onClose={() => setDialog(null)} />
      )}
      {dialog === 'deactivate' && (
        <DeactivateMemberDialog
          member={member}
          open
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'reactivate' && (
        <ReactivateMemberDialog
          member={member}
          open
          onClose={() => setDialog(null)}
        />
      )}
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
