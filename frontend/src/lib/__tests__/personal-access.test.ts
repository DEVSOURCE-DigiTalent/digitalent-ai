import { describe, expect, it } from 'vitest';
import { FREE_REASSESS_DAYS, INDIVIDUAL_TRIAL } from '../plans';
import {
  SEEN_KEYS, accessModeOf, checklistOf, formatDmy, freeSubscription, isIndividualUpgrader, isSeenKey, isSubscriptionUsable,
  isTrialExpired, planBadgeText, reassessAvailableAt, settleSubscription, trialDaysLeft, trialSubscription,
} from '../personal-access';
import type { SubscriptionContext } from '../../types/session';

const DAY_MS = 24 * 60 * 60 * 1000;
const START = new Date('2026-10-06T08:00:00.000Z');
const at = (offsetMs: number) => new Date(START.getTime() + offsetMs);

const paid: SubscriptionContext = {
  planCode: 'IND_PLUS', planName: 'Cá nhân Plus', status: 'active', entitlements: ['personal_learning_path'],
};

describe('trialSubscription', () => {
  it('opens a Plus trial that ends after the configured number of days', () => {
    const sub = trialSubscription(START);

    expect(sub.planCode).toBe('IND_PLUS');
    expect(sub.status).toBe('trialing');
    expect(sub.entitlements).toEqual(['personal_learning_path']);
    expect(sub.trialStartedAt).toBe(START.toISOString());
    expect(new Date(sub.trialEndsAt!).getTime() - START.getTime()).toBe(INDIVIDUAL_TRIAL.days * DAY_MS);
    expect(sub.trialCourseLimit).toBe(INDIVIDUAL_TRIAL.courseLimit);
  });
});

describe('trialDaysLeft (BR-15)', () => {
  const endsAt = trialSubscription(START).trialEndsAt!;

  it('counts calendar days rounded up', () => {
    expect(trialDaysLeft(endsAt, START)).toBe(7);
    expect(trialDaysLeft(endsAt, at(23 * 60 * 60 * 1000 + 59 * 60 * 1000))).toBe(7);
    expect(trialDaysLeft(endsAt, at(DAY_MS + 60 * 1000))).toBe(6);
    expect(trialDaysLeft(endsAt, at(6 * DAY_MS + 60 * 1000))).toBe(1);
  });

  it('is zero once the trial has ended and never negative', () => {
    expect(trialDaysLeft(endsAt, at(INDIVIDUAL_TRIAL.days * DAY_MS))).toBe(0);
    expect(trialDaysLeft(endsAt, at(INDIVIDUAL_TRIAL.days * DAY_MS + 5 * DAY_MS))).toBe(0);
  });

  it('is zero for a missing or invalid date', () => {
    expect(trialDaysLeft(undefined, START)).toBe(0);
    expect(trialDaysLeft('not-a-date', START)).toBe(0);
  });
});

describe('isTrialExpired / settleSubscription', () => {
  const trial = trialSubscription(START);

  it('keeps a running trial as it is', () => {
    expect(isTrialExpired(trial, at(DAY_MS))).toBe(false);
    expect(settleSubscription(trial, at(DAY_MS))).toBe(trial);
  });

  it('turns an ended trial into the Free plan and keeps the trial dates (BR-14)', () => {
    const now = at(INDIVIDUAL_TRIAL.days * DAY_MS);

    expect(isTrialExpired(trial, now)).toBe(true);
    const settled = settleSubscription(trial, now);
    expect(settled.planCode).toBe('IND_FREE');
    expect(settled.planName).toBe('Miễn phí');
    expect(settled.status).toBe('active');
    expect(settled.entitlements).toEqual(['personal_learning_path']);
    expect(settled.trialStartedAt).toBe(trial.trialStartedAt);
    expect(settled.trialEndsAt).toBe(trial.trialEndsAt);
  });

  it('counts a trial that carries no end date as over, not as lasting for ever', () => {
    const noEnd: SubscriptionContext = { ...trialSubscription(START), trialEndsAt: undefined };

    expect(isTrialExpired(noEnd, START)).toBe(true);
    expect(settleSubscription(noEnd, START).planCode).toBe('IND_FREE');
  });

  it('never touches a paid or missing subscription', () => {
    expect(isTrialExpired(paid, at(400 * DAY_MS))).toBe(false);
    expect(settleSubscription(paid, at(400 * DAY_MS))).toBe(paid);
    expect(settleSubscription(undefined, START)).toBeUndefined();
  });
});

describe('accessModeOf', () => {
  it('is full for a paid plan and for sessions without a subscription', () => {
    expect(accessModeOf(paid, START)).toBe('full');
    expect(accessModeOf(undefined, START)).toBe('full');
  });

  it('is trial while the trial runs and free once it is over', () => {
    const trial = trialSubscription(START);
    expect(accessModeOf(trial, at(DAY_MS))).toBe('trial');
    expect(accessModeOf(trial, at(INDIVIDUAL_TRIAL.days * DAY_MS))).toBe('free');
  });

  it('is free for the Free plan', () => {
    expect(accessModeOf(freeSubscription(), START)).toBe('free');
  });
});

describe('isSubscriptionUsable', () => {
  it('accepts active and trialing, refuses the rest', () => {
    expect(isSubscriptionUsable('active')).toBe(true);
    expect(isSubscriptionUsable('trialing')).toBe(true);
    expect(isSubscriptionUsable('expired')).toBe(false);
    expect(isSubscriptionUsable('payment_required')).toBe(false);
  });
});

describe('reassessAvailableAt (BR-09)', () => {
  const completedAt = '2026-09-01T10:00:00.000Z';

  it('opens at the start of the day FREE_REASSESS_DAYS later, the day the message announces', () => {
    const opens = new Date(reassessAvailableAt(completedAt));
    const announced = new Date(new Date(completedAt).getTime() + FREE_REASSESS_DAYS * DAY_MS);

    expect([opens.getHours(), opens.getMinutes(), opens.getSeconds()]).toEqual([0, 0, 0]);
    expect(formatDmy(opens.toISOString())).toBe(formatDmy(announced.toISOString()));
    expect(opens.getTime()).toBeLessThanOrEqual(announced.getTime());
    expect(opens.getTime()).toBeGreaterThan(announced.getTime() - DAY_MS);
  });

  it('is closed at day 29 and open at day 30, at any hour of that day', () => {
    const opens = new Date(reassessAvailableAt(completedAt)).getTime();
    const day29 = new Date(completedAt).getTime() + 29 * DAY_MS;
    const day30 = new Date(completedAt).getTime() + 30 * DAY_MS;
    expect(day29 >= opens).toBe(false);
    expect(day30 >= opens).toBe(true);
    expect(opens + 60 * 1000 >= opens).toBe(true);
  });
});

describe('checklistOf (§8.6)', () => {
  const none = { hasDiagnostic: false, seenPath: false, hasPassedAttempt: false, seenProfileAfterPass: false };
  const doneKeys = (input: Parameters<typeof checklistOf>[0]) =>
    checklistOf(input).filter((item) => item.done).map((item) => item.key);

  it('lists the four steps in order, all open for a new account', () => {
    expect(checklistOf(none).map((item) => item.key)).toEqual(['diagnostic', 'path', 'first-course', 'profile']);
    expect(doneKeys(none)).toEqual([]);
  });

  it('ticks each step from its own signal', () => {
    expect(doneKeys({ ...none, hasDiagnostic: true })).toEqual(['diagnostic']);
    expect(doneKeys({ ...none, hasDiagnostic: true, seenPath: true })).toEqual(['diagnostic', 'path']);
    expect(doneKeys({ ...none, hasPassedAttempt: true })).toEqual(['first-course']);
    expect(doneKeys({ hasDiagnostic: true, seenPath: true, hasPassedAttempt: true, seenProfileAfterPass: true }))
      .toEqual(['diagnostic', 'path', 'first-course', 'profile']);
  });
});

describe('planBadgeText (spec §8.5)', () => {
  it('counts the days of a trial, and says it is the last day from the last one on', () => {
    expect(planBadgeText('trial', 5)).toEqual({ full: 'Dùng thử · còn 5 ngày', compact: '5 ngày' });
    expect(planBadgeText('trial', 2).full).toBe('Dùng thử · còn 2 ngày');
    expect(planBadgeText('trial', 1)).toEqual({ full: 'Dùng thử · hôm nay là ngày cuối', compact: 'Ngày cuối' });
    expect(planBadgeText('trial', 0).full).toBe('Dùng thử · hôm nay là ngày cuối');
  });

  it('names the Free plan', () => {
    expect(planBadgeText('free', null)).toEqual({ full: 'Gói Miễn phí', compact: 'Miễn phí' });
  });
});

describe('isIndividualUpgrader', () => {
  const personal = (subscription?: SubscriptionContext) => ({ workspace: 'personal', subscription });

  it('is true for a learner on a trial or on the Free plan', () => {
    expect(isIndividualUpgrader(personal(trialSubscription(START)))).toBe(true);
    expect(isIndividualUpgrader(personal(freeSubscription()))).toBe(true);
  });

  it('is false for a paying learner, a learner with no plan, enterprise accounts and nobody', () => {
    expect(isIndividualUpgrader(personal(paid))).toBe(false);
    expect(isIndividualUpgrader(personal())).toBe(false);
    expect(isIndividualUpgrader({ workspace: 'enterprise', subscription: trialSubscription(START) })).toBe(false);
    expect(isIndividualUpgrader(null)).toBe(false);
    expect(isIndividualUpgrader(undefined)).toBe(false);
  });
});

describe('formatDmy', () => {
  it('writes day/month/year with two digits, and nothing for a bad date', () => {
    expect(formatDmy(new Date(2026, 9, 6, 12).toISOString())).toBe('06/10/2026');
    expect(formatDmy('not-a-date')).toBe('');
  });
});

describe('seen keys', () => {
  it('accepts the markers of the spec and nothing else', () => {
    for (const key of SEEN_KEYS) expect(isSeenKey(key)).toBe(true);
    expect(SEEN_KEYS).toEqual(expect.arrayContaining(['path', 'profile-after-pass', 'trial-ended', 'notice-day2', 'notice-day5']));
    expect(isSeenKey('anything-else')).toBe(false);
    expect(isSeenKey('__proto__')).toBe(false);
  });
});
