import type { SkillGapRunDetail } from '@/services/intelligence.service';
import { formatDateTime } from '@/lib/utils';
import { CompetencyRadarChart } from './CompetencyRadarChart';
import { SkillGapKpiCards } from './SkillGapKpiCards';
import { SkillGapTable } from './SkillGapTable';
import { shouldChartByDomain, summarizeByDomain, toDomainChartItems } from '../utils/domain-summary';

/**
 * Full snapshot view (KPI + chart + table). Shared by My Competency Profile and the Team Skill Gap drawer.
 * From 3 domains up the radar has one axis per domain showing the average confirmed level (D-B3).
 */
export function SkillGapDetailView({ run }: { run: SkillGapRunDetail }) {
  const byDomain = shouldChartByDomain(run.items);

  return (
    <div className="space-y-6">
      <p className="text-xs text-slate-500">
        {run.jobPositionName} · chuẩn v{run.requirementSetVersionNo} · tính lúc {formatDateTime(run.generatedAt)} (
        {run.generatedBy === 'SYSTEM' ? 'tự động' : 'theo yêu cầu'})
      </p>

      <SkillGapKpiCards summary={run.summary} />

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">
          {byDomain ? 'Trình độ yêu cầu và trình độ đã xác nhận trung bình theo miền' : 'Trình độ yêu cầu và trình độ đã xác nhận'}
        </h3>
        {byDomain ? (
          <CompetencyRadarChart
            items={toDomainChartItems(summarizeByDomain(run.items))}
            requiredLabel="Trình độ yêu cầu của miền"
            confirmedLabel="Trình độ trung bình trong miền"
          />
        ) : (
          <CompetencyRadarChart items={run.items} />
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 px-4 pt-4">Chi tiết khoảng trống</h3>
        <p className="px-4 pb-3 text-xs text-slate-500">
          Ưu tiên = khoảng trống × trọng số × {run.summary.config.mandatoryMultiplier} với năng lực bắt buộc (× 1 với năng lực còn lại).
        </p>
        <SkillGapTable items={run.items} />
      </div>
    </div>
  );
}

/** Placeholder with the same footprint as SkillGapDetailView while loading. */
export function SkillGapDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Đang tải skill gap">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-slate-200 rounded-lg" />
        ))}
      </div>
      <div className="h-80 bg-slate-200 rounded-lg" />
      <div className="h-48 bg-slate-200 rounded-lg" />
    </div>
  );
}
