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
  // A 401 sends the browser to the login page; on the login page itself the client does not navigate.
  vi.stubGlobal('location', { pathname: '/login', search: '', href: '' });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

type Who = 'learning' | 'admin' | 'manager' | 'learner' | 'owner' | 'employee';
const asUser = (who: Who) => {
  const accountId = who === 'admin' || who === 'learning' || who === 'owner' ? 'mock-owner' : who === 'manager' ? 'mock-manager' : 'mock-employee';
  localStorage.setItem('accessToken', `mock-token:${accountId}`);
};

/** Calls the mock REST API like a service does; returns `data` of the ApiResponse or `{status, message, errors}` of a failure. */
async function call<T = any>(method: 'get' | 'post' | 'put' | 'delete', url: string, payload?: unknown): Promise<T> {
  const response = await apiClient.request({ method, url, ...(method === 'get' ? { params: payload } : { data: payload }) });
  return response.data.data as T;
}

async function failure(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    const response = (error as { response: { status: number; data: { message: string; errors: { message: string }[] } } }).response;
    return { status: response.status, message: response.data.message, codes: response.data.errors.map((e) => e.message) };
  }
  throw new Error('Expected the request to fail');
}

describe('access', () => {
  it('answers 401 without a valid session', async () => {
    expect(await failure(call('get', '/departments'))).toMatchObject({ status: 401 });
  });

  it('answers 403 to a role without the permission, as the backend would', async () => {
    asUser('learner');
    expect(await failure(call('get', '/departments'))).toMatchObject({ status: 403 });
    expect(await failure(call('get', '/employees'))).toMatchObject({ status: 403 });
  });

  it('answers 404 for an unknown endpoint', async () => {
    asUser('learning');
    expect(await failure(call('get', '/nope'))).toMatchObject({ status: 404 });
  });
});

describe('departments', () => {
  it('lists the departments of the organization, searchable without accents', async () => {
    asUser('learning');
    const all = await call('get', '/departments', { pageSize: 50 });
    const found = await call('get', '/departments', { search: 'ke toan' });

    expect(all.items.map((d: { code: string }) => d.code).sort()).toEqual(['BGD', 'KD', 'KT', 'MKT', 'NS']);
    expect(found.items.map((d: { name: string }) => d.name)).toEqual(['Kế toán']);
  });

  it('refuses a duplicate code and archives only a department with no active people', async () => {
    asUser('admin');
    expect(await failure(call('post', '/departments', { code: 'kd', name: 'Trùng mã' }))).toMatchObject({ status: 409, message: 'Mã phòng ban đã tồn tại.' });

    const { id } = await call('post', '/departments', { code: 'PH', name: 'Pháp chế' });
    await call('delete', `/departments/${id}`);
    const list = await call('get', '/departments', { pageSize: 50 });
    expect(list.items.some((d: { id: string }) => d.id === id)).toBe(false);

    const kd = list.items.find((d: { code: string }) => d.code === 'KD');
    expect(await failure(call('delete', `/departments/${kd.id}`))).toMatchObject({ status: 409 });
  });

});

describe('employees and data scope', () => {
  it('shows HR the whole organization and a manager only their department', async () => {
    asUser('learning');
    const everyone = await call('get', '/employees', { pageSize: 50 });
    asUser('manager');
    const team = await call('get', '/employees', { pageSize: 50 });

    expect(everyone.totalItems).toBe(14);
    expect(team.items.map((e: { departmentName: string }) => e.departmentName)).toEqual(Array(team.items.length).fill('Kinh doanh'));
    expect(team.totalItems).toBeLessThan(everyone.totalItems);
  });

  it('filters by department, position and status, and by name without accents', async () => {
    asUser('learning');
    const accountants = await call('get', '/employees', { positionId: 'pos-acc', pageSize: 50 });
    const byName = await call('get', '/employees', { search: 'hoang van' });
    const left = await call('get', '/employees', { status: 'INACTIVE' });

    expect(accountants.items.map((e: { employeeCode: string }) => e.employeeCode)).toEqual(['NV001', 'NV011']);
    expect(byName.items.map((e: { fullName: string }) => e.fullName)).toEqual([expect.stringMatching(/Hoàng Văn (Học|Nhân) Viên/)]);
    expect(left.items.map((e: { fullName: string }) => e.fullName)).toEqual(['Trịnh Quốc Bảo']);
  });

  it('keeps a manager from reading an employee of another department', async () => {
    asUser('manager');
    expect(await failure(call('get', '/employees/emp-01'))).toMatchObject({ status: 404 });
  });

  it('transfers an employee and rejects a department that does not exist', async () => {
    asUser('admin');
    await call('post', '/employees/emp-06/transfer', { departmentId: 'dep-mkt' });
    expect((await call('get', '/employees/emp-06')).departmentName).toBe('Marketing');
    expect(await failure(call('post', '/employees/emp-06/transfer', { departmentId: 'dep-none' }))).toMatchObject({ status: 400 });
  });
});

describe('position requirements', () => {
  it('returns the active set of a reference position with its versions', async () => {
    asUser('learning');
    const accountant = await call('get', '/position-requirements', { positionId: 'pos-acc' });

    expect(accountant).toMatchObject({ jobPositionName: 'Kế toán', versionNo: 1, status: 'ACTIVE' });
    expect(accountant.items).toHaveLength(21);
    expect(accountant.items.filter((i: { isMandatory: boolean }) => i.isMandatory)).toHaveLength(5);
    expect(accountant.versions).toMatchObject([{ id: 'req-pos-acc-1', versionNo: 1, status: 'ACTIVE' }]);
  });

  it('keeps the history: a replaced set, an active one and a draft', async () => {
    asUser('learning');
    const sales = await call('get', '/position-requirements', { positionId: 'pos-sales' });
    const marketing = await call('get', '/position-requirements', { positionId: 'pos-mkt' });
    const oldSales = await call('get', '/position-requirements', { positionId: 'pos-sales', versionNo: 1 });

    expect(sales.versions.map((v: { versionNo: number; status: string }) => `${v.versionNo}:${v.status}`)).toEqual(['2:ACTIVE', '1:RETIRED']);
    expect(oldSales.items).toHaveLength(9);
    expect(marketing.versions.map((v: { status: string }) => v.status)).toEqual(['DRAFT', 'ACTIVE']);
  });

  it('reports a position with no set at all as empty, so the editor starts a draft', async () => {
    asUser('learning');
    const { id } = await call('post', '/job-positions', { code: 'LEGAL', name: 'Pháp chế' });
    const output = await call('get', '/position-requirements', { positionId: id });

    expect(output.id).toBeUndefined();
    expect(output.items).toEqual([]);
  });

  it('refuses a second draft, and an edit of a set that is not a draft', async () => {
    asUser('learning');
    expect(await failure(call('post', '/position-requirements', { jobPositionId: 'pos-mkt', items: [] }))).toMatchObject({ status: 409 });
    expect(await failure(call('put', '/position-requirements/req-pos-acc-1', { items: [] }))).toMatchObject({ status: 409 });
  });

  it('refuses to activate a set that breaks the rules, with a code the screen can map', async () => {
    asUser('learning');
    const draft = await call('post', '/position-requirements', {
      jobPositionId: 'pos-acc',
      items: [{ competencyId: 'cmp-1-1', requiredLevel: 2, weightPercent: 100, isMandatory: false }],
    });
    expect(draft.status).toBe('DRAFT');

    expect(await failure(call('post', `/position-requirements/${draft.id}/activate`))).toMatchObject({ status: 400, codes: ['REQUIREMENT_COUNT_OUT_OF_RANGE'] });

    const noCore = Array.from({ length: 9 }, (_, i) => ({ competencyId: `cmp-1-${(i % 3) + 1}`, requiredLevel: 2, weightPercent: 11.11, isMandatory: false }));
    await call('put', `/position-requirements/${draft.id}`, { items: ['2-1', '2-2', '2-3', '2-4', '2-5', '2-6', '3-1', '3-2', '3-3'].map((c) => ({ competencyId: `cmp-${c}`, requiredLevel: 2, weightPercent: 11.11, isMandatory: false })) });
    expect(noCore).toHaveLength(9);
    expect(await failure(call('post', `/position-requirements/${draft.id}/activate`))).toMatchObject({ codes: ['CORE_COMPETENCY_MISSING'] });

    await call('put', `/position-requirements/${draft.id}`, { items: ['4-1', '4-2', '2-1', '2-2', '2-3', '2-4', '2-5', '2-6', '3-1'].map((c) => ({ competencyId: `cmp-${c}`, requiredLevel: 2, weightPercent: 10, isMandatory: false })) });
    expect(await failure(call('post', `/position-requirements/${draft.id}/activate`))).toMatchObject({ codes: ['WEIGHT_SUM_INVALID'] });
  });

  it('activates a valid draft: the old set is retired and everyone in the position gets a new snapshot', async () => {
    asUser('learning');
    const before = (await call('get', '/intelligence/skill-gaps', { jobPositionId: 'pos-mkt', pageSize: 50 })).items;
    const draft = await call('get', '/position-requirements', { positionId: 'pos-mkt', versionNo: 2 });

    const activated = await call('post', `/position-requirements/${draft.id}/activate`);
    const set = await call('get', '/position-requirements', { positionId: 'pos-mkt' });
    const after = (await call('get', '/intelligence/skill-gaps', { jobPositionId: 'pos-mkt', pageSize: 50 })).items;

    expect(activated).toMatchObject({ versionNo: 2, status: 'ACTIVE' });
    expect(set.versions.map((v: { status: string }) => v.status)).toEqual(['ACTIVE', 'RETIRED']);
    expect(after.every((row: { requirementSetVersionNo: number }) => row.requirementSetVersionNo === 2)).toBe(true);
    expect(before.every((row: { requirementSetVersionNo: number }) => row.requirementSetVersionNo === 1)).toBe(true);
  });

  it('is read-only for an organization that is not allowed to manage requirements', async () => {
    asUser('manager');
    expect(await failure(call('post', '/position-requirements', { jobPositionId: 'pos-acc', items: [] }))).toMatchObject({ status: 403 });
  });
});

describe('competency framework', () => {
  it('lists the 24 competencies by domain and gives the criteria of one', async () => {
    asUser('learning');
    const page = await call('get', '/competencies', { pageSize: 100 });
    const detail = await call('get', '/competencies/cmp-4-2');

    expect(page.totalItems).toBe(24);
    expect(page.items[0]).toMatchObject({ frameworkCode: '1.1', categorySortOrder: 1 });
    expect(detail.name).toBe('Bảo vệ dữ liệu cá nhân và quyền riêng tư');
    expect(detail.criteria.map((c: { level: number }) => c.level)).toEqual([1, 2, 3]);
  });

  it('keeps the standard framework closed to customers', async () => {
    asUser('admin');
    expect(await failure(call('post', '/competencies', { name: 'X' }))).toMatchObject({ status: 403 });
  });
});

describe('skill gap and recommendations of the demo accountant (spec section 8)', () => {
  it('matches the numbers of the spec: 21 required, 6 met, 4 HIGH, 1 MEDIUM, 10 LOW, 62.03% covered', async () => {
    asUser('learner');
    const run = await call('get', '/intelligence/skill-gaps/me/latest');

    expect(run.summary).toMatchObject({ totalRequired: 21, totalMet: 6, totalGap: 15, highCount: 4, mediumCount: 1, lowCount: 10, coveragePercent: 62.03 });
    expect(run.employeeName).toMatch(/Hoàng Văn (Học|Nhân) Viên/);
    expect(run.items[0].severity).toBe('HIGH');
  });

  it('recommends the next-step courses, the most useful first', async () => {
    asUser('learner');
    const result = await call('get', '/intelligence/recommendations');

    expect(result.reason).toBeNull();
    expect(result.items[0].courseCode).toBe('A1-I');
    // A4-I is already assigned to this learner, A1-I is in progress.
    expect(result.items.find((i: { courseCode: string }) => i.courseCode === 'A1-I').enrollmentStatus).toBe('IN_PROGRESS');
    expect(result.items.find((i: { courseCode: string }) => i.courseCode === 'A4-I').enrollmentStatus).toBe('NOT_STARTED');
  });

  it('updates the snapshot and the recommendations when HR confirms a level (spec step 5)', async () => {
    asUser('learning');
    await call('post', '/competency-evidences/manual', { employeeId: 'emp-01', competencyId: 'cmp-4-2', confirmedLevel: 2, reviewNote: 'Đạt bài thực hành bảo mật dữ liệu.' });

    asUser('learner');
    const run = await call('get', '/intelligence/skill-gaps/me/latest');
    expect(run.summary).toMatchObject({ coveragePercent: 63.89, highCount: 3 });
    expect(run.items.find((i: { frameworkCode: string }) => i.frameworkCode === '4.2')).toMatchObject({ currentLevel: 2, severity: 'MEDIUM' });
  });

  it('needs a reason, a valid level and an employee in scope to confirm a level', async () => {
    asUser('learning');
    expect(await failure(call('post', '/competency-evidences/manual', { employeeId: 'emp-01', competencyId: 'cmp-4-2', confirmedLevel: 2, reviewNote: ' ' }))).toMatchObject({ status: 400 });
    expect(await failure(call('post', '/competency-evidences/manual', { employeeId: 'emp-01', competencyId: 'cmp-4-2', confirmedLevel: 4, reviewNote: 'x' }))).toMatchObject({ status: 400 });
    asUser('manager');
    expect(await failure(call('post', '/competency-evidences/manual', { employeeId: 'emp-01', competencyId: 'cmp-4-2', confirmedLevel: 2, reviewNote: 'x' }))).toMatchObject({ status: 404 });
  });

  it('explains why a skill gap cannot be calculated, with the backend reason codes', async () => {
    asUser('learning');
    expect(await failure(call('post', '/intelligence/skill-gaps/calculate', { employeeId: 'emp-14' }))).toMatchObject({ status: 400, codes: ['NO_JOB_POSITION'] });
    expect(await failure(call('post', '/intelligence/skill-gaps/calculate', { employeeId: 'emp-12' }))).toMatchObject({ status: 400, codes: ['EMPLOYEE_NOT_ACTIVE'] });
  });

  it('calculates a batch, skipping the people who cannot have a snapshot', async () => {
    asUser('learning');
    const result = await call('post', '/intelligence/skill-gaps/calculate-batch', { departmentId: 'dep-ns' });

    expect(result.calculatedCount).toBe(2);
    expect(result.skipped).toEqual([expect.objectContaining({ employeeId: 'emp-14', reason: 'NO_JOB_POSITION' })]);
  });

  it('lists the latest snapshot per employee in scope, most gaps first', async () => {
    asUser('learning');
    const all = await call('get', '/intelligence/skill-gaps', { pageSize: 50 });
    asUser('manager');
    const team = await call('get', '/intelligence/skill-gaps', { pageSize: 50 });

    const gaps = all.items.map((i: { gapCount: number }) => i.gapCount);
    expect(gaps).toEqual([...gaps].sort((a, b) => b - a));
    expect(all.totalItems).toBe(12);
    expect(team.items.length).toBeLessThan(all.items.length);
  });

  it('lets an employee read their own snapshot only', async () => {
    asUser('learner');
    const learnerRun = await call('get', '/intelligence/skill-gaps/me/latest');
    asUser('manager');
    const accountantRun = (await call('get', '/intelligence/skill-gaps', { pageSize: 50 })).items;

    expect(learnerRun.employeeName).toMatch(/Hoàng Văn (Học|Nhân) Viên/);
    expect(accountantRun.every((r: { employeeName: string }) => r.employeeName !== learnerRun.employeeName)).toBe(true);
  });
});
