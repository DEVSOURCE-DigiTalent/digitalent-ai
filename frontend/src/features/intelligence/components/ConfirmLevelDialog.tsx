import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BadgeCheck, Check, FileCheck2, Info, LoaderCircle, X } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { useCreateManualEvidence } from '@/hooks/use-competency-evidences';
import { useDialogFocus } from '@/hooks/use-dialog-focus';
import { levelLabel, skillGapErrorMessage } from '@/lib/competency-levels';
import type { SkillGapRunDetail } from '@/services/intelligence.service';
import './confirm-level-dialog.css';

const MAX_NOTE_LENGTH = 2000;
const schema = z.object({
  competencyId: z.string().min(1, 'Chọn năng lực'),
  confirmedLevel: z.coerce.number().int().min(1).max(3),
  reviewNote: z.string().trim().min(1, 'Nêu bằng chứng cho mức này').max(MAX_NOTE_LENGTH, `Tối đa ${MAX_NOTE_LENGTH} ký tự`),
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface ConfirmLevelDialogProps {
  initialCategoryNumber?: number;
  run: SkillGapRunDetail;
  open: boolean;
  onClose: () => void;
  onConfirmed: (employeeId: string) => void;
}

/** Manual evidence confirmation; closing finishes its animation before notifying the parent. */
export function ConfirmLevelDialog({ run, open, onClose, onConfirmed, initialCategoryNumber }: ConfirmLevelDialogProps) {
  useUiLanguage();
  const mutation = useCreateManualEvidence();
  const scoped = run.items.filter((item) => item.categorySortOrder === initialCategoryNumber);
  const firstGap = scoped.find((item) => item.gapSteps > 0) ?? scoped[0] ?? run.items.find((item) => item.gapSteps > 0) ?? run.items[0];
  const [present, setPresent] = useState(false);
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closing = useRef(false);
  const titleId = useId();
  const descriptionId = useId();
  const fieldId = useId();
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { competencyId: firstGap?.competencyId ?? '', confirmedLevel: String(firstGap?.requiredLevel ?? 1), reviewNote: '' },
  });
  const busy = isSubmitting || mutation.isPending;
  const competency = run.items.find((item) => item.competencyId === watch('competencyId'));
  const selectedLevel = Number(watch('confirmedLevel'));
  const note = watch('reviewNote') ?? '';
  const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const beginClose = (after: () => void) => {
    if (closing.current) return;
    closing.current = true;
    setVisible(false);
    closeTimer.current = setTimeout(() => { setPresent(false); after(); }, reducedMotion() ? 0 : 220);
  };
  const requestClose = () => { if (!busy) beginClose(onClose); };
  useDialogFocus(present, dialogRef, requestClose);

  useEffect(() => {
    let frame = 0;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    if (open) {
      closing.current = false;
      setPresent(true);
      reset({ competencyId: firstGap?.competencyId ?? '', confirmedLevel: String(firstGap?.requiredLevel ?? 1), reviewNote: '' });
      frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => { if (!closing.current) setVisible(true); }); });
    } else {
      setVisible(false);
      exitTimer = setTimeout(() => setPresent(false), reducedMotion() ? 0 : 220);
    }
    return () => { cancelAnimationFrame(frame); if (exitTimer) clearTimeout(exitTimer); };
    // Reset only for a new opening or employee, not when evidence invalidation refreshes the snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, run.employeeId, reset, initialCategoryNumber]);
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const onSubmit = async (values: FormOutput) => {
    try {
      await mutation.mutateAsync({ employeeId: run.employeeId, ...values });
      toast.success(`Đã xác nhận mức ${levelLabel(values.confirmedLevel)} và cập nhật khoảng trống năng lực`);
      beginClose(() => { onConfirmed(run.employeeId); onClose(); });
    } catch (error) {
      toast.error(skillGapErrorMessage(error, 'Không xác nhận được mức năng lực'));
    }
  };

  if (!present) return null;
  return createPortal(<div className={`confirm-evidence ${visible ? 'is-visible' : ''}`}>
    <div className="confirm-evidence-backdrop" aria-hidden="true" onClick={requestClose} />
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} tabIndex={-1} className="confirm-evidence-dialog">
      <header className="confirm-evidence-header"><span className="confirm-evidence-icon"><BadgeCheck size={25} /></span><div><h2 id={titleId}>{translateUi("Xác nhận cải thiện")}</h2><p id={descriptionId}>{run.employeeName}</p></div><button type="button" onClick={requestClose} disabled={busy} aria-label="Đóng xác nhận" className="confirm-evidence-close"><X size={18} /></button></header>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="confirm-evidence-body">
          <div className="confirm-evidence-purpose"><Info size={16} /><p>Ghi nhận năng lực đã được kiểm chứng để cập nhật khoảng trống.</p></div>
          <fieldset disabled={busy}>
            <div className="confirm-evidence-field"><label htmlFor={`${fieldId}-competency`}>{translateUi("Năng lực")}</label><select id={`${fieldId}-competency`} {...register('competencyId')} aria-invalid={!!errors.competencyId} aria-describedby={errors.competencyId ? `${fieldId}-competency-error` : undefined}>{run.items.map((item) => <option key={item.competencyId} value={item.competencyId}>{item.competencyName}</option>)}</select>{competency && <span className="confirm-evidence-target">{translateUi("Chuẩn vị trí ")}<strong>{levelLabel(competency.requiredLevel)}</strong></span>}{errors.competencyId && <p className="confirm-evidence-error" id={`${fieldId}-competency-error`} role="alert">{translateUi(errors.competencyId.message)}</p>}</div>
            <fieldset className="confirm-evidence-levels"><legend>{translateUi("Trình độ xác nhận")}</legend><div>{[1, 2, 3].map((level) => <label key={level} className={selectedLevel === level ? 'is-selected' : ''}><input type="radio" value={String(level)} {...register('confirmedLevel')} /><span className="confirm-evidence-level-mark">{selectedLevel === level ? <Check size={12} /> : <span />}</span><strong>{levelLabel(level)}</strong></label>)}</div>{errors.confirmedLevel && <p role="alert" className="confirm-evidence-error">Chọn mức năng lực cần xác nhận.</p>}</fieldset>
            <div className="confirm-evidence-field"><label htmlFor={`${fieldId}-note`}>{translateUi("Bằng chứng / ghi chú đánh giá ")}<span aria-hidden="true">*</span></label><textarea id={`${fieldId}-note`} rows={3} maxLength={MAX_NOTE_LENGTH} placeholder="Kết quả thực hành, chứng chỉ hoặc căn cứ xác nhận…" {...register('reviewNote')} aria-required="true" aria-invalid={!!errors.reviewNote} aria-describedby={errors.reviewNote ? `${fieldId}-note-error` : undefined} /><div className="confirm-evidence-note-meta"><span><FileCheck2 size={13} /> Cần có căn cứ xác nhận</span><span>{note.length}/{MAX_NOTE_LENGTH}</span></div>{errors.reviewNote && <p id={`${fieldId}-note-error`} role="alert" className="confirm-evidence-error">{translateUi(errors.reviewNote.message)}</p>}</div>
          </fieldset>
        </div>
        <footer className="confirm-evidence-footer"><button type="button" onClick={requestClose} disabled={busy}>{translateUi("Hủy")}</button><button type="submit" disabled={busy || closing.current || !run.items.length} className="confirm-evidence-submit">{busy ? <LoaderCircle size={16} className="animate-spin" /> : <BadgeCheck size={16} />}{busy ? 'Đang cập nhật…' : translateUi('Xác nhận mức')}</button></footer>
      </form>
    </div>
  </div>, document.body);
}
