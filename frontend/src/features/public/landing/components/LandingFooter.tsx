import { useLandingContent } from '../landing-content-context';
import { LandingNavLink } from './LandingLinks';

export function LandingFooter() {
  const { footerGroups, footerText } = useLandingContent();

  return (
    <footer className="mx-auto grid max-w-[90rem] grid-cols-1 gap-8 pb-10 pt-8 text-sm leading-[1.6] text-stone-400 md:grid-cols-[2fr_1fr_1fr]">
      <div>
        <p className="mb-3 text-[22px] font-medium tracking-[-0.05em] text-cream">
          DigiTalent<sup className="ml-[3px] text-[0.5em] tracking-normal">AI</sup>
        </p>
        <p className="max-w-[44ch]">{footerText.about}</p>
      </div>

      {footerGroups.map((group) => (
        <nav key={group.title} aria-label={group.title}>
          <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-stone-500">{group.title}</p>
          <ul className="grid gap-2">
            {group.links.map((item) => (
              <li key={item.label}>
                <LandingNavLink item={item} className="text-cream/80 transition-colors hover:text-cream" />
              </li>
            ))}
          </ul>
        </nav>
      ))}

      <div className="col-span-full flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-cream/12 pt-5 text-xs">
        <span>© {new Date().getFullYear()} DigiTalent AI</span>
        <span>{footerText.basis}</span>
      </div>
    </footer>
  );
}
