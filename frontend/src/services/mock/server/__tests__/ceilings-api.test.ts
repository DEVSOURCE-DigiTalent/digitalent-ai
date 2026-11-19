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

async function call<T = CapabilityCeilings>(method: 'get' | 'put' | 'post', url: string, payload?: unknown): Promise<T> {
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
const position = (matrix: CapabilityCeilings, code: string) => matrix.positions.find((p) => p.code === code)!;

describe('Khung năng lực số (courses owned + levels per position)', () => {
  it('returns the 6 × 3 matrix of the demo organization with the 5 positions', async () => {
    asUser('mock-owner');
    const matrix = await call('get', '/capability-ceilings');

    expect(matrix.isConfigured).toBe(true);
    expect(matrix.platformCourseCount).toBe(18);
    expect(levels(matrix)).toEqual([3, 2, 3, 2, 1, 2]);
    expect(matrix.organizationCourseCount).toBe(13);
    expect(matrix.domains[0].courses.map((c) => c.code)).toEqual(['A1-F', 'A1-I', 'A1-A']);
    expect(matrix.positions.map((p) => p.code)).toEqual(['CEO', 'HR', 'MARKETING', 'SALES_CRM', 'ACCOUNTANT']);

    const accounting = position(matrix, 'ACCOUNTANT');
    expect(accounting.isCustomized).toBe(true);
    expect(accounting.courseCount).toBe(8);
    expect(accounting.departments.length).toBeGreaterThan(0);
    // A position not set follows the system suggestion (TT02 sample of the position).
    const sales = position(matrix, 'SALES_CRM');
    expect(sales.isCustomized).toBe(false);
    expect(sales.ceilings.map((c) => c.level)).toEqual([2, 3, 2, 2, 2, 1]);
    expect(sales.ceilings.map((c) => c.suggested)).toEqual([2, 3, 2, 2, 2, 1]);
  });

  it('lets a position aim above the owned courses (set first, buy later)', async () => {
    asUser('mock-owner');
    const matrix = await call('put', '/capability-ceilings/positions/SALES_CRM', { ceilings: [{ categoryId: 'cat-5', level: 3 }] });
    expect(matrix.domains.find((domain) => domain.categoryId === 'cat-5')?.organizationCeiling).toBe(1);
    expect(position(matrix, 'SALES_CRM').ceilings[4]).toMatchObject({ level: 3, suggested: 2, isCustomized: true });
  });

  it('refuses a position outside the 5', async () => {
    asUser('mock-owner');
    const result = await failure(call('put', '/capability-ceilings/positions/LEGAL', { ceilings: [{ categoryId: 'cat-1', level: 2 }] }));
    expect(result).toEqual({ status: 400, codes: ['INVALID_JOB_POSITION'] });
  });

  it('keeps every owned course for the company and the position levels on the legacy organization endpoint', async () => {
    asUser('mock-owner');
    const ceilings = ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6'].map((categoryId) => ({
      categoryId,
      level: categoryId === 'cat-3' ? 1 : categoryId === 'cat-5' ? 1 : 2,
    }));
    const matrix = await call('put', '/capability-ceilings/organization', { ceilings });

    expect(levels(matrix)).toEqual([3, 2, 3, 2, 1, 2]);
    expect(matrix.adjustedDepartmentCount).toBe(0);
    expect(position(matrix, 'MARKETING').ceilings[2].level).toBe(3);
  });

  it('refuses an organization ceiling level when its course has not been purchased', async () => {
    asUser('mock-owner');
    const ceilings = ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6'].map((categoryId) => ({
      categoryId,
      level: categoryId === 'cat-5' ? 2 : 1,
    }));

    const result = await failure(call('put', '/capability-ceilings/organization', { ceilings }));
    expect(result).toEqual({ status: 400, codes: ['COURSE_LICENSE_REQUIRED'] });
  });

  it('unlocks the matching organization ceiling after buying its course', async () => {
    asUser('mock-owner');
    await call('post', '/courses/crs-A5-I/purchase', {});
    const ceilings = ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6'].map((categoryId) => ({
      categoryId,
      level: categoryId === 'cat-5' ? 2 : 1,
    }));

    const matrix = await call('put', '/capability-ceilings/organization', { ceilings });
    expect(matrix.domains.find((domain) => domain.categoryId === 'cat-5')?.organizationCeiling).toBe(2);
  });

  it('lets a position go back to the system suggestion', async () => {
    asUser('mock-owner');
    const matrix = await call('put', '/capability-ceilings/positions/ACCOUNTANT', { inherit: true, ceilings: [] });
    expect(position(matrix, 'ACCOUNTANT').isCustomized).toBe(false);
    expect(position(matrix, 'ACCOUNTANT').ceilings.map((c) => c.level)).toEqual([3, 2, 1, 3, 2, 1]);
  });

  it('refuses employees', async () => {
    asUser('mock-employee');
    expect(await failure(call('get', '/capability-ceilings'))).toMatchObject({ status: 403 });
  });
});
