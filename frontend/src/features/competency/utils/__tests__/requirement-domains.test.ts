import { describe, it, expect } from 'vitest';
import {
  TT02_COMPETENCY_CODES,
  applyLevelToDomain,
  buildDraftRows,
  distributeWeightsByDomain,
  domainLevel,
  groupByDomain,
  missingFrameworkCodes,
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

describe('requirement editor helpers (Circular 02/2025, D-B4)', () => {
  it('builds a new draft with all 24 competencies grouped into 6 ordered domains', () => {
    const groups = groupByDomain(buildDraftRows([...ALL].reverse()));

    expect(groups.map((g) => g.domain.sortOrder)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(groups.map((g) => g.rows.length)).toEqual([3, 6, 4, 4, 4, 3]);
    expect(groups[0].rows.map((r) => r.frameworkCode)).toEqual(['1.1', '1.2', '1.3']);
  });

  it('distributes 100% evenly by domain exactly like the backend seed', () => {
    const rows = distributeWeightsByDomain(rowsAt(2));
    const groups = groupByDomain(rows);

    expect(groups.map((g) => sum(g.rows.map((r) => r.weightPercent)))).toEqual([16.67, 16.67, 16.67, 16.67, 16.67, 16.65]);
    expect(groups[0].rows.map((r) => r.weightPercent)).toEqual([5.56, 5.56, 5.55]);
    expect(groups[3].rows.map((r) => r.weightPercent)).toEqual([4.17, 4.17, 4.17, 4.16]);
    expect(sum(rows.map((r) => r.weightPercent))).toBe(100);
  });

  it('applies a level to one domain and sets mandatory per D-B2 (Advanced domains + domain 4)', () => {
    const rows = applyLevelToDomain(applyLevelToDomain(rowsAt(2), 'cat-1', 3), 'cat-4', 2);
    const groups = groupByDomain(rows);

    expect(groups[0].rows.every((r) => r.requiredLevel === 3 && r.isMandatory)).toBe(true);
    expect(groups[3].rows.every((r) => r.requiredLevel === 2 && r.isMandatory)).toBe(true);
    expect(groups[1].rows.every((r) => r.requiredLevel === 2 && !r.isMandatory)).toBe(true);
  });

  it('reports the domain level so a line that differs can be flagged', () => {
    const rows = rowsAt(3).map((r) => (r.frameworkCode === '4.2' ? { ...r, requiredLevel: 2 } : r));
    const domain4 = groupByDomain(rows)[3];

    expect(domainLevel(domain4.rows)).toBe(3);
    expect(domain4.rows.filter((r) => r.requiredLevel !== domainLevel(domain4.rows)).map((r) => r.frameworkCode)).toEqual(['4.2']);
  });

  it('lists the Circular codes still missing before activation', () => {
    const withoutAi = buildDraftRows(ALL.filter((c) => !c.frameworkCode.startsWith('6.')));

    expect(missingFrameworkCodes(withoutAi)).toEqual(['6.1', '6.2', '6.3']);
    expect(missingFrameworkCodes(buildDraftRows(ALL))).toEqual([]);
  });
});
