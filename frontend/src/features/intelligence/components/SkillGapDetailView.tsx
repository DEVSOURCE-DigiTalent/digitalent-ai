import type { SkillGapRunDetail } from '@/services/intelligence.service';
import { CompetencyRadarChart } from './CompetencyRadarChart';
import { SkillGapKpiCards } from './SkillGapKpiCards';
import { SkillGapTable } from './SkillGapTable';

/**
 * Full snapshot view (KPI + chart + table). Shared by My Competency Profile and the Team Skill Gap drawer.
 */
export function SkillGapDetailView({ run }: { run: SkillGapRunDetail }) {
  return (
    <div className="space-y-6">
      <p className="text-xs text-slate-500">
        {run.jobPositionName} · standard v{run.requirementSetVersionNo} · calculated{' '}
        {new Date(run.generatedAt).toLocaleString()} ({run.generatedBy === 'SYSTEM' ? 'automatic' : 'on request'})
      </p>

      <SkillGapKpiCards summary={run.summary} />

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Required vs confirmed level</h3>
        <CompetencyRadarChart items={run.items} />
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 px-4 pt-4">Gap breakdown</h3>
        <p className="px-4 pb-3 text-xs text-slate-500">
          Priority = gap × weight × {run.summary.config.mandatoryMultiplier} for mandatory competencies (× 1 otherwise).
        </p>
        <SkillGapTable items={run.items} />
      </div>
    </div>
  );
}

/** Placeholder with the same footprint as SkillGapDetailView while loading. */
export function SkillGapDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading skill gap">
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
