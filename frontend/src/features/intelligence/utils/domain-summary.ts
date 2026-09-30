import type { SkillGapItem } from '@/services/intelligence.service';
import type { CompetencyChartItem } from './chart-data';

/**
 * Skill gap grouped by domain (Circular 02/2025 categories) — decision D-B3:
 * the radar plots the AVERAGE confirmed level of a domain (unconfirmed = 0), while "domain met" uses the LOWEST level,
 * i.e. a domain is met only when every competency in it is met.
 */
export interface DomainSummary {
  key: string;
  name: string;
  sortOrder: number;
  /** Most frequent required level in the domain (ties → higher). */
  requiredLevel: number;
  averageLevel: number;
  isMet: boolean;
  gapCount: number;
  /** Lines of the domain, highest priority first. */
  items: SkillGapItem[];
}

const MIN_DOMAINS_FOR_DOMAIN_CHART = 3;
const AXIS_LABEL_MAX = 28;

const round2 = (value: number) => Math.round(value * 100) / 100;

function mostFrequentLevel(items: SkillGapItem[]): number {
  const counts = new Map<number, number>();
  items.forEach((i) => counts.set(i.requiredLevel, (counts.get(i.requiredLevel) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0];
}

export function summarizeByDomain(items: SkillGapItem[]): DomainSummary[] {
  const groups = new Map<string, SkillGapItem[]>();
  items.forEach((item) => {
    const key = item.categoryName ?? 'Other';
    groups.set(key, [...(groups.get(key) ?? []), item]);
  });

  return [...groups.entries()]
    .map(([key, domainItems]) => ({
      key,
      name: key,
      sortOrder: domainItems[0].categorySortOrder ?? 0,
      requiredLevel: mostFrequentLevel(domainItems),
      averageLevel: round2(domainItems.reduce((sum, i) => sum + (i.currentLevel ?? 0), 0) / domainItems.length),
      isMet: domainItems.every((i) => i.gapSteps === 0),
      gapCount: domainItems.filter((i) => i.gapSteps > 0).length,
      items: [...domainItems].sort(
        (a, b) => b.priorityScore - a.priorityScore || (a.frameworkCode ?? a.competencyName).localeCompare(b.frameworkCode ?? b.competencyName),
      ),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

/** One radar axis per domain: required = domain level, current = average confirmed level. */
export function toDomainChartItems(domains: DomainSummary[]): CompetencyChartItem[] {
  return domains.map((d) => ({
    competencyName: d.name.length > AXIS_LABEL_MAX ? `${d.name.slice(0, AXIS_LABEL_MAX - 1)}…` : d.name,
    requiredLevel: d.requiredLevel,
    currentLevel: d.averageLevel,
  }));
}

/** 24 axes are unreadable → chart by domain once the standard spans 3+ domains. */
export function shouldChartByDomain(items: SkillGapItem[]): boolean {
  return new Set(items.map((i) => i.categoryName ?? 'Other')).size >= MIN_DOMAINS_FOR_DOMAIN_CHART;
}
