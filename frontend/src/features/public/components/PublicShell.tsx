import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wordmark } from '@/components/brand/Wordmark';
import { cn } from '@/lib/utils';
import { usePageBackground } from '../landing/hooks/use-page-background';
import type { PortalChoice } from '../../portal/portal-preference';

interface PublicShellProps {
  /** Product the visitor is looking at: decides the header links. Omit on neutral pages (selector). */
  portal?: PortalChoice;
  children: ReactNode;
  /** Width of the content column. */
  width?: 'narrow' | 'wide';
  className?: string;
}

const HEADER_LINKS: Record<PortalChoice, { home: string; pricing: string; login: string }> = {
  enterprise: { home: '/business', pricing: '/business/pricing', login: '/business/login' },
  individual: { home: '/individual', pricing: '/individual/pricing', login: '/individual/login' },
};

/**
 * Frame of the public purchase and sign-up pages: cream on black like the landing pages,
 * with a plain header (no hero) and a one-line footer.
 */
export function PublicShell({ portal, children, width = 'narrow', className }: PublicShellProps) {
  usePageBackground('#000');
  const location = useLocation();
  const links = portal ? HEADER_LINKS[portal] : undefined;
  const isPricingPage = links ? location.pathname === links.pricing : false;

  return (
    <div lang="vi" className="flex min-h-screen flex-col bg-black font-landing text-cream antialiased">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 md:px-8">
        <Link to={links?.home ?? '/portal'} aria-label="DigiTalent AI, về trang chủ" className="text-lg">
          <Wordmark />
        </Link>
        <nav aria-label="Điều hướng chính" className="flex items-center gap-5 text-sm text-cream/80">
          {links && (
            <Link to={links.pricing} className="hidden transition-colors hover:text-cream sm:inline">
              Bảng giá
            </Link>
          )}
          <Link to={links?.login ?? '/login'} className="transition-colors hover:text-cream">
            Đăng nhập
          </Link>
          {links && !isPricingPage && (
            <Link to={links.pricing} className="rounded-full bg-cream-soft px-4 py-2 font-medium text-black">
              Bắt đầu
            </Link>
          )}
        </nav>
      </header>

      <main
        className={cn(
          'mx-auto w-full flex-1 px-5 pb-16 pt-6 md:px-8',
          width === 'narrow' ? 'max-w-lg' : 'max-w-6xl',
          className,
        )}
      >
        {children}
      </main>

      <footer className="mx-auto w-full max-w-6xl px-5 pb-8 text-xs text-stone-500 md:px-8">
        © {new Date().getFullYear()} DigiTalent AI · Khung năng lực số theo Thông tư 02/2025/TT-BGDĐT
      </footer>
    </div>
  );
}
