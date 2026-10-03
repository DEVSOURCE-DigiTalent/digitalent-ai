import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Modal } from './Modal';

interface ConfirmActionDialogProps {
  open: boolean;
  onClose: () => void;
  /** Receives the reason typed by the user (empty when no reason is asked for). */
  onConfirm: (reason: string) => Promise<void> | void;
  title: string;
  description: string | ReactNode;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  requireReason?: boolean;
  reasonPlaceholder?: string;
  children?: ReactNode;
}

/**
 * Confirmation dialog for critical actions.
 * Styled with Enterprise tokens.
 */
export function ConfirmActionDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Xác nhận',
  confirmVariant = 'danger',
  requireReason = false,
  reasonPlaceholder = 'Nêu lý do cần thực hiện thao tác này…',
  children,
}: ConfirmActionDialogProps) {
  const reasonId = useId();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
    } finally {
      setIsSubmitting(false);
      setReason('');
      onClose();
    }
  };

  const canConfirm = !requireReason || reason.trim().length > 0;
  const close = () => {
    if (isSubmitting) return;
    setReason('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="sm"
      title={title}
      description={typeof description === 'string' ? <p>{description}</p> : description}
      footer={
        <>
          <button
            type="button"
            onClick={close}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-ent-fg-2 bg-ent-raised border border-ent-line rounded-lg hover:bg-ent-card hover:text-ent-fg transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm || isSubmitting}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50',
              confirmVariant === 'danger'
                ? 'bg-ent-bad text-white hover:opacity-90'
                : 'bg-ent-primary text-ent-on-primary hover:opacity-90',
            )}
          >
            {isSubmitting ? 'Đang xử lý…' : confirmLabel}
          </button>
        </>
      }
    >
      {children}
      {requireReason && (
        <div className="mt-3">
          <label htmlFor={reasonId} className="block text-sm font-medium text-ent-fg mb-1">
            Lý do <span className="text-ent-bad" aria-hidden="true">*</span>
          </label>
          <textarea
            id={reasonId}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={reasonPlaceholder}
            rows={3}
            required
            className="w-full px-3 py-2 bg-ent-raised border border-ent-line rounded-lg text-sm text-ent-fg placeholder:text-ent-fg-3 focus:outline-none focus:ring-2 focus:ring-ent-accent focus:border-ent-accent"
            disabled={isSubmitting}
          />
        </div>
      )}
    </Modal>
  );
}
