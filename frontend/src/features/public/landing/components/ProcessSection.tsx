import { SECTION_IDS, type LandingSectionConfig } from '../landing-content';
import { SectionHeader } from './SectionHeader';

type ProcessSection = Extract<LandingSectionConfig, { kind: 'process' }>;

/** The learner's journey as a numbered sequence: the order is the information. */
export function ProcessSection({ section }: { section: ProcessSection }) {
  return (
    <section id={SECTION_IDS.process} tabIndex={-1} aria-labelledby="lp-process-title" className="scroll-mt-24 py-14 outline-none md:py-20">
      <SectionHeader id="lp-process-title" intro={section.intro} />

      <ol className="mx-auto mt-14 grid max-w-6xl gap-x-10 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
        {section.steps.map((step, index) => (
          <li key={step.title} className="border-t border-cream/12 pt-6">
            <span aria-hidden="true" className="font-landing-serif text-[44px] italic leading-none tracking-[-0.02em] text-cream/35 tabular-nums">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-4 text-xl font-normal leading-[1.25] tracking-[-0.015em] text-cream">{step.title}</h3>
            <p className="mt-2 max-w-[34ch] text-sm leading-[1.6] text-stone-400">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
