import { useId, useState } from 'react';
import { cn } from '@/lib/utils';
import { TT02_COMPETENCY_NAMES, getReferencePosition, summarizeRequirements } from '@/lib/reference-positions';
import { SECTION_IDS, TIER_LABELS, type LandingSectionConfig, type TeamGapSample } from '../landing-content';
import { useInView } from '../hooks/use-in-view';
import { useLandingMotion } from '../landing-motion';
import { RadarChart } from './RadarChart';
import { SectionHeader } from './SectionHeader';

type TeamGapSection = Extract<LandingSectionConfig, { kind: 'team-gap' }>;

interface GapRow {
  code: string;
  current: number;
  required: number;
  gap: number;
  behind: number;
}

/** Rows with the biggest gap first, then the most employees behind. Required levels come from the position. */
function buildRows(sample: TeamGapSample): GapRow[] {
  const position = getReferencePosition(sample.positionCode);
  const codes = Object.keys(TT02_COMPETENCY_NAMES);
  return sample.rows
    .map((row) => {
      const required = position?.levels[codes.indexOf(row.code)] ?? 0;
      return { ...row, required, gap: Math.max(0, required - row.current) };
    })
    .sort((a, b) => b.gap - a.gap || b.behind - a.behind);
}

/**
 * A product mock-up of a team's skill gap: matrix, radar and training priorities, for a department the visitor can
 * switch. It animates in once (bars grow, the radar fills, the suggestion slides in); with reduced motion it starts
 * finished. Switching department swaps the data and keeps the finished state.
 */
export function TeamGapSection({ section }: { section: TeamGapSection }) {
  const tabsId = useId();
  const { reduced } = useLandingMotion();
  const [stageRef, inView] = useInView<HTMLDivElement>({ rootMargin: '0px 0px -120px 0px' });
  const [selected, setSelected] = useState(0);
  const shown = reduced || inView;
  const sample = section.samples[selected] ?? section.samples[0];

  const position = getReferencePosition(sample.positionCode);
  const rows = buildRows(sample);
  const priorities = rows.filter((row) => row.gap > 0).slice(0, 2);
  const requiredByDomain = position ? summarizeRequirements(position).domains.map((domain) => domain.highestLevel) : [];

  return (
    <section id={SECTION_IDS.teamGap} tabIndex={-1} aria-labelledby="lp-team-gap-title" className="scroll-mt-24 py-14 outline-none md:py-20">
      <SectionHeader id="lp-team-gap-title" intro={section.intro} />

      <div ref={stageRef} className="mx-auto mt-12 w-full max-w-[100rem]">
        <div role="tablist" aria-label={section.tabsLabel} className="mb-3 flex flex-wrap gap-2">
          {section.samples.map((item, index) => (
            <button
              key={item.label}
              id={`${tabsId}-${index}`}
              type="button"
              role="tab"
              aria-selected={index === selected}
              onClick={() => setSelected(index)}
              className={cn(
                'rounded-full border px-5 py-2.5 text-sm transition-colors duration-200',
                index === selected ? 'border-cream bg-cream-soft font-medium text-black' : 'border-cream/25 text-cream/80 hover:border-cream/60 hover:text-cream',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,8fr)_minmax(0,5fr)]">
          <div className="rounded-[20px] bg-landing-panel p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <Chip>Phòng ban · {sample.department}</Chip>
              <Chip>Cấp bậc · G1–G3</Chip>
              <Chip>Dữ liệu minh họa</Chip>
            </div>

            <div className="mt-8 flex items-baseline justify-between gap-4">
              <p className="text-base text-stone-400">
                {sample.headcount} nhân viên · {position?.name}
              </p>
              <p className="text-5xl font-light tracking-[-0.04em] text-cream tabular-nums">{sample.coverage}%</p>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table aria-label={`Khoảng trống năng lực của nhóm ${sample.department}`} className="w-full min-w-[520px] border-collapse text-left text-base">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.1em] text-stone-500">
                    <th scope="col" className="py-2 pr-4 font-normal">Năng lực</th>
                    <th scope="col" className="px-4 py-2 font-normal">Trình độ hiện tại</th>
                    <th scope="col" className="px-4 py-2 font-normal">Trình độ yêu cầu</th>
                    <th scope="col" className="py-2 pl-4 text-right font-normal">Khoảng trống</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={`${sample.label}-${row.code}`}
                      className="border-t border-cream/10 transition-opacity duration-700"
                      style={{ opacity: shown ? 1 : 0, transitionDelay: `${index * 120}ms` }}
                    >
                      <td className="py-4 pr-4 text-cream/90">
                        <span className="mr-2 text-stone-500 tabular-nums">{row.code}</span>
                        {TT02_COMPETENCY_NAMES[row.code]}
                      </td>
                      <td className="px-4 py-4 text-stone-400">{TIER_LABELS[row.current]}</td>
                      <td className="px-4 py-4 text-stone-400">{TIER_LABELS[row.required]}</td>
                      <td className="py-4 pl-4 text-right">
                        <span className={cn('block whitespace-nowrap text-sm tabular-nums', row.gap > 0 ? 'text-cream' : 'text-[#A7C4A0]')}>
                          {row.gap > 0 ? `Còn thiếu ${row.gap} tầng` : 'Đã đạt'}
                        </span>
                        <GapBar current={row.current} required={row.required} shown={shown} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3">
            <div className="flex items-center gap-6 rounded-[20px] bg-landing-card p-6 text-cream md:p-8">
              <RadarChart required={requiredByDomain} current={sample.radarCurrent} size={168} grown={shown} />
              <p className="text-sm leading-[1.55] text-stone-400">
                Đường viền là yêu cầu của vị trí. Vùng tô là trình độ cao nhất nhóm đạt được ở từng miền.
              </p>
            </div>

            <div
              className="rounded-[20px] bg-landing-card p-6 transition-[opacity,transform] duration-700 ease-cinematic md:p-8"
              style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(16px)', transitionDelay: '500ms' }}
            >
              <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Ưu tiên đào tạo</p>
              <ul className="mt-5 grid gap-4">
                {priorities.map((row) => (
                  <li key={row.code} className="flex items-baseline justify-between gap-4 text-base leading-[1.35]">
                    <span className="text-cream/90">
                      <span className="mr-2 text-stone-500 tabular-nums">{row.code}</span>
                      {TT02_COMPETENCY_NAMES[row.code]}
                    </span>
                    <span className="shrink-0 text-sm text-stone-400 tabular-nums">{row.behind} nhân viên</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-7 inline-flex items-center rounded-full border border-cream/30 px-6 py-3 text-base text-cream transition-colors hover:border-cream/70"
              >
                {sample.recommendLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex w-max items-center whitespace-nowrap rounded-full border border-cream/12 px-3 py-1 text-xs text-cream/80">{children}</span>;
}

/** Three segments: reached, still missing to meet the requirement, beyond it. Grows from the left once shown. */
function GapBar({ current, required, shown }: { current: number; required: number; shown: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="mt-2 flex origin-left gap-0.5 transition-transform duration-1000 ease-cinematic"
      style={{ transform: shown ? 'scaleX(1)' : 'scaleX(0)' }}
    >
      {[1, 2, 3].map((step) => (
        <i
          key={step}
          className={cn('block h-2 flex-1 rounded-full', step <= current ? 'bg-cream' : step <= required ? 'border border-cream/70' : 'bg-cream/12')}
        />
      ))}
    </span>
  );
}
