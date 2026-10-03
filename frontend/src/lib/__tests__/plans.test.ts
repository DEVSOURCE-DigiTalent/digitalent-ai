import { describe, it, expect } from 'vitest';
import {
  PLANS, clampSeats, formatVnd, getPlan, isPurchasableOnline, plansFor, priceFor,
} from '../plans';
import { parsePlanSelection, planSelectionToQuery } from '../plan-query';
import { ENTITLEMENTS } from '../entitlements';

const pro = getPlan('ENT_PRO')!;
const starter = getPlan('ENT_STARTER')!;

describe('plan catalog', () => {
  it('sells every plan for money: Individual and Enterprise are both paid products', () => {
    expect(getPlan('IND_FREE')).toBeUndefined();
    for (const plan of PLANS) expect(plan.monthlyPrice === null || plan.monthlyPrice > 0).toBe(true);
  });

  it('has unique codes and the plan codes the seeded demo accounts use', () => {
    const codes = PLANS.map((p) => p.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes).toEqual(expect.arrayContaining(['ENT_PRO', 'ENT_STARTER', 'IND_PLUS']));
  });

  it('gives Pro everything Starter has plus the extra features', () => {
    for (const entitlement of starter.entitlements) expect(pro.entitlements).toContain(entitlement);
    expect(pro.entitlements).toContain(ENTITLEMENTS.INTERNAL_LEARNING);
    expect(starter.entitlements).not.toContain(ENTITLEMENTS.INTERNAL_LEARNING);
  });

  it('splits plans by audience', () => {
    expect(plansFor('enterprise').every((p) => p.audience === 'enterprise')).toBe(true);
    expect(plansFor('individual').map((p) => p.code)).toEqual(['IND_PLUS', 'IND_PRO']);
  });

  it('sells the contact plan only through sales', () => {
    expect(isPurchasableOnline(getPlan('ENT_CORP')!)).toBe(false);
  });
});

describe('pricing', () => {
  it('calculates bundle base price and add-on users correctly', () => {
    expect(priceFor(pro, 50, 'month')).toBe(1_990_000);
    expect(priceFor(pro, 60, 'month')).toBe(1_990_000 + 10 * 35_000);
  });

  it('calculates yearly bundle price with add-on users', () => {
    expect(priceFor(pro, 50, 'year')).toBe(19_090_000);
    expect(priceFor(pro, 60, 'year')).toBe(19_090_000 + 10 * 336_000);
  });

  it('keeps seats inside what the plan sells', () => {
    expect(clampSeats(starter, 1)).toBe(starter.users!.included);
    expect(clampSeats(starter, 999)).toBe(starter.users!.max);
    expect(clampSeats(starter, Number.NaN)).toBe(starter.users!.included);
    expect(priceFor(starter, 999, 'month')).toBe(790_000 + 10 * 40_000);
  });

  it('charges individual plans once, whatever the seats', () => {
    expect(priceFor(getPlan('IND_PLUS')!, 7, 'month')).toBe(149_000);
  });

  it('has no online price for the contact plan', () => {
    expect(priceFor(getPlan('ENT_CORP')!, 100, 'month')).toBeNull();
  });

  it('formats Vietnamese dong', () => {
    expect(formatVnd(1_580_000)).toMatch(/^1\.580\.000\s₫$/);
  });
});

describe('plan query', () => {
  it('round-trips a selection', () => {
    const query = planSelectionToQuery({ planCode: 'ENT_PRO', seats: 60, cycle: 'year' });
    expect(parsePlanSelection(new URLSearchParams(query), 'enterprise')).toEqual({ planCode: 'ENT_PRO', seats: 60, cycle: 'year' });
  });

  it('ignores plans of the other audience, unknown plans and the contact plan', () => {
    const parse = (query: string, audience: 'enterprise' | 'individual') => parsePlanSelection(new URLSearchParams(query), audience);

    expect(parse('plan=IND_PLUS', 'enterprise')).toBeUndefined();
    expect(parse('plan=NOPE', 'enterprise')).toBeUndefined();
    expect(parse('plan=ENT_CORP', 'enterprise')).toBeUndefined();
    expect(parse('', 'individual')).toBeUndefined();
  });

  it('clamps hand-edited seats and defaults the cycle to monthly', () => {
    const selection = parsePlanSelection(new URLSearchParams('plan=ENT_STARTER&seats=100000&cycle=weekly'), 'enterprise');

    expect(selection).toEqual({ planCode: 'ENT_STARTER', seats: starter.seatRange!.max, cycle: 'month' });
  });
});
