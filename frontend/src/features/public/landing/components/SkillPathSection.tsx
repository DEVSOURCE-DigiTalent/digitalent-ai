import { cn } from '@/lib/utils';
import { TT02_COMPETENCY_NAMES, getReferencePosition } from '@/lib/reference-positions';
import { SECTION_IDS, TIER_LABELS, type LandingSectionConfig, type SkillPathSample } from '../landing-content';
import { SectionHeader } from './SectionHeader';

type SkillPathSection = Extract<LandingSectionConfig, { kind: 'skill-path' }>;

/** Required level of one competency for the sample's position (0 when the position does not need it). */
function requiredLevel(sample: SkillPathSample, code: string): number {
  const position = getReferencePosition(sample.positionCode);
  const index = Object.keys(TT02_COMPETENCY_NAMES).indexOf(code);
  return position && index >= 0 ? position.levels[index] : 0;
}

/**
 * The core value of the product: required level, current level and the gap per competency, then the
 * courses that close it in prerequisite order, each with the reason it was recommended.
 */
export function SkillPathSection({ section }: { section: SkillPathSection }) {
  const { sample } = section;
  const position = getReferencePosition(sample.positionCode);

  return (
    <section id={SECTION_IDS.skillPath} tabIndex={-1} aria-labelledby="lp-skill-path-title" className="scroll-mt-24 py-14 outline-none md:py-20">
      <SectionHeader id="lp-skill-path-title" intro={section.intro} />

      <div className="mx-auto mt-14 grid max-w-[90rem] gap-3 lg:grid-cols-2">
        <div className="rounded-[20px] bg-landing-panel p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Chip>Vị trí tham chiếu · {position?.name}</Chip>
            <Chip>Ví dụ minh họa</Chip>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-stone-400">
            <span className="inline-flex items-center gap-2">
              <i className="block h-1.5 w-5 rounded-full bg-cream" />
              Mức hiện tại
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="block h-1.5 w-5 rounded-full border border-cream/70" />
              Yêu cầu vị trí
            </span>
          </div>

          <ul className="mt-6 grid gap-5">
            {sample.rows.map((row) => (
              <GapRow key={row.code} code={row.code} current={row.current} required={requiredLevel(sample, row.code)} />
            ))}
          </ul>
        </div>

        <div className="rounded-[20px] bg-landing-card p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Lộ trình đề xuất</p>
          <ol aria-label="Lộ trình học đề xuất" className="mt-6 grid gap-6">
            {sample.roadmap.map((step, index) => (
              <RoadmapStep key={step.courseCode} index={index} sample={sample} step={step} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex w-max items-center whitespace-nowrap rounded-full border border-cream/12 px-2.5 py-1 text-[11px] text-cream/80">{children}</span>;
}

function GapRow({ code, current, required }: { code: string; current: number; required: number }) {
  const gap = Math.max(0, required - current);

  return (
    <li className="grid gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <p className="min-w-0 text-sm leading-[1.35] text-cream/90">
          <span className="mr-2 text-stone-500 tabular-nums">{code}</span>
          {TT02_COMPETENCY_NAMES[code]}
        </p>
        <span className={cn('shrink-0 text-xs tabular-nums', gap > 0 ? 'text-cream' : 'text-[#A7C4A0]')}>
          {gap > 0 ? `Còn thiếu ${gap} tầng` : 'Đã đạt'}
        </span>
      </div>
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3].map((step) => (
          <i
            key={step}
            className={cn(
              'block h-1.5 flex-1 rounded-full',
              step <= current ? 'bg-cream' : step <= required ? 'border border-cream/70' : 'bg-cream/12',
            )}
          />
        ))}
      </div>
      <p className="text-[11px] text-stone-500">
        {TIER_LABELS[current]} → {TIER_LABELS[required]}
      </p>
    </li>
  );
}

function RoadmapStep({ index, sample, step }: { index: number; sample: SkillPathSample; step: SkillPathSample['roadmap'][number] }) {
  const required = requiredLevel(sample, step.competencyCode);
  const current = sample.rows.find((row) => row.code === step.competencyCode)?.current ?? 0;

  return (
    <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4">
      <span aria-hidden="true" className="font-landing-serif text-2xl italic leading-none text-cream/35 tabular-nums">
        {index + 1}
      </span>
      <div>
        <p className="font-mono text-[11px] tracking-[0.04em] text-stone-500">{step.courseCode}</p>
        <p className="mt-1 text-base leading-[1.3] text-cream">{step.title}</p>
        <p className="mt-2 text-sm leading-[1.5] text-stone-400">
          Vị trí yêu cầu {TIER_LABELS[required]} ở năng lực {step.competencyCode}, kết quả hiện tại là {TIER_LABELS[current]}.
          {step.after ? ` Cần hoàn thành ${step.after} trước.` : ''}
        </p>
      </div>
    </li>
  );
}
