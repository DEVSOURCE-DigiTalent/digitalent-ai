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
  it('is platform for platform admin, mentor for mentors, enterprise for org roles, personal without roles', () => {
    expect(inferWorkspace(['PLATFORM_ADMIN'])).toBe('platform');
    expect(inferWorkspace(['MENTOR'])).toBe('mentor');
    expect(inferWorkspace(['LEARNER'])).toBe('personal');
    expect(inferWorkspace(['EMPLOYEE'])).toBe('enterprise');
    expect(inferWorkspace([])).toBe('personal');
  });

  it('derives the mentor workspace cleanly when backend omits it', () => {
    expect(resolveWorkspace({ roles: ['MENTOR'] })).toBe('mentor');
  });

  it('prefers the workspace the backend sent', () => {
    expect(resolveWorkspace({ roles: [], workspace: 'enterprise' })).toBe('enterprise');
    expect(resolveWorkspace({ roles: ['EMPLOYEE'] })).toBe('enterprise');
  });
});

describe('getHomePath', () => {
  it.each([
    [['PLATFORM_ADMIN'], '/platform/dashboard'],
    [['MENTOR'], '/mentor/enterprises'],
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

  it('does not treat an enterprise account without a role as an Employee', () => {
    expect(getHomePath({ roles: [], workspace: 'enterprise' })).toBe('/forbidden');
  });

  it.each([
    ['trainer@digitalent.ai', 'EMPLOYEE', 'enterprise', false, '/enterprise/me'],
    ['employee@digitalent.ai', 'EMPLOYEE', 'enterprise', true, '/enterprise/me'],
    ['admin@digitalent.ai', 'PLATFORM_ADMIN', 'platform', false, '/platform/dashboard'],
    ['mentor@digitalent.ai', 'MENTOR', 'mentor', true, '/mentor/enterprises'],
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

  it('opens a trial Manager in team management even when a previous Employee deep link is saved', () => {
    const manager: SessionUser = {
      id: 'manager-new', email: 'manager@company.test', fullName: 'Manager',
      roles: ['MANAGER'], permissions: [], workspace: 'enterprise',
      enterpriseTrialStatus: 'trial_active', emailVerified: true,
    };

    expect(getHomePath(manager)).toBe('/enterprise/team');
    expect(getPostLoginPath('/enterprise/me/path', manager)).toBe('/enterprise/team');
  });

  it('preserves mentor deep links and blocks cross-workspace redirects', () => {
    const mentor: SessionUser = {
      id: 'mentor-1',
      email: 'mentor@digitalent.ai',
      fullName: 'Mentor',
      roles: ['MENTOR'],
      permissions: ['trial.review'],
      workspace: 'mentor',
      emailVerified: true,
    };
    const admin: SessionUser = {
      id: 'admin-1',
      email: 'admin@digitalent.ai',
      fullName: 'Admin',
      roles: ['PLATFORM_ADMIN'],
      permissions: [],
      workspace: 'platform',
      emailVerified: true,
    };

    expect(getPostLoginPath('/mentor/enterprises/org-1', mentor)).toBe('/mentor/enterprises/org-1');
    expect(getPostLoginPath('/mentor/enterprises/org-1/submissions/sub-1', mentor)).toBe('/mentor/enterprises/org-1/submissions/sub-1');
    expect(getPostLoginPath('/mentor/course-reviews/sub-1', mentor)).toBe('/mentor/course-reviews/sub-1');
    expect(getPostLoginPath('/mentor/reviews', mentor)).toBe('/mentor/enterprises');
    expect(getPostLoginPath('/mentor/reviews/org-1', mentor)).toBe('/mentor/enterprises');
    expect(getPostLoginPath('/platform/course-reviews', mentor)).toBe('/mentor/enterprises');
    expect(getPostLoginPath('/mentor/course-reviews', admin)).toBe('/platform/dashboard');
  });
});
