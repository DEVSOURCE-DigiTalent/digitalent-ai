import { cn } from '@/lib/utils';

const CENTER = 60;
const RADIUS = 46;
const MAX_LEVEL = 3;
const AXES = 6;
const AXIS_LABEL = 'fill-stone-500 text-[9px]';

function radarPoint(axis: number, radius: number): [number, number] {
  const angle = ((-90 + axis * (360 / AXES)) * Math.PI) / 180;
  return [CENTER + radius * Math.cos(angle), CENTER + radius * Math.sin(angle)];
}

const polygon = (levels: number[]) =>
  levels.map((level, axis) => radarPoint(axis, (RADIUS * level) / MAX_LEVEL).map((n) => n.toFixed(2)).join(',')).join(' ');

interface RadarChartProps {
  /** Level the position requires in each of the 6 domains, 0–3. */
  required: number[];
  /** Level reached in each domain, 0–3. */
  current: number[];
  size?: number;
  /** When false the current-level shape starts collapsed at the centre and grows to its value. */
  grown?: boolean;
  className?: string;
}

/** Six-domain radar: outline = requirement, filled shape = what has been reached. Decorative. */
export function RadarChart({ required, current, size = 112, grown = true, className }: RadarChartProps) {
  const axes = Array.from({ length: AXES }, (_, axis) => axis);

  return (
    <svg width={size} height={size} viewBox="-10 -10 140 140" className={cn('shrink-0', className)} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeOpacity={0.14}>
        {[1, 2, 3].map((ring) => (
          <polygon key={ring} points={polygon(axes.map(() => ring))} />
        ))}
        {axes.map((axis) => {
          const [x, y] = radarPoint(axis, RADIUS);
          return <line key={axis} x1={CENTER} y1={CENTER} x2={x} y2={y} />;
        })}
      </g>
      <polygon
        points={polygon(current)}
        fill="#14B8A6"
        fillOpacity={0.32}
        stroke="#2DD4BF"
        strokeWidth={1.5}
        strokeOpacity={0.85}
        style={{
          transformOrigin: `${CENTER}px ${CENTER}px`,
          transform: grown ? 'scale(1)' : 'scale(0.15)',
          transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
      <polygon points={polygon(required)} fill="none" stroke="#F5CA65" strokeWidth={1.75} strokeOpacity={0.95} />
      {axes.map((axis) => {
        const [x, y] = radarPoint(axis, RADIUS + 9);
        return (
          <text key={axis} x={x} y={y + 3} textAnchor="middle" className={AXIS_LABEL}>
            {axis + 1}
          </text>
        );
      })}
    </svg>
  );
}
