import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useDialogFocus } from '@/hooks/use-dialog-focus';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

/** Panel that slides in from the right. Styled with Enterprise tokens. */
export function Drawer({ open, onClose, title, description, children, footer }: DrawerProps) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(open, ref, onClose);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" aria-hidden="true" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex h-full w-full max-w-lg flex-col bg-ent-card border-l border-ent-line shadow-2xl outline-none"
      >
        <header className="flex items-start justify-between gap-4 border-b border-ent-line px-6 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-ent-fg">
              {title}
            </h2>
            {description && <div className="mt-1 text-sm text-ent-fg-2">{description}</div>}
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
        <div className="flex-1 overflow-y-auto px-6 py-5 text-ent-fg">{children}</div>
        {footer && <footer className="flex justify-end gap-3 border-t border-ent-line px-6 py-4">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
