import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useId, useRef, useState } from 'react';
import { LEVEL_LABELS } from '../lib/trial-format';
import './domain-line-chart.css';

export interface DomainLinePoint {
  number: number;
  name: string;
  /** Short axis label, e.g. "1. Dữ liệu". */
  short: string;
  /** Average level of the people shown (0–3, one decimal). */
  current: number;
  /** Average required level of the people who have a standard; null when nobody has one. */
  target: number | null;
}

const AXIS_LABELS = ['Chưa đạt', 'Cơ bản', 'Trung cấp', 'Nâng cao'];

/**
 * Smooth curve through the points (monotone cubic, Fritsch–Carlson): it never overshoots a value between two domains, so
 * the line stays inside the level scale and a flat stretch stays flat.
 */
function smoothPath(points: [number, number][]): string {
  const n = points.length;
  if (n === 0) return '';
  if (n === 1) return `M${points[0][0]},${points[0][1]}`;
  const dx = points.slice(1).map(([px], i) => px - points[i][0]);
  const slope = points.slice(1).map(([, py], i) => (py - points[i][1]) / dx[i]);
  const tangent = points.map((_, i) => {
    if (i === 0) return slope[0];
    if (i === n - 1) return slope[n - 2];
    return slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
  });
  for (let i = 0; i < n - 1; i += 1) {
    if (slope[i] === 0) { tangent[i] = 0; tangent[i + 1] = 0; continue; }
    const a = tangent[i] / slope[i];
    const b = tangent[i + 1] / slope[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      tangent[i] = t * a * slope[i];
      tangent[i + 1] = t * b * slope[i];
    }
  }
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 0; i < n - 1; i += 1) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const step = dx[i] / 3;
    d += ` C${(x0 + step).toFixed(1)},${(y0 + tangent[i] * step).toFixed(1)} ${(x1 - step).toFixed(1)},${(y1 - tangent[i + 1] * step).toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
  }
  return d;
}
const decimal = (value: number) => value.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const clampLevel = (value: number) => Math.max(0, Math.min(3, value));
const nearest = (value: number) => LEVEL_LABELS[clampLevel(Math.round(value))];
/** A required level that is an average of mixed standards reads as a span ("Cơ bản – Trung cấp"), not a rounded level. */
const between = (value: number) => Number.isInteger(value)
  ? LEVEL_LABELS[clampLevel(value)]
  : `${LEVEL_LABELS[clampLevel(Math.floor(value))]} – ${LEVEL_LABELS[clampLevel(Math.ceil(value))]}`;

/**
 * "Kết quả theo lĩnh vực" as a line chart: the six domains on the x axis, the level (Chưa đạt → Nâng cao) on the y axis.
 * Solid teal line with dots = current average level; dashed ink line with diamonds = required level; the shortfall between
 * them is shaded amber. Hover or focus a domain for its numbers (crosshair + tooltip). The table below stays the table view.
 */
export function DomainLineChart({ points }: { points: DomainLinePoint[] }) {
  useUiLanguage();
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(760);
  const [active, setActive] = useState<number | null>(null);
  const clipId = `trial-line-clip-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const measure = () => setWidth(Math.max(280, Math.round(element.getBoundingClientRect().width)));
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(element);
    return () => observer?.disconnect();
  }, []);

  if (points.length === 0) return null;
  const narrow = width < 520;
  const height = narrow ? 230 : 280;
  const margin = { top: 18, right: narrow ? 14 : 24, bottom: narrow ? 30 : 40, left: narrow ? 66 : 86 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const band = plotWidth / points.length;
  const x = (index: number) => margin.left + band * (index + 0.5);
  const y = (level: number) => margin.top + ((3 - level) / 3) * plotHeight;
  const hasTarget = points.some((point) => point.target != null);

  // Runs of consecutive domains that have a value (a domain without a standard breaks the target line).
  const runs = (values: (number | null)[]) => values.reduce<[number, number][][]>((all, value, index) => {
    if (value == null) return all;
    const point: [number, number] = [x(index), y(value)];
    if (index > 0 && values[index - 1] != null) all[all.length - 1].push(point);
    else all.push([point]);
    return all;
  }, []);
  const currentRun = runs(points.map((point) => point.current))[0] ?? [];
  const targetRuns = runs(points.map((point) => point.target));

  // Shortfall: the area below the target curve, clipped to the area above the current curve (they meet where they cross).
  const above = currentRun.length
    ? `${smoothPath(currentRun)} L${currentRun[currentRun.length - 1][0]},0 L${currentRun[0][0]},0 Z`
    : '';
  const gaps = targetRuns
    .filter((run) => run.some(([px, py]) => {
      const index = currentRun.findIndex(([cx]) => cx === px);
      return index >= 0 && py < currentRun[index][1] - 0.5;
    }))
    .map((run) => `${smoothPath(run)} L${run[run.length - 1][0]},${height} L${run[0][0]},${height} Z`);

  const focus = active == null ? null : points[active];
  // The tooltip sits beside the crosshair (right of it in the left half, left of it in the right half), never over a line label.
  const onRight = active != null && x(active) < width / 2;
  // On a phone there is no room beside it: keep the tooltip inside the plot width instead.
  const tooltipStyle = active == null ? undefined : narrow ? {
    left: Math.min(Math.max(x(active) - 105, 0), width - 214),
    top: margin.top,
  } : {
    left: x(active) + (onRight ? 14 : -14),
    top: margin.top,
    transform: onRight ? 'none' : 'translateX(-100%)',
  };

  return (
    <figure className="trial-line" aria-label={translateUi('Biểu đồ mức hiện tại so với mức cần đạt theo lĩnh vực')}>
      <ul className="trial-line__legend">
        <li><i data-series="current" aria-hidden="true" />{translateUi('Mức hiện tại (trung bình)')}</li>
        {hasTarget && <li><i data-series="target" aria-hidden="true" />{translateUi('Mức cần đạt')}</li>}
        {gaps.length > 0 && <li><i data-series="gap" aria-hidden="true" />{translateUi('Còn thiếu')}</li>}
      </ul>
      <div ref={box} className="trial-line__plot" onMouseLeave={() => setActive(null)}>
        <svg width={width} height={height} role="group" aria-label={translateUi('Mức theo 6 lĩnh vực')}>
          {AXIS_LABELS.map((label, level) => (
            <g key={label} aria-hidden="true">
              <line x1={margin.left} x2={width - margin.right} y1={y(level)} y2={y(level)} className={level === 0 ? 'trial-line__baseline' : 'trial-line__grid'} />
              <text x={margin.left - 10} y={y(level)} dy="0.35em" textAnchor="end" className="trial-line__axis">{translateUi(label)}</text>
            </g>
          ))}
          {points.map((point, index) => (
            <text key={point.number} x={x(index)} y={height - (narrow ? 10 : 14)} textAnchor="middle" aria-hidden="true"
              className={`trial-line__axis trial-line__x${active === index ? ' is-active' : ''}`}>
              {narrow ? translateUi(`LV ${point.number}`) : translateUi(point.short)}
            </text>
          ))}
          <defs><clipPath id={clipId}><path d={above} /></clipPath></defs>
          {gaps.map((d) => <path key={d} d={d} className="trial-line__gap" clipPath={`url(#${clipId})`} aria-hidden="true" />)}
          {active != null && <line x1={x(active)} x2={x(active)} y1={margin.top - 6} y2={y(0)} className="trial-line__crosshair" aria-hidden="true" />}
          {hasTarget && targetRuns.map((run) => <path key={run[0][0]} d={smoothPath(run)} className="trial-line__target" aria-hidden="true" />)}
          <path d={smoothPath(currentRun)} className="trial-line__current" pathLength={1} aria-hidden="true" />
          {points.map((point, index) => (
            <g key={point.number} aria-hidden="true">
              {point.target != null && (
                <rect x={x(index) - 5} y={y(point.target) - 5} width={10} height={10} transform={`rotate(45 ${x(index)} ${y(point.target)})`}
                  className={`trial-line__diamond${active === index ? ' is-active' : ''}`} />
              )}
              <circle cx={x(index)} cy={y(point.current)} r={active === index ? 7 : 5.5} className="trial-line__dot" />
            </g>
          ))}
          {points.map((point, index) => (
            <rect key={point.number} x={margin.left + band * index} y={0} width={band} height={height} className="trial-line__hit"
              tabIndex={0} role="img"
              aria-label={translateUi(`Lĩnh vực ${point.number} ${point.name}: hiện tại ${decimal(point.current)}${point.target != null ? `, cần đạt ${decimal(point.target)}` : ''}`)}
              onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} onBlur={() => setActive(null)} />
          ))}
        </svg>
        {focus && active != null && (
          <div className="trial-line__tooltip" style={tooltipStyle} role="status">
            <strong>{translateUi(`Lĩnh vực ${focus.number}`)}<span>{translateUi(focus.name)}</span></strong>
            <dl>
              <div><dt><i data-series="current" />{translateUi('Hiện tại')}</dt><dd>{decimal(focus.current)} <small>{translateUi(`· gần ${nearest(focus.current)}`)}</small></dd></div>
              {focus.target != null && <div><dt><i data-series="target" />{translateUi('Cần đạt')}</dt><dd>{decimal(focus.target)} <small>{translateUi(`· ${between(focus.target)}`)}</small></dd></div>}
            </dl>
            {focus.target != null && (
              <p data-tone={focus.target > focus.current ? 'gap' : 'met'}>
                {translateUi(focus.target > focus.current ? `Còn thiếu ${decimal(focus.target - focus.current)} mức` : 'Đạt chuẩn trung bình')}
              </p>
            )}
          </div>
        )}
      </div>
    </figure>
  );
}
