import { describe, expect, it } from 'vitest';
import { passedTier, tierPassMark } from '../lib/trial-format';

describe('survey level pass mark (same rule as TrialProgramRules.TierPassMark)', () => {
  it('needs two of three right answers, one of one, and 70% rounded up otherwise', () => {
    expect(tierPassMark(3)).toBe(2);
    expect(tierPassMark(1)).toBe(1);
    expect(tierPassMark(10)).toBe(7);
    expect(tierPassMark(0)).toBe(0);
  });

  it('marks a level as passed from two right answers out of three', () => {
    expect(passedTier(2, 3)).toBe(true);
    expect(passedTier(1, 3)).toBe(false);
    expect(passedTier(3, 3)).toBe(true);
    expect(passedTier(0, 0)).toBe(false);
  });
});
