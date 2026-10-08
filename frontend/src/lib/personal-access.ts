import { FREE_REASSESS_DAYS, INDIVIDUAL_TRIAL, entitlementKeys, getPlan } from './plans';
import type { SubscriptionContext, SubscriptionStatus } from '../types/session';

/**
 * Pure rules of the individual reverse trial (no React, no storage): shared by the mock server and the screens.
 * The server decides access from these; the screens only reflect it.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export type AccessMode = 'full' | 'trial' | 'free';

/** UI markers the server stores per learner (spec §7.5 and §10). Anything else is refused. */
export const SEEN_KEYS = [
  'path',
  'profile-after-pass',
  'tip-diagnostic-result',
  'tip-first-course',
  'tip-profile',
  'checklist-hidden',
  'trial-ended',
  'notice-day2',
  'notice-day5',
] as const;

export type SeenKey = (typeof SEEN_KEYS)[number];

export const isSeenKey = (value: string): value is SeenKey => (SEEN_KEYS as readonly string[]).includes(value);

export type TrialChecklistKey = 'diagnostic' | 'path' | 'first-course' | 'profile';

export interface TrialChecklistItem {
  key: TrialChecklistKey;
  done: boolean;
}

export interface ChecklistInput {
  hasDiagnostic: boolean;
  /** The learner opened the path after the entry assessment (`seen.path`). */
  seenPath: boolean;
  hasPassedAttempt: boolean;
  /** The learner opened the profile after the first pass (`seen.profile-after-pass`). */
  seenProfileAfterPass: boolean;
}

const planOrThrow = (code: string) => {
  const plan = getPlan(code);
  if (!plan) throw new Error(`Plan ${code} is missing from the catalog.`);
  return plan;
};

/** `active` and `trialing` both let the learner in; anything else stops at the payment-required screen. */
export function isSubscriptionUsable(status: SubscriptionStatus): boolean {
  return status === 'active' || status === 'trialing';
}

export function trialSubscription(now: Date): SubscriptionContext {
  const plus = planOrThrow('IND_PLUS');
  return {
    planCode: plus.code,
    planName: 'Cá nhân Plus',
    status: 'trialing',
    entitlements: entitlementKeys(plus),
    trialStartedAt: now.toISOString(),
    trialEndsAt: new Date(now.getTime() + INDIVIDUAL_TRIAL.days * DAY_MS).toISOString(),
    trialCourseLimit: INDIVIDUAL_TRIAL.courseLimit,
  };
}

/** The Free plan; the trial dates of `previous` are kept so the account's history still shows them (BR-14). */
export function freeSubscription(previous?: SubscriptionContext): SubscriptionContext {
  const free = planOrThrow('IND_FREE');
  return {
    planCode: free.code,
    planName: free.name,
    status: 'active',
    entitlements: entitlementKeys(free),
    trialStartedAt: previous?.trialStartedAt,
    trialEndsAt: previous?.trialEndsAt,
  };
}

/** Whole calendar days left, rounded up (BR-15): 7 on the first day, 1 on the last, 0 once over. */
export function trialDaysLeft(trialEndsAt: string | undefined, now: Date): number {
  const endsAt = trialEndsAt ? new Date(trialEndsAt).getTime() : Number.NaN;
  if (Number.isNaN(endsAt)) return 0;
  return Math.max(0, Math.ceil((endsAt - now.getTime()) / DAY_MS));
}

export function isTrialExpired(subscription: SubscriptionContext | undefined, now: Date): boolean {
  if (subscription?.status !== 'trialing') return false;
  // A trial that carries no end date cannot be running: it counts as over rather than lasting for ever.
  if (!subscription.trialEndsAt) return true;
  return new Date(subscription.trialEndsAt).getTime() <= now.getTime();
}

/** The subscription as it stands at `now`: an ended trial becomes the Free plan. Same object when nothing changes. */
export function settleSubscription(subscription: SubscriptionContext, now: Date): SubscriptionContext;
export function settleSubscription(subscription: SubscriptionContext | undefined, now: Date): SubscriptionContext | undefined;
export function settleSubscription(subscription: SubscriptionContext | undefined, now: Date): SubscriptionContext | undefined {
  return subscription && isTrialExpired(subscription, now) ? freeSubscription(subscription) : subscription;
}

export function accessModeOf(subscription: SubscriptionContext | undefined, now: Date): AccessMode {
  if (!subscription) return 'full';
  const settled = settleSubscription(subscription, now);
  if (settled.planCode === 'IND_FREE') return 'free';
  return settled.status === 'trialing' ? 'trial' : 'full';
}

/**
 * First moment a Free learner may take the entry assessment again (BR-09): the start of the day that is
 * FREE_REASSESS_DAYS after the previous one, so the date shown ("từ ngày dd/mm") is the day it really opens.
 */
export function reassessAvailableAt(completedAt: string): string {
  const opens = new Date(new Date(completedAt).getTime() + FREE_REASSESS_DAYS * DAY_MS);
  opens.setHours(0, 0, 0, 0);
  return opens.toISOString();
}

/** Whether the account may start a purchase from a trial or the Free plan (no onboarding payment step is open). */
export function isIndividualUpgrader(
  user: { workspace?: string; subscription?: SubscriptionContext } | null | undefined,
): boolean {
  if (!user?.subscription || user.workspace !== 'personal') return false;
  return user.subscription.status === 'trialing' || user.subscription.planCode === 'IND_FREE';
}

/** Words of the plan label in the top bar of the personal workspace (spec §8.5): the full sentence and the phone version. */
export function planBadgeText(mode: 'trial' | 'free', daysLeft: number | null): { full: string; compact: string } {
  if (mode === 'free') return { full: 'Gói Miễn phí', compact: 'Miễn phí' };
  const days = daysLeft ?? 0;
  if (days <= 1) return { full: 'Dùng thử · hôm nay là ngày cuối', compact: 'Ngày cuối' };
  return { full: `Dùng thử · còn ${days} ngày`, compact: `${days} ngày` };
}

/** dd/mm/yyyy, as the Vietnamese screens and messages write dates. */
export function formatDmy(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function checklistOf(input: ChecklistInput): TrialChecklistItem[] {
  return [
    { key: 'diagnostic', done: input.hasDiagnostic },
    { key: 'path', done: input.seenPath },
    { key: 'first-course', done: input.hasPassedAttempt },
    { key: 'profile', done: input.seenProfileAfterPass },
  ];
}
