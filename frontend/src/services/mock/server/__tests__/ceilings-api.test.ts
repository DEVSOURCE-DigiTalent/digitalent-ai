import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../../../api-client';
import type { CapabilityCeilings } from '../../../capability-ceiling.service';
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

const asUser = (accountId: 'mock-owner' | 'mock-employee') => localStorage.setItem('accessToken', `mock-token:${accountId}`);

async function call<T = CapabilityCeilings>(method: 'get' | 'put', url: string, payload?: unknown): Promise<T> {
  const response = await apiClient.request({ method, url, data: payload });
  return response.data.data as T;
}

async function failure(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    const response = (error as { response: { status: number; data: { errors: { message: string }[] } } }).response;
    return { status: response.status, codes: response.data.errors.map((e) => e.message) };
  }
  throw new Error('Expected the request to fail');
}

const levels = (matrix: CapabilityCeilings) => matrix.domains.map((d) => d.organizationCeiling);
const department = (matrix: CapabilityCeilings, id: string) => matrix.departments.find((d) => d.departmentId === id)!;

describe('capability ceilings (Lý thuyết trần nhà)', () => {
  it('returns the 6 × 3 matrix of the demo organization with its saved ceilings', async () => {
    asUser('mock-owner');
    const matrix = await call('get', '/capability-ceilings');

    expect(matrix.isConfigured).toBe(true);
    expect(matrix.platformCourseCount).toBe(18);
    expect(levels(matrix)).toEqual([3, 2, 3, 2, 1, 2]);
    expect(matrix.organizationCourseCount).toBe(13);
    expect(matrix.domains[0].courses.map((c) => c.code)).toEqual(['A1-F', 'A1-I', 'A1-A']);

    const accounting = department(matrix, 'dep-kt');
    expect(accounting.isCustomized).toBe(true);
    expect(accounting.courseCount).toBe(8);
    // A department without its own ceiling inherits the organization ceiling.
    expect(department(matrix, 'dep-kd').ceilings.map((c) => c.level)).toEqual([3, 2, 3, 2, 1, 2]);
  });

  it('blocks a department ceiling above the organization ceiling', async () => {
    asUser('mock-owner');
    const result = await failure(
      call('put', '/capability-ceilings/departments/dep-kd', { ceilings: [{ categoryId: 'cat-5', level: 2 }] }),
    );
    expect(result).toEqual({ status: 400, codes: ['CEILING_ABOVE_ORGANIZATION'] });
  });

  it('lowers department ceilings when the organization ceiling drops', async () => {
    asUser('mock-owner');
    const ceilings = ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6'].map((categoryId) => ({
      categoryId,
      level: categoryId === 'cat-3' ? 1 : 2,
    }));
    const matrix = await call('put', '/capability-ceilings/organization', { ceilings });

    expect(levels(matrix)).toEqual([2, 2, 1, 2, 2, 2]);
    expect(matrix.adjustedDepartmentCount).toBe(1); // Marketing had Sáng tạo nội dung at 3
    expect(department(matrix, 'dep-mkt').ceilings[2].level).toBe(1);
  });

  it('lets a department go back to the organization ceiling', async () => {
    asUser('mock-owner');
    const matrix = await call('put', '/capability-ceilings/departments/dep-kt', { inherit: true, ceilings: [] });
    expect(department(matrix, 'dep-kt').isCustomized).toBe(false);
    expect(department(matrix, 'dep-kt').courseCount).toBe(13);
  });

  it('refuses employees', async () => {
    asUser('mock-employee');
    expect(await failure(call('get', '/capability-ceilings'))).toMatchObject({ status: 403 });
  });
});
