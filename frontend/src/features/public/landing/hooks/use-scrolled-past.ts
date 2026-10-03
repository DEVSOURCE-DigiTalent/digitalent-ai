import { useEffect, useRef, useState, type RefObject } from 'react';

/** True once the element has scrolled out through the top of the viewport (false while it is below). */
export function useScrolledPast<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(([entry]) => {
      setScrolledPast(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, scrolledPast];
}
