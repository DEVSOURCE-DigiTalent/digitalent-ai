import type { TrialStage } from '@/services/trial-program.service';

export const LEVEL_LABELS = ['Chưa đạt', 'Cơ bản', 'Trung cấp', 'Nâng cao'] as const;
export const LEVEL_SHORT = ['0', 'CB', 'TC', 'NC'] as const;
export const TIER_LABELS = ['', 'Cơ bản', 'Trung cấp', 'Nâng cao'] as const;

export const STAGE: Record<TrialStage, { label: string; tone: string }> = {
  SETUP: { label: 'Chưa đặt hạn', tone: '' },
  OPEN: { label: 'Đang làm bài', tone: 'info' },
  REPORTED: { label: 'Đã có kết quả', tone: 'ok' },
};

export function formatWhen(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

/** Giá trị cho <input type="datetime-local"> theo giờ máy. */
export function toLocalInput(value?: string | Date | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Mức trung bình một chữ số thập phân, dấu phẩy: 1,2. */
export function formatAverage(value: number) {
  return value.toFixed(1).replace('.', ',');
}

/** Tiền gọn cho biểu đồ: 0đ · 399k · 17,7tr. */
export function formatMoneyShort(value: number) {
  if (value === 0) return '0đ';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')}tr`;
  return `${Math.round(value / 1000)}k`;
}

export function percentOf(part: number, total: number) {
  return total ? Math.round((part / total) * 100) : 0;
}
