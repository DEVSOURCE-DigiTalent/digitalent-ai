import { useEffect, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';

export interface PlatformDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: LucideIcon;
  badge?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number | string;
}

/**
 * Slide-in Drawer (560px) conforming to Linear/Stripe/TalentLMS enterprise UX.
 * Keeps the admin in context without navigating away from the data table.
 */
export function PlatformDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  badge,
  children,
  footer,
  width = 560,
}: PlatformDrawerProps) {
  // Handle Escape key and lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="pa-drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="pa-drawer-panel"
        style={{ width: typeof width === 'number' ? `${width}px` : width }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="pa-drawer-header">
          <div className="pa-drawer-title-wrap">
            {Icon && (
              <div className="pa-drawer-icon">
                <Icon size={18} />
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 className="pa-drawer-title">{title}</h3>
                {badge}
              </div>
              {subtitle && <p className="pa-drawer-sub">{subtitle}</p>}
            </div>
          </div>

          <button
            type="button"
            className="pa-drawer-close"
            onClick={onClose}
            aria-label="Đóng ngăn kéo (Esc)"
            title="Đóng (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="pa-drawer-body">{children}</div>

        {/* Drawer Footer */}
        {footer && <div className="pa-drawer-footer">{footer}</div>}
      </div>
    </div>
  );
}
