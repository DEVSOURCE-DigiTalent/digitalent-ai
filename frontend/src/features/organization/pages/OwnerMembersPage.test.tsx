import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { backTarget } from '@/lib/back-target';
import type { MemberListItem, MemberListParams, MemberPage } from '@/services/member.service';
import type { DepartmentListItem } from '@/services/department.service';
import { OwnerMembersPage } from './OwnerMembersPage';

const member = (id: string, fullName: string, extra: Partial<MemberListItem> = {}): MemberListItem => ({
  id, kind: 'member', fullName, email: `${id}@sao-mai.vn`, roles: ['EMPLOYEE'], status: 'ACTIVE',
  employeeId: `e-${id}`, departmentId: 'kd', departmentName: 'Kinh doanh', jobPositionId: 'sales', positionName: 'Sales / CRM',
  lastActiveAt: new Date(Date.now() - 2 * 3600_000).toISOString(), ...extra,
});

// Bùi Đức Thắng leads nobody, Lê Phúc is a manager (holds EMPLOYEE too), Chi has no position, Dung was invited.
const people = [
  member('thang', 'Bùi Đức Thắng'),
  member('phuc', 'Lê Văn Phúc', { roles: ['MANAGER', 'EMPLOYEE'] }),
  member('chi', 'Ngô Chi', { jobPositionId: null, positionName: null }),
  member('inv-dung', 'Trần Dung', { kind: 'invitation', status: 'PENDING', employeeId: null, lastActiveAt: null, invitedAt: new Date().toISOString() }),
];
// The whole organization: 3 invitations wait (only one on the page), 1 person without a position.
const summary = { total: 30, active: 26, pending: 3, inactive: 1, withoutPosition: 1 };
const page = (items: MemberListItem[], totalItems = items.length): MemberPage => ({ items, totalItems, pageIndex: 1, pageSize: 20, totalPages: 1, summary });

const useMembers = vi.hoisted(() => vi.fn());
const getList = vi.hoisted(() => vi.fn());
const resendInvitation = vi.hoisted(() => vi.fn());
const setManager = vi.hoisted(() => vi.fn());
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

const departments: DepartmentListItem[] = [
  { id: 'kd', code: 'KD', name: 'Kinh doanh', status: 'ACTIVE', headcount: 3 },
  { id: 'kt', code: 'KT', name: 'Kế toán', status: 'ACTIVE', headcount: 2, managerEmployeeId: 'e-phuc', managerName: 'Lê Văn Phúc' },
  { id: 'mkt', code: 'MKT', name: 'Marketing', status: 'ACTIVE', headcount: 1, hasPendingManagerInvitation: true },
] as DepartmentListItem[];

vi.mock('sonner', () => ({ toast }));
vi.mock('@/hooks/use-members', () => ({
  MEMBERS_KEY: ['members'],
  useMembers,
  useResendInvitation: () => ({ mutateAsync: resendInvitation }),
}));
vi.mock('@/services/member.service', () => ({ memberService: { getList, resendInvitation } }));
vi.mock('@/hooks/use-departments', () => ({
  useDepartments: () => ({ data: { items: departments, totalItems: departments.length }, isLoading: false }),
  useSetDepartmentManager: () => ({ mutateAsync: setManager, isPending: false }),
}));
vi.mock('@/hooks/use-job-positions', () => ({ useJobPositions: () => ({ data: { items: [{ id: 'sales', code: 'SALES_CRM', name: 'Sales / CRM' }] } }) }));
vi.mock('@/features/members/components/InviteMembersModal', () => ({ InviteMembersModal: () => null }));
vi.mock('../components/SendAnnouncementModal', () => ({ SendAnnouncementModal: () => null }));

function Address() {
  const location = useLocation();
  return <output data-testid="address">{location.search}</output>;
}

/** Stands for a page opened from Nhân sự: shows where its back link leads. */
function Opened() {
  const back = backTarget(useLocation().state, { path: '/fallback', label: 'Mặc định' });
  return <a data-testid="back" href={back.path}>{back.label}</a>;
}

const renderAt = (entry = '/enterprise/members') => render(
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/enterprise/members" element={<><OwnerMembersPage /><Address /></>} />
        <Route path="/enterprise/positions" element={<Opened />} />
        <Route path="/enterprise/departments/:id" element={<Opened />} />
        <Route path="/enterprise/members/:id" element={<Opened />} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>,
);
const lastParams = (): MemberListParams => useMembers.mock.calls.filter(([p]) => !p?.departmentId || p.pageIndex).at(-1)![0];

beforeEach(() => {
  useCurrentUser.setState({
    user: { id: 'owner', email: 'owner@sao-mai.vn', fullName: 'Chủ', roles: ['OWNER'], permissions: ['user.create', 'department.create_update'], workspace: 'enterprise' },
    isAuthenticated: true,
  });
  useMembers.mockImplementation((params: MemberListParams) => {
    if (params?.departmentId === 'kd' && params.status === 'ACTIVE' && !params.pageIndex) {
      // People of Kinh doanh for the manager dialog: a profile without an account (id = employee id) cannot lead.
      return { data: page([member('thang', 'Bùi Đức Thắng'), member('e-noacc', 'Không Tài Khoản', { employeeId: 'e-noacc' }), member('phuc', 'Lê Văn Phúc')]), isLoading: false };
    }
    const items = params?.noPosition ? [people[2]] : params?.status === 'PENDING' ? [people[3]] : people;
    return { data: page(items, params?.status === 'PENDING' ? 3 : items.length), isLoading: false, isFetching: false };
  });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('OW-02 Nhân sự', () => {
  it('lists what to act on with counts of the whole organization, each one filtering the list', () => {
    renderAt();
    const todo = screen.getByRole('region', { name: 'Cần xử lý' });
    expect(within(todo).getByRole('button', { name: /3 lời mời chưa kích hoạt/ })).toBeInTheDocument();
    // Marketing waits for its invited manager, Kế toán has one: only Kinh doanh needs one.
    expect(within(todo).getByRole('button', { name: /1 phòng ban chưa có trưởng phòng/ })).toBeInTheDocument();

    const noPosition = within(todo).getByRole('button', { name: /1 người chưa có vị trí/ });
    fireEvent.click(noPosition);
    expect(screen.getByTestId('address')).toHaveTextContent('?position=none');
    expect(lastParams()).toMatchObject({ noPosition: true });
    expect(noPosition).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('1 người khớp bộ lọc')).toBeInTheDocument();
  });

  it('shows one row per person: the name links to the member, the highest role only, a missing position, a reminder for invitations', () => {
    renderAt();
    const table = screen.getByRole('table');
    expect(within(table).getByRole('link', { name: 'Bùi Đức Thắng' })).toHaveAttribute('href', '/enterprise/members/thang');
    expect(within(table).getByText('ĐT')).toBeInTheDocument();
    const phuc = within(table).getByRole('link', { name: 'Lê Văn Phúc' }).closest('tr')!;
    expect(within(phuc).getByText('Quản lý')).toBeInTheDocument();
    expect(within(phuc).queryByText(/Nhân viên/)).not.toBeInTheDocument();
    expect(within(within(table).getByRole('link', { name: 'Ngô Chi' }).closest('tr')!).getByText('Chưa có vị trí')).toBeInTheDocument();
    // Active people carry no status pill; the invitation does, with its reminder.
    expect(within(table).queryByText('Đang hoạt động')).not.toBeInTheDocument();
    const dung = within(table).getByRole('link', { name: 'Trần Dung' }).closest('tr')!;
    expect(within(dung).getByText('Chờ kích hoạt')).toBeInTheDocument();
    expect(within(dung).getByRole('button', { name: 'Gửi lại lời mời cho Trần Dung' })).toBeInTheDocument();
  });

  it('reads the filters from the address and resends every pending invitation, not only the rows on screen, after asking', async () => {
    getList.mockResolvedValue({ data: { data: page([people[3], member('inv-a', 'An', { status: 'PENDING' }), member('inv-b', 'Bảo', { status: 'PENDING' })], 3) } });
    resendInvitation.mockResolvedValue({});
    renderAt('/enterprise/members?status=PENDING');
    expect(lastParams()).toMatchObject({ status: 'PENDING' });

    fireEvent.click(screen.getByRole('button', { name: 'Gửi lại lời mời cho cả 3 người' }));
    const dialog = screen.getByRole('dialog', { name: 'Gửi lại lời mời cho 3 người?' });
    expect(resendInvitation).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Gửi lời mời' }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Đã gửi lại lời mời cho 3 người'));
    expect(getList).toHaveBeenCalledWith(expect.objectContaining({ status: 'PENDING', pageIndex: 1, pageSize: 100 }));
    expect(resendInvitation.mock.calls.map(([id]) => id)).toEqual(['inv-dung', 'inv-a', 'inv-b']);
  });

  it('tells a search with no result apart from an empty organization', () => {
    useMembers.mockImplementation(() => ({ data: page([]), isLoading: false, isFetching: false }));
    renderAt('/enterprise/members?q=zzzz');
    expect(screen.getByText('Không có ai khớp bộ lọc')).toBeInTheDocument();
    expect(screen.queryByText('Chưa có ai trong tổ chức')).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Xóa bộ lọc' })[0]);
    expect(screen.getByTestId('address')).toBeEmptyDOMElement();
    expect(screen.getByText('Chưa có ai trong tổ chức')).toBeInTheDocument();
  });

  it('chooses a missing department manager in place, among the people of the department who can sign in', async () => {
    setManager.mockResolvedValue({});
    renderAt('/enterprise/members?tab=departments&manager=none');
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(2); // header + Kinh doanh
    expect(within(table).queryByText('Kế toán')).not.toBeInTheDocument();

    fireEvent.click(within(table).getByRole('button', { name: 'Chọn trưởng phòng' }));
    const dialog = screen.getByRole('dialog', { name: 'Trưởng phòng Kinh doanh' });
    // No account → cannot lead; Lê Văn Phúc already leads Kế toán.
    expect(within(dialog).getAllByRole('radio')).toHaveLength(1);
    fireEvent.click(within(dialog).getByRole('radio', { name: /Bùi Đức Thắng/ }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Đặt làm trưởng phòng' }));
    await waitFor(() => expect(setManager).toHaveBeenCalledWith({ id: 'kd', managerEmployeeId: 'e-thang' }));
  });

  it('leads the pages it opens back to Nhân sự with the same tab and filters', () => {
    const { unmount } = renderAt('/enterprise/members?status=PENDING');
    fireEvent.click(screen.getByRole('link', { name: 'Vị trí công việc' }));
    expect(screen.getByTestId('back')).toHaveTextContent('Nhân sự');
    expect(screen.getByTestId('back')).toHaveAttribute('href', '/enterprise/members?status=PENDING');
    unmount();

    renderAt('/enterprise/members?tab=departments&manager=none');
    fireEvent.click(screen.getByRole('link', { name: 'Kinh doanh' }));
    expect(screen.getByTestId('back')).toHaveAttribute('href', '/enterprise/members?tab=departments&manager=none');
  });
});
