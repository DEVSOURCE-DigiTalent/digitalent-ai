import { describe, it, expect } from 'vitest';
import { inferWorkspace, normalizeRoles, resolveWorkspace } from '../roles';
import { getHomePath } from '../navigation';

describe('normalizeRoles', () => {
  it('keeps canonical roles and removes duplicates', () => {
    expect(normalizeRoles(['OWNER', 'OWNER'])).toEqual(['OWNER']);
    expect(normalizeRoles(['LEARNER'])).toEqual(['LEARNER']);
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
});
