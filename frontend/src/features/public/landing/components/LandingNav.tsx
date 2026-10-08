import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Wordmark } from '@/components/brand/Wordmark';
import { SECTION_IDS } from '../landing-content';
import { useLandingContent } from '../landing-content-context';
import { useLandingCta } from '../hooks/use-landing-cta';
import { LandingNavLink, SectionLink } from './LandingLinks';
import type { LandingLink } from '../landing-content';

/** Shared hover class: gradient underline sliding in from left. */
const NAV_LINK_HOVER_CLASS =
  'relative whitespace-nowrap text-cream/75 transition-colors duration-200 hover:text-cream' +
  ' after:absolute after:bottom-[-3px] after:left-0 after:h-[1.5px] after:w-0 after:rounded-full' +
  ' after:bg-gradient-to-r after:from-[#F5CA65] after:to-[#79E0C2]' +
  ' after:transition-[width] after:duration-300 after:ease-out hover:after:w-full';

/**
 * Ghost pill style used for the Đăng nhập link, clearly different from plain nav links. The hover takes the product's
 * colour: gold on the business page, mint on the individual one.
 */
const LOGIN_LINK_CLASS =
  'group inline-flex items-center gap-1.5 rounded-full border border-cream/25 px-3 py-1 whitespace-nowrap' +
  ' text-cream/80 transition-all duration-250 hover:border-[#79E0C2]/60 hover:text-[#79E0C2] hover:bg-[#79E0C2]/8' +
  ' [[data-variant=enterprise]_&]:hover:border-[#F5CA65]/60 [[data-variant=enterprise]_&]:hover:text-[#F5CA65]' +
  ' [[data-variant=enterprise]_&]:hover:bg-[#F5CA65]/8';

/** Black pill hanging from the top edge of the hero frame. */
export function HangingNav() {
  const { mainNav } = useLandingContent();
  const cta = useLandingCta();

  const navLinks = mainNav.filter((item) => !item.to.endsWith('/login'));
  const loginItem = mainNav.find((item) => item.to.endsWith('/login'));

  return (
    <nav aria-label="Điều hướng chính" className="lp-pill absolute left-1/2 top-0 z-30 -translate-x-1/2 px-[18px] pb-1.5 pt-1 md:px-8 md:pb-2 md:pt-1.5">
      <ul className="flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-14">
        {navLinks.map((item) => (
          <li key={item.label} className={item.wideOnly ? 'hidden sm:block' : undefined}>
            <LandingNavLink
              item={item}
              className={`block py-2.5 text-xs leading-none md:text-sm ${NAV_LINK_HOVER_CLASS}`}
            />
          </li>
        ))}
        {!cta.isSignedIn && loginItem && (
          <li className="sm:block">
            <LoginPill item={loginItem} sizeClass="text-xs md:text-sm py-[5px]" />
          </li>
        )}
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

  const dockNavLinks = dockNav.filter((item) => !item.to.endsWith('/login'));
  const dockLoginItem = dockNav.find((item) => item.to.endsWith('/login'));

  return (
    <nav
      aria-label="Điều hướng nhanh"
      inert={!visible}
      className={cn(
        'lp-glass lp-dock fixed left-1/2 top-[calc(env(safe-area-inset-top,0px)+12px)] z-50 flex w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-2 rounded-full py-1.5 pl-3 pr-1.5 sm:gap-3 sm:pl-5 motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-cinematic',
        visible ? 'translate-y-0' : '-translate-y-[calc(100%+28px)]'
      )}
    >
      <SectionLink sectionId={SECTION_IDS.top} className="inline-flex items-center text-cream shrink-0">
        {/* Phones keep only the emblem so the login pill and the call to action fit inside the bar. */}
        <Wordmark markOnly className="text-sm sm:hidden" />
        <Wordmark className="hidden text-sm sm:inline-flex" />
      </SectionLink>
      <ul className="hidden gap-5 min-[900px]:flex">
        {dockNavLinks.map((item) => (
          <li key={item.label}>
            <LandingNavLink
              item={item}
              className={`text-[13px] ${NAV_LINK_HOVER_CLASS}`}
            />
          </li>
        ))}
      </ul>
      {/* Spacer pushes login + CTA to the right */}
      <div className="flex-1" />
      {!cta.isSignedIn && dockLoginItem && (
        <LoginPill item={dockLoginItem} sizeClass="text-[13px] py-[7px]" iconClass="hidden sm:block" />
      )}
      <Link
        to={cta.to}
        className="shrink-0 whitespace-nowrap rounded-full bg-cream-soft px-4 py-[9px] text-[13px] font-medium text-black transition-all duration-250 hover:scale-[1.03] hover:brightness-105"
      >
        {cta.isSignedIn ? 'Vào hệ thống' : ctaCopy.dockLabel}
      </Link>
    </nav>
  );
}

/** Ghost pill for the login link: visually sits between plain nav text and the solid CTA button. */
function LoginPill({ item, sizeClass, iconClass }: { item: LandingLink; sizeClass?: string; iconClass?: string }) {
  return (
    <Link
      to={item.to}
      className={`${LOGIN_LINK_CLASS} ${sizeClass ?? ''}`}
    >
      <LogIn
        className={cn('size-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5', iconClass)}
        aria-hidden="true"
      />
      <span className="font-medium">{item.label}</span>
    </Link>
  );
}
