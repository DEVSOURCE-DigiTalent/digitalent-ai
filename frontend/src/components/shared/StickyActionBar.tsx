import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StickyActionBarProps {
  children: ReactNode;
  className?: string;
}

/**
 * Sticky action bar that sticks to the bottom of the viewport.
 * Use for long-form edit pages (Requirement Builder, etc.)
 */
export function StickyActionBar({ children, className }: StickyActionBarProps) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-10',
        'bg-ent-card border-t border-ent-line',
        'px-4 md:px-6 lg:px-8 py-3',
        'flex items-center justify-end gap-2',
        className,
      )}
    >
      {children}
    </div>
  );
}
