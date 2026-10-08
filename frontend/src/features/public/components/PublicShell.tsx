import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Wordmark } from '@/components/brand/Wordmark';
import { cn } from '@/lib/utils';
import { usePageBackground } from '../landing/hooks/use-page-background';
import type { PortalChoice } from '../../portal/portal-preference';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLogout } from '@/hooks/use-auth';
import { PERSONAL_PUBLIC_BACKGROUND, usePersonalTheme } from '@/features/learner/theme/use-personal-theme';
import { ThemeToggle } from '@/features/learner/components/ThemeToggle';
import { NEUTRAL_CANVAS, NEUTRAL_ROOT_CLASS } from '../neutral-canvas';
import '@/features/learner/theme/personal-theme.css';

interface PublicShellProps {
  /** Product the visitor is looking at: decides the header links. Omit on neutral pages (selector). */
  portal?: PortalChoice;
  children: ReactNode;
  /** Width of the content column. */
  width?: 'narrow' | 'wide';
  className?: string;
}

const HEADER_LINKS: Record<PortalChoice, { home: string; pricing: string; login: string }> = {
  enterprise: { home: '/business', pricing: '/business/pricing', login: '/login' },
  individual: { home: '/individual', pricing: '/individual/pricing', login: '/login' },
};

/**
 * Frame of the public purchase and sign-up pages:
 * - individual portal: the personal theme (Digital Dawn / Daybreak) with theme toggle, mint accents;
 * - enterprise portal: cinematic cream on ink black, gold accents;
 * - no portal (password and e-mail pages, used by both products): the neutral canvas of the login page, with the
 *   content on a dark card so it reads the same in the light and dark themes.
 */
export function PublicShell({ portal, children, width = 'narrow', className }: PublicShellProps) {
  const isIndividual = portal === 'individual';
  const isNeutral = !portal;
  const theme = usePersonalTheme((s) => s.theme);
  const neutral = NEUTRAL_CANVAS[theme];
  usePageBackground(isIndividual ? PERSONAL_PUBLIC_BACKGROUND[theme] : isNeutral ? neutral.pageBackground : '#0C0E12');
  const location = useLocation();
  const links = portal ? HEADER_LINKS[portal] : undefined;
  const isPricingPage = links ? location.pathname === links.pricing : false;
  const user = useCurrentUser((s) => s.user);
  const logout = useLogout();

  return (
    <div
      lang="vi"
      data-portal={portal}
      data-theme={isIndividual || isNeutral ? theme : undefined}
      data-individual-theme={isIndividual ? theme : undefined}
      className={cn(
        'flex min-h-screen flex-col font-landing antialiased transition-colors duration-300',
        isIndividual ? 'personal-theme pt-soft bg-pt-bg text-pt-fg' : isNeutral ? cn(NEUTRAL_ROOT_CLASS, neutral.page) : 'bg-[#0C0E12] text-cream'
      )}
    >
      {/* Full-width band one step off the page with a neutral hairline, like the portal and login headers. */}
      <header
        className={cn(
          'w-full transition-colors duration-300',
          isIndividual ? 'border-b border-pt-line bg-pt-panel' : isNeutral ? neutral.headerBar : 'border-b border-white/[0.06] bg-[#11151E]'
        )}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 md:px-8">
          <Link to={links?.home ?? '/portal'} aria-label="DigiTalent AI, về trang chủ" className="text-lg">
            <Wordmark markOnly className={cn('min-[420px]:hidden', isIndividual ? '[--wordmark-on:var(--pt-bg)]' : isNeutral ? neutral.wordmark : undefined)} />
            <Wordmark className={cn('hidden min-[420px]:inline-flex', isIndividual ? '[--wordmark-on:var(--pt-bg)]' : isNeutral ? neutral.wordmark : undefined)} />
          </Link>
          <nav aria-label="Điều hướng chính" className="flex items-center gap-3 text-sm sm:gap-5">
            {links && (
              <Link
                to={links.pricing}
                className={cn(
                  'hidden transition-colors sm:inline',
                  isIndividual ? 'text-pt-fg-2 hover:text-pt-fg' : 'text-cream/80 hover:text-cream'
                )}
              >
                Bảng giá
              </Link>
            )}
            {(isIndividual || isNeutral) && <ThemeToggle />}
            {user ? (
              <div className="flex items-center gap-3">
                <span className={cn('text-xs hidden sm:inline', isIndividual ? 'text-pt-fg-3' : 'text-stone-400')}>{user.email}</span>
                <button
                  type="button"
                  onClick={() => logout.mutate()}
                  className={cn('text-xs transition-colors', isIndividual ? 'text-pt-fg-2 hover:text-pt-fg' : 'text-cream/70 hover:text-cream')}
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                {/* Outline pill in the product's colour; the solid gold pill stays for "Bắt đầu". */}
                <Link
                  to={links?.login ?? '/login'}
                  className={cn(
                    'inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 font-medium transition-colors sm:px-4 sm:py-2',
                    isIndividual
                      ? 'border-pt-accent/50 text-pt-accent hover:border-pt-accent hover:bg-pt-accent/10'
                      : isNeutral
                        ? neutral.outlineCta
                        : 'border-amber-300/50 text-[#F5CA65] hover:border-amber-300/80 hover:bg-amber-300/10'
                  )}
                >
                  <LogIn className="hidden size-4 sm:block" aria-hidden="true" />
                  Đăng nhập
                </Link>
                {links && !isPricingPage && (
                  <Link
                    to={links.pricing}
                    className="whitespace-nowrap rounded-full bg-gradient-to-r from-[#F5CA65] to-[#D4982F] px-3.5 py-1.5 font-semibold text-[#0C0E12] shadow-md shadow-amber-500/20 transition-all hover:brightness-105 sm:px-4 sm:py-2"
                  >
                    Bắt đầu
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      <main
        className={cn(
          'mx-auto w-full flex-1 px-5 pb-16 pt-6 md:px-8',
          isNeutral && 'pt-8 sm:pt-12',
          width === 'narrow' ? 'max-w-lg' : 'max-w-6xl',
          className,
        )}
      >
        {isNeutral ? (
          <div className={cn('rounded-3xl border bg-[#07151b] p-6 text-cream sm:p-8', neutral.cardGlow)}>{children}</div>
        ) : (
          children
        )}
      </main>

      <footer
        className={cn(
          'mx-auto w-full max-w-6xl px-5 pb-8 text-xs md:px-8',
          isIndividual
            ? 'border-t border-pt-line pt-6 text-pt-fg-3'
            : isNeutral
              ? cn('pt-2', neutral.footer)
              : 'border-t border-amber-400/10 pt-6 text-stone-400'
        )}
      >
        © {new Date().getFullYear()} DigiTalent AI · Khung chuẩn năng lực số
      </footer>
    </div>
  );
}
