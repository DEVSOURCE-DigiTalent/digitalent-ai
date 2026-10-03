import { describe, it, expect } from 'vitest';
import {
  NOT_REQUIRED,
  TT02_COMPETENCY_CODES,
  activationIssues,
  applyLevelToDomain,
  buildDraftRows,
  distributeWeightsByDomain,
  domainLevel,
  groupByDomain,
  mergeWithFramework,
  requiredRows,
  setRowLevel,
  type DomainRow,
} from '../requirement-domains';

const DOMAIN_NAMES = ['Khai thác dữ liệu', 'Giao tiếp', 'Sáng tạo nội dung', 'An toàn', 'Giải quyết vấn đề', 'Ứng dụng AI'];

function competency(code: string) {
  const domain = Number(code.split('.')[0]);
  return {
    id: `c-${code}`,
    code: `TT02-${code}`,
    name: `Competency ${code}`,
    frameworkCode: code,
    categoryId: `cat-${domain}`,
    categoryName: `${domain}. ${DOMAIN_NAMES[domain - 1]}`,
    categorySortOrder: domain,
  };
}

const ALL = TT02_COMPETENCY_CODES.map(competency);

function rowsAt(level: number): DomainRow[] {
  return buildDraftRows(ALL).map((row) => ({ ...row, requiredLevel: level }));
}

const sum = (values: number[]) => Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100;
const byCode = (rows: DomainRow[], code: string) => rows.find((r) => r.frameworkCode === code)!;

describe('requirement editor helpers (Circular 02/2025, D-B7)', () => {
  it('builds a new draft with all 24 competencies grouped into 6 ordered domains', () => {
    const groups = groupByDomain(buildDraftRows([...ALL].reverse()));

    expect(groups.map((g) => g.domain.sortOrder)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(groups.map((g) => g.rows.length)).toEqual([3, 6, 4, 4, 4, 3]);
    expect(groups[0].rows.map((r) => r.frameworkCode)).toEqual(['1.1', '1.2', '1.3']);
  });

  it('always shows the whole framework: competencies missing from a saved set appear as "Not required"', () => {
    const saved = buildDraftRows(ALL).filter((r) => !['3.2', '3.3', '4.4'].includes(r.frameworkCode!));

    const merged = mergeWithFramework(saved, ALL);

    expect(merged).toHaveLength(24);
    expect(byCode(merged, '3.2')).toMatchObject({ requiredLevel: NOT_REQUIRED, weightPercent: 0, isMandatory: false });
    expect(requiredRows(merged)).toHaveLength(21);
  });

  it('distributes 100% by domain over the required lines only — same result as the backend seed', () => {
    // Accountant: 3.2, 3.3 and 4.4 are not required
    const rows = ['3.2', '3.3', '4.4'].reduce((acc, code) => setRowLevel(acc, `c-${code}`, NOT_REQUIRED), rowsAt(2));

    const distributed = distributeWeightsByDomain(rows);
    const groups = groupByDomain(distributed);

    expect(groups.map((g) => sum(g.rows.map((r) => r.weightPercent)))).toEqual([16.67, 16.67, 16.67, 16.67, 16.67, 16.65]);
    expect(groups[2].rows.map((r) => r.weightPercent)).toEqual([8.34, 0, 0, 8.33]);
    expect(groups[3].rows.map((r) => r.weightPercent)).toEqual([5.56, 5.56, 5.55, 0]);
    expect(sum(distributed.map((r) => r.weightPercent))).toBe(100);
  });

  it('applies a level to one domain; mandatory = Advanced lines plus the core 4.1 and 4.2', () => {
    const rows = applyLevelToDomain(applyLevelToDomain(rowsAt(2), 'cat-1', 3), 'cat-4', 2);
    const groups = groupByDomain(rows);

    expect(groups[0].rows.every((r) => r.requiredLevel === 3 && r.isMandatory)).toBe(true);
    expect(groups[3].rows.map((r) => r.isMandatory)).toEqual([true, true, false, false]);
    expect(groups[1].rows.every((r) => r.requiredLevel === 2 && !r.isMandatory)).toBe(true);
  });

  it('changing one line keeps the others and clears mandatory and weight when set to "Not required"', () => {
    const rows = setRowLevel(setRowLevel(distributeWeightsByDomain(rowsAt(2)), 'c-2.3', 3), 'c-3.3', NOT_REQUIRED);

    expect(byCode(rows, '2.3')).toMatchObject({ requiredLevel: 3, isMandatory: true });
    expect(byCode(rows, '3.3')).toMatchObject({ requiredLevel: NOT_REQUIRED, isMandatory: false, weightPercent: 0 });
    expect(byCode(rows, '2.1').requiredLevel).toBe(2);
  });

  it('reports the domain level from required lines so a line that differs can be flagged', () => {
    const rows = setRowLevel(setRowLevel(rowsAt(3), 'c-4.2', 2), 'c-4.4', NOT_REQUIRED);
    const domain4 = groupByDomain(rows)[3];

    expect(domainLevel(domain4.rows)).toBe(3);
    expect(requiredRows(domain4.rows).filter((r) => r.requiredLevel !== 3).map((r) => r.frameworkCode)).toEqual(['4.2']);
  });

  it('blocks activation below 9 competencies or without the core safety competencies', () => {
    const full = rowsAt(2);
    const few = full.map((r) => (r.categorySortOrder >= 4 && r.categorySortOrder <= 5 ? r : { ...r, requiredLevel: NOT_REQUIRED }));
    const noCore = setRowLevel(full, 'c-4.2', NOT_REQUIRED);

    expect(activationIssues(full)).toEqual({ requiredCount: 24, isCountValid: true, missingCore: [] });
    expect(activationIssues(few)).toMatchObject({ requiredCount: 8, isCountValid: false });
    expect(activationIssues(noCore)).toMatchObject({ requiredCount: 23, isCountValid: true, missingCore: ['4.2'] });
  });
});
