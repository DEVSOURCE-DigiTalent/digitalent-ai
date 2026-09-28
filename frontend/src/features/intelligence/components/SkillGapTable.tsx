import { levelLabel } from '@/lib/competency-levels';
import type { SkillGapItem } from '@/services/intelligence.service';
import { SeverityBadge } from './SeverityBadge';

/** Competency lines of a snapshot, already sorted by priority on the server. */
export function SkillGapTable({ items }: { items: SkillGapItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <th className="px-4 py-3">Competency</th>
            <th className="px-4 py-3">Required</th>
            <th className="px-4 py-3">Confirmed</th>
            <th className="px-4 py-3 text-right">Gap</th>
            <th className="px-4 py-3 text-right">Weight</th>
            <th className="px-4 py-3 text-right">Priority</th>
            <th className="px-4 py-3">Severity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.competencyId} className="text-slate-700">
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900">
                  {item.competencyName}
                  {item.mandatory && (
                    <span className="ml-2 text-[10px] font-semibold uppercase text-danger-600">Mandatory</span>
                  )}
                </div>
                <div className="text-xs text-slate-400">{item.categoryName ?? item.competencyCode}</div>
              </td>
              <td className="px-4 py-3">{levelLabel(item.requiredLevel)}</td>
              <td className="px-4 py-3">
                <span className={item.currentLevel == null ? 'text-slate-400 italic' : undefined}>
                  {levelLabel(item.currentLevel)}
                </span>
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{item.gapSteps}</td>
              <td className="px-4 py-3 text-right tabular-nums">{item.weightPercent}%</td>
              <td className="px-4 py-3 text-right tabular-nums">{item.priorityScore.toFixed(2)}</td>
              <td className="px-4 py-3">
                <SeverityBadge severity={item.severity} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
