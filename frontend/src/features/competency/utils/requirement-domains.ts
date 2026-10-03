/**
 * Position requirement editor helpers — Circular 02/2025 (docs/specs/2026-09-29-tt02-position-competency-matrix.md).
 * Decision D-B7: a position selects the competencies relevant to the job (9–24 of the 24, always including the core
 * safety competencies), each at its own level. The editor always shows the whole framework grouped by the 6 domains;
 * a competency the position does not need is set to "Not required" and is left out of the saved set.
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

/** Mandatory for every position: 4.1 protecting devices, 4.2 protecting personal data (Decree 13/2023). */
export const CORE_COMPETENCY_CODES: readonly string[] = ['4.1', '4.2'];
export const MIN_REQUIREMENT_COUNT = 9;
export const NOT_REQUIRED = 0;

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
  /** 0 = not required for this position, 1–3 = Basic / Intermediate / Advanced. */
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

export interface ActivationIssues {
  requiredCount: number;
  isCountValid: boolean;
  missingCore: string[];
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

export function requiredRows<T extends DomainRow>(rows: T[]): T[] {
  return rows.filter((r) => r.requiredLevel > NOT_REQUIRED);
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

/** Most frequent level among the required lines of a domain (ties → the higher level); 0 when nothing is required. */
export function domainLevel(rows: DomainRow[]): number {
  const counts = new Map<number, number>();
  requiredRows(rows).forEach((r) => counts.set(r.requiredLevel, (counts.get(r.requiredLevel) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0] ?? NOT_REQUIRED;
}

/** Mandatory = competencies required at Advanced, plus the core safety competencies for every position. */
export function isMandatoryFor(level: number, frameworkCode?: string | null): boolean {
  if (level === NOT_REQUIRED) return false;
  return level === ADVANCED_LEVEL || (!!frameworkCode && CORE_COMPETENCY_CODES.includes(frameworkCode));
}

function withLevel<T extends DomainRow>(row: T, level: number): T {
  return {
    ...row,
    requiredLevel: level,
    isMandatory: isMandatoryFor(level, row.frameworkCode),
    weightPercent: level === NOT_REQUIRED ? 0 : row.weightPercent,
  };
}

export function setRowLevel<T extends DomainRow>(rows: T[], competencyId: string, level: number): T[] {
  return rows.map((row) => (row.competencyId === competencyId ? withLevel(row, level) : row));
}

export function applyLevelToDomain<T extends DomainRow>(rows: T[], categoryId: string, level: number): T[] {
  return rows.map((row) => (row.categoryId === categoryId ? withLevel(row, level) : row));
}

/** Round each share to cents, the last part absorbs the remainder so parts always add up to the total. */
function splitEvenly(totalCents: number, parts: number): number[] {
  const share = Math.round(totalCents / parts);
  return Array.from({ length: parts }, (_, i) => (i === parts - 1 ? totalCents - share * (parts - 1) : share));
}

/**
 * 100% split evenly across the domains that have required lines, then evenly across those lines —
 * same as backend Tt02Catalog.RequirementsFor. "Not required" lines get 0.
 */
export function distributeWeightsByDomain<T extends DomainRow>(rows: T[]): T[] {
  const groups = groupByDomain(requiredRows(rows));
  const weights = new Map<string, number>();
  if (groups.length > 0) {
    const domainCents = splitEvenly(TOTAL_CENTS, groups.length);
    groups.forEach((group, g) => {
      splitEvenly(domainCents[g], group.rows.length).forEach((cents, i) => weights.set(group.rows[i].competencyId, cents / 100));
    });
  }
  return rows.map((row) => ({ ...row, weightPercent: weights.get(row.competencyId) ?? 0 }));
}

/** What still blocks activation: 9–24 competencies and the core safety competencies (server enforces the same). */
export function activationIssues(rows: DomainRow[]): ActivationIssues {
  const required = requiredRows(rows);
  const present = new Set(required.map((r) => r.frameworkCode));
  return {
    requiredCount: required.length,
    isCountValid: required.length >= MIN_REQUIREMENT_COUNT && required.length <= TT02_COMPETENCY_CODES.length,
    missingCore: CORE_COMPETENCY_CODES.filter((code) => !present.has(code)),
  };
}

export function toDomainRow(source: CompetencySource, level: number = DEFAULT_DRAFT_LEVEL): DomainRow {
  return {
    competencyId: source.id,
    competencyCode: source.code,
    competencyName: source.name,
    frameworkCode: source.frameworkCode ?? null,
    categoryId: source.categoryId,
    categoryName: source.categoryName,
    categorySortOrder: source.categorySortOrder ?? 0,
    requiredLevel: level,
    weightPercent: 0,
    isMandatory: isMandatoryFor(level, source.frameworkCode),
    requiresPracticalEvidence: true,
    note: '',
  };
}

/** Saved lines plus a "Not required" row for every framework competency the set does not contain. */
export function mergeWithFramework<T extends DomainRow>(rows: T[], competencies: CompetencySource[]): (T | DomainRow)[] {
  const present = new Set(rows.map((r) => r.competencyId));
  const missing = competencies.filter((c) => c.frameworkCode && !present.has(c.id)).map((c) => toDomainRow(c, NOT_REQUIRED));
  return [...rows, ...missing];
}

/** New draft: every framework competency at Intermediate, weights split by domain — HR then trims and adjusts. */
export function buildDraftRows(competencies: CompetencySource[]): DomainRow[] {
  const rows = competencies.filter((c) => c.frameworkCode).map((c) => toDomainRow(c));
  return distributeWeightsByDomain(groupByDomain(rows).flatMap((g) => g.rows));
}
