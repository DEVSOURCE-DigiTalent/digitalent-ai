import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetMockDb } from '../../mock-store';
import { getOrgData } from '../org-store';
import { dispatch } from '../router';
import '../handlers';

describe('owner heatmap demo', () => {
  beforeEach(() => {
    localStorage.clear();
    resetMockDb();
    vi.stubEnv('VITE_OWNER_SHOWCASE', 'true');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('shows five departments and the five requested positions on the owner demo account', () => {
    const data = getOrgData('org-acme');
    expect(data.departments.map((department) => department.name)).toEqual(['CEO', 'Sales/CRM', 'Marketing', 'HR', 'Kế toán']);
    expect(data.positions.map((position) => position.name)).toEqual(['CEO', 'HR', 'Marketing', 'Sales/CRM', 'Kế toán']);
    expect(data.employees.find((employee) => employee.id === 'emp-02')?.jobPositionId).toBe('pos-sales');
    expect(data.employees.filter((employee) => employee.status === 'ACTIVE')).toHaveLength(20);
  });

  it('supplies varied assessment progress for every department', async () => {
    const response = await dispatch({ method: 'GET', path: '/trial', query: {}, body: {}, userId: 'mock-owner' });
    expect(response.status).toBe(200);
    const program = (response.body as { data: { departments: string[]; participants: { status: string; departmentName: string }[] } }).data;
    expect(program.departments).toHaveLength(5);
    expect(program.participants).toHaveLength(20);
    expect(new Set(program.participants.map((person) => person.departmentName)).size).toBe(5);
    expect(new Set(program.participants.map((person) => person.status))).toEqual(new Set(['INVITED', 'ACTIVE', 'SUBMITTED']));
  });
});
