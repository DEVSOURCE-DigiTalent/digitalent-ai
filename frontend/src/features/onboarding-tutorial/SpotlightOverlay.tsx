import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Lightbulb, MapPin, X } from 'lucide-react';
import { useOnboardingStore } from './onboarding-store';
import { TUTORIAL_CONFIGS } from './tutorial-configs';
import { findTarget, placeCard } from './placement';
import type { RoleTutorialConfig, RoleTutorialStep } from './types';

/** Room around the lit-up element. */
const SPOT_PAD = 8;
/** First guess of the card size, replaced by the measured one after the first paint. */
const CARD_GUESS = { width: 368, height: 260 };

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const pathOf = (route: string) => route.split(/[?#]/)[0];

function useViewport() {
  const [view, setView] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));
  useEffect(() => {
    const onResize = () => setView({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return view;
}

/** The lit-up element's box, followed through scrolling, resizing and late rendering (lazy pages, the menu). */
function useTargetRect(step: RoleTutorialStep | undefined) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useLayoutEffect(() => {
    if (!step) {
      setRect(null);
      return;
    }
    const view = () => ({ width: window.innerWidth, height: window.innerHeight });
    const measure = () => {
      const element = findTarget(step.targetSelector, view());
      setRect(element ? element.getBoundingClientRect() : null);
    };
    findTarget(step.targetSelector, view())?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' });
    measure();
    const timers = [120, 360, 700, 1200].map((ms) => window.setTimeout(measure, ms));
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [step]);
  return rect;
}

export function SpotlightOverlay() {
  useUiLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { isTourActive, isIntro, currentRole, currentStepIndex, beginSteps, nextStep, prevStep, goToStep, skipTour } = useOnboardingStore();
  const config = currentRole ? TUTORIAL_CONFIGS[currentRole] : null;
  const showIntro = Boolean(isTourActive && isIntro && config?.intro);
  const step = isTourActive && !showIntro ? config?.steps[currentStepIndex] : undefined;
  const view = useViewport();
  const rect = useTargetRect(step);
  const cardRef = useRef<HTMLElement>(null);
  const [cardSize, setCardSize] = useState(CARD_GUESS);
  const titleId = useId();
  const textId = useId();

  // Esc closes, arrows move between steps.
  useEffect(() => {
    if (!isTourActive) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') skipTour();
      if (event.key === 'ArrowRight') nextStep();
      if (event.key === 'ArrowLeft') prevStep();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isTourActive, nextStep, prevStep, skipTour]);

  // Each step takes the focus, so a screen reader reads it and Tab stays in the card.
  useEffect(() => {
    if (isTourActive) cardRef.current?.focus({ preventScroll: true });
  }, [isTourActive, showIntro, currentStepIndex]);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card || !step) return;
    const next = { width: card.offsetWidth, height: card.offsetHeight };
    setCardSize((size) => (size.width === next.width && size.height === next.height ? size : next));
  }, [step, view, rect]);

  if (!isTourActive || !config) return null;
  if (showIntro) return <IntroCard config={config} cardRef={cardRef} titleId={titleId} onBegin={beginSteps} onSkip={skipTour} />;
  if (!step) return null;

  const steps = config.steps;
  const total = steps.length;
  const journey = steps.filter((s) => s.kind !== 'tip');
  const number = journey.indexOf(step) + 1;
  const last = currentStepIndex === total - 1;
  const Icon = step.icon ?? MapPin;

  const spot = rect && {
    top: Math.max(0, rect.top - SPOT_PAD),
    left: Math.max(0, rect.left - SPOT_PAD),
    width: rect.width + SPOT_PAD * 2,
    height: rect.height + SPOT_PAD * 2,
  };
  const place = placeCard(spot, cardSize, view, step.targetPosition ?? 'bottom');
  const showLink = Boolean(step.actionRoute && pathOf(step.actionRoute) !== location.pathname);

  return (
    <>
      <div className="ob-spotlight-backdrop" aria-hidden="true">
        <svg className="ob-spotlight-svg" width={view.width} height={view.height} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="ob-spotlight-mask">
              <rect x="0" y="0" width={view.width} height={view.height} fill="white" />
              {spot && <rect x={spot.left} y={spot.top} width={spot.width} height={spot.height} rx="14" ry="14" fill="black" />}
            </mask>
          </defs>
          <rect x="0" y="0" width={view.width} height={view.height} className="ob-spotlight-dim" mask="url(#ob-spotlight-mask)" />
        </svg>
        {spot && <div className="ob-spotlight-ring" style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }} />}
      </div>

      <aside
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={textId}
        tabIndex={-1}
        className="ob-card"
        data-side={place.side}
        style={{ top: place.top, left: place.left, '--ob-caret': `${place.caret}px` } as CSSProperties}
      >
        {place.side !== 'center' && <span className="ob-card__caret" aria-hidden="true" />}
        <header className="ob-card__head">
          <span className="ob-card__icon" aria-hidden="true"><Icon size={18} /></span>
          <span className="ob-card__where">
            <small>
              {step.kind === 'tip' ? translateUi('Mẹo') : translateUi(`Bước ${number}/${journey.length}`)}
              {step.optional && <em>{translateUi('Không bắt buộc')}</em>}
            </small>
            <span>{translateUi(step.badge)}</span>
          </span>
          <button type="button" onClick={skipTour} className="ob-close" aria-label={translateUi('Đóng hướng dẫn (Esc)')} title={translateUi('Đóng hướng dẫn (Esc)')}>
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <h3 id={titleId} className="ob-card__title">{translateUi(step.title)}</h3>
        <p id={textId} className="ob-card__text">{translateUi(step.description)}</p>
        {step.tips && (
          <p className="ob-card__tip"><Lightbulb size={14} aria-hidden="true" />{translateUi(step.tips)}</p>
        )}
        {showLink && (
          <button type="button" className="ob-card__link" onClick={() => navigate(step.actionRoute!)}>
            {translateUi(step.actionText ?? 'Mở trang')}<ArrowRight size={14} aria-hidden="true" />
          </button>
        )}

        <footer className="ob-card__foot">
          <ol className="ob-progress" aria-label={translateUi('Các bước hướng dẫn')}>
            {steps.map((s, index) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  data-state={index === currentStepIndex ? 'current' : index < currentStepIndex ? 'done' : 'todo'}
                  aria-current={index === currentStepIndex ? 'step' : undefined}
                  aria-label={translateUi(s.title)}
                />
              </li>
            ))}
          </ol>
          <div className="ob-card__actions">
            {currentStepIndex === 0 && !config.intro ? (
              <button type="button" onClick={skipTour} className="ob-btn ob-btn--ghost">{translateUi('Bỏ qua')}</button>
            ) : (
              <button type="button" onClick={prevStep} className="ob-btn ob-btn--ghost">
                <ArrowLeft size={14} aria-hidden="true" />{translateUi('Quay lại')}
              </button>
            )}
            <button type="button" onClick={nextStep} className="ob-btn ob-btn--primary">
              {last ? <><Check size={14} aria-hidden="true" />{translateUi('Xong')}</> : <>{translateUi('Tiếp')}<ArrowRight size={14} aria-hidden="true" /></>}
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}

/** The whole journey at a glance before the first step: what to do, in order, and where. */
function IntroCard({ config, cardRef, titleId, onBegin, onSkip }: {
  config: RoleTutorialConfig;
  cardRef: React.RefObject<HTMLElement | null>;
  titleId: string;
  onBegin: () => void;
  onSkip: () => void;
}) {
  useUiLanguage();
  const journey = config.steps.filter((s) => s.kind !== 'tip');
  return (
    <>
      <div className="ob-intro-backdrop" aria-hidden="true" />
      <section ref={cardRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="ob-intro">
        <button type="button" onClick={onSkip} className="ob-close ob-intro__close" aria-label={translateUi('Đóng hướng dẫn (Esc)')}>
          <X size={16} aria-hidden="true" />
        </button>
        <p className="ob-intro__eyebrow">{translateUi(config.intro!.eyebrow)}</p>
        <h2 id={titleId} className="ob-intro__title">{translateUi(config.welcomeTitle)}</h2>
        <p className="ob-intro__lead">{translateUi(config.welcomeDescription)}</p>
        <ol className="ob-intro__path">
          {journey.map((step, index) => {
            const Icon = step.icon ?? MapPin;
            return (
              <li key={step.id} data-optional={step.optional || undefined}>
                <span className="ob-intro__num" aria-hidden="true">{index + 1}</span>
                <span className="ob-intro__step">
                  <strong>{translateUi(step.title)}</strong>
                  <small>
                    <Icon size={13} aria-hidden="true" />{translateUi(step.badge)}
                    {step.optional && <em>{translateUi('Không bắt buộc')}</em>}
                  </small>
                </span>
              </li>
            );
          })}
        </ol>
        <footer className="ob-intro__foot">
          <button type="button" onClick={onSkip} className="ob-btn ob-btn--ghost">{translateUi('Để sau')}</button>
          <button type="button" onClick={onBegin} className="ob-btn ob-btn--primary">
            {translateUi('Xem từng bước')}<ArrowRight size={14} aria-hidden="true" />
          </button>
        </footer>
      </section>
    </>
  );
}
