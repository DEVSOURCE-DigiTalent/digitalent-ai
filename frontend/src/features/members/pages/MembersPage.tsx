import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { DataTable, PageContainer, PageHeader, StatusBadge, type Column } from '@/components/shared';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import { useMembers } from '@/hooks/use-members';
import { PERMISSIONS } from '@/hooks/use-permission';
import { ROLES } from '@/lib/roles';
import { assignableRoles } from '@/lib/role-policy';
import { formatDate } from '@/lib/utils';
import type { MemberListItem, MemberStatus } from '@/services/member.service';
import { InviteMembersModal } from '../components/InviteMembersModal';
import { MEMBER_STATUS_LABELS, MEMBER_STATUS_VARIANTS, roleLabel, rolesLabel } from '../member-labels';

const PAGE_SIZE = 15;
const ENTERPRISE_ROLES = [ROLES.OWNER, ROLES.MANAGER, ROLES.EMPLOYEE];
const JOB_GRADES = [
  { code: 'G1', label: 'G1 - Nhân viên' },
  { code: 'G2', label: 'G2 - Phó phòng' },
  { code: 'G3', label: 'G3 - Trưởng phòng' },
];

const SELECT_CLASS =
  'px-2.5 py-1.5 text-xs bg-ent-raised border border-ent-line rounded-lg text-ent-fg focus:outline-none focus:ring-1 focus:ring-ent-accent';

/**
 * OW-02: Employee List (UI/UX spec v2.1 §3.2, §10).
 * Redesigned with Enterprise "Mực & Giấy" theme tokens, width="wide", clean toolbar and data table.
 */
export function MembersPage() {
  const navigate = useNavigate();
  const user = useCurrentUser((s) => s.user)!;
  const canInvite =
    useCurrentUser((s) => s.hasPermission)(PERMISSIONS.USER_CREATE) &&
    assignableRoles(user.roles).length > 0;

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<MemberStatus | ''>('');
  const [role, setRole] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [jobPositionId, setJobPositionId] = useState('');
  const [jobGrade, setJobGrade] = useState('');
  const [page, setPage] = useState(1);
  const [inviting, setInviting] = useState(false);

  const departments = useDepartments({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];
  const positions = useJobPositions({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];

  const { data, isLoading, isError } = useMembers({
    pageIndex: page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    role: role || undefined,
    departmentId: departmentId || undefined,
    jobPositionId: jobPositionId || undefined,
    jobGrade: jobGrade || undefined,
  });

  const seats = user.subscription?.seatLimit;

  const columns: Column<MemberListItem>[] = [
    {
      key: 'name',
      header: 'Thành viên',
      cell: (m) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--ent-accent-soft)] text-xs font-semibold text-ent-accent">
            {m.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-ent-fg truncate max-w-[130px] xl:max-w-[180px]">{m.fullName}</p>
            <p className="text-xs text-ent-fg-3 truncate max-w-[130px] xl:max-w-[180px]">
              {m.employeeCode ? `${m.employeeCode} · ` : ''}{m.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò',
      cell: (m) => (
        <span className="inline-flex items-center rounded-md bg-ent-raised border border-ent-line px-2 py-0.5 text-xs font-medium text-ent-fg-2 whitespace-nowrap">
          {rolesLabel(m.roles)}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Phòng ban',
      cell: (m) => (
        <span className="text-ent-fg-2 whitespace-nowrap text-xs">{m.departmentName ?? '—'}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: 'position',
      header: 'Vị trí & Cấp bậc',
      cell: (m) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap text-xs">
          <span className="text-ent-fg truncate max-w-[120px] xl:max-w-[160px]">{m.positionName ?? '—'}</span>
          {m.jobGrade && (
            <span className="inline-flex items-center rounded bg-[var(--ent-level-2)]/15 border border-[var(--ent-level-2)]/30 px-1 py-0.2 text-[11px] font-medium text-[var(--ent-level-2)]">
              {m.jobGrade}
            </span>
          )}
        </div>
      ),
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (m) => (
        <StatusBadge
          label={MEMBER_STATUS_LABELS[m.status]}
          variant={MEMBER_STATUS_VARIANTS[m.status]}
        />
      ),
    },
    {
      key: 'capability',
      header: 'Năng lực số',
      cell: (m) =>
        m.coveragePercent !== undefined && m.coveragePercent !== null ? (
          <div className="flex items-center gap-1.5 whitespace-nowrap text-xs">
            <span className="font-medium tabular-nums text-ent-fg">
              {m.coveragePercent.toFixed(1)}%
            </span>
            {m.highGapCount && m.highGapCount > 0 ? (
              <span className="inline-flex items-center rounded bg-[var(--ent-bad-soft)] px-1.5 py-0.5 text-[11px] font-medium text-ent-bad">
                {m.highGapCount} khoảng trống cao
              </span>
            ) : null}
          </div>
        ) : (
          <span className="text-xs text-ent-fg-3 whitespace-nowrap">Chưa đánh giá</span>
        ),
      hideOnMobile: true,
    },
    {
      key: 'learning',
      header: 'Học tập',
      cell: (m) =>
        m.activeCourses !== undefined ? (
          <span className="text-xs text-ent-fg-2 whitespace-nowrap">
            {m.activeCourses > 0 ? `${m.activeCourses} khóa đang học` : 'Chưa có khóa'}
          </span>
        ) : (
          '—'
        ),
      className: 'hidden 2xl:table-cell',
    },
    {
      key: 'joined',
      header: 'Tham gia',
      cell: (m) => (
        <span className="text-xs text-ent-fg-3 whitespace-nowrap tabular-nums">
          {m.kind === 'invitation' ? `Mời ${formatDate(m.invitedAt)}` : formatDate(m.joinedAt)}
        </span>
      ),
      className: 'hidden 2xl:table-cell',
    },
  ];

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Thành viên"
        description={
          seats !== undefined && user.subscription?.seatsUsed !== undefined
            ? `${user.subscription.seatsUsed} / ${seats} ghế đang dùng · Quản lý nhân sự, vai trò và phân bố năng lực`
            : 'Những người có quyền truy cập tổ chức'
        }
        actions={
          canInvite && (
            <button
              type="button"
              onClick={() => setInviting(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-ent-primary text-ent-on-primary rounded-lg hover:opacity-90 transition-opacity"
            >
              <UserPlus className="size-4" aria-hidden="true" />
              Mời thành viên
            </button>
          )
        }
      />

      {isError && (
        <p role="alert" className="text-sm text-ent-bad">
          Không tải được danh sách thành viên.
        </p>
      )}

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        keyExtractor={(m) => m.id}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={resetPage(setSearch)}
        searchPlaceholder="Tìm theo tên, email hoặc mã nhân viên"
        onRowClick={(m) => navigate(`/enterprise/members/${m.id}`)}
        emptyTitle="Chưa có thành viên nào"
        emptyDescription="Mời nhân viên để họ bắt đầu học và được đánh giá năng lực."
        filters={
          <>
            <select
              aria-label="Lọc theo phòng ban"
              value={departmentId}
              onChange={(e) => resetPage(setDepartmentId)(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="">Mọi phòng ban</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Lọc theo vị trí"
              value={jobPositionId}
              onChange={(e) => resetPage(setJobPositionId)(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="">Mọi vị trí</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Lọc theo Cấp bậc"
              value={jobGrade}
              onChange={(e) => resetPage(setJobGrade)(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="">Mọi Cấp bậc</option>
              {JOB_GRADES.map((g) => (
                <option key={g.code} value={g.code}>
                  {g.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Lọc theo vai trò"
              value={role}
              onChange={(e) => resetPage(setRole)(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="">Mọi vai trò</option>
              {ENTERPRISE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </select>
            <select
              aria-label="Lọc theo trạng thái"
              value={status}
              onChange={(e) => resetPage(setStatus)(e.target.value as MemberStatus | '')}
              className={SELECT_CLASS}
            >
              <option value="">Mọi trạng thái</option>
              {(Object.keys(MEMBER_STATUS_LABELS) as MemberStatus[]).map((s) => (
                <option key={s} value={s}>
                  {MEMBER_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </>
        }
        pageInfo={{ page, pageSize: PAGE_SIZE, total: data?.totalItems ?? 0, onPageChange: setPage }}
      />

      <InviteMembersModal open={inviting} onClose={() => setInviting(false)} />
    </PageContainer>
  );
}
