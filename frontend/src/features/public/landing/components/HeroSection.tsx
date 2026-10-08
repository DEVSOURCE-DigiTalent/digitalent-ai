import type { CSSProperties, Ref } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SECTION_IDS } from '../landing-content';
import { useLandingContent } from '../landing-content-context';
import { useLandingCta } from '../hooks/use-landing-cta';
import { BackgroundStage } from './BackgroundStage';
import { HangingNav } from './LandingNav';
import { MotionToggle } from './MotionToggle';
import { SectionLink } from './LandingLinks';
import { cn } from '@/lib/utils';
import type { HeroFragments as HeroFragmentsData } from '../landing-content';

const delay = (seconds: number) => ({ '--lp-delay': `${seconds}s` }) as CSSProperties;

interface HeroSectionProps {
  /** The copy row; the sticky dock appears once it has scrolled out of view. */
  metaRef: Ref<HTMLDivElement>;
}

export function HeroSection({ metaRef }: HeroSectionProps) {
  const cta = useLandingCta();
  const content = useLandingContent();

  return (
    <header id={SECTION_IDS.top} tabIndex={-1} className="h-svh min-h-[600px] py-4 outline-none md:py-6">
      <div className="relative isolate h-full overflow-hidden rounded-2xl bg-[#0b0906] md:rounded-[2rem]">
        <BackgroundStage scene="ember" seed={11} video={content.media.hero} />
        <div className="lp-noise-overlay pointer-events-none absolute inset-0 opacity-70 mix-blend-overlay" aria-hidden="true" />
        <div className="lp-hero-shade pointer-events-none absolute inset-0" aria-hidden="true" />

        <HangingNav />
        {content.heroFragments && <HeroFragments fragments={content.heroFragments} />}

        {/* Video motion control discreetly in the top-right corner */}
        <div className="absolute right-4 top-4 z-20 md:right-8 md:top-6">
          <MotionToggle />
        </div>

        <div className="lp-wordmark-row absolute inset-x-0 bottom-0 z-20 flex flex-col gap-[clamp(16px,3.5vh,36px)] px-4 md:px-8">
          <div ref={metaRef} className="grid grid-cols-12 items-end gap-x-4 gap-y-6">
            {/* Left column: Eyebrow + Headline */}
            <div className="col-span-12 flex flex-col gap-4 md:col-span-6 lg:gap-5">
              {content.heroEyebrow?.title && (
                <div className="lp-fade-rise flex items-center gap-2.5" style={delay(0.15)}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/70 sm:text-xs">
                    {content.heroEyebrow.title}
                  </p>
                  {content.heroEyebrow.basis && (
                    <span className="hidden text-xs text-cream/50 sm:inline">· {content.heroEyebrow.basis}</span>
                  )}
                </div>
              )}
              {content.heroHeadline && (
                <p
                  className="lp-fade-rise max-w-[20ch] text-balance text-[clamp(32px,4.2vw,60px)] font-normal leading-[1.08] tracking-[-0.03em] text-cream"
                  style={delay(0.25)}
                >
                  {content.heroHeadline.map((line) => (
                    <span key={line.text} className={cn('block', line.className)}>
                      {line.text}
                    </span>
                  ))}
                </p>
              )}
            </div>

            {/* Right column: Short description + CTAs */}
            <div className="col-span-12 flex flex-col items-start gap-4 md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-9 sm:gap-5">
              <p className="lp-fade-rise max-w-[42ch] text-base leading-[1.55] text-cream-soft/85 sm:text-lg" style={delay(0.4)}>
                {content.heroLede}
              </p>
              <div className="lp-fade-rise flex flex-col items-start gap-3.5 sm:flex-row sm:items-center sm:gap-6" style={delay(0.55)}>
                <Link
                  to={cta.to}
                  className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-cream-soft py-[6px] pl-7 pr-[6px] text-base font-medium text-black transition-[gap] duration-300 ease-cinematic hover:gap-3 sm:text-lg"
                >
                  {cta.isSignedIn ? 'Vào hệ thống' : content.cta.heroLabel}
                  <span className="grid size-11 place-items-center rounded-full bg-black text-cream-soft transition-transform duration-300 ease-cinematic motion-safe:group-hover:scale-110 sm:size-12" aria-hidden="true">
                    <ArrowRight className="size-[18px]" />
                  </span>
                </Link>
                {content.cta.secondaryLabel && content.cta.secondaryTo && (
                  <div className="pl-1 sm:pl-0">
                    <SecondaryLink to={content.cta.secondaryTo}>{content.cta.secondaryLabel}</SecondaryLink>
                  </div>
                )}
              </div>
              {content.cta.trialLabel && content.cta.trialTo && !cta.isSignedIn && (
                <div className="lp-fade-rise pl-1 sm:pl-0" style={delay(0.65)}>
                  <SecondaryLink to={content.cta.trialTo}>{content.cta.trialLabel}</SecondaryLink>
                </div>
              )}
            </div>
          </div>

          <h1
            className="lp-wordmark text-cream"
            style={content.heroWordmarkScale ? ({ '--lp-wm-scale': content.heroWordmarkScale } as CSSProperties) : undefined}
          >
            <span className="sr-only">DigiTalent AI</span>
            <span className="lp-wordmark-clip" aria-hidden="true">
              <span className="lp-wordmark-word">DigiTalent</span>
            </span>
            <span className="lp-wordmark-sup" aria-hidden="true">AI</span>
          </h1>
        </div>
      </div>
    </header>
  );
}

/** The quieter second action: an in-page anchor, or a route when it is not a section id. */
function SecondaryLink({ to, children }: { to: string; children: string }) {
  const className = 'text-base text-cream/85 underline underline-offset-4 transition-colors hover:text-cream';
  if (to.startsWith('/')) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <SectionLink sectionId={to} className={className}>
      {children}
    </SectionLink>
  );
}

/** A few labelled figures over the footage. Sample data: the caption says so. */
function HeroFragments({ fragments }: { fragments: HeroFragmentsData }) {
  return (
    <div
      role="group"
      aria-label={fragments.caption}
      className="lp-fade-rise absolute right-4 top-24 z-10 hidden overflow-hidden rounded-2xl border border-cream/15 bg-black/30 backdrop-blur-md md:[@media(min-height:720px)]:block lg:right-8 lg:top-28"
      style={delay(1)}
    >
      <div className="flex divide-x divide-cream/10">
        {fragments.items.map((item) => (
          <div key={item.label} className="grid gap-0.5 px-4 py-2.5">
            <span className="text-[10px] uppercase tracking-[0.14em] text-cream/60">{item.label}</span>
            <span className="text-base tracking-[-0.02em] text-cream tabular-nums">{item.value}</span>
          </div>
        ))}
      </div>
      <p className="border-t border-cream/10 px-4 py-1.5 text-[10px] text-cream/50">{fragments.caption}</p>
    </div>
  );
}
