import { SECTION_IDS } from '../landing-content';
import { useLandingContent } from '../landing-content-context';
import { ScrollRevealText } from './ScrollRevealText';
import { WordsPullUp } from './WordsPullUp';

function SpecGroup({ label, specs, columns, accent }: { label?: string; specs: { value: string; label: string }[]; columns: string; accent?: boolean }) {
  return (
    <div className="px-2 md:px-6">
      {label && <p className="mb-6 text-xs uppercase tracking-[0.14em] text-stone-500">{label}</p>}
      <ul className={`grid grid-cols-2 gap-x-4 gap-y-8 ${columns}`}>
        {specs.map((spec) => (
          <li key={spec.value}>
            <span className={`block text-[clamp(34px,4vw,52px)] font-light leading-none tracking-[-0.04em] tabular-nums ${accent ? 'font-landing-serif italic text-cream-soft' : 'text-cream'}`}>
              {spec.value}
            </span>
            <span className="mx-auto mt-3 block max-w-[22ch] text-sm leading-[1.45] text-stone-400">{spec.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AboutSection() {
  const { about } = useLandingContent();

  return (
    <section id={SECTION_IDS.about} tabIndex={-1} aria-labelledby="lp-about-title" className="scroll-mt-24 py-2 outline-none">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 rounded-2xl bg-landing-panel px-5 py-[72px] text-center md:gap-10 md:rounded-[2rem] md:px-12 md:py-28">
        <p className="text-[10px] uppercase tracking-[0.16em] text-cream-soft sm:text-xs">{about.label}</p>

        {/* Vietnamese stacked diacritics need more leading than the 0.9 of the Latin reference. */}
        <h2
          id="lp-about-title"
          className="max-w-[50rem] text-balance text-[clamp(30px,5.2vw,72px)] font-normal leading-[1.02] tracking-[-0.03em] text-cream"
        >
          <WordsPullUp segments={about.title} />
        </h2>

        <ScrollRevealText
          text={about.body}
          className="max-w-[44rem] text-pretty text-base font-light leading-[1.7] text-cream-soft sm:text-lg"
        />

        <div className="mt-2 grid w-full max-w-4xl gap-8 border-t border-cream/12 pt-9 md:grid-cols-[3fr_1fr] md:gap-0 md:divide-x md:divide-cream/12">
          <SpecGroup label={about.specsLabel} specs={about.specs} columns="md:grid-cols-3" />
          {about.configured && <SpecGroup label={about.configured.label} specs={about.configured.specs} columns="grid-cols-1" accent />}
        </div>
      </div>
    </section>
  );
}
