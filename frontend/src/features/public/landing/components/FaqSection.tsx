import { Plus } from 'lucide-react';
import { SECTION_IDS, type LandingSectionConfig } from '../landing-content';
import { SectionHeader } from './SectionHeader';

type FaqSection = Extract<LandingSectionConfig, { kind: 'faq' }>;

/** Questions the product can already answer. Native details/summary: keyboard and screen reader support for free. */
export function FaqSection({ section }: { section: FaqSection }) {
  return (
    <section id={SECTION_IDS.faq} tabIndex={-1} aria-labelledby="lp-faq-title" className="scroll-mt-24 py-14 outline-none md:py-20">
      <SectionHeader id="lp-faq-title" intro={section.intro} />

      <div className="mx-auto mt-12 max-w-3xl border-t border-cream/12">
        {section.items.map((item) => (
          <details key={item.question} className="group border-b border-cream/12">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-lg leading-[1.4] text-cream marker:hidden [&::-webkit-details-marker]:hidden">
              {item.question}
              <Plus className="size-4 shrink-0 text-cream/70 transition-transform duration-200 ease-out group-open:rotate-45" aria-hidden="true" />
            </summary>
            <p className="max-w-[62ch] pb-6 text-base leading-[1.7] text-stone-400">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
