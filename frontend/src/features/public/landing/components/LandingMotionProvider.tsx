import { useMemo, useState, type ReactNode } from 'react';
import { LandingMotionContext, type LandingMotion } from '../landing-motion';
import { usePrefersReducedMotion } from '../hooks/use-prefers-reduced-motion';

export function LandingMotionProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  // null = follow the system setting until the visitor uses the pause control
  const [pausedByVisitor, setPausedByVisitor] = useState<boolean | null>(null);
  const paused = pausedByVisitor ?? reduced;

  const value = useMemo<LandingMotion>(
    () => ({ reduced, paused, togglePaused: () => setPausedByVisitor(!paused) }),
    [reduced, paused]
  );

  return <LandingMotionContext.Provider value={value}>{children}</LandingMotionContext.Provider>;
}
