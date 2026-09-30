import { describe, it, expect } from 'vitest';
import {
  levelLabel,
  levelLabelVi,
  levelWithTier,
  levelFromDigComp,
  levelLabelViFromDigComp,
} from '../competency-levels';

describe('competency levels (3-level scale, Circular 02/2025)', () => {
  it('keeps English labels for enterprise pages', () => {
    expect([levelLabel(1), levelLabel(2), levelLabel(3), levelLabel(null)]).toEqual([
      'Basic',
      'Intermediate',
      'Advanced',
      'Not confirmed',
    ]);
  });

  it('uses "Trung bình" (not "Trung cấp") for the Vietnamese learner track', () => {
    expect([levelLabelVi(1), levelLabelVi(2), levelLabelVi(3), levelLabelVi(0)]).toEqual([
      'Cơ bản',
      'Trung bình',
      'Nâng cao',
      'Chưa xác nhận',
    ]);
  });

  it('shows the matching Circular 02/2025 tiers next to the level', () => {
    expect(levelWithTier(2)).toBe('Intermediate · TT02 tiers 3–4');
    expect(levelWithTier(3, 'vi')).toBe('Nâng cao · bậc 5–6');
  });

  it('maps the DigComp 1–6 learner scale onto 3 levels (1–2, 3–4, 5–6)', () => {
    expect([1, 2, 3, 4, 5, 6].map(levelFromDigComp)).toEqual([1, 1, 2, 2, 3, 3]);
    expect(levelLabelViFromDigComp(4)).toBe('Trung bình');
    expect(levelFromDigComp(0)).toBe(0);
  });
});
