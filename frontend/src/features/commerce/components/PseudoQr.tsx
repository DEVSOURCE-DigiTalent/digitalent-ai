import { useMemo } from 'react';

const SIZE = 25;
const FINDER = 7;

/** Small deterministic hash so the same transfer code always draws the same picture. */
function seededBits(seed: string, count: number): boolean[] {
  let state = 2166136261;
  for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619) >>> 0;
  return Array.from({ length: count }, () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return (state >>> 16) % 2 === 0;
  });
}

function inFinder(x: number, y: number): boolean {
  const corner = (cx: number, cy: number) => x >= cx && x < cx + FINDER && y >= cy && y < cy + FINDER;
  return corner(0, 0) || corner(SIZE - FINDER, 0) || corner(0, SIZE - FINDER);
}

function finderCell(x: number, y: number): boolean {
  const local = (value: number) => (value >= SIZE - FINDER ? value - (SIZE - FINDER) : value);
  const lx = local(x);
  const ly = local(y);
  const onRing = lx === 0 || ly === 0 || lx === FINDER - 1 || ly === FINDER - 1;
  const inCore = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
  return onRing || inCore;
}

/**
 * Stand-in for a payment QR code. It looks like one but encodes nothing: the payment flow is simulated,
 * and the picture says so in its label.
 */
export function PseudoQr({ value, className }: { value: string; className?: string }) {
  const cells = useMemo(() => {
    const bits = seededBits(value, SIZE * SIZE);
    const filled: Array<[number, number]> = [];
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const on = inFinder(x, y) ? finderCell(x, y) : bits[y * SIZE + x];
        if (on) filled.push([x, y]);
      }
    }
    return filled;
  }, [value]);

  return (
    <svg
      viewBox={`-2 -2 ${SIZE + 4} ${SIZE + 4}`}
      role="img"
      aria-label="Mã QR minh họa, không quét được"
      className={className}
      shapeRendering="crispEdges"
    >
      <rect x="-2" y="-2" width={SIZE + 4} height={SIZE + 4} fill="#fff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#111" />
      ))}
    </svg>
  );
}
