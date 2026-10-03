import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SECTION_IDS, type LandingSectionConfig } from '../landing-content';
import { SectionHeader } from './SectionHeader';

type RolesSection = Extract<LandingSectionConfig, { kind: 'roles' }>;

/** The three customer-facing roles, in the order of who decides: Owner first and largest, Manager optional. */
export function RolesSection({ section }: { section: RolesSection }) {
  return (
    <section id={SECTION_IDS.roles} tabIndex={-1} aria-labelledby="lp-roles-title" className="scroll-mt-24 py-14 outline-none md:py-20">
      <SectionHeader id="lp-roles-title" intro={section.intro} />

      <div className="mx-auto mt-12 grid max-w-[90rem] grid-cols-1 gap-3 lg:grid-cols-[minmax(0,9fr)_minmax(0,7fr)]">
        {section.personas.map((persona, index) => (
          <article
            key={persona.role}
            data-size={index === 0 ? 'lead' : 'side'}
            className={cn(
              'group flex flex-col rounded-[20px] p-6 transition-colors duration-500 md:p-8',
              index === 0 ? 'bg-landing-card lg:row-span-2 lg:p-12' : 'bg-landing-panel ring-1 ring-cream/10 hover:ring-cream/30',
            )}
          >
            {persona.badge && <p className="text-[11px] tracking-[0.14em] text-stone-500">{persona.badge}</p>}
            <h3
              className={cn(
                'mt-3 font-normal leading-[1.1] tracking-[-0.02em] text-cream',
                index === 0 ? 'text-[clamp(36px,4.4vw,64px)]' : 'text-[clamp(24px,2.4vw,32px)]',
              )}
            >
              {persona.role}
            </h3>
            <ul className="mt-6 grid gap-3">
              {persona.points.map((point) => (
                <li key={point} className="grid grid-cols-[16px_minmax(0,1fr)] gap-3 text-base leading-[1.5] text-cream/90">
                  <Check className="mt-[3px] size-3.5 text-cream-soft" strokeWidth={2.5} aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
            {persona.note && <p className="mt-auto pt-6 text-base leading-[1.6] text-stone-400">{persona.note}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
