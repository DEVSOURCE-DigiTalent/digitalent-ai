import type { LandingSectionConfig } from '../landing-content';
import { SectionLink } from './LandingLinks';

type PillarsSection = Extract<LandingSectionConfig, { kind: 'pillars' }>;

/** A slim index of the product: three numbered links to the deep-dives further down. */
export function PillarsSection({ section }: { section: PillarsSection }) {
  return (
    <nav aria-label={section.label} className="py-6">
      <ol className="mx-auto grid max-w-5xl border-y border-amber-400/15 md:grid-cols-3 md:divide-x md:divide-amber-400/15">
        {section.items.map((item, index) => (
          <li key={item.to}>
            <SectionLink
              sectionId={item.to}
              className="group flex items-baseline gap-4 px-2 py-5 text-cream/80 transition-colors hover:text-cream md:px-6"
            >
              <span aria-hidden="true" className="font-landing-serif text-2xl italic text-[#E8C67C]/70 tabular-nums transition-colors group-hover:text-[#F5CA65]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-sm leading-[1.4] sm:text-base">{item.label}</span>
              <span aria-hidden="true" className="ml-auto text-cream/40 transition-[color,transform] duration-300 ease-cinematic group-hover:text-[#F5CA65] motion-safe:group-hover:translate-y-0.5">
                ↓
              </span>
            </SectionLink>
          </li>
        ))}
      </ol>
    </nav>
  );
}
