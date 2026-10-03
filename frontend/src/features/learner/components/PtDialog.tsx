import { useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDialogFocus } from '@/hooks/use-dialog-focus';

interface PtDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/** Modal of the personal workspace. Rendered in place, so it inherits the current theme. */
export function PtDialog({ open, onClose, title, description, children, className }: PtDialogProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useDialogFocus(open, ref, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div aria-hidden="true" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'pt-rise relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[24px] border border-pt-line bg-pt-panel p-6 text-pt-fg shadow-2xl outline-none sm:rounded-[24px] sm:p-8',
          className,
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-[22px] font-normal leading-tight tracking-[-0.02em]">{title}</h2>
            {description && <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-pt-fg-2">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-pt-line text-pt-fg-2 transition-colors hover:border-pt-fg/40 hover:text-pt-fg"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
