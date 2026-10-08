import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wordmark } from '@/components/brand/Wordmark';
import { usePageBackground } from '../../public/landing/hooks/use-page-background';
import { LOGIN_COPY, LOGIN_PATH, type LoginPortal } from '../login-copy';
import { PERSONAL_PUBLIC_BACKGROUND, PERSONAL_THEME_BACKGROUND, usePersonalTheme } from '@/features/learner/theme/use-personal-theme';
import { ThemeToggle } from '@/features/learner/components/ThemeToggle';
import { getPortalChoice } from '@/features/portal/portal-preference';
import { NEUTRAL_CANVAS, NEUTRAL_ROOT_CLASS } from '@/features/public/neutral-canvas';
import { cn } from '@/lib/utils';
import '@/features/learner/theme/personal-theme.css';

export interface AuthShellProps {
  portal?: LoginPortal;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Small label above the title (product the visitor is signing in to). */
  eyebrow?: ReactNode;
  footerLink?: ReactNode;
  /** Rendered between the subtitle and the form (audience switch on the sign-up page). */
  headerSlot?: ReactNode;
  /** Custom right panel on desktop; defaults to AuthPicture when not provided. */
  rightSlot?: ReactNode;
  showLogo?: boolean;
  children: ReactNode;
}

interface ShellLook {
  pageBackground: string;
  page: string;
  wordmark: string;
  navLink: string;
  cta: string;
  card: string;
  fade: string;
  /** Fades the phone/tablet banner into the card colour. */
  bannerFade: string;
  glass: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  divider: string;
  footer: string;
  /** Full-width header band with a neutral hairline. */
  headerBar: string;
  /** Rim light on the left and bottom edges of the card, in the product colour. */
  cardGlow: string;
  /** Outline pill for the secondary header action ("Đăng nhập" on the sign-up pages). */
  outlineCta: string;
}

const GOLD_CTA =
  'bg-gradient-to-r from-[#F5CA65] to-[#D4982F] text-[#0C0E12] font-semibold shadow-md shadow-amber-500/20 hover:brightness-105 transition-all';
const TEAL_FADE =
  'bg-[linear-gradient(to_right,#07151b_0%,rgba(7,21,27,0.92)_28%,rgba(7,21,27,0.72)_45%,rgba(7,21,27,0.35)_62%,rgba(7,21,27,0.08)_78%,transparent_90%)]';

/**
 * Looks of the frame. Each sign-up page keeps its product colours; the shared login page ('default') sits on the
 * individual's deep teal canvas and wears the enterprise gold frame and buttons, so neither audience feels a guest.
 */
const LOOKS: Record<LoginPortal, ShellLook> = {
  default: {
    pageBackground: '#07151b',
    page: 'bg-[#07151b] text-cream',
    wordmark: 'text-cream',
    navLink: 'text-cream/75 hover:text-cream',
    cta: GOLD_CTA,
    card: 'bg-[#07151b]',
    fade: TEAL_FADE,
    bannerFade: 'from-[#07151b]',
    glass: 'from-[#0b2027]/75 via-[#0b2027]/35',
    eyebrow: 'text-cream-soft/70',
    title: 'text-cream',
    subtitle: 'text-[#c2d3d1]',
    divider: 'border-amber-400/15',
    footer: 'text-[#93aaa8]',
    // Replaced by the theme-aware neutral canvas on the login page.
    headerBar: NEUTRAL_CANVAS.dark.headerBar,
    cardGlow: NEUTRAL_CANVAS.dark.cardGlow,
    outlineCta: NEUTRAL_CANVAS.dark.outlineCta,
  },
  enterprise: {
    pageBackground: '#0C0E12',
    page: 'bg-[#0C0E12] text-cream',
    wordmark: 'text-cream',
    navLink: 'text-cream/75 hover:text-cream',
    cta: GOLD_CTA,
    card: 'bg-[#0C0E12]',
    fade: 'bg-[linear-gradient(to_right,#0C0E12_0%,rgba(12,14,18,0.94)_28%,rgba(12,14,18,0.75)_45%,rgba(12,14,18,0.38)_62%,rgba(12,14,18,0.1)_78%,transparent_90%)]',
    bannerFade: 'from-[#0C0E12]',
    glass: 'from-[#11151E]/80 via-[#11151E]/40',
    eyebrow: 'text-cream-soft/70',
    title: 'text-cream',
    subtitle: 'text-stone-400',
    divider: 'border-cream/10',
    footer: 'text-stone-400',
    headerBar: 'bg-[#11151E] border-b border-white/[0.06]',
    cardGlow: NEUTRAL_CANVAS.dark.cardGlow,
    outlineCta: NEUTRAL_CANVAS.dark.outlineCta,
  },
  individual: {
    pageBackground: PERSONAL_THEME_BACKGROUND.dark,
    page: 'personal-theme pt-soft bg-pt-bg text-pt-fg',
    wordmark: '[--wordmark-on:var(--pt-bg)]',
    navLink: 'text-pt-fg-2 hover:text-pt-fg',
    cta: 'bg-pt-accent text-pt-on-accent',
    card: 'bg-[#07151b]',
    fade: TEAL_FADE,
    bannerFade: 'from-[#07151b]',
    glass: 'from-[#0b2027]/75 via-[#0b2027]/35',
    eyebrow: 'text-pt-fg-3',
    title: 'text-pt-fg',
    subtitle: 'text-pt-fg-2',
    divider: 'border-pt-line',
    footer: 'text-pt-fg-3',
    headerBar: 'bg-pt-panel border-b border-pt-line',
    cardGlow:
      'border-white/5 border-l-[#79e0c2]/45 border-b-[#79e0c2]/45 shadow-[-14px_16px_44px_-14px_rgba(121,224,194,0.35),-2px_2px_0_0_rgba(121,224,194,0.1),0_30px_80px_-30px_rgba(0,0,0,0.85)]',
    outlineCta: 'border-pt-accent/50 text-pt-accent hover:border-pt-accent hover:bg-pt-accent/10',
  },
};

/**
 * The login page follows the light/dark choice for its canvas (header, page, footer); the card itself stays dark,
 * a picture with the form on dark glass lifted off the page by a gold rim light (shared with the portal selector).
 */
const LOGIN_CANVAS = NEUTRAL_CANVAS;

/** The login page serves both products, so "Bảng giá" follows the product the visitor last chose. */
function loginPricingPath(): string {
  return getPortalChoice() === 'individual' ? '/individual/pricing' : '/business/pricing';
}

/**
 * Frame of the sign-in and sign-up pages: the public header (wordmark, pricing, one call to action), the form on the
 * left and the picture with the product's line on the right. Below lg the picture is dropped and the form stands
 * alone, so nothing is hidden behind a frame on a phone.
 * The individual sign-up and the login page follow the light/dark choice (shared with the personal workspace).
 */
export function AuthShell({ portal = 'default', title, subtitle, eyebrow, footerLink, headerSlot, rightSlot, showLogo = true, children }: AuthShellProps) {
  const isIndividual = portal === 'individual';
  const isLogin = portal === 'default';
  const theme = usePersonalTheme((s) => s.theme);
  const look = isLogin ? { ...LOOKS.default, ...LOGIN_CANVAS[theme] } : LOOKS[portal];
  usePageBackground(isIndividual ? PERSONAL_PUBLIC_BACKGROUND[theme] : look.pageBackground);
  const copy = LOGIN_COPY[portal];
  const pricingPath = copy.pricingPath ?? (isLogin ? loginPricingPath() : undefined);
  const { pathname } = useLocation();
  const onRegister = pathname.endsWith('/register');

  return (
    <div
      lang="vi"
      data-portal={portal}
      data-theme={isIndividual || isLogin ? theme : undefined}
      data-individual-theme={isIndividual ? theme : undefined}
      className={cn(
        'flex min-h-dvh flex-col font-landing antialiased selection:bg-cream/25 transition-colors duration-300',
        // The login page borrows the personal tokens only for the theme switch, tinted gold like its buttons.
        isLogin && NEUTRAL_ROOT_CLASS,
        look.page
      )}
    >
      {/* The band spans the screen; its content stays inside the same 6xl column as the card. */}
      <header className={cn('w-full transition-colors duration-300', look.headerBar)}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 md:px-8 cramped:py-2.5 tiny:py-1.5">
          <Link to={copy.homePath} aria-label="DigiTalent AI, về trang chủ" className="text-lg">
            {/* Phones under 360px keep only the emblem so the theme switch and the call to action fit on one line. */}
            <Wordmark markOnly className={cn('min-[360px]:hidden', look.wordmark)} />
            <Wordmark className={cn('hidden min-[360px]:inline-flex', look.wordmark)} />
          </Link>
          <nav aria-label="Điều hướng chính" className="flex items-center gap-3 sm:gap-5">
            {pricingPath && (
              <Link to={pricingPath} className={cn('hidden text-sm transition-colors sm:inline', look.navLink)}>
                Bảng giá
              </Link>
            )}
            {(isIndividual || isLogin) && <ThemeToggle />}
            <Link
              to={onRegister ? LOGIN_PATH : copy.registerPath}
              className={cn(
                'whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors sm:px-4 sm:py-2',
                // Sign-up pages point back to login with an outline pill; the login page asks to sign up in solid gold.
                onRegister ? cn('border', look.outlineCta) : cn('hover:opacity-90', look.cta)
              )}
            >
              {onRegister ? 'Đăng nhập' : 'Đăng ký'}
            </Link>
          </nav>
        </div>
      </header>

      {/* Every tier below is sized so header, card and footer fit one screen; only landscape phones still scroll. */}
      <main
        className={cn(
          'flex flex-1 items-center justify-center px-4 pb-6 sm:px-6 sm:pb-8 short:pb-5 cramped:pb-3',
          // Keeps the header hairline off the card's top edge; shrinks with the height tiers.
          'pt-4 sm:pt-6 short:pt-4 cramped:pt-3 tiny:pt-2'
        )}
      >
        {/* The card is a dark picture in both themes (like the login card), so its content always takes the dark tokens. */}
        <div
          data-individual-theme={isIndividual ? 'dark' : undefined}
          className={cn(
            'relative grid w-full max-w-6xl overflow-hidden rounded-3xl border sm:rounded-[28px] shadow-2xl transition-colors duration-300',
            'lg:min-h-[min(680px,calc(100dvh-168px))] lg:grid-cols-[minmax(0,470px)_minmax(0,1fr)]',
            look.card,
            look.cardGlow
          )}
        >
          {/* Lớp nền ảnh toàn cảnh (Desktop); điện thoại và tablet dùng dải ảnh AuthBanner phía trên form */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
            {/* Ảnh background chiếc TV trên đồi mây vàng, dịch chuyển sang phải một tí */}
            <div className="absolute inset-0 scale-[1.04] translate-x-14 bg-[url('/images/auth-bg.jpg')] bg-cover bg-no-repeat bg-[position:center_46%]" />

            {/* Gradient phủ tối toàn cảnh từ đáy lên để tăng tương phản chữ */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35" />

            {/* Gradient mờ dần trong suốt quang học (smooth progressive fade) từ trái sang phải */}
            <div className={cn('absolute inset-0 transition-colors duration-300', look.fade)} />
          </div>

          <AuthBanner portal={portal} fade={look.bannerFade} />

          {/* Form điền login bên trái: nền kính mờ nhẹ mờ dần (feathered backdrop blur) */}
          <section
            className={cn(
              'relative z-10 mx-auto flex w-full max-w-[460px] flex-col justify-center px-5 pb-8 pt-1 sm:px-6 sm:pb-10',
              'short:pb-6 cramped:pb-5 tiny:pt-5',
              'lg:max-w-none lg:px-11 lg:py-12 lg:short:py-8 lg:cramped:py-6'
            )}
          >
            {/* Lớp kính mờ chuyển tiếp quang học phía sau form */}
            <div
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute inset-0 hidden lg:block',
                'backdrop-blur-[12px] [mask-image:linear-gradient(to_right,black_0%,black_65%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_65%,transparent_100%)]',
                'bg-gradient-to-r to-transparent',
                look.glass
              )}
            />

            <div className="relative z-10">
              {showLogo && (
                <div className="relative mb-6 hidden self-start lg:inline-flex short:mb-4 cramped:hidden!">
                  {/* 1. Floor / surface reflection directly beneath the base of the emblem */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 h-3 w-[88%] rounded-[100%] bg-gradient-to-r from-transparent via-amber-300/45 to-transparent blur-[5px]"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-2.5 left-1/2 -translate-x-1/2 h-7 w-[125%] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.28)_0%,rgba(245,158,11,0.1)_45%,transparent_80%)] blur-md"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 h-10 w-[155%] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.12)_0%,rgba(217,119,6,0.03)_55%,transparent_85%)] blur-xl"
                  />

                  {/* 2. Soft internal doorway & orb illumination */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-4 left-[53%] -translate-x-1/2 h-16 w-14 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.22)_0%,rgba(245,158,11,0.06)_50%,transparent_75%)] blur-md"
                  />

                  {/* 3. The 3D Golden Brand Emblem: a tight teal-black contact shadow plus a faint gold glow.
                      A wide black blur here reads as a dark smudge behind the logo on the teal glass. */}
                  <img
                    src="/logo.png"
                    alt="DigiTalent AI"
                    className="relative h-20 w-auto short:h-14 object-contain [filter:drop-shadow(0_2px_3px_rgba(2,10,14,0.45))_drop-shadow(0_0_14px_rgba(245,190,90,0.18))] transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              {eyebrow && <p className={cn('text-[11px] uppercase tracking-[0.16em]', look.eyebrow)}>{eyebrow}</p>}
              <h1 className={cn('mt-2.5 text-[28px] font-normal sm:text-[34px] cramped:mt-1 cramped:text-[26px] leading-tight tracking-[-0.03em]', look.title)}>{title}</h1>
              {subtitle && <p className={cn('mt-2 text-sm leading-relaxed tiny:hidden', look.subtitle)}>{subtitle}</p>}
              {headerSlot && <div className="mt-6 short:mt-4">{headerSlot}</div>}
              <div className="mt-7 short:mt-5 cramped:mt-4">{children}</div>
              {footerLink && (
                <div className={cn('mt-7 border-t pt-5 short:mt-5 short:pt-4 cramped:mt-4 cramped:pt-3', look.divider)}>{footerLink}</div>
              )}
            </div>
          </section>

          {rightSlot ?? <AuthPicture portal={portal} />}
        </div>
      </main>

      {/* The copyright line is the first thing to go when the screen is too short for it. */}
      <footer className={cn('mx-auto w-full max-w-6xl px-5 pb-6 text-center text-xs sm:text-left md:px-8 short:pb-4 cramped:hidden', look.footer)}>
        © {new Date().getFullYear()} DigiTalent AI · Khung chuẩn năng lực số
      </footer>
    </div>
  );
}

/**
 * Phone and tablet stand-in for the picture: a short strip on top of the card that fades into it, carrying the
 * product's line, so small screens keep the brand mood without pushing the form far down.
 */
function AuthBanner({ portal, fade }: { portal: LoginPortal; fade: string }) {
  const copy = LOGIN_COPY[portal];
  // Height follows the screen (17% of it, 72–224px); short screens keep a thin strip without the line, very short ones drop it.
  return (
    <div aria-hidden="true" className="relative h-[clamp(72px,17dvh,224px)] overflow-hidden cramped:h-16 lg:hidden tiny:hidden">
      <div className="absolute inset-0 bg-[url('/images/auth-bg.jpg')] bg-cover bg-no-repeat bg-[position:center_40%]" />
      <div className={cn('absolute inset-0 bg-gradient-to-t via-black/20 to-black/35', fade)} />
      <div className="absolute inset-x-0 bottom-0 cramped:hidden">
        <p className="mx-auto max-w-[460px] px-5 pb-4 text-balance text-lg font-normal leading-snug min-[400px]:text-xl tracking-[-0.02em] text-cream drop-shadow-lg sm:px-6 sm:pb-6 sm:text-2xl">
          {copy.quoteLead}
          {copy.quoteBreak && <br />}
          <span className="whitespace-nowrap font-landing-serif italic text-cream-soft">{copy.quoteEmphasis}</span>
          {copy.quoteTail}
        </p>
      </div>
    </div>
  );
}

/** Decorative picture with the product's line; desktop only. */
function AuthPicture({ portal }: { portal: LoginPortal }) {
  const copy = LOGIN_COPY[portal];
  return (
    <div aria-hidden="true" className="relative hidden lg:flex flex-col justify-end p-10 z-10">
      <p className="max-w-[36ch] text-balance text-[clamp(26px,2.6vw,36px)] font-normal leading-[1.12] tracking-[-0.025em] text-cream drop-shadow-lg">
        {copy.quoteLead}
        {copy.quoteBreak && <br />}
        <span className="whitespace-nowrap font-landing-serif italic text-cream-soft">{copy.quoteEmphasis}</span>
        {copy.quoteTail}
      </p>
    </div>
  );
}
