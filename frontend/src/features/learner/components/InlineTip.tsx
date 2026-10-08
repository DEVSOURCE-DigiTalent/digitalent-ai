import type { ReactNode } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { useMarkSeen, usePersonalAccess } from '@/hooks/use-personal-learning';
import type { SeenKey } from '@/lib/personal-access';
import { cn } from '@/lib/utils';

interface InlineTipProps {
  /** Marker stored on the server when the learner closes the tip. */
  tipKey: Extract<SeenKey, `tip-${string}`>;
  /** The page can hold a tip back until it has something true to say. */
  when?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * A small note inside the page flow, shown once to a trial learner and gone for good once closed (spec §8.7).
 * It never covers the page or blocks anything; closing is remembered by the server, so it stays closed on
 * another device.
 */
export function InlineTip({ tipKey, when = true, className, children }: InlineTipProps) {
  const { data: access } = usePersonalAccess();
  const markSeen = useMarkSeen();

  if (!when || access?.mode !== 'trial' || access.seen[tipKey]) return null;

  return (
    <div
      role="note"
      className={cn('flex items-start gap-3 rounded-xl border border-pt-line border-l-2 border-l-pt-accent bg-pt-raised/60 px-4 py-3 text-sm text-pt-fg-2', className)}
    >
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-pt-ok" aria-hidden="true" />
      <p className="min-w-0 flex-1 leading-relaxed">{children}</p>
      <button
        type="button"
        onClick={() => markSeen.mutate(tipKey)}
        aria-label="Đóng gợi ý"
        className="-m-1.5 grid size-8 shrink-0 place-items-center rounded-lg text-pt-fg-3 transition-colors hover:bg-pt-fg/8 hover:text-pt-fg"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
