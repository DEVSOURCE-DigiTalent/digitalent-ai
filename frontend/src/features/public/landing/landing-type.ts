/**
 * One type scale for every landing section, on both product pages, so the sections read as one page:
 * a label chip, a title, a lead; small uppercase kickers inside cards. Colours come from landing.css per variant
 * (gold on the business page, mint and gold on the individual one).
 */

/** Section label: a chip above the title. */
export const LP_LABEL = 'lp-label';

/** Section title (h2). Emphasised words use SERIF_ITALIC, which carries the lp-em gradient. */
export const LP_TITLE = 'text-balance text-[clamp(30px,3.8vw,52px)] font-normal leading-[1.08] tracking-[-0.03em] text-cream';

/** Lead paragraph under a section title. */
export const LP_LEAD = 'max-w-[44rem] text-pretty text-base leading-[1.7] text-stone-400 sm:text-lg';

/** Small uppercase heading inside a card or preview ("Lộ trình đề xuất", "Phản hồi"…). */
export const LP_KICKER = 'lp-kicker text-[11px] font-medium uppercase tracking-[0.14em]';
