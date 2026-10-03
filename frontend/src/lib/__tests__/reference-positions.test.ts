import { describe, it, expect } from 'vitest';
import {
  REFERENCE_POSITIONS,
  TT02_DOMAINS,
  getReferencePosition,
  requirementsByDomain,
  summarizeRequirements,
} from '../reference-positions';

const accountant = getReferencePosition('ACCOUNTANT')!;

describe('reference positions (MVP, built by DigiTalent AI on the TT02 framework)', () => {
  it('lists the five MVP positions', () => {
    expect(REFERENCE_POSITIONS.map((p) => p.code)).toEqual(['CEO', 'HR', 'MARKETING', 'SALES_CRM', 'ACCOUNTANT']);
  });

  it('covers all 24 competencies of the 6 domains', () => {
    expect(TT02_DOMAINS.map((d) => d.competencyCount)).toEqual([3, 6, 4, 4, 4, 3]);
    for (const position of REFERENCE_POSITIONS) expect(position.levels).toHaveLength(24);
  });

  it('keeps every position inside the 9–24 rule and always selects the core safety competencies 4.1 and 4.2', () => {
    for (const position of REFERENCE_POSITIONS) {
      const { selected } = summarizeRequirements(position);
      expect(selected).toBeGreaterThanOrEqual(9);
      expect(selected).toBeLessThanOrEqual(24);
      expect(position.levels[13]).toBeGreaterThan(0); // 4.1
      expect(position.levels[14]).toBeGreaterThan(0); // 4.2
    }
  });

  it('matches the spec example: the accountant selects 21 of 24 competencies', () => {
    expect(summarizeRequirements(accountant).selected).toBe(21);
  });

  it('summarises each domain with how many competencies are selected and the highest level asked', () => {
    const { domains } = summarizeRequirements(accountant);

    expect(domains).toHaveLength(6);
    expect(domains[0]).toMatchObject({ number: 1, selected: 3, total: 3, highestLevel: 3 });
    // 3.2 and 3.3 are not required for the accountant, so only 3.1 and 3.4 count in domain 3.
    expect(domains[2]).toMatchObject({ number: 3, selected: 2, total: 4, highestLevel: 2 });
  });

  it('lists the required competencies per domain with their names and levels', () => {
    const groups = requirementsByDomain(accountant);

    expect(groups).toHaveLength(6);
    expect(groups.flatMap((group) => group.items)).toHaveLength(21);
    expect(groups[2].items.map((item) => item.code)).toEqual(['3.1', '3.4']);
    expect(groups[2].items[0]).toEqual({ code: '3.1', name: 'Phát triển nội dung số', level: 1 });
    expect(groups[2].notRequired).toEqual(['3.2', '3.3']);
  });

  it('finds a position by code and returns undefined for unknown ones', () => {
    expect(getReferencePosition('HR')?.name).toBe('Nhân sự');
    expect(getReferencePosition('AI_ENGINEER')).toBeUndefined();
  });
});
