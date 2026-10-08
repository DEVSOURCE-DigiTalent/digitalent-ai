import { useEffect } from 'react';
import '../landing/landing.css';
import { SECTION_IDS, type LandingContent } from '../landing/landing-content';
import { LandingContentProvider, useLandingContent } from '../landing/landing-content-context';
import { ENTERPRISE_CONTENT, INDIVIDUAL_CONTENT } from '../landing/landing-variants';
import { rememberPortalChoice } from '../../portal/portal-preference';
import { useLandingMotion } from '../landing/landing-motion';
import { usePageBackground } from '../landing/hooks/use-page-background';
import { useScrolledPast } from '../landing/hooks/use-scrolled-past';
import { LandingSections } from '../landing/components/LandingSections';
import { HeroSection } from '../landing/components/HeroSection';
import { LandingFooter } from '../landing/components/LandingFooter';
import { SectionLink } from '../landing/components/LandingLinks';
import { LandingMotionProvider } from '../landing/components/LandingMotionProvider';
import { StickyDock } from '../landing/components/LandingNav';
import { LandingAudioControl } from '../landing/components/LandingAudioControl';
import { cn } from '@/lib/utils';

interface LandingPageProps {
  /** Copy of the product shown; the enterprise one unless told otherwise. */
  content?: LandingContent;
}

/**
 * Landing page of one product: hero, Circular 02/2025 framework, capabilities, closing call to action.
 * Rendered outside PublicLayout because it brings its own navigation and footer. Visiting it also
 * remembers the choice, so the portal selector at "/" is asked only once.
 */
export function LandingPage({ content = ENTERPRISE_CONTENT }: LandingPageProps) {
  const isIndividual = content.variant === 'individual';
  usePageBackground(isIndividual ? '#07151b' : '#0C0E12');

  useEffect(() => {
    rememberPortalChoice(content.variant);
  }, [content.variant]);

  return (
    <LandingContentProvider content={content}>
      <LandingMotionProvider>
        <LandingShell />
      </LandingMotionProvider>
    </LandingContentProvider>
  );
}

/** PUB-02, "/business". */
export function EnterpriseLandingPage() {
  return <LandingPage content={ENTERPRISE_CONTENT} />;
}

/** PUB-03, "/individual". */
export function IndividualLandingPage() {
  return <LandingPage content={INDIVIDUAL_CONTENT} />;
}

function LandingShell() {
  const { reduced } = useLandingMotion();
  const content = useLandingContent();
  const [heroMetaRef, scrolledPastHero] = useScrolledPast<HTMLDivElement>();
  const isIndividual = content.variant === 'individual';

  return (
    <div
      data-testid="landing-page"
      lang="vi"
      data-motion={reduced ? 'off' : 'on'}
      data-variant={content.variant}
      data-individual-theme={isIndividual ? 'dark' : undefined}
      className={cn(
        'landing min-h-screen overflow-x-clip px-4 font-landing antialiased md:px-6',
        isIndividual ? 'bg-[#07151b] text-[#f2f7f5]' : 'bg-[#0C0E12] text-cream'
      )}
    >
      <SectionLink
        sectionId={SECTION_IDS.main}
        className={cn(
          'fixed -top-16 left-4 z-[100] rounded-full px-4 py-2.5 text-sm transition-[top] focus:top-3',
          'bg-gradient-to-r from-[#F5CA65] to-[#D4982F] text-[#0C0E12] font-semibold shadow-md shadow-amber-500/20'
        )}
      >
        Bỏ qua đến nội dung
      </SectionLink>
      <StickyDock visible={scrolledPastHero} />
      <LandingAudioControl />

      <HeroSection metaRef={heroMetaRef} />
      <main id={SECTION_IDS.main} tabIndex={-1} className="outline-none">
        <LandingSections sections={content.sections} />
      </main>
      <LandingFooter />
    </div>
  );
}
