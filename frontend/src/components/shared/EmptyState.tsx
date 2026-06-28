import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  variant?: 'default' | 'filtered';
}

/**
 * Reusable empty state for no-data and filtered-empty scenarios.
 * - default: "No X yet. Create one to get started."
 * - filtered: "No results match current filters." + Clear Filters suggestion
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = 'default',
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="text-slate-300 mb-4">
        {icon ?? <Inbox className="w-16 h-16 mx-auto" strokeWidth={1} />}
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>}
      {action && <div>{action}</div>}
      {variant === 'filtered' && !action && (
        <p className="text-sm text-slate-400 mt-2">Try adjusting your search or filters.</p>
      )}
    </div>
  );
}
