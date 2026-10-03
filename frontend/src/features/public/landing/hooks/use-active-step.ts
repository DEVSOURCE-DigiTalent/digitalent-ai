import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Which of several stacked blocks sits in the middle band of the viewport while scrolling.
 * Register each block with `register(index)`; without IntersectionObserver the first block stays active.
 */
export function useActiveStep(count: number): { active: number; register: (index: number) => (element: HTMLElement | null) => void } {
  const [active, setActive] = useState(0);
  const elements = useRef<(HTMLElement | null)[]>([]);

  const register = useCallback(
    (index: number) => (element: HTMLElement | null) => {
      elements.current[index] = element;
    },
    []
  );

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = elements.current.indexOf(entry.target as HTMLElement);
          if (index >= 0) setActive(index);
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    elements.current.slice(0, count).forEach((element) => element && observer.observe(element));
    return () => observer.disconnect();
  }, [count]);

  return { active, register };
}
