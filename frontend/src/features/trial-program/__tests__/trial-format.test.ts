import { describe, expect, it } from 'vitest';
import { domainTotals, levelFromShare, sharePercent } from '../lib/trial-format';

describe('survey level from the share of right answers (same rule as TrialProgramRules.LevelFromShare)', () => {
  it('gives level 0 below 40%, then 1 / 2 / 3 from 40 / 60 / 80%', () => {
    expect(levelFromShare(5, 15)).toBe(0);
    expect(levelFromShare(6, 15)).toBe(1);
    expect(levelFromShare(8, 15)).toBe(1);
    expect(levelFromShare(9, 15)).toBe(2);
    expect(levelFromShare(11, 15)).toBe(2);
    expect(levelFromShare(12, 15)).toBe(3);
    expect(levelFromShare(15, 15)).toBe(3);
    expect(levelFromShare(0, 0)).toBe(0);
  });

  it('adds every level of a domain together and rounds the share', () => {
    const totals = domainTotals({
      basicCorrect: 2, basicTotal: 5,
      intermediateCorrect: 5, intermediateTotal: 5,
      advancedCorrect: 5, advancedTotal: 5,
    });
    expect(totals).toEqual({ correct: 12, total: 15, percent: 80 });
    expect(sharePercent(7, 15)).toBe(47);
    expect(domainTotals(null)).toEqual({ correct: 0, total: 0, percent: 0 });
  });
});
