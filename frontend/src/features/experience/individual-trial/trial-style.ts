/**
 * Colour roles of the trial flow, shared with the login page: gold for the main action and the step you are on,
 * the personal mint for state (selected, done). Hover only where something can be clicked.
 */

/** Main action button: the gold of the login page. */
export const GOLD_BUTTON =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F5CA65] to-[#D4982F] px-5 py-2.5 text-sm font-semibold text-[#0C0E12] shadow-md shadow-amber-500/20 transition-[filter,box-shadow] hover:brightness-105 hover:shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:hover:brightness-100';

/** Gold text that stays readable in the light theme (darker amber there). */
export const GOLD_TEXT = 'text-[#E5A93C] [[data-theme=light]_&]:text-[#8a5a12]';

/** Kicker above a step title. */
export const GOLD_KICKER = `text-[11px] font-medium uppercase tracking-[0.16em] ${GOLD_TEXT}`;

/** Secondary action with the gold outline: same colour role as the main button, quieter. Hover only because it is clickable. */
export const GOLD_OUTLINE_BUTTON = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#E5A93C]/60 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[#E5A93C]/10 disabled:cursor-not-allowed disabled:opacity-45 ${GOLD_TEXT}`;
