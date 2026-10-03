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
      <ScoreCard label="Năng lực yêu cầu" value={summary.totalRequired} />
      <ScoreCard label="Đã đạt" value={summary.totalMet} variant="success" />
      <ScoreCard
        label="Khoảng trống"
        value={summary.totalGap}
        subtitle={`${summary.highCount} mức cao · ${summary.mediumCount} trung bình · ${summary.lowCount} thấp`}
        variant={summary.highCount > 0 ? 'danger' : summary.totalGap > 0 ? 'warning' : 'success'}
      />
      <ScoreCard
        label="Tỷ lệ đáp ứng năng lực"
        value={`${summary.coveragePercent.toFixed(1)}%`}
        subtitle="Mức khớp có trọng số với chuẩn vị trí"
        variant={coverageVariant(summary.coveragePercent)}
      />
    </div>
  );
}
