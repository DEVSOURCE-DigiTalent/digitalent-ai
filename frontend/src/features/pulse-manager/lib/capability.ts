import type { CompetencyLevelRow } from '@/services/workforce.service';

/** Trạng thái một năng lực so với mục tiêu vị trí. PENDING = chưa xác nhận mức — không phải khoảng trống. */
export type LevelStatus = 'MET' | 'GAP' | 'PENDING' | 'OUTSIDE_PATH';

export function levelStatus(row: Pick<CompetencyLevelRow, 'currentLevel' | 'requiredLevel'>): LevelStatus {
  if (row.requiredLevel <= 0) return 'OUTSIDE_PATH';
  if (row.currentLevel == null || row.currentLevel <= 0) return 'PENDING';
  return row.currentLevel >= row.requiredLevel ? 'MET' : 'GAP';
}

export interface CapabilityDomain {
  name: string;
  order: number;
  rows: (CompetencyLevelRow & { status: LevelStatus })[];
}

export interface CapabilitySummary {
  /** Năng lực vị trí yêu cầu (mức mục tiêu > 0). */
  targets: number;
  /** Trong số đó, đã có mức xác nhận. */
  measured: number;
  met: number;
  gaps: number;
  pending: number;
}

/** Nhóm theo lĩnh vực (thứ tự Thông tư 02/2025) và đếm; năng lực chưa đo không bao giờ được tính là khoảng trống. */
export function buildCapability(rows: CompetencyLevelRow[]): { domains: CapabilityDomain[]; summary: CapabilitySummary } {
  const byDomain = new Map<string, CapabilityDomain>();
  const summary: CapabilitySummary = { targets: 0, measured: 0, met: 0, gaps: 0, pending: 0 };

  for (const row of rows) {
    const status = levelStatus(row);
    if (status !== 'OUTSIDE_PATH') {
      summary.targets += 1;
      if (status === 'PENDING') summary.pending += 1;
      else summary.measured += 1;
      if (status === 'MET') summary.met += 1;
      if (status === 'GAP') summary.gaps += 1;
    }
    const domain = byDomain.get(row.categoryName) ?? { name: row.categoryName, order: row.categorySortOrder, rows: [] };
    domain.rows.push({ ...row, status });
    byDomain.set(row.categoryName, domain);
  }

  const domains = [...byDomain.values()]
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'vi'))
    .map((domain) => ({
      ...domain,
      rows: domain.rows.sort((a, b) => a.frameworkCode.localeCompare(b.frameworkCode, 'vi', { numeric: true })),
    }));
  return { domains, summary };
}
