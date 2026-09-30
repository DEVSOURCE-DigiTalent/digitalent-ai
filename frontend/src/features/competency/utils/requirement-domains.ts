/**
 * Position requirement editor helpers — Circular 02/2025 (docs/specs/2026-09-29-tt02-position-competency-matrix.md).
 * A requirement set always holds all 24 competencies (D-B4), grouped by the 6 domains (competency categories).
 */

/** The 24 competencies of the national digital competence framework — mirror of backend CompetencyFrameworks.Tt02. */
export const TT02_COMPETENCY_CODES = [
  '1.1', '1.2', '1.3',
  '2.1', '2.2', '2.3', '2.4', '2.5', '2.6',
  '3.1', '3.2', '3.3', '3.4',
  '4.1', '4.2', '4.3', '4.4',
  '5.1', '5.2', '5.3', '5.4',
  '6.1', '6.2', '6.3',
] as const;

/** Domain 4 (Safety) is mandatory for every position — personal data protection (Decree 13/2023). */
const ALWAYS_MANDATORY_DOMAIN = 4;
const ADVANCED_LEVEL = 3;
const DEFAULT_DRAFT_LEVEL = 2;
const TOTAL_CENTS = 10000;

export interface DomainRow {
  competencyId: string;
  competencyCode?: string;
  competencyName?: string;
  frameworkCode?: string | null;
  categoryId: string;
  categoryName: string;
  categorySortOrder: number;
  requiredLevel: number;
  weightPercent: number;
  isMandatory: boolean;
  requiresPracticalEvidence: boolean;
  note?: string;
}

export interface DomainInfo {
  categoryId: string;
  name: string;
  sortOrder: number;
}

export interface DomainGroup<T extends DomainRow> {
  domain: DomainInfo;
  rows: T[];
}

/** Competency as returned by GET /competencies (only the fields the editor needs). */
export interface CompetencySource {
  id: string;
  code: string;
  name: string;
  frameworkCode?: string | null;
  categoryId: string;
  categoryName: string;
  categorySortOrder?: number;
}

function compareCodes(a?: string | null, b?: string | null): number {
  const left = (a ?? '').split('.').map(Number);
  const right = (b ?? '').split('.').map(Number);
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function groupByDomain<T extends DomainRow>(rows: T[]): DomainGroup<T>[] {
  const groups = new Map<string, DomainGroup<T>>();
  for (const row of rows) {
    const group = groups.get(row.categoryId) ?? {
      domain: { categoryId: row.categoryId, name: row.categoryName, sortOrder: row.categorySortOrder },
      rows: [],
    };
    group.rows.push(row);
    groups.set(row.categoryId, group);
  }
  return [...groups.values()]
    .sort((a, b) => a.domain.sortOrder - b.domain.sortOrder || a.domain.name.localeCompare(b.domain.name))
    .map((group) => ({
      ...group,
      rows: [...group.rows].sort(
        (a, b) => compareCodes(a.frameworkCode, b.frameworkCode) || (a.competencyCode ?? '').localeCompare(b.competencyCode ?? ''),
      ),
    }));
}

/** Most frequent required level in the domain (ties → the higher level). */
export function domainLevel(rows: DomainRow[]): number {
  const counts = new Map<number, number>();
  rows.forEach((r) => counts.set(r.requiredLevel, (counts.get(r.requiredLevel) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0] ?? DEFAULT_DRAFT_LEVEL;
}

/** D-B2: mandatory = the domains required at Advanced, plus domain 4 for every position. */
export function isMandatoryForDomain(level: number, domainSortOrder: number): boolean {
  return level === ADVANCED_LEVEL || domainSortOrder === ALWAYS_MANDATORY_DOMAIN;
}

export function applyLevelToDomain<T extends DomainRow>(rows: T[], categoryId: string, level: number): T[] {
  return rows.map((row) =>
    row.categoryId === categoryId
      ? { ...row, requiredLevel: level, isMandatory: isMandatoryForDomain(level, row.categorySortOrder) }
      : row,
  );
}

/** Round each share to cents, the last part absorbs the remainder so parts always add up to the total. */
function splitEvenly(totalCents: number, parts: number): number[] {
  const share = Math.round(totalCents / parts);
  return Array.from({ length: parts }, (_, i) => (i === parts - 1 ? totalCents - share * (parts - 1) : share));
}

/** 100% split evenly across domains, then evenly across a domain's lines — same as backend Tt02Catalog.WeightsByDomain. */
export function distributeWeightsByDomain<T extends DomainRow>(rows: T[]): T[] {
  const groups = groupByDomain(rows);
  const domainCents = splitEvenly(TOTAL_CENTS, groups.length);
  const weights = new Map<string, number>();
  groups.forEach((group, g) => {
    splitEvenly(domainCents[g], group.rows.length).forEach((cents, i) => weights.set(group.rows[i].competencyId, cents / 100));
  });
  return rows.map((row) => ({ ...row, weightPercent: weights.get(row.competencyId) ?? row.weightPercent }));
}

/** Circular codes not yet in the set — activation is blocked server-side until this is empty. */
export function missingFrameworkCodes(rows: Pick<DomainRow, 'frameworkCode'>[]): string[] {
  const present = new Set(rows.map((r) => r.frameworkCode).filter(Boolean));
  return TT02_COMPETENCY_CODES.filter((code) => !present.has(code));
}

export function toDomainRow(source: CompetencySource, level: number = DEFAULT_DRAFT_LEVEL): DomainRow {
  const sortOrder = source.categorySortOrder ?? 0;
  return {
    competencyId: source.id,
    competencyCode: source.code,
    competencyName: source.name,
    frameworkCode: source.frameworkCode ?? null,
    categoryId: source.categoryId,
    categoryName: source.categoryName,
    categorySortOrder: sortOrder,
    requiredLevel: level,
    weightPercent: 0,
    isMandatory: isMandatoryForDomain(level, sortOrder),
    requiresPracticalEvidence: true,
    note: '',
  };
}

/** New draft: every framework competency at Intermediate, weights split by domain. */
export function buildDraftRows(competencies: CompetencySource[]): DomainRow[] {
  const rows = competencies.filter((c) => c.frameworkCode).map((c) => toDomainRow(c));
  return distributeWeightsByDomain(groupByDomain(rows).flatMap((g) => g.rows));
}
