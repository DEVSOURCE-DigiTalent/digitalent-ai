import { describe, expect, it } from 'vitest';
import { REFERENCE_POSITIONS } from '@/lib/reference-positions';
import {
  TRIAL_QUESTIONS,
  TRIAL_SLICE_BY_POSITION,
  trialPathFor,
} from '../individual-trial/individual-trial-data';

describe('individual trial data contract', () => {
  it('has one orientation question per TT02 domain', () => {
    expect(TRIAL_QUESTIONS).toHaveLength(6);
    expect(TRIAL_QUESTIONS.map((question) => question.domainNumber)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('has one complete learning slice with a takeaway artifact for every reference position', () => {
    for (const position of REFERENCE_POSITIONS) {
      const slice = TRIAL_SLICE_BY_POSITION[position.code];
      expect(slice).toBeDefined();
      expect(slice.lesson.length).toBeGreaterThan(0);
      expect(slice.scenarioOptions).toHaveLength(3);
      expect(slice.selfCheckOptions).toHaveLength(3);
      expect(slice.takeaway).toBeDefined();
      expect(slice.takeaway.title).toBeTruthy();
      expect(slice.takeaway.items.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('opens the role-specific learning slice first without mutating the position catalogue', () => {
    const position = REFERENCE_POSITIONS.find((item) => item.code === 'MARKETING')!;
    const originalLevels = [...position.levels];
    const answers = Object.fromEntries(TRIAL_QUESTIONS.map((question) => [question.id, -1]));

    const path = trialPathFor(position, answers);

    expect(path).toHaveLength(3);
    expect(path[0].domainNumber).toBe(Number(TRIAL_SLICE_BY_POSITION.MARKETING.competencyCode.split('.')[0]));
    expect(position.levels).toEqual(originalLevels);
  });

  it('populates specific unlock benefits for locked priorities in trial path', () => {
    const position = REFERENCE_POSITIONS.find((item) => item.code === 'HR')!;
    const path = trialPathFor(position, {}, 'completed');

    expect(path[1].unlockBenefit).toContain('Mở 4 bài học');
    expect(path[2].unlockBenefit).toContain('Mở bài đánh giá đầy đủ');
  });

  it('sets all baseline levels to 0 when diagnostic is skipped', () => {
    const position = REFERENCE_POSITIONS.find((item) => item.code === 'CEO')!;
    const path = trialPathFor(position, {}, 'skipped');

    expect(path).toHaveLength(3);
    for (const item of path) {
      expect(item.currentLevel).toBe(0);
    }
  });
});
