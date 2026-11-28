import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Building2, ChevronLeft, ChevronRight, MailWarning, Search, SearchX, Send, UserPlus, UsersRound, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import { MEMBERS_KEY, useMembers, useResendInvitation } from '@/hooks/use-members';
import { PERMISSIONS } from '@/hooks/use-permission';
import { ROLES, ROLE_LABELS } from '@/lib/roles';
import { assignableRoles } from '@/lib/role-policy';
import { memberService, type MemberListItem, type MemberListParams, type MemberStatus } from '@/services/member.service';
import { InviteMembersModal } from '@/features/members/components/InviteMembersModal';
import { MEMBER_STATUS_LABELS } from '@/features/members/member-labels';
import { ConfirmActionDialog } from '@/components/shared/ConfirmActionDialog';
import { MembersTable } from '../components/MembersTable';
import { DepartmentsOverview } from '../components/DepartmentsOverview';
import { needsManager } from '../lib/department-manager';
import { SendAnnouncementModal } from '../components/SendAnnouncementModal';
import { OwnerFilterSelect } from '../components/OwnerFilterSelect';
import { PULSE_TOKENS } from '../owner-theme';
import { backState } from '@/lib/back-target';
import './owner-members.css';

const PAGE_SIZES = [10, 20, 50];
const ENTERPRISE_ROLES = [ROLES.OWNER, ROLES.MANAGER, ROLES.EMPLOYEE];
const STATUSES = Object.keys(MEMBER_STATUS_LABELS) as MemberStatus[];
/** `?position=none`: people without a position. */
const NO_POSITION = 'none';
/** Filters kept in the address, so the overview can link to a filtered list and Back restores it. */
const FILTER_KEYS = ['q', 'department', 'position', 'status', 'role'] as const;

/**
 * OW-02 · Nhân sự. What the owner acts on first ("Cần xử lý": invitations nobody activated, people without a position,
 * departments without a manager — each one filters the list), then the people, or the departments and their managers.
 * Filters live in the address: `?status=PENDING`, `?position=none`, `?department=…`, `?tab=departments&manager=none`.
 */
export function OwnerMembersPage() {
  useUiLanguage();
  const user = useCurrentUser((s) => s.user)!;
  const hasPermission = useCurrentUser((s) => s.hasPermission);
  const canInvite = hasPermission(PERMISSIONS.USER_CREATE) && assignableRoles(user.roles).length > 0;
  const canAssignManager = hasPermission(PERMISSIONS.DEPARTMENT_CREATE_UPDATE);
  const queryClient = useQueryClient();

  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'departments' ? 'departments' : 'members';
  const q = params.get('q') ?? '';
  const department = params.get('department') ?? '';
  const position = params.get('position') ?? '';
  const status = (STATUSES as string[]).includes(params.get('status') ?? '') ? (params.get('status') as MemberStatus) : '';
  const role = params.get('role') ?? '';
  const onlyWithoutManager = params.get('manager') === 'none';
  const filtered = FILTER_KEYS.some((key) => params.get(key));

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchText, setSearchText] = useState(q);
  const [inviting, setInviting] = useState<{ departmentId?: string } | null>(null);
  const [announcing, setAnnouncing] = useState(false);
  const [confirmingBulk, setConfirmingBulk] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  /** Changes some address parameters (empty = removed) and goes back to the first page. */
  const update = (changes: Record<string, string | null>) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value); else next.delete(key);
      }
      return next;
    }, { replace: true });
    setPage(1);
  };

  // The search box writes to the address a moment after typing stops.
  useEffect(() => {
    if (searchText.trim() === q) return;
    const timer = window.setTimeout(() => update({ q: searchText.trim() || null }), 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);
  // The address changed from elsewhere (Back, a cleared filter): show it, without trimming what is being typed.
  useEffect(() => { setSearchText((current) => (current.trim() === q ? current : q)); }, [q]);

  const listParams: MemberListParams = {
    pageIndex: page,
    pageSize,
    search: q || undefined,
    status: status || undefined,
    role: role || undefined,
    departmentId: department || undefined,
    jobPositionId: position && position !== NO_POSITION ? position : undefined,
    noPosition: position === NO_POSITION || undefined,
  };
  const members = useMembers(listParams);
  const summary = members.data?.summary;
  const departmentsQuery = useDepartments({ pageSize: 100, status: 'ACTIVE' });
  const departments = departmentsQuery.data?.items ?? [];
  const positions = useJobPositions({ pageSize: 100 }).data?.items ?? [];
  const resendInvitation = useResendInvitation();

  const totalItems = members.data?.totalItems ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  useEffect(() => { if (members.data && page > totalPages) setPage(totalPages); }, [members.data, page, totalPages]);

  const missingManagers = departments.filter(needsManager).length;
  const todo = [
    summary && summary.pending > 0 && {
      key: 'pending', icon: MailWarning, label: translateUi(`${summary.pending} lời mời chưa kích hoạt`),
      active: tab === 'members' && status === 'PENDING',
      apply: (on: boolean) => update({ tab: null, status: on ? 'PENDING' : null }),
    },
    summary && summary.withoutPosition > 0 && {
      key: 'position', icon: BriefcaseBusiness, label: translateUi(`${summary.withoutPosition} người chưa có vị trí`),
      active: tab === 'members' && position === NO_POSITION,
      apply: (on: boolean) => update({ tab: null, position: on ? NO_POSITION : null }),
    },
    missingManagers > 0 && {
      key: 'manager', icon: Building2, label: translateUi(`${missingManagers} phòng ban chưa có trưởng phòng`),
      active: tab === 'departments' && onlyWithoutManager,
      apply: (on: boolean) => update({ tab: on ? 'departments' : null, manager: on ? 'none' : null }),
    },
  ].filter(Boolean) as { key: string; icon: typeof MailWarning; label: string; active: boolean; apply: (on: boolean) => void }[];

  const resendOne = async (member: MemberListItem) => {
    setResendingId(member.id);
    try {
      await resendInvitation.mutateAsync(member.id);
      toast.success(translateUi(`Đã gửi lại lời mời cho ${member.fullName}`));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : translateUi(`Chưa gửi được lời mời cho ${member.fullName}`));
    } finally {
      setResendingId(null);
    }
  };

  // Every pending person matching the filters, on every page — not only the rows on screen.
  const resendAll = async () => {
    const ids: string[] = [];
    for (let pageIndex = 1; ; pageIndex += 1) {
      const result = (await memberService.getList({ ...listParams, status: 'PENDING', pageIndex, pageSize: 100 })).data.data!;
      ids.push(...result.items.map((member) => member.id));
      if (pageIndex * 100 >= result.totalItems) break;
    }
    let sent = 0;
    for (const id of ids) {
      try {
        await memberService.resendInvitation(id);
        sent += 1;
      } catch {
        // The others still get theirs; the count below says how many failed.
      }
    }
    await queryClient.invalidateQueries({ queryKey: MEMBERS_KEY });
    if (sent === ids.length) toast.success(translateUi(`Đã gửi lại lời mời cho ${sent} người`));
    else toast.error(translateUi(`Đã gửi ${sent}/${ids.length} lời mời. Thử lại với những người còn lại.`));
  };

  const clearFilters = () => {
    setSearchText('');
    update(Object.fromEntries(FILTER_KEYS.map((key) => [key, null])));
  };

  const seats = user.subscription?.seatLimit;
  const seatsUsed = user.subscription?.seatsUsed;
  const departmentOptions = [{ value: '', label: translateUi('Mọi phòng ban') }, ...departments.map((d) => ({ value: d.id, label: d.name }))];
  const positionOptions = [
    { value: '', label: translateUi('Mọi vị trí') },
    { value: NO_POSITION, label: translateUi('Chưa có vị trí') },
    ...positions.map((p) => ({ value: p.id, label: p.name })),
  ];
  const first = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  /** This page with its tab and filters, for the back links of the pages it opens. */
  const here = `/enterprise/members${params.toString() ? `?${params.toString()}` : ''}`;

  return (
    <div className="po-owner mb-page" style={PULSE_TOKENS}>
      <header className="mb-header">
        <div>
          <h1>{translateUi('Nhân sự')}</h1>
          {/* The tabs carry the counts; only the seats are said here. */}
          {seats != null && seatsUsed != null && <p>{translateUi(`${seatsUsed}/${seats} quyền sử dụng`)}</p>}
        </div>
        <div className="mb-header__actions">
          <button type="button" className="mb-btn mb-btn--ghost" onClick={() => setAnnouncing(true)}>
            <Send size={15} aria-hidden="true" />{translateUi('Gửi thông báo')}
          </button>
          {canInvite && (
            <button type="button" className="mb-btn mb-btn--primary" onClick={() => setInviting({ departmentId: department || undefined })}>
              <UserPlus size={16} aria-hidden="true" />{translateUi('Mời thành viên')}
            </button>
          )}
        </div>
      </header>

      {todo.length > 0 && (
        <section className="mb-todo" aria-label={translateUi('Cần xử lý')}>
          <h2>{translateUi('Cần xử lý')}</h2>
          <ul>
            {todo.map(({ key, icon: Icon, label, active, apply }) => (
              <li key={key}>
                <button type="button" aria-pressed={active} onClick={() => apply(!active)}>
                  <Icon size={15} aria-hidden="true" />{label}
                  {active ? <X size={14} aria-hidden="true" /> : <ArrowRight size={14} aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mb-tabs">
        <div role="tablist" aria-label={translateUi('Nhân sự')}>
          <button type="button" role="tab" id="mb-tab-members" aria-controls="mb-panel" aria-selected={tab === 'members'} onClick={() => update({ tab: null, manager: null })}>
            <UsersRound size={16} aria-hidden="true" />{translateUi('Thành viên')}<span>{summary?.total ?? '—'}</span>
          </button>
          <button type="button" role="tab" id="mb-tab-departments" aria-controls="mb-panel" aria-selected={tab === 'departments'} onClick={() => update({ tab: 'departments' })}>
            <Building2 size={16} aria-hidden="true" />{translateUi('Phòng ban')}<span>{departmentsQuery.data?.totalItems ?? '—'}</span>
          </button>
        </div>
        <Link to="/enterprise/positions" state={backState(here, 'Nhân sự')} className="mb-link">{translateUi('Vị trí công việc')}<ArrowRight size={14} aria-hidden="true" /></Link>
      </div>

      <section id="mb-panel" role="tabpanel" aria-labelledby={tab === 'members' ? 'mb-tab-members' : 'mb-tab-departments'} className="mb-panel">
        {tab === 'departments' ? (
          <DepartmentsOverview
            departments={departments}
            loading={departmentsQuery.isLoading}
            onlyWithoutManager={onlyWithoutManager}
            onFilterChange={(on) => update({ manager: on ? 'none' : null })}
            onShowMembers={(departmentId) => update({ tab: null, manager: null, department: departmentId })}
            canAssign={canAssignManager}
            onInvite={canInvite ? (departmentId) => setInviting({ departmentId }) : undefined}
            backState={backState(here, 'Nhân sự')}
          />
        ) : (
          <>
            <div className="mb-filters">
              <label className="owner-filter-search mb-search">
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  aria-label={translateUi('Tìm nhân sự')}
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder={translateUi('Tìm tên, email hoặc mã nhân viên')}
                />
                {searchText && (
                  <button type="button" className="owner-filter-search__clear" aria-label={translateUi('Xóa tìm kiếm')} onClick={() => { setSearchText(''); update({ q: null }); }}>
                    <X size={15} />
                  </button>
                )}
              </label>
              <OwnerFilterSelect icon="filter" label={translateUi('Phòng ban')} value={department} options={departmentOptions} onChange={(value) => update({ department: value || null })} />
              <OwnerFilterSelect icon="filter" label={translateUi('Vị trí')} value={position} options={positionOptions} onChange={(value) => update({ position: value || null })} />
              <OwnerFilterSelect
                icon="filter"
                label={translateUi('Trạng thái')}
                value={status}
                options={[{ value: '', label: translateUi('Mọi trạng thái') }, ...STATUSES.map((s) => ({ value: s, label: translateUi(MEMBER_STATUS_LABELS[s]) }))]}
                onChange={(value) => update({ status: value || null })}
              />
              <OwnerFilterSelect
                icon="filter"
                label={translateUi('Vai trò')}
                value={role}
                options={[{ value: '', label: translateUi('Mọi vai trò') }, ...ENTERPRISE_ROLES.map((r) => ({ value: r, label: translateUi(ROLE_LABELS[r]) }))]}
                onChange={(value) => update({ role: value || null })}
              />
            </div>

            {filtered && (
              <div className="mb-resultbar">
                <p aria-live="polite">{members.data ? translateUi(`${totalItems} người khớp bộ lọc`) : ''}</p>
                <button type="button" className="mb-textbtn" onClick={clearFilters}>{translateUi('Xóa bộ lọc')}</button>
              </div>
            )}

            {status === 'PENDING' && totalItems > 0 && canInvite && (
              <div className="mb-bulk">
                <MailWarning size={18} aria-hidden="true" />
                <p>{translateUi(`${totalItems} người chưa kích hoạt tài khoản`)}</p>
                <button type="button" className="mb-btn mb-btn--primary" onClick={() => setConfirmingBulk(true)}>
                  <Send size={15} aria-hidden="true" />{translateUi(`Gửi lại lời mời cho cả ${totalItems} người`)}
                </button>
              </div>
            )}

            <MembersTable
              items={members.data?.items ?? []}
              loading={members.isLoading}
              refreshing={members.isFetching && !members.isLoading}
              onResend={canInvite ? (member) => void resendOne(member) : undefined}
              resendingId={resendingId}
              backState={backState(here, 'Nhân sự')}
              empty={filtered ? (
                <div className="mb-empty">
                  <SearchX size={26} aria-hidden="true" />
                  <p className="mb-empty__title">{translateUi('Không có ai khớp bộ lọc')}</p>
                  <button type="button" className="mb-btn mb-btn--ghost" onClick={clearFilters}>{translateUi('Xóa bộ lọc')}</button>
                </div>
              ) : (
                <div className="mb-empty">
                  <UsersRound size={26} aria-hidden="true" />
                  <p className="mb-empty__title">{translateUi('Chưa có ai trong tổ chức')}</p>
                  {canInvite && <button type="button" className="mb-btn mb-btn--primary" onClick={() => setInviting({})}><UserPlus size={16} aria-hidden="true" />{translateUi('Mời thành viên')}</button>}
                </div>
              )}
            />

            {totalItems > PAGE_SIZES[0] && (
              <nav className="mb-pagination" aria-label={translateUi('Phân trang nhân sự')}>
                {totalPages > 1 && <span className="mb-pagination__summary">{translateUi(`${first}–${Math.min(page * pageSize, totalItems)} trong ${totalItems}`)}</span>}
                <OwnerFilterSelect
                  icon="rows"
                  label={translateUi('Số người mỗi trang')}
                  value={String(pageSize)}
                  onChange={(value) => { setPageSize(Number(value)); setPage(1); }}
                  options={PAGE_SIZES.map((size) => ({ value: String(size), label: translateUi(`${size} / trang`) }))}
                />
                {totalPages > 1 && (
                  <div className="mb-pagination__controls">
                    <button type="button" aria-label={translateUi('Trang trước')} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /></button>
                    <span aria-current="page">{translateUi(`Trang ${page} / ${totalPages}`)}</span>
                    <button type="button" aria-label={translateUi('Trang sau')} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={16} /></button>
                  </div>
                )}
              </nav>
            )}
          </>
        )}
      </section>

      <InviteMembersModal open={inviting !== null} onClose={() => setInviting(null)} defaultDepartmentId={inviting?.departmentId} />
      {announcing && <SendAnnouncementModal open={announcing} onClose={() => setAnnouncing(false)} />}
      <ConfirmActionDialog
        open={confirmingBulk}
        onClose={() => setConfirmingBulk(false)}
        onConfirm={resendAll}
        title={translateUi(`Gửi lại lời mời cho ${totalItems} người?`)}
        description={translateUi('Mỗi người nhận một email mới có liên kết kích hoạt.')}
        confirmLabel={translateUi('Gửi lời mời')}
        confirmVariant="primary"
      />
    </div>
  );
}
