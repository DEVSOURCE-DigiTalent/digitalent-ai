import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useId, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, ChevronRight, CircleAlert, Mail, ShieldCheck, UserRoundCog } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMember } from '@/hooks/use-members';
import { useEmployeeCapability } from '@/hooks/use-workforce';
import { useLearningNeeds } from '@/hooks/use-skill-gaps';
import { EmployeeLearningPlan } from '@/features/intelligence/components/EmployeeLearningPlan';
import { PERMISSIONS } from '@/hooks/use-permission';
import { competencyCodeMap } from '@/lib/competency-levels';
import { assignableRoles, canManageMember } from '@/lib/role-policy';
import { ConfirmLevelDialog } from '@/features/intelligence/components/ConfirmLevelDialog';
import type { SkillGapRunDetail, EmployeeLearningNeeds } from '@/services/intelligence.service';
import { levelLabel } from '@/lib/competency-levels';
import { formatDate } from '@/lib/utils';
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

function toRun(capability: EmployeeCapability, profile?: EmployeeLearningNeeds): SkillGapRunDetail | null {
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
    // The current position can contain competencies absent from the old snapshot.
    items: profile ? profile.domains.flatMap((domain) => (domain.competencies ?? []).map((row) => ({
      competencyId: row.competencyId,
      competencyCode: '', competencyName: row.name,
      categoryName: domain.name, categorySortOrder: domain.number,
      requiredLevel: row.requiredLevel, currentLevel: row.currentLevel,
      gapSteps: Math.max(0, row.requiredLevel - (row.currentLevel ?? 0)),
      weightPercent: 0, mandatory: false, mandatoryMultiplier: 1, priorityScore: 0, severity: null,
    }))) : skillGap.items,
  };
}

export function OwnerMemberDetailPage() {
  useUiLanguage();
  const { id } = useParams();
  const user = useCurrentUser((s) => s.user)!;
  const can = useCurrentUser((s) => s.hasPermission);

  const {
    data: member,
    isLoading: memberLoading,
    isError: memberError,
  } = useMember(id);
  const employeeId = member?.employeeId ?? undefined;
  const learningNeeds = useLearningNeeds({ employeeId, pageIndex: 1, pageSize: 1 }, !!employeeId);
  const learningProfile = learningNeeds.data?.items[0];
  const {
    data: capData,
    isLoading: capLoading,
    isError: capError,
    refetch: refetchCap,
  } = useEmployeeCapability(employeeId);

  const [tab, setTab] = useState<string>('overview');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [confirming, setConfirming] = useState(false);
  const [domainNumber, setDomainNumber] = useState<number>();
  const tabId = useId();

  if (memberLoading || capLoading) {
    return <div className="po-owner -m-4 md:-m-6 min-h-screen" style={PULSE_TOKENS}><PageLoading label={translateUi("Đang tải thông tin thành viên")} variant="detail" /></div>;
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
          >{translateUi("Không tìm thấy thành viên")}</h2>
          <Link
            to="/enterprise/members"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold"
            style={{ color: 'var(--po-accent)' }}
          >
            <ArrowLeft className="size-3.5" />{translateUi(" Quay lại danh sách")}</Link>
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
  const canConfirm = can(PERMISSIONS.EVIDENCE_CREATE_MANUAL) && !isSelf && Boolean(learningProfile && ['MET', 'NEEDS_LEARNING'].includes(learningProfile.state));
  const run = capData ? toRun(capData, learningProfile) : null;

  const initials = member.fullName
    .split(' ')
    .slice(-2)
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
        <Link to="/enterprise/members" className="member-detail-back"><ArrowLeft size={16} />{translateUi(" Nhân sự")}</Link>
        <div className="member-detail-hero">
          <div className="member-detail-identity">
            <span className="member-detail-avatar" aria-hidden="true">{initials}</span>
            <div className="min-w-0">
              <p className="member-detail-eyebrow">{translateUi("HỒ SƠ NHÂN VIÊN")}</p>
              <h1>{member.fullName}</h1>
              <div className="member-detail-meta">
                <span className="member-detail-role"><ShieldCheck size={15} />{rolesLabel(member.roles)}</span>
                {member.employeeCode && <span>{member.employeeCode}</span>}
                <span className="member-detail-status" style={{ background: statusColor.bg, color: statusColor.fg, borderColor: statusColor.border }}>{translateUi(MEMBER_STATUS_LABELS[member.status])}</span>
              </div>
              <p className="member-detail-email"><Mail size={15} />{member.email}</p>
            </div>
          </div>
          <div className="member-detail-actions">
            {run && canConfirm && <button type="button" className="member-detail-button" onClick={() => setConfirming(true)}><BadgeCheck size={17} />{translateUi(" Xác nhận cải thiện")}</button>}
            {canChangeRole && <button type="button" className="member-detail-button" onClick={() => setDialog('role')}><UserRoundCog size={17} />{translateUi(" Đổi vai trò")}</button>}
            {canEdit && <button type="button" className="member-detail-button member-detail-button--primary" onClick={() => setDialog('placement')}><BriefcaseBusiness size={17} />{translateUi(" Phòng ban & vị trí")}</button>}
            {canToggle && member.status === 'ACTIVE' && <button type="button" className="member-detail-button member-detail-button--danger" onClick={() => setDialog('deactivate')}>{translateUi("Vô hiệu hóa")}</button>}
            {canToggle && member.status === 'INACTIVE' && <button type="button" className="member-detail-button member-detail-button--primary" onClick={() => setDialog('reactivate')}>{translateUi("Kích hoạt lại")}</button>}
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
            <div><strong>{translateUi("Chưa có hồ sơ nhân viên")}</strong><p>{translateUi("Gán phòng ban để bắt đầu theo dõi năng lực và học tập.")}</p></div>
            {canEdit && <button type="button" onClick={() => setDialog('placement')}>{translateUi("Thiết lập hồ sơ ")}<ChevronRight size={16} /></button>}
          </div>
        )}
        {member.status === 'INACTIVE' && (
          <div className="member-detail-notice member-detail-notice--inactive" role="status"><span className="member-detail-notice-icon"><CircleAlert size={20} /></span><div><strong>{translateUi("Tài khoản đã vô hiệu hóa")}</strong><p>{member.deactivatedReason || 'Hồ sơ và lịch sử vẫn được lưu trữ.'}</p></div></div>
        )}

        {/* Tab bar */}
        {availableTabs.length > 1 && <div className="member-detail-tabs" role="tablist" aria-label={translateUi("Nội dung hồ sơ")}>
          {availableTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`${tabId}-${t.id}`}
              aria-controls={`${tabId}-panel`}
              aria-selected={tab === t.id}
              tabIndex={tab === t.id ? 0 : -1}
              onKeyDown={(event) => {
                const index = availableTabs.findIndex((item) => item.id === t.id);
                const next = event.key === 'ArrowRight' ? (index + 1) % availableTabs.length : event.key === 'ArrowLeft' ? (index - 1 + availableTabs.length) % availableTabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? availableTabs.length - 1 : -1;
                if (next < 0) return;
                event.preventDefault(); setTab(availableTabs[next].id);
                document.getElementById(`${tabId}-${availableTabs[next].id}`)?.focus();
              }}
              onClick={() => setTab(t.id)}
              className={tab === t.id ? 'is-active' : ''}
            >
              {translateUi(t.label)}
            </button>
          ))}
        </div>}

        {/* Tab content */}
        <section key={tab} className={`member-detail-content member-detail-content--${tab}`} role="tabpanel" id={`${tabId}-panel`} aria-labelledby={availableTabs.length > 1 ? `${tabId}-${tab}` : undefined}>
          {capError && ['learning', 'assessments', 'tasks', 'evidence', 'achievements'].includes(tab) && <div className="member-detail-notice" role="alert"><CircleAlert size={20} /><div><strong>{translateUi("Không tải được lịch sử nhân viên")}</strong><p>{translateUi("Thử lại để xem dữ liệu mới nhất.")}</p></div><button type="button" onClick={() => void refetchCap()}>{translateUi("Thử lại")}</button></div>}
          {tab === 'overview' && <><OverviewTab member={member} />{employeeId && <div className="member-profile-shortcuts"><Link to={`/enterprise/setup${learningProfile?.positionId ? `?positionId=${encodeURIComponent(learningProfile.positionId)}` : ''}`}><BriefcaseBusiness size={21} /><div><strong>{translateUi("Chuẩn vị trí")}</strong><span>{learningProfile?.positionName ?? member.positionName ?? 'Chưa thiết lập vị trí'}</span></div><ChevronRight size={16} /></Link><Link to={`/enterprise/skill-gap/${employeeId}`}><BadgeCheck size={21} /><div><strong>{translateUi("Năng lực & khóa học")}</strong><span>{learningProfile?.state === 'MET' ? 'Đã đáp ứng chuẩn' : learningProfile?.state === 'NEEDS_LEARNING' ? 'Xem năng lực cần bổ sung' : learningProfile?.state === 'NO_STANDARD' ? translateUi('Chưa có chuẩn vị trí') : translateUi('Chờ kết quả đánh giá')}</span></div><ChevronRight size={16} /></Link></div>}</>}
          {(tab === 'competency' || tab === 'skill-gap') && employeeId && <div className="member-live-capability">{learningNeeds.isLoading ? <p role="status">{translateUi("Đang đối chiếu với chuẩn vị trí…")}</p> : learningNeeds.isError ? <p role="alert">{translateUi("Không tải được kết quả năng lực. ")}<button type="button" onClick={() => void learningNeeds.refetch()}>{translateUi("Thử lại")}</button></p> : learningProfile && <EmployeeLearningPlan key={`${employeeId}-${tab}`} employee={learningProfile} embedded view={tab === 'competency' ? 'competencies' : 'gaps'} canConfirm={canConfirm} onConfirm={() => setConfirming(true)} onRefresh={() => void learningNeeds.refetch()} refreshing={learningNeeds.isFetching} onDomainChange={setDomainNumber} />}</div>}
          {tab === 'learning' && capData && (
            <LearningTab assignments={capData.learning} />
          )}
          {tab === 'assessments' && !capError && (
            <div className="member-assessment-stack">{learningProfile && <section className="member-overall-assessment"><header><h2>{translateUi("Đánh giá tổng thể")}</h2><span>{learningProfile.domains.some((domain) => domain.assessmentLevel != null) ? 'Kết quả đã công bố' : translateUi('Chờ đánh giá')}</span></header>{learningProfile.domains.length ? <div>{learningProfile.domains.map((domain) => <article key={domain.categoryId}><strong>{translateUi(domain.name)}</strong><span className={domain.assessmentLevel == null ? 'is-waiting' : ''}>{domain.assessmentLevel == null ? translateUi('Chờ đánh giá') : domain.assessmentLevel === 0 ? 'Chưa đạt cơ bản' : levelLabel(domain.assessmentLevel)}</span>{domain.assessmentReviewedAt && <small>{formatDate(domain.assessmentReviewedAt)}</small>}</article>)}</div> : <p>{translateUi("Thiết lập chuẩn vị trí để theo dõi đánh giá theo lĩnh vực.")}</p>}</section>}<AssessmentsTab attempts={capData?.assessments} title={translateUi("Đánh giá khóa học")} /></div>
          )}
          {tab === 'tasks' && !capError && (
            <TasksTab
              tasks={capData?.tasks}
              competencyCodes={competencyCodeMap(capData?.competencies)}
            />
          )}
          {tab === 'evidence' && !capError && (
            <EvidencesTab
              evidence={capData?.evidence ?? []}
              submissions={capData?.submissions ?? []}
            />
          )}
          {tab === 'achievements' && !capError && (
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
          initialCategoryNumber={domainNumber}
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
