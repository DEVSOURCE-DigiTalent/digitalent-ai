import { Plus } from 'lucide-react';
import { SECTION_IDS, type LandingSectionConfig } from '../landing-content';
import { SectionHeader } from './SectionHeader';

type FaqSection = Extract<LandingSectionConfig, { kind: 'faq' }>;

/** Questions the product can already answer. Native details/summary: keyboard and screen reader support for free. */
export function FaqSection({ section }: { section: FaqSection }) {
  return (
    <section id={SECTION_IDS.faq} tabIndex={-1} aria-labelledby="lp-faq-title" className="scroll-mt-24 py-14 outline-none md:py-20">
      <SectionHeader id="lp-faq-title" intro={section.intro} />

      <div className="mx-auto mt-12 max-w-3xl space-y-2">
        {section.items.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-cream/10 bg-white/[0.015] px-6 transition-all duration-300 hover:border-amber-400/30 hover:bg-white/[0.03] open:border-amber-400/40 open:bg-white/[0.04] open:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-lg font-medium leading-[1.4] text-cream transition-colors duration-200 group-hover:text-amber-200 marker:hidden [&::-webkit-details-marker]:hidden">
              {item.question}
              <Plus
                className="size-5 shrink-0 text-cream/60 transition-transform duration-300 ease-cinematic group-hover:text-amber-300 group-open:rotate-45 group-open:text-amber-400"
                aria-hidden="true"
              />
            </summary>
            <p className="max-w-[64ch] pb-6 text-base leading-[1.7] text-stone-300/90">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
