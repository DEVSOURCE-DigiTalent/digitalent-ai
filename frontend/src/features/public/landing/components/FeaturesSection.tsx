import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { SECTION_IDS, type Feature } from '../landing-content';
import { useLandingContent } from '../landing-content-context';
import { useInView } from '../hooks/use-in-view';
import { BackgroundStage } from './BackgroundStage';
import { FeatureVisual } from './FeatureVisuals';
import { WordsPullUp } from './WordsPullUp';

const CARD = 'lp-card relative flex min-h-[440px] flex-col overflow-hidden rounded-[20px] xl:min-h-[500px]';
const stagger = (index: number) => ({ '--i': index }) as CSSProperties;

export function FeaturesSection() {
  const content = useLandingContent();
  const [gridRef, gridInView] = useInView<HTMLDivElement>({ rootMargin: '0px 0px -100px 0px' });

  return (
    <section
      id={SECTION_IDS.features}
      tabIndex={-1}
      aria-labelledby="lp-features-title"
      className="relative flex min-h-svh scroll-mt-24 flex-col justify-center gap-14 pb-[72px] pt-[104px] outline-none"
    >
      <div className="lp-noise-bg pointer-events-none absolute inset-y-0 -inset-x-4 opacity-15 md:-inset-x-6" aria-hidden="true" />

      <h2
        id="lp-features-title"
        className="relative mx-auto max-w-[56rem] text-balance text-center text-[clamp(20px,2.7vw,38px)] font-normal leading-[1.2] tracking-[-0.02em]"
      >
        <WordsPullUp segments={content.featuresHeadline} className="block text-cream" />
        <WordsPullUp segments={content.featuresSubline} className="block text-stone-500" startIndex={10} />
      </h2>

      {/* Four columns only from xl: Vietnamese copy runs longer than the English reference. */}
      <div
        ref={gridRef}
        data-in={gridInView || undefined}
        className="relative mx-auto grid w-full max-w-[90rem] grid-cols-1 gap-3 md:grid-cols-2 md:gap-2 xl:grid-cols-4 xl:gap-1"
      >
        <article className={`${CARD} justify-end bg-[#0b0906]`} style={stagger(0)}>
          <BackgroundStage scene="ember" seed={29} video={content.media.card} />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent from-45% to-black/65" aria-hidden="true" />
          <p className="relative z-10 p-6 text-[22px] leading-[1.25] tracking-[-0.015em] text-cream">
            <span className="mb-2.5 block text-[11px] uppercase tracking-[0.14em] text-cream/70">{content.mediaCard.label}</span>
            {content.mediaCard.caption}
          </p>
        </article>

        {content.features.map((feature, index) => (
          <FeatureCard key={feature.id} feature={feature} index={index + 1} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  return (
    <article className={`${CARD} justify-between gap-9 bg-landing-card p-6`} style={stagger(index)}>
      <FeatureVisual kind={feature.visual} />
      <div>
        <p className="mb-3 text-xs tracking-[0.08em] text-stone-500 tabular-nums">{feature.number}</p>
        <h3 className="text-balance text-[22px] font-normal leading-[1.22] tracking-[-0.015em] text-cream">{feature.title}</h3>
        <ul className="mt-5 grid gap-2.5">
          {feature.points.map((point) => (
            <li key={point} className="grid grid-cols-[16px_minmax(0,1fr)] gap-2.5 text-sm leading-[1.45] text-stone-400">
              <Check className="mt-[3px] size-3.5 text-cream-soft" strokeWidth={2.5} aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
        {feature.link && (
          <Link to={feature.link.to} className="group mt-6 inline-flex items-center gap-1.5 text-sm text-cream">
            {feature.link.label}
            <span className="sr-only"> về {feature.title.replace(/\.$/, '')}</span>
            <ArrowRight className="size-4 -rotate-45 transition-transform duration-300 ease-cinematic motion-safe:group-hover:rotate-0" aria-hidden="true" />
          </Link>
        )}
      </div>
    </article>
  );
}
