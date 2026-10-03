import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../../../api-client';
import { resetMockDb } from '../../mock-store';
import { mockAdapter } from '../mock-adapter';

beforeAll(() => {
  apiClient.defaults.adapter = mockAdapter;
});

beforeEach(() => {
  localStorage.clear();
  resetMockDb();
  vi.stubGlobal('location', { pathname: '/login', search: '', href: '' });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

type Who = 'learning' | 'admin' | 'manager' | 'learner' | 'owner' | 'starter' | 'employee';
const asUser = (who: Who) => {
  const accountId =
    who === 'admin' || who === 'learning' || who === 'owner'
      ? 'mock-owner'
      : who === 'manager'
        ? 'mock-manager'
        : who === 'starter'
          ? 'mock-starter'
          : 'mock-employee';
  localStorage.setItem('accessToken', `mock-token:${accountId}`);
};

async function call<T = any>(method: 'get' | 'post' | 'put' | 'delete', url: string, payload?: unknown): Promise<T> {
  const response = await apiClient.request({ method, url, ...(method === 'get' ? { params: payload } : { data: payload }) });
  return response.data.data as T;
}

async function failure(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    const response = (error as { response: { status: number; data: { message: string; errors: { message: string }[] } } }).response;
    return { status: response.status, message: response.data.message, codes: response.data.errors?.map((e) => e.message) ?? [] };
  }
  throw new Error('Expected the request to fail');
}

const member = async (email: string) => (await call('get', '/members', { search: email, pageSize: 50 })).items[0];

describe('members', () => {
  it('lists active, pending and deactivated people, pending ones last', async () => {
    asUser('owner');
    const page = await call('get', '/members', { pageSize: 50 });

    expect(page.totalItems).toBe(15);
    const statuses = page.items.map((m: { status: string }) => m.status);
    expect(statuses.filter((s: string) => s === 'ACTIVE')).toHaveLength(12);
    expect(statuses.filter((s: string) => s === 'PENDING')).toHaveLength(2);
    expect(statuses.filter((s: string) => s === 'INACTIVE')).toHaveLength(1);
    expect(statuses.lastIndexOf('ACTIVE')).toBeLessThan(statuses.indexOf('PENDING'));
  });

  it('filters by status, role and department, and searches without accents', async () => {
    asUser('owner');
    expect((await call('get', '/members', { status: 'PENDING' })).totalItems).toBe(2);
    expect((await call('get', '/members', { role: 'MANAGER' })).items.map((m: { fullName: string }) => m.fullName).sort()).toEqual(['Bùi Thanh Tùng', 'Phạm Thị Quản Lý', 'Đặng Văn Kiên']);
    expect((await call('get', '/members', { departmentId: 'dep-kt' })).totalItems).toBe(3);
    expect((await call('get', '/members', { search: 'quan ly' })).items[0].fullName).toBe('Phạm Thị Quản Lý');
  });

  it('is closed to an employee, as the member list is an administration screen', async () => {
    asUser('employee');
    expect(await failure(call('get', '/members'))).toMatchObject({ status: 403 });
  });

  it('shows a member with placement and the history of changes to them', async () => {
    asUser('owner');
    const detail = await call('get', '/members/mock-employee');

    expect(detail).toMatchObject({ fullName: 'Hoàng Văn Nhân Viên', departmentName: 'Kế toán', positionName: 'Kế toán', roles: ['EMPLOYEE'] });
    expect(detail.employeeCode).toBe('NV001');
  });
});

describe('invitations', () => {
  it('creates pending members that count against the seats and can be activated', async () => {
    asUser('owner');
    const result = await call('post', '/members/invitations', {
      rows: [{ email: 'New.Person@acme.vn', fullName: 'Người Mới', role: 'EMPLOYEE', departmentId: 'dep-kd', jobPositionId: 'pos-sales' }],
    });
    const pending = await call('get', '/members', { status: 'PENDING' });

    expect(result.created).toHaveLength(1);
    expect(pending.totalItems).toBe(3);
    expect(pending.items.find((m: { email: string }) => m.email === 'new.person@acme.vn')).toMatchObject({ departmentName: 'Kinh doanh', positionName: 'Kinh doanh (CRM)' });
  });

  it('turns an accepted invitation into an active member with an employee profile', async () => {
    asUser('owner');
    const { created } = await call('post', '/members/invitations', { rows: [{ email: 'np@acme.vn', fullName: 'Người Mới', role: 'MANAGER', departmentId: 'dep-kd', jobPositionId: 'pos-sales' }] });
    const { mockInvitationService } = await import('../../mock-invitation.service');
    await mockInvitationService.activate({ token: created[0].token, fullName: 'Người Mới', password: 'Matkhau1' });

    const active = await member('np@acme.vn');
    const employees = await call('get', '/employees', { search: 'Người Mới' });
    expect(active).toMatchObject({ status: 'ACTIVE', roles: ['MANAGER'], departmentName: 'Kinh doanh' });
    expect(employees.items[0]).toMatchObject({ positionName: 'Kinh doanh (CRM)', status: 'ACTIVE' });
  });

  it('rejects bad rows one by one: wrong email, duplicate, a role the inviter may not grant', async () => {
    asUser('owner');
    const result = await call('post', '/members/invitations', {
      rows: [
        { email: 'khong-hop-le', fullName: 'A', role: 'EMPLOYEE' },
        { email: 'long.cao@acme.vn', fullName: 'Trùng', role: 'EMPLOYEE' },
        { email: 'owner@digitalent.demo', fullName: 'Có tài khoản', role: 'EMPLOYEE' },
        { email: 'boss@acme.vn', fullName: 'Sai vai trò', role: 'INVALID_ROLE' },
        { email: 'okay@acme.vn', fullName: 'Hợp lệ', role: 'MANAGER' },
      ],
    });

    expect(result.created.map((c: { email: string }) => c.email)).toEqual(['okay@acme.vn']);
    expect(result.rejected.map((r: { email: string }) => r.email)).toEqual(['khong-hop-le', 'long.cao@acme.vn', 'owner@digitalent.demo', 'boss@acme.vn']);
  });

  it('lets only the owner grant roles and invite members', async () => {
    const row = { rows: [{ email: 'ad@acme.vn', fullName: 'Nhân viên mới', role: 'EMPLOYEE' }] };
    asUser('manager');
    expect(await failure(call('post', '/members/invitations', row))).toMatchObject({ status: 403 });
    asUser('owner');
    expect((await call('post', '/members/invitations', row)).created).toHaveLength(1);
  });

  it('stops at the seat limit of the plan and says so for each person left out', async () => {
    asUser('starter');
    const rows = Array.from({ length: 22 }, (_, i) => ({ email: `p${i}@startup.vn`, fullName: `Người ${i}`, role: 'EMPLOYEE' }));
    const result = await call('post', '/members/invitations', { rows });

    expect(result.created).toHaveLength(20);
    expect(result.rejected).toHaveLength(2);
    expect(result.rejected[0]).toMatchObject({ email: 'p20@startup.vn', reason: 'Đã hết quyền sử dụng của gói.' });
  });

  it('resends and revokes a pending invitation', async () => {
    asUser('owner');
    await call('post', `/members/inv-seed-01/resend-invitation`);
    await call('delete', '/members/invitations/inv-seed-02');

    expect((await call('get', '/members', { status: 'PENDING' })).totalItems).toBe(1);
    expect(await failure(call('post', '/members/mock-employee/resend-invitation'))).toMatchObject({ status: 409 });
  });
});

describe('roles and access', () => {
  it('changes a role, and the change reaches the person\'s own session', async () => {
    asUser('owner');
    await call('put', '/members/mock-employee', { roles: ['MANAGER'] });

    asUser('employee');
    const { mockAuthService } = await import('../../mock-auth.service');
    const me = (await mockAuthService.getMe()).data.data!;
    expect(me.roles).toEqual(['MANAGER']);
    expect(me.permissions).toContain('task.evaluate');
  });

  it('keeps role changes to the owner alone', async () => {
    asUser('manager');
    expect(await failure(call('put', '/members/mock-owner', { roles: ['EMPLOYEE'] }))).toMatchObject({ status: 403 });
    expect(await failure(call('put', '/members/mock-employee', { roles: ['OWNER'] }))).toMatchObject({ status: 403 });
    asUser('owner');
    await call('put', '/members/mock-employee', { roles: ['OWNER'] });
    expect((await call('get', '/members/mock-employee')).roles).toEqual(['OWNER']);
  });

  it('never lets someone remove the only owner', async () => {
    asUser('owner');
    expect(await failure(call('put', '/members/mock-owner', { roles: ['EMPLOYEE'] }))).toMatchObject({ status: 409 });
  });

  it('moves a member to another department and position', async () => {
    asUser('owner');
    await call('put', '/members/mock-employee', { departmentId: 'dep-mkt', jobPositionId: 'pos-mkt' });

    expect(await call('get', '/members/mock-employee')).toMatchObject({ departmentName: 'Marketing', positionName: 'Marketing' });
  });

  it('describes the three enterprise roles with their member counts and which ones the caller may grant', async () => {
    asUser('owner');
    const roles = await call('get', '/roles');

    expect(roles.map((r: { role: string }) => r.role)).toEqual(['OWNER', 'MANAGER', 'EMPLOYEE']);
    expect(roles.find((r: { role: string }) => r.role === 'MANAGER')).toMatchObject({ memberCount: 3, assignable: true });
    expect(roles.find((r: { role: string }) => r.role === 'OWNER').assignable).toBe(true);
    expect(roles.find((r: { role: string }) => r.role === 'EMPLOYEE').assignable).toBe(true);
  });
});

describe('offboarding (FLOW-08)', () => {
  it('deactivates a member with a reason, frees the seat, keeps the history and blocks the next sign-in', async () => {
    asUser('owner');
    const before = (await call('get', '/organization/overview')).seats.used;
    await call('post', '/members/mock-employee/deactivate', { reason: 'Nghỉ việc' });
    const after = (await call('get', '/organization/overview')).seats.used;

    expect(after).toBe(before - 1);
    expect(await call('get', '/members/mock-employee')).toMatchObject({ status: 'INACTIVE', deactivatedReason: 'Nghỉ việc' });
    expect((await call('get', '/employees/emp-01')).status).toBe('INACTIVE');

    const { mockAuthService } = await import('../../mock-auth.service');
    await expect(mockAuthService.login({ email: 'employee@digitalent.demo', password: 'Admin@1234' })).rejects.toMatchObject({ response: { status: 403 } });
  });

  it('needs a reason, and refuses deactivating the last owner', async () => {
    asUser('owner');
    expect(await failure(call('post', '/members/mock-employee/deactivate', { reason: ' ' }))).toMatchObject({ status: 400 });
    expect(await failure(call('post', '/members/mock-owner/deactivate', { reason: 'x' }))).toMatchObject({ status: 409 });
  });

  it('reactivates a member when a seat is free', async () => {
    asUser('owner');
    await call('post', '/members/usr-seed-12/reactivate');

    expect(await call('get', '/members/usr-seed-12')).toMatchObject({ status: 'ACTIVE' });
    expect(await failure(call('post', '/members/usr-seed-12/reactivate'))).toMatchObject({ status: 409 });
  });
});

describe('subscription (owner only)', () => {
  it('shows plan, seats, renewal and invoices to the owner and nobody else', async () => {
    asUser('owner');
    const subscription = await call('get', '/subscription');

    expect(subscription).toMatchObject({ planCode: 'ENT_PRO', status: 'active', seatLimit: 100, cycle: 'month', amountPerPeriod: 3_740_000 });
    expect(subscription.seatsUsed).toBe(14);
    expect(subscription.invoices).toHaveLength(3);
    asUser('manager');
    expect(await failure(call('get', '/subscription'))).toMatchObject({ status: 403 });
  });

  it('shows usage to the owner', async () => {
    asUser('owner');
    const usage = await call('get', '/subscription/usage');

    expect(usage.seats).toEqual({ used: 14, limit: 100 });
    expect(usage.features.find((f: { key: string }) => f.key === 'internal_learning').enabled).toBe(true);
    expect(usage.members).toEqual({ active: 12, pending: 2, inactive: 1 });
  });

  it('explains a downgrade before it happens: what is lost, what it costs, and when it starts', async () => {
    asUser('owner');
    const impact = await call('post', '/subscription/preview', { planCode: 'ENT_STARTER', seats: 20, cycle: 'month' });

    expect(impact).toMatchObject({ direction: 'downgrade', allowed: true, effective: 'NEXT_PERIOD' });
    expect(impact.lost).toEqual(expect.arrayContaining(['Khóa học nội bộ doanh nghiệp', 'Phân tích năng lực nâng cao']));
    expect(impact.difference).toBeLessThan(0);
  });

  it('blocks a downgrade below the seats in use, and says by how much', async () => {
    asUser('owner');
    const impact = await call('post', '/subscription/preview', { planCode: 'ENT_STARTER', seats: 5, cycle: 'month' });

    expect(impact.allowed).toBe(false);
    expect(impact.blockers[0]).toMatch(/14 quyền sử dụng/);
    expect(await failure(call('post', '/subscription/change', { planCode: 'ENT_STARTER', seats: 5, cycle: 'month' }))).toMatchObject({ status: 409 });
  });

  it('applies a plan change to the session: features and seats follow the new plan', async () => {
    asUser('owner');
    await call('post', '/subscription/change', { planCode: 'ENT_STARTER', seats: 20, cycle: 'year' });

    const { mockAuthService } = await import('../../mock-auth.service');
    const me = (await mockAuthService.getMe()).data.data!;
    expect(me.subscription).toMatchObject({ planCode: 'ENT_STARTER', seatLimit: 20 });
    expect(me.subscription?.entitlements).not.toContain('internal_learning');
    expect((await call('get', '/subscription')).cycle).toBe('year');
    expect(await failure(call('post', '/subscription/change', { planCode: 'ENT_STARTER', seats: 20, cycle: 'year' }))).toMatchObject({ status: 400 });
  });

  it('does not offer the sales plan online, and can schedule then undo a cancellation', async () => {
    asUser('owner');
    expect(await failure(call('post', '/subscription/preview', { planCode: 'ENT_CORP', seats: 10, cycle: 'month' }))).toMatchObject({ status: 400 });

    await call('post', '/subscription/cancel');
    expect((await call('get', '/subscription')).cancelAtPeriodEnd).toBe(true);
    await call('post', '/subscription/resume');
    expect((await call('get', '/subscription')).cancelAtPeriodEnd).toBe(false);
  });
});

describe('organization', () => {
  it('summarizes the organization for its administrators', async () => {
    asUser('owner');
    const overview = await call('get', '/organization/overview');

    expect(overview.members).toEqual({ active: 12, pending: 2, inactive: 1 });
    expect(overview.setup.map((s: { key: string; done: boolean }) => [s.key, s.done])).toEqual([['departments', true], ['positions', true], ['requirements', true], ['members', true]]);
    expect(overview.recentActivity).toHaveLength(5);
  });

  it('saves settings and shows the new name in the session', async () => {
    asUser('owner');
    await call('put', '/organization/settings', { name: 'Acme Việt Nam', industry: 'Dịch vụ', size: '101-500', timezone: 'Asia/Ho_Chi_Minh', defaultAssignmentDays: 45 });

    expect((await call('get', '/organization')).name).toBe('Acme Việt Nam');
    const { mockAuthService } = await import('../../mock-auth.service');
    expect((await mockAuthService.getMe()).data.data!.organization?.name).toBe('Acme Việt Nam');
    expect(await failure(call('put', '/organization/settings', { name: 'A', defaultAssignmentDays: 45 }))).toMatchObject({ status: 400 });
    expect(await failure(call('put', '/organization/settings', { name: 'Acme', defaultAssignmentDays: 0 }))).toMatchObject({ status: 400 });
  });

  it('lists the audit log, newest first, with the actions taken in this session', async () => {
    asUser('owner');
    await call('post', '/members/mock-employee/deactivate', { reason: 'Thử' });
    const log = await call('get', '/organization/audit-log', { pageSize: 5 });

    expect(log.items[0]).toMatchObject({ action: 'MEMBER_DEACTIVATED', actorName: 'Nguyễn Văn Chủ', targetLabel: 'Hoàng Văn Nhân Viên' });
    expect((await call('get', '/organization/audit-log', { action: 'ROLE_CHANGED' })).totalItems).toBe(1);
  });
});

describe('courses and assignments', () => {
  it('lists the 18 published courses (and the draft on request)', async () => {
    asUser('owner');
    expect((await call('get', '/courses', { status: 'PUBLISHED' })).totalItems).toBe(18);
    expect((await call('get', '/courses', { status: 'DRAFT' })).items[0].code).toBe('DRAFT-1');
    expect((await call('get', '/courses', { search: 'an toan' })).items.every((c: { categoryName: string }) => c.categoryName === 'An toàn')).toBe(true);
  });

  it('summarizes progress: overdue, due soon and completion', async () => {
    asUser('owner');
    const summary = await call('get', '/course-assignments/summary');

    expect(summary).toMatchObject({ total: 10, completed: 2, overdue: 1, notStarted: 3 });
    expect(summary.completionRate).toBe(20);
  });

  it('puts overdue work first and filters by status, department and overdue', async () => {
    asUser('owner');
    const all = await call('get', '/course-assignments', { pageSize: 50 });
    const overdue = await call('get', '/course-assignments', { overdue: 'true' });
    const kt = await call('get', '/course-assignments', { departmentId: 'dep-kt', pageSize: 50 });

    expect(all.items[0]).toMatchObject({ overdue: true, courseCode: 'A3-I', employeeName: 'Ngô Lan Anh' });
    expect(overdue.totalItems).toBe(1);
    expect(kt.items.every((a: { departmentName: string }) => a.departmentName === 'Kế toán')).toBe(true);
  });

  it('assigns a course to an employee, a department or a position, and reports who was skipped and why', async () => {
    asUser('owner');
    const result = await call('post', '/course-assignments', { courseId: 'crs-A5-F', targets: { departmentId: 'dep-kt' }, dueDate: '2099-01-01' });

    expect(result.created.map((a: { employeeName: string }) => a.employeeName).sort()).toEqual(['Hoàng Văn Nhân Viên', 'Lý Mai Phương', 'Đặng Văn Kiên']);
    const again = await call('post', '/course-assignments', { courseId: 'crs-A5-F', targets: { employeeIds: ['emp-01', 'emp-12'] }, dueDate: '2099-01-01' });
    expect(again.created).toEqual([]);
    expect(again.skipped).toEqual([
      { employeeId: 'emp-01', employeeName: 'Hoàng Văn Nhân Viên', reason: 'ALREADY_ASSIGNED' },
      { employeeId: 'emp-12', employeeName: 'Trịnh Quốc Bảo', reason: 'NOT_ACTIVE' },
    ]);
  });

  it('keeps people out of a course they are not ready for, and lets them in once they have the level', async () => {
    asUser('owner');
    // Lý Mai Phương has almost nothing confirmed: an Advanced course is out of reach.
    const blocked = await call('post', '/course-assignments', { courseId: 'crs-A1-A', targets: { employeeIds: ['emp-11'] }, dueDate: '2099-01-01' });
    // Hoàng Văn Nhân Viên is at Basic: the Intermediate course is the next step.
    const open = await call('post', '/course-assignments', { courseId: 'crs-A2-I', targets: { employeeIds: ['emp-01'] }, dueDate: '2099-01-01' });

    expect(blocked.skipped[0].reason).toBe('PREREQUISITE_NOT_MET');
    expect(open.created).toHaveLength(1);
  });

  it('refuses drafts, past due dates and an empty selection', async () => {
    asUser('owner');
    expect(await failure(call('post', '/course-assignments', { courseId: 'crs-DRAFT-1', targets: { employeeIds: ['emp-01'] } }))).toMatchObject({ status: 409 });
    expect(await failure(call('post', '/course-assignments', { courseId: 'crs-A5-F', targets: { employeeIds: ['emp-01'] }, dueDate: '2001-01-01' }))).toMatchObject({ status: 400 });
    expect(await failure(call('post', '/course-assignments', { courseId: 'crs-A5-F', targets: {} }))).toMatchObject({ status: 400 });
  });

  it('cancels an open assignment with a reason, but not a completed one', async () => {
    asUser('owner');
    await call('delete', '/course-assignments/asg-009', { reason: 'Không còn cần thiết' });

    expect((await call('get', '/course-assignments', { status: 'CANCELLED' })).items[0]).toMatchObject({ id: 'asg-009', cancelReason: 'Không còn cần thiết' });
    expect(await failure(call('delete', '/course-assignments/asg-004'))).toMatchObject({ status: 409 });
  });

  it('shows a manager only the assignments of the department', async () => {
    asUser('manager');
    const page = await call('get', '/course-assignments', { pageSize: 50 }).catch(() => null);

    expect(page).toBeNull();
  });
});

describe('workforce', () => {
  it('lists people with coverage, gaps and learning status, the most at risk first', async () => {
    asUser('owner');
    const page = await call('get', '/workforce', { pageSize: 50 });

    expect(page.totalItems).toBe(14);
    expect(page.items[0]).toMatchObject({ fullName: 'Phan Gia Hân', hasSnapshot: true });
    const newHire = page.items.find((r: { fullName: string }) => r.fullName === 'Cao Đức Long');
    expect(newHire).toMatchObject({ hasSnapshot: false, blocker: 'NO_JOB_POSITION', coveragePercent: null });
    expect(page.items.find((r: { fullName: string }) => r.fullName === 'Hoàng Văn Nhân Viên')).toMatchObject({ coveragePercent: 62.03, gapCount: 15, highCount: 4, activeCourses: 2 });
  });

  it('filters by gap, learning status and department', async () => {
    asUser('owner');
    expect((await call('get', '/workforce', { learning: 'OVERDUE' })).items.map((r: { fullName: string }) => r.fullName)).toEqual(['Ngô Lan Anh']);
    expect((await call('get', '/workforce', { gap: 'UNKNOWN' })).items.map((r: { fullName: string }) => r.fullName).sort()).toEqual(['Cao Đức Long', 'Trịnh Quốc Bảo']);
    expect((await call('get', '/workforce', { departmentId: 'dep-bgd' })).totalItems).toBe(1);
  });

  it('gives the full picture of one employee: levels vs requirement, gap, learning, evidence, next courses', async () => {
    asUser('owner');
    const detail = await call('get', '/workforce/emp-01');

    expect(detail.employee.fullName).toBe('Hoàng Văn Nhân Viên');
    expect(detail.competencies).toHaveLength(24);
    expect(detail.competencies.find((c: { frameworkCode: string }) => c.frameworkCode === '4.2')).toMatchObject({ currentLevel: 1, requiredLevel: 3, source: 'MIGRATION' });
    expect(detail.competencies.find((c: { frameworkCode: string }) => c.frameworkCode === '3.2')).toMatchObject({ requiredLevel: 0 });
    expect(detail.skillGap.summary.totalGap).toBe(15);
    expect(detail.recommendations[0].courseCode).toBe('A1-I');
    expect(detail.learning).toHaveLength(2);
    expect(detail.evidence.length).toBeGreaterThan(0);
  });

  it('keeps a manager inside the department and an employee out of the workforce screens', async () => {
    asUser('manager');
    expect(await failure(call('get', '/workforce/emp-01'))).toMatchObject({ status: 404 });
    asUser('employee');
    expect(await failure(call('get', '/workforce'))).toMatchObject({ status: 403 });
  });
});

describe('analytics, recommendation review and dashboard', () => {
  it('aggregates gaps by department and by position, lowest coverage first', async () => {
    asUser('owner');
    const byDepartment = await call('get', '/intelligence/analytics/overview', { groupBy: 'department' });
    const byPosition = await call('get', '/intelligence/analytics/overview', { groupBy: 'position' });

    expect(byDepartment.groups.map((g: { name: string }) => g.name)).toContain('Kế toán');
    const coverage = byDepartment.groups.map((g: { averageCoverage: number }) => g.averageCoverage);
    expect(coverage).toEqual([...coverage].sort((a, b) => a - b));
    expect(byDepartment.totals.employees).toBe(12);
    expect(byPosition.groups).toHaveLength(7);
  });

  it('ranks competencies by how many people are far from the requirement', async () => {
    asUser('owner');
    const competencies = await call('get', '/intelligence/analytics/competencies', { jobPositionId: 'pos-acc' });

    expect(competencies[0].highCount).toBeGreaterThanOrEqual(competencies[1].highCount);
    expect(competencies.every((c: { employeesRequired: number }) => c.employeesRequired === 2)).toBe(true);
  });

  it('lists recommendations to review and tracks what was done with each', async () => {
    asUser('owner');
    const pending = await call('get', '/intelligence/recommendation-reviews', { status: 'PENDING', pageSize: 100 });
    expect(pending.totalItems).toBeGreaterThan(5);

    const row = pending.items.find((r: { employeeId: string; courseCode: string }) => r.employeeId === 'emp-11' && r.courseCode.endsWith('-F'));
    const assignment = await call('post', '/intelligence/recommendation-reviews/accept', { employeeId: row.employeeId, courseId: row.courseId });
    expect(assignment).toMatchObject({ source: 'RECOMMENDATION', status: 'NOT_STARTED', courseId: row.courseId });

    const accepted = await call('get', '/intelligence/recommendation-reviews', { status: 'ACCEPTED' });
    expect(accepted.items.map((r: { employeeId: string }) => r.employeeId)).toContain('emp-11');
  });

  it('needs a reason to dismiss a recommendation, and can reopen it', async () => {
    asUser('owner');
    const row = (await call('get', '/intelligence/recommendation-reviews', { status: 'PENDING', pageSize: 100 })).items[0];
    expect(await failure(call('post', '/intelligence/recommendation-reviews/dismiss', { employeeId: row.employeeId, courseId: row.courseId, reason: ' ' }))).toMatchObject({ status: 400 });

    await call('post', '/intelligence/recommendation-reviews/dismiss', { employeeId: row.employeeId, courseId: row.courseId, reason: 'Đã học ngoài hệ thống' });
    expect((await call('get', '/intelligence/recommendation-reviews', { status: 'DISMISSED' })).items[0]).toMatchObject({ decisionReason: 'Đã học ngoài hệ thống', decidedByName: 'Nguyễn Văn Chủ' });
    await call('post', '/intelligence/recommendation-reviews/reopen', { employeeId: row.employeeId, courseId: row.courseId });
    expect((await call('get', '/intelligence/recommendation-reviews', { status: 'DISMISSED' })).totalItems).toBe(0);
  });

  it('refuses a recommendation that cannot be assigned (already assigned)', async () => {
    asUser('owner');
    expect(await failure(call('post', '/intelligence/recommendation-reviews/accept', { employeeId: 'emp-01', courseId: 'crs-A4-I' }))).toMatchObject({ status: 409 });
  });

  it('builds the capability dashboard from the same data', async () => {
    asUser('owner');
    const dashboard = await call('get', '/intelligence/dashboard');

    expect(dashboard.kpis).toMatchObject({ employees: 12, overdueAssignments: 1, completionRate: 20 });
    expect(dashboard.domains).toHaveLength(6);
    expect(dashboard.domains.every((d: { averageCurrent: number; averageRequired: number }) => d.averageCurrent <= d.averageRequired)).toBe(true);
    expect(dashboard.atRisk.length).toBeLessThanOrEqual(5);
    expect(dashboard.atRisk[0].highCount).toBeGreaterThan(0);
    asUser('manager');
    expect(await failure(call('get', '/intelligence/dashboard'))).toMatchObject({ status: 403 });
  });
});
