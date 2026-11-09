import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ChevronLeft, ChevronRight, Mail, Send, FlaskConical, ArrowRight, Search, X, Building2, UsersRound, BriefcaseBusiness, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import { useMembers, useResendInvitation } from '@/hooks/use-members';
import { PERMISSIONS } from '@/hooks/use-permission';
import { ROLES } from '@/lib/roles';
import { assignableRoles } from '@/lib/role-policy';
import type { MemberListItem, MemberStatus } from '@/services/member.service';
import { InviteMembersModal } from '@/features/members/components/InviteMembersModal';
import { MEMBER_STATUS_LABELS } from '@/features/members/member-labels';
import { MemberCard } from '../components/MemberCard';
import { SendAnnouncementModal } from '../components/SendAnnouncementModal';
import { OwnerFilterSelect } from '../components/OwnerFilterSelect';
import { PULSE_TOKENS } from '../owner-theme';
import { SectionLoading } from '@/components/shared/LoadingState';
import './owner-members.css';

const DEPARTMENT_PREVIEW_SIZE = 3;
const ENTERPRISE_ROLES = [ROLES.OWNER, ROLES.MANAGER, ROLES.EMPLOYEE];
const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Chủ sở hữu',
  MANAGER: 'Quản lý',
  EMPLOYEE: 'Nhân viên',
};

export function OwnerMembersPage() {
  useUiLanguage();
  const navigate = useNavigate();
  const user = useCurrentUser((s) => s.user)!;
  const canInvite =
    useCurrentUser((s) => s.hasPermission)(PERMISSIONS.USER_CREATE) &&
    assignableRoles(user.roles).length > 0;

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<MemberStatus | ''>('');
  const [role, setRole] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [debouncedDepartmentSearch, setDebouncedDepartmentSearch] = useState('');
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [inviting, setInviting] = useState(false);
  const [announcing, setAnnouncing] = useState(false);

  const departmentData = useDepartments({ pageSize: 100, status: 'ACTIVE' }).data;
  const departmentTotal = useDepartments({ pageSize: 1 }).data?.totalItems;
  const departments = departmentData?.items ?? [];
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedDepartmentSearch(departmentSearch.trim()), 200);
    return () => window.clearTimeout(timer);
  }, [departmentSearch]);
  const departmentResults = useDepartments({ pageSize: 100, status: 'ACTIVE', search: debouncedDepartmentSearch || undefined });
  const departmentOptions = [
    { value: '', label: 'Mọi phòng ban' },
    ...(departmentResults.data?.items ?? departments).map((d) => ({ value: d.id, label: d.name })),
  ];
  if (departmentId && !departmentOptions.some((option) => option.value === departmentId)) {
    departmentOptions.push({ value: departmentId, label: selectedDepartmentName });
  }
  const positionTotal = useJobPositions({ pageSize: 1 }).data?.totalItems;
  const memberTotal = useMembers({ pageIndex: 1, pageSize: 1 }).data?.totalItems;

  const { data, isFetching } = useMembers({
    pageIndex: page,
    pageSize,
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
  const selectedDept = departmentId ? { name: selectedDepartmentName || departments.find((d) => d.id === departmentId)?.name || '' } : undefined;
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

  const totalPages = data ? Math.ceil(data.totalItems / pageSize) : 0;
  useEffect(() => { if (!isFetching && data && page > Math.max(1, totalPages)) setPage(Math.max(1, totalPages)); }, [data, isFetching, page, totalPages]);

  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  const scrollToMembers = () => {
    document.getElementById('members-list')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <div
      className="po-owner members-page -m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'radial-gradient(circle at 88% 3%, rgba(20,184,166,.10), transparent 34%), radial-gradient(circle at 7% 48%, rgba(56,189,248,.08), transparent 38%), #f7fafc',
      }}
    >
      {/* ── Page header ── */}
      <section className="members-container pt-7 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-[-0.04em] heading-gradient">{translateUi("Nhân sự")}</h1>
          </div>
          {seats != null && seatsUsed != null && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-bold shrink-0"
              style={{
                borderColor: 'var(--po-line)',
                background: 'var(--po-surface)',
                color: 'var(--po-ink)',
              }}
            >
              {seatsUsed}/{seats}{translateUi(" quyền sử dụng")}</span>
          )}
        </div>
      </section>

      {/* ── Content ── */}
      <div className="members-container members-workspace py-5 pb-16">
        <section className="members-invite" aria-label={translateUi("Mời thành viên nhanh")}>
          <div className="members-invite__icon"><Sparkles size={22} /></div>
          <div className="members-invite__copy"><span>{translateUi("THAO TÁC NHANH")}</span><h2>{translateUi("Thêm nhân sự vào tổ chức")}</h2></div>
          <div className="members-invite__actions">
            {canInvite && <button type="button" className="members-invite__primary" onClick={() => setInviting(true)}><UserPlus size={18} />{translateUi(" Mời thành viên ")}<ArrowRight size={16} /></button>}
            <Link to="/enterprise/trial" className="members-invite__secondary"><FlaskConical size={17} />{translateUi(" Đợt đánh giá")}</Link>
          </div>
        </section>

        <div className="members-stats" aria-label={translateUi("Thông tin nhanh về nhân sự")}>
          <Link className="members-stat members-stat--blue" to="/enterprise/departments"><span className="members-stat__icon"><Building2 size={22} /></span><span className="members-stat__label">{translateUi("Phòng ban")}</span><strong>{departmentTotal ?? '—'}</strong><span className="members-stat__foot">{translateUi("Xem phòng ban ")}<ArrowRight size={16} /></span></Link>
          <button type="button" className="members-stat members-stat--teal" onClick={scrollToMembers}><span className="members-stat__icon"><UsersRound size={22} /></span><span className="members-stat__label">{translateUi("Thành viên")}</span><strong>{memberTotal ?? '—'}</strong><span className="members-stat__foot">{translateUi("Xem danh sách ")}<ArrowRight size={16} /></span></button>
          <Link className="members-stat members-stat--violet" to="/enterprise/positions"><span className="members-stat__icon"><BriefcaseBusiness size={22} /></span><span className="members-stat__label">{translateUi("Vị trí công việc")}</span><strong>{positionTotal ?? '—'}</strong><span className="members-stat__foot">{translateUi("Xem vị trí ")}<ArrowRight size={16} /></span></Link>
        </div>

        {/* Department management */}
        <div className="members-workspace__organization mb-5">
          <section
            className="members-panel members-departments-panel rounded-[22px] border p-6"
            style={{
              borderColor: 'var(--po-line)',
              background: 'var(--po-surface)',
              boxShadow: '0 10px 35px rgba(29,48,102,.025)',
            }}
          >
            <div className="members-departments-panel__heading"><div><span
              className="text-[10px] font-black uppercase tracking-[0.12em]"
              style={{ color: 'var(--po-accent)' }}
            >{translateUi("QUẢN LÝ PHÒNG BAN")}</span>
            <h2 className="mt-1 text-lg sm:text-xl font-bold tracking-[-0.02em] text-slate-800">{translateUi("Phân công quản lý")}</h2></div><Link to="/enterprise/departments" className="members-departments-panel__link">{translateUi("Quản lý phòng ban ")}<ArrowRight size={16} /></Link></div>

            <div className="members-department-grid mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {departments.length === 0 ? (
                <p
                  className="py-3 text-sm"
                  style={{ color: 'var(--po-muted)' }}
                >{translateUi("Chưa có phòng ban. Tạo phòng ban trước.")}</p>
              ) : (
                departments.slice(0, DEPARTMENT_PREVIEW_SIZE).map((dept) => (
                  <Link
                    key={dept.id}
                    to={`/enterprise/departments/${dept.id}`}
                    className="members-department flex items-center gap-3 rounded-xl border px-4 py-3"
                    style={{ borderColor: 'var(--po-line)' }}
                  >
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-lg text-xs font-bold"
                      style={{
                        background: 'var(--po-soft)',
                        color: 'var(--po-accent)',
                      }}
                    >
                      {dept.name.charAt(0)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <strong
                        className="block text-sm truncate"
                        style={{ color: 'var(--po-ink)' }}
                      >
                        {dept.name}
                      </strong>
                      <small
                        className="text-xs"
                        style={{ color: 'var(--po-muted)' }}
                      >
                        {dept.managerName ?? translateUi('Chưa phân công')}
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
                      {dept.managerName ? translateUi('Đã phân công') : translateUi('Chưa phân công')}
                    </span>
                  </Link>
                ))
              )}
            </div>

            {(departmentData?.totalItems ?? 0) > DEPARTMENT_PREVIEW_SIZE && (
              <p className="members-department-summary">{translateUi("Đang xem ")}{DEPARTMENT_PREVIEW_SIZE} trong {departmentData?.totalItems}{translateUi(" phòng ban")}</p>
            )}

          </section>

        </div>

        {/* ── Member list ── */}
        <section
          id="members-list"
          className="members-panel members-list-panel rounded-[22px] border p-6"
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
              >{translateUi("Danh sách thành viên")}</span>
              <h2
                className="mt-2 text-xl sm:text-2xl font-bold"
                style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}
              >{translateUi("Nhân viên theo phòng ban và vị trí.")}</h2>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setAnnouncing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/70 text-[var(--po-accent)] text-sm font-bold transition-all shadow-xs"
              >
                <Send className="size-3.5" />{translateUi("Gửi thông báo & Hạn chót")}</button>

            </div>
          </div>

          {/* Filters */}
          <div className="members-filters mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <label className="owner-filter-search"><Search size={18} aria-hidden="true" /><input
              type="text"
              aria-label={translateUi("Tìm nhân sự")}
              value={search}
              onChange={(e) => resetPage(setSearch)(e.target.value)}
              placeholder={translateUi("Tìm tên hoặc email")}
            />{search && <button type="button" className="owner-filter-search__clear" aria-label={translateUi("Xóa tìm kiếm")} onClick={() => resetPage(setSearch)('')}><X size={15} /></button>}</label>
            <OwnerFilterSelect
              label={translateUi("Phòng ban")}
              value={departmentId}
              onChange={(value) => {
                setSelectedDepartmentName(departmentOptions.find((option) => option.value === value)?.label ?? '');
                resetPage(setDepartmentId)(value);
              }}
              onSearchChange={setDepartmentSearch}
              loading={departmentResults.isFetching}
              options={departmentOptions}
            />
            <OwnerFilterSelect
              label={translateUi("Vai trò")}
              value={role}
              onChange={resetPage(setRole)}
              options={[{ value: '', label: 'Mọi vai trò' }, ...ENTERPRISE_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] ?? r }))]}
            />
            <OwnerFilterSelect
              label={translateUi("Trạng thái")}
              value={status}
              onChange={(value) => resetPage(setStatus)(value as MemberStatus | '')}
              options={[{ value: '', label: 'Mọi trạng thái' }, ...(Object.keys(MEMBER_STATUS_LABELS) as MemberStatus[]).map((s) => ({ value: s, label: MEMBER_STATUS_LABELS[s] }))]}
            />
          </div>

          {/* Bulk department invite banner if pending members exist */}
          <div className="members-page-size"><span>{data?.totalItems ?? 0}{translateUi(" thành viên")}</span><div><span>{translateUi("Hiển thị")}</span><OwnerFilterSelect label={translateUi("Số nhân viên mỗi trang")} value={String(pageSize)} onChange={(value) => { setPageSize(Number(value)); setPage(1); }} options={[5, 10, 15, 20, 50].map((size) => ({ value: String(size), label: `${size} / trang` }))} /></div></div>
          {!isFetching && pendingInDept.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-teal-200 bg-teal-50/70 p-3.5 text-xs text-teal-900 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-teal-100 text-[var(--po-accent)]">
                  <Mail className="size-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{translateUi("Có ")}{pendingInDept.length}{translateUi(" nhân sự ")}{selectedDept ? translateUi(`phòng ${selectedDept.name}`) : ''}{translateUi(" đang ở trạng thái Chờ kích hoạt")}</p>
                  <p className="text-[11px] text-slate-500">{translateUi("Gửi email mời tham gia và thiết lập mật khẩu một lần cho toàn bộ nhân sự này.")}</p>
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
                      ? translateUi(`Mời tất cả phòng ${selectedDept.name}`)
                      : translateUi(`Gửi lời mời cho tất cả (${pendingInDept.length})`)}
                </span>
              </button>
            </div>
          )}

          {/* List */}
          <div className="members-list mt-4 grid gap-2" aria-live="polite">
            {isFetching ? (
              <SectionLoading label={translateUi("Đang tải danh sách thành viên")} />
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
                >{translateUi("Chưa có thành viên")}</h3>
                <p
                  className="mt-1 text-xs"
                  style={{ color: 'var(--po-muted)' }}
                >{translateUi("Mời nhân viên sau khi công bố kiến trúc. Phòng ban và vị trí xác định mục tiêu họ thấy.")}</p>
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
            <nav className="members-pagination" aria-label={translateUi("Phân trang nhân sự")}>
              <span
                className="members-pagination__summary tabular-nums"
                style={{ color: 'var(--po-muted)' }}
              >
                {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, data?.totalItems ?? 0)} trong {data?.totalItems ?? 0}{translateUi(" thành viên")}</span>
              <div className="members-pagination__controls">
                <button
                  type="button"
                  aria-label={translateUi("Trang trước")}
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="members-pagination__button"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="members-pagination__current" aria-current="page">{translateUi("Trang ")}{page} / {totalPages}</span>
                <button
                  type="button"
                  aria-label={translateUi("Trang sau")}
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="members-pagination__button"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </nav>
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
