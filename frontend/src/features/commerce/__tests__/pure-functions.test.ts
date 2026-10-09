import { describe, expect, it } from 'vitest';
import { passwordSchema } from '../../auth/validation';
import { resolvePlanChoice } from '../resolve-plan-choice';
import { resolveNextStep } from '@/lib/navigation';
import type { SessionUser } from '@/types/session';
import type { PlanSelection } from '@/types/commerce';

describe('passwordSchema (P13, §4.10, T21)', () => {
  it('rejects passwords shorter than 8 characters', () => {
    const result = passwordSchema.safeParse('short12');
    expect(result.success).toBe(false);
  });

  it('rejects common weak passwords even if length >= 8', () => {
    expect(passwordSchema.safeParse('12345678').success).toBe(false);
    expect(passwordSchema.safeParse('matkhau1').success).toBe(false);
    expect(passwordSchema.safeParse('password').success).toBe(false);
    expect(passwordSchema.safeParse('qwertyui').success).toBe(false);
  });

  it('accepts an 8-character lowercase-only password without complexity requirements', () => {
    const result = passwordSchema.safeParse('abcdefgh');
    expect(result.success).toBe(true);
  });

  it('rejects passwords longer than 128 characters', () => {
    const tooLong = 'a'.repeat(129);
    expect(passwordSchema.safeParse(tooLong).success).toBe(false);
  });
});

describe('resolvePlanChoice (P7, §4.3, T16, T17, T18)', () => {
  const starterSelection: PlanSelection = { planCode: 'ENT_STARTER', seats: 10, cycle: 'month' };
  const contactSelection: PlanSelection = { planCode: 'ENT_ENTERPRISE', seats: 50, cycle: 'month' };

  it('T18: redirects contact-only plans to sales email without checkout', () => {
    const result = resolvePlanChoice(null, contactSelection, 'enterprise');
    expect(result.type).toBe('contact');
    if (result.type === 'contact') {
      expect(result.email).toContain('@');
    }
  });

  it('T16: sends a guest user to the registration page with plan query parameters', () => {
    const result = resolvePlanChoice(null, starterSelection, 'enterprise');
    expect(result.type).toBe('register');
    if (result.type === 'register') {
      expect(result.path).toContain('/business/register?plan=ENT_STARTER');
    }
  });

  it('updates draft and sends logged-in user with onboardingStatus=payment to checkout', () => {
    const payingUser: SessionUser = {
      id: 'u1',
      email: 'owner@acme.vn',
      fullName: 'Owner',
      roles: ['OWNER'],
      permissions: [],
      workspace: 'enterprise',
      onboardingStatus: 'payment',
      emailVerified: true,
    };
    const result = resolvePlanChoice(payingUser, starterSelection, 'enterprise');
    expect(result.type).toBe('checkout');
  });

  it('T17: sends a user with an active subscription to manage subscription without re-registering', () => {
    const activeUser: SessionUser = {
      id: 'u2',
      email: 'owner@acme.vn',
      fullName: 'Owner',
      roles: ['OWNER'],
      permissions: [],
      workspace: 'enterprise',
      subscription: {
        planCode: 'ENT_PRO',
        planName: 'Doanh nghiệp Pro',
        status: 'active',
        entitlements: [],
      },
      emailVerified: true,
    };
    const result = resolvePlanChoice(activeUser, starterSelection, 'enterprise');
    expect(result.type).toBe('subscription');
    if (result.type === 'subscription') {
      expect(result.message).toContain('Bạn đang dùng gói');
    }
  });

  it('warns when a personal user tries to purchase an enterprise plan', () => {
    const personalUser: SessionUser = {
      id: 'u3',
      email: 'personal@acme.vn',
      fullName: 'Personal',
      roles: [],
      permissions: [],
      workspace: 'personal',
      emailVerified: true,
    };
    const result = resolvePlanChoice(personalUser, starterSelection, 'enterprise');
    expect(result.type).toBe('mismatch');
  });
});

describe('resolvePlanChoice for individual trial and Free learners (BR-17)', () => {
  const plus: PlanSelection = { planCode: 'IND_PLUS', seats: 1, cycle: 'month' };
  const learner = (subscription: SessionUser['subscription']): SessionUser => ({
    id: 'u9', email: 'a@b.c', fullName: 'A', roles: [], permissions: [], workspace: 'personal', emailVerified: true, subscription,
  });

  it('opens a purchase draft for a learner on a trial, so the plan page is not a dead end', () => {
    const trial = learner({
      planCode: 'IND_PLUS', planName: 'Cá nhân Plus', status: 'trialing', entitlements: [],
      trialStartedAt: '2026-10-06T00:00:00.000Z', trialEndsAt: '2026-10-13T00:00:00.000Z',
    });

    expect(resolvePlanChoice(trial, plus, 'individual')).toEqual({ type: 'checkout', draftAction: 'create', path: '/checkout' });
  });

  it('opens a purchase draft for a learner on the Free plan', () => {
    const free = learner({ planCode: 'IND_FREE', planName: 'Miễn phí', status: 'active', entitlements: [] });

    expect(resolvePlanChoice(free, plus, 'individual').type).toBe('checkout');
  });

  it('still tells a paying learner which plan they use', () => {
    const paid = learner({ planCode: 'IND_PLUS', planName: 'Cá nhân Plus', status: 'active', entitlements: [] });

    const result = resolvePlanChoice(paid, plus, 'individual');

    expect(result.type).toBe('subscription');
    if (result.type === 'subscription') expect(result.message).toBe('Bạn đang dùng gói Cá nhân Plus.');
  });

  it('never lets an enterprise account upgrade through the individual pricing page', () => {
    const owner: SessionUser = {
      id: 'u10', email: 'o@b.c', fullName: 'O', roles: ['OWNER'], permissions: [], workspace: 'enterprise', emailVerified: true,
      subscription: { planCode: 'IND_FREE', planName: 'Miễn phí', status: 'active', entitlements: [] },
    };

    expect(resolvePlanChoice(owner, plus, 'individual').type).toBe('mismatch');
  });
});

describe('resolveNextStep (P11, §4.7, T12, T14, T19, T20)', () => {
  it('directs unpaid accounts to checkout', () => {
    const user: SessionUser = {
      id: 'u1', email: 'a@b.c', fullName: 'A', roles: ['OWNER'], permissions: [],
      workspace: 'enterprise', onboardingStatus: 'payment', emailVerified: true,
    };
    expect(resolveNextStep(user)).toBe('/checkout');
  });

  it('directs enterprise accounts with onboardingStatus=contract to e-contract signing', () => {
    const user: SessionUser = {
      id: 'u2', email: 'a@b.c', fullName: 'A', roles: ['OWNER'], permissions: [],
      workspace: 'enterprise', onboardingStatus: 'contract', emailVerified: true,
    };
    expect(resolveNextStep(user)).toBe('/enterprise/contract');
  });

  it('directs enterprise accounts with onboardingStatus=setup to setup wizard', () => {
    const user: SessionUser = {
      id: 'u3', email: 'a@b.c', fullName: 'A', roles: ['OWNER'], permissions: [],
      workspace: 'enterprise', onboardingStatus: 'setup', emailVerified: true,
    };
    expect(resolveNextStep(user)).toBe('/setup');
  });

  it('T19: directs personal accounts with onboardingStatus=setup to personal onboarding', () => {
    const user: SessionUser = {
      id: 'u4', email: 'a@b.c', fullName: 'A', roles: [], permissions: [],
      workspace: 'personal', onboardingStatus: 'setup', emailVerified: true,
    };
    expect(resolveNextStep(user)).toBe('/personal/onboarding');
  });

  it('T20: directs accounts with unverified email to /verify-email-required before entering portal', () => {
    const user: SessionUser = {
      id: 'u5', email: 'a@b.c', fullName: 'A', roles: ['OWNER'], permissions: [],
      workspace: 'enterprise', emailVerified: false,
    };
    expect(resolveNextStep(user)).toBe('/verify-email-required');
  });

  it('directs fully onboarded owner to enterprise dashboard', () => {
    const user: SessionUser = {
      id: 'u6', email: 'a@b.c', fullName: 'A', roles: ['OWNER'], permissions: [],
      workspace: 'enterprise', emailVerified: true,
    };
    expect(resolveNextStep(user)).toBe('/enterprise/dashboard');
  });

  it('directs fully onboarded personal user to personal dashboard', () => {
    const user: SessionUser = {
      id: 'u7', email: 'a@b.c', fullName: 'A', roles: [], permissions: [],
      workspace: 'personal', emailVerified: true,
    };
    expect(resolveNextStep(user)).toBe('/personal/dashboard');
  });
});
