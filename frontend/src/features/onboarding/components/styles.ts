/** Class names shared by modal and form controls (Modern Pulse Theme). */
export const INPUT_CLASS =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#304bdf] focus:ring-2 focus:ring-[#304bdf]/20 aria-[invalid=true]:border-red-500 disabled:opacity-50 transition-all';

export const PRIMARY_BUTTON =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#304bdf] hover:bg-[#203bbf] px-5 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] shadow-sm shadow-[#304bdf]/20 disabled:cursor-not-allowed disabled:opacity-50';

export const SECONDARY_BUTTON =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50';

export const LINK_BUTTON = 'text-sm font-medium text-[#304bdf] underline-offset-4 hover:underline hover:text-[#203bbf]';

export function errorMessage(error: unknown): string {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message ?? (error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.');
}
