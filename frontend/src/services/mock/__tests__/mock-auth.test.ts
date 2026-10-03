import { describe, it, expect, beforeEach } from 'vitest';
import { mockAuthService } from '../mock-auth.service';
import { MOCK_ACCOUNTS, MOCK_PASSWORD } from '../mock-accounts';
import { ROLES } from '../../../lib/roles';

describe('mock accounts', () => {
  it('have unique ids and emails', () => {
    expect(new Set(MOCK_ACCOUNTS.map((a) => a.id)).size).toBe(MOCK_ACCOUNTS.length);
    expect(new Set(MOCK_ACCOUNTS.map((a) => a.email)).size).toBe(MOCK_ACCOUNTS.length);
  });

  it('cover every role, the personal workspace, and the plan-gating cases', () => {
    const roles = new Set(MOCK_ACCOUNTS.flatMap((a) => a.roles));
    for (const role of Object.values(ROLES)) expect(roles).toContain(role);

    expect(MOCK_ACCOUNTS.some((a) => a.workspace === 'personal')).toBe(true);
    expect(MOCK_ACCOUNTS.some((a) => a.subscription?.status === 'payment_required')).toBe(true);
    expect(MOCK_ACCOUNTS.some((a) => a.subscription && !a.subscription.entitlements.includes('internal_learning'))).toBe(true);
  });

  it('give platform staff no organization and personal users no roles', () => {
    for (const account of MOCK_ACCOUNTS) {
      if (account.workspace === 'platform') expect(account.organization).toBeUndefined();
      if (account.workspace === 'personal') expect(account.roles).toEqual([]);
      if (account.workspace === 'enterprise') expect(account.organization).toBeDefined();
    }
  });

  it('give each enterprise role only what its job needs', () => {
    const byRole = (role: string) => MOCK_ACCOUNTS.find((a) => a.roles.includes(role))!;

    expect(byRole(ROLES.OWNER).permissions).toContain('user.create');
    expect(byRole(ROLES.OWNER).permissions).toContain('task.evaluate');
    expect(byRole(ROLES.EMPLOYEE).permissions).not.toContain('user.create');
    expect(byRole(ROLES.EMPLOYEE).permissions).toContain('attempt.submit');
    expect(byRole(ROLES.MANAGER).permissions).toContain('task.evaluate');
  });
});

describe('mockAuthService', () => {
  beforeEach(() => localStorage.clear());

  it('logs in with the shared mock password and returns the matching session', async () => {
    const login = await mockAuthService.login({ email: 'Employee@digitalent.demo', password: MOCK_PASSWORD });
    localStorage.setItem('accessToken', login.data.data!.accessToken);

    const me = await mockAuthService.getMe();
    expect(me.data.data?.email).toBe('employee@digitalent.demo');
    expect(me.data.data?.roles).toEqual(['EMPLOYEE']);
  });

  it('rejects a wrong password or unknown email with a 401 the login page can read', async () => {
    await expect(mockAuthService.login({ email: 'employee@digitalent.demo', password: 'nope' })).rejects.toMatchObject({
      response: { status: 401, data: { message: 'Email hoặc mật khẩu không đúng.' } },
    });
    await expect(mockAuthService.login({ email: 'ghost@digitalent.demo', password: MOCK_PASSWORD })).rejects.toMatchObject({
      response: { status: 401 },
    });
  });

  it('keeps track of user session changes from the mock database', async () => {
    const login = await mockAuthService.login({ email: 'owner@digitalent.demo', password: MOCK_PASSWORD });
    localStorage.setItem('accessToken', login.data.data!.accessToken);

    const me = await mockAuthService.getMe();
    expect(me.data.data?.roles).toContain(ROLES.OWNER);
  });
});
