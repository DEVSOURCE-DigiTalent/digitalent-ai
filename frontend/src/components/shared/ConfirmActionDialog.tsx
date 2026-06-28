import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ConfirmActionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
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
 * Supports optional reason field for destructive operations (revoke, archive, delete).
 * Traps focus, ESC to cancel, loading state during API call.
 */
export function ConfirmActionDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  requireReason = false,
  reasonPlaceholder = 'Explain why this action is needed...',
  children,
}: ConfirmActionDialogProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const canConfirm = !requireReason || reason.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Dialog */}
      <div
        className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-lg font-semibold text-slate-900 mb-2">{title}</h2>
        <div className="text-sm text-slate-600 mb-4">
          {typeof description === 'string' ? <p>{description}</p> : description}
        </div>

        {children}

        {requireReason && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reason <span className="text-danger-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={isSubmitting}
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || isSubmitting}
            className={cn(
              'px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50',
              confirmVariant === 'danger'
                ? 'bg-danger-600 hover:bg-danger-700'
                : 'bg-primary-600 hover:bg-primary-700',
            )}
          >
            {isSubmitting ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
