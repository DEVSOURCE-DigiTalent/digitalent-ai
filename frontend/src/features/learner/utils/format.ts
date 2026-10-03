/** Formatting helpers of the personal track (Vietnamese). */

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} giờ` : `${hours} giờ ${rest} phút`;
}

export function formatHours(minutes: number): string {
  const hours = minutes / 60;
  return `${hours < 10 ? hours.toFixed(1).replace('.', ',') : Math.round(hours)} giờ`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** "Hôm nay", "Hôm qua", "3 ngày trước", else the date. */
export function formatRelativeDay(iso: string, now = new Date()): string {
  const start = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const days = Math.round((start(now) - start(new Date(iso))) / DAY_MS);
  if (days <= 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  return formatDate(iso);
}

/** Short names of the 6 domains, for charts and tight rows. */
export const DOMAIN_SHORT_NAMES: Record<number, string> = {
  1: 'Dữ liệu',
  2: 'Giao tiếp',
  3: 'Nội dung số',
  4: 'An toàn',
  5: 'Giải quyết vấn đề',
  6: 'Ứng dụng AI',
};
