import { Fragment, useEffect, useRef } from 'react';
import { SECTION_IDS, type LandingSectionConfig } from '../landing-content';
import { useLandingMotion } from '../landing-motion';
import { revealOpacity, revealProgress } from '../reveal-text';

type BridgeSection = Extract<LandingSectionConfig, { kind: 'bridge' }>;

/**
 * A short typographic bridge after the hero: one statement, three questions that light up as the visitor scrolls,
 * and the line that joins them. Opacity is written straight to the elements, as in ScrollRevealText.
 */
export function BridgeSection({ section }: { section: BridgeSection }) {
  const { reduced } = useLandingMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || reduced) return;

    const lines = Array.from(container.querySelectorAll<HTMLElement>('[data-line]'));
    let frame = 0;
    let lastProgress = -1;

    const update = () => {
      frame = 0;
      const rect = container.getBoundingClientRect();
      const progress = revealProgress(rect.top, rect.height, window.innerHeight);
      if (Math.abs(progress - lastProgress) < 0.002) return;
      lastProgress = progress;
      lines.forEach((line, index) => {
        line.style.opacity = revealOpacity(progress, index, lines.length).toFixed(3);
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
      lines.forEach((line) => line.style.removeProperty('opacity'));
    };
  }, [reduced]);

  return (
    <section
      id={SECTION_IDS.bridge}
      tabIndex={-1}
      aria-labelledby="lp-bridge-title"
      className="flex min-h-[60svh] scroll-mt-24 items-center py-14 outline-none md:py-16"
    >
      <div ref={containerRef} className="mx-auto flex w-full max-w-5xl flex-col gap-9 text-center md:gap-12">
        <h2
          id="lp-bridge-title"
          data-line=""
          className="text-balance text-[clamp(34px,5.6vw,76px)] font-normal leading-[1.04] tracking-[-0.03em] text-cream"
        >
          {section.statement}
        </h2>

        <ul className="grid gap-6 md:gap-8">
          {section.questions.map((question, index) => (
            <Fragment key={question}>
              <li data-line="" className="text-balance font-landing-serif text-[clamp(22px,3vw,40px)] italic leading-[1.2] tracking-[-0.01em] text-cream/90">
                {question}
              </li>
              {index < section.questions.length - 1 && (
                <li aria-hidden="true" className="text-cream/30">
                  ↓
                </li>
              )}
            </Fragment>
          ))}
        </ul>

        <p data-line="" className="mx-auto max-w-[46ch] text-pretty text-base leading-[1.65] text-stone-400 sm:text-xl">
          {section.closing}
        </p>
      </div>
    </section>
  );
}
