import { useEffect, useRef, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WizardStep {
  id: string;
  label: string;
  /** Shown as "Có thể bỏ qua" under the label when the step is optional. */
  optional?: boolean;
}

interface WizardShellProps {
  steps: WizardStep[];
  /** Index of the step being shown. */
  current: number;
  /** Steps already done; they can be revisited. */
  completed?: ReadonlySet<string>;
  onStepSelect?: (index: number) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Frame of a multi-step flow (organization setup, career onboarding): a step list and the current step.
 * Styled with Enterprise tokens.
 */
export function WizardShell({ steps, current, completed, onStepSelect, title, description, children }: WizardShellProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Move focus to the new step's title so keyboard and screen-reader users land on the new content.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    titleRef.current?.focus();
  }, [current]);

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <nav aria-label="Các bước thiết lập">
        <ol className="grid gap-1">
          {steps.map((step, index) => {
            const isCurrent = index === current;
            const isDone = completed?.has(step.id) ?? index < current;
            const canSelect = Boolean(onStepSelect) && (isDone || index <= current);
            return (
              <li key={step.id}>
                <button
                  type="button"
                  aria-disabled={!canSelect || undefined}
                  onClick={() => canSelect && onStepSelect?.(index)}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                    isCurrent ? 'bg-[var(--ent-accent-soft)] font-medium text-ent-fg' : 'text-ent-fg-2',
                    canSelect && !isCurrent && 'hover:bg-ent-raised hover:text-ent-fg',
                    !canSelect && 'cursor-default opacity-50',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-6 shrink-0 place-items-center rounded-full text-xs font-medium',
                      isDone
                        ? 'bg-ent-ok text-white'
                        : isCurrent
                        ? 'bg-ent-accent text-white'
                        : 'bg-ent-raised text-ent-fg-3 border border-ent-line',
                    )}
                    aria-hidden="true"
                  >
                    {isDone ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate">{step.label}</span>
                    {step.optional && <span className="block text-xs font-normal text-ent-fg-3">Có thể bỏ qua</span>}
                  </span>
                  {isDone && <span className="sr-only">(đã xong)</span>}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <section aria-labelledby="wizard-step-title" className="rounded-xl border border-ent-line bg-ent-card p-6 shadow-sm sm:p-8">
        <h2 id="wizard-step-title" ref={titleRef} tabIndex={-1} className="text-xl font-semibold text-ent-fg outline-none">
          {title}
        </h2>
        {description && <p className="mt-1.5 max-w-[60ch] text-sm leading-relaxed text-ent-fg-2">{description}</p>}
        <div className="mt-6 text-ent-fg">{children}</div>
      </section>
    </div>
  );
}
