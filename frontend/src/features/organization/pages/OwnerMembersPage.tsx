import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import { useMembers } from '@/hooks/use-members';
import { useOrganizationOverview } from '@/hooks/use-organization';
import { PERMISSIONS } from '@/hooks/use-permission';
import { ROLES } from '@/lib/roles';
import { assignableRoles } from '@/lib/role-policy';
import type { MemberStatus } from '@/services/member.service';
import { InviteMembersModal } from '@/features/members/components/InviteMembersModal';
import { MEMBER_STATUS_LABELS } from '@/features/members/member-labels';
import { MemberCard } from '../components/MemberCard';

const PULSE_TOKENS = {
  '--po-canvas': '#f7f9fd',
  '--po-surface': '#fff',
  '--po-ink': '#172442',
  '--po-muted': '#62718d',
  '--po-accent': '#304bdf',
  '--po-accent-strong': '#203bbf',
  '--po-coral': '#ef735c',
  '--po-lime': '#c6ec78',
  '--po-line': '#dfe6f3',
  '--po-soft': '#eef2ff',
  '--po-tint': '#edf1ff',
  '--po-warm': '#f1816b',
} as React.CSSProperties;

const PAGE_SIZE = 15;
const ENTERPRISE_ROLES = [ROLES.OWNER, ROLES.MANAGER, ROLES.EMPLOYEE];
const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Chủ sở hữu',
  MANAGER: 'Quản lý',
  EMPLOYEE: 'Nhân viên',
};

export function OwnerMembersPage() {
  const navigate = useNavigate();
  const user = useCurrentUser((s) => s.user)!;
  const canInvite =
    useCurrentUser((s) => s.hasPermission)(PERMISSIONS.USER_CREATE) &&
    assignableRoles(user.roles).length > 0;

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<MemberStatus | ''>('');
  const [role, setRole] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [page, setPage] = useState(1);
  const [inviting, setInviting] = useState(false);

  const { data: orgData } = useOrganizationOverview();
  const departments =
    useDepartments({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];
  const positions =
    useJobPositions({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];

  const { data, isLoading } = useMembers({
    pageIndex: page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    role: role || undefined,
    departmentId: departmentId || undefined,
  });

  const seats = user.subscription?.seatLimit;
  const seatsUsed = user.subscription?.seatsUsed;
  const published = orgData?.setupCompleted ?? false;

  const totalPages = data ? Math.ceil(data.totalItems / PAGE_SIZE) : 0;

  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  return (
    <div
      className="-m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'var(--po-canvas)',
        backgroundImage:
          'radial-gradient(ellipse 80% 55% at 50% 0%, #dce5ff 0%, transparent 65%)',
      }}
    >
      {/* ── Page header ── */}
      <section
        className="px-4 md:px-6 pt-8 pb-2 mx-auto"
        style={{ maxWidth: 1220 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <span
              className="text-[10px] font-black uppercase tracking-[0.14em]"
              style={{ color: 'var(--po-accent)' }}
            >
              02 / Nhân sự và lộ trình
              <i
                className="ml-[7px] inline-block size-1.5 rounded-full align-middle"
                style={{ background: 'var(--po-coral)' }}
              />
            </span>
            <h1
              className="mt-3 font-bold leading-[1.05]"
              style={{
                fontSize: 'clamp(33px, 4vw, 55px)',
                color: 'var(--po-ink)',
                letterSpacing: '-0.06em',
              }}
            >
              Đúng người, đúng vị trí, đúng mục tiêu.
            </h1>
            <p
              className="mt-2 text-[13px] leading-relaxed"
              style={{ color: 'var(--po-muted)', maxWidth: 560 }}
            >
              Thiết lập Manager cho phòng ban, mời nhân viên theo vị trí.
              Phòng ban xác định phạm vi; vị trí xác định mục tiêu học tập.
            </p>
          </div>
          {seats != null && seatsUsed != null && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold shrink-0"
              style={{
                borderColor: 'var(--po-line)',
                background: 'var(--po-surface)',
                color: 'var(--po-ink)',
              }}
            >
              {seatsUsed}/{seats} quyền sử dụng
            </span>
          )}
        </div>
      </section>

      {/* ── Content ── */}
      <div
        className="px-4 md:px-6 py-4 mx-auto"
        style={{ maxWidth: 1220 }}
      >
        {/* Notice */}
        <div
          className="rounded-[11px] border p-4 text-xs mb-4"
          style={
            published
              ? {
                  borderColor: '#dbeac5',
                  background: '#f5faea',
                  color: '#487336',
                }
              : {
                  borderColor: '#f5dfcf',
                  background: '#fff5ee',
                  color: '#96533c',
                }
          }
        >
          {published
            ? 'Kiến trúc năng lực đã công bố. Mời nhân viên vào đúng phòng ban và vị trí để hệ thống định tuyến lộ trình học tập.'
            : 'Công bố kiến trúc năng lực trước khi gửi lời mời nhân viên.'}
        </div>

        {/* Grid-2: Manager + Invite */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Department Manager panel */}
          <section
            className="rounded-[22px] border p-6"
            style={{
              borderColor: 'var(--po-line)',
              background: 'var(--po-surface)',
              boxShadow: '0 10px 35px rgba(29,48,102,.025)',
            }}
          >
            <span
              className="text-[10px] font-black uppercase tracking-[0.12em]"
              style={{ color: 'var(--po-accent)' }}
            >
              Manager phòng ban
            </span>
            <h2
              className="mt-2 text-xl font-semibold"
              style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}
            >
              Phân công Manager trước.
            </h2>
            <p
              className="mt-1 text-xs leading-relaxed"
              style={{ color: 'var(--po-muted)' }}
            >
              Manager chỉ xem nhân viên và bài tập cuối khóa trong phạm vi
              phòng ban mình.
            </p>

            <div className="mt-4 grid gap-2">
              {departments.length === 0 ? (
                <p
                  className="py-3 text-sm"
                  style={{ color: 'var(--po-muted)' }}
                >
                  Chưa có phòng ban. Tạo phòng ban trước.
                </p>
              ) : (
                departments.slice(0, 5).map((dept) => (
                  <div
                    key={dept.id}
                    className="flex items-center gap-3 rounded-[10px] border px-4 py-2.5"
                    style={{ borderColor: 'var(--po-line)' }}
                  >
                    <span
                      className="grid size-7 shrink-0 place-items-center rounded-lg text-[10px] font-bold"
                      style={{
                        background: '#e9edff',
                        color: 'var(--po-accent)',
                      }}
                    >
                      {dept.name.charAt(0)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <strong
                        className="block text-[13px] truncate"
                        style={{ color: 'var(--po-ink)' }}
                      >
                        {dept.name}
                      </strong>
                      <small
                        className="text-[11px]"
                        style={{ color: 'var(--po-muted)' }}
                      >
                        {dept.managerName ?? 'Chưa có Manager'}
                      </small>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={
                        dept.managerName
                          ? { background: '#ecfdf5', color: '#16a34a' }
                          : { background: '#fef3c7', color: '#d97706' }
                      }
                    >
                      {dept.managerName ? 'Đã phân công' : 'Cần Manager'}
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate('/enterprise/departments')}
              className="mt-4 rounded-xl border px-3 py-2 text-xs font-extrabold transition-colors hover:opacity-80"
              style={{
                borderColor: 'var(--po-line)',
                color: 'var(--po-ink)',
              }}
            >
              Quản lý phòng ban →
            </button>
          </section>

          {/* Invite panel */}
          <section
            className="rounded-[22px] border p-6"
            style={{
              borderColor: 'var(--po-line)',
              background: 'var(--po-surface)',
              boxShadow: '0 10px 35px rgba(29,48,102,.025)',
            }}
          >
            <span
              className="text-[10px] font-black uppercase tracking-[0.12em]"
              style={{ color: 'var(--po-accent)' }}
            >
              Mời nhân viên
            </span>
            <h2
              className="mt-2 text-xl font-semibold"
              style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}
            >
              Lộ trình trước, mời sau.
            </h2>
            <p
              className="mt-1 text-xs leading-relaxed"
              style={{ color: 'var(--po-muted)' }}
            >
              Chọn phòng ban và vị trí cho nhân viên. Họ chỉ thấy mục tiêu
              của vị trí được chỉ định.
            </p>

            <div className="mt-5">
              <div
                className="rounded-[13px] border p-4 text-center"
                style={{
                  borderColor: 'var(--po-line)',
                  background: 'rgba(238,242,255,.4)',
                }}
              >
                <p
                  className="text-xs mb-3"
                  style={{ color: 'var(--po-muted)' }}
                >
                  Mời từng người hoặc nhập danh sách CSV. Hệ thống kiểm tra
                  trước khi thêm.
                </p>
                {canInvite && (
                  <button
                    type="button"
                    onClick={() => setInviting(true)}
                    className="inline-flex items-center gap-2 rounded-[11px] px-4 py-3 text-[13px] font-bold transition-transform hover:-translate-y-0.5"
                    style={{
                      background: 'var(--po-accent)',
                      color: '#fff',
                      boxShadow: '0 9px 18px rgba(52,72,207,.17)',
                    }}
                  >
                    <UserPlus className="size-4" />
                    Mời thành viên
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <span
                  className="block text-[10px] font-bold mb-1"
                  style={{ color: 'var(--po-muted)' }}
                >
                  Phòng ban
                </span>
                <span
                  className="block text-lg font-bold tabular-nums"
                  style={{ color: 'var(--po-ink)' }}
                >
                  {departments.length}
                </span>
              </div>
              <div>
                <span
                  className="block text-[10px] font-bold mb-1"
                  style={{ color: 'var(--po-muted)' }}
                >
                  Vị trí công việc
                </span>
                <span
                  className="block text-lg font-bold tabular-nums"
                  style={{ color: 'var(--po-ink)' }}
                >
                  {positions.length}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* ── Member list ── */}
        <section
          className="rounded-[22px] border p-6"
          style={{
            borderColor: 'var(--po-line)',
            background: 'var(--po-surface)',
            boxShadow: '0 10px 35px rgba(29,48,102,.025)',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-1">
            <div>
              <span
                className="text-[10px] font-black uppercase tracking-[0.12em]"
                style={{ color: 'var(--po-accent)' }}
              >
                Danh sách thành viên
              </span>
              <h2
                className="mt-2 text-xl font-semibold"
                style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}
              >
                Nhân viên theo phòng ban và vị trí.
              </h2>
            </div>
            <p
              className="text-xs tabular-nums"
              style={{ color: 'var(--po-muted)' }}
            >
              {data?.totalItems ?? 0} thành viên
            </p>
          </div>

          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => resetPage(setSearch)(e.target.value)}
              placeholder="Tìm theo tên, email…"
              className="rounded-lg border px-3 py-2 text-xs outline-none focus:ring-1"
              style={{
                borderColor: 'var(--po-line)',
                color: 'var(--po-ink)',
                background: 'var(--po-surface)',
              }}
            />
            <select
              aria-label="Phòng ban"
              value={departmentId}
              onChange={(e) => resetPage(setDepartmentId)(e.target.value)}
              className="rounded-lg border px-3 py-2 text-xs outline-none"
              style={{
                borderColor: 'var(--po-line)',
                color: 'var(--po-ink)',
                background: 'var(--po-surface)',
              }}
            >
              <option value="">Mọi phòng ban</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Vai trò"
              value={role}
              onChange={(e) => resetPage(setRole)(e.target.value)}
              className="rounded-lg border px-3 py-2 text-xs outline-none"
              style={{
                borderColor: 'var(--po-line)',
                color: 'var(--po-ink)',
                background: 'var(--po-surface)',
              }}
            >
              <option value="">Mọi vai trò</option>
              {ENTERPRISE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r] ?? r}
                </option>
              ))}
            </select>
            <select
              aria-label="Trạng thái"
              value={status}
              onChange={(e) =>
                resetPage(setStatus)(e.target.value as MemberStatus | '')
              }
              className="rounded-lg border px-3 py-2 text-xs outline-none"
              style={{
                borderColor: 'var(--po-line)',
                color: 'var(--po-ink)',
                background: 'var(--po-surface)',
              }}
            >
              <option value="">Mọi trạng thái</option>
              {(Object.keys(MEMBER_STATUS_LABELS) as MemberStatus[]).map(
                (s) => (
                  <option key={s} value={s}>
                    {MEMBER_STATUS_LABELS[s]}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* List */}
          <div className="mt-4 grid gap-2">
            {isLoading ? (
              <p
                className="py-6 text-center text-sm"
                style={{ color: 'var(--po-muted)' }}
              >
                Đang tải…
              </p>
            ) : !data?.items.length ? (
              <div className="py-10 text-center">
                <div
                  className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl text-2xl"
                  style={{
                    background: '#e9edff',
                    color: 'var(--po-accent)',
                  }}
                >
                  ♙
                </div>
                <h3
                  className="text-base font-semibold"
                  style={{ color: 'var(--po-ink)' }}
                >
                  Chưa có thành viên
                </h3>
                <p
                  className="mt-1 text-xs"
                  style={{ color: 'var(--po-muted)' }}
                >
                  Mời nhân viên sau khi công bố kiến trúc. Phòng ban và vị
                  trí xác định mục tiêu họ thấy.
                </p>
              </div>
            ) : (
              data.items.map((m) => (
                <MemberCard
                  key={m.id}
                  member={m}
                  onClick={() => navigate(`/enterprise/members/${m.id}`)}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span
                className="text-[11px] tabular-nums"
                style={{ color: 'var(--po-muted)' }}
              >
                Trang {page}/{totalPages}
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border p-1.5 disabled:opacity-40"
                  style={{
                    borderColor: 'var(--po-line)',
                    color: 'var(--po-ink)',
                  }}
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border p-1.5 disabled:opacity-40"
                  style={{
                    borderColor: 'var(--po-line)',
                    color: 'var(--po-ink)',
                  }}
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <InviteMembersModal open={inviting} onClose={() => setInviting(false)} />
    </div>
  );
}
