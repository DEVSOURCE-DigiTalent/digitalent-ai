import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IMPORT_ROLE_ERROR, parseSmartEmployeeCsv, RESEARCH_OFF_IMPORT } from '../utils/employee-import-helper';

const invite = vi.fn();
let researchOn = true;

vi.mock('@/hooks/use-current-user', () => ({
  useCurrentUser: (select: (state: unknown) => unknown) =>
    select({ user: { id: 'owner-1', roles: ['OWNER'], subscription: undefined } }),
}));
vi.mock('@/hooks/use-members', () => ({
  MEMBERS_KEY: ['members'],
  useInviteMembers: () => ({ mutateAsync: invite, isPending: false }),
}));
vi.mock('@/hooks/use-departments', () => ({
  useDepartments: () => ({ data: { items: [{ id: 'sales', name: 'Kinh doanh', managerEmployeeId: 'm1' }] } }),
}));
vi.mock('@/hooks/use-job-positions', () => ({
  useJobPositions: () => ({ data: { items: [{ id: 'pos-sales', code: 'SALES_CRM', name: 'Sales / CRM' }] } }),
}));
vi.mock('@/features/enterprise-research/research-api', () => ({
  useResearchSettings: () => ({ data: researchOn }),
}));

const { InviteMembersModal } = await import('../components/InviteMembersModal');

const DEPARTMENTS = [{ id: 'sales', name: 'Kinh doanh' }];
const POSITIONS = [{ id: 'pos-sales', code: 'SALES_CRM', name: 'Sales / CRM' }];
const FILE = [
  'Họ tên,Email,Phòng ban,Vị trí,Vai trò',
  'Nguyễn Thảo Vy,vy@congty.vn,,,R&D',
  'Trần Quốc Bảo,bao@congty.vn,Kinh doanh,Sales / CRM,r&d',
  'Lê Long,long@congty.vn,Kinh doanh,Sales / CRM,Nhân viên',
  'Phạm An,an@congty.vn,Kinh doanh,Sales / CRM,Giám đốc',
].join('\n');

describe('R&D in the member import file', () => {
  it('takes R&D rows without department or position when R&D is on', () => {
    const { rows } = parseSmartEmployeeCsv(FILE, DEPARTMENTS, POSITIONS, { researchEnabled: true });
    const [vy, bao, long, an] = rows;
    expect(vy).toMatchObject({ role: 'RND', departmentId: '', jobPositionId: '', isValid: true });
    // a department or position written for R&D is not used
    expect(bao).toMatchObject({ role: 'RND', departmentId: '', departmentName: '', jobPositionId: '', isValid: true });
    expect(long).toMatchObject({ role: 'EMPLOYEE', departmentId: 'sales', jobPositionId: 'pos-sales', isValid: true });
    expect(an.errors).toContain(IMPORT_ROLE_ERROR);
  });

  it('flags R&D rows while R&D is off, the other rows still go', () => {
    const { rows } = parseSmartEmployeeCsv(FILE, DEPARTMENTS, POSITIONS);
    expect(rows[0].errors).toEqual([RESEARCH_OFF_IMPORT]);
    expect(rows[2].isValid).toBe(true);
  });
});

describe('R&D in the invite form', () => {
  beforeEach(() => {
    invite.mockReset().mockResolvedValue({ created: [], rejected: [] });
    researchOn = true;
  });

  it('hides department and position for R&D and invites the person without them', async () => {
    render(<InviteMembersModal open onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Thêm từng nhân viên/ }));

    fireEvent.change(screen.getByLabelText(/Phòng ban/), { target: { value: 'sales' } });
    fireEvent.change(screen.getByLabelText(/Vai trò trong hệ thống/), { target: { value: 'RND' } });
    expect(screen.queryByLabelText(/Phòng ban/)).toBeNull();
    expect(screen.queryByLabelText(/Vị trí công việc/)).toBeNull();
    expect(screen.getByText(/không thuộc phòng ban hay vị trí/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Họ và tên/), { target: { value: 'Nguyễn Thảo Vy' } });
    fireEvent.change(screen.getByLabelText(/Email nhân viên/), { target: { value: 'vy@congty.vn' } });
    fireEvent.click(screen.getByRole('button', { name: /Thêm vào danh sách chờ/ }));
    expect(screen.getByText('R&D · không thuộc phòng ban')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Gửi 1 lời mời ngay/ }));
    await waitFor(() => expect(invite).toHaveBeenCalledWith([
      { fullName: 'Nguyễn Thảo Vy', email: 'vy@congty.vn', employeeCode: undefined, role: 'RND' },
    ]));
  });
});
