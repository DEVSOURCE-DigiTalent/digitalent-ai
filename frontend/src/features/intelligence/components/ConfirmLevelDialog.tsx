import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useCreateManualEvidence } from '@/hooks/use-competency-evidences';
import { levelLabel, skillGapErrorMessage } from '@/lib/competency-levels';
import type { SkillGapRunDetail } from '@/services/intelligence.service';

const MAX_NOTE_LENGTH = 2000; // khớp CreateManualEvidenceUseCaseValidator

const schema = z.object({
  competencyId: z.string().min(1, 'Choose a competency'),
  confirmedLevel: z.coerce.number().int().min(1).max(3),
  reviewNote: z
    .string()
    .trim()
    .min(1, 'Explain the evidence behind this level')
    .max(MAX_NOTE_LENGTH, `At most ${MAX_NOTE_LENGTH} characters`),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface ConfirmLevelDialogProps {
  run: SkillGapRunDetail;
  open: boolean;
  onClose: () => void;
  /** Called after the level is saved; the backend has already recalculated the skill gap. */
  onConfirmed: (employeeId: string) => void;
}

const FIELD_CLASS =
  'w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

/**
 * HR records a confirmed competency level from evidence outside practical tasks (MANUAL_OVERRIDE, spec §6.3).
 */
export function ConfirmLevelDialog({ run, open, onClose, onConfirmed }: ConfirmLevelDialogProps) {
  const mutation = useCreateManualEvidence();
  const firstGap = run.items.find((i) => i.gapSteps > 0) ?? run.items[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      competencyId: firstGap?.competencyId ?? '',
      confirmedLevel: firstGap ? Math.min((firstGap.currentLevel ?? 0) + 1, 3) : 1,
      reviewNote: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  if (!open) return null;

  const onSubmit = async (values: FormOutput) => {
    try {
      await mutation.mutateAsync({ employeeId: run.employeeId, ...values });
      toast.success(`${levelLabel(values.confirmedLevel)} confirmed — skill gap recalculated`);
      onConfirmed(run.employeeId);
      onClose();
    } catch (error) {
      toast.error(skillGapErrorMessage(error, 'Failed to confirm the competency level'));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-level-title" className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6">
        <h2 id="confirm-level-title" className="text-lg font-semibold text-slate-900">
          Confirm competency level
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          For {run.employeeName}. The level is recorded as manual evidence and the skill gap is recalculated immediately.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
          <div>
            <label htmlFor="confirm-competency" className="block text-sm font-medium text-slate-700 mb-1">
              Competency
            </label>
            <select id="confirm-competency" {...register('competencyId')} className={FIELD_CLASS}>
              {run.items.map((item) => (
                <option key={item.competencyId} value={item.competencyId}>
                  {item.competencyName} — now {levelLabel(item.currentLevel)}, required {levelLabel(item.requiredLevel)}
                </option>
              ))}
            </select>
            {errors.competencyId && <p className="mt-1 text-xs text-danger-600">{errors.competencyId.message}</p>}
          </div>

          <div>
            <label htmlFor="confirm-level" className="block text-sm font-medium text-slate-700 mb-1">
              Confirmed level
            </label>
            <select id="confirm-level" {...register('confirmedLevel')} className={FIELD_CLASS}>
              {[1, 2, 3].map((level) => (
                <option key={level} value={level}>
                  {levelLabel(level)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="confirm-note" className="block text-sm font-medium text-slate-700 mb-1">
              Evidence / review note
            </label>
            <textarea
              id="confirm-note"
              rows={4}
              maxLength={MAX_NOTE_LENGTH}
              placeholder="e.g. Led the Q3 security audit; certificate ISO 27001 Foundation"
              {...register('reviewNote')}
              className={FIELD_CLASS}
            />
            {errors.reviewNote && <p className="mt-1 text-xs text-danger-600">{errors.reviewNote.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              Confirm level
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
