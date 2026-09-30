import { describe, it, expect } from 'vitest';
import type { SkillGapItem } from '@/services/intelligence.service';
import { summarizeByDomain, toDomainChartItems, shouldChartByDomain } from '../domain-summary';

function item(code: string, required: number, current: number | null, priority = 0, mandatory = false): SkillGapItem {
  const domain = Number(code.split('.')[0]);
  const gap = Math.max(0, required - (current ?? 0));
  return {
    competencyId: `c-${code}`,
    competencyCode: `TT02-${code}`,
    competencyName: `Competency ${code}`,
    categoryName: `${domain}. Domain ${domain}`,
    categorySortOrder: domain,
    frameworkCode: code,
    requiredLevel: required,
    currentLevel: current,
    gapSteps: gap,
    weightPercent: 4.17,
    mandatory,
    mandatoryMultiplier: mandatory ? 1.5 : 1,
    priorityScore: priority,
    severity: gap >= 2 ? 'HIGH' : gap === 1 ? (mandatory ? 'MEDIUM' : 'LOW') : null,
  };
}

// Accountant after confirming 4.2 at Intermediate (demo step 5)
const ITEMS = [
  item('3.1', 1, 1), item('3.2', 1, 1),
  item('4.1', 3, 1, 12.51, true), item('4.2', 3, 2, 6.26, true), item('4.3', 3, 1, 12.51, true), item('4.4', 3, 1, 12.48, true),
  item('1.1', 3, 1, 16.68, true),
];

describe('skill gap domain summary (D-B3)', () => {
  it('orders domains by sort order and ranks lines by priority inside a domain', () => {
    const domains = summarizeByDomain(ITEMS);

    expect(domains.map((d) => d.sortOrder)).toEqual([1, 3, 4]);
    expect(domains[2].items.map((i) => i.frameworkCode)).toEqual(['4.1', '4.3', '4.4', '4.2']);
  });

  it('plots the average confirmed level but marks a domain met only when every competency is met', () => {
    const [, domain3, domain4] = summarizeByDomain(ITEMS);

    expect(domain4.requiredLevel).toBe(3);
    expect(domain4.averageLevel).toBe(1.25);
    expect(domain4.isMet).toBe(false);
    expect(domain4.gapCount).toBe(4);
    expect(domain3.isMet).toBe(true);
  });

  it('turns domains into chart axes and only charts by domain from 3 domains up', () => {
    const chart = toDomainChartItems(summarizeByDomain(ITEMS));

    expect(chart.find((c) => c.competencyName.startsWith('4.'))).toMatchObject({ requiredLevel: 3, currentLevel: 1.25 });
    expect(shouldChartByDomain(ITEMS)).toBe(true);
    expect(shouldChartByDomain(ITEMS.filter((i) => i.categorySortOrder === 4))).toBe(false);
  });
});
