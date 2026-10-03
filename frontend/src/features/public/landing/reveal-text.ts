/** Scroll-linked character reveal of the landing "about" paragraph (pure helpers, no DOM). */

const REVEAL_START = 0.8; // block top at 80% of the viewport
const REVEAL_END = 0.2; // block bottom at 20% of the viewport
const MIN_OPACITY = 0.2;
const LEAD = 0.1;
const TAIL = 0.05;
/** Spread character positions over 85% of the range so the last ones also reach full opacity. */
const SPREAD = 0.85;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Words split into characters. NFC keeps each Vietnamese letter (e.g. "ộ") a single code point,
 * so a decomposed source never renders a lone combining mark.
 */
export function splitRevealText(text: string): string[][] {
  return text
    .normalize('NFC')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => Array.from(word));
}

/** 0 when the block top reaches 80% of the viewport, 1 when its bottom reaches 20%. */
export function revealProgress(top: number, height: number, viewportHeight: number): number {
  const distance = height + viewportHeight * REVEAL_START - viewportHeight * REVEAL_END;
  return clamp01((viewportHeight * REVEAL_START - top) / distance);
}

/** Opacity of character `index` out of `total` at the given progress. */
export function revealOpacity(progress: number, index: number, total: number, minOpacity: number = MIN_OPACITY): number {
  if (total <= 0) return 1;
  const start = (index / total) * SPREAD - LEAD;
  const t = clamp01((progress - start) / (LEAD + TAIL));
  return minOpacity + (1 - minOpacity) * t;
}
