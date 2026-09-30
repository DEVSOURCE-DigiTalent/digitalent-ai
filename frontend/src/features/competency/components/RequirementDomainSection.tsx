import { useState } from 'react';
import { levelWithTier } from '@/lib/competency-levels';
import { domainLevel, type DomainGroup, type DomainRow } from '../utils/requirement-domains';

export interface EditableRequirementRow extends DomainRow {
  tempId: string;
}

type EditableField = 'requiredLevel' | 'weightPercent' | 'isMandatory' | 'requiresPracticalEvidence' | 'note';

interface RequirementDomainSectionProps {
  group: DomainGroup<EditableRequirementRow>;
  canEdit: boolean;
  onRowChange: (competencyId: string, field: EditableField, value: number | boolean | string) => void;
  onApplyDomainLevel: (categoryId: string, level: number) => void;
}

const LEVELS = [1, 2, 3];
const inputClass =
  'text-sm px-2.5 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white disabled:bg-slate-50';

/**
 * One Circular 02/2025 domain of the requirement editor: header with the domain level control
 * and weight subtotal, then one row per competency (rows cannot be removed — D-B4).
 */
export function RequirementDomainSection({ group, canEdit, onRowChange, onApplyDomainLevel }: RequirementDomainSectionProps) {
  const currentDomainLevel = domainLevel(group.rows);
  const [pendingLevel, setPendingLevel] = useState<number | null>(null);
  const levelToApply = pendingLevel ?? currentDomainLevel;
  const subtotal = Math.round(group.rows.reduce((sum, r) => sum + (Number(r.weightPercent) || 0), 0) * 100) / 100;
  const domainName = group.domain.name;

  return (
    <tbody className="divide-y divide-slate-200">
      <tr className="bg-slate-50">
        <th scope="rowgroup" colSpan={6} className="px-4 py-2.5 text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <span className="font-semibold text-slate-900">{domainName}</span>
              <span className="ml-2 text-xs font-normal text-slate-500">
                {group.rows.length} competencies · {subtotal}% of total weight
              </span>
            </div>
            {canEdit && (
              <div className="flex items-center gap-2 font-normal">
                <select
                  aria-label={`Domain level for ${domainName}`}
                  value={levelToApply}
                  onChange={(e) => setPendingLevel(Number(e.target.value))}
                  className={inputClass}
                >
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {levelWithTier(level)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    onApplyDomainLevel(group.domain.categoryId, levelToApply);
                    setPendingLevel(null);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-md"
                >
                  Apply level to domain
                </button>
              </div>
            )}
          </div>
        </th>
      </tr>
      {group.rows.map((row) => {
        const label = row.frameworkCode ? `${row.frameworkCode} ${row.competencyName ?? ''}` : row.competencyName ?? row.competencyCode;
        const differs = row.requiredLevel !== currentDomainLevel;
        return (
          <tr key={row.tempId} className="hover:bg-slate-50/60 transition-colors">
            <td className="px-4 py-3">
              <div className="font-medium text-slate-900">{label}</div>
              <div className="text-xs text-slate-500">{row.competencyCode}</div>
            </td>
            <td className="px-4 py-3">
              <select
                aria-label={`Required level for ${label}`}
                value={row.requiredLevel}
                onChange={(e) => onRowChange(row.competencyId, 'requiredLevel', Number(e.target.value))}
                disabled={!canEdit}
                className={`w-full ${inputClass}`}
              >
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {levelWithTier(level)}
                  </option>
                ))}
              </select>
              {differs && (
                <span className="mt-1 inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
                  Differs from domain level
                </span>
              )}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  aria-label={`Weight percent for ${label}`}
                  min={0.01}
                  max={100}
                  step={0.01}
                  value={row.weightPercent}
                  onChange={(e) => onRowChange(row.competencyId, 'weightPercent', Number(e.target.value))}
                  disabled={!canEdit}
                  className={`w-24 ${inputClass}`}
                />
                <span className="text-slate-500 text-xs">%</span>
              </div>
            </td>
            <td className="px-4 py-3 text-center">
              <input
                type="checkbox"
                aria-label={`Mandatory: ${label}`}
                checked={row.isMandatory}
                onChange={(e) => onRowChange(row.competencyId, 'isMandatory', e.target.checked)}
                disabled={!canEdit}
                className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
              />
            </td>
            <td className="px-4 py-3 text-center">
              <input
                type="checkbox"
                aria-label={`Evidence required: ${label}`}
                checked={row.requiresPracticalEvidence}
                onChange={(e) => onRowChange(row.competencyId, 'requiresPracticalEvidence', e.target.checked)}
                disabled={!canEdit}
                className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
              />
            </td>
            <td className="px-4 py-3">
              <input
                type="text"
                aria-label={`Note for ${label}`}
                value={row.note || ''}
                onChange={(e) => onRowChange(row.competencyId, 'note', e.target.value)}
                placeholder="Guidance or context..."
                disabled={!canEdit}
                className={`w-full text-xs ${inputClass}`}
              />
            </td>
          </tr>
        );
      })}
    </tbody>
  );
}
