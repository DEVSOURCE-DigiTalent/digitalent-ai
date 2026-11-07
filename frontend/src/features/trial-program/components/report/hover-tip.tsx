import type { TipState } from './report-hooks';

const TIP_WIDTH = 280;

export function HoverTip({ tip }: { tip: TipState | null }) {
  if (!tip) return null;
  const left = Math.min(window.innerWidth - TIP_WIDTH - 8, tip.x + 14);
  return (
    <div className="rp-tip" role="tooltip" style={{ left, top: Math.max(8, tip.y - 12), transform: 'translateY(-100%)' }}>
      {tip.content}
    </div>
  );
}
