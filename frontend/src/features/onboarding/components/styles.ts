/** Class names shared by the setup wizard steps (light application theme). */
export const INPUT_CLASS =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 aria-[invalid=true]:border-red-500 disabled:bg-slate-50';

export const PRIMARY_BUTTON =
  'inline-flex items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50';

export const SECONDARY_BUTTON =
  'inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50';

export const LINK_BUTTON = 'text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline';

export function errorMessage(error: unknown): string {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message ?? (error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.');
}
