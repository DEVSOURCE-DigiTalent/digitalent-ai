import { useEffect, useState, type RefObject } from 'react';

export function useDirectionalHeader(ref: RefObject<HTMLDivElement | null>, enabled: boolean, route: string, pinned: boolean) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(false);
    if (!enabled || pinned) return;
    let anchor = window.scrollY;
    let previous = anchor;
    let direction = 0;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const y = Math.max(0, Math.min(window.scrollY, max));
      const from = previous;
      const delta = y - from;
      previous = y;
      const interacting = ref.current?.querySelector('[aria-expanded="true"], :focus-visible');
      if (y < 96 || interacting) {
        anchor = y;
        setHidden(false);
        return;
      }
      if (Math.abs(delta) < 1) return;
      const next = delta > 0 ? 1 : -1;
      if (next !== direction) { anchor = next > 0 ? Math.max(96, from) : from; direction = next; }
      if (direction > 0 && y - anchor > 48) setHidden(true);
      if (direction < 0 && anchor - y > 10) setHidden(false);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, [enabled, pinned, ref, route]);

  return { hidden, reveal: () => setHidden(false) };
}
