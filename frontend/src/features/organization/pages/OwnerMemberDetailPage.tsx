import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
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
    return (
      <div
        className="po-owner -m-4 md:-m-6 min-h-screen flex items-center justify-center"
        style={{ ...PULSE_TOKENS, background: 'var(--po-canvas)' }}
      >
        <p className="text-sm" style={{ color: 'var(--po-muted)' }}>
          Đang tải thông tin thành viên…
        </p>
      </div>
    );
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
      className="po-owner -m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'var(--po-canvas)',
        backgroundImage:
          'radial-gradient(ellipse 80% 55% at 50% 0%, #cfe2e2 0%, transparent 65%)',
      }}
    >
      {/* ── Hero ── */}
      <section className="px-4 md:px-6 pt-6 pb-4 mx-auto" style={{ maxWidth: 1220 }}>
        <Link
          to="/enterprise/members"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold mb-4 transition-opacity hover:opacity-70"
          style={{ color: 'var(--po-muted)' }}
        >
          <ArrowLeft className="size-3" /> Thành viên
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <span
            className="grid size-14 shrink-0 place-items-center rounded-2xl text-lg font-bold"
            style={{ background: 'var(--po-soft)', color: 'var(--po-accent)' }}
          >
            {initials}
          </span>
          <div className="flex-1 min-w-0">
            <h1
              className="text-2xl font-bold truncate"
              style={{ color: 'var(--po-ink)', letterSpacing: '-0.04em' }}
            >
              {member.fullName}
            </h1>
            <p
              className="text-xs mt-0.5 truncate"
              style={{ color: 'var(--po-muted)' }}
            >
              {[
                member.employeeCode,
                rolesLabel(member.roles),
                member.departmentName,
                member.positionName,
                member.email,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <span
              className="rounded-full border px-2.5 py-1 text-[11px] font-bold"
              style={{
                background: statusColor.bg,
                color: statusColor.fg,
                borderColor: statusColor.border,
              }}
            >
              {MEMBER_STATUS_LABELS[member.status]}
            </span>
            {run && canConfirm && (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="inline-flex items-center gap-1.5 rounded-[11px] border px-3 py-2 text-xs font-bold transition-transform hover:-translate-y-0.5"
                style={{
                  borderColor: 'var(--po-line)',
                  color: 'var(--po-ink)',
                }}
              >
                <BadgeCheck className="size-4" style={{ color: '#0d9488' }} />
                Xác nhận mức
              </button>
            )}
            {canChangeRole && (
              <button
                type="button"
                onClick={() => setDialog('role')}
                className="rounded-[11px] border px-3 py-2 text-xs font-bold transition-transform hover:-translate-y-0.5"
                style={{
                  borderColor: 'var(--po-line)',
                  color: 'var(--po-ink)',
                }}
              >
                Đổi vai trò
              </button>
            )}
            {canEdit && (
              <button
                type="button"
                onClick={() => setDialog('placement')}
                className="rounded-[11px] border px-3 py-2 text-xs font-bold transition-transform hover:-translate-y-0.5"
                style={{
                  borderColor: 'var(--po-line)',
                  color: 'var(--po-ink)',
                }}
              >
                Phòng ban & vị trí
              </button>
            )}
            {canToggle && member.status === 'ACTIVE' && (
              <button
                type="button"
                onClick={() => setDialog('deactivate')}
                className="rounded-[11px] border px-3 py-2 text-xs font-bold transition-transform hover:-translate-y-0.5"
                style={{
                  borderColor: '#fecaca',
                  color: '#dc2626',
                }}
              >
                Vô hiệu hóa
              </button>
            )}
            {canToggle && member.status === 'INACTIVE' && (
              <button
                type="button"
                onClick={() => setDialog('reactivate')}
                className="rounded-[11px] border px-3 py-2 text-xs font-bold transition-transform hover:-translate-y-0.5"
                style={{
                  borderColor: '#bbf7d0',
                  color: '#16a34a',
                }}
              >
                Kích hoạt lại
              </button>
            )}
            {member.kind === 'invitation' && can(PERMISSIONS.USER_CREATE) && (
              <InvitationActions member={member} />
            )}
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="px-4 md:px-6 pb-6 mx-auto" style={{ maxWidth: 1220 }}>
        {/* Alerts */}
        {member.kind === 'member' && !employeeId && (
          <div
            className="rounded-[11px] border p-4 text-xs mb-4"
            style={{
              borderColor: '#fdddb6',
              background: '#fff7ed',
              color: '#c2410c',
            }}
          >
            Thành viên này chưa có hồ sơ nhân viên nên chưa có dữ liệu năng
            lực và học tập.
            {canEdit && ' Chọn "Phòng ban & vị trí" để tạo hồ sơ.'}
          </div>
        )}
        {member.status === 'INACTIVE' && (
          <div
            className="rounded-[11px] border p-4 text-xs mb-4"
            style={{
              borderColor: '#fecaca',
              background: '#fef2f2',
              color: '#dc2626',
            }}
          >
            Thành viên này đã bị vô hiệu hóa
            {member.deactivatedReason
              ? `: ${member.deactivatedReason}`
              : ''}
            . Hồ sơ năng lực và lịch sử vẫn được lưu trữ.
          </div>
        )}

        {/* Tab bar */}
        <div
          className="flex gap-1 overflow-x-auto rounded-xl border p-1 mb-4"
          style={{
            borderColor: 'var(--po-line)',
            background: 'var(--po-surface)',
          }}
        >
          {availableTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="rounded-lg px-3 py-2 text-xs font-bold whitespace-nowrap transition-colors"
              style={
                tab === t.id
                  ? {
                      background: 'var(--po-soft)',
                      color: 'var(--po-accent)',
                    }
                  : {
                      color: 'var(--po-muted)',
                    }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <section
          className="rounded-[22px] border p-6"
          style={{
            borderColor: 'var(--po-line)',
            background: 'var(--po-surface)',
            boxShadow: '0 10px 35px rgba(29,48,102,.025)',
          }}
        >
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
