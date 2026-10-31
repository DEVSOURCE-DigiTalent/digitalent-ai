import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ChevronLeft, ChevronRight, Mail, Send, FlaskConical, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import { useMembers, useResendInvitation } from '@/hooks/use-members';
import { useOrganizationOverview } from '@/hooks/use-organization';
import { PERMISSIONS } from '@/hooks/use-permission';
import { ROLES } from '@/lib/roles';
import { assignableRoles } from '@/lib/role-policy';
import type { MemberListItem, MemberStatus } from '@/services/member.service';
import { InviteMembersModal } from '@/features/members/components/InviteMembersModal';
import { MEMBER_STATUS_LABELS } from '@/features/members/member-labels';
import { MemberCard } from '../components/MemberCard';
import { SendAnnouncementModal } from '../components/SendAnnouncementModal';
import { PULSE_TOKENS } from '../owner-theme';

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
  const [announcing, setAnnouncing] = useState(false);

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

  const resendInvitation = useResendInvitation();
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [isBulkInviting, setIsBulkInviting] = useState(false);

  const pendingMembers =
    data?.items.filter(
      (m) => m.status === 'PENDING' || m.kind === 'invitation',
    ) ?? [];
  const selectedDept = departments.find((d) => d.id === departmentId);
  const pendingInDept = departmentId
    ? pendingMembers.filter((m) => m.departmentId === departmentId)
    : pendingMembers;

  const handleResendSingle = async (member: MemberListItem) => {
    setResendingId(member.id);
    try {
      await resendInvitation.mutateAsync(member.id);
      toast.success(`Đã gửi lời mời tới ${member.fullName}!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Không thể gửi lời mời cho ${member.fullName}`;
      toast.error(msg);
    } finally {
      setResendingId(null);
    }
  };

  const handleInviteAllPending = async () => {
    if (pendingInDept.length === 0) return;
    setIsBulkInviting(true);
    let successCount = 0;
    for (const m of pendingInDept) {
      try {
        await resendInvitation.mutateAsync(m.id);
        successCount++;
      } catch {
        // continue with next
      }
    }
    setIsBulkInviting(false);
    if (successCount > 0) {
      toast.success(
        `Đã gửi lời mời thành công tới ${successCount} nhân sự ${selectedDept ? `phòng ${selectedDept.name}` : ''}!`,
      );
    } else {
      toast.error('Có lỗi xảy ra khi gửi lời mời hàng loạt.');
    }
  };

  const seats = user.subscription?.seatLimit;
  const seatsUsed = user.subscription?.seatsUsed;

  const totalPages = data ? Math.ceil(data.totalItems / PAGE_SIZE) : 0;

  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  return (
    <div
      className="po-owner -m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'var(--po-canvas)',
        backgroundImage:
          'radial-gradient(ellipse 80% 55% at 50% 0%, var(--po-glow) 0%, transparent 65%)',
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
              className="mt-2 font-bold leading-[1.05]"
              style={{
                fontSize: 'clamp(28px, 3.5vw, 44px)',
                color: 'var(--po-ink)',
                letterSpacing: '-0.05em',
              }}
            >
              Nhân sự & Phân công Lộ trình
            </h1>
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
        {/* Bước 1: Thêm nhân sự & kích hoạt test */}
        <div className="rounded-[16px] border border-teal-200/80 bg-gradient-to-r from-teal-50/90 via-sky-50/60 to-white dark:from-teal-950/30 dark:via-sky-950/20 dark:to-slate-900 px-5 py-3.5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[#137b84] text-white flex items-center justify-center shrink-0 shadow-xs">
              <UserPlus className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-md">
                  Bước 1 / 5
                </span>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Thêm nhân viên làm bài test khảo sát 6 lĩnh vực số
                </h3>
              </div>
            </div>
          </div>
          <Link
            to="/enterprise/skill-gap"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-teal-200 bg-white hover:bg-teal-50 text-teal-800 text-xs font-bold transition-colors shrink-0"
          >
            Bước 2: Khoảng trống Năng lực
            <ArrowRight className="size-3.5" />
          </Link>
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
              className="mt-1 text-lg font-bold"
              style={{ color: 'var(--po-ink)', letterSpacing: '-0.03em' }}
            >
              Phân công Manager phòng ban
            </h2>

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
                        background: 'var(--po-soft)',
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
              className="mt-1 text-lg font-bold"
              style={{ color: 'var(--po-ink)', letterSpacing: '-0.03em' }}
            >
              Thêm nhân viên mới
            </h2>

            <div className="mt-4">
              <div
                className="rounded-[13px] border p-4 text-center"
                style={{
                  borderColor: 'var(--po-line)',
                  background: 'var(--po-raised)',
                }}
              >
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {canInvite && (
                    <button
                      type="button"
                      onClick={() => setInviting(true)}
                      className="inline-flex items-center gap-2 rounded-[11px] px-4 py-2.5 text-[13px] font-bold transition-transform hover:-translate-y-0.5"
                      style={{
                        background: 'var(--po-accent)',
                        color: '#fff',
                        boxShadow: '0 9px 18px rgba(19,123,132,.17)',
                      }}
                    >
                      <UserPlus className="size-4" />
                      Mời thành viên
                    </button>
                  )}
                  <Link
                    to="/enterprise/trial"
                    className="inline-flex items-center gap-1.5 rounded-[11px] px-3.5 py-2.5 text-[13px] font-bold border border-teal-200 bg-white text-[var(--po-accent)] hover:bg-teal-50/70 transition-colors"
                  >
                    <FlaskConical className="size-4" />
                    Đợt test & Lịch chấm
                  </Link>
                </div>
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
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className="text-xs tabular-nums mr-1"
                style={{ color: 'var(--po-muted)' }}
              >
                {data?.totalItems ?? 0} thành viên
              </span>

              <button
                type="button"
                onClick={() => setAnnouncing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/70 text-[var(--po-accent)] text-xs font-bold transition-all shadow-xs"
              >
                <Send className="size-3.5" />
                Gửi thông báo & Hạn chót
              </button>

              {canInvite && (
                <button
                  type="button"
                  onClick={() => setInviting(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#137b84] hover:bg-[#0e5968] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <UserPlus className="size-3.5" />
                  Mời nhân sự
                </button>
              )}
            </div>
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

          {/* Bulk department invite banner if pending members exist */}
          {pendingInDept.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-teal-200 bg-teal-50/70 p-3.5 text-xs text-teal-900 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-teal-100 text-[var(--po-accent)]">
                  <Mail className="size-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    Có {pendingInDept.length} nhân sự {selectedDept ? `phòng ${selectedDept.name}` : ''} đang ở trạng thái Chờ kích hoạt
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Gửi email mời tham gia và thiết lập mật khẩu một lần cho toàn bộ nhân sự này.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleInviteAllPending}
                disabled={isBulkInviting}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#137b84] hover:bg-[#0e5968] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
              >
                <Send className="size-3.5" />
                <span>
                  {isBulkInviting
                    ? 'Đang gửi lời mời...'
                    : selectedDept
                      ? `Mời tất cả phòng ${selectedDept.name}`
                      : `Gửi lời mời cho tất cả (${pendingInDept.length})`}
                </span>
              </button>
            </div>
          )}

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
                    background: 'var(--po-soft)',
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
                  onResendInvite={handleResendSingle}
                  isResending={resendingId === m.id}
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

      <InviteMembersModal
        open={inviting}
        onClose={() => setInviting(false)}
        defaultDepartmentId={departmentId || undefined}
      />

      {announcing && (
        <SendAnnouncementModal
          open={announcing}
          onClose={() => setAnnouncing(false)}
        />
      )}
    </div>
  );
}
