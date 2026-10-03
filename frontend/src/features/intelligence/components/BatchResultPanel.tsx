import { AlertTriangle, X } from 'lucide-react';
import { skillGapReasonMessage } from '@/lib/competency-levels';
import type { CalculateSkillGapBatchResult } from '@/services/intelligence.service';

interface BatchResultPanelProps {
  result: CalculateSkillGapBatchResult;
  onDismiss: () => void;
}

/** Explains which employees a batch recalculation skipped and why (no position, no active standard). */
export function BatchResultPanel({ result, onDismiss }: BatchResultPanelProps) {
  if (result.skipped.length === 0) {
    return null;
  }

  return (
    <div role="status" className="flex gap-3 rounded-lg border border-warning-200 bg-warning-50 p-4">
      <AlertTriangle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-warning-700">
          Đã tính cho {result.calculatedCount} nhân viên; bỏ qua {result.skipped.length} người
        </p>
        <ul className="mt-2 space-y-1 text-slate-700">
          {result.skipped.map((s) => (
            <li key={s.employeeId}>
              <span className="font-medium">{s.employeeName}</span> — {skillGapReasonMessage(s.reason)}
            </li>
          ))}
        </ul>
      </div>
      <button type="button" onClick={onDismiss} className="p-1 text-warning-600 hover:text-warning-700 self-start" aria-label="Đóng">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
