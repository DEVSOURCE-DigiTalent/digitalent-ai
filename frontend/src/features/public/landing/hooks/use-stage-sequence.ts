import { useEffect, useState } from 'react';

/**
 * Index of the stage reached so far: advances one stage per `intervalMs` once `started`, then stays on the last.
 * With `immediate` (reduced motion) it starts on the last stage so the whole story is readable at rest.
 */
export function useStageSequence(count: number, started: boolean, immediate: boolean, intervalMs = 1400): number {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (immediate || !started) return;
    const id = window.setInterval(() => {
      setStage((current) => {
        if (current >= count - 1) {
          window.clearInterval(id);
          return current;
        }
        return current + 1;
      });
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [count, started, immediate, intervalMs]);

  return immediate ? count - 1 : stage;
}
