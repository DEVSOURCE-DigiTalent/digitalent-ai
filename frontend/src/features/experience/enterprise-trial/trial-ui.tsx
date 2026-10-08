import type { ReactNode } from 'react';
import type { ApiResponse } from '@/types/api';
import { StatusBadge } from '@/components/shared/StatusBadge';

export async function data<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = (await request).data;
  if (!response.success) throw new Error(response.message || 'Yêu cầu không thành công.');
  return response.data as T;
}
export function message(error: unknown): string {
  const response = (error as { response?: { data?: { message?: string; detail?: string; errors?: { message: string }[] } } })?.response?.data;
  return response?.errors?.map(item => item.message).join(' · ') || response?.message || response?.detail || (error instanceof Error ? error.message : 'Không thể thực hiện. Vui lòng thử lại.');
}
export function ErrorText({ error }: { error: unknown }) { return error ? <p role="alert" className="rounded-lg border border-ent-bad p-3 text-sm text-ent-bad">{message(error)}</p> : null; }
export const inputClass = 'w-full rounded-xl border border-ent-line bg-ent-raised px-3 py-2 text-sm text-ent-fg focus:outline-none focus:ring-2 focus:ring-ent-accent disabled:opacity-50';
export const buttonClass = 'rounded-xl bg-ent-accent px-4 py-2 text-sm font-semibold text-ent-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
export function Panel({ title, children }: { title: string; children: ReactNode }) { return <section className="min-w-0 space-y-4 rounded-2xl border border-ent-line bg-ent-card p-5"><h2 className="text-lg font-semibold text-ent-fg">{title}</h2>{children}</section>; }
const labels: Record<string, string> = { pending: 'Chờ nhận', accepted: 'Đã tham gia', expired: 'Hết hạn', send_failed: 'Gửi lỗi', pending_invitation: 'Chưa kích hoạt lời mời', expired_invitation: 'Lời mời hết hạn', not_started: 'Chưa bắt đầu', in_progress: 'Đang thực hiện', submitted: 'Đã nộp', result_available: 'Đã có kết quả', learning_in_progress: 'Đang học theo lộ trình', completed: 'Hoàn thành', gap: 'Cần bồi dưỡng', met: 'Đã đạt', insufficient_data: 'Chưa đủ dữ liệu', generated: 'Đã tạo lộ trình', no_gaps: 'Chưa phát hiện khoảng thiếu trong phạm vi đánh giá', insufficient_data_only: 'Chưa đủ dữ liệu để tạo lộ trình' };
export function StateBadge({ state }: { state: string }) { return <StatusBadge label={labels[state] ?? state} />; }
export function safeDevelopmentPath(value: string | null | undefined, kind: 'verify' | 'accept'): string | null {
  if (!value) return null;
  try { const url = new URL(value, window.location.origin); if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== `/business/try/${kind}` || !url.searchParams.get('token')) return null; return url.pathname + url.search; } catch { return null; }
}
