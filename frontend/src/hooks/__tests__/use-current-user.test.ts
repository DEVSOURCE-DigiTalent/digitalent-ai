import { describe, it, expect, beforeEach } from 'vitest';
import { useCurrentUser } from '../use-current-user';
import { ROLES } from '@/lib/roles';
import type { SessionUser, SubscriptionContext } from '../../types/session';

const ACTIVE_PLAN: SubscriptionContext = {
  planCode: 'PRO',
  planName: 'Pro',
  status: 'active',
  entitlements: ['internal_learning'],
};

const baseUser: SessionUser = {
  id: 'u-1',
  email: 'u@digitalent.demo',
  fullName: 'User',
  roles: [ROLES.OWNER],
  permissions: ['skill_gap.read'],
  workspace: 'enterprise',
  subscription: ACTIVE_PLAN,
};

const store = () => useCurrentUser.getState();

describe('useCurrentUser', () => {
  beforeEach(() => store().clearUser());

  it('normalizes legacy roles and derives the workspace when the backend sends none', () => {
    store().setUser({ id: '1', email: 'a@b.c', fullName: 'A', roles: ['SYSTEM_ADMIN'], permissions: [] });

    expect(store().user?.roles).toContain('PLATFORM_ADMIN');
    expect(store().user?.workspace).toBe('enterprise');
  });

  it('puts a legacy trainer in the enterprise portal as an employee, never in the personal workspace', () => {
    store().setUser({ id: '1', email: 't@b.c', fullName: 'T', roles: ['TRAINER'], permissions: [] });

    expect(store().user?.roles).toEqual(['EMPLOYEE']);
    expect(store().user?.workspace).toBe('enterprise');
  });

  it('keeps a user whose backend roles are all unknown out of the personal workspace', () => {
    store().setUser({ id: '1', email: 'x@b.c', fullName: 'X', roles: ['MYSTERY'], permissions: [] });

    expect(store().user?.workspace).toBe('enterprise');
  });

  it('ignores a platform workspace claimed by someone who is not platform staff', () => {
    store().setUser({ ...baseUser, workspace: 'platform' });

    expect(store().user?.workspace).toBe('enterprise');
  });

  it('honours the platform workspace for platform staff', () => {
    store().setUser({ ...baseUser, roles: ['PLATFORM_ADMIN'], workspace: 'platform' });

    expect(store().user?.workspace).toBe('platform');
  });

  it('lets platform admins pass every permission check, and nobody else', () => {
    store().setUser({ ...baseUser, roles: ['PLATFORM_ADMIN'], permissions: [], workspace: 'platform' });
    expect(store().hasPermission('anything.at_all')).toBe(true);

    store().setUser(baseUser);
    expect(store().hasPermission('skill_gap.read')).toBe(true);
    expect(store().hasPermission('user.read')).toBe(false);
  });

  it('answers false to every check when nobody is signed in', () => {
    expect(store().hasPermission('skill_gap.read')).toBe(false);
    expect(store().hasRole(ROLES.OWNER)).toBe(false);
    expect(store().hasEntitlement('internal_learning')).toBe(false);
    expect(store().getSubscriptionStatus()).toBeNull();
  });

  describe('entitlements', () => {
    it('follows the plan', () => {
      store().setUser(baseUser);

      expect(store().hasEntitlement('internal_learning')).toBe(true);
      expect(store().hasEntitlement('advanced_analytics')).toBe(false);
      expect(store().getSubscriptionStatus()).toBe('active');
    });

    it('is not enforced for platform staff', () => {
      store().setUser({ ...baseUser, roles: ['PLATFORM_ADMIN'], workspace: 'platform', subscription: undefined });

      expect(store().hasEntitlement('advanced_analytics')).toBe(true);
      expect(store().getSubscriptionStatus()).toBeNull();
    });

    it('is not enforced while the backend sends no subscription', () => {
      store().setUser({ ...baseUser, subscription: undefined });

      expect(store().hasEntitlement('advanced_analytics')).toBe(true);
      expect(store().getSubscriptionStatus()).toBeNull();
    });

    it('reports a plan that needs payment', () => {
      store().setUser({ ...baseUser, subscription: { ...ACTIVE_PLAN, status: 'payment_required' } });

      expect(store().getSubscriptionStatus()).toBe('payment_required');
    });
  });
});
