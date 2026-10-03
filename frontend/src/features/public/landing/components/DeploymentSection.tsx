import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SECTION_IDS, type LandingSectionConfig } from '../landing-content';
import { useLandingMotion } from '../landing-motion';
import { revealProgress } from '../reveal-text';
import { SectionHeader } from './SectionHeader';

type DeploymentSection = Extract<LandingSectionConfig, { kind: 'deployment' }>;

/**
 * From sign-up to the first assessment, as a vertical rail that fills while the visitor scrolls. Steps light up
 * one by one and show what the product would display once the step is done. No duration is promised.
 */
export function DeploymentSection({ section }: { section: DeploymentSection }) {
  const { reduced } = useLandingMotion();
  const railRef = useRef<HTMLOListElement>(null);
  const [lit, setLit] = useState(0);
  const total = section.steps.length;
  const litCount = reduced ? total : lit;

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || reduced) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = rail.getBoundingClientRect();
      const progress = revealProgress(rect.top, rect.height, window.innerHeight);
      rail.style.setProperty('--fill', progress.toFixed(3));
      setLit(Math.min(total, Math.round(progress * total + 0.35)));
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
    };
  }, [reduced, total]);

  return (
    <section id={SECTION_IDS.deployment} tabIndex={-1} aria-labelledby="lp-deployment-title" className="scroll-mt-24 py-14 outline-none md:py-20">
      <SectionHeader id="lp-deployment-title" intro={section.intro} />

      <div className="mx-auto mt-12 max-w-3xl">
        <p className="mb-8 text-sm text-stone-500">{section.sampleNote}</p>
        <ol ref={railRef} aria-label="Các bước triển khai" className="relative grid gap-10" style={{ '--fill': reduced ? 1 : 0 } as React.CSSProperties}>
          <span aria-hidden="true" className="absolute bottom-3 left-[11px] top-3 w-px bg-cream/12" />
          <span
            aria-hidden="true"
            className="absolute bottom-3 left-[11px] top-3 w-px origin-top bg-cream/70"
            style={{ transform: 'scaleY(var(--fill, 0))' }}
          />
          {section.steps.map((step, index) => {
            const done = index < litCount;
            return (
              <li key={step.title} className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4">
                <span
                  aria-hidden="true"
                  className={cn(
                    'relative z-10 mt-1 grid size-6 place-items-center rounded-full border transition-colors duration-500',
                    done ? 'border-cream bg-cream text-black' : 'border-cream/30 bg-black text-transparent',
                  )}
                >
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <div className={cn('transition-opacity duration-500', done ? 'opacity-100' : 'opacity-50')}>
                  <p className="text-xs tracking-[0.14em] text-stone-500 tabular-nums">{String(index + 1).padStart(2, '0')}</p>
                  <h3 className="mt-1 text-[clamp(22px,2.4vw,30px)] font-normal leading-[1.2] tracking-[-0.02em] text-cream">{step.title}</h3>
                  {step.note && <p className="mt-2 max-w-[52ch] text-base leading-[1.55] text-stone-400">{step.note}</p>}
                  {step.chip && (
                    <span
                      className={cn(
                        'mt-3 inline-flex items-center gap-2 rounded-full border border-[#A7C4A0]/40 px-3 py-1 text-sm text-[#A7C4A0] transition-[opacity,transform] duration-700',
                        done ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
                      )}
                    >
                      {step.chip}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
