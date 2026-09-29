import { useEffect, useState } from 'react';
import { BadgeCheck, RefreshCw, X } from 'lucide-react';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { useSkillGapRun } from '@/hooks/use-skill-gaps';
import { ConfirmLevelDialog } from './ConfirmLevelDialog';
import { CourseRecommendations } from './CourseRecommendations';
import { SkillGapDetailSkeleton, SkillGapDetailView } from './SkillGapDetailView';

interface SkillGapDetailDrawerProps {
  runId: string;
  onClose: () => void;
  canRecalculate: boolean;
  isRecalculating: boolean;
  onRecalculate: (employeeId: string) => void;
  /** After HR confirms a level the backend has recalculated the gap; the page switches to the new snapshot. */
  onLevelConfirmed: (employeeId: string) => void;
}

/** Right-side panel with one employee's snapshot; Esc or backdrop click closes it. */
export function SkillGapDetailDrawer({ runId, onClose, canRecalculate, isRecalculating, onRecalculate, onLevelConfirmed }: SkillGapDetailDrawerProps) {
  const { data: run, isLoading, isError } = useSkillGapRun(runId);
  const { can } = usePermission();
  const canReadRecommendations = can(PERMISSIONS.LEARNING_RECOMMENDATION_READ);
  const canConfirmLevels = can(PERMISSIONS.EVIDENCE_CREATE_MANUAL);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Esc đóng lớp trên cùng trước: dialog xác nhận rồi mới tới panel
      if (isConfirmOpen) {
        setIsConfirmOpen(false);
      } else {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isConfirmOpen]);

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
            {canConfirmLevels && run && (
              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                <BadgeCheck className="w-4 h-4" />
                Confirm level
              </button>
            )}
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
          {run && canReadRecommendations && (
            <section className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Recommended courses</h3>
              <CourseRecommendations employeeId={run.employeeId} />
            </section>
          )}
        </div>
      </aside>

      {run && (
        <ConfirmLevelDialog
          run={run}
          open={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirmed={onLevelConfirmed}
        />
      )}
    </div>
  );
}
