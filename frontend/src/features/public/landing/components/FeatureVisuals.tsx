import type { ReactNode } from 'react';
import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadarChart } from './RadarChart';
import { MATRIX_SAMPLE, PROGRESS_SAMPLE, RADAR_SAMPLE, TIER_LABELS, type FeatureVisualKind } from '../landing-content';
import { LP_KICKER } from '../landing-type';

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

function Chip({ tone = 'neutral', children }: { tone?: 'neutral' | 'ok' | 'gold' | 'teal' | 'warn'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex w-max items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
        tone === 'ok' && 'border-[#2DD4BF]/35 text-[#2DD4BF] bg-[#2DD4BF]/10',
        tone === 'teal' && 'border-teal-400/35 text-teal-300 bg-teal-400/10',
        tone === 'gold' && 'border-amber-400/35 text-amber-300 bg-amber-400/10',
        tone === 'warn' && 'border-amber-400/35 text-amber-300 bg-amber-400/10',
        tone === 'neutral' && 'border-cream/12 text-cream/80'
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
const DOT_CLASS = [
  'fill-none stroke-current [stroke-opacity:0.2]',
  'fill-teal-500/50',
  'fill-teal-400',
  'fill-[#F5CA65] drop-shadow-[0_0_3px_rgba(245,202,101,0.6)]'
];
const LEGEND = [
  { label: 'Cơ bản', className: 'size-1.5 bg-teal-500/60' },
  { label: 'Trung cấp', className: 'size-2 bg-teal-400' },
  { label: 'Nâng cao', className: 'size-2.5 bg-[#F5CA65] shadow-[0_0_6px_rgba(245,202,101,0.6)]' },
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
        <Chip tone="gold">Vị trí · Kế toán</Chip>
        <span><b className="font-medium text-[#F5CA65] tabular-nums">{selected}</b>/{levels.length} năng lực được chọn</span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {LEGEND.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5">
              <i className={cn('inline-block rounded-full', item.className)} />
              <span className="text-stone-300">{item.label}</span>
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
        <span className="flex items-center gap-2">
          <i className="inline-block h-0 w-3.5 border-t-[2px] border-[#F5CA65]" />
          <span className="text-stone-300">Yêu cầu vị trí</span>
        </span>
        <span className="flex items-center gap-2">
          <i className="inline-block size-2.5 rounded-[2px] bg-[#14B8A6]/70 border border-[#2DD4BF]" />
          <span className="text-stone-300">Mức hiện tại</span>
        </span>
        <Chip tone="gold">Thiếu hụt · Trung cấp</Chip>
      </div>
    </>
  );
}

function CertificateVisual() {
  return (
    <>
      <div className="flex w-full items-center gap-3.5 rounded-[14px] border border-amber-400/25 bg-black/25 p-3.5 shadow-[0_0_15px_rgba(245,202,101,0.06)]">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-400/15 text-[#F5CA65]">
          <BadgeCheck className="size-5" />
        </span>
        <div>
          <p className="text-xs font-medium leading-[1.35] text-cream">Chứng chỉ năng lực số · Trung cấp</p>
          <p className="mt-1 font-mono text-[11px] tracking-[0.04em] text-amber-300/80">Mã mẫu DT-2026-0418</p>
        </div>
      </div>
      <Chip tone="gold">Đã xác thực</Chip>
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
        <p className={cn(LP_KICKER, 'text-teal-400')}>Hồ sơ năng lực</p>
        <p className="text-[11px] text-stone-400">Mức được đánh giá</p>
      </div>
      <ul className="grid gap-2">
        {PROGRESS_SAMPLE.map((row) => (
          <li key={row.domain} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-xs leading-[1.3] text-cream/85">
            <span className="truncate">{row.domain}</span>
            <span className="flex items-center gap-2">
              <span className="flex gap-0.5">
                {[1, 2, 3].map((step) => {
                  const isFilled = step <= row.level;
                  const isHighest = isFilled && step === 3;
                  return (
                    <i
                      key={step}
                      className={cn(
                        'block h-1.5 w-4 rounded-full transition-colors',
                        isHighest
                          ? 'bg-[#F5CA65] shadow-[0_0_6px_rgba(245,202,101,0.4)]'
                          : isFilled
                          ? 'bg-teal-400'
                          : 'bg-cream/15'
                      )}
                    />
                  );
                })}
              </span>
              <span className={cn('w-[4.5rem] text-right text-[11px]', row.level === 3 ? 'text-amber-300 font-medium' : 'text-stone-400')}>
                {TIER_LABELS[row.level]}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Chip tone="gold">+{improved} năng lực cải thiện</Chip>
        <Chip tone="teal">{courses} khóa đã hoàn thành</Chip>
      </div>
    </div>
  );
}
