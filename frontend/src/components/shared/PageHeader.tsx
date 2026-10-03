import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  label: string;
  value: string;
}

interface PageHeaderProps {
  title: string;
  /** @deprecated Use description instead */
  subtitle?: string;
  /** Page description shown below the title */
  description?: string;
  /** Action buttons slot — can be passed as children or via actions prop */
  children?: ReactNode;
  actions?: ReactNode;
  /** Optional tab row below the header */
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  className?: string;
}

/**
 * Page header v2: title (24px semibold) + description + actions + optional tab row.
 * Breadcrumb has moved to Topbar — do not add it here.
 * Backwards-compatible: subtitle alias works, children work as actions.
 */
export function PageHeader({
  title,
  subtitle,
  description,
  children,
  actions,
  tabs,
  activeTab,
  onTabChange,
  className,
}: PageHeaderProps) {
  const desc = description ?? subtitle;
  const rightSlot = actions ?? children;

  return (
    <div className={cn('mb-6', className)}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-ent-fg leading-tight">{title}</h1>
          {desc && (
            <p className="mt-1 text-sm text-ent-fg-2">{desc}</p>
          )}
        </div>
        {rightSlot && (
          <div className="flex items-center gap-2 shrink-0">{rightSlot}</div>
        )}
      </div>

      {tabs && tabs.length > 0 && (
        <div className="flex items-center gap-1 mt-4 border-b border-ent-line">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange?.(tab.value)}
              className={cn(
                'px-4 py-2 text-sm transition-colors border-b-2 -mb-px',
                activeTab === tab.value
                  ? 'border-ent-accent text-ent-fg font-medium'
                  : 'border-transparent text-ent-fg-2 hover:text-ent-fg',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
