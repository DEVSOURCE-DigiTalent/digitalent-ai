import { cn } from '@/lib/utils';
import { levelLabelVi } from '@/lib/competency-levels';
import { DOMAIN_SHORT_NAMES } from '../utils/format';

const AXES = 6;
const MAX_LEVEL = 3;
const CENTER = 150;
const RADIUS = 96;

function point(axis: number, radius: number): [number, number] {
  const angle = ((-90 + axis * (360 / AXES)) * Math.PI) / 180;
  return [CENTER + radius * Math.cos(angle), CENTER + radius * Math.sin(angle)];
}

const polygon = (levels: number[]) =>
  levels.map((level, axis) => point(axis, (RADIUS * Math.max(level, 0.12)) / MAX_LEVEL).map((n) => n.toFixed(1)).join(',')).join(' ');

interface DomainRadarProps {
  /** Level required per domain (6 values, 0–3). */
  required: number[];
  /** Level reached per domain (6 values, 0–3). */
  current: number[];
  className?: string;
  /** Hides the domain names (small sizes). */
  compact?: boolean;
}

/** Six domains of Circular 02/2025: outline = what the target asks, filled shape = where the learner is. */
export function DomainRadar({ required, current, className, compact = false }: DomainRadarProps) {
  const axes = Array.from({ length: AXES }, (_, axis) => axis);
  const summary = axes
    .map((axis) => `${DOMAIN_SHORT_NAMES[axis + 1]}: ${levelLabelVi(current[axis])} / yêu cầu ${levelLabelVi(required[axis])}`)
    .join('; ');

  return (
    <svg
      viewBox={compact ? '40 40 220 220' : '-30 0 360 300'}
      className={cn('h-auto w-full text-pt-fg', className)}
      role="img"
      aria-label={`Radar năng lực theo 6 miền. ${summary}`}
    >
      <g fill="none" stroke="currentColor" strokeOpacity={0.14}>
        {[1, 2, 3].map((ring) => (
          <polygon key={ring} points={polygon(axes.map(() => ring))} />
        ))}
        {axes.map((axis) => {
          const [x, y] = point(axis, RADIUS);
          return <line key={axis} x1={CENTER} y1={CENTER} x2={x} y2={y} />;
        })}
      </g>
      <polygon
        points={polygon(required)}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.7}
        strokeWidth={1.4}
        strokeDasharray="5 4"
      />
      <polygon points={polygon(current)} fill="currentColor" fillOpacity={0.22} stroke="currentColor" strokeWidth={1.6} />
      {axes.map((axis) => {
        const [x, y] = point(axis, (RADIUS * Math.max(current[axis], 0.12)) / MAX_LEVEL);
        return <circle key={axis} cx={x} cy={y} r={2.6} fill="currentColor" />;
      })}
      {!compact &&
        axes.map((axis) => {
          const [x, y] = point(axis, RADIUS + 22);
          const anchor = Math.abs(x - CENTER) < 4 ? 'middle' : x > CENTER ? 'start' : 'end';
          return (
            <text
              key={axis}
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fill="currentColor"
              fillOpacity={0.62}
              className="text-[11px]"
            >
              <tspan fontWeight={500} fillOpacity={1}>{axis + 1}</tspan> {DOMAIN_SHORT_NAMES[axis + 1]}
            </text>
          );
        })}
    </svg>
  );
}

export function RadarLegend({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-pt-fg-3', className)}>
      <span className="inline-flex items-center gap-2">
        <i className="block h-2.5 w-4 rounded-sm bg-pt-fg/30 ring-1 ring-pt-fg" aria-hidden="true" />
        Mức hiện tại
      </span>
      <span className="inline-flex items-center gap-2">
        <i className="block h-0 w-4 border-t border-dashed border-pt-fg/70" aria-hidden="true" />
        Yêu cầu của vị trí
      </span>
    </div>
  );
}
