import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Wordmark } from '@/components/brand/Wordmark';
import { SECTION_IDS } from '../landing-content';
import { useLandingContent } from '../landing-content-context';
import { useLandingCta } from '../hooks/use-landing-cta';
import { LandingNavLink, SectionLink } from './LandingLinks';

/** Black pill hanging from the top edge of the hero frame. */
export function HangingNav() {
  const { mainNav } = useLandingContent();

  return (
    <nav aria-label="Điều hướng chính" className="lp-pill absolute left-1/2 top-0 z-30 -translate-x-1/2 px-[18px] pb-1.5 pt-1 md:px-8 md:pb-2 md:pt-1.5">
      <ul className="flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-14">
        {mainNav.map((item) => (
          <li key={item.label} className={item.wideOnly ? 'hidden sm:block' : undefined}>
            <LandingNavLink
              item={item}
              className="block whitespace-nowrap py-2.5 text-xs leading-none text-cream/80 transition-colors hover:text-cream md:text-sm"
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface StickyDockProps {
  visible: boolean;
}

/** Glass bar that takes over once the hero has scrolled away, so login and the main action stay at hand. */
export function StickyDock({ visible }: StickyDockProps) {
  const cta = useLandingCta();
  const { dockNav, cta: ctaCopy } = useLandingContent();

  return (
    <nav
      aria-label="Điều hướng nhanh"
      inert={!visible}
      className={cn(
        'lp-glass lp-dock fixed left-1/2 top-[calc(env(safe-area-inset-top,0px)+12px)] z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-5 rounded-full py-1.5 pl-5 pr-1.5 motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-cinematic',
        visible ? 'translate-y-0' : '-translate-y-[calc(100%+28px)]'
      )}
    >
      <SectionLink sectionId={SECTION_IDS.top} className="inline-flex items-center text-cream">
        <Wordmark className="text-sm" />
      </SectionLink>
      <ul className="hidden gap-[22px] min-[900px]:flex">
        {dockNav.map((item) => (
          <li key={item.label}>
            <LandingNavLink item={item} className="whitespace-nowrap text-[13px] text-cream/80 transition-colors hover:text-cream" />
          </li>
        ))}
      </ul>
      <Link to={cta.to} className="whitespace-nowrap rounded-full bg-cream-soft px-4 py-[9px] text-[13px] font-medium text-black">
        {cta.isSignedIn ? 'Vào hệ thống' : ctaCopy.dockLabel}
      </Link>
    </nav>
  );
}
