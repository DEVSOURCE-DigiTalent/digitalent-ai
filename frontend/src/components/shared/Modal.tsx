import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDialogFocus } from '@/hooks/use-dialog-focus';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<Size, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Buttons row at the bottom. */
  footer?: ReactNode;
  size?: Size;
}

/** Centered dialog for short actions. Styled with Enterprise tokens. */
export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(open, ref, onClose);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" aria-hidden="true" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn('relative flex max-h-[90vh] w-full flex-col rounded-xl bg-ent-card border border-ent-line shadow-2xl outline-none', SIZES[size])}
      >
        <header className="flex items-start justify-between gap-4 border-b border-ent-line px-6 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-ent-fg">
              {title}
            </h2>
            {description && (
              <div id={descriptionId} className="mt-1 text-sm text-ent-fg-2">
                {description}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="-mr-2 rounded-md p-2 text-ent-fg-3 hover:bg-ent-raised hover:text-ent-fg transition-colors"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>
        <div className="overflow-y-auto px-6 py-5 text-ent-fg">{children}</div>
        {footer && <footer className="flex justify-end gap-3 border-t border-ent-line px-6 py-4">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
