import { ScoreCard } from '@/components/shared';
import type { SkillGapSummary } from '@/services/intelligence.service';

const COVERAGE_GOOD = 80;
const COVERAGE_WARNING = 50;

function coverageVariant(coverage: number): 'success' | 'warning' | 'danger' {
  if (coverage >= COVERAGE_GOOD) return 'success';
  if (coverage >= COVERAGE_WARNING) return 'warning';
  return 'danger';
}

/** KPI row: required / met / gaps / coverage of the position standard. */
export function SkillGapKpiCards({ summary }: { summary: SkillGapSummary }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <ScoreCard label="Required competencies" value={summary.totalRequired} />
      <ScoreCard label="Met" value={summary.totalMet} variant="success" />
      <ScoreCard
        label="Gaps"
        value={summary.totalGap}
        subtitle={`${summary.highCount} high · ${summary.mediumCount} medium · ${summary.lowCount} low`}
        variant={summary.highCount > 0 ? 'danger' : summary.totalGap > 0 ? 'warning' : 'success'}
      />
      <ScoreCard
        label="Position coverage"
        value={`${summary.coveragePercent.toFixed(1)}%`}
        subtitle="Weighted match with the position standard"
        variant={coverageVariant(summary.coveragePercent)}
      />
    </div>
  );
}
