import { useId, type ReactNode } from 'react';

/** Keep content mounted so both directions animate and form drafts survive closing. */
export function TrialDisclosure({ open, children, id }: { open: boolean; children: ReactNode; id?: string }) {
  const generatedId = useId();
  return <div id={id ?? generatedId} className="trial-disclosure" data-open={open} inert={!open} aria-hidden={!open}>
    <div className="trial-disclosure__clip">{children}</div>
  </div>;
}
