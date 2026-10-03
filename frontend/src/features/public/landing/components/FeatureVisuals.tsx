import type { ReactNode } from 'react';
import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadarChart } from './RadarChart';
import { MATRIX_SAMPLE, PROGRESS_SAMPLE, RADAR_SAMPLE, TIER_LABELS, type FeatureVisualKind } from '../landing-content';

/** Illustrations built from the product's own data shapes. Decorative: hidden from screen readers. */
export function FeatureVisual({ kind }: { kind: FeatureVisualKind }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-cream" aria-hidden="true">
      {kind === 'matrix' && <MatrixVisual />}
      {kind === 'radar' && <RadarVisual />}
      {kind === 'certificate' && <CertificateVisual />}
      {kind === 'progress' && <ProgressProfile />}
    </div>
  );
}

function Chip({ tone = 'neutral', children }: { tone?: 'neutral' | 'ok'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex w-max items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px]',
        tone === 'ok' ? 'border-[#A7C4A0]/35 text-[#A7C4A0]' : 'border-cream/12 text-cream/80'
      )}
    >
      {children}
    </span>
  );
}

const META = 'grid gap-2 text-[11px] leading-[1.35] text-stone-400';
const AXIS_LABEL = 'fill-stone-500 text-[9px]';

// Required level 0–3 → dot size and fill.
const DOT_RADIUS = [3, 3.2, 4.2, 5.2];
const DOT_CLASS = ['fill-none stroke-current [stroke-opacity:0.28]', 'fill-current [fill-opacity:0.4]', 'fill-current [fill-opacity:0.75]', 'fill-current'];
const LEGEND = [
  { label: 'Cơ bản', className: 'size-1.5 opacity-40' },
  { label: 'Trung cấp', className: 'size-2 opacity-75' },
  { label: 'Nâng cao', className: 'size-2.5' },
];

export function MatrixVisual() {
  const levels = MATRIX_SAMPLE.flat();
  const selected = levels.filter((level) => level > 0).length;

  return (
    <>
      <svg width="120" height="92" viewBox="0 0 132 100" className="shrink-0">
        {MATRIX_SAMPLE.map((row, domain) => (
          <g key={domain}>
            <text x="2" y={11 + domain * 17} className={AXIS_LABEL}>{domain + 1}</text>
            {row.map((level, competency) => (
              <circle key={competency} cx={22 + competency * 18} cy={8 + domain * 17} r={DOT_RADIUS[level]} className={DOT_CLASS[level]} />
            ))}
          </g>
        ))}
      </svg>
      <div className={META}>
        <Chip>Vị trí · Kế toán</Chip>
        <span><b className="font-medium text-cream tabular-nums">{selected}</b>/{levels.length} năng lực được chọn</span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {LEGEND.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1">
              <i className={cn('inline-block rounded-full bg-cream', item.className)} />
              {item.label}
            </span>
          ))}
        </span>
      </div>
    </>
  );
}

export function RadarVisual() {
  return (
    <>
      <RadarChart required={RADAR_SAMPLE.required} current={RADAR_SAMPLE.current} />
      <div className={META}>
        <span className="flex items-center gap-2"><i className="inline-block h-0 w-3.5 border-t-[1.5px] border-cream" />Yêu cầu vị trí</span>
        <span className="flex items-center gap-2"><i className="inline-block size-2.5 rounded-[2px] bg-cream/35" />Mức hiện tại</span>
        <Chip>Thiếu hụt · Trung cấp</Chip>
      </div>
    </>
  );
}

function CertificateVisual() {
  return (
    <>
      <div className="flex w-full items-center gap-3.5 rounded-[14px] border border-cream/12 bg-black/25 p-3.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#A7C4A0]/12 text-[#A7C4A0]">
          <BadgeCheck className="size-5" />
        </span>
        <div>
          <p className="text-xs leading-[1.35] text-cream">Chứng chỉ năng lực số · Trung cấp</p>
          <p className="mt-1 font-mono text-[11px] tracking-[0.04em] text-stone-400">Mã mẫu DT-2026-0418</p>
        </div>
      </div>
      <Chip tone="ok">Đã xác thực</Chip>
    </>
  );
}

/** Personal competency profile: the level each domain was assessed at, three steps per bar. */
export function ProgressProfile() {
  const improved = 2;
  const courses = 3;

  return (
    <div className="grid w-full gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.12em] text-stone-500">Hồ sơ năng lực</p>
        <p className="text-[11px] text-stone-400">Mức được đánh giá</p>
      </div>
      <ul className="grid gap-2">
        {PROGRESS_SAMPLE.map((row) => (
          <li key={row.domain} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-xs leading-[1.3] text-cream/85">
            <span className="truncate">{row.domain}</span>
            <span className="flex items-center gap-2">
              <span className="flex gap-0.5">
                {[1, 2, 3].map((step) => (
                  <i key={step} className={cn('block h-1.5 w-4 rounded-full', step <= row.level ? 'bg-cream' : 'bg-cream/15')} />
                ))}
              </span>
              <span className="w-[4.5rem] text-right text-[11px] text-stone-400">{TIER_LABELS[row.level]}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Chip>+{improved} năng lực cải thiện</Chip>
        <Chip>{courses} khóa đã hoàn thành</Chip>
      </div>
    </div>
  );
}
