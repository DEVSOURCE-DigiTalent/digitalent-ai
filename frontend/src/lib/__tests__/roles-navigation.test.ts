import { describe, it, expect } from 'vitest';
import { inferWorkspace, normalizeRoles, resolveWorkspace } from '../roles';
import { getHomePath } from '../navigation';

describe('normalizeRoles', () => {
  it('maps the legacy backend roles to the new model', () => {
    expect(normalizeRoles(['SYSTEM_ADMIN'])).toEqual(['PLATFORM_ADMIN', 'OWNER']);
    expect(normalizeRoles(['HR_MANAGER'])).toEqual(['OWNER']);
    expect(normalizeRoles(['DEPARTMENT_MANAGER'])).toEqual(['MANAGER']);
    expect(normalizeRoles(['EMPLOYEE'])).toEqual(['EMPLOYEE']);
  });

  it('turns TRAINER and LEARNER into employee', () => {
    expect(normalizeRoles(['TRAINER'])).toEqual(['EMPLOYEE']);
    expect(normalizeRoles(['LEARNER'])).toEqual(['EMPLOYEE']);
  });

  it('keeps unknown roles as they are', () => {
    expect(normalizeRoles(['SOMETHING_NEW'])).toEqual(['SOMETHING_NEW']);
  });

  it('keeps new roles and removes duplicates', () => {
    expect(normalizeRoles(['OWNER', 'HR_MANAGER', 'OWNER'])).toEqual(['OWNER']);
  });
});

describe('workspace', () => {
  it('is platform for platform staff, enterprise for any other role, personal without roles', () => {
    expect(inferWorkspace(['PLATFORM_ADMIN'])).toBe('platform');
    expect(inferWorkspace(normalizeRoles(['SYSTEM_ADMIN']))).toBe('enterprise');
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
    [['ORG_ADMIN'], '/enterprise/dashboard'],
    [['LEARNING_ADMIN'], '/enterprise/dashboard'],
    [['MANAGER'], '/enterprise/team'],
    [['EMPLOYEE'], '/enterprise/me'],
    [['LEARNER'], '/enterprise/me'],
  ])('sends %j to %s', (roles, expected) => {
    expect(getHomePath({ roles })).toBe(expected);
  });

  it('puts administration before learning for someone with several roles', () => {
    expect(getHomePath({ roles: ['LEARNER', 'ORG_ADMIN'] })).toBe('/enterprise/dashboard');
  });

  it('follows an explicit workspace over the roles', () => {
    expect(getHomePath({ roles: [], workspace: 'enterprise' })).toBe('/enterprise/me');
  });
});
