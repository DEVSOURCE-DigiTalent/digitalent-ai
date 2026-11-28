import { useRef } from 'react';

/**
 * When the current phase of a wait started (ms), reset each time `phase` changes: the time left of a phase is
 * estimated from its own speed (a download and a frame-by-frame analysis do not go at the same pace). null = no wait.
 */
export function usePhaseStart(phase: string | null): number | null {
  const ref = useRef<{ phase: string | null; at: number | null }>({ phase: null, at: null });
  if (ref.current.phase !== phase) ref.current = { phase, at: phase == null ? null : Date.now() };
  return ref.current.at;
}
