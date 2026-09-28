import { useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useSkillGapRun } from '@/hooks/use-skill-gaps';
import { SkillGapDetailSkeleton, SkillGapDetailView } from './SkillGapDetailView';

interface SkillGapDetailDrawerProps {
  runId: string;
  onClose: () => void;
  canRecalculate: boolean;
  isRecalculating: boolean;
  onRecalculate: (employeeId: string) => void;
}

/** Right-side panel with one employee's snapshot; Esc or backdrop click closes it. */
export function SkillGapDetailDrawer({ runId, onClose, canRecalculate, isRecalculating, onRecalculate }: SkillGapDetailDrawerProps) {
  const { data: run, isLoading, isError } = useSkillGapRun(runId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Skill gap detail"
        className="relative w-full max-w-4xl h-full overflow-y-auto bg-slate-50 shadow-xl"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 bg-white border-b border-slate-200">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 truncate">{run?.employeeName ?? 'Skill gap'}</h2>
            {run && (
              <p className="text-xs text-slate-500">
                {run.employeeCode} · {run.departmentName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canRecalculate && run && (
              <button
                type="button"
                onClick={() => onRecalculate(run.employeeId)}
                disabled={isRecalculating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-700 border border-primary-200 rounded-md hover:bg-primary-50 disabled:opacity-50"
              >
                <RefreshCw className={isRecalculating ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
                Recalculate
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="p-6">
          {isLoading && <SkillGapDetailSkeleton />}
          {isError && <p className="text-sm text-danger-600">Could not load this analysis. Please close and try again.</p>}
          {run && <SkillGapDetailView run={run} />}
        </div>
      </aside>
    </div>
  );
}
