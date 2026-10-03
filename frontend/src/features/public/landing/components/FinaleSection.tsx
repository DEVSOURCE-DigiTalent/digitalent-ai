import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { SECTION_IDS } from '../landing-content';
import { useLandingContent } from '../landing-content-context';
import { useInView } from '../hooks/use-in-view';
import { useLandingCta } from '../hooks/use-landing-cta';
import { BackgroundStage } from './BackgroundStage';

const delay = (seconds: number) => ({ '--lp-delay': `${seconds}s` }) as CSSProperties;
const SMALL_LINK = 'text-cream/80 underline-offset-4 transition-colors hover:text-cream hover:underline';

export function FinaleSection() {
  const cta = useLandingCta();
  const { finale: FINALE, cta: ctaCopy, media } = useLandingContent();
  const [contentRef, inView] = useInView<HTMLDivElement>({ rootMargin: '0px 0px -100px 0px' });

  return (
    <section id={SECTION_IDS.finale} tabIndex={-1} aria-labelledby="lp-finale-title" className="scroll-mt-24 pb-4 pt-2 outline-none md:pb-6">
      <div className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden rounded-2xl bg-[#04101a] md:rounded-[2rem]">
        <BackgroundStage scene="dusk" seed={5} video={media.finale} />
        <div className="lp-finale-scrim pointer-events-none absolute inset-0" aria-hidden="true" />

        <div ref={contentRef} data-in={inView || undefined} className="relative z-10 flex flex-col items-center px-6 py-24 text-center">
          <h2
            id="lp-finale-title"
            className="lp-reveal-up max-w-[62rem] text-balance font-landing-serif text-[clamp(44px,7.4vw,104px)] font-normal leading-[1.02] tracking-[-0.03em] text-cream"
          >
            {FINALE.lead} <em className="not-italic text-cream/50">{FINALE.leadMuted}</em> {FINALE.tail}{' '}
            <em className="not-italic text-cream/50">{FINALE.tailMuted}</em>
          </h2>
          <p className="lp-reveal-up mt-8 max-w-[44rem] text-pretty text-lg leading-[1.65] text-stone-400 sm:text-xl" style={delay(0.2)}>
            {cta.isSignedIn ? FINALE.memberBody : FINALE.guestBody}
          </p>
          <div className="lp-reveal-up mt-12" style={delay(0.4)}>
            <Link
              to={cta.to}
              className="lp-glass inline-block rounded-full px-16 py-6 text-lg text-cream transition-transform duration-300 ease-cinematic motion-safe:hover:scale-[1.03]"
            >
              {cta.isSignedIn ? 'Vào hệ thống' : ctaCopy.finaleLabel}
            </Link>
          </div>
          <p className="lp-reveal-up mt-7 flex flex-wrap justify-center gap-x-3.5 gap-y-2 text-sm text-stone-400" style={delay(0.55)}>
            {!cta.isSignedIn && (
              <span>
                Đã có tài khoản? <Link to={ctaCopy.loginPath} className={SMALL_LINK}>Đăng nhập</Link>
              </span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
