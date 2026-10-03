import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { levelLabel } from '@/lib/competency-levels';
import type { SkillGapItem } from '@/services/intelligence.service';
import { summarizeByDomain } from '../utils/domain-summary';
import { SeverityBadge } from './SeverityBadge';

const COLUMN_COUNT = 7;

function SkillGapRow({ item }: { item: SkillGapItem }) {
  const name = item.frameworkCode ? `${item.frameworkCode} ${item.competencyName}` : item.competencyName;
  return (
    <tr className="text-slate-700">
      <td className="px-4 py-3">
        <div className="font-medium text-slate-900">
          {name}
          {item.mandatory && <span className="ml-2 text-[10px] font-semibold uppercase text-danger-600">Bắt buộc</span>}
        </div>
        {!item.frameworkCode && <div className="text-xs text-slate-400">{item.competencyCode}</div>}
      </td>
      <td className="px-4 py-3">{levelLabel(item.requiredLevel)}</td>
      <td className="px-4 py-3">
        <span className={item.currentLevel == null ? 'text-slate-400 italic' : undefined}>{levelLabel(item.currentLevel)}</span>
      </td>
      <td className="px-4 py-3 text-right tabular-nums">{item.gapSteps}</td>
      <td className="px-4 py-3 text-right tabular-nums">{item.weightPercent}%</td>
      <td className="px-4 py-3 text-right tabular-nums">{item.priorityScore.toFixed(2)}</td>
      <td className="px-4 py-3">
        <SeverityBadge severity={item.severity} />
      </td>
    </tr>
  );
}

/**
 * Competency lines of a snapshot grouped by domain (D-B3). Each domain can be collapsed; lines stay ranked by priority.
 * "Domain met" only when every competency of the domain reaches its required level.
 */
export function SkillGapTable({ items }: { items: SkillGapItem[] }) {
  const domains = summarizeByDomain(items);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggle = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <th className="px-4 py-3">Năng lực</th>
            <th className="px-4 py-3">Yêu cầu</th>
            <th className="px-4 py-3">Đã xác nhận</th>
            <th className="px-4 py-3 text-right">Thiếu</th>
            <th className="px-4 py-3 text-right">Trọng số</th>
            <th className="px-4 py-3 text-right">Ưu tiên</th>
            <th className="px-4 py-3">Mức độ</th>
          </tr>
        </thead>
        {domains.map((domain) => {
          const isOpen = !collapsed.has(domain.key);
          return (
            <tbody key={domain.key} className="divide-y divide-slate-100 border-b border-slate-200">
              <tr className="bg-slate-50/70">
                <th scope="rowgroup" colSpan={COLUMN_COUNT} className="px-4 py-2 text-left font-normal">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggle(domain.key)}
                    className="flex w-full items-center gap-2 text-left"
                  >
                    {isOpen ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                    <span className="font-semibold text-slate-900">{domain.name}</span>
                    <span className="text-xs text-slate-500">
                      Yêu cầu {levelLabel(domain.requiredLevel)} · trung bình {domain.averageLevel.toFixed(2)} ·{' '}
                      {domain.gapCount} khoảng trống
                    </span>
                    {domain.isMet && (
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Miền đã đạt
                      </span>
                    )}
                  </button>
                </th>
              </tr>
              {isOpen && domain.items.map((item) => <SkillGapRow key={item.competencyId} item={item} />)}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}
