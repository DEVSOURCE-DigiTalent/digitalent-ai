import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wordmark } from '@/components/brand/Wordmark';
import { usePageBackground } from '../../public/landing/hooks/use-page-background';
import { LOGIN_COPY, type LoginPortal } from '../login-copy';

export interface AuthShellProps {
  portal?: LoginPortal;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Small label above the title (product the visitor is signing in to). */
  eyebrow?: ReactNode;
  footerLink?: ReactNode;
  /** Rendered between the subtitle and the form (audience switch on the sign-up page). */
  headerSlot?: ReactNode;
  showLogo?: boolean;
  children: ReactNode;
}

const NAV_LINK = 'text-sm text-cream/75 transition-colors hover:text-cream';
const NAV_CTA = 'rounded-full bg-cream-soft px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90';

/**
 * Frame of the sign-in and sign-up pages: the public header (wordmark, pricing, one call to action), the form on the
 * left and the picture with the product's line on the right. Below lg the picture is dropped and the form stands
 * alone, so nothing is hidden behind a frame on a phone.
 */
export function AuthShell({ portal = 'default', title, subtitle, eyebrow, footerLink, headerSlot, showLogo = true, children }: AuthShellProps) {
  usePageBackground('#000');
  const copy = LOGIN_COPY[portal];
  const { pathname } = useLocation();
  const onRegister = pathname.endsWith('/register');

  return (
    <div lang="vi" className="flex min-h-dvh flex-col bg-black font-landing text-cream antialiased selection:bg-cream/25">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 md:px-8">
        <Link to={copy.homePath} aria-label="DigiTalent AI, về trang chủ" className="text-lg text-cream">
          <Wordmark />
        </Link>
        <nav aria-label="Điều hướng chính" className="flex items-center gap-5">
          {copy.pricingPath && (
            <Link to={copy.pricingPath} className={`${NAV_LINK} hidden sm:inline`}>
              Bảng giá
            </Link>
          )}
          {onRegister ? (
            <Link to={copy.loginPath} className={NAV_CTA}>Đăng nhập</Link>
          ) : (
            <Link to={copy.registerPath} className={NAV_CTA}>Đăng ký</Link>
          )}
        </nav>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 pb-8 sm:px-6 lg:items-center">
        <div className="grid w-full max-w-6xl lg:min-h-[min(680px,calc(100dvh-168px))] lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:overflow-hidden lg:rounded-[28px] lg:border lg:border-cream/10 lg:bg-[#0c0c0b]">
          <section className="mx-auto flex w-full max-w-[420px] flex-col justify-center py-6 lg:max-w-none lg:px-11 lg:py-12">
            {showLogo && (
              <div className="relative mb-6 inline-flex self-start">
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

                {/* 3. The 3D Golden Brand Emblem */}
                <img
                  src="/logo.png"
                  alt="DigiTalent AI"
                  className="relative h-20 w-auto object-contain drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)] transition-transform duration-300 hover:scale-105"
                />
              </div>
            )}
            {eyebrow && <p className="text-[11px] uppercase tracking-[0.16em] text-cream-soft/70">{eyebrow}</p>}
            <h1 className="mt-2.5 text-[34px] font-normal leading-tight tracking-[-0.03em] text-cream">{title}</h1>
            {subtitle && <p className="mt-2 text-sm leading-relaxed text-stone-400">{subtitle}</p>}
            {headerSlot && <div className="mt-6">{headerSlot}</div>}
            <div className="mt-7">{children}</div>
            {footerLink && <div className="mt-7 border-t border-cream/10 pt-5">{footerLink}</div>}
          </section>

          <AuthPicture portal={portal} />
        </div>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-5 pb-6 text-xs text-stone-500 md:px-8">
        © {new Date().getFullYear()} DigiTalent AI · Khung năng lực số theo Thông tư 02/2025/TT-BGDĐT
      </footer>
    </div>
  );
}

/** Decorative picture with the product's line; desktop only. */
function AuthPicture({ portal }: { portal: LoginPortal }) {
  const copy = LOGIN_COPY[portal];
  return (
    <div aria-hidden="true" className="relative hidden lg:block">
      <div className="absolute inset-0 bg-[url('/images/auth-bg.jpg')] bg-cover bg-[position:center_46%]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/30" />
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0c0c0b] to-transparent" />
      <p className="absolute inset-x-10 bottom-10 max-w-[30ch] text-balance text-[clamp(26px,2.6vw,36px)] font-normal leading-[1.12] tracking-[-0.025em] text-cream">
        {copy.quoteLead}
        <span className="font-landing-serif italic text-cream-soft">{copy.quoteEmphasis}</span>
        {copy.quoteTail}
      </p>
    </div>
  );
}
