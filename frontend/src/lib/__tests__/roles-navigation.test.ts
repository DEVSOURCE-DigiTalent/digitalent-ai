import { describe, it, expect } from 'vitest';
import { inferWorkspace, normalizeRoles, resolveWorkspace } from '../roles';
import { getHomePath } from '../navigation';
import { getPostLoginPath } from '../../features/auth/auth-redirect';
import type { SessionUser } from '../../types/session';

describe('normalizeRoles', () => {
  it('keeps canonical roles and removes duplicates', () => {
    expect(normalizeRoles(['OWNER', 'OWNER'])).toEqual(['OWNER']);
    expect(normalizeRoles(['LEARNER'])).toEqual(['LEARNER']);
  });

  it('normalizes casing and legacy role aliases', () => {
    expect(normalizeRoles(['manager'])).toEqual(['MANAGER']);
    expect(normalizeRoles(['DEPARTMENT_MANAGER'])).toEqual(['MANAGER']);
    expect(normalizeRoles(['hr_manager'])).toEqual(['OWNER']);
    expect(normalizeRoles(['admin'])).toEqual(['PLATFORM_ADMIN']);
    expect(normalizeRoles(['trainer'])).toEqual(['EMPLOYEE']);
  });
});

describe('workspace', () => {
  it('is platform for platform staff, enterprise for any other role, personal without roles', () => {
    expect(inferWorkspace(['PLATFORM_ADMIN'])).toBe('platform');
    expect(inferWorkspace(['LEARNER'])).toBe('personal');
    expect(inferWorkspace(['EMPLOYEE'])).toBe('enterprise');
    expect(inferWorkspace([])).toBe('personal');
  });

  it('prefers the workspace the backend sent', () => {
    expect(resolveWorkspace({ roles: [], workspace: 'enterprise' })).toBe('enterprise');
    expect(resolveWorkspace({ roles: ['EMPLOYEE'] })).toBe('enterprise');
  });
});

describe('getHomePath', () => {
  it.each([
    [['PLATFORM_ADMIN'], '/platform/dashboard'],
    [[], '/personal/dashboard'],
    [['OWNER'], '/enterprise/dashboard'],
    [['MANAGER'], '/enterprise/team'],
    [['EMPLOYEE'], '/enterprise/me'],
    [['LEARNER'], '/personal/dashboard'],
  ])('sends %j to %s', (roles, expected) => {
    expect(getHomePath({ roles })).toBe(expected);
  });

  it('puts administration before learning for someone with several roles', () => {
    expect(getHomePath({ roles: ['EMPLOYEE', 'OWNER'] })).toBe('/enterprise/dashboard');
  });

  it('follows an explicit workspace over the roles', () => {
    expect(getHomePath({ roles: [], workspace: 'enterprise' })).toBe('/enterprise/me');
  });

  it.each([
    ['trainer@digitalent.ai', 'EMPLOYEE', 'enterprise', false, '/enterprise/me'],
    ['employee@digitalent.ai', 'EMPLOYEE', 'enterprise', true, '/enterprise/me'],
    ['admin@digitalent.ai', 'PLATFORM_ADMIN', 'platform', false, '/platform/dashboard'],
    ['owner@digitalent.ai', 'OWNER', 'enterprise', true, '/enterprise/dashboard'],
    ['hr@digitalent.ai', 'OWNER', 'enterprise', true, '/enterprise/dashboard'],
  ] as const)('opens the correct workspace for %s', (email, role, workspace, emailVerified, path) => {
    const user: SessionUser = { id: email, email, fullName: email, roles: [role], permissions: [], workspace, emailVerified };
    expect(getHomePath(user)).toBe(path);
    expect(getPostLoginPath('/enterprise/skill-gap', user)).toBe(path);
  });

  it('sends only an unverified Owner to the business email check', () => {
    expect(getHomePath({ roles: ['OWNER'], emailVerified: false })).toBe('/business/verify-email?email=');
  });
});
