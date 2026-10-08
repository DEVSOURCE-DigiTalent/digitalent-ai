import { cn } from '@/lib/utils';
import { SECTION_IDS } from '../landing-content';
import { useLandingContent } from '../landing-content-context';
import { ScrollRevealText } from './ScrollRevealText';
import { WordsPullUp } from './WordsPullUp';
import { LP_KICKER, LP_LABEL, LP_TITLE } from '../landing-type';

function SpecGroup({
  label,
  specs,
  columns,
  accent,
}: {
  label?: string;
  specs: { value: string; label: string }[];
  columns: string;
  accent?: boolean;
}) {
  return (
    <div className="px-2 md:px-6">
      {label && <p className={cn('mb-6', LP_KICKER)}>{label}</p>}
      <ul className={cn('grid gap-x-4 gap-y-8', columns)}>
        {specs.map((spec) => (
          <li key={spec.value}>
            <span
              className={cn(
                'lp-num block whitespace-nowrap text-[clamp(32px,3.8vw,52px)] font-normal leading-none tracking-[-0.04em] tabular-nums',
                accent
                  ? 'font-landing-serif italic bg-gradient-to-br from-[#FFF6E2] via-[#F5CA65] to-[#D4982F] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(245,202,101,0.25)]'
                  : 'bg-gradient-to-br from-[#F5CA65] via-[#E5A93C] to-[#D4982F] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(245,202,101,0.25)]'
              )}
            >
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
  const hasConfigured = Boolean(about.configured);

  return (
    <section id={SECTION_IDS.about} tabIndex={-1} aria-labelledby="lp-about-title" className="scroll-mt-24 py-14 outline-none md:py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 rounded-2xl bg-landing-panel px-5 py-[72px] text-center md:gap-10 md:rounded-[2rem] md:px-12 md:py-28">
        <p className={cn(LP_LABEL, '!border-amber-400/35 !text-[#F5CA65] !bg-amber-500/10 shadow-[0_0_14px_rgba(245,202,101,0.12)]')}>
          {about.label}
        </p>

        {/* Vietnamese stacked diacritics need more leading than the 0.9 of the Latin reference. */}
        <h2
          id="lp-about-title"
          className={cn('max-w-[50rem]', LP_TITLE)}
        >
          <WordsPullUp segments={about.title} />
        </h2>

        <ScrollRevealText
          text={about.body}
          className="max-w-[44rem] text-pretty text-base font-light leading-[1.7] text-cream-soft sm:text-lg"
        />

        <div
          className={cn(
            'mt-2 grid w-full max-w-5xl border-t border-cream/12 pt-9',
            hasConfigured
              ? 'gap-8 md:grid-cols-[3fr_1.35fr] md:gap-0 md:divide-x md:divide-cream/12'
              : 'grid-cols-1'
          )}
        >
          <SpecGroup
            label={about.specsLabel}
            specs={about.specs}
            columns={hasConfigured ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}
          />
          {about.configured && (
            <SpecGroup
              label={about.configured.label}
              specs={about.configured.specs}
              columns="grid-cols-1"
              accent
            />
          )}
        </div>
      </div>
    </section>
  );
}
