import { useId, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  /** Small count or marker next to the label. */
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
  /** Accessible name of the tab list. */
  label: string;
  children?: ReactNode;
  className?: string;
}

/** Tabs of one entity workspace. Styled with Enterprise tokens. */
export function Tabs({ tabs, value, onChange, label, children, className }: TabsProps) {
  const base = useId();
  const idOf = (id: string) => `${base}-${id}`;

  const move = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const target = event.key === 'ArrowRight' ? index + 1 : event.key === 'ArrowLeft' ? index - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
    if (target === null) return;
    event.preventDefault();
    const next = tabs[(target + tabs.length) % tabs.length];
    onChange(next.id);
    document.getElementById(`${idOf(next.id)}-tab`)?.focus();
  };

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-ent-line">
        {tabs.map((tab, index) => {
          const selected = tab.id === value;
          return (
            <button
              key={tab.id}
              id={`${idOf(tab.id)}-tab`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${idOf(tab.id)}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(event) => move(event, index)}
              className={cn(
                '-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                selected
                  ? 'border-ent-accent text-ent-fg'
                  : 'border-transparent text-ent-fg-2 hover:text-ent-fg hover:border-ent-line',
              )}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span className="rounded-full bg-ent-raised px-2 py-0.5 text-xs text-ent-fg-2">{tab.badge}</span>
              )}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${idOf(value)}-panel`}
        aria-labelledby={`${idOf(value)}-tab`}
        tabIndex={0}
        className="pt-5 outline-none"
      >
        {children}
      </div>
    </div>
  );
}
