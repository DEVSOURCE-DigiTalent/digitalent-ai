import { useEffect } from 'react';

/** Paints the document behind the page so overscroll at the edges matches it; restored on leave. */
export function usePageBackground(color: string): void {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.backgroundColor;
    root.style.backgroundColor = color;
    return () => {
      root.style.backgroundColor = previous;
    };
  }, [color]);
}
