import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { REFERENCE_POSITIONS, summarizeRequirements, type ReferencePosition } from '@/lib/reference-positions';
import { SECTION_IDS, type LandingSectionConfig } from '../landing-content';
import { useInView } from '../hooks/use-in-view';
import { DomainPips } from '../../components/DomainPips';
import { SectionHeader } from './SectionHeader';

type CareersSection = Extract<LandingSectionConfig, { kind: 'careers' }>;

const CARD = 'lp-card flex min-h-[220px] flex-col rounded-[20px] p-6 md:min-h-[300px]';
const stagger = (index: number) => ({ '--i': index }) as CSSProperties;

/** Preview of the reference positions a learner can aim for (individual page, so mint accents); the full list lives at /careers. */
export function CareerExplorerSection({ section }: { section: CareersSection }) {
  const [gridRef, gridInView] = useInView<HTMLDivElement>({ rootMargin: '0px 0px -100px 0px' });

  return (
    <section id={SECTION_IDS.careers} tabIndex={-1} aria-labelledby="lp-careers-title" className="scroll-mt-24 py-14 outline-none md:py-20">
      <SectionHeader id="lp-careers-title" intro={section.intro} />

      {/* Five positions plus the "all positions" card make a full 3 × 2 grid from xl. */}
      <div
        ref={gridRef}
        data-in={gridInView || undefined}
        className="mx-auto mt-14 grid w-full max-w-[90rem] grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3"
      >
        {REFERENCE_POSITIONS.map((position, index) => (
          <PositionCard key={position.code} position={position} index={index} linkLabel={section.cardLinkLabel} />
        ))}
        <Link
          to="/careers"
          style={stagger(REFERENCE_POSITIONS.length)}
          className={cn(
            CARD,
            'group justify-between gap-6 border border-amber-400/20 bg-gradient-to-b from-landing-card to-amber-500/5 transition-all duration-300 hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/15 max-md:min-h-[128px]'
          )}
        >
          <span className="text-xs uppercase tracking-[0.14em] text-stone-500 group-hover:text-amber-400/80 transition-colors">Tất cả vị trí tham chiếu</span>
          <span className="flex items-end justify-between gap-4">
            <span className="font-landing-serif text-[28px] italic leading-[1.15] tracking-[-0.01em] text-cream group-hover:text-[#F5CA65] transition-colors">{section.exploreAllLabel}</span>
            <ArrowRight
              className="size-5 shrink-0 -rotate-45 text-cream transition-transform duration-300 ease-cinematic motion-safe:group-hover:rotate-0 motion-safe:group-hover:text-[#F5CA65]"
              aria-hidden="true"
            />
          </span>
        </Link>
      </div>
    </section>
  );
}

function PositionCard({ position, index, linkLabel }: { position: ReferencePosition; index: number; linkLabel: string }) {
  const { selected, domains } = summarizeRequirements(position);

  return (
    <article
      className={cn(
        CARD,
        'group justify-between gap-8 bg-landing-card border border-cream/10 transition-all duration-300 hover:border-amber-400/45 hover:shadow-xl hover:shadow-amber-500/15 hover:-translate-y-0.5'
      )}
      style={stagger(index)}
    >
      <DomainPips domains={domains} />

      <div>
        <h3 className="text-[22px] font-normal leading-[1.22] tracking-[-0.015em] text-cream">
          {position.name}
        </h3>
        <p className="mt-2 text-sm leading-[1.5] text-stone-400">{position.description}</p>
        <p className="mt-4 text-xs text-stone-400 tabular-nums">
          <span className="font-medium text-[#F5CA65]">{selected}</span>/24 năng lực được chọn
        </p>
        <Link
          to={`/careers/${position.code.toLowerCase()}`}
          className="group/link mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-sm text-cream/90 group-hover:text-[#F5CA65] transition-colors touch-manipulation"
        >
          {linkLabel}
          <span className="sr-only"> {position.name}</span>
          <ArrowRight
            className="size-4 -rotate-45 transition-transform duration-300 ease-cinematic motion-safe:group-hover/link:rotate-0 motion-safe:group-hover/link:text-[#F5CA65]"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
