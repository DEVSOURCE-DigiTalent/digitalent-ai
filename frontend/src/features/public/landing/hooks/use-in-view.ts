import { useEffect, useRef, useState, type RefObject } from 'react';

interface InViewOptions {
  rootMargin?: string;
  /** Stop watching after the first time the element is seen (entrance animations). */
  once?: boolean;
}

/** Whether the element intersects the viewport. Without IntersectionObserver it counts as visible. */
export function useInView<T extends Element>({ rootMargin = '0px', once = true }: InViewOptions = {}): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (once) observer.disconnect();
      } else if (!once) {
        setInView(false);
      }
    }, { rootMargin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  return [ref, inView];
}
