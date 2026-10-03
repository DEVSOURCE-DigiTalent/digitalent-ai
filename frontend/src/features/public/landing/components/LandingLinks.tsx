import type { MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LandingLink } from '../landing-content';
import { useLandingMotion } from '../landing-motion';

interface SectionLinkProps {
  sectionId: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}

/** In-page link: scrolls to the section (smoothly unless motion is reduced) and moves focus to it. */
export function SectionLink({ sectionId, className, ariaLabel, children }: SectionLinkProps) {
  const { reduced } = useLandingMotion();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(sectionId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    target.focus({ preventScroll: true });
  };

  return (
    <a href={`#${sectionId}`} onClick={handleClick} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  );
}

interface LandingNavLinkProps {
  item: LandingLink;
  className?: string;
}

export function LandingNavLink({ item, className }: LandingNavLinkProps) {
  const label = item.shortLabel ? (
    <>
      <span className="hidden sm:inline">{item.label}</span>
      <span className="sm:hidden">{item.shortLabel}</span>
    </>
  ) : (
    item.label
  );

  if (item.kind === 'section') {
    return (
      <SectionLink sectionId={item.to} className={className} ariaLabel={item.shortLabel ? item.label : undefined}>
        {label}
      </SectionLink>
    );
  }
  return (
    <Link to={item.to} className={className} aria-label={item.shortLabel ? item.label : undefined}>
      {label}
    </Link>
  );
}
