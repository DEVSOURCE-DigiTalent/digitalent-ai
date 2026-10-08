import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Building2, LogIn, UserRound } from 'lucide-react';
import { Wordmark } from '@/components/brand/Wordmark';
import { ThemeToggle } from '@/features/learner/components/ThemeToggle';
import { usePersonalTheme } from '@/features/learner/theme/use-personal-theme';
import { NEUTRAL_CANVAS, NEUTRAL_ROOT_CLASS } from '@/features/public/neutral-canvas';
import { usePageBackground } from '@/features/public/landing/hooks/use-page-background';
import { cn } from '@/lib/utils';
import '@/features/learner/theme/personal-theme.css';
import { PORTAL_HOME, PORTAL_PRICING, getPortalChoice, rememberPortalChoice, type PortalChoice } from './portal-preference';

interface PortalOption {
  choice: PortalChoice;
  icon: typeof Building2;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  cta: string;
}

const OPTIONS: PortalOption[] = [
  {
    choice: 'enterprise',
    icon: Building2,
    eyebrow: 'Dành cho doanh nghiệp',
    title: 'Quản trị năng lực số của cả đội ngũ.',
    body: 'Đặt yêu cầu năng lực cho từng vị trí, thấy khoảng trống kỹ năng, giao khóa học và xác nhận năng lực bằng bằng chứng thực tế.',
    points: ['Mua gói theo quy mô người dùng', 'Mời nhân viên, phân quyền theo vai trò', 'Nhiệm vụ thực hành và đánh giá của quản lý'],
    cta: 'Xem giải pháp doanh nghiệp',
  },
  {
    choice: 'individual',
    icon: UserRound,
    eyebrow: 'Dành cho cá nhân',
    title: 'Phát triển năng lực cho vị trí bạn nhắm tới.',
    body: 'Chọn mục tiêu nghề nghiệp, làm bài đánh giá đầu vào, biết mình còn thiếu gì và học theo lộ trình được dựng riêng cho bạn.',
    points: ['Chọn gói theo mục tiêu của bạn', 'Lộ trình học theo thứ tự tiên quyết', 'Theo dõi tiến bộ qua từng bài đánh giá'],
    cta: 'Xem giải pháp cá nhân',
  },
];

/**
 * Each product keeps its own colour on its card: gold for businesses, the personal mint for individuals.
 * The rim light sits on the left and bottom edges and only brightens slightly on hover.
 */
const CARD_ACCENT: Record<PortalChoice, { text: string; dot: string; tile: string; edge: string; cta: string }> = {
  enterprise: {
    text: 'text-[#F5CA65]',
    dot: 'bg-[#F5CA65]',
    tile: 'text-[#F5CA65] ring-amber-400/25',
    edge:
      'border-l-amber-300/45 border-b-amber-300/45 shadow-[-10px_12px_28px_-16px_rgba(245,202,101,0.3),0_24px_60px_-30px_rgba(0,0,0,0.8)] hover:border-l-amber-300/60 hover:border-b-amber-300/60 hover:shadow-[-10px_12px_32px_-14px_rgba(245,202,101,0.38),0_26px_64px_-30px_rgba(0,0,0,0.85)]',
    cta: 'group-hover:text-[#F5CA65]',
  },
  individual: {
    text: 'text-[#79e0c2]',
    dot: 'bg-[#79e0c2]',
    tile: 'text-[#79e0c2] ring-[#79e0c2]/25',
    edge:
      'border-l-[#79e0c2]/45 border-b-[#79e0c2]/45 shadow-[-10px_12px_28px_-16px_rgba(121,224,194,0.26),0_24px_60px_-30px_rgba(0,0,0,0.8)] hover:border-l-[#79e0c2]/60 hover:border-b-[#79e0c2]/60 hover:shadow-[-10px_12px_32px_-14px_rgba(121,224,194,0.34),0_26px_64px_-30px_rgba(0,0,0,0.85)]',
    cta: 'group-hover:text-[#79e0c2]',
  },
};

/**
 * PUB-01: gateway that positions the product as two experiences on one competency core. Shares the neutral look of
 * the login page and is sized by viewport height (short / cramped / tiny) so both choices fit one laptop screen.
 */
export function PortalSelectorPage() {
  const [searchParams] = useSearchParams();
  const isRegisterIntent = searchParams.get('intent') === 'register';
  const theme = usePersonalTheme((s) => s.theme);
  const canvas = NEUTRAL_CANVAS[theme];
  usePageBackground(canvas.pageBackground);

  return (
    <div
      lang="vi"
      data-theme={theme}
      className={cn('flex min-h-dvh flex-col font-landing antialiased transition-colors duration-300', NEUTRAL_ROOT_CLASS, canvas.page)}
    >
      <header className={cn('w-full transition-colors duration-300', canvas.headerBar)}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 md:px-8 cramped:py-2.5 tiny:py-1.5">
          <Link to="/portal" aria-label="DigiTalent AI, về trang chủ" className="text-lg">
            {/* Narrow phones keep only the emblem so the theme switch and the login button fit on one line. */}
            <Wordmark markOnly className={cn('min-[420px]:hidden', canvas.wordmark)} />
            <Wordmark className={cn('hidden min-[420px]:inline-flex', canvas.wordmark)} />
          </Link>
          <nav aria-label="Điều hướng chính" className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <Link
              to="/login"
              className={cn(
                'inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors sm:px-4 sm:py-2',
                canvas.outlineCta
              )}
            >
              <LogIn className="hidden size-4 sm:block" aria-hidden="true" />
              Đăng nhập
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 short:py-6 cramped:py-4">
        <div className="w-full max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            {isRegisterIntent && (
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-400/10 px-3.5 py-1 text-xs font-medium text-[#F5CA65]">
                Đăng ký tài khoản
              </div>
            )}
            <h1 className="text-balance text-[clamp(28px,3.4vw,42px)] font-normal leading-[1.1] tracking-[-0.03em] cramped:text-[28px]">
              Bạn dùng DigiTalent AI cho <span className="font-landing-serif italic text-cream-soft [[data-theme=light]_&]:text-[#8a5a12]">ai?</span>
            </h1>
            <p className={cn('mx-auto mt-3 max-w-[46ch] text-pretty text-sm leading-relaxed sm:text-base cramped:mt-2 cramped:text-sm', canvas.muted)}>
              {isRegisterIntent
                ? 'Chọn đối tượng để xem bảng giá và bắt đầu đăng ký.'
                : 'Hai trải nghiệm, cùng một chuẩn năng lực số.'}
            </p>
          </div>

          <ul className="mx-auto mt-8 grid max-w-4xl gap-4 sm:gap-5 md:grid-cols-2 short:mt-6 cramped:mt-4 cramped:gap-3 cramped:md:gap-5">
            {OPTIONS.map((option) => (
              <li key={option.choice}>
                <PortalCard option={option} isRegister={isRegisterIntent} />
              </li>
            ))}
          </ul>

          {isRegisterIntent && (
            <p className={cn('mx-auto mt-6 text-center text-xs text-pretty', canvas.muted)}>
              Chỉ muốn tìm hiểu giải pháp trước?{' '}
              <Link to="/business" className="underline underline-offset-4 hover:text-cream">
                Dành cho Doanh nghiệp
              </Link>
              {' · '}
              <Link to="/individual" className="underline underline-offset-4 hover:text-cream">
                Dành cho Cá nhân
              </Link>
            </p>
          )}
        </div>
      </main>

      <footer className={cn('mx-auto w-full max-w-6xl px-5 pb-6 text-center text-xs sm:text-left md:px-8 short:pb-4 cramped:hidden', canvas.footer)}>
        © {new Date().getFullYear()} DigiTalent AI · Khung chuẩn năng lực số
      </footer>
    </div>
  );
}

/**
 * The whole card is the link. The card stays dark in both themes, like the login card. Phones show title, text and
 * link only (the two cards stack); on short screens the spacing
 * tightens and the bullet list folds away so both choices still fit one screen.
 */
function PortalCard({ option, isRegister }: { option: PortalOption; isRegister?: boolean }) {
  const Icon = option.icon;
  const accent = CARD_ACCENT[option.choice];
  const targetPath = isRegister ? PORTAL_PRICING[option.choice] : PORTAL_HOME[option.choice];
  const ctaLabel = isRegister ? 'Xem bảng giá & Đăng ký' : option.cta;

  return (
    <Link
      to={targetPath}
      onClick={() => rememberPortalChoice(option.choice)}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#0b2027] p-6 text-cream transition-all duration-300 motion-safe:hover:-translate-y-1 md:p-8',
        'short:md:p-7 cramped:p-4 cramped:md:p-6',
        accent.edge
      )}
    >
      <span
        className={cn(
          'grid size-12 place-items-center rounded-2xl bg-[#102c34] ring-1 transition-transform duration-300 motion-safe:group-hover:scale-105 cramped:size-10 max-md:hidden',
          accent.tile
        )}
        aria-hidden="true"
      >
        <Icon className="size-5" />
      </span>
      <p className={cn('mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] cramped:mt-3 max-md:mt-0', accent.text)}>{option.eyebrow}</p>
      <h2 className="mt-2.5 text-balance text-2xl font-normal leading-[1.15] tracking-[-0.02em] cramped:mt-2 cramped:text-xl">{option.title}</h2>
      <p className="mt-3 text-sm leading-[1.65] text-[#c2d3d1] cramped:mt-2 max-sm:cramped:line-clamp-2">{option.body}</p>
      <ul className="mt-5 grid gap-2 text-sm text-cream/85 short:mt-4 cramped:hidden max-md:hidden">
        {option.points.map((point) => (
          <li key={point} className="flex items-center gap-2.5">
            <span className={cn('size-1.5 shrink-0 rounded-full', accent.dot)} aria-hidden="true" />
            {point}
          </li>
        ))}
      </ul>
      <span
        className={cn('mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium text-cream transition-colors short:pt-5 cramped:pt-3', accent.cta)}
      >
        {ctaLabel}
        <ArrowRight className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1.5" aria-hidden="true" />
      </span>
    </Link>
  );
}

/**
 * "/": asks once. A returning visitor goes straight to the product they chose before;
 * /portal always shows the selector, for changing direction.
 */
export function RootRoute() {
  const choice = getPortalChoice();
  return choice ? <Navigate to={PORTAL_HOME[choice]} replace /> : <PortalSelectorPage />;
}
