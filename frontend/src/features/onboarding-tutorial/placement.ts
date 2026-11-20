/** Where the guide card goes next to the lit-up element, kept inside the window. Pure: no DOM. */

export type CardSide = 'right' | 'left' | 'bottom' | 'top' | 'center';

export interface Box { top: number; left: number; width: number; height: number }

export interface CardPlacement {
  top: number;
  left: number;
  /** Side of the target the card sits on; `center` = no target, no pointer. */
  side: CardSide;
  /** Where the pointer meets the card edge, in px from the card's top (left/right) or left (top/bottom). */
  caret: number;
}

const GAP = 16;
const MARGIN = 16;
const CARET_INSET = 22;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

/**
 * The preferred side first, then the others, the first one with room wins; no room anywhere (or no target): the middle
 * of the window. The pointer stays on the card's edge, aimed at the target's middle.
 */
export function placeCard(
  target: Box | null,
  card: { width: number; height: number },
  view: { width: number; height: number },
  preferred: CardSide = 'bottom',
): CardPlacement {
  const centered = {
    top: Math.max(MARGIN, (view.height - card.height) / 2),
    left: Math.max(MARGIN, (view.width - card.width) / 2),
    side: 'center' as const,
    caret: 0,
  };
  if (!target || preferred === 'center') return centered;

  const right = target.left + target.width;
  const bottom = target.top + target.height;
  const midX = target.left + target.width / 2;
  const midY = target.top + target.height / 2;
  const fits: Record<Exclude<CardSide, 'center'>, boolean> = {
    right: right + GAP + card.width + MARGIN <= view.width,
    left: target.left - GAP - card.width - MARGIN >= 0,
    bottom: bottom + GAP + card.height + MARGIN <= view.height,
    top: target.top - GAP - card.height - MARGIN >= 0,
  };
  const order: Exclude<CardSide, 'center'>[] = preferred === 'right' || preferred === 'left'
    ? [preferred, preferred === 'right' ? 'left' : 'right', 'bottom', 'top']
    : [preferred, preferred === 'bottom' ? 'top' : 'bottom', 'right', 'left'];
  const side = order.find((s) => fits[s]);
  if (!side) return centered;

  if (side === 'right' || side === 'left') {
    const top = clamp(midY - card.height / 2, MARGIN, view.height - card.height - MARGIN);
    return {
      top,
      left: side === 'right' ? right + GAP : target.left - GAP - card.width,
      side,
      caret: clamp(midY - top, CARET_INSET, card.height - CARET_INSET),
    };
  }
  const left = clamp(midX - card.width / 2, MARGIN, view.width - card.width - MARGIN);
  return {
    top: side === 'bottom' ? bottom + GAP : target.top - GAP - card.height,
    left,
    side,
    caret: clamp(midX - left, CARET_INSET, card.width - CARET_INSET),
  };
}

/** The first selector whose element is on screen (an off-canvas menu or a hidden element does not count). */
export function findTarget(selectors: string | string[], view: { width: number; height: number }): Element | null {
  for (const selector of Array.isArray(selectors) ? selectors : [selectors]) {
    for (const element of Array.from(document.querySelectorAll(selector))) {
      const r = element.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.right > 0 && r.left < view.width) return element;
    }
  }
  return null;
}
