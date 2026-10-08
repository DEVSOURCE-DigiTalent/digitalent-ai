import { PERSONAL_THEME_BACKGROUND, type PersonalTheme } from '@/features/learner/theme/use-personal-theme';

/**
 * Look of the pages that serve both products (portal selector, login): deep teal in dark, misty grey-teal in light,
 * gold for frames and calls to action. They follow the light/dark choice shared with the personal workspace.
 */
export interface NeutralCanvas {
  /** Colour behind the page on overscroll. */
  pageBackground: string;
  page: string;
  wordmark: string;
  navLink: string;
  /** Supporting text on the page canvas (not inside the dark cards). */
  muted: string;
  footer: string;
  /** Full-width header band: one step darker than the page with a neutral hairline (gold stays for the cards). */
  headerBar: string;
  /** Gold rim light on the left and bottom edges only, as if lit from the lower left, so a dark card seems raised. */
  cardGlow: string;
  /** Secondary call to action on the canvas (gold outline), e.g. "Đăng nhập" in the header. */
  outlineCta: string;
}

/** Root classes: borrows the personal tokens for the theme switch, tinted gold like the buttons. */
export const NEUTRAL_ROOT_CLASS = 'personal-theme [--ind-accent:#E5A93C] [--ind-on-accent:#0C0E12]';

export const NEUTRAL_CANVAS: Record<PersonalTheme, NeutralCanvas> = {
  dark: {
    pageBackground: PERSONAL_THEME_BACKGROUND.dark,
    page: 'bg-[#07151b] text-cream',
    wordmark: 'text-cream',
    navLink: 'text-cream/75 hover:text-cream',
    muted: 'text-[#a9bfbd]',
    footer: 'text-[#93aaa8]',
    headerBar: 'bg-[#0b1d24] border-b border-white/[0.06]',
    cardGlow:
      'border-white/5 border-l-amber-300/45 border-b-amber-300/45 shadow-[-14px_16px_44px_-14px_rgba(245,202,101,0.45),-2px_2px_0_0_rgba(245,202,101,0.12),0_30px_80px_-30px_rgba(0,0,0,0.85)]',
    outlineCta: 'border-amber-300/50 text-[#F5CA65] hover:border-amber-300/80 hover:bg-amber-300/10',
  },
  // Light is a misty grey-teal, not white: it stays in the teal family of the cards, softens the contrast so a dark
  // card does not read as a hole, and leaves the gold rim visible. The theme switch tokens are re-tinted to match.
  light: {
    pageBackground: '#D9E3E0',
    page:
      'bg-[#D9E3E0] text-[#102a2e] [--ind-fg:#102a2e] [--ind-fg-subtle:#526a68] [--ind-raised:#C6D3CF] [--ind-line-subtle:#A9BBB6]',
    wordmark: 'text-[#102a2e]',
    navLink: 'text-[#3e5b5b] hover:text-[#102a2e]',
    muted: 'text-[#3e5b5b]',
    footer: 'text-[#526a68]',
    headerBar: 'bg-[#CFDBD7] border-b border-[#102a2e]/10',
    cardGlow:
      'border-[#102a2e]/10 border-l-amber-600/55 border-b-amber-600/55 shadow-[-14px_16px_40px_-12px_rgba(212,152,47,0.5),-2px_2px_0_0_rgba(180,120,30,0.2),0_28px_70px_-28px_rgba(16,42,46,0.5)]',
    outlineCta: 'border-amber-700/50 text-[#8a5a12] hover:border-amber-700/80 hover:bg-amber-600/10',
  },
};
