/** Class names shared by the setup wizard steps (Obsidian & Royal Gold theme). */
export const INPUT_CLASS =
  'w-full rounded-xl border border-amber-400/20 bg-ent-card px-3.5 py-2.5 text-sm text-ent-fg placeholder:text-ent-fg-3 focus:outline-none focus:ring-2 focus:ring-[#E5A93C] aria-[invalid=true]:border-red-500 disabled:opacity-50';

export const PRIMARY_BUTTON =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F5CA65] to-[#D4982F] px-5 py-2.5 text-sm font-semibold text-[#0C0E12] transition-all hover:brightness-105 active:scale-[0.98] shadow-md shadow-amber-950/30 disabled:cursor-not-allowed disabled:opacity-50';

export const SECONDARY_BUTTON =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/20 bg-ent-raised px-4 py-2.5 text-sm font-medium text-ent-fg transition-colors hover:bg-amber-400/10 hover:border-amber-400/40 disabled:cursor-not-allowed disabled:opacity-50';

export const LINK_BUTTON = 'text-sm font-medium text-[#F5CA65] underline-offset-4 hover:underline hover:text-[#E5A93C]';

export function errorMessage(error: unknown): string {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message ?? (error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.');
}
